/**
 * Office Attendance Compliance - Access Control Configuration
 *
 * Add allowed users in AUTHORIZED_USERS.
 * Set enabled=false to allow everyone.
 */

var ATTENDANCE_ACCESS_CONTROL_CONFIG = {
  enabled: true,
  AUTHORIZED_USERS: [
    { email: 'dhivya.g@neurealm.com' },
	//{ email: 'srividhya.b@neurealm.com' },
	{ email: 'ajayghose.sb@neurealm.com' },
	{ email: 'mehak.m@neurealm.com' },
	{ email: 'sona.mathew@neurealm.com' },
	{ email: 'jasbir.singh@neurealm.com' },
	{ email: 'methilda.sagayamary@neurealm.com' },
	{ email: 'neeru.mehta@neurealm.com' },
    { email: 'ajith.v@neurealm.com' },
    //{ email: 'user2@neurealm.com' },
    //{ email: 'user3@neurealm.com' }
  ]
};

function checkAttendanceAccess(userEmail) {
  if (!ATTENDANCE_ACCESS_CONTROL_CONFIG.enabled) {
    return { hasAccess: true, user: null, reason: 'Access control disabled' };
  }

  const user = ATTENDANCE_ACCESS_CONTROL_CONFIG.AUTHORIZED_USERS.find(
    u => String(u.email || '').toLowerCase() === String(userEmail || '').toLowerCase()
  );

  if (user) {
    return { hasAccess: true, user: user };
  }

  return { hasAccess: false, user: null, reason: 'User not authorized' };
}

if (typeof window !== 'undefined') {
  window.checkAttendanceAccess = checkAttendanceAccess;
}

console.log('[Attendance Config] Access control loaded -', ATTENDANCE_ACCESS_CONTROL_CONFIG.AUTHORIZED_USERS.length, 'users');
