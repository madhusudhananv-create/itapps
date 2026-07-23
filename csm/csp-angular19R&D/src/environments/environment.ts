// Environment configuration for Angular 19 modernized application
// Migrated from legacy environment.ts - preserving all API endpoints and configurations

export const environment = {
  production: false,
  officesite: 'https://login.microsoftonline.com/',
  tenantid: '2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
  clientid: 'c247269b-172a-4bc9-bf94-1af78fcc21c7',
  redirect: 'http%3A%2F%2Flocalhost:4201%2Flandingpage/',
  loginpage: 'http%3A%2F%2Flocalhost:4201%2Flogin/',
  // API endpoints - preserved from legacy
  webapiuri: 'http://localhost:53505/api/AllSys/',
  webapiuri_auth: 'http://localhost:53505/api/Auth/',
  // Google OAuth - preserved from legacy
  googleClientId: '360086473959-4rtb8ep6eq60tt3pm8922g33cr6pvbqe.apps.googleusercontent.com',
  gavsGoogleClientId: '348205218679-gt5j9l08b657o76kuo6j5ni3kbt231ps.apps.googleusercontent.com',
  // Application settings
  environment_Id: 'Dev',
  company_name: 'Neurealm',
  domain_name: 'neurealm.com',
  formerly_text: '(Formerly GS Lab | GAVS)',
  // Session timeout setting (in seconds)
  sessionTimeoutSeconds: 10 * 60         // 10 minutes of inactivity before logout
};
