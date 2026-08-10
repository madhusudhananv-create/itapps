import os
import secrets
from dotenv import load_dotenv

# Load variables from a .env file sitting next to this file (SSO credentials,
# allow-list, etc). Without this call, values in .env are just text on disk —
# os.environ wouldn't see them at all.
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# ---------------------------------------------------------------------------
# All 5 reports now live in Azure Table Storage (previously read from Excel
# files dropped on disk by an external job). AZURE_STORAGE_CONNECTION_STRING
# and the table names below are override-able via environment variables the
# same way the old file paths were.
# ---------------------------------------------------------------------------
REPORTS_DIR = os.environ.get(
    "REPORTS_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
)

AZURE_STORAGE_CONNECTION_STRING = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")

ROSTER_TABLE = os.environ.get("ROSTER_TABLE", "DarwinboxMasterBookableResource")
BIOMETRIC_TABLE = os.environ.get("BIOMETRIC_TABLE", "AttendanceHistory")
LEAVE_TABLE = os.environ.get("LEAVE_TABLE", "LeaveReport")
RESOURCE_ASSIGNMENTS_TABLE = os.environ.get("RESOURCE_ASSIGNMENTS_TABLE", "ResourceAllocation")
EXCEPTION_EMPLOYEES_TABLE = os.environ.get("EXCEPTION_EMPLOYEES_TABLE", "ExceptionEmployeesWFH")

# ---------------------------------------------------------------------------
# Column overrides. Leave a value as None to let the app auto-detect the
# column by keyword matching on the header row. azure_tables.py renames each
# table's raw entity properties (e.g. "Employee_Id") to these same header
# strings before handing the data to compliance.py, so these overrides stay
# in sync with azure_tables.py's per-table rename maps — if you change a
# mapping in one place, mirror it in the other.
# ---------------------------------------------------------------------------
COLUMN_OVERRIDES = {
    "roster": {
        "empId": "Employee Id",
        "name": "Name",
        "org": "Organizational Unit",
        "status": "Resource Status",
        "practice": "DarwinBox Practice",
        "subPractice": "DarwinBox Sub Practice",
        "designation": "Designation",
        "level": "Level",
        "clientLocation": "Client Location",
        "clientLocationState": "Client Location (State)",
        "clientLocationCity": "Client Location (City)",
        "location": "Location",
        "reportingManager": "Reporting Manager",
    },
    "biometric": {
        "empId": "Employee Id",
        "date": "Date",
        "status": None,
    },
    "leave": {
        "empId": "Employee Id",
        "fromDate": "From Date",
        "toDate": "To Date",
        "status": "Status",
    },
    "resourceAssignments": {
        "empId": "Employee ID",
        "project": "Project",
        "businessUnit": "Business Unit (Project) (Project)",
        "month": "Month",
        "year": "Year",
        "status": "Status",
    },
    "exceptionEmployees": {
        "empId": "Employee Id",
        "eventType": "Event Type",
        "wfhStart": "Wfh Start Date",
        "wfhEnd": "Wfh End Date",
        "reason": "Employee Reason For Wfh",
        "detailedReason": "Employee Detailed Reason",
    },
}

# Levels that are exempt from biometric-based tracking entirely — they're
# automatically counted as present every weekday (Mon-Fri) in the window,
# regardless of what the biometric table shows. Compared case-insensitively,
# with whitespace trimmed.
#
# "level" is now sourced from DarwinboxMasterBookableResource's Grade field
# (the table has no separate Level column) — confirm these values actually
# match whatever Grade contains for CXO/senior staff (e.g. it may need to be
# a set of Grade codes instead of "9.1"/"9.2"/"cxo"), otherwise nobody will
# match and this exemption silently never fires.
EXEMPT_LEVELS = {"9.1", "9.2", "cxo"}

# How often the browser automatically checks the backend for fresh data
# (milliseconds) — this is ONLY the passive background auto-check. Clicking
# "Refresh now" always fetches immediately regardless of this value (it
# forces an instant recompute via /api/refresh), and a browser hard-refresh
# always re-runs the page's initial load too — neither of those wait for
# this interval. 24 hours here just means the page won't silently re-check
# on its own more often than once a day.
POLL_INTERVAL_MS = int(os.environ.get("POLL_INTERVAL_MS", 1 * 60 * 60 * 1000))

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 5000))
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

# Every successful recompute is saved as a small JSON snapshot in this
# folder, keyed by the window's end date. This is what powers "Last week" /
# "2 weeks ago" / etc — the app can only look back as far as it has actually
# saved snapshots; it can't reconstruct history from before that, or from
# before this feature existed.
HISTORY_DIR = os.environ.get("HISTORY_DIR", os.path.join(REPORTS_DIR, "history"))

# Signs the Flask session cookie (kept in case anything ever needs it — not
# currently used, since login is handled by the IT Apps Portal, not this app).
FLASK_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY") or secrets.token_hex(32)

# Not enforced yet — reserved for when a per-person restriction is added
# later (comma-separated emails in .env, compared case-insensitively).
ACCEPTING_MAIL_IDS = {
    e.strip().lower()
    for e in os.environ.get("ACCEPTING_MAIL_IDS", "").split(",")
    if e.strip()
}