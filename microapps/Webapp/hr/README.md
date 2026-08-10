# Office Attendance Compliance Dashboard

Reads the 3 weekly reports directly off disk (no upload UI) and shows who's
hit the "3 office days a week" policy, who's short but covered by leave, and
who needs a follow-up.

## How it works

- Some other job (your Dataverse / Darwinbox extraction scripts) refreshes
  3 xlsx files on disk every ~5 minutes.
- This Flask app reads those same 3 files, computes compliance, and serves
  it as JSON to a small HTML/CSS/JS frontend.
- The frontend polls the backend every 60s by default (configurable) and
  also has a **Refresh now** button. The backend only re-parses a file when
  its modified-time has actually changed, so idle polling is cheap.

## 1. Install

```bash
cd attendance_app
python3 -m venv venv
source venv/bin/activate      # venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## 2. Point it at your files

Edit `config.py` — either change the defaults directly, or set environment
variables so you don't have to touch the code:

```bash
export REPORTS_DIR=/path/to/where/the/reports/land
export ROSTER_FILE=/path/to/Bookable_Resources_Report.xlsx
export BIOMETRIC_FILE=/path/to/Last_7_Days_Biometric_Report.xlsx
export LEAVE_FILE=/path/to/Last_7_Days_Leave_Report.xlsx
```

The roster file's columns are hardcoded in `config.py` (`COLUMN_OVERRIDES`)
because they're known exactly from your extraction script. The biometric and
leave files come from a raw Darwinbox API dump, so their headers might not
match what auto-detect guesses — **open one of those files, check the actual
header row, and hardcode the exact column names in `COLUMN_OVERRIDES`** in
config.py instead of relying on the keyword guesser. Leaving a field as
`None` keeps auto-detection on.

## 3. Run

```bash
python3 app.py
```

Visit `http://localhost:5000`. For real deployment (not just local testing),
run behind a proper WSGI server instead of the Flask dev server, e.g.:

```bash
pip install gunicorn        # Linux/macOS
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

On Windows, use `waitress` instead of gunicorn:

```bash
pip install waitress
waitress-serve --port=5000 app:app
```

## Compliance rule

For each active bookable resource, over a rolling 7-day window:

- **office days** = distinct dates with a biometric punch (excluding rows
  whose status says absent/leave/holiday, if a status column exists)
- **leave days** = distinct dates covered by an approved leave entry
- **3+ office days → Compliant**
- **Fewer than 3 → "Covered by leave"** if `office days + leave days on the
  remaining days ≥ 3` (e.g. 2 office + 1 leave = fine), otherwise
  **"Flagged"** as an unexplained gap.

## Files

```
app.py          Flask routes + mtime-based caching
compliance.py   Core logic: reading files, column detection, the rule itself
config.py       File paths + column overrides — the only file you should
                need to edit for your environment
static/         Frontend (index.html, styles.css, dashboard.js)
requirements.txt
```

## Notes / things to double check with real data

- Employee IDs are normalized (trimmed, uppercased, leading zeros stripped)
  to bridge minor formatting differences between the roster and the
  Darwinbox exports. If the dashboard shows "no matching employees," this is
  the first place to look — the empty state will still render so it's
  obvious when the join fails.
- The "Resource Status" filter excludes anyone whose status contains
  inactive/terminated/disabled/left/exited — adjust the keyword list in
  `compliance.py` (`inactive_markers`) if your status values differ.
