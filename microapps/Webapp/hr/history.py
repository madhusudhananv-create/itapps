"""
Saves a JSON snapshot of each computed week to disk (in a `history` folder),
so the Last week / 2 weeks ago / etc. dropdown has something to read back
later — including across app restarts, which in-memory storage can't
survive. There's still no way to reconstruct history from before this
folder started accumulating snapshots, or from before the app was first
deployed with this feature.
"""
import os
import json
import datetime as dt

import config


def _ensure_dir():
    os.makedirs(config.HISTORY_DIR, exist_ok=True)


def save_snapshot(data: dict):
    window = data.get("window") or []
    if not window:
        return
    _ensure_dir()
    end_date = window[-1]
    path = os.path.join(config.HISTORY_DIR, f"{end_date}.json")
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f)
    except Exception as exc:
        print(f"[history] WARNING: could not save snapshot for {end_date}: {exc}", flush=True)


def get_snapshot_by_end_date(end_date: str):
    """Returns the exact snapshot whose window ends on this date, or None."""
    _ensure_dir()
    path = os.path.join(config.HISTORY_DIR, f"{end_date}.json")
    if not os.path.exists(path):
        return None
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        print(f"[history] WARNING: could not read snapshot {path}: {exc}", flush=True)
        return None


def _available_dates():
    _ensure_dir()
    dates = []
    for fname in os.listdir(config.HISTORY_DIR):
        if fname.endswith(".json"):
            try:
                dates.append(dt.date.fromisoformat(fname[:-5]))
            except ValueError:
                continue
    return sorted(dates)


def load_snapshot_for_week_offset(current_window, week_offset: int):
    """week_offset=0 means 'current' (caller should just use the live cache
    instead of calling this). week_offset=1 means ~7 days before the current
    window's end date, week_offset=2 means ~14 days before, etc. Returns
    (data, matched_date, target_date, available_dates). data/matched_date are
    None if nothing close enough is saved — target_date and available_dates
    are always returned so the caller can build a specific error message."""
    if not current_window:
        return None, None, None, []
    current_end = dt.date.fromisoformat(current_window[-1])
    target = current_end - dt.timedelta(days=7 * week_offset)

    available = _available_dates()
    if not available:
        return None, None, target.isoformat(), []

    closest = min(available, key=lambda d: abs((d - target).days))
    if abs((closest - target).days) > 3:
        return None, None, target.isoformat(), [d.isoformat() for d in available]

    data = get_snapshot_by_end_date(closest.isoformat())
    if data is None:
        return None, None, target.isoformat(), [d.isoformat() for d in available]
    return data, closest.isoformat(), target.isoformat(), [d.isoformat() for d in available]


def patch_overflow_into_snapshots(overflow_by_week: dict, current_employees=None):
    """Merges freshly-seen overflow days (real punches/leave for a day
    outside the current live window — see compliance.py's overflow capture)
    into whichever saved snapshot covers that week, so a day isn't lost just
    because it only showed up in the rolling biometric file after its own
    week had already ended.

    If no snapshot exists yet for that week at all (e.g. the app simply
    wasn't running yet during any of that week), one is synthesized here
    using current roster metadata (name, practice, etc — passed in via
    current_employees) for whichever employees have overflow data. Every day
    in that week other than the newly-seen overflow days is marked
    "no-data" (never observed) rather than "gap" (observed and empty) —
    those are meaningfully different and shouldn't be conflated.

    Recomputes each patched employee's office/leave counts and bucket/status
    from the merged day list, clipped to that snapshot's own window."""
    current_by_id = {e["id"]: e for e in (current_employees or []) if e.get("id")}

    def strip_computed_fields(emp):
        return {k: v for k, v in emp.items() if k not in ("days", "officeDaysCount", "leaveDaysCount", "bucket", "subStatus")}

    for week_end, emp_updates in overflow_by_week.items():
        snap = get_snapshot_by_end_date(week_end)
        is_new = snap is None
        if is_new:
            week_start_date = dt.date.fromisoformat(week_end) - dt.timedelta(days=6)
            window = [(week_start_date + dt.timedelta(days=i)).isoformat() for i in range(7)]
            snap = {"window": window, "employees": [], "clientLocationEmployees": [], "exceptionEmployees": []}

        window = snap.get("window") or []
        window_set = set(window)
        changed = False

        by_id = {e["id"]: e for e in snap.get("employees", []) if e.get("id")}
        for eid, date_states in emp_updates.items():
            emp = by_id.get(eid)
            if emp is None:
                meta = current_by_id.get(eid)
                if not meta:
                    continue  # not on the current roster either — no safe metadata to use
                emp = {**strip_computed_fields(meta), "days": []}
                snap["employees"].append(emp)
                by_id[eid] = emp

            default_state = "no-data" if is_new else "gap"
            days_by_date = {d["date"]: d["state"] for d in emp.get("days", [])}
            for d, state in date_states.items():
                if d not in window_set:
                    continue
                if days_by_date.get(d) != state:
                    days_by_date[d] = state
                    changed = True

            new_days = [{"date": d, "state": days_by_date.get(d, default_state)} for d in window]
            office_count = sum(1 for d in new_days if d["state"] == "office")
            leave_cover = sum(1 for d in new_days if d["state"] == "leave")
            total = office_count + leave_cover
            if office_count >= 3:
                bucket, sub_status = 3, "compliant"
            else:
                bucket = office_count
                sub_status = "covered" if total >= 3 else "flagged"
            emp["days"] = new_days
            emp["officeDaysCount"] = office_count
            emp["leaveDaysCount"] = leave_cover
            emp["bucket"] = bucket
            emp["subStatus"] = sub_status

        if changed:
            path = os.path.join(config.HISTORY_DIR, f"{week_end}.json")
            try:
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(snap, f)
                print(f"[history] patched {len(emp_updates)} employee(s) worth of overflow days into {week_end}.json", flush=True)
            except Exception as exc:
                print(f"[history] WARNING: could not save patched snapshot {path}: {exc}", flush=True)


def load_side_lists_for_range(start_date: str, end_date: str):
    """Client Location and WFH Exception employees don't have day-by-day
    detail — each snapshot just records who was in that status during that
    particular week. For an arbitrary date range, this unions those lists
    from every saved snapshot whose week overlaps the requested range
    (deduplicated by employee id, most-recently-seen snapshot wins), so a
    Last week / custom-range view isn't stuck showing 0 for these just
    because the day-by-day merge doesn't apply to them."""
    _ensure_dir()
    range_start = dt.date.fromisoformat(start_date)
    range_end = dt.date.fromisoformat(end_date)

    client_location = {}
    exceptions = {}
    for fname in sorted(os.listdir(config.HISTORY_DIR)):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(config.HISTORY_DIR, fname)
        try:
            with open(path, encoding="utf-8") as f:
                snap = json.load(f)
        except Exception:
            continue
        window = snap.get("window") or []
        if not window:
            continue
        snap_start = dt.date.fromisoformat(window[0])
        snap_end = dt.date.fromisoformat(window[-1])
        if snap_end < range_start or snap_start > range_end:
            continue  # this snapshot's week doesn't overlap the requested range at all
        for e in snap.get("clientLocationEmployees", []):
            if e.get("id"):
                client_location[e["id"]] = e
        for e in snap.get("exceptionEmployees", []):
            if e.get("id"):
                exceptions[e["id"]] = e

    return list(client_location.values()), list(exceptions.values())


def build_merged_day_map():
    """Merges every saved snapshot's per-employee day-by-day state into one
    map: {emp_id: {"meta": {...}, "days": {date: state}}}. This is what makes
    an arbitrary start/end date range possible — it stitches together
    whatever daily detail has actually been saved across snapshot files.
    Days with no snapshot covering them simply won't appear in the merged
    "days" dict (shown as "no-data" by the caller)."""
    _ensure_dir()
    merged = {}
    for fname in sorted(os.listdir(config.HISTORY_DIR)):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(config.HISTORY_DIR, fname)
        try:
            with open(path, encoding="utf-8") as f:
                snap = json.load(f)
        except Exception:
            continue
        for e in snap.get("employees", []):
            eid = e.get("id")
            if not eid:
                continue
            entry = merged.setdefault(eid, {"meta": {}, "days": {}})
            entry["meta"] = {k: v for k, v in e.items() if k not in ("days", "officeDaysCount", "leaveDaysCount", "bucket", "subStatus")}
            for d in e.get("days", []):
                entry["days"][d["date"]] = d["state"]
    return merged