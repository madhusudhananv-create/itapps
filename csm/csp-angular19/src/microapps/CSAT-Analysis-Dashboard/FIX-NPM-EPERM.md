# Fix: npm EPERM / unlink error on node_modules

When you see:
```
npm error errno -4048
npm error [Error: EPERM: operation not permitted, unlink '...\node_modules\typescript\README.md']
```

A process is locking files. Follow these steps **in order**.

---

## Step 1: Stop everything using the project

1. **Stop the dev server**  
   In the terminal where `npm start` is running, press **Ctrl+C**.

2. **Close Cursor (or VS Code)**  
   Fully exit the editor so it releases file handles on the project folder.

3. **Close any terminals** that have `c:\DASHBOARD\CSAT-Analysis-Dashboard` as current directory.

4. **Close File Explorer** windows that are open inside `CSAT-Analysis-Dashboard` or `node_modules`.

---

## Step 2: Delete node_modules (run CMD as Administrator)

1. Press **Windows key**, type **cmd**.
2. **Right‑click** on **Command Prompt** → **Run as administrator**.
3. Run:

```cmd
cd /d C:\DASHBOARD\CSAT-Analysis-Dashboard
rmdir /s /q node_modules
```

4. If that still says "access denied" or "in use":
   - Restart the PC.
   - After restart, open **Command Prompt as Administrator** again and run the same two lines.

---

## Step 3: Reinstall and start

In the **same** Administrator CMD (or a new normal CMD):

```cmd
cd /d C:\DASHBOARD\CSAT-Analysis-Dashboard
npm install
npm start
```

Or open Cursor again and in its terminal run:

```cmd
cd c:\DASHBOARD\CSAT-Analysis-Dashboard
npm install
npm start
```

---

## If it still fails

- **Temporarily disable** real-time scanning for `C:\DASHBOARD\CSAT-Analysis-Dashboard` in Windows Defender (or your antivirus), then repeat Step 2 and Step 3.
- **OneDrive/cloud sync**: If the project is in a OneDrive/cloud folder, move the project to a local folder (e.g. `C:\DASHBOARD\`) and try again.
