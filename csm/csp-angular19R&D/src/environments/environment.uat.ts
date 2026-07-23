// Environment configuration for UAT environment
// Migrated from legacy environment.uat.ts

export const environment = {
  production: false,
  // UAT Server - Internal network endpoints
  webapiuri: 'http://10.0.100.222:8093/api/AllSys/',
  webapiuri_auth: 'http://10.0.100.222:8093/api/Auth/',
  officesite: 'https://login.microsoftonline.com/',
  tenantid: '2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
  clientid: 'aacc7c9c-0f59-469c-b119-41592a582024',
  redirect: 'http%3A%2F%2F10.0.100.222:8092%2Flandingpage/',
  loginpage: 'http%3A%2F%2F10.0.100.222:8092%2Flogin/',
  // Google OAuth - preserved from legacy
  googleClientId: '360086473959-4rtb8ep6eq60tt3pm8922g33cr6pvbqe.apps.googleusercontent.com',
  gavsGoogleClientId: '348205218679-gt5j9l08b657o76kuo6j5ni3kbt231ps.apps.googleusercontent.com',
  // Application settings
  environment_Id: 'UAT',
  company_name: 'Neurealm',
  domain_name: 'neurealm.com',
  formerly_text: '(Formerly GS Lab | GAVS)',
  // Session timeout setting (in seconds)
  sessionTimeoutSeconds: 10 * 60         // 10 minutes of inactivity before logout
};
