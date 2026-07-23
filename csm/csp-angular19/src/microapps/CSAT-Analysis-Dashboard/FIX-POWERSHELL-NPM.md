# Fix: "Running scripts is disabled" when running npm

PowerShell is blocking `npm.ps1`. Use one of these:

---

## Option A: Use Command Prompt (no settings change)

1. Press **Win + R**, type **cmd**, press Enter.
2. Run:
   ```
   cd C:\DASHBOARD\CSAT-Analysis-Dashboard
   npm install
   npm start
   ```

Or double-click **run-npm-install.cmd** in the project folder, then run `npm start` from the same folder in cmd.

---

## Option B: Allow scripts in PowerShell (fix for Cursor/VS Code terminal)

Open **PowerShell** (not Command Prompt) and run **once**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Type **Y** and Enter if prompted. Then in Cursor's terminal you can use `npm install` and `npm start` as usual.

- **RemoteSigned** = local scripts run; downloaded scripts need to be signed. Safe for normal use.
- **CurrentUser** = only your account is changed, no admin needed.

---

## Option C: One-time bypass (current terminal only)

In the same PowerShell window where you got the error, run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Then run `npm install`. This lasts only until you close that terminal.
