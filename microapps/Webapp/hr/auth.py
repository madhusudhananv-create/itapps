"""
Microsoft SSO (Azure AD / Entra ID) sign-in via MSAL's Authorization Code
flow, gated by an email allow-list.

Flow:
  1. Unauthenticated request to a protected route -> redirected to /login
  2. /login shows a "Sign in with Microsoft" button -> /auth/signin
  3. /auth/signin builds the auth flow and redirects to Microsoft
  4. User signs in at Microsoft, gets redirected back to /auth/callback
  5. /auth/callback completes the flow, checks the signed-in email against
     ACCEPTING_MAIL_IDS, and either logs the person in or shows Access Denied
"""
import msal
from flask import session, redirect, request, url_for

import config


def _msal_app():
    return msal.ConfidentialClientApplication(
        config.SSO_CLIENT_ID,
        authority=config.SSO_AUTHORITY,
        client_credential=config.SSO_CLIENT_SECRET,
    )


def is_logged_in() -> bool:
    return bool(session.get("user_email"))


def current_user_email():
    return session.get("user_email")


def start_sign_in():
    """Builds the Microsoft authorization URL and stashes flow state in the
    session (MSAL needs that state back in the callback to complete the
    exchange). Returns a Flask redirect response."""
    flow = _msal_app().initiate_auth_code_flow(
        scopes=config.SSO_SCOPES,
        redirect_uri=config.SSO_REDIRECT_URI,
    )
    session["auth_flow"] = flow
    return redirect(flow["auth_uri"])


def complete_sign_in():
    """Call from the /auth/callback route. Returns (ok, email_or_error)."""
    flow = session.pop("auth_flow", None)
    if not flow:
        return False, "No sign-in in progress (session expired) — please try signing in again."

    try:
        result = _msal_app().acquire_token_by_auth_code_flow(flow, request.args)
    except ValueError as exc:
        # MSAL raises ValueError for state mismatches, user-cancelled flows, etc.
        return False, str(exc)

    if "error" in result:
        return False, result.get("error_description", result["error"])

    claims = result.get("id_token_claims", {})
    email = (claims.get("preferred_username") or claims.get("email") or "").strip().lower()
    name = claims.get("name", email)

    if not email:
        return False, "Microsoft did not return an email address for this account."

    if email not in config.ACCEPTING_MAIL_IDS:
        return False, f"'{email}' is signed in with Microsoft successfully, but is not on the approved access list."

    session["user_email"] = email
    session["user_name"] = name
    return True, email


def sign_out():
    session.clear()


# ---------------------------------------------------------------------------
# Simple branded HTML pages (reuse the app's own styles.css for consistency)
# ---------------------------------------------------------------------------
def login_page_html(error=None):
    error_html = f'<p class="sso-error">{error}</p>' if error else ""
    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Sign in — Office Attendance Compliance</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<style>
  body{{display:flex;align-items:center;justify-content:center;min-height:100vh;}}
  .sso-card{{background:#fff;border:1px solid var(--border);border-radius:12px;padding:40px 36px;max-width:380px;width:100%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.08);}}
  .sso-card h1{{font-family:'Space Grotesk',sans-serif;font-size:20px;margin:0 0 8px;}}
  .sso-card p{{color:var(--ink-soft);font-size:13.5px;margin:0 0 24px;}}
  .sso-btn{{display:inline-flex;align-items:center;gap:10px;background:var(--teal);color:#fff;text-decoration:none;
    padding:12px 22px;border-radius:8px;font-weight:600;font-size:14px;}}
  .sso-btn:hover{{background:#094a42;}}
  .sso-error{{background:var(--red-soft);color:var(--red);padding:10px 12px;border-radius:8px;font-size:12.5px;margin-bottom:20px;}}
</style>
</head><body>
  <div class="sso-card">
    <h1 class="display">Office Attendance Compliance</h1>
    <p>Sign in with your Neurealm Microsoft account to continue.</p>
    {error_html}
    <a class="sso-btn" href="/auth/signin">Sign in with Microsoft</a>
  </div>
</body></html>"""


def access_denied_html(reason, email=None):
    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Access Denied</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<style>
  body{{display:flex;align-items:center;justify-content:center;min-height:100vh;}}
  .sso-card{{background:#fff;border:1px solid var(--border);border-radius:12px;padding:40px 36px;max-width:420px;width:100%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.08);}}
  .sso-card h1{{font-family:'Space Grotesk',sans-serif;font-size:20px;margin:0 0 8px;color:var(--red);}}
  .sso-card p{{color:var(--ink-soft);font-size:13.5px;margin:0 0 20px;}}
  .sso-btn{{display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:#fff;text-decoration:none;
    padding:11px 20px;border-radius:8px;font-weight:600;font-size:13.5px;}}
  .sso-btn:hover{{background:var(--teal);}}
</style>
</head><body>
  <div class="sso-card">
    <h1 class="display">Access Denied</h1>
    <p>{reason}</p>
    <a class="sso-btn" href="/auth/signin">Try a different account</a>
  </div>
</body></html>"""