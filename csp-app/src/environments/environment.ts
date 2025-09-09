// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  officesite: 'https://login.microsoftonline.com/',
  tenantid:'2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
  clientid:'c247269b-172a-4bc9-bf94-1af78fcc21c7',
  redirect:'http%3A%2F%2Flocalhost:4201%2Flandingpage/',
  loginpage:'http%3A%2F%2Flocalhost:4201%2Flogin/',
  //localhost
  webapiuri: 'http://localhost:53505/api/AllSys/',
  webapiuri_auth: 'http://localhost:53505/api/Auth/',
  googleClientId: '360086473959-4rtb8ep6eq60tt3pm8922g33cr6pvbqe.apps.googleusercontent.com',
  gavsGoogleClientId: '348205218679-gt5j9l08b657o76kuo6j5ni3kbt231ps.apps.googleusercontent.com',
  environment_Id:'Dev',
  company_name: 'Neurealm',
  domain_name:'neurealm.com',
  formerly_text :'(Formerly GS Lab | GAVS)'
  //Key: "NzUFTGFX7XGt9CCrgfdVlCAdxD6KS5L2TodP+L/v//I=",
  //ng build --environment=prod --build-optimizer --aot
  //ng build --prod --build-optimizer
  //ng build -prod -aot --buildOptimizer --statsJson
};

// export const environment = {
//   production: true,
//   //222 - TEST
//   webapiuri: 'http://10.0.2.222:8093/api/AllSys/',
//   webapiuri_auth: 'http://10.0.2.222:8093/api/Auth/',
//   officesite: 'https://login.microsoftonline.com/',
//   tenantid:'2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
//   clientid:'aacc7c9c-0f59-469c-b119-41592a582024',
//   redirect:'http%3A%2F%2F10.0.2.222:8092%2Flandingpage/',
//   loginpage:'http%3A%2F%2F10.0.2.222:8092%2Flogin/',

// };



