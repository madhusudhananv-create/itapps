"""
Reads the 5 reports from Azure Table Storage (via azure_tables.py) and
computes office-attendance compliance per bookable resource.

Rule: every employee is expected in the office 3 days out of the tracked
window. If they fall short, the shortfall is "fine" as long as it's covered
by approved leave (office days + leave days >= 3); otherwise it's flagged
as an unexplained gap.
"""
import re
import time
import pandas as pd

import azure_tables
import config

# A single leave row should never legitimately span more than this many days
# in a "last 7 days" report. If a From/To pair is mis-parsed or swapped, this
# stops it from silently expanding into a years-long range and hanging the
# request — the row is skipped instead, with a warning printed to the console.
MAX_LEAVE_SPAN_DAYS = 31


# ---------------------------------------------------------------------------
# Column auto-detection (mirrors the browser-side heuristic from the
# prototype, used only where config.COLUMN_OVERRIDES leaves a field as None)
# ---------------------------------------------------------------------------
PATTERNS = {
    "roster": {
        "empId": ["employee id", "emp id", "employeeid", "empid", "employee code"],
        "name": ["name"],
        "org": ["organizational unit", "org unit", "organization"],
        "status": ["resource status", "status"],
        "practice": ["darwinbox practice", "practice"],
        "subPractice": ["darwinbox sub practice", "sub practice"],
        "designation": ["designation"],
        "level": ["level"],
        "clientLocation": ["client location"],
        "clientLocationState": ["client location (state)", "client location state"],
        "clientLocationCity": ["client location (city)", "client location city"],
        "location": ["location"],
        "reportingManager": ["reporting manager"],
        "hrbp": ["hrbp name", "hrbp"],
        "dateOfJoining": ["date of joining", "doj", "joining date"],
    },
    "biometric": {
        "empId": ["employee id", "emp id", "employeeid", "empid", "employee code", "emp code"],
        "date": ["date", "punch date", "attendance date", "in date"],
        "status": ["status", "attendance status", "present"],
        "firstIn": ["first in", "firstin", "first_in"],
        "lastOut": ["last out", "lastout", "last_out"],
        "durationHours": ["duration hours", "duration_hours", "duration"],
    },
    "leave": {
        "empId": ["employee id", "emp id", "employeeid", "empid", "employee code", "emp code"],
        "fromDate": ["from date", "leave date", "start date", "date"],
        "toDate": ["to date", "end date"],
        "status": ["leave status", "approval status", "status"],
    },
    "resourceAssignments": {
        "empId": ["employee id", "emp id", "employeeid", "empid", "employee code"],
        "project": ["project"],
        "businessUnit": ["business unit"],
        "month": ["month"],
        "year": ["year"],
        "status": ["status"],
    },
    "exceptionEmployees": {
        "empId": ["employee id", "emp id", "employeeid", "empid"],
        "eventType": ["event type"],
        "wfhStart": ["wfh start date", "start date"],
        "wfhEnd": ["wfh end date", "end date"],
        "reason": ["employee reason for wfh", "reason for wfh", "reason"],
        "detailedReason": ["employee detailed reason", "detailed reason", "employee detailed reason for wfh"],
    },
}

# Fields where auto-detection must not match a header that also matches a
# more specific field's pattern — e.g. "location" is a substring of
# "Client Location", so without this, generic location-detection would
# wrongly grab the client-location column instead of the plain Location one.
EXCLUDE_SUBSTRINGS = {
    "location": ["client"],
}


def _detect_column(headers, patterns, exclude=None):
    exclude = exclude or []
    lowered = {h: str(h).lower() for h in headers}
    for pattern in patterns:
        for h, l in lowered.items():
            if pattern in l and not any(x in l for x in exclude):
                return h
    return None


def resolve_columns(file_key, headers):
    """Combine explicit overrides from config.py with auto-detection."""
    overrides = config.COLUMN_OVERRIDES.get(file_key, {})
    resolved = {}
    for field, patterns in PATTERNS[file_key].items():
        override = overrides.get(field)
        if override and override in headers:
            resolved[field] = override
        else:
            resolved[field] = _detect_column(headers, patterns, EXCLUDE_SUBSTRINGS.get(field))
    return resolved


# ---------------------------------------------------------------------------
# Normalization helpers
# ---------------------------------------------------------------------------
def _parse_doj(value):
    """Parse a date string (DD-MM-YYYY or YYYY-MM-DD) to YYYY-MM-DD ISO string.
    Returns None if the value is missing or unparseable."""
    if not value or str(value).strip() in ("", "None", "nan"):
        return None
    try:
        d = pd.to_datetime(str(value).strip(), dayfirst=True, errors="coerce")
        return d.strftime("%Y-%m-%d") if pd.notna(d) else None
    except Exception:
        return None


def norm_id(value) -> str:
    if value is None:
        return ""
    s = str(value).strip().upper()
    if s == "" or s.lower() == "nan":
        return ""
    # Excel numeric ID columns sometimes round-trip through pandas/openpyxl
    # as floats, so "1000082" can arrive here as the string "1000082.0". Strip
    # that artifact before anything else, or it corrupts the ID (the dot gets
    # deleted but the trailing 0 stays, turning 1000082 into 10000820).
    float_artifact = re.fullmatch(r"(\d+)\.0+", s)
    if float_artifact:
        s = float_artifact.group(1)
    if s.isdigit():
        s = s.lstrip("0") or "0"
    else:
        s = re.sub(r"[^A-Z0-9]", "", s)
    return s


def norm_id_series(series: pd.Series) -> pd.Series:
    """Vectorized version of norm_id for a whole column at once — much
    faster than calling norm_id() once per row via iterrows()."""
    return series.map(norm_id)


def to_iso_date(value):
    if value is None or value == "":
        return None
    try:
        # dayfirst=True because the Darwinbox exports use dd-mm-yyyy.
        ts = pd.to_datetime(value, errors="coerce", dayfirst=True)
    except Exception:
        return None
    if pd.isna(ts):
        return None
    return ts.strftime("%Y-%m-%d")


def date_range(from_iso, to_iso=None):
    to_iso = to_iso or from_iso
    start = pd.to_datetime(from_iso)
    end = pd.to_datetime(to_iso)
    if end < start:
        start, end = end, start
    return [d.strftime("%Y-%m-%d") for d in pd.date_range(start, end, freq="D")]


# ---------------------------------------------------------------------------
# File loading
# ---------------------------------------------------------------------------
def week_bounds(anchor_iso: str):
    """Given any date, returns (monday, sunday) ISO strings for the
    Monday-Sunday calendar week that contains it."""
    anchor = pd.Timestamp(anchor_iso)
    # weekday(): Monday=0 .. Sunday=6 — so this is already "days since Monday".
    days_since_monday = anchor.weekday()
    monday = anchor - pd.Timedelta(days=days_since_monday)
    sunday = monday + pd.Timedelta(days=6)
    return monday.strftime("%Y-%m-%d"), sunday.strftime("%Y-%m-%d")


def source_mtimes():
    """Named for the era when this compared Excel file mtimes — now backed by
    Azure Table watermarks (see azure_tables.watermarks()), but kept under
    this name since app.py's cache-invalidation check just needs an opaque
    value it can compare for equality across refresh cycles."""
    return azure_tables.watermarks()


_MONTH_NUMBERS = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7,
    "aug": 8, "august": 8, "sep": 9, "sept": 9, "september": 9, "oct": 10,
    "october": 10, "nov": 11, "november": 11, "dec": 12, "december": 12,
}


def _month_to_number(value) -> int:
    s = str(value).strip().lower()
    if s in _MONTH_NUMBERS:
        return _MONTH_NUMBERS[s]
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return 0


def load_resource_assignments(valid_emp_ids: set) -> dict:
    """Loads Resource_Assignments_Report.xlsx and returns {emp_id: {"project":
    ..., "businessUnit": ...}} using each employee's most recent (Year, Month)
    row. Only rows whose Employee ID matches an ID already in the Bookable
    Resource roster are kept — this file may include people from other
    companies/entities, and we only want Neurealm Private Limited employees,
    which is exactly the set already on the roster (the roster has no
    separate company filter of its own, so "already on the roster" doubles
    as the correct restriction)."""
    df = azure_tables.read_resource_assignments()
    if df.empty:
        print("[compliance] WARNING: no rows returned from the Resource Assignments table "
              f"({config.RESOURCE_ASSIGNMENTS_TABLE}) — Project/Business Unit filters will be empty.", flush=True)
        return {}

    rc = resolve_columns("resourceAssignments", list(df.columns))

    if not rc.get("empId"):
        print("[compliance] WARNING: could not detect Employee ID column in "
              "Resource_Assignments_Report.xlsx — skipping.", flush=True)
        return {}

    df = df.copy()
    df["_id"] = norm_id_series(df[rc["empId"]])
    df = df[df["_id"].isin(valid_emp_ids)]
    if df.empty:
        return {}

    if rc.get("month"):
        df["_monthnum"] = df[rc["month"]].map(_month_to_number)
    else:
        df["_monthnum"] = 0
    if rc.get("year"):
        df["_yearnum"] = pd.to_numeric(df[rc["year"]], errors="coerce").fillna(0)
    else:
        df["_yearnum"] = 0

    df = df.sort_values(["_id", "_yearnum", "_monthnum"])
    latest = df.drop_duplicates(subset="_id", keep="last")

    result = {}
    project_col = rc.get("project")
    bu_col = rc.get("businessUnit")
    for _, row in latest.iterrows():
        result[row["_id"]] = {
            "project": (row[project_col] or "Not Available") if project_col else "Not Available",
            "businessUnit": (row[bu_col] or "Not Available") if bu_col else "Not Available",
        }
    return result


def load_exception_employees(valid_emp_ids: set, window: list) -> dict:
    """Loads Exception_Employees_Report.xlsx and returns {emp_id: {"wfhStart":
    ..., "wfhEnd": ..., "reason": ...}} for employees whose approved WFH
    exception date range overlaps the CURRENT reporting window. These
    employees are pulled out of tracked/compliance calculations entirely for
    this window, the same way Client Location employees are — they're not
    expected in the office during their approved WFH period."""
    df = azure_tables.read_exception_employees()
    if df.empty:
        print("[compliance] WARNING: no rows returned from the Exception Employees table "
              f"({config.EXCEPTION_EMPLOYEES_TABLE}) — no WFH exceptions will be applied.", flush=True)
        return {}

    rc = resolve_columns("exceptionEmployees", list(df.columns))

    if not rc.get("empId") or not rc.get("wfhStart"):
        print("[compliance] WARNING: could not detect Employee ID / WFH Start Date column in "
              "Exception_Employees_Report.xlsx — skipping.", flush=True)
        return {}

    df = df.copy()
    df["_id"] = norm_id_series(df[rc["empId"]])
    df = df[df["_id"].isin(valid_emp_ids)]

    if rc.get("eventType"):
        sv = df[rc["eventType"]].astype(str).str.lower()
        # Only rows that actually look like a WFH-type event; if none match,
        # fall back to treating every row as relevant (file may not use this
        # wording at all).
        wfh_mask = sv.str.contains("wfh", na=False)
        if wfh_mask.any():
            df = df[wfh_mask]

    # Unlike the Darwinbox exports (dd-mm-yyyy), the Exception Employees
    # Report's WFH dates come through in mm-dd-yyyy (US) format — confirmed
    # by a pandas warning when this was forced to dayfirst=True, which was
    # silently misreading any day-of-month <=12 (e.g. 03-04-2026 as April 3rd
    # instead of March 4th).
    df["_start"] = pd.to_datetime(df[rc["wfhStart"]], errors="coerce", dayfirst=False)
    end_col = rc.get("wfhEnd")
    df["_end"] = pd.to_datetime(df[end_col], errors="coerce", dayfirst=False) if end_col else df["_start"]
    df["_end"] = df["_end"].fillna(df["_start"])
    df = df[df["_start"].notna()]

    if df.empty or not window:
        return {}

    window_start = pd.Timestamp(window[0])
    window_end = pd.Timestamp(window[-1])
    overlaps = (df["_start"] <= window_end) & (df["_end"] >= window_start)
    df = df[overlaps]

    reason_col = rc.get("reason")
    detailed_reason_col = rc.get("detailedReason")
    result = {}
    for _, row in df.sort_values("_start").iterrows():
        result[row["_id"]] = {
            "wfhStart": row["_start"].strftime("%Y-%m-%d"),
            "wfhEnd": row["_end"].strftime("%Y-%m-%d"),
            "reason": (row[reason_col] or "Not Available") if reason_col else "Not Available",
            "detailedReason": (row[detailed_reason_col] or "Not Available") if detailed_reason_col else "Not Available",
        }
    return result


# ---------------------------------------------------------------------------
# Main computation
# ---------------------------------------------------------------------------
def compute_dashboard(window_override=None):
    t0 = time.time()
    # Pre-calculate window so biometric query is scoped to exactly the dates
    # needed — AttendanceLogs PartitionKey is the YYYY-MM-DD date, making this
    # a cheap server-side range scan instead of a full-table read.
    if window_override:
        _bio_start, _bio_end = window_override
    else:
        _bio_start, _bio_end = week_bounds(pd.Timestamp.now().strftime("%Y-%m-%d"))

    roster_df = azure_tables.read_roster()
    biometric_df = azure_tables.read_biometric(from_date=_bio_start, to_date=_bio_end)
    leave_df = azure_tables.read_leave()

    rc = resolve_columns("roster", list(roster_df.columns))
    bc = resolve_columns("biometric", list(biometric_df.columns))
    lc = resolve_columns("leave", list(leave_df.columns))

    missing = []
    if not rc.get("empId"):
        missing.append("roster: Employee ID column")
    if not bc.get("empId") or not bc.get("date"):
        missing.append("biometric: Employee ID / Date column")
    if not lc.get("empId") or not lc.get("fromDate"):
        missing.append("leave: Employee ID / Date column")
    if missing:
        raise ValueError(
            "Could not detect required columns for: " + "; ".join(missing) +
            ". Set them explicitly in config.py COLUMN_OVERRIDES."
        )

    # ---------------- 1. Roster (vectorized) ----------------
    t1 = time.time()
    roster_df = roster_df.copy()
    roster_df["_id"] = norm_id_series(roster_df[rc["empId"]])
    roster_df = roster_df[roster_df["_id"] != ""]

    if rc.get("status"):
        status_lower = roster_df[rc["status"]].astype(str).str.lower()
        inactive_pattern = "inactive|terminated|disabled|left|exited"
        roster_df["_active"] = ~status_lower.str.contains(inactive_pattern, na=False, regex=True)
    else:
        roster_df["_active"] = True

    # If the same employee ID appears twice, keep the last row (most recent).
    roster_df = roster_df.drop_duplicates(subset="_id", keep="last")

    name_col = rc.get("name")
    org_col = rc.get("org")
    practice_col = rc.get("practice")
    sub_practice_col = rc.get("subPractice")
    designation_col = rc.get("designation")
    level_col = rc.get("level")
    client_location_col = rc.get("clientLocation")
    client_location_state_col = rc.get("clientLocationState")
    client_location_city_col = rc.get("clientLocationCity")
    location_col = rc.get("location")
    reporting_manager_col = rc.get("reportingManager")
    hrbp_col = rc.get("hrbp")
    doj_col = rc.get("dateOfJoining")

    roster = {}
    ids = roster_df["_id"].tolist()
    actives = roster_df["_active"].tolist()
    names = roster_df[name_col].tolist() if name_col else ids
    orgs = roster_df[org_col].tolist() if org_col else ["—"] * len(roster_df)
    practices = roster_df[practice_col].tolist() if practice_col else ["Not Available"] * len(roster_df)
    sub_practices = roster_df[sub_practice_col].tolist() if sub_practice_col else ["Not Available"] * len(roster_df)
    designations = roster_df[designation_col].tolist() if designation_col else ["—"] * len(roster_df)
    levels = roster_df[level_col].tolist() if level_col else ["—"] * len(roster_df)
    client_location_states = roster_df[client_location_state_col].tolist() if client_location_state_col else ["Not Available"] * len(roster_df)
    client_location_cities = roster_df[client_location_city_col].tolist() if client_location_city_col else ["Not Available"] * len(roster_df)
    locations = roster_df[location_col].tolist() if location_col else ["Not Available"] * len(roster_df)
    reporting_managers = roster_df[reporting_manager_col].tolist() if reporting_manager_col else ["Not Available"] * len(roster_df)
    hrbps = roster_df[hrbp_col].tolist() if hrbp_col else ["Not Available"] * len(roster_df)
    doj_raw = roster_df[doj_col].tolist() if doj_col else [None] * len(roster_df)
    if client_location_col:
        raw_client_col = roster_df[client_location_col]
        if isinstance(raw_client_col, pd.DataFrame):
            # A duplicate column name in the source file (pandas appends .1,
            # .2, etc to duplicates, but if that somehow still collides this
            # keeps things from crashing) — take the first matching column.
            print(f"[compliance] WARNING: multiple columns resolved to '{client_location_col}' — "
                  f"using the first one.", flush=True)
            raw_client_col = raw_client_col.iloc[:, 0]
        client_flags = raw_client_col.astype(str).str.strip().str.lower().eq("yes").tolist()
    else:
        print("[compliance] WARNING: no client-location column detected at all — "
              "check COLUMN_OVERRIDES['roster']['clientLocation'] in config.py.", flush=True)
        client_flags = [False] * len(roster_df)

    for emp_id, active, name, org, practice, sub_practice, designation, level, is_client, client_location_state, client_location_city, location, reporting_manager, hrbp, doj in zip(
        ids, actives, names, orgs, practices, sub_practices, designations, levels, client_flags, client_location_states, client_location_cities, locations, reporting_managers, hrbps, doj_raw
    ):
        roster[emp_id] = {
            "id": emp_id,
            "name": name or emp_id,
            "org": org if org_col else "—",
            "practice": (practice or "Not Available") if practice_col else "Not Available",
            "subPractice": (sub_practice or "Not Available") if sub_practice_col else "Not Available",
            "designation": (designation or "—") if designation_col else "—",
            "level": (level or "—") if level_col else "—",
            "clientLocation": bool(is_client),
            "clientLocationState": (client_location_state or "Not Available") if client_location_state_col else "Not Available",
            "clientLocationCity": (client_location_city or "Not Available") if client_location_city_col else "Not Available",
            "location": (location or "Not Available") if location_col else "Not Available",
            "reportingManager": (reporting_manager or "Not Available") if reporting_manager_col else "Not Available",
            "hrbp": (str(hrbp).strip() or "Not Available") if hrbp_col and str(hrbp).strip() not in ("", "None", "nan") else "Not Available",
            "dateOfJoining": _parse_doj(doj),
            "active": active,
        }

    # ---------------- 2. Office days per employee (vectorized) ----------------
    office_map = {}
    hours_map = {}  # {emp_id: {date: {"firstIn": str, "lastOut": str, "hours": str}}}
    if not biometric_df.empty:
        biometric_df = biometric_df.copy()
        biometric_df["_id"] = norm_id_series(biometric_df[bc["empId"]])
        biometric_df["_date"] = pd.to_datetime(
            biometric_df[bc["date"]], errors="coerce", dayfirst=False
        ).dt.strftime("%Y-%m-%d")

        keep = (biometric_df["_id"] != "") & biometric_df["_date"].notna()
        if bc.get("status"):
            sv = biometric_df[bc["status"]].astype(str).str.lower()
            keep &= ~sv.str.contains("absent|leave|holiday", na=False, regex=True)
        biometric_df = biometric_df[keep]

        if not biometric_df.empty:
            office_map = biometric_df.groupby("_id")["_date"].apply(set).to_dict()

            fi_col = bc.get("firstIn")
            lo_col = bc.get("lastOut")
            dur_col = bc.get("durationHours")
            if fi_col or dur_col:
                def _extract_hhmm(raw):
                    m = re.search(r"(\d{1,2}:\d{2})", str(raw))
                    return m.group(1) if m else ""
                fi_s = biometric_df[fi_col].map(_extract_hhmm) if fi_col else pd.Series("", index=biometric_df.index)
                lo_s = biometric_df[lo_col].map(_extract_hhmm) if lo_col else pd.Series("", index=biometric_df.index)
                dur_raw = biometric_df[dur_col].astype(str) if dur_col else pd.Series("", index=biometric_df.index)
                dur_s = dur_raw.where(dur_raw.str.match(r"^\d+:\d{2}$"), "")
                for eid, d, fi, lo, dur in zip(
                    biometric_df["_id"], biometric_df["_date"], fi_s, lo_s, dur_s
                ):
                    hours_map.setdefault(eid, {})[d] = {"firstIn": fi, "lastOut": lo, "hours": dur}
    if office_map:
        overlap = len(set(office_map.keys()) & set(roster.keys()))
        if overlap == 0:
            print("[compliance] WARNING: zero overlap between roster and biometric IDs — "
                  "check COLUMN_OVERRIDES / raw ID formats, they aren't lining up.", flush=True)

    # ---------------- 3. Leave days per employee ----------------
    leave_map = {}
    skipped_leave_rows = 0
    if not leave_df.empty:
        leave_df = leave_df.copy()
        leave_df["_id"] = norm_id_series(leave_df[lc["empId"]])
        leave_df["_from"] = pd.to_datetime(leave_df[lc["fromDate"]], errors="coerce", dayfirst=True)
        if lc.get("toDate"):
            leave_df["_to"] = pd.to_datetime(leave_df[lc["toDate"]], errors="coerce", dayfirst=True)
        else:
            leave_df["_to"] = leave_df["_from"]

        keep = (leave_df["_id"] != "") & leave_df["_from"].notna()
        if lc.get("status"):
            sv = leave_df[lc["status"]].astype(str).str.lower()
            keep &= ~sv.str.contains("reject|cancel|pending", na=False, regex=True)
        leave_df = leave_df[keep]

        # Row-wise expansion of From→To ranges — leave rows are typically far
        # fewer than biometric punches, so a plain loop here is fine, as long
        # as we cap runaway ranges from bad data.
        for emp_id, from_dt, to_dt in zip(leave_df["_id"], leave_df["_from"], leave_df["_to"]):
            if pd.isna(to_dt):
                to_dt = from_dt
            span_days = abs((to_dt - from_dt).days) + 1
            if span_days > MAX_LEAVE_SPAN_DAYS:
                skipped_leave_rows += 1
                continue
            for d in date_range(from_dt.strftime("%Y-%m-%d"), to_dt.strftime("%Y-%m-%d")):
                leave_map.setdefault(emp_id, set()).add(d)

    if skipped_leave_rows:
        print(f"[compliance] WARNING: skipped {skipped_leave_rows} leave row(s) with a span "
              f"over {MAX_LEAVE_SPAN_DAYS} days — likely a mis-parsed From/To date.", flush=True)

    # ---------------- 4. Window ----------------
    # Monday-through-Sunday calendar week that contains TODAY. This must be
    # calendar-anchored (not data-anchored) so the live window always rolls
    # over exactly on schedule every Monday, regardless of whether this
    # week's biometric punches have made it into the rolling export yet.
    # A freshly-rolled-over week with no punches yet is exactly what the
    # "no saved data" coverage note (see _get_data_for_range) is for — it's
    # not a reason to hold the window back on the previous week. Using a
    # full calendar range (rather than only dates that happen to have a
    # punch row) means a day nobody visited still counts as a real gap
    # instead of silently vanishing.
    if window_override:
        week_start, week_end = window_override
    else:
        anchor = pd.Timestamp.now().strftime("%Y-%m-%d")
        week_start, week_end = week_bounds(anchor)
    window = date_range(week_start, week_end)
    today_str = pd.Timestamp.now().strftime("%Y-%m-%d")

    # Which window dates are weekends — used for the exempt-level override
    # below (Sat/Sun never count as required office days for anyone).
    weekend_flags = {d: pd.Timestamp(d).weekday() >= 5 for d in window}

    # Resource Assignments Report: only pulled for employees already on the
    # (active, non-client-location) roster — see load_resource_assignments()
    # docstring for why that's the correct "Neurealm only" restriction.
    all_active_ids = {emp["id"] for emp in roster.values() if emp["active"]}
    candidate_ids = {eid for eid in all_active_ids if not roster[eid]["clientLocation"]}
    assignments = load_resource_assignments(all_active_ids)
    exceptions = load_exception_employees(candidate_ids, window)

    employees = []
    client_location_employees = []
    exception_employees = []
    for emp in roster.values():
        if not emp["active"]:
            continue

        # Global eligibility gate for the selected window: anyone whose DOJ is
        # after the requested end date is excluded from all categories.
        doj = emp.get("dateOfJoining") or ""
        if doj and doj > window[-1]:
            continue

        # Client-location employees are never expected in the office, so they
        # don't participate in compliance tracking at all — not in the office/
        # leave counts, not in the buckets, not in "Tracked employees". They're
        # kept in their own separate list purely for visibility.
        if emp["clientLocation"]:
            assignment = assignments.get(emp["id"], {})
            client_location_employees.append({
                "id": emp["id"],
                "name": emp["name"],
                "org": emp["org"],
                "practice": emp["practice"],
                "subPractice": emp["subPractice"],
                "designation": emp["designation"],
                "level": emp["level"],
                "clientLocationState": emp["clientLocationState"],
                "clientLocationCity": emp["clientLocationCity"],
                "location": emp["location"],
                "reportingManager": emp["reportingManager"],
                "businessUnit": assignment.get("businessUnit", "Not Available"),
                "hrbp": emp["hrbp"],
                "dateOfJoining": emp.get("dateOfJoining"),
            })
            continue

        # Employees with an approved WFH exception overlapping this window
        # are excluded the same way — not expected in office, not counted
        # against "Tracked employees" — but kept visible with their WFH
        # dates and reason.
        exception = exceptions.get(emp["id"])
        if exception:
            assignment = assignments.get(emp["id"], {})
            exception_employees.append({
                "id": emp["id"],
                "name": emp["name"],
                "org": emp["org"],
                "practice": emp["practice"],
                "subPractice": emp["subPractice"],
                "designation": emp["designation"],
                "level": emp["level"],
                "location": emp["location"],
                "reportingManager": emp["reportingManager"],
                "businessUnit": assignment.get("businessUnit", "Not Available"),
                "hrbp": emp["hrbp"],
                "dateOfJoining": emp.get("dateOfJoining"),
                "wfhStart": exception["wfhStart"],
                "wfhEnd": exception["wfhEnd"],
                "reason": exception["reason"],
                "detailedReason": exception.get("detailedReason", "Not Available"),
            })
            continue

        assignment = assignments.get(emp["id"], {})
        project = assignment.get("project", "Not Available")
        business_unit = assignment.get("businessUnit", "Not Available")

        emp_hours = hours_map.get(emp["id"], {})
        is_exempt_level = str(emp["level"]).strip().lower() in config.EXEMPT_LEVELS

        if is_exempt_level:
            # Senior levels (9.1 / 9.2 / CXO) are auto-marked present every
            # weekday regardless of biometric data — weekends don't count
            # against or for them. Days before the employee's joining date
            # are shown as no-data.
            office_count = sum(1 for d in window if not weekend_flags[d] and (not doj or d >= doj))
            leave_cover_count = 0
            bucket, sub_status = 3, "compliant"
            days = [
                {"date": d, "state": "weekend" if weekend_flags[d] else (
                    "no-data" if (doj and d < doj) or d > today_str else "office"
                ), **emp_hours.get(d, {})}
                for d in window
            ]
        else:
            office_days = office_map.get(emp["id"], set())
            leave_days = leave_map.get(emp["id"], set())

            office_count = sum(1 for d in window if d in office_days)
            leave_cover_count = sum(1 for d in window if d not in office_days and d in leave_days)
            # Count weekday-only leave days for the compliance rule.
            # Rule: 5L→compliant; 4L→1 WFO; 3L→2 WFO; 2L or less→3 WFO.
            leave_weekday_count = sum(1 for d in window if d in leave_days and not weekend_flags[d])

            if office_count >= 3:
                bucket, sub_status = 3, "compliant"
            elif leave_weekday_count >= 5:
                bucket, sub_status = 3, "compliant"
            elif leave_weekday_count == 4 and office_count >= 1:
                bucket, sub_status = 3, "compliant"
            elif leave_weekday_count == 3 and office_count >= 2:
                bucket, sub_status = 3, "compliant"
            else:
                bucket = office_count
                sub_status = "flagged"

            days = [
                {
                    "date": d,
                    "state": "office" if d in office_days else (
                        "leave" if d in leave_days else (
                            "weekend" if weekend_flags[d] else (
                                "no-data" if (doj and d < doj) or d > today_str else "gap"
                            )
                        )
                    ),
                    **emp_hours.get(d, {}),
                }
                for d in window
            ]

        employees.append({
            "id": emp["id"],
            "name": emp["name"],
            "org": emp["org"],
            "practice": emp["practice"],
            "subPractice": emp["subPractice"],
            "designation": emp["designation"],
            "level": emp["level"],
            "location": emp["location"],
            "reportingManager": emp["reportingManager"],
            "hrbp": emp["hrbp"],
            "dateOfJoining": emp.get("dateOfJoining"),
            "project": project,
            "businessUnit": business_unit,
            "officeDaysCount": office_count,
            "leaveDaysCount": leave_cover_count,
            "bucket": bucket,
            "subStatus": sub_status,
            "days": days,
        })

    employees.sort(key=lambda e: e["name"])
    client_location_employees.sort(key=lambda e: e["name"])
    exception_employees.sort(key=lambda e: e["name"])
    print(f"[compliance] {window[0]} to {window[-1]}: {len(employees)} tracked, "
          f"{len(client_location_employees)} client-location, {len(exception_employees)} WFH exception "
          f"({time.time()-t0:.1f}s)", flush=True)

    return {
        "window": window,
        "employees": employees,
        "clientLocationEmployees": client_location_employees,
        "exceptionEmployees": exception_employees,
        "sourceMtimes": source_mtimes(),
    }