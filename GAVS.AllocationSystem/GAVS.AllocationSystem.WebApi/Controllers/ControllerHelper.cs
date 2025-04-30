using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Base;
using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class ControllerHelper
    {
        public string _dateformat = "dd-MMM-yyyy";


        protected string _email;
        protected string _password;
        private ICloudDB Cldb { get; set; }
        private ICSPDB CSPdb { get; set; }
        public ControllerHelper(ICloudDB cldb, ICSPDB cspdb)
        {
            Cldb = cldb;
            CSPdb = cspdb;
            _email = ConfigurationManager.AppSettings["emailid"];
            _password = ConfigurationManager.AppSettings["emailpassword"];
            //_csmSupportMail = ConfigurationManager.AppSettings["SupportMail"];
        }

        public List<EMP_INFO> GetCSMFromProject(string projId)
        {
            //List<int> emp = new List<int>();
            List<EMP_INFO> emplist = new List<EMP_INFO>();
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
            return GetCSMFromProject(project);
            //EMP_INFO empinfo = new EMP_INFO();
            //List<PROJECT_RESOURCE> resource = new List<PROJECT_RESOURCE>();
            //resource = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.PROJ_ID == projId && t.CURR_INDC == "Y" && t.END_DATE > DateTime.Now).ToList();
            //if(!resource.Any())
            //    resource = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.PROJ_ID == projId   && t.END_DATE > DateTime.Now).ToList();
            //emp = resource.Select(t => t.EMP_ID).Distinct().ToList<int>();
            //foreach (int i in emp)
            //{
            //    empinfo = Cldb.EMP_INFO.GetAll().Where(t => t.EMP_ID == i && t.CSM_TITLE_ID == 1).FirstOrDefault();
            //    if (empinfo != null && !emplist.Contains(empinfo))
            //        emplist.Add(empinfo);
            //}
            //return emplist;
        }

        public List<EMP_INFO> GetCSMFromProject(PROJECT project)
        {
            //List<int> emp = new List<int>();
            List<EMP_INFO> emplist = new List<EMP_INFO>();

            if (project != null && project.PROJ_DM_EMP_ID != "")
            {
                var csm = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == project.PROJ_DM_EMP_ID);
                if (csm != null)
                    emplist.Add(csm);
            }
            //EMP_INFO empinfo = new EMP_INFO();
            //List<PROJECT_RESOURCE> resource = new List<PROJECT_RESOURCE>();
            //resource = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.PROJ_ID == projId && t.CURR_INDC == "Y" && t.END_DATE > DateTime.Now).ToList();
            //if(!resource.Any())
            //    resource = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.PROJ_ID == projId   && t.END_DATE > DateTime.Now).ToList();
            //emp = resource.Select(t => t.EMP_ID).Distinct().ToList<int>();
            //foreach (int i in emp)
            //{
            //    empinfo = Cldb.EMP_INFO.GetAll().Where(t => t.EMP_ID == i && t.CSM_TITLE_ID == 1).FirstOrDefault();
            //    if (empinfo != null && !emplist.Contains(empinfo))
            //        emplist.Add(empinfo);
            //}
            return emplist;
        }

        public List<EMP_INFO> GetEmpInfoFromProject(string ProjId, int RoleId)
        {


            List<string> empids = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.PROJ_ID == ProjId && t.CURR_INDC == "Y").Select(t => t.EMP_ID).ToList();

            var empinfo = Cldb.EMP_INFO.GetAll().Where(t => empids.Contains(t.EMP_ID) && t.CSM_TITLE_ID == RoleId && t.DOR == null).ToList();



            return empinfo;
        }
        public string GetCSMNamesFromProject(string projId)
        {
            string names = string.Empty;
            List<EMP_INFO> csm = GetCSMFromProject(projId);
            if (csm != null && csm.Count > 0)
            {
                names = string.Join(", ", csm.Select(t => t.FRST_NM).ToArray());
            }
            names = names.Trim().Trim(','); ;
            return names;
        }
        public string GetCSMNamesFromProject(PROJECT project)
        {
            string names = string.Empty;
            List<EMP_INFO> csm = GetCSMFromProject(project);
            if (csm != null && csm.Count > 0)
            {
                names = string.Join(", ", csm.Select(t => t.FRST_NM).ToArray());
            }
            names = names.Trim().Trim(','); ;
            return names;
        }
        public string GetCSMMailsFromProject(string projId)
        {
            string emails = string.Empty;
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
            return GetCSMMailsFromProject(project);

        }

        public string GetCSMMailsFromSelectedProjects(List<string> projectIds)
        {
            if (projectIds == null || !projectIds.Any())
                return string.Empty;


            var csmIds = Cldb.PROJECT.GetAll().Where(x => projectIds.Contains(x.PROJ_ID)).Select(x => x.PROJ_DM_EMP_ID).ToList();
            var csmEmails = Cldb.EMP_INFO.GetAll().Where(x => csmIds.Contains(x.EMP_ID) && x.DOR == null).Select(x => x.EMAIL_ID).ToList();
            return string.Join(",", csmEmails);
        }

        public string GetPMMailsFromSelectedProjects(List<string> projectIds)
        {
            if (projectIds == null || !projectIds.Any())
                return string.Empty;

            var pmIds = Cldb.PROJECT.GetAll().Where(x => projectIds.Contains(x.PROJ_ID)).Select(x => x.PROJ_PM_EMP_ID).ToList();
            var pmEmails = Cldb.EMP_INFO.GetAll().Where(x => pmIds.Contains(x.EMP_ID)).Select(x => x.EMAIL_ID).ToList();
            return string.Join(",", pmEmails);

        }

        [Obsolete("DO not use this method. Affecting Performance due to multiple DB calls.")]
        public string GetCSMMailsFromProduct(int prodId)
        {
            string emails = string.Empty;
            var product = CSPdb.PRODUCT_RESPONSIBLE.GetAll().FirstOrDefault(x => x.PRODUCT_ID == prodId && x.MANAGEMENT_TYPE == 3 && x.ISACTIVE);

            if (product != null && product.EMP_ID != "0")
            {
                var csm = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == product.EMP_ID);
                if (csm != null)
                    return csm.EMAIL_ID;
            }

            return emails;
            //return GetCSMMailsFromProject(project);

        }

        [Obsolete("DO not use this method. Affecting Performance due to multiple DB calls.")]
        public string GetPortfolioLeadMailsFromProduct(int prodId)
        {
            string emails = string.Empty;
            var product = CSPdb.PRODUCT_RESPONSIBLE.GetAll().FirstOrDefault(x => x.PRODUCT_ID == prodId && x.MANAGEMENT_TYPE == 2 && x.ISACTIVE);

            if (product != null && product.EMP_ID != "0")
            {
                var csm = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == product.EMP_ID);
                if (csm != null)
                    return csm.EMAIL_ID;
            }

            return emails;
            //return GetCSMMailsFromProject(project);

        }

        public List<Tuple<string, string>> GetProductResponsiblePersonDetails(int prodId, int managementType)
        {
            var result = new List<Tuple<string, string>>();
            var product = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == prodId && x.MANAGEMENT_TYPE == managementType && x.ISACTIVE).ToList();

            if (product.Any())
            {
                var empIds = product.Select(x => x.EMP_ID).ToList();
                var emps = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID)).ToList();
                foreach (var item in emps)
                {
                    result.Add(new Tuple<string, string>(item.EMAIL_ID, item.FRST_NM));
                }

            }

            return result;


        }

        public List<string> GetprojectIdsFromProduct(int prodId)
        {
            var result = new List<string>();
            var product = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == prodId && x.MANAGEMENT_TYPE == 7 && x.ISACTIVE).ToList();

            if (product.Any())
            {

                result.AddRange(product.Select(x => x.PROJECT_ID).ToList());

            }

            return result;


        }

        internal bool IsQuality(string empId)
        {
            var employee = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.DOR == null && x.EMP_ID == empId);
            if (employee == null) return false;
            return employee.CSM_TITLE_ID == 7;
        }

        public List<string> GetCSMMailsFromAccount(string cust_id)
        {
            string emails = string.Empty;
            var csms = Cldb.PROJECT.GetAll().Where(x => x.CUST_ID == cust_id).Select(x => x.PROJ_DM_EMP_ID).Distinct().ToList();
            return GetEmployeeMailIdList(csms);

        }
        public List<string> GetPMMailsFromAccount(string cust_id)
        {
            string emails = string.Empty;
            var csms = Cldb.PROJECT.GetAll().Where(x => x.CUST_ID == cust_id && x.PROJ_STATUS != "close").Select(x => x.PROJ_PM_EMP_ID).Distinct().ToList();
            return GetEmployeeMailIdList(csms);

        }
        public List<string> GetAMMailsFromAccount(string cust_id)
        {
            string emails = string.Empty;
            var csms = Cldb.PROJECT.GetAll().Where(x => x.CUST_ID == cust_id).Select(x => x.PROJ_AM_EMP_ID).Distinct().ToList();
            return GetEmployeeMailIdList(csms);

        }
        public List<string> GetQualitySPOCMailsFromAccount(string cust_id)
        {
            string emails = string.Empty;
            var csms = Cldb.PROJECT.GetAll().Where(x => x.CUST_ID == cust_id).Select(x => x.QUALITY_SPOC).Distinct().ToList();
            return GetEmployeeMailIdList(csms);

        }
        public string GetCSMMailsFromProject(PROJECT project)
        {
            string emails = string.Empty;
            if (project != null && project.PROJ_DM_EMP_ID != "")
            {
                var csm = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == project.PROJ_DM_EMP_ID && x.DOR == null);
                if (csm != null)
                    return csm.EMAIL_ID;
            }

            return emails;
        }
        public string GetPMMailsFromProject(string projId)
        {
            string emails = string.Empty;
            List<string> lst = GetPMFromProject(projId);
            if (lst != null && lst.Count > 0)
            {
                emails = string.Join(",", lst);
            }
            emails = emails.Trim().Trim(','); ;
            return emails;
        }
        public string GetPMMailsFromProject(PROJECT project)
        {
            string emails = string.Empty;
            List<string> lst = GetPMFromProject(project);
            if (lst != null && lst.Count > 0)
            {
                emails = string.Join(",", lst);
            }
            emails = emails.Trim().Trim(','); ;
            return emails;
        }

        public string GetCustomerContactMailsFromProject(PROJECT project)
        {
            string customerContactemails = string.Empty;
            List<int> customerContacts;
            if (project != null && project.PROJ_DM_EMP_ID != "")
            {
                customerContacts = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(x => x.PROJ_ID == project.PROJ_ID && x.REPORTING).Select(t => t.CUSTOMER_USER_ID).ToList();

                var mails = CSPdb.CUSTOMER_USERS.GetAll().Where(x => customerContacts.Contains(x.ID)).Select(t => t.EMAILID).ToArray();

                customerContactemails = string.Join(",", mails);

            }

            return customerContactemails;

        }

        public string ConcatEmails(List<string> EmailList)
        {
            return string.Join(",", EmailList.Where(x => !string.IsNullOrWhiteSpace(x)).ToList());
            //string emails = string.Empty;
            //foreach (string s in EmailList)
            //{
            //    string str = s.Trim().Trim(',');
            //    if (!string.IsNullOrWhiteSpace(str))
            //    {
            //        emails = emails + "," + str;
            //    }
            //}
            //emails = emails.Trim().Trim(','); ;
            //return emails;
        }

        public List<string> GetPMFromProject(string projId)
        {
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
            return GetPMFromProject(project);
        }

        public List<EMP_INFO> GetPMEmpInfoFromProject(string projId)
        {
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
            return Cldb.EMP_INFO.GetAll().Where(x => x.EMP_ID == project.PROJ_PM_EMP_ID).ToList();
        }
        public List<EMP_INFO> GetCSMEmpInfoFromProject(string projId)
        {
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
            return Cldb.EMP_INFO.GetAll().Where(x => x.EMP_ID == project.PROJ_DM_EMP_ID).ToList();
        }

        public List<EMP_INFO> GetBUHEADFromProject(string projId)
        {
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
            return Cldb.EMP_INFO.GetAll().Where(x => x.EMP_ID == project.PROJ_BUHEAD_EMP_ID).ToList();
        }

        public List<EMP_INFO> GetAMEmpInfoFromProject(string projId)
        {
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
            return Cldb.EMP_INFO.GetAll().Where(x => x.EMP_ID == project.PROJ_AM_EMP_ID).ToList();
        }

        public List<string> GetPMFromProject(PROJECT project)
        {
            List<string> emplist = new List<string>();

            if (project != null && project.PROJ_PM_EMP_ID != "")
            {
                var pm = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == project.PROJ_PM_EMP_ID);
                if (pm != null)
                    emplist.Add(pm.EMAIL_ID);
            }

            return emplist;
        }

        public string GetAMFromProject(string projId)
        {
            PROJECT proj = Cldb.PROJECT.GetAll().FirstOrDefault(t => t.PROJ_ID == projId);
            return GetAMFromProject(proj);
        }

        public string GetAMFromProject(PROJECT proj)
        {
            string PROJ_AM_EMAIL_ID = string.Empty;


            if (proj != null && proj.PROJ_AM_EMP_ID != null)
            {
                EMP_INFO emp = Cldb.EMP_INFO.GetById(proj.PROJ_AM_EMP_ID);
                if (emp != null)
                {
                    PROJ_AM_EMAIL_ID = emp.EMAIL_ID;
                }
            }

            return PROJ_AM_EMAIL_ID;
        }
        public string GetEmployeeMailId(string empId, IList<EMP_INFO> empList = null)
        {
            EMP_INFO empInfo = null;
            if (empList == null)
                empInfo = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId);
            else
                empInfo = empList.FirstOrDefault(x => x.EMP_ID == empId);
            if (empInfo == null) return string.Empty;
            return empInfo.EMAIL_ID;
        }

        public string GetEmployeeName(string empId)
        {
            //var empIdInt = 0;
            //if (int.TryParse(empId, out empIdInt))

            var empInfo = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId);
            if (empInfo == null) return string.Empty;
            return empInfo.FRST_NM;

        }
        public List<string> GetEmployeeMailIdList(IList<string> empIds)
        {


            return Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID) && x.DOR == null).Select(x => x.EMAIL_ID).ToList();

        }
        public string GetQualitySpocMailForProject(string projId, bool returnGroupId = true)
        {
            PROJECT proj = Cldb.PROJECT.GetAll().FirstOrDefault(t => t.PROJ_ID == projId);
            return GetQualitySpocMailForProject(proj, returnGroupId);

        }

        public string GetQualitySpocMailForProject(PROJECT project, bool returnGroupId = true)
        {

            if (project != null && project.QUALITY_SPOC != "")
            {
                var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == project.QUALITY_SPOC && x.DOR == null);
                if (emp != null) return emp.EMAIL_ID; else return Constants.QUALITY_MAIL;
            }
            if (returnGroupId)
                return Constants.QUALITY_MAIL;
            else return string.Empty;

        }
        public List<string> getProjectResposnibleMailIds(PROJECT project, bool csm, bool pm, bool qSpoc)
        {
            var empList = new List<string>();
            if (project == null) return empList;
            if (csm)
                empList.Add(project.PROJ_DM_EMP_ID);
            if (pm)
                empList.Add(project.PROJ_PM_EMP_ID);
            if (qSpoc && !string.IsNullOrWhiteSpace(project.QUALITY_SPOC))
                empList.Add(project.QUALITY_SPOC);
            var emp = Cldb.EMP_INFO.GetAll().Where(x => empList.Contains(x.EMP_ID) && x.DOR == null).ToList();
            return emp.Select(x => x.EMAIL_ID).ToList();

        }

        [Obsolete("DO not use this method. Affecting Performance due to multiple DB calls.")]
        public string GetQualitySpocMailForProduct(int prodId, bool returnGroupId = true)
        {

            var product = CSPdb.PRODUCT_RESPONSIBLE.GetAll().FirstOrDefault(x => x.PRODUCT_ID == prodId && x.MANAGEMENT_TYPE == 4 && x.ISACTIVE);

            if (product != null)
            {
                var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == product.EMP_ID && x.DOR == null);
                if (emp != null) return emp.EMAIL_ID; else return Constants.PREMIER_QUALITY_TEAM;
            }
            if (returnGroupId)
                return Constants.PREMIER_QUALITY_TEAM;
            else return string.Empty;

        }

        [Obsolete("DO not use this method. Affecting Performance due to multiple DB calls.")]
        public string GetQualitySpocNameForProduct(int prodId, bool returnGroupId = true)
        {

            var product = CSPdb.PRODUCT_RESPONSIBLE.GetAll().FirstOrDefault(x => x.PRODUCT_ID == prodId && x.MANAGEMENT_TYPE == 4 && x.ISACTIVE);

            if (product != null)
            {
                var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == product.EMP_ID && x.DOR == null);
                if (emp != null) return emp.FRST_NM; else return "Team";
            }
            if (returnGroupId)
                return Constants.PREMIER_QUALITY_TEAM;
            else return string.Empty;

        }

        [Obsolete("DO not use this method. Affecting Performance due to multiple DB calls.")]
        public List<string> GetPMMailsFromProduct(int prodId)
        {
            string emails = string.Empty;
            var pms = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == prodId && x.MANAGEMENT_TYPE == 1 && x.ISACTIVE).Select(x => x.EMP_ID).Distinct().ToList();
            return GetEmployeeMailIdList(pms);
        }

        [Obsolete("DO not use this method. Affecting Performance due to multiple DB calls.")]
        public List<string> GetPMNamesFromProduct(int prodId)
        {
            string emails = string.Empty;
            var pms = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == prodId && x.MANAGEMENT_TYPE == 1 && x.ISACTIVE).Select(x => x.EMP_ID).Distinct().ToList();
            return GetEmployeeNameList(pms);
        }


        public List<string> GetEmployeeNameList(IList<string> empIds)
        {
            return Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID) && x.DOR == null).Select(x => x.FRST_NM).ToList();
        }

        public List<EMP_INFO> GetEmployeeList(IList<string> empIds)
        {
            return Cldb.EMP_INFO.GetAll().Where(x => (empIds.Contains(x.EMP_ID) || empIds.Contains(x.EMP_ID_NEW)) && x.DOR == null).ToList();
        }
        public void UpdateDBConfig(string sKey, string CustId, string value)
        {
            CONFIGURATION_EXT config = Cldb.CONFIGURATION_EXT.GetAll().Where(t => t.KEY == sKey && t.CUST_ID == CustId).FirstOrDefault();
            if (config != null)
            {
                config.VALUE = value;
                Cldb.CONFIGURATION_EXT.Update(config);
                Cldb.Commit();
            }
        }

        public string GetDBConfig(string sKey, string CustId, string projId = "")
        {
            var config = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(t => t.KEY == sKey && t.CUST_ID == CustId && t.PROJ_ID == projId);

            if (config == null)
                config = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(t => t.KEY == sKey && t.CUST_ID == CustId);

            if (config == null)
                config = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(t => t.KEY == sKey && t.CUST_ID == "-1");

            if (config == null)
                config = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(t => t.KEY == sKey);

            return GetDBConfigValue(config);
        }
        public string GetDBConfigValue(CONFIGURATION_EXT config)
        {
            string val = string.Empty;
            if (config != null)
            {
                if (config.ISENCRYPT)
                    val = Encoding.UTF8.GetString(Convert.FromBase64String(config.VALUE));
                else
                    val = config.VALUE;
            }
            return val;

        }

        public List<int> GetDBConfig(List<string> sKey, string CustId)
        {
            var config = Cldb.CONFIGURATION_EXT.GetAll().Where(t => sKey.Contains(t.KEY) && t.CUST_ID == CustId).ToList();
            return GetDBConfigValueInt(config);
        }
        public List<int> GetDBConfigValueInt(List<CONFIGURATION_EXT> configurationList)
        {
            var configVal = new List<int>();
            int configval = 0;
            string val = string.Empty;
            if (configurationList != null)
            {
                foreach (var config in configurationList)
                {
                    if (config.ISENCRYPT)
                        val = Encoding.UTF8.GetString(Convert.FromBase64String(config.VALUE));
                    else
                        val = config.VALUE;

                    configVal.Add(int.TryParse(val, out configval) ? configval : 0);
                }
            }
            return configVal;

        }
        private int GetDBConfigValueInt(CONFIGURATION_EXT config)
        {
            string val = string.Empty;
            int configval = 0;
            if (config != null)
            {
                if (config.ISENCRYPT)
                    val = Encoding.UTF8.GetString(Convert.FromBase64String(config.VALUE));
                else
                    val = config.VALUE;
            }
            return int.TryParse(val, out configval) ? configval : 0; //change to int.tryparse
        }
        public string GetEmailContent(string TemplateFileName, Dictionary<string, string> values)
        {
            string emailContent = string.Empty;
            string filePath = HttpContext.Current.Server.MapPath("~/UploadFile/Mails/") + TemplateFileName;
            using (System.IO.StreamReader sr = new StreamReader(filePath))
            {
                emailContent = sr.ReadToEnd();
                foreach (KeyValuePair<string, string> kvp in values)
                {
                    emailContent = emailContent.Replace("{{" + kvp.Key + "}}", kvp.Value);
                }
            }
            return emailContent;
        }

        public List<PROJECT_CONFIGURATION_DATA> GetProjectConfigurationDataForSetting(string setting)
        {
            var skipId = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().FirstOrDefault(x => x.Setting_Key.ToUpper() == setting.ToUpper())?.Id;
            var projectstoSkipBySettings = new List<PROJECT_CONFIGURATION_DATA>();
            if (skipId.HasValue)
                projectstoSkipBySettings = CSPdb.PROJECT_CONFIGURATION_DATA.GetAll()
                    .Where(x => x.Configuration_Setting_Id == skipId.Value && x.Is_Approved == true && (x.End_date.HasValue == false || x.End_date.Value > DateTime.Today)).ToList();

            return projectstoSkipBySettings;
        }

        internal PROJECT_CONFIGURATION_DATA GetProjectConfigurationDataForSetting(string setting, string projId)
        {
            var skipId = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().FirstOrDefault(x => x.Setting_Key.ToUpper() == setting.ToUpper())?.Id;
            var result = new PROJECT_CONFIGURATION_DATA();
            if (skipId.HasValue)
            {
                var projectstoSkipBySettings = CSPdb.PROJECT_CONFIGURATION_DATA.GetAll()
                      .FirstOrDefault(x => x.Proj_Id == projId && x.Configuration_Setting_Id == skipId.Value && x.Is_Approved == true && (x.End_date.HasValue == false || x.End_date.Value > DateTime.Today));

                if (projectstoSkipBySettings != null)
                    return projectstoSkipBySettings;
            }
            return result;
        }

        public string GetEmployeeNames(IList<string> empIds)
        {
            var empIdInt = 0;
            List<string> isValidEmpId = new List<string>();
            if (empIds.Count > 0)
            {
                foreach (var empId in empIds)
                {
                    //if (int.TryParse(empId, out empIdInt))
                    //{
                    isValidEmpId.Add(empId);
                    //}
                }

                var empInfo = Cldb.EMP_INFO.GetAll().Where(x => isValidEmpId.Contains(x.EMP_ID) && x.DOR == null).Select(x => x.FRST_NM);
                if (empInfo == null) return string.Empty;
                return string.Join(",", empInfo);
            }

            return string.Empty;
        }

        public string GetAbsoulteUri()
        {
            try
            {
                return $"{HttpContext.Current.Request.UrlReferrer.Scheme}://{HttpContext.Current.Request.UrlReferrer.Authority}";
            }
            catch
            {
                bool isProd = false;
                bool.TryParse(ConfigurationManager.AppSettings["IsProd"], out isProd);
                if (isProd)
                    return $"https://csm.{Constants.DOMAIN}/";
                else
                    return $"https://csmuat.{Constants.DOMAIN}/";
            }

        }

        internal List<CSS_BATCH_CUSTOMERS_EXTENDED> FillCustomerAndProjectNames(List<CSS_BATCH_CUSTOMERS> batches)
        {
            List<string> CustIds = batches.Select(t => t.CUST_ID).Distinct().ToList();
            List<string> ProjIds = batches.Select(t => t.PROJ_ID).Distinct().ToList();
            List<CUSTOMER> custDetails = Cldb.CUSTOMER.GetAll().Where(t => CustIds.Contains(t.CUST_ID)).ToList();
            var UpdatedByList = batches.Select(t => t.UPDATED_BY).Distinct().ToList();
            var employeeInfoList = Cldb.EMP_INFO.GetAll().Where(t => UpdatedByList.Contains(t.EMP_ID)).ToList();
            List<PROJECT> projDetails = Cldb.PROJECT.GetAll().Where(t => ProjIds.Contains(t.PROJ_ID)).ToList();
            List<PORTFOLIO> portfolios = CSPdb.PORTFOLIO.GetAll().ToList();
            var ids = batches.Where(x => x.SURVEY_ID.HasValue).Select(x => x.SURVEY_ID.Value).ToList();
            var surveyItems = CSPdb.CSS_SURVEY_ITERATION.GetAll().Where(x => ids.Contains(x.ID)).ToList();

            List<CSS_BATCH_CUSTOMERS_EXTENDED> ext = new List<CSS_BATCH_CUSTOMERS_EXTENDED>();
            foreach (CSS_BATCH_CUSTOMERS c in batches)
            {
                string s = JsonConvert.SerializeObject(c);
                CSS_BATCH_CUSTOMERS_EXTENDED newExt = JsonConvert.DeserializeObject<CSS_BATCH_CUSTOMERS_EXTENDED>(s);
                newExt.CUST_NM = custDetails.FirstOrDefault(t => t.CUST_ID == c.CUST_ID)?.CUST_NM;
                newExt.APPROVER = employeeInfoList.FirstOrDefault(t => t.EMP_ID == c.UPDATED_BY)?.FRST_NM;
                PORTFOLIO_PRODUCT product = null;
                var proj = projDetails.FirstOrDefault(t => t.PROJ_ID == c.PROJ_ID.Trim());
                if (c.PROD_ID.HasValue)
                {
                    product = CSPdb.PORTFOLIO_PRODUCTS.GetById(c.PROD_ID);
                }


                if (product != null)
                {
                    newExt.PROJ_NM = product.PRODUCT_TITLE;
                    newExt.PROJ_STATUS = proj?.PROJ_STATUS;
                    newExt.BUSINESS_UNIT = proj?.BUSINESS_UNIT;
                }
                else if (proj != null)
                {
                    newExt.PROJ_NM = proj.PROJ_NM;
                    newExt.PROJ_STATUS = proj.PROJ_STATUS;
                    newExt.CONTRACTING_UNIT = proj.CONTRACTING_UNIT;
                    newExt.REVENUE_TYPE = proj.REVENUE_TYPE;
                    newExt.BUSINESS_UNIT = proj.BUSINESS_UNIT;
                }
                else if (proj == null)
                {
                    newExt.PROJ_NM = portfolios.FirstOrDefault(x => x.ID.ToString() == c.PROJ_ID.Trim())?.TITLE;
                }



                var surveyItem = surveyItems.FirstOrDefault(x => x.ID == c.SURVEY_ID);
                if (surveyItem != null)
                    newExt.URL = $"{GetAbsoulteUri()}/CustomerSuccessSurvey/{surveyItem.SURVEY_ID}";
                ext.Add(newExt);
            }
            ext = ext.OrderBy(x => x.CUST_NM).ThenBy(x => x.PROJ_NM).ToList();
            return ext;
        }

        internal CSS_BATCH_CUSTOMERS_EXTENDED FillCustomerAndProjectNames(CSS_BATCH_CUSTOMERS batchCust)
        {
            CUSTOMER custDetails = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == batchCust.CUST_ID);
            PORTFOLIO_PRODUCT product = null;
            if (batchCust.PROD_ID.HasValue)
            {

                product = CSPdb.PORTFOLIO_PRODUCTS.GetById(batchCust.PROD_ID);

            }
            PROJECT project = Cldb.PROJECT.GetAll().FirstOrDefault(t => t.PROJ_ID == batchCust.PROJ_ID);



            string s = JsonConvert.SerializeObject(batchCust);
            CSS_BATCH_CUSTOMERS_EXTENDED newExt = JsonConvert.DeserializeObject<CSS_BATCH_CUSTOMERS_EXTENDED>(s);
            newExt.CUST_NM = custDetails.CUST_NM;
            if (product != null)
            {
                newExt.PROJ_NM = product.PRODUCT_TITLE;
            }
            else if (project != null)
            {
                newExt.PROJ_NM = project.PROJ_NM;
            }

            else if (project == null)
            {
                var portfolio = CSPdb.PORTFOLIO.GetAll().FirstOrDefault(x => x.ID.ToString() == batchCust.PROJ_ID);
                newExt.PROJ_NM = portfolio?.TITLE;

            }


            return newExt;
        }

        //internal CSS_BATCH_CUSTOMERS_EXTENDED FillCustomerAndProjectNames(CSS_BATCH_CUSTOMERS batchCust)
        //{
        //    CUSTOMER custDetails = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == batchCust.CUST_ID);
        //    PROJECT projDetails = Cldb.PROJECT.GetAll().FirstOrDefault(t => t.PROJ_ID == batchCust.PROJ_ID);

        //    string s = JsonConvert.SerializeObject(batchCust);
        //    CSS_BATCH_CUSTOMERS_EXTENDED newExt = JsonConvert.DeserializeObject<CSS_BATCH_CUSTOMERS_EXTENDED>(s);
        //    newExt.CUST_NM = custDetails.CUST_NM;
        //    newExt.PROJ_NM = projDetails.PROJ_NM;
        //    return newExt;
        //}

        internal CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED FillCustomerAndProjectNames(CSS_BATCH_CUSTOMER_MONTHLY batchCust)
        {
            CUSTOMER custDetails = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == batchCust.CUST_ID);

            string s = JsonConvert.SerializeObject(batchCust);
            var newExt = JsonConvert.DeserializeObject<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED>(s);
            newExt.CUST_NM = custDetails.CUST_NM;
            newExt.PROJ_ID = batchCust.PROJ_ID;
            newExt.PROD_ID = batchCust.PROD_ID;
            return newExt;
        }

        internal List<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED> FillCustomerAndProjectNames(List<CSS_BATCH_CUSTOMER_MONTHLY> batchCustomerList)
        {
            List<string> CustIds = batchCustomerList.Select(t => t.CUST_ID).Distinct().ToList();
            List<string> ProjIds = batchCustomerList.Select(t => t.PROJ_ID).Distinct().ToList();
            List<CUSTOMER> custDetails = Cldb.CUSTOMER.GetAll().Where(t => CustIds.Contains(t.CUST_ID)).ToList();
            List<PROJECT> projDetails = Cldb.PROJECT.GetAll().Where(t => ProjIds.Contains(t.PROJ_ID)).ToList();
            List<PORTFOLIO> portfolios = CSPdb.PORTFOLIO.GetAll().ToList();

            List<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED> ext = new List<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED>();
            foreach (var batch in batchCustomerList)
            {
                string s = JsonConvert.SerializeObject(batch);
                var newExt = JsonConvert.DeserializeObject<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED>(s);

                newExt.CUST_NM = custDetails.FirstOrDefault(t => t.CUST_ID == batch.CUST_ID)?.CUST_NM;
                var proj = projDetails.FirstOrDefault(t => t.PROJ_ID == batch.PROJ_ID?.Trim());
                if (proj != null)
                {
                    newExt.PROJ_NM = proj.PROJ_NM;
                    newExt.PROJ_STATUS = proj.PROJ_STATUS;
                    newExt.PROJ_ID = proj.PROJ_ID;
                    newExt.PROD_ID = batch.PROD_ID;
                    // newExt.BUSINESS_UNIT = proj.BUSINESS_UNIT;
                }
                ext.Add(newExt);
            }
            ext = ext.OrderBy(x => x.CUST_NM).ThenBy(x => x.PROJ_NM).ToList();
            return ext;
        }

        internal CONFIGURATION_EXT GetDBConfig(string sKey, string CustId, string projId, DateTime startDate, DateTime endDate)
        {
            CONFIGURATION_EXT config = new CONFIGURATION_EXT();

            bool projIdIsNull = string.IsNullOrWhiteSpace(projId);

            config = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(t => t.KEY == sKey && t.CUST_ID == CustId && (projIdIsNull || t.PROJ_ID == projId) && ((t.START_DATE >= startDate.Date && t.START_DATE <= endDate.Date) || (t.END_DATE >= startDate.Date && t.END_DATE <= endDate.Date)));

            if (config == null)
            {
                config = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(t => t.KEY == sKey && t.CUST_ID == CustId && (projIdIsNull || t.PROJ_ID == projId));

                if (config == null)
                    config = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(t => t.KEY == sKey && t.CUST_ID == CustId);

                if (config == null)
                    config = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(t => t.KEY == sKey && t.CUST_ID == "-1");
            }

            return config;
        }

        internal int GetQuestionModel(string custId, string projId, bool isMonthly, DateTime startDate, DateTime endDate, string contactEmailId, int batchId, string frequency)
        {
            if (isMonthly)
            {
                var config = GetDBConfig(GetKeyForCSSMonthly(contactEmailId), custId, projId, startDate, endDate);

                if (config != null)
                    return GetDBConfigValueInt(config);
                else
                {
                    config = GetDBConfig("CSS_QUESTION_MODEL_MONTHLY", custId, projId, startDate, endDate);
                    if (config != null)
                        return GetDBConfigValueInt(config);
                    else
                        return GetDBConfigValueInt(GetDBConfig("CSS_QUESTION_MODEL", custId, projId, startDate, endDate)); //change get default
                }
            }
            else if (frequency.ToLower() == "quarterly" && !string.IsNullOrEmpty(projId))
            {
                int? questionModelId = Cldb.AppRepo.getQuestionModelId(projId, batchId, contactEmailId);
                if (questionModelId.HasValue && questionModelId.Value != 0)
                {
                    return questionModelId.Value;
                }
                else
                {
                    var config = GetDBConfig("CSS_QUESTION_MODEL", custId, projId, startDate, endDate);
                    return GetDBConfigValueInt(config);
                }
            }

            else
            {
                if (frequency.ToLower() == "halfyearly")
                {
                    var config = GetDBConfig("CSS_QUESTION_MODEL_HALFYEARLY", custId, projId, startDate, endDate);
                    return GetDBConfigValueInt(config);
                }
                else
                {
                    var config = GetDBConfig("CSS_QUESTION_MODEL", custId, projId, startDate, endDate);
                    return GetDBConfigValueInt(config);
                }
            }
        }

        internal List<PROJECT_CONFIGURATION_DATA> GetProjectConfigurationDataForSetting(IList<string> setting)
        {
            var skipIds = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().Where(x => setting.Contains(x.Setting_Key.ToUpper())).Select(x => x.Id).ToList();
            var projectstoSkipBySettings = new List<PROJECT_CONFIGURATION_DATA>();
            if (skipIds.Count > 0)
                projectstoSkipBySettings = CSPdb.PROJECT_CONFIGURATION_DATA.GetAll()
                    .Where(x => skipIds.Contains(x.Configuration_Setting_Id) && x.Is_Approved == true && (x.End_date.HasValue == false || x.End_date.Value > DateTime.Today)).ToList();

            return projectstoSkipBySettings;
        }

        public string Crypt(string text)
        {
            return Convert.ToBase64String(
                ProtectedData.Protect(
                    Encoding.Unicode.GetBytes(text), null, DataProtectionScope.LocalMachine));
        }

        public string Decrypt(string text)
        {
            return Encoding.Unicode.GetString(
                ProtectedData.Unprotect(
                     Convert.FromBase64String(text), null, DataProtectionScope.LocalMachine));
        }

        private string GetKeyForCSSMonthly(string contactEmailId)
        {
            int? roleId = CSPdb.CONTACTS.GetAll().FirstOrDefault(x => x.CONTACT_EMAILID == contactEmailId)?.ROLE_ID;

            if (roleId.HasValue)
                return $"CSS_QUESTION_MODEL_MONTHLY_ROLE_ID_{roleId}";

            else
                return $"CSS_QUESTION_MODEL_MONTHLY";
        }

        internal bool IsGSLABProject(string projectId)
        {
            return !string.IsNullOrWhiteSpace(projectId) && projectId.StartsWith("PROJ");
        }

        internal bool IsGSLABAccount(string custId)
        {
            return !string.IsNullOrWhiteSpace(custId) && custId.StartsWith("CUST");
        }
        internal List<int> GetProductIdsForProject(string projId)
        {
            var products = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.ISACTIVE && x.MANAGEMENT_TYPE == 7 && x.PROJECT_ID == projId).Select(x => x.PRODUCT_ID).ToList();
            if (!products.Any()) return new List<int>();
            return products;
        }

        internal List<string> GetCCEmailIDsForPremier(string customerEmailId, string projId)
        {
            var result = new List<string>();
            var empList = new List<string>();
            try
            {
                if (string.IsNullOrWhiteSpace(projId))
                {
                    var products = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.ISACTIVE && x.MANAGEMENT_TYPE == 6 && x.EMP_ID == customerEmailId).Select(x => x.PRODUCT_ID).ToList();
                    if (!products.Any()) return result;
                    var managementTypes = new List<int> { 1, 2, 3, 4 };
                    empList = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.ISACTIVE && products.Contains(x.PRODUCT_ID) && managementTypes.Contains(x.MANAGEMENT_TYPE)).Select(x => x.EMP_ID).ToList();

                }
                else
                {
                    var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
                    empList.Add(project.PROJ_PM_EMP_ID);
                    empList.Add(project.PROJ_DM_EMP_ID);
                    empList.Add(project.PROJ_AM_EMP_ID);
                    if (!string.IsNullOrWhiteSpace(project.QUALITY_SPOC))
                        empList.Add(project.QUALITY_SPOC);
                }

                if (!empList.Any()) return result;
                result = GetEmployeeMailIdList(empList).Distinct().ToList();
            }
            catch (Exception ex)
            {

                //Logger l = new Logger(HttpRequest. ex);
            }

            return result;
        }

        internal string GetLaterDateTextForCSSValidity(DateTime dateSent, string custId)
        {
            var laterDate = GetLaterDateForCSSValidity(dateSent, custId);
            return laterDate.ToString("dd-MMM-yyyy");
        }

        internal DateTime GetLaterDateForCSSValidity(DateTime dateSent, string custId, int valDays = 0)
        {
            var configKey = "CSS_LINK_VALIDITY_DAYS";

            var lastDayOfMonth = new DateTime(dateSent.Year, dateSent.Month, 1)
                .AddMonths(1)
                .AddDays(-1);
            int validity = 20;
            if (valDays == 0)
            {
                var configValues = GetDBConfig(configKey, custId);
                int.TryParse(configValues, out validity);
            }
            var validDate = dateSent.AddDays(validity);


            var laterDate = DateTime.Compare(lastDayOfMonth, validDate) > 0 ? lastDayOfMonth : validDate;
            return laterDate;
        }

        //internal string GetDBConfigValue(string key, string custId, string projId)
        //{
        //    var config = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(t => t.KEY == key && (custId == "-1" || custId == t.CUST_ID) && (string.IsNullOrEmpty(projId) || projId == t.PROJ_ID));
        //    return GetDBConfigValue(config);
        //}

        internal List<string> GetProjIdsForProduct(int? prodId)
        {
            var result = new List<string>();
            if (prodId.HasValue == false) return result;
            var productResponsible = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == prodId && x.MANAGEMENT_TYPE == 7).ToList();
            if (!productResponsible.Any()) return result;
            result = productResponsible.Select(x => x.PROJECT_ID).ToList();

            return result;
        }

    }

    public static class extensions
    {
        public static void UpdateAuditFieldsExt<T>(this T input, string empId) where T : EntityBase
        {
            input.UPDATED_BY = empId;
            input.UPDATED_DATE = DateTime.Now;
            input.ISACTIVE = true;
            if (input.ID == 0)
            {
                input.CREATED_BY = empId;
                input.CREATED_DATE = DateTime.Now;
            }
        }
    }
}