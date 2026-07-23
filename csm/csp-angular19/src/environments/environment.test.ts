// Environment configuration for TEST environment
// Migrated from legacy environment.test.ts

export const environment = {
  production: false,
  // TEST Server - Azure UAT endpoints
  webapiuri: 'https://csmuatapi.neurealm.com/api/AllSys/',
  webapiuri_auth: 'https://csmuatapi.neurealm.com/api/Auth/',
  officesite: 'https://login.microsoftonline.com/',
  tenantid: '2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
  clientid: '1ec38881-7f3b-45b3-9c03-a56981573c4a',
  redirect: 'https%3A%2F%2Fcsmuat.neurealm.com%2Flandingpage/',
  loginpage: 'https%3A%2F%2Fcsmuat.neurealm.com%2Flogin',
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
