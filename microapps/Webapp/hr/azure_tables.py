"""
Reads the 5 HR compliance source reports from Azure Table Storage (they used
to be Excel files dropped on disk by an external job — see git history of
compliance.py/config.py for the old file-based loader).

Each read_* function returns a pandas DataFrame with column headers matching
the exact header strings the old Excel loader used to produce (see the
rename maps below and config.COLUMN_OVERRIDES) — so compliance.py's column
resolution / parsing logic downstream never had to change.
"""
import pandas as pd
from azure.data.tables import TableServiceClient

import config

_service_client = None
_table_clients = {}


def _get_table_client(table_name):
    global _service_client
    if _service_client is None:
        _service_client = TableServiceClient.from_connection_string(
            config.AZURE_STORAGE_CONNECTION_STRING
        )
    if table_name not in _table_clients:
        _table_clients[table_name] = _service_client.get_table_client(table_name)
    return _table_clients[table_name]


def _fetch_entities(table_name, select=None, filter=None):
    client = _get_table_client(table_name)
    if filter:
        return list(client.query_entities(query_filter=filter, select=select))
    return list(client.list_entities(select=select))


def _entities_to_df(entities, rename_map):
    rows = []
    for entity in entities:
        row = {}
        for source_field, header in rename_map.items():
            value = entity.get(source_field)
            row[header] = "" if value is None else str(value)
        rows.append(row)
    return pd.DataFrame(rows, columns=list(rename_map.values())).fillna("")


def table_watermark(table_name, filter=None):
    """A cheap "has this table changed" signal — (row_count, max_timestamp
    as an ISO string) — used in place of a file's mtime (Azure Tables have no
    filesystem mtime to poll). Only pulls the system Timestamp property, not
    the full row. This value gets embedded in the dashboard dict that
    history.py JSON-dumps to disk, so it must stay JSON-safe — the raw
    TablesEntityDatetime the SDK returns is not, hence the .isoformat()."""
    # Azure only populates entity.metadata["timestamp"] when "Timestamp" is
    # explicitly named in select — omitting it (or selecting only
    # PartitionKey/RowKey) silently comes back as None instead.
    entities = _fetch_entities(table_name, select=["PartitionKey", "RowKey", "Timestamp"], filter=filter)
    if not entities:
        return (0, None)
    max_ts = max(e.metadata.get("timestamp") for e in entities)
    return (len(entities), max_ts.isoformat() if max_ts is not None else None)


# ---------------------------------------------------------------------------
# Per-table rename maps: Azure entity property -> the header string
# compliance.py / config.COLUMN_OVERRIDES expects. Keep these mirrored with
# config.COLUMN_OVERRIDES if either side changes.
# ---------------------------------------------------------------------------
ROSTER_RENAME = {
    "Employee_Id": "Employee Id",
    "Full_Name": "Name",
    "Org_Unit": "Organizational Unit",
    "Employment_Status": "Resource Status",
    "Practice": "DarwinBox Practice",
    "Sub_Practice": "DarwinBox Sub Practice",
    "Designation": "Designation",
    "Grade": "Level",
    "Client_Location": "Client Location",
    "Client_Location_State": "Client Location (State)",
    "Client_Location_City": "Client Location (City)",
    "Location": "Location",
    "Direct_Manager_Name": "Reporting Manager",
    "Hrbp_Name": "Hrbp Name",
    "Date_Of_Joining": "Date Of Joining",
}

BIOMETRIC_RENAME = {
    "Employee_Id": "Employee Id",
    "Attendance_Date": "Date",
    "FirstIn_Timestamp": "First In",
    "LastOut_Timestamp": "Last Out",
    "Duration_Hours": "Duration Hours",
}

LEAVE_RENAME = {
    "Employee_Id": "Employee Id",
    "Leave_From_Date": "From Date",
    "Leave_To_Date": "To Date",
    "Status": "Status",
}

RESOURCE_ASSIGNMENTS_RENAME = {
    "Employee_ID": "Employee ID",
    "Project": "Project",
    "Business_Unit__Project___Project": "Business Unit (Project) (Project)",
    "Month": "Month",
    "Year": "Year",
    "Status": "Status",
}

EXCEPTION_EMPLOYEES_RENAME = {
    "Employee_Id": "Employee Id",
    "Event_Type": "Event Type",
    "Wfh_Start_Date": "Wfh Start Date",
    "Wfh_End_Date": "Wfh End Date",
    "Employee_Reason_For_Wfh": "Employee Reason For Wfh",
    "Employee_Detailed_Reason": "Employee Detailed Reason",
}

def read_roster():
    entities = _fetch_entities(config.ROSTER_TABLE)
    return _entities_to_df(entities, ROSTER_RENAME)


def read_biometric(from_date=None, to_date=None):
    """Read attendance records from AttendanceLogs.
    Pass from_date and/or to_date (YYYY-MM-DD strings) to scope the query to a
    date range using the PartitionKey. Omit both to fetch the full table."""
    if from_date and to_date:
        filter_str = f"PartitionKey ge '{from_date}' and PartitionKey le '{to_date}'"
    elif from_date:
        filter_str = f"PartitionKey ge '{from_date}'"
    elif to_date:
        filter_str = f"PartitionKey le '{to_date}'"
    else:
        filter_str = None
    entities = _fetch_entities(config.BIOMETRIC_TABLE, filter=filter_str)
    return _entities_to_df(entities, BIOMETRIC_RENAME)


def read_leave():
    entities = _fetch_entities(config.LEAVE_TABLE)
    return _entities_to_df(entities, LEAVE_RENAME)


def read_resource_assignments():
    entities = _fetch_entities(config.RESOURCE_ASSIGNMENTS_TABLE)
    return _entities_to_df(entities, RESOURCE_ASSIGNMENTS_RENAME)


def read_exception_employees():
    entities = _fetch_entities(config.EXCEPTION_EMPLOYEES_TABLE)
    return _entities_to_df(entities, EXCEPTION_EMPLOYEES_RENAME)


def watermarks():
    """Mirrors the old compliance.source_mtimes() shape/keys, but backed by
    Azure Table watermarks instead of file mtimes. If any watermark check
    itself fails (e.g. a transient network error), that table's watermark
    comes back as None, which never equals a previously cached value — so a
    failed check safely forces a recompute rather than silently freezing on
    stale cached data."""
    checks = {
        "roster": lambda: table_watermark(config.ROSTER_TABLE),
        "biometric": lambda: table_watermark(config.BIOMETRIC_TABLE),
        "leave": lambda: table_watermark(config.LEAVE_TABLE),
        "resourceAssignments": lambda: table_watermark(config.RESOURCE_ASSIGNMENTS_TABLE),
    }
    result = {}
    for key, check in checks.items():
        try:
            result[key] = check()
        except Exception as exc:
            print(f"[azure_tables] WARNING: watermark check failed for '{key}': {exc}", flush=True)
            result[key] = None
    return result
