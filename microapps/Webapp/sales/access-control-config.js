/**
 * Healthcare Pipeline Dashboard - Access Control Configuration
 * 
 * ✅ SINGLE SOURCE OF TRUTH - This is the only config file!
 * 
 * Used by:
 * - Angular CSM app (landingpage component)
 * - Standalone React pipeline dashboard
 * 
 * Both apps load this file from /assets/access-control-config.js
 * 
 * HOW TO ADD NEW USERS:
 * 1. Add a new line in the AUTHORIZED_USERS array below
 * 2. Specify the email and bu (Business Unit) restriction
 * 3. Save this file
 * 4. Deploy: ng build (Angular copies to dist-xxx/browser/assets/)
 * 
 * BU Restrictions:
 * - bu: 'All'            = Full access (all verticals)
 * - bu: 'Tech'          = Tech vertical only
 * - bu: 'CIT'           = CIT vertical only
 * - bu: 'Healthcare'    = Healthcare vertical only
 * - bu: 'India & GCC'   = India & GCC vertical only
 * - bu: 'SEAD'          = SEAD vertical only
 * - bu: ['Tech', 'CIT'] = Multiple BUs (array format)
 *
 * Partnership Tab Access (3-state logic):
 * - partnershipTab: 'Yes' = Only Partnership tab is visible
 * - partnershipTab: 'No'  = All tabs except Partnership are visible
 * - If omitted/blank, defaults to 'All' (all tabs visible, including Partnership)
 */

var ACCESS_CONTROL_CONFIG = {
  // Enable/disable access control (set to false to allow everyone)
  enabled: true,
  
  // Authorized users list
  AUTHORIZED_USERS: [
    // Full Access Users (All Verticals)
    { email: 'ramya.subramaniam@neurealm.com', bu: 'All'},
    { email: 'sohamsanjay.dodal@neurealm.com', bu: 'All'},
    { email: 'harmeet.chauhan@neurealm.com', bu: 'All'},
    { email: 'rohit.gupta@neurealm.com', bu: 'All'},
    { email: 'amit.soni@neurealm.com', bu: 'All'},
    { email: 'jasbir.singh@neurealm.com', bu: 'All'},
    { email: 'aman.chadha@neurealm.com', bu: 'All'},
    { email: 'rohit.g@neurealm.com', bu: 'All'},
    { email: 'madhusudhanan.v@neurealm.com', bu: 'All'},
    { email: 'vidur.suri@neurealm.com', bu: 'All'},
  { email: 'devipriya.r@neurealm.com', bu: 'All' },
  { email: 'indu.menon@neurealm.com', bu: 'All' },
  { email: 'rishabhkumar.singh@neurealm.com', bu: 'All' },
  { email: 'srividhya.b@neurealm.com', bu: 'All'},
  { email: 'sasha.agarwal@neurealm.com', bu: 'All' },
  { email: 'samriddhi.jain@neurealm.com', bu: 'All' },
  { email: 'ajayghose.sb@neurealm.com', bu: 'All' },
   { email: 'atul.gupta@neurealm.com', bu: 'All' },
  { email: 'vidyut.marathe@neurealm.com', bu: 'All' },
		

	
	

    
    // BU Restricted Users
    { email: 'nitin.naveen@neurealm.com', bu: 'Tech'},
    { email: 'sharad.gupta@neurealm.com', bu: 'CIT'},
    { email: 'amit.daga@neurealm.com', bu: 'Healthcare'},
    { email: 'balaji.uppili@neurealm.com', bu: 'India & GCC'},
    { email: 'sanjay.jayakumar@neurealm.com', bu: 'SEAD'},
    { email: 'ramesh.shanmugham@neurealm.com', bu: 'SEAD'},
  	{ email: 'bharath.kumarr@neurealm.com', bu: 'SEAD'},
	
	
	


    // TO ADD NEW USER: Copy a line above, change email and bu, save file
    // Examples:
    // { email: 'john.doe@neurealm.com', bu: 'All', partnershipTab: 'Yes' },            // Partnership-only view
    // { email: 'jane.doe@neurealm.com', bu: 'Tech', partnershipTab: 'No' },            // All tabs except partnership
    // { email: 'alex@neurealm.com', bu: 'All' },                                        // Omitted => All tabs including partnership
    // { email: 'manager@neurealm.com', bu: ['Tech', 'Healthcare']}, // Multiple BUs
  ]
};

/**
 * Helper function to check if a user has access
 * @param {string} userEmail - User's email address
 * @returns {Object} { hasAccess: boolean, user: object|null, bu: string|array|null }
 */
function checkPipelineAccess(userEmail) {
  if (!ACCESS_CONTROL_CONFIG.enabled) {
    return { hasAccess: true, user: null, bu: 'All', reason: 'Access control disabled' };
  }
  
  const user = ACCESS_CONTROL_CONFIG.AUTHORIZED_USERS.find(
    u => u.email.toLowerCase() === userEmail.toLowerCase()
  );
  
  if (user) {
    const normalizedPartnership = String(user.partnershipTab || '').trim().toLowerCase();
    const partnershipTab = normalizedPartnership === 'yes' ? 'Yes' : (normalizedPartnership === 'no' ? 'No' : 'All');
    return { hasAccess: true, user: user, bu: user.bu, partnershipTab: partnershipTab };
  }
  
  return { hasAccess: false, user: null, bu: null, reason: 'User not authorized' };
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.checkPipelineAccess = checkPipelineAccess;
}

console.log('[Config] Access control configuration loaded -', ACCESS_CONTROL_CONFIG.AUTHORIZED_USERS.length, 'users');
