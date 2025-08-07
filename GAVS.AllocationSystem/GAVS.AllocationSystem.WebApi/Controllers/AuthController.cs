using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.AllSys.SP;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.WebApi.ActionFilters;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.DirectoryServices.AccountManagement;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    [ActivityLogger]
    [ResponseTimeActionFilter]

    public partial class AuthController : ApiControllerBase
    {
        private readonly string ServiceEmail = string.Empty;
        private readonly string ServicePassword = string.Empty;
        public AuthController(ICloudDB cldb, ICSPDB cspdb)
        {
            Cldb = cldb;
            CSPdb = cspdb;
            ServiceEmail = ConfigurationManager.AppSettings["emailid"];
            ServicePassword = ConfigurationManager.AppSettings["emailpassword"];
            helper = new Controllers.ControllerHelper(cldb, cspdb);
        }


        [GET("GetProjectListTemp")]
        [ActionName("GetProjectListTemp")]
        [HttpGet]
        public IHttpActionResult GetProjectListTemp()
        {
             var td = Cldb.AppRepo.GetTable("reports_getQualitySpocs", new List<REPORTS_PARAMS>());
           
            var result = JsonConvert.SerializeObject(td, Formatting.Indented);
            //var empList = Cldb.EMP_INFO.GetAll().Where(x => x.DOR == null && x.EMP_ID.StartsWith("GS")).OrderByDescending(x => x.EMP_ID).Take(15).ToList();
            return Ok(result);
        }

        [POST("UpdateKPIAvanir")]
        [ActionName("UpdateKPIAvanir")]
        [HttpPost]
        public IHttpActionResult UpdateKPIAvanir(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;

            dynamic json = jsonContent;
            var value = GetHashString("Avanir@123");

            AvanirKPIModel inputData = new AvanirKPIModel();
            try
            {
                inputData = JsonConvert.DeserializeObject<AvanirKPIModel>(json);
            }
            catch (Exception)
            {

                inputData = new AvanirKPIModel
                {
                    Customer_Id = "11",
                    Project_Id = "asda",
                    Actual = (decimal)100.0,
                    KPI = "KPI",
                    Success_Goal = "Goal1",
                    Month = 8,
                    Year = 2021,
                    Status = "Created",
                };
            }


            inputData.Status = "Updated";
            return Ok(inputData);

        }

        #region OneloginAuthentication
        [POST("AuthenticateOneLoginUser")]
        [ActionName("AuthenticateOneLoginUser")]
        [HttpPost]
        public HttpResponseMessage AuthenticateOneLoginUser(HttpRequestMessage request)
        {
            var response = Request.CreateResponse(HttpStatusCode.Unauthorized, "");
            var log = new Logger(response);
            return response;
            //string email = string.Empty;
            //string message = string.Empty;

            //string displayName = string.Empty;
            //string empid = string.Empty;
            //var logintype = "gavs";
            //if (IsValidOneLoginUser(out message, out email, out empid, out displayName, out string csmTitle))
            //{
            //    string AuthKey = getAuthKey(email);
            //    var response = Request.CreateResponse(HttpStatusCode.OK, "Authorized");

            //    response.Headers.Add("logintype", logintype);
            //    response.Headers.Add("Role", csmTitle);
            //    response.Headers.Add("token", AuthKey);
            //    response.Headers.Add("DisplayName", displayName);
            //    response.Headers.Add("Empid", empid);
            //    response.Headers.Add("access", GetAccessControls(email, empid, "gslab"));
            //    response.Headers.Add("Access-Control-Expose-Headers", "Token,Empid,Role,logintype,DisplayName,access");
            //    var log = new Logger(response);
            //    return response;
            //}
            //else
            //{
            //    var response = Request.CreateResponse(HttpStatusCode.Unauthorized, message);
            //    var log = new Logger(response);
            //    return response;
            //}
        }
        #endregion

        #region Authentication
        [GET("Authenticate")]
        [ActionName("Authenticate")]
        [HttpGet]
        public HttpResponseMessage GetAuthentication()
        {
            string email = string.Empty;
            string empid = string.Empty;
            string DisplayName = string.Empty;
            string logintype = string.Empty;
            string message = string.Empty;
            if (IsValidUser(out email, out empid, out DisplayName, out logintype, out message))
            {
                UserInfo query = Cldb.AppRepo.UserInfo(email).FirstOrDefault<UserInfo>();
                string AuthKey = getAuthKey(email);

                var response = Request.CreateResponse(HttpStatusCode.OK, "Authorized");
                if (query != null)
                    response.Headers.Add("Role", query.CSM_TITLE_ID.ToString());
                else if (logintype == "customer")
                    response.Headers.Add("Role", "5");
                response.Headers.Add("Token", AuthKey);
                response.Headers.Add("logintype", logintype);
                response.Headers.Add("Empid", empid);
                response.Headers.Add("DisplayName", DisplayName);
                response.Headers.Add("access", GetAccessControls(email, empid, logintype));
                response.Headers.Add("Access-Control-Expose-Headers", "Token,Empid,Role,logintype,DisplayName,access");
                Logger log = new Logger(Request);
                return response;
            }
            else
            {
                var response = Request.CreateResponse(HttpStatusCode.Unauthorized, "Incorrect username or password: " + message);
                Logger log = new Logger(Request);
                return response;
            }
        }

        [POST("AuthenticateUser")]
        [ActionName("AuthenticateUser")]
        [HttpPost]
        public HttpResponseMessage AuthenticateUser(HttpRequestMessage request)
        {

            //Logger l = new Logger(Request, "", "AuthenticateToken");
            string email = string.Empty;
            string empid = string.Empty;
            string DisplayName = string.Empty;
            string logintype = string.Empty;
            string message = string.Empty;
            if (ValidateUser(out email, out empid, out DisplayName, out logintype, out message))
            {
                UserInfo query = Cldb.AppRepo.UserInfo(email).FirstOrDefault<UserInfo>();
                string AuthKey = getAuthKey(email);

                var response = Request.CreateResponse(HttpStatusCode.OK, "Authorized");
                if (query != null)
                    response.Headers.Add("Role", query.CSM_TITLE_ID.ToString());
                else if (logintype == "customer")
                    response.Headers.Add("Role", "5");
                response.Headers.Add("Token", AuthKey);
                response.Headers.Add("logintype", logintype);
                response.Headers.Add("Empid", empid);
                response.Headers.Add("EmailId", email);
                response.Headers.Add("DisplayName", DisplayName);
                response.Headers.Add("access", GetAccessControls(email, empid, logintype));
                response.Headers.Add("Access-Control-Expose-Headers", "Token,Empid,Role,logintype,DisplayName,access");
                Logger log = new Logger(response);

                return response;
            }
            else
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Unauthorized, "Incorrect username or password: " + message);
                Logger log = new Logger(Request);

                return response;
            }
        }

        [GET("GetReportData")]
        [ActionName("GetReportData")]
        [HttpGet]

        public IHttpActionResult GetReportData(string spName, DateTime startDate, DateTime endDate)
        {

            var lstParams = new List<REPORTS_PARAMS>();

            if (startDate > endDate)
            {
                return Content(HttpStatusCode.Conflict, "Please select end date greater than the start date");
            }

            lstParams.Add(new REPORTS_PARAMS
            {
                PARAM_TYPE = "Date",
                PARAM_VALUE = startDate.ToString("yyyy-MM-dd"),
                PARAM_NAME = "StartDate"
            });

            lstParams.Add(new REPORTS_PARAMS
            {
                PARAM_TYPE = "Date",
                PARAM_VALUE = endDate.ToString("yyyy-MM-dd"),
                PARAM_NAME = "EndDate"
            });



            var td = Cldb.AppRepo.GetTable(spName, lstParams);
           


            return Ok(td);
        }

        private bool IsValidOneLoginUser(out string message, out string email, out string empid, out string displayName, out string csmTitle)
        {
            var authString = string.Empty;
            message = "";
            empid = "";
            displayName = "";
            csmTitle = "";
            email = "";
            if (Request.Headers.Authorization == null)
            {
                var content = Request.Content;
                string jsonContent = content.ReadAsStringAsync().Result;
                authString = jsonContent;

                if (authString == null || authString == string.Empty)
                {
                    Request.CreateResponse(HttpStatusCode.Unauthorized);
                    String ipAddress = GetHeaderDetails_String("X-FORWARDED-FOR");
                    Logger log = new Logger(Request, "Incorrect Authorization Header : Empty" + GetRequestIP());
                    return false;
                }
            }
            else
            {
                authString = Request.Headers.Authorization.Parameter;
            }


            string originalString = string.Empty;
            try
            {
                originalString = Encoding.UTF8.GetString(Convert.FromBase64String(authString));
            }
            catch
            {
                originalString = authString;
            }

            // Gets username and password  
            string username = originalString.Split(':')[0];
            //string password = originalString.Split(':')[1];
            string password = originalString.Substring(originalString.IndexOf(":") + 1);

            var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => (x.EMAIL_ID == username || x.EMP_ID == username) && x.DOR.HasValue == false);
            if (emp == null)
            {
                Logger log = new Logger(Request, "Unable to find username : " + username);
                return false;
            }
            email = emp.EMAIL_ID;
            try
            {
                var response = LoginUser(email, password);
                if (response.Success == false)
                {
                    message = response.Message;
                    return false;
                }

                if (emp != null)
                {
                    empid = emp.EMP_ID.ToString();
                    displayName = emp.FRST_NM;
                    csmTitle = emp.CSM_TITLE_ID.ToString();
                }
                else
                {
                    //throw error
                }
            }
            catch (Exception ex)
            {

                message = ex.Message;
                return false;
            }


            return true;
        }

        private OidcTokenResponse LoginUser(string username, string password)
        {
            using (var client = new HttpClient())
            {

                // The Token Endpoint Authentication Method must be set to POST if you
                // want to send the client_secret in the POST body.
                // If Token Endpoint Authentication Method then client_secret must be
                // combined with client_id and provided as a base64 encoded string
                // in a basic authorization header.
                // e.g. Authorization: basic <base64 encoded ("client_id:client_secret")>
                var formData = new FormUrlEncodedContent(new[]
                {
              new KeyValuePair<string, string>("username", username),
              new KeyValuePair<string, string>("password", password),
              new KeyValuePair<string, string>("client_id", ConfigurationManager.AppSettings["OneLoginClientId"]),
              new KeyValuePair<string, string>("client_secret",  ConfigurationManager.AppSettings["OneLoginClientSecret"]),
              new KeyValuePair<string, string>("grant_type", "password"),
              new KeyValuePair<string, string>("scope", "openid profile email")
          });

                var uri = ConfigurationManager.AppSettings["OneLoginAuthURL"];
                // String.Format("https://{0}.onelogin.com/oidc/token", options.Value.Region);

                var res = client.PostAsync(uri, formData).Result;

                var json = res.Content.ReadAsStringAsync().Result;
                if (json.Contains("MFA"))
                {
                    return new OidcTokenResponse
                    {
                        Success = true,
                        TokenType = ""
                    };
                }
                else if (json.Contains("Authentication Failed: Invalid user credentials"))
                {
                    return new OidcTokenResponse
                    {
                        Success = false,
                        TokenType = "",
                        Message = "Authentication Failed: Invalid user credentials"
                    };
                }
                else
                {
                    var tokenReponse = JsonConvert.DeserializeObject<OidcTokenResponse>(json);

                    return tokenReponse;
                }
            }
        }


        private bool ValidateUser(out string email, out string empid, out string DisplayName, out string logintype, out string message)
        {
            email = string.Empty;
            empid = string.Empty;
            logintype = string.Empty;
            DisplayName = string.Empty;
            message = string.Empty;

            string AuthString = string.Empty;
            //Check http request form data for processing
            if (Request.Headers.Authorization == null)
            {
                var content = Request.Content;
                string jsonContent = content.ReadAsStringAsync().Result;
                AuthString = jsonContent;

                if (AuthString == null || AuthString == string.Empty)
                {
                    Request.CreateResponse(HttpStatusCode.Unauthorized);
                    String ipAddress = GetHeaderDetails_String("X-FORWARDED-FOR");
                    Logger log = new Logger(Request, "Incorrect Authorization Header : Empty" + GetRequestIP());
                    return false;
                }
            }
            else
            {
                AuthString = Request.Headers.Authorization.Parameter;
            }

            //Decrypt authstring 
            string usernamepassword = string.Empty;
            try
            {
                usernamepassword = Encoding.UTF8.GetString(Convert.FromBase64String(AuthString));
            }
            catch (Exception ex1)
            {
                Logger log1 = new Logger(Request, ex1);
                Logger log = new Logger(Request, "Incorrect Authorization Header : Not able to decrypt " + GetRequestIP());
                return false;
            }


            // Gets username and password  
            string username = string.Empty;
            string password = string.Empty;
            try
            {
                username = usernamepassword.Split(':')[0];
                password = usernamepassword.Substring(usernamepassword.IndexOf(":") + 1);
                if (username == string.Empty || password == string.Empty)
                {
                    Logger log = new Logger(Request, "Incorrect Authorization Header : Empty creadentials " + GetRequestIP());
                }
            }
            catch
            {
                Logger log = new Logger(Request, "Incorrect Authorization Header : Not able to split username and password " + GetRequestIP());
                return false;
            }

            //Check if GAVS or CUSTOMER
            if (IsGavs(username))
            {
                logintype = "gavs";
                // Validate username and password  
                if (password == string.Empty)
                {
                    if (!VaidateUser(username, out email, out empid, out DisplayName))
                    {
                        // returns unauthorized error  
                        Request.CreateResponse(HttpStatusCode.Unauthorized);
                        return false;
                    }
                }
                else if (!VaidateUser(username,  out email, out empid, out DisplayName))
                {
                    // returns unauthorized error  
                    Request.CreateResponse(HttpStatusCode.Unauthorized);
                    return false;
                }
            }
            else
            {
                logintype = "customer";
                //EXTERNAL CUSTOMER
                email = username;
                if (!VaidateCustomer(username, password, out DisplayName, out message))
                {
                    // returns unauthorized error  
                    Request.CreateResponse(HttpStatusCode.Unauthorized, " ( " + message + ")");
                    Logger log = new Logger(Request);
                    return false;
                }
            }

            return true;
        }

        private string GetAccessControls(string email, string empid, string logintype)
        {
            string access = string.Empty;
            List<APP_ACCESS_CONTROLS_MODEL> accessList = new List<APP_ACCESS_CONTROLS_MODEL>();
            if (logintype == "gavs" || logintype == "gslab")
            {
                if (string.IsNullOrWhiteSpace(empid))
                    throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Emp Id is not filled in the service call. Unable to proceed."));
                accessList = GetGavsAccessControls(empid);
            }
            else if (logintype == "customer")
            {
                accessList = GetCustomerAccessControls(email, empid);
            }

            access = Newtonsoft.Json.JsonConvert.SerializeObject(accessList);

            return access;
        }
        private List<APP_ACCESS_CONTROLS_MODEL> GetGavsAccessControls(string empId)
        {
            List<APP_ACCESS_CONTROLS_MODEL> AccessList = new List<APP_ACCESS_CONTROLS_MODEL>();
            EMP_INFO emp = Cldb.EMP_INFO.GetAll().SingleOrDefault(t => t.EMP_ID == empId);
            if (emp != null)
            {
                var strEmpId = emp.EMP_ID.ToString();
                //List<int> EmpAccessIds = CSPdb.APP_ACCESS_CONTROLS_DETAILS.GetAll().Where(t => t.ISACTIVE && t.VALUE == strEmpId && t.KEY == "EMP_ID").Select(t => t.APP_ACCESS_ID).ToList();
                //List<int> EmpAccessIds = new List<int>();
                List<APP_ACCESS_CONTROLS> access = CSPdb.APP_ACCESS_CONTROLS.GetAll().Where(t => t.ISACTIVE && (t.ROLE_ID == emp.CSM_TITLE_ID || t.EMP_ID.IndexOf(strEmpId) > -1)).ToList<APP_ACCESS_CONTROLS>();
                AccessList = GetAccessControlsModel(access, emp.EMP_ID.ToString());
            }
            return AccessList;
        }


        private List<APP_ACCESS_CONTROLS_MODEL> GetCustomerAccessControls(string emailId, string empId)
        {
            List<APP_ACCESS_CONTROLS> access = CSPdb.APP_ACCESS_CONTROLS.GetAll().Where(t => (t.ROLE_ID == 5 && string.IsNullOrEmpty(t.EMP_ID)) || (!string.IsNullOrEmpty(t.EMP_ID) && string.Compare(t.EMP_ID, emailId, StringComparison.InvariantCultureIgnoreCase) == 0))
                .ToList<APP_ACCESS_CONTROLS>();
            return GetAccessControlsModel(access, empId);
        }

        private List<APP_ACCESS_CONTROLS_MODEL> GetAccessControlsModel(List<APP_ACCESS_CONTROLS> access, string empId)
        {
            List<APP_ACCESS_CONTROLS_MODEL> AccessList = new List<APP_ACCESS_CONTROLS_MODEL>();
            List<int> AccessIds = access.Select(t => t.ID).ToList();
            List<APP_ACCESS_CONTROLS_DETAILS> details = CSPdb.APP_ACCESS_CONTROLS_DETAILS.GetAll().Where(t => AccessIds.Contains(t.APP_ACCESS_ID)).ToList();
            AccessList = access
                      .Select(o => new APP_ACCESS_CONTROLS_MODEL
                      {
                          ID = o.ID,
                          RESOURCE_ID = o.RESOURCE_ID,
                          ACCESS_LEVEL = o.ACCESS_LEVEL,
                          ROLE_ID = o.ROLE_ID,
                          CUST_ID = details.Where(t => t.ISACTIVE && t.APP_ACCESS_ID == o.RESOURCE_ID && t.KEY == "CUST_ID").Select(t => t.VALUE).ToList(),
                          PROJ_ID = details.Where(t => t.ISACTIVE && t.APP_ACCESS_ID == o.RESOURCE_ID && t.KEY == "PROJ_ID").Select(t => t.VALUE).ToList(),
                          EMP_ID = GetEmpIds(o, details, empId),//. ,
                          VIEW_ACCESS = o.VIEW_ACCESS,
                          CREATE_ACCESS = o.CREATE_ACCESS,
                          EDIT_ACCESS = o.EDIT_ACCESS,
                          DELETE_ACCESS = o.DELETE_ACCESS
                      }).ToList();

            var ts = AccessList.FirstOrDefault(x => x.RESOURCE_ID == 23 && x.ROLE_ID == 5);
            return AccessList;
        }

        private List<string> GetEmpIds(APP_ACCESS_CONTROLS c, List<APP_ACCESS_CONTROLS_DETAILS> details, string empId)
        {

            List<string> result = details.Where(t => t.ISACTIVE && t.APP_ACCESS_ID == c.RESOURCE_ID && t.KEY == "EMP_ID" && t.VALUE == empId).Select(t => t.VALUE).ToList();

            if (!string.IsNullOrWhiteSpace(c.EMP_ID))
            {
                result.AddRange(c.EMP_ID.Split(',').Select(x => x.Trim()));//.Where(x=>x == empId)
            }
            return result;
        }

        [GET("AuthenticateToken")]
        [ActionName("AuthenticateToken")]
        [HttpGet]
        public HttpResponseMessage AuthenticateUsingToken(string Token)
        {

            var watch = Stopwatch.StartNew();
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, "Authorized");
            string msg = string.Empty;
            if (VerifyToken(Token, out msg))
            {
                var token = new JwtSecurityToken(jwtEncodedString: Token);
                string EmailId = token.Claims.First(c => c.Type == "upn").Value.ToLower().Trim();
                EMP_INFO query = Cldb.EMP_INFO.GetAll().FirstOrDefault(t => t.DOR == null && string.Compare(t.EMAIL_ID, EmailId, StringComparison.InvariantCultureIgnoreCase) == 0);
                if (query != null)
                {
                    string DisplayName = token.Claims.First(c => c.Type == "name").Value;
                    FillResponse(response, query, DisplayName);
                }
                else
                {
                    response = Request.CreateResponse(HttpStatusCode.Unauthorized, "Email id is not matching with database");
                }
            }
            else
            {
                response = Request.CreateResponse(HttpStatusCode.Unauthorized, msg);
            }

            return response;
        }

        [POST("AuthenticateGoogleToken")]
        [ActionName("AuthenticateGoogleToken")]
        [HttpPost]
        public HttpResponseMessage AuthenticateGoogleToken(HttpRequestMessage request)
        {
            var watch = Stopwatch.StartNew();
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, "Authorized");
            string msg = string.Empty;
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;

            dynamic json = JsonConvert.DeserializeObject(jsonContent);

            if (json != null)
            {
                string email = json.email.ToString();
                if (!string.IsNullOrWhiteSpace(email))
                {
                    var query = Cldb.EMP_INFO.GetAll().FirstOrDefault(t => t.DOR == null && string.Compare(t.EMAIL_ID, email, StringComparison.InvariantCultureIgnoreCase) == 0);
                    if (query != null)
                    {
                        string displayName = query.FRST_NM;// token.Claims.First(c => c.Type == "name").Value;
                        FillResponse(response, query, displayName);
                    }
                    else
                    {
                        response = Request.CreateResponse(HttpStatusCode.Unauthorized, "Email id is not matching with database");
                    }
                }
                else
                {
                    response = Request.CreateResponse(HttpStatusCode.Unauthorized, "Unable to fetch Email Id");
                }
            }
            else
            {
                response = Request.CreateResponse(HttpStatusCode.Unauthorized, msg);
            }

            return response;
        }

        private void FillResponse(HttpResponseMessage response, EMP_INFO query, string displayName)
        {
            response.Headers.Add("Token", getAuthKey(query.EMAIL_ID));
            response.Headers.Add("Empid", query.EMP_ID);
            response.Headers.Add("EmailId", query.EMAIL_ID);

            response.Headers.Add("Role", query.CSM_TITLE_ID.ToString());

            response.Headers.Add("logintype", "gavs");
            response.Headers.Add("DisplayName", displayName);
            response.Headers.Add("access", GetAccessControls("", query.EMP_ID, "gavs"));
            response.Headers.Add("Access-Control-Expose-Headers", "Token,Empid,Role,logintype,DisplayName,access");

            Logger log = new Logger(response);
        }

        public bool VerifyToken(string Token, out string msg)
        {
            string _issuer = ConfigurationManager.AppSettings["TenantId"].ToLower();
            string _audience = ConfigurationManager.AppSettings["AppId"].ToLower();
            msg = string.Empty;
            bool isValid = true;
            var token = new JwtSecurityToken(jwtEncodedString: Token);
            string issuer = token.Claims.First(c => c.Type == "iss").Value.ToLower();
            string audience = token.Claims.First(c => c.Type == "aud").Value.ToLower();
            long epoch = Convert.ToInt64(token.Claims.First(c => c.Type == "exp").Value);
            DateTime dtExpiresOn = ToDateTimeFromEpoch(epoch).ToLocalTime();


            if (!issuer.Contains(_issuer))
            {
                msg = "Session details are not valid.";
                return false;
            }
            else if (audience != _audience)
            {
                msg = "Session details are not valid..";
                return false;
            }
            else if (dtExpiresOn < DateTime.Now)
            {

                //msg = "Your session has expired. Please log in again";
                //return false;
            }
            return isValid;
        }

        private DateTime ToDateTimeFromEpoch(long intDate)
        {
            var timeInTicks = intDate * TimeSpan.TicksPerSecond;
            return new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc).AddTicks(timeInTicks);
        }

        private string GetHeaderDetails_String(string key)
        {
            string sValue = string.Empty;
            if (Request.Headers.Contains(key))
                sValue = Request.Headers.GetValues(key).ToList()[0];
            return sValue;
        }
        private string GetRequestIP()
        {
            string ip = string.Empty;
            try { ip = HttpContext.Current.Request.UserHostAddress; }
            catch { }
            return "(" + ip + ")";
        }
        private bool IsValidUser(out string email, out string empid, out string DisplayName, out string logintype, out string message)
        {
            email = string.Empty;
            empid = string.Empty;
            logintype = string.Empty;
            DisplayName = string.Empty;
            message = string.Empty;
            if (Request.Headers.Authorization == null)
            {
                Request.CreateResponse(HttpStatusCode.Unauthorized);
                String ipAddress = GetHeaderDetails_String("X-FORWARDED-FOR");
                Logger log = new Logger(Request, "Incorrect Authorization Header : Null" + GetRequestIP());
                return false;
            }
            else
            {
                // Gets header parameters  
                string authenticationString = Request.Headers.Authorization.Parameter;
                string originalString = string.Empty;
                try
                {
                    originalString = Encoding.UTF8.GetString(Convert.FromBase64String(authenticationString));
                }
                catch
                {
                    originalString = authenticationString;
                    Logger log = new Logger(Request, "Incorrect Authorization Header : " + originalString + GetRequestIP());
                }

                // Gets username and password  
                string username = string.Empty;
                string password = string.Empty;
                try
                {
                    username = originalString.Split(':')[0];
                    password = originalString.Substring(originalString.IndexOf(":") + 1);
                    if (username == string.Empty || password == string.Empty)
                    {
                        Logger log = new Logger(Request, "Incorrect Authorization Header : Empty creadentials " + originalString + GetRequestIP());
                    }
                }
                catch
                {
                    Logger log = new Logger(Request, "Incorrect Authorization Header : " + originalString + GetRequestIP());
                }


                if (IsGavs(username))
                {
                    logintype = "gavs";
                    // Validate username and password  
                    if (password == string.Empty)
                    {
                        if (!VaidateUser(username, out email, out empid, out DisplayName))
                        {
                            // returns unauthorized error  
                            Request.CreateResponse(HttpStatusCode.Unauthorized);
                            return false;
                        }
                    }
                    else if (!VaidateUser(username,   out email, out empid, out DisplayName))
                    {
                        // returns unauthorized error  
                        Request.CreateResponse(HttpStatusCode.Unauthorized);
                        return false;
                    }
                }
                else
                {
                    logintype = "customer";
                    //EXTERNAL CUSTOMER
                    email = username;
                    if (!VaidateCustomer(username, password, out DisplayName, out message))
                    {
                        // returns unauthorized error  
                        Request.CreateResponse(HttpStatusCode.Unauthorized, " ( " + message + ")");
                        Logger log = new Logger(Request);

                        //Request.CreateResponse(HttpStatusCode.Unauthorized);
                        return false;
                    }
                }
            }
            return true;
        }

        private Boolean IsGavs(string emailid)
        {
            if (emailid.Contains("integration"))
                return false;
            if (!emailid.Contains("@"))
                return true;
            else if (emailid.ToUpper().EndsWith("@" + Constants.DOMAIN.ToUpper()))
                return true;
            else if (emailid.ToUpper().EndsWith("@GSLAB.COM"))
                return true;
            else if (emailid.ToUpper().EndsWith("@NEUREALM.COM"))
                return true;
            return false;
        }
        //protected bool VaidateUser(string strUsername, string strPassword, out string email, out string empid, out string DisplayName)
        //{
        //    bool isValid = false;
        //    email = string.Empty;
        //    empid = string.Empty;
        //    DisplayName = string.Empty;
        //    string strDomainName = Constants.DOMAIN;
        //    using (HostingEnvironment.Impersonate())
        //    {
        //        using (var context = new PrincipalContext(ContextType.Domain, strDomainName))
        //        {
        //            isValid = context.ValidateCredentials(strUsername, strPassword);
        //            if (isValid)
        //            {
        //                using (UserPrincipal user = UserPrincipal.FindByIdentity(context, strUsername))
        //                {
        //                    if (user != null)
        //                    {
        //                        DisplayName = user.DisplayName;
        //                        if (user.EmailAddress != null)
        //                        {
        //                            email = user.EmailAddress;
        //                            if (string.IsNullOrEmpty(user.EmployeeId))
        //                            {
        //                                var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMAIL_ID == user.EmailAddress && x.DOR.HasValue == false);
        //                                if (emp != null) empid = emp.EMP_ID.ToString();
        //                            }
        //                            else
        //                                empid = user.EmployeeId;
        //                        }
        //                        else
        //                        {
        //                            strUsername = strUsername.ToLower().Replace(Constants.DOMAIN, "");
        //                            email = strUsername + "@" + Constants.DOMAIN;
        //                        }
        //                        isValid = true;
        //                    }
        //                    else
        //                        isValid = false;
        //                }
        //            }
        //        }
        //    }
        //    return isValid;
        //}
        protected bool VaidateUser(string strUsername, out string email, out string empid, out string DisplayName)
        {
            bool isValid = false;
            email = string.Empty;
            empid = string.Empty;
            DisplayName = string.Empty;
           
            if (strUsername.StartsWith("xx"))
            {
                var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMAIL_ID == strUsername.Replace("xx", "") && !x.DOR.HasValue);
                if (emp != null)
                {
                    email = emp.EMAIL_ID;
                    DisplayName = emp.FRST_NM;
                    empid = emp.EMP_ID.ToString();
                    return true;
                }
            }
            string strDomainName = Constants.DOMAIN;
            //using (HostingEnvironment.Impersonate())
            //{
            using (var context = new PrincipalContext(ContextType.Domain, strDomainName))
            {
                using (UserPrincipal user = UserPrincipal.FindByIdentity(context, strUsername))
                {
                    if (user != null)
                    {
                        DisplayName = user.DisplayName;
                        if (user.EmailAddress != null)
                        {
                            email = user.EmailAddress;
                            var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMAIL_ID == user.EmailAddress && x.DOR.HasValue == false);
                            if (emp != null) empid = emp.EMP_ID.ToString();
                            //if (string.IsNullOrEmpty(user.EmployeeId))
                            //{
                            //    var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMAIL_ID == user.EmailAddress && x.DOR.HasValue == false);
                            //    if (emp != null) empid = emp.EMP_ID.ToString();
                            //}
                            //else
                            //    empid = user.EmployeeId;
                        }
                        else
                        {
                            strUsername = strUsername.ToLower().Replace("@" + Constants.DOMAIN, "");
                            email = strUsername + "@" + Constants.DOMAIN;
                            if (strUsername.ToLower() == "d365administrator")
                                empid = 199999.ToString();
                        }
                        isValid = true;
                    }
                    else
                        isValid = false;
                }
                //}
            }
            return isValid;
        }
        private string getAuthKey(string email)
        {
            string AuthKey = Guid.NewGuid().ToString();
            Token query = Cldb.Token.GetAll().FirstOrDefault(c => c.EMAILID == email);
            if (query != null)
            {
                DateTime ExpiresOn = query.EXPIRESON; //update
                if (ExpiresOn >= DateTime.Now)
                {
                    AuthKey = query.AUTHKEY;
                }
                else
                {
                    query.ISSUEDON = DateTime.Now;
                    query.AUTHKEY = AuthKey;
                    query.EXPIRESON = DateTime.Now.AddHours(1);
                    Cldb.Token.Update(query);
                    Cldb.Commit(CanCommit);
                }
            }
            else
            {
                //insert
                InsertNewAuthKey(AuthKey, email);
            }
            return AuthKey;
        }
        private void InsertNewAuthKey(string AuthKey, string email)
        {
            Token entry = new Token
            {
                EMAILID = email,
                AUTHKEY = AuthKey,
                ISSUEDON = DateTime.Now,
                EXPIRESON = DateTime.Now.AddHours(1)
            };

            Cldb.Token.Add(entry);
            Cldb.Commit(CanCommit);
        }
        #endregion

        #region CSP Customer Authentication
        [GET("AuthenticateCustomer")]
        [ActionName("AuthenticateCustomer")]
        [HttpGet]
        public HttpResponseMessage AuthenticateCustomer(HttpRequestMessage request)
        {

#pragma warning disable CS0219 // The variable 'customerid' is assigned but its value is never used
            string customerid = "0";
#pragma warning restore CS0219 // The variable 'customerid' is assigned but its value is never used
            string email = string.Empty;
            string message = string.Empty;
            string DisplayName = string.Empty;
            if (IsValidCustomer(out email, out DisplayName, out message))
            {
                string AuthKey = getAuthKey(email);
                var response = Request.CreateResponse(HttpStatusCode.OK, "Authorized");
                response.Headers.Add("token", AuthKey);
                response.Headers.Add("DisplayName", DisplayName);
                response.Headers.Add("access", GetAccessControls(email, "", "customer"));
                response.Headers.Add("Access-Control-Expose-Headers", "token,DisplayName,access");
                Logger log = new Logger(response);
                return response;
            }
            else
            {
                var response = Request.CreateResponse(HttpStatusCode.Unauthorized, message);
                Logger log = new Logger(response);
                return response;
            }
        }

        [GET("PasswordForgot")]
        [ActionName("PasswordForgot")]
        [HttpGet]
        public IHttpActionResult PasswordForgot(string EmailId)
        {
            string msg = string.Empty;
            var dbData = CSPdb.CUSTOMER_USERS.GetAll().Where(t => t.EMAILID.ToUpper() == EmailId.ToUpper()).FirstOrDefault<CUSTOMER_USERS>();
            if (dbData != null)
            {
                if (string.IsNullOrWhiteSpace(dbData.ACTIVATION_CODE))

                    return Content(HttpStatusCode.Conflict, "Email id is not activated in CSM Platform, please contact GAVS team to get access.");
                var url = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("forgotpassword", "");
                string siteurl = url + "setpassword/" + dbData.EMAILID + "/" + Security.HashSHA1(dbData.ACTIVATION_CODE);
                SendMail_PasswordReset(EmailId, siteurl, dbData.DISPLAY_NAME);
                msg = "Please check your mail for password reset link.";
            }
            else
            {
                return Content(HttpStatusCode.Unauthorized, "Email id not found in our database, please contact GAVS team to get access.");
            }

            return Ok(msg);
        }

        [POST("VeriftyActivationCode")]
        [ActionName("VeriftyActivationCode")]
        [HttpPost]
        public IHttpActionResult VeriftyActivationCode(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;

            dynamic json = jsonContent;

            CUSTOMER_USERS inputData = JsonConvert.DeserializeObject<CUSTOMER_USERS>(json);
            CUSTOMER_USERS dbData = CSPdb.CUSTOMER_USERS.GetAll().Where(t => t.EMAILID.ToUpper() == inputData.EMAILID.ToUpper()).FirstOrDefault<CUSTOMER_USERS>();
            if (dbData != null && inputData != null)
            {
                if (inputData.PASSWORD == string.Empty)
                    return Content(HttpStatusCode.BadRequest, "Incorrect Activation code");
                else if (Security.HashSHA1(dbData.ACTIVATION_CODE) == inputData.ACTIVATION_CODE)
                    return Ok("Valid Activiation code");
                else
                    return Content(HttpStatusCode.BadRequest, "Incorrect Activation code");
            }
            else
            {
                return Content(HttpStatusCode.BadRequest, "Incorrect Activation code");
            }
        }

        [POST("SetPassword")]
        [ActionName("SetPassword")]
        [HttpPost]
        public IHttpActionResult SetPassword(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;

            dynamic json = jsonContent;

            CUSTOMER_USERS inputData = JsonConvert.DeserializeObject<CUSTOMER_USERS>(json);
            CUSTOMER_USERS dbData = CSPdb.CUSTOMER_USERS.GetAll().Where(t => t.EMAILID.ToUpper() == inputData.EMAILID.ToUpper()).FirstOrDefault<CUSTOMER_USERS>();
            if (dbData != null && inputData != null)
            {
                if (inputData.PASSWORD == string.Empty)
                    return Content(HttpStatusCode.BadRequest, "Password cannot be empty");
                else
                {
                    dbData.USER_GUID = Guid.NewGuid().ToString();
                    //dbData.PASSWORD = GetHashString(inputData.PASSWORD, dbData.USER_GUID);
                    dbData.PASSWORD = GetHashString(inputData.PASSWORD);
                    //dbData.ACTIVATION_CODE = Guid.NewGuid().ToString();
                    //dbData.ACTIVATION_VALIDITY = DateTime.Now;
                    dbData.ISVERIFIED = true;
                    dbData.UPDATED_BY = inputData.UPDATED_BY;
                    dbData.UPDATED_DATE = DateTime.Now;
                    CSPdb.CUSTOMER_USERS.Update(dbData);
                    CSPdb.Commit(CanCommit);
                    //string apipath = Request.RequestUri.GetLeftPart(UriPartial.Authority) + "/api/AllSys/ActivateUser?email=" + dbData.EMAILID + "&code=" + Security.HashSHA1(dbData.ACTIVATION_CODE);
                    //string siteurl = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("login", "activation/" + dbData.EMAILID + "/" + Security.HashSHA1(dbData.ACTIVATION_CODE));
                    //SendMail_VerificationLink(inputData.EMAILID, siteurl);
                }
            }
            else
                return Content(HttpStatusCode.Unauthorized, "Email address not found, please check with GAVS");

            return Ok("Password Updated Successfully");
        }


        [POST("ActivateUser")]
        [ActionName("ActivateUser")]
        [HttpPost]
        public IHttpActionResult ActivateUser(string email, string code)
        {
            CUSTOMER_USERS dbData = CSPdb.CUSTOMER_USERS.GetAll().Where(t => t.EMAILID.ToUpper() == email.ToUpper()).FirstOrDefault<CUSTOMER_USERS>();
            if (dbData != null && Security.HashSHA1(dbData.ACTIVATION_CODE) == code)
            {
                if (dbData.ISVERIFIED)
                    return Ok("Email already verified");
                else
                {
                    dbData.ISVERIFIED = true;
                    dbData.UPDATED_BY = email;
                    dbData.UPDATED_DATE = DateTime.Now;
                    CSPdb.CUSTOMER_USERS.Update(dbData);
                    CSPdb.Commit(CanCommit);
                }
            }
            else
                return Content(HttpStatusCode.BadRequest, "Invalid activation code please check with GAVS");
            return Ok("Activation successfull");
        }

        private bool IsValidCustomer(out string email, out string DisplayName, out string message)
        {
            message = string.Empty;
            email = string.Empty;
            DisplayName = string.Empty;

            if (Request.Headers.Authorization == null)
            {
                Request.CreateResponse(HttpStatusCode.Unauthorized);
                return false;
            }
            else
            {
                // Gets header parameters  
                string authenticationString = Request.Headers.Authorization.Parameter;
                string originalString = string.Empty;
                try
                {
                    originalString = Encoding.UTF8.GetString(Convert.FromBase64String(authenticationString));
                }
                catch
                {
                    originalString = authenticationString;
                }

                // Gets username and password  
                string usrename = originalString.Split(':')[0];
                //string password = originalString.Split(':')[1];
                string password = originalString.Substring(originalString.IndexOf(":") + 1);
                email = usrename;

                // Validate username and password  
                if (!VaidateCustomer(usrename, password, out DisplayName, out message))
                {
                    // returns unauthorized error  
                    Request.CreateResponse(HttpStatusCode.Unauthorized);
                    return false;
                }
            }
            return true;
        }
        protected bool VaidateCustomer(string emailid, string password, out string DisplayName, out string errMsg)
        {

            DisplayName = string.Empty;
            var emailUpper = emailid.ToUpper();
            CUSTOMER_USERS overview = CSPdb.CUSTOMER_USERS.GetAll().Where(t => t.EMAILID.ToUpper() == emailUpper).FirstOrDefault<CUSTOMER_USERS>();

            if (overview != null)
            {

                bool isProd;
                bool.TryParse(ConfigurationManager.AppSettings["IsProd"], out isProd);
                if (!isProd)
                {
                    errMsg = "Authorized";
                    DisplayName = overview.DISPLAY_NAME;
                    return true;
                }
                if ((overview.PASSWORD == null || overview.PASSWORD == string.Empty) && !overview.ISVERIFIED)
                {
                    errMsg = "Password is not set, please use the link send to you by GAVS team, or please request again.";
                    return false;
                }
                //else if (overview.PASSWORD != GetHashString(password, overview.USER_GUID) )
                else if (!(overview.PASSWORD == GetHashString(password, overview.USER_GUID) || overview.PASSWORD == GetHashString(password)))
                {
                    errMsg = "Incorrect password";
                    return false;
                }
                else
                {
                    errMsg = "Authorized";
                    DisplayName = overview.DISPLAY_NAME;
                    return true;
                }
            }
            else
            {
                errMsg = "Incorrect Email address";
                return false;
            }
        }

        private string GetHashString(string password, string guid)
        {
            return Security.HashSHA1(password + guid);
        }
        private string GetHashString(string password)
        {
            return Security.HashSHA1(password);
        }
        //private void SendMail_VerificationLink(string emailid, string baseUrl)
        //{
        //    string emailContent = "<h2>Please click the below link to verify your mail id</h2>";
        //    emailContent += "<a href='" + baseUrl + "'>" + baseUrl + "</a>";
        //    EmailProvider ep = new WebApi.EmailProvider();
        //    ep.SendEmail
        //        (
        //        new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = email, smtpHost = "smtp.office365.com", smtpPassword = pass, smtpPortValue = "587" },
        //        new EmailContent { from = "roopsundar.venkat@gavstech.com", to = emailid, cc = "", content = emailContent, subject = "Email Activation", hasAttachments = false, attachmentFilePath = "" }
        //        );
        //}
        private void SendMail_PasswordReset(string emailid, string baseUrl, string customerName)
        {

            //CONTENT
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("UserName", customerName);
            EmailContentValues.Add("Link", baseUrl);

            var emailContent = helper.GetEmailContent("PasswordReset.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = ServiceEmail, smtpHost = "smtp.office365.com", smtpPassword = ServicePassword, smtpPortValue = "587" },
                new EmailContent { from = Constants.QUALITY_MAIL, to = emailid, cc = "", content = emailContent, subject = "GAVS CSM Portal Password reset", hasAttachments = false, attachmentFilePath = "" }, Request
                );
        }
        private void SendMail_PasswordCreation(string emailid, string baseUrl, string customerName)
        {
            //CONTENT
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("UserName", customerName);
            EmailContentValues.Add("Link", baseUrl);

            var emailContent = helper.GetEmailContent("PasswordReset.htm", EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = ServiceEmail, smtpHost = "smtp.office365.com", smtpPassword = ServicePassword, smtpPortValue = "587" },
                new EmailContent { from = Constants.QUALITY_MAIL, to = emailid, cc = "", content = emailContent, subject = "GAVS CSM Portal Create Password", hasAttachments = false, attachmentFilePath = "" }, Request
                );
        }
        #endregion


    }
    public class Security
    {
        public static string HashSHA1(string value)
        {
            var sha1 = System.Security.Cryptography.SHA1.Create();
            var inputBytes = Encoding.ASCII.GetBytes(value);
            var hash = sha1.ComputeHash(inputBytes);

            var sb = new StringBuilder();
            for (var i = 0; i < hash.Length; i++)
            {
                sb.Append(hash[i].ToString("X2"));
            }
            return sb.ToString();
        }
    }

    public class OidcTokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; }
        [JsonProperty("refreshToken")]
        public string RefeshToken { get; set; }
        [JsonProperty("token_type")]
        public string TokenType { get; set; }
        [JsonProperty("expires_in")]
        public string ExpiresIn { get; set; }

        public bool Success { get; set; }
        public string Message { get; set; }
    }
}