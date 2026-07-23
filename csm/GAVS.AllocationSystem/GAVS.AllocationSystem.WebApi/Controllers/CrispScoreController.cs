using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [POST("ProcessCrispScoresForProject")]
        [ActionName("ProcessCrispScoresForProject")]
        [HttpPost]
        public void ProcessCrispScoresForProject([FromBody] string[] projId, string custId, string month, string year)
        {
            var stopwatch = Stopwatch.StartNew();
            ProcessCrispScoreForProjectPvt(custId, projId, month, year);
            FillResponseTime(stopwatch);

        }

        private void ProcessCrispScoreForProjectPvt(string custId, string[] projId, string month, string year)
        {
            var emp = GetHeaderDetails_String("empid");
            if (emp.Contains("roopsundar"))
            {
                Logger l = new Logger(Request);
                throw new Exception("Invalid user");
            }
            string date = "1-" + month + "-" + year;
            DateTime dt = Convert.ToDateTime(date);
            CrispConfigHolder config = new CrispConfigHolder
            {
                CRISP_CRITERIA = CSPdb.CRISP_CRITERIA.GetAll().ToList<CRISP_CRITERIA>(),
                CRISP_CATEGORY = CSPdb.CRISP_CATEGORY.GetAll().ToList<CRISP_CATEGORY>(),
                CRISP_VALIDATIONS = CSPdb.CRISP_VALIDATIONS.GetAll().ToList<CRISP_VALIDATIONS>()
            };
            var projects = Cldb.PROJECT.GetAll().Where(x => x.PROJ_STATUS.ToUpper() != "CLOSE" && x.CUST_ID == custId && x.START_DATE <= dt).ToList();
            if (projId != null && projId.Any())
                projects = projects.Where(x => projId.Contains(x.PROJ_ID)).ToList();

            ///List<CRISPScores> crispScores = CSPdb.AppRepo.GetCrispScores(dt, dt.AddMonths(1).AddSeconds(-1));
            var csms = projects.Select(x => x.PROJ_DM_EMP_ID).Distinct().ToList();
            var projectsToSkip = helper.GetDBConfig("PROJECTS_TO_SKIP_CRISP", "-1");
            var projectstoSkipBySettings = helper.GetProjectConfigurationDataForSetting("SKIP_CRISP_SCORE_CALCULATION").Where(x => x.Bit_Value == true).ToList();
            foreach (var csm in csms)//.Where(x => _isProd || x == 100985)
            {
                var filteredCrispScores = new List<CRISPScores>();
                var csmProjects = projects.Where(x => x.PROJ_DM_EMP_ID == csm).ToList();//.Where(x => _isProd || x.PROJ_NM.Contains("21"))

                foreach (var proj in csmProjects)
                {
                    if (projectsToSkip.IndexOf(proj.PROJ_ID) >= 0) continue;
                    if (projectstoSkipBySettings.Any(x => x.Proj_Id == proj.PROJ_ID)) continue;

                    ProcessCrispScores(proj.CUST_ID, proj.PROJ_ID, dt, month, year, config, emp);
                }
                if (filteredCrispScores.Any())
                {
                    var emp_info = GetEmpDet(csm.ToString());
                    SendCRISPScoresMailAuto(emp_info.EMAIL_ID, emp_info.FRST_NM, "", $"CRISP Scores for your Project(s) for {month} - {year}", filteredCrispScores.OrderByDescending(x => x.TOTAL).ToList(), month + "-" + year, "CRISPScoresCSM.htm", IsPremier(filteredCrispScores.First().CUST_ID), dt);
                    //remove
                    //SendCRISPScoresMailAuto(  string.Join(",", filteredCrispScores.Select(x => x.QUALITY_SPOC)), emp_info.FRST_NM, emp_info.EMAIL_ID, $"CRISP Scores for your Projects for {Month} - {Year}", filteredCrispScores.OrderByDescending(x => x.TOTAL).ToList(), Month + "-" + Year, "CRISPScoresCSM.htm", IsPremier(filteredCrispScores.First().CUST_ID), dt);
                }
            }
        }

        [GET("ProcessCrispScoresForPeriodForPM")]
        [ActionName("ProcessCrispScoresForPeriodForPM")]
        [HttpGet]
        public void ProcessCrispScoresForPeriodForPM(string Month, string Year)
        {
            LogRequest();
            var stopwatch = Stopwatch.StartNew();
            var emp = GetHeaderDetails_String("empid");
            string date = "1-" + Month + "-" + Year;
            DateTime dt = Convert.ToDateTime(date);

            CrispConfigHolder config = new CrispConfigHolder
            {
                CRISP_CRITERIA = CSPdb.CRISP_CRITERIA.GetAll().ToList<CRISP_CRITERIA>(),
                CRISP_CATEGORY = CSPdb.CRISP_CATEGORY.GetAll().ToList<CRISP_CATEGORY>(),
                CRISP_VALIDATIONS = CSPdb.CRISP_VALIDATIONS.GetAll().ToList<CRISP_VALIDATIONS>()
            };

            var projects = Cldb.PROJECT.GetAll().Where(x => x.PROJ_STATUS.ToUpper() != "CLOSE" && x.CUST_ID != "202100091" && x.CUST_ID != "202100062" && x.END_DATE > dt && x.START_DATE <= dt).ToList();
            List<CRISPScores> crispScores = CSPdb.AppRepo.GetCrispScores(dt, dt.AddMonths(1).AddSeconds(-1));
            var csms = projects.Select(x => x.PROJ_PM_EMP_ID).Distinct().ToList();
            var projectsToSkip = helper.GetDBConfig("PROJECTS_TO_SKIP_CRISP", "-1");
            var projectstoSkipBySettings = helper.GetProjectConfigurationDataForSetting("SKIP_CRISP_SCORE_CALCULATION").Where(x => x.Bit_Value == true).ToList();
            var toAddCSMCC = helper.GetProjectConfigurationDataForSetting("CC_CSM_when_CRISP_score_email_sent_to_PM").Where(x => x.Bit_Value == true).ToList();
            foreach (var csm in csms)//.Where(x => _isProd || x == 100985)
            {
                var filteredCrispScores = new List<CRISPScores>();
                var csmProjects = projects.Where(x => x.PROJ_PM_EMP_ID == csm).ToList();//.Where(x => _isProd || x.PROJ_NM.Contains("21"))

                foreach (var proj in csmProjects)
                {
                    if (projectsToSkip.IndexOf(proj.PROJ_ID) >= 0) continue;
                    if (projectstoSkipBySettings.Any(x => x.Proj_Id == proj.PROJ_ID)) continue;
                    if (!crispScores.Any(x => x.PROJ_ID == proj.PROJ_ID))
                    {

                    }
                    else
                    {
                        filteredCrispScores.Add(crispScores.FirstOrDefault(x => x.PROJ_ID == proj.PROJ_ID));
                    }
                }
                if (filteredCrispScores.Any())
                {
                    var emp_info = GetEmpDet(csm.ToString());
                    //
                    var ccEmails = filteredCrispScores.Where(x => !string.IsNullOrWhiteSpace(x.QUALITY_SPOC)).Select(x => x.QUALITY_SPOC).ToList();
                    foreach (var item in filteredCrispScores)
                    {
                        if (toAddCSMCC.Any(x => x.Proj_Id == item.PROJ_ID))
                        {
                            ccEmails.Add(helper.GetCSMMailsFromProject(item.PROJ_ID));
                        }
                    }
                    SendCRISPScoresMailAuto(emp_info.EMAIL_ID, emp_info.FRST_NM, string.Join(",", ccEmails), $"CRISP Scores for your Project(s) for {Month} - {Year}", filteredCrispScores.OrderByDescending(x => x.TOTAL).ToList(), Month + "-" + Year, "CRISPScoresCSM.htm", IsPremier(filteredCrispScores.First().CUST_ID), dt);
                    //SendCRISPScoresMailAuto(  string.Join(",", filteredCrispScores.Select(x => x.QUALITY_SPOC)), emp_info.FRST_NM, emp_info.EMAIL_ID, $"CRISP Scores for your Projects for {Month} - {Year}", filteredCrispScores.OrderByDescending(x => x.TOTAL).ToList(), Month + "-" + Year, "CRISPScoresCSM.htm", IsPremier(filteredCrispScores.First().CUST_ID), dt);
                }
            }
            FillResponseTime(stopwatch);
        }

        [GET("ProcessCrispScoresForPeriod")]
        [ActionName("ProcessCrispScoresForPeriod")]
        [HttpGet]
        public void ProcessCrispScoresForPeriod(string Month, string Year, bool regenerate = false)
        {
            LogRequest(prefix: "ProcessCrispScoresForPeriod");
            var stopwatch = Stopwatch.StartNew();
            var emp = GetHeaderDetails_String("empid");
            string date = "1-" + Month + "-" + Year;
            DateTime dt = Convert.ToDateTime(date);
            if (dt > DateTime.Today)
                return;

            CrispConfigHolder config = new CrispConfigHolder
            {
                CRISP_CRITERIA = CSPdb.CRISP_CRITERIA.GetAll().ToList<CRISP_CRITERIA>(),
                CRISP_CATEGORY = CSPdb.CRISP_CATEGORY.GetAll().ToList<CRISP_CATEGORY>(),
                CRISP_VALIDATIONS = CSPdb.CRISP_VALIDATIONS.GetAll().ToList<CRISP_VALIDATIONS>()
            };
            var skipBusinessUnits = new List<string> { "CORP", "FINA", "TALMGT", "GENADM", "SOLSGY" };
            var projects = Cldb.PROJECT.GetAll().Where(x => x.PROJ_STATUS.ToUpper() != "CLOSE" && x.CUST_ID != "202100091" && x.CUST_ID != "202100062"
            && x.END_DATE > dt && x.START_DATE <= dt && !x.PROJ_NM.StartsWith("PROJ") && !skipBusinessUnits.Contains(x.BUSINESS_UNIT)).ToList();
            //projects = projects.Where(x => x.CUST_ID == 202100071).ToList();
            List<CRISPScores> crispScores = CSPdb.AppRepo.GetCrispScores(dt, dt.AddMonths(1).AddSeconds(-1));
            var csms = projects.Select(x => x.PROJ_DM_EMP_ID).Distinct().ToList();
            var projectsToSkip = helper.GetDBConfig("PROJECTS_TO_SKIP_CRISP", "-1");
            var projectstoSkipBySettings = helper.GetProjectConfigurationDataForSetting("SKIP_CRISP_SCORE_CALCULATION").Where(x => x.Bit_Value == true).ToList();
            int i = 0;
            foreach (var csm in csms)//.Where(x => _isProd || x == 103287))
            {
                var filteredCrispScores = new List<CRISPScores>();
                var csmProjects = projects.Where(x => x.PROJ_DM_EMP_ID == csm).ToList();
                //csmProjects = csmProjects.Where(x => x.PROJ_ID == "202P000638").ToList();

                foreach (var proj in csmProjects)
                {
                    if (projectsToSkip.IndexOf(proj.PROJ_ID) >= 0) continue;
                    if (projectstoSkipBySettings.Any(x => x.Proj_Id == proj.PROJ_ID)) continue;
                    if (helper.IsGSLABProject(proj.PROJ_ID)) continue;
                    if (!crispScores.Any(x => x.PROJ_ID == proj.PROJ_ID) || regenerate)
                    {
                        try
                        {
                            ProcessCrispScores(proj.CUST_ID, proj.PROJ_ID, dt, Month, Year, config, emp);
                            filteredCrispScores.AddRange(CSPdb.AppRepo.GetCrispScoresForProject(proj.PROJ_ID, dt, dt.AddMonths(1).AddSeconds(-1)));
                        }
                        catch (Exception ex)
                        {
                            Logger l = new Logger(Request, ex);

                        }

                    }
                    else
                    {
                        //filteredCrispScores.Add(crispScores.FirstOrDefault(x => x.PROJ_ID == proj.PROJ_ID));
                    }
                }
                if (filteredCrispScores.Any())
                {
                    var emp_info = GetEmpDet(csm);

                    SendCRISPScoresMailAuto(emp_info.EMAIL_ID, emp_info.FRST_NM, string.Join(",", filteredCrispScores.Where(x => !string.IsNullOrWhiteSpace(x.QUALITY_SPOC)).Select(x => x.QUALITY_SPOC)), $"CRISP Scores for your Projects for {Month} - {Year}", filteredCrispScores.OrderByDescending(x => x.TOTAL).ToList(), Month + "-" + Year, "CRISPScoresCSM.htm", IsPremier(filteredCrispScores.First().CUST_ID), dt, true);
                    //SendCRISPScoresMailAuto(  string.Join(",", filteredCrispScores.Select(x => x.QUALITY_SPOC)), emp_info.FRST_NM, emp_info.EMAIL_ID, $"CRISP Scores for your Projects for {Month} - {Year}", filteredCrispScores.OrderByDescending(x => x.TOTAL).ToList(), Month + "-" + Year, "CRISPScoresCSM.htm", IsPremier(filteredCrispScores.First().CUST_ID), dt);
                    if (!_isProd && i++ > 10) break;
                }
            }
            FillResponseTime(stopwatch);
        }

        [GET("ProcessCScoreForPeriod")]
        [ActionName("ProcessCScoreForPeriod")]
        [HttpGet]
        public void ProcessCScoreForPeriod(string Month, string Year)
        {

            var emp = GetHeaderDetails_String("empid");
            string date = "1-" + Month + "-" + Year;
            DateTime dt = Convert.ToDateTime(date);
            DateTime endDate = dt.AddMonths(1).AddSeconds(-1);
            CrispConfigHolder config = new CrispConfigHolder
            {
                CRISP_CRITERIA = CSPdb.CRISP_CRITERIA.GetAll().ToList<CRISP_CRITERIA>(),
                CRISP_CATEGORY = CSPdb.CRISP_CATEGORY.GetAll().ToList<CRISP_CATEGORY>(),
                CRISP_VALIDATIONS = CSPdb.CRISP_VALIDATIONS.GetAll().ToList<CRISP_VALIDATIONS>()
            };

            var projects = Cldb.PROJECT.GetAll().Where(x => x.PROJ_STATUS.ToUpper() != "CLOSE" && x.CUST_ID != "202100091" && x.CUST_ID != "202100062" && x.END_DATE > dt && x.START_DATE <= dt).ToList();
            //projects = projects.Where(x => x.CUST_ID == 202100071).ToList();
            List<CRISPScores> crispScores = CSPdb.AppRepo.GetCrispScores(dt, dt.AddMonths(1).AddSeconds(-1));
            var csms = projects.Select(x => x.PROJ_DM_EMP_ID).Distinct().ToList();
            var projectsToSkip = helper.GetDBConfig("PROJECTS_TO_SKIP_CRISP", "-1");
            var projectstoSkipBySettings = helper.GetProjectConfigurationDataForSetting("SKIP CRISP SCORE CALCULATION").Where(x => x.Bit_Value == true).ToList();
            int i = 0;
            foreach (var csm in csms)//.Where(x => _isProd || x == 100985)
            {

                var filteredCrispScores = new List<CRISPScores>();
                var csmProjects = projects.Where(x => x.PROJ_DM_EMP_ID == csm).ToList();//.Where(x => _isProd || x.PROJ_NM.Contains("21"))

                foreach (var proj in csmProjects)
                {
                    if (projectsToSkip.IndexOf(proj.PROJ_ID) >= 0) continue;
                    if (projectstoSkipBySettings.Any(x => x.Proj_Id == proj.PROJ_ID)) continue;
                    if (crispScores.Any(x => x.PROJ_ID == proj.PROJ_ID))
                    {
                        var ideas_score = CSPdb.AppRepo.GetIdeasForCRISP(proj.PROJ_ID, dt.AddMonths(-2), endDate);
                        var improvements_score = CSPdb.AppRepo.GetImprovementsForCRISP(proj.PROJ_ID, dt.AddMonths(-2), endDate);


                        var crisp_scores_categoryList = new List<CRISP_SCORES_CATEGORY>();
                        var cpc = CSPdb.CRISP_SCORES_PROJECT.GetAll().FirstOrDefault(x => x.PROJECT_ID == proj.PROJ_ID && x.PUBLISH_DATE == dt);
                        if (cpc != null)
                        {
                            var crispAutomationList = new List<CRISP_AUTOMATION>();
                            crispAutomationList.Add(GetIdeasCRISP(ideas_score, config.CRISP_VALIDATIONS));
                            crispAutomationList.Add(GetImprovementsCRISP(improvements_score, config.CRISP_VALIDATIONS));
                            cpc.UPDATED_BY = emp;
                            cpc.UPDATED_DATE = DateTime.Now;
                            cpc.COMMENTS = "Regenerated";
                            var crisp_scores_categoryExistingList = CSPdb.CRISP_SCORES_CATEGORY.GetAll().Where(x => x.CRISP_SCORES_PROJECT_ID == cpc.ID).ToList();
                            var crisp_scores_criteriaList = CSPdb.CRISP_SCORES_CRITERIA.GetAll().Where(x => x.CRISP_SCORES_PROJECT_ID == cpc.ID).ToList();
                            var crisp_scores_validationList = CSPdb.CRISP_SCORES_VALIDATIONS.GetAll().Where(x => x.CRISP_SCORES_PROJECT_ID == cpc.ID).ToList();
                            foreach (var item in crisp_scores_validationList)
                            {
                                //item.ACHIEVED = false;
                            }
                            foreach (var item in crispAutomationList)
                            {
                                var criteria = crisp_scores_criteriaList.FirstOrDefault(x => x.CRITERIA_ID == item.crisp_score_criteria.CRITERIA_ID);
                                var validation = crisp_scores_validationList.FirstOrDefault(x => x.VALIDATION_ID == item.crisp_score_validations.VALIDATION_ID);

                                if (criteria != null)
                                {
                                    criteria.UPDATED_BY = emp;
                                    criteria.UPDATED_DATE = DateTime.Now;
                                    criteria.SCORE = item.crisp_score_criteria.SCORE = GetScore(item.crisp_score_criteria, config.CRISP_CRITERIA);
                                    criteria.SCORE_PERCENTAGE = item.crisp_score_criteria.SCORE_PERCENTAGE = item.crisp_score_criteria.SCORE_PERCENTAGE;
                                    CSPdb.CRISP_SCORES_CRITERIA.Update(criteria);
                                }
                                else
                                {
                                    item.crisp_score_criteria.CREATED_BY = emp;
                                    item.crisp_score_criteria.UPDATED_BY = emp;
                                    item.crisp_score_criteria.CREATED_DATE = DateTime.Now;
                                    item.crisp_score_criteria.UPDATED_DATE = DateTime.Now;
                                    item.crisp_score_criteria.SCORE = GetScore(item.crisp_score_criteria, config.CRISP_CRITERIA);
                                    item.crisp_score_criteria.CRISP_SCORES_PROJECT_ID = cpc.ID;
                                    CSPdb.CRISP_SCORES_CRITERIA.Add(item.crisp_score_criteria);
                                }
                                if (validation != null)
                                {
                                    validation.UPDATED_BY = emp;
                                    validation.UPDATED_DATE = DateTime.Now;
                                    validation.ACHIEVED = item.crisp_score_validations.ACHIEVED;
                                    CSPdb.CRISP_SCORES_VALIDATIONS.Update(validation);
                                }
                                else
                                {
                                    item.crisp_score_validations.CREATED_BY = emp;
                                    item.crisp_score_validations.UPDATED_BY = emp;
                                    item.crisp_score_validations.CREATED_DATE = DateTime.Now;
                                    item.crisp_score_validations.UPDATED_DATE = DateTime.Now;
                                    item.crisp_score_validations.CRISP_SCORES_PROJECT_ID = cpc.ID;
                                    CSPdb.CRISP_SCORES_VALIDATIONS.Add(item.crisp_score_validations);
                                }


                            }


                            if (crisp_scores_categoryExistingList.Any())
                            {
                                cpc.SCORE = 0;
                                foreach (var item in crisp_scores_categoryExistingList)
                                {
                                    var criteriaIds = config.CRISP_CRITERIA.Where(x => x.CATEGORY_ID == item.CATEGORY_ID).Select(x => x.ID).ToList();
                                    item.SCORE = crisp_scores_criteriaList.Where(x => criteriaIds.Contains(x.CRITERIA_ID)).Sum(x => x.SCORE); //crispAutomationList.Where(x => criteriaIds.Contains(x.crisp_score_criteria.CRITERIA_ID)).Sum(x => x.crisp_score_criteria.SCORE);
                                    CSPdb.CRISP_SCORES_CATEGORY.Update(item);
                                    cpc.SCORE += item.SCORE;
                                }
                            }
                            else
                            {
                                crisp_scores_categoryList = new List<CRISP_SCORES_CATEGORY>();
                                foreach (var item in config.CRISP_CATEGORY)
                                {
                                    var newCategory = new CRISP_SCORES_CATEGORY
                                    {
                                        CREATED_BY = emp,
                                        UPDATED_BY = emp,
                                        CATEGORY_ID = item.ID,
                                        CRISP_SCORES_PROJECT_ID = cpc.ID,
                                        COMMENTS = "Auto Generated",
                                        CREATED_DATE = DateTime.Now,
                                        UPDATED_DATE = DateTime.Now,
                                        ISACTIVE = true,
                                    };
                                    crisp_scores_categoryList.Add(newCategory);
                                }
                                CSPdb.Commit(CanCommit);
                                cpc.SCORE = 0;
                                foreach (var item in crisp_scores_categoryList)
                                {
                                    var criteriaIds = config.CRISP_CRITERIA.Where(x => x.CATEGORY_ID == item.CATEGORY_ID).Select(x => x.ID).ToList();
                                    item.SCORE = crispAutomationList.Where(x => criteriaIds.Contains(x.crisp_score_criteria.CRITERIA_ID)).Sum(x => x.crisp_score_criteria.SCORE);
                                    CSPdb.CRISP_SCORES_CATEGORY.Add(item);
                                    cpc.SCORE += item.SCORE;
                                }
                            }

                            cpc.NEED_FOCUS = cpc.SCORE < 90;
                            CSPdb.CRISP_SCORES_PROJECT.Update(cpc);
                            CSPdb.Commit(CanCommit);

                        }
                    }
                }
                //if (filteredCrispScores.Any())
                //{
                //    var emp_info = GetEmpDet(csm.ToString());

                //    SendCRISPScoresMailAuto(emp_info.EMAIL_ID, emp_info.FRST_NM, string.Join(",", filteredCrispScores.Where(x => !string.IsNullOrWhiteSpace(x.QUALITY_SPOC)).Select(x => x.QUALITY_SPOC)), $"CRISP Scores for your Projects for {Month} - {Year}", filteredCrispScores.OrderByDescending(x => x.TOTAL).ToList(), Month + "-" + Year, "CRISPScoresCSM.htm", IsPremier(filteredCrispScores.First().CUST_ID), dt, true);
                //    //SendCRISPScoresMailAuto(  string.Join(",", filteredCrispScores.Select(x => x.QUALITY_SPOC)), emp_info.FRST_NM, emp_info.EMAIL_ID, $"CRISP Scores for your Projects for {Month} - {Year}", filteredCrispScores.OrderByDescending(x => x.TOTAL).ToList(), Month + "-" + Year, "CRISPScoresCSM.htm", IsPremier(filteredCrispScores.First().CUST_ID), dt);
                //    if (!_isProd && i++ > 1) break;
                //}
            }
            CSPdb.Commit(CanCommit);
        }
        private List<string> ProcessProductKPIScores(string projId, DateTime startDate, DateTime endDate)
        {
            var kpiscore = new List<string>();
            var products = helper.GetProductIdsForProject(projId);
            if (products.Any())
            {
                var slaKpiDetails = CSPdb.KPI_DETAILS.GetAll().Where(x => x.ISACTIVE && x.PRODUCT_ID != null && !x.ISDRAFT
                && products.Contains(x.PRODUCT_ID.Value) && x.PERIOD >= startDate && x.PERIOD <= endDate).ToList();
                if (slaKpiDetails.Any(x => x.SLA_STATUS.ToUpper() == "NOT MET" && (string.IsNullOrWhiteSpace(x.EXCLUSION_SLA_STATUS) || x.EXCLUSION_SLA_STATUS.ToUpper() == "NOT MET")))
                    kpiscore.Add("RED");
                else
                    kpiscore.Add("GREEN");
            }
            return kpiscore;
        }

        private List<string> ProcessProductNONSOWKPIScores(string projId, DateTime startDate, DateTime endDate)
        {
            var kpiscore = new List<string>();
            var products = helper.GetProductIdsForProject(projId);
            if (products.Any())
            {
                var slaKpiDetails = CSPdb.KPI_DETAILS.GetAll().Where(x => x.ISACTIVE && x.PRODUCT_ID != null && !x.ISDRAFT
                && products.Contains(x.PRODUCT_ID.Value) && x.PERIOD >= startDate && x.PERIOD <= endDate).ToList();
                foreach (var x in slaKpiDetails)
                {
                    if (x.SLA_STATUS.ToUpper() == "NOT MET" && (string.IsNullOrWhiteSpace(x.EXCLUSION_SLA_STATUS) || x.EXCLUSION_SLA_STATUS.ToUpper() == "NOT MET"))
                        kpiscore.Add("RED");
                    else
                        kpiscore.Add("GREEN");

                }

            }
            return kpiscore;
        }

        private void ProcessCrispScores(string custId, string projId, DateTime startDate, string month, string year, CrispConfigHolder config, string emp)
        {
            DateTime startDateForComp;
            DateTime endDateForComp;
            var kpiscoreSow = new List<string>();
            var endDate = startDate.AddMonths(1).AddSeconds(-1);
            var crispAutomationList = new List<CRISP_AUTOMATION>();
            var skipSOWKPI = helper.GetProjectConfigurationDataForSetting("SKIP_SOW_KPI_Calculation").FirstOrDefault(x => x.Bit_Value == true && x.Proj_Id == projId);
            if (skipSOWKPI != null)
            {
                kpiscoreSow.Add("GREEN");
            }
            else
            {


                var kpidetailsSow = CSPdb.AppRepo.GetKPIForCRISPNew(projId, startDate, true).ToList();
                if (!kpidetailsSow.Any())
                    kpidetailsSow = CSPdb.AppRepo.GetKPIForCRISPNew(projId, startDate.AddMonths(-1), true);

                if (!kpidetailsSow.Any() && IsSLAMetricsAvailable(new string[] { custId }))
                {
                    kpiscoreSow = ProcessProductKPIScores(projId, startDate, endDate);
                }
                else
                {
                    foreach (var kpi in kpidetailsSow)
                    {
                        var period = new Period();
                        period.DetermineTargetsAchievedCount(kpi);
                        if (period.Undertarget > 0)
                            kpiscoreSow.Add("RED");
                        else
                            kpiscoreSow.Add("GREEN");
                    }
                }
            }


            var skipKPI = helper.GetProjectConfigurationDataForSetting("SKIP_Non_SOW_KPI_Calculation").FirstOrDefault(x => x.Bit_Value == true && x.Proj_Id == projId);
            var nonSOWkpiscore = new List<string>();
            if (skipKPI != null)
            {
                nonSOWkpiscore.Add("GREEN");
            }
            else
            {
                var kpidetails = CSPdb.AppRepo.GetKPIForCRISPNew(projId, startDate, false).ToList();
                if (!kpidetails.Any())
                    kpidetails = CSPdb.AppRepo.GetKPIForCRISPNew(projId, startDate.AddMonths(-1), false);
                //check for premier
                if (!nonSOWkpiscore.Any() && IsSLAMetricsAvailable(new string[] { custId }))
                {
                    nonSOWkpiscore = ProcessProductNONSOWKPIScores(projId, startDate, endDate);
                }
                else if (!nonSOWkpiscore.Any() && kpiscoreSow.Any())
                {
                    nonSOWkpiscore.Add("GREEN");
                }
                else
                {
                    foreach (var kpi in kpidetails)
                    {
                        var period = new Period();
                        period.DetermineTargetsAchievedCount(kpi);
                        if (period.Undertarget > 0)
                            nonSOWkpiscore.Add("RED");
                        else
                            nonSOWkpiscore.Add("GREEN");
                    }
                }
            }
            if (startDate.Month <= 3)
            {
                startDateForComp = new DateTime(startDate.Year - 1, 04, 01);
                endDateForComp = new DateTime(startDate.Year, 03, 31);
            }
            else
            {
                startDateForComp = new DateTime(startDate.Year, 04, 01);
                endDateForComp = new DateTime(startDate.Year + 1, 03, 31);
            }
            var training_score = CSPdb.AppRepo.GetMandatoryTrainingForCRISP(projId, startDateForComp, endDateForComp).ToString();
            string risk_score = CSPdb.AppRepo.GetRiskForCRISP(projId, startDate, endDate);
            var issue_score = CSPdb.AppRepo.GetIssueForCRISP(projId, startDate, endDate);
            var csat_score = CSPdb.AppRepo.GetCSATForCRISP(projId, startDate.Month, startDate.Year);
            var ideas_score = CSPdb.AppRepo.GetIdeasForCRISP(projId, startDate.AddMonths(-2), endDate);
            var improvements_score = CSPdb.AppRepo.GetImprovementsForCRISP(projId, startDate.AddMonths(-2), endDate);
            var concerns_score = CSPdb.AppRepo.GetConcernsForCRISP(projId, startDate, endDate);
            var mandatoryAudit_score = CSPdb.AppRepo.GetMandatoryAuditStatus(projId, startDate, endDate);
            var crisp_scores_categoryList = new List<CRISP_SCORES_CATEGORY>();
            var cpc = CSPdb.CRISP_SCORES_PROJECT.GetAll().FirstOrDefault(x => x.PROJECT_ID == projId && x.PUBLISH_DATE == startDate);
            if (cpc != null)
            {

                crispAutomationList = new List<CRISP_AUTOMATION>();
                //from 1 to 11
                var sowResult = GetKPICRISPSOW(kpiscoreSow, config.CRISP_VALIDATIONS);
                if (sowResult.CreateActionItem)
                {
                    var existingactionItem = CSPdb.PROJECT_ACTIONITEM.GetAll().FirstOrDefault(x => x.CUSTOMER_ID == custId && x.PROJECT_ID == projId && x.SOURCE.Contains("CRISP") && x.DESCRIPTION.Contains(month + "-" + year));
                    if (existingactionItem != null)
                    {
                        existingactionItem.DESCRIPTION = $"{kpiscoreSow.Count(x => x == "RED" || x == "AMBER").ToString()} out of {kpiscoreSow.Count} KPIs not met the target specified in SOW for the period {month + "-" + year}. Perform RCA, prepare CAPA and submit Service Improvement Plan to customer";
                        CSPdb.PROJECT_ACTIONITEM.Update(existingactionItem);
                    }
                    else
                        CreateActionItem(kpiscoreSow, custId, projId, month + "-" + year);
                }
                crispAutomationList.Add(sowResult);
                crispAutomationList.Add(GetKPICRISPGoal(nonSOWkpiscore, kpiscoreSow.Any(), config.CRISP_VALIDATIONS));
                crispAutomationList.Add(GetRiskCRISP(risk_score, config.CRISP_VALIDATIONS));
                crispAutomationList.Add(GetIssuesCRISP(issue_score, config.CRISP_VALIDATIONS));
                crispAutomationList.Add(GetIdeasCRISP(ideas_score, config.CRISP_VALIDATIONS));
                crispAutomationList.Add(GetImprovementsCRISP(improvements_score, config.CRISP_VALIDATIONS));
                crispAutomationList.Add(GetConcernsCRISP(concerns_score, IsActionitemsPending(projId, endDate, "CSS"), config.CRISP_VALIDATIONS));
                crispAutomationList.Add(GetCSATCRISP(csat_score, config.CRISP_VALIDATIONS));
                crispAutomationList.Add(GetAuditReportFindingsforCRISP(mandatoryAudit_score, IsActionitemsPending(projId, endDate, ""), config.CRISP_VALIDATIONS));
                crispAutomationList.Add(GetHippaScoreforCRISP("", config.CRISP_VALIDATIONS));
                crispAutomationList.Add(GetPCFindingsforCRISP(training_score, config.CRISP_VALIDATIONS));
                cpc.UPDATED_BY = emp;
                cpc.UPDATED_DATE = DateTime.Now;
                cpc.COMMENTS = "Regenerated";
                var crisp_scores_categoryExistingList = CSPdb.CRISP_SCORES_CATEGORY.GetAll().Where(x => x.CRISP_SCORES_PROJECT_ID == cpc.ID).Distinct().ToList();
                var crisp_scores_criteriaList = CSPdb.CRISP_SCORES_CRITERIA.GetAll().Where(x => x.CRISP_SCORES_PROJECT_ID == cpc.ID).ToList();
                var crisp_scores_validationList = CSPdb.CRISP_SCORES_VALIDATIONS.GetAll().Where(x => x.CRISP_SCORES_PROJECT_ID == cpc.ID).ToList();
                foreach (var item in crisp_scores_validationList)
                {
                }
                foreach (var item in crispAutomationList)
                {
                    var criteria = crisp_scores_criteriaList.Find(x => x.CRITERIA_ID == item.crisp_score_criteria.CRITERIA_ID);
                    var validation = crisp_scores_validationList.FirstOrDefault(x => x.VALIDATION_ID == item.crisp_score_validations.VALIDATION_ID);

                    if (criteria != null)
                    {
                        criteria.UPDATED_BY = emp;
                        criteria.UPDATED_DATE = DateTime.Now;
                        criteria.SCORE = item.crisp_score_criteria.SCORE = GetScore(item.crisp_score_criteria, config.CRISP_CRITERIA);
                        criteria.SCORE_PERCENTAGE = item.crisp_score_criteria.SCORE_PERCENTAGE = item.crisp_score_criteria.SCORE_PERCENTAGE;
                        CSPdb.CRISP_SCORES_CRITERIA.Update(criteria);
                    }
                    else
                    {
                        item.crisp_score_criteria.CREATED_BY = emp;
                        item.crisp_score_criteria.UPDATED_BY = emp;
                        item.crisp_score_criteria.CREATED_DATE = DateTime.Now;
                        item.crisp_score_criteria.UPDATED_DATE = DateTime.Now;
                        item.crisp_score_criteria.SCORE = GetScore(item.crisp_score_criteria, config.CRISP_CRITERIA);
                        item.crisp_score_criteria.CRISP_SCORES_PROJECT_ID = cpc.ID;
                        CSPdb.CRISP_SCORES_CRITERIA.Add(item.crisp_score_criteria);
                    }
                    if (validation != null)
                    {
                        validation.UPDATED_BY = emp;
                        validation.UPDATED_DATE = DateTime.Now;
                        validation.ACHIEVED = item.crisp_score_validations.ACHIEVED;
                        CSPdb.CRISP_SCORES_VALIDATIONS.Update(validation);
                    }
                    else
                    {
                        item.crisp_score_validations.CREATED_BY = emp;
                        item.crisp_score_validations.UPDATED_BY = emp;
                        item.crisp_score_validations.CREATED_DATE = DateTime.Now;
                        item.crisp_score_validations.UPDATED_DATE = DateTime.Now;
                        item.crisp_score_validations.CRISP_SCORES_PROJECT_ID = cpc.ID;
                        CSPdb.CRISP_SCORES_VALIDATIONS.Add(item.crisp_score_validations);
                    }


                }
                cpc.CSM_GENERATED_COMMENTS = string.Join(", ", crispAutomationList.Where(x => !string.IsNullOrWhiteSpace(x.Comments)).Select(x => x.Comments).OrderBy(x => x).Distinct());

                if (crisp_scores_categoryExistingList.Any())
                {
                    cpc.SCORE = 0;
                    foreach (var item in crisp_scores_categoryExistingList)
                    {
                        var criteriaIds = config.CRISP_CRITERIA.Where(x => x.CATEGORY_ID == item.CATEGORY_ID).Select(x => x.ID).ToList();
                        item.SCORE = crisp_scores_criteriaList.Where(x => criteriaIds.Contains(x.CRITERIA_ID)).Sum(x => x.SCORE); //crispAutomationList.Where(x => criteriaIds.Contains(x.crisp_score_criteria.CRITERIA_ID)).Sum(x => x.crisp_score_criteria.SCORE);
                        CSPdb.CRISP_SCORES_CATEGORY.Update(item);
                        cpc.SCORE += item.SCORE;
                    }
                }
                else
                {
                    crisp_scores_categoryList = new List<CRISP_SCORES_CATEGORY>();
                    foreach (var item in config.CRISP_CATEGORY)
                    {
                        var newCategory = new CRISP_SCORES_CATEGORY
                        {
                            CREATED_BY = emp,
                            UPDATED_BY = emp,
                            CATEGORY_ID = item.ID,
                            CRISP_SCORES_PROJECT_ID = cpc.ID,
                            COMMENTS = "Auto Generated",
                            CREATED_DATE = DateTime.Now,
                            UPDATED_DATE = DateTime.Now,
                            ISACTIVE = true,
                        };
                        crisp_scores_categoryList.Add(newCategory);
                    }
                    CSPdb.Commit(CanCommit);
                    cpc.SCORE = 0;
                    foreach (var item in crisp_scores_categoryList)
                    {
                        var criteriaIds = config.CRISP_CRITERIA.Where(x => x.CATEGORY_ID == item.CATEGORY_ID).Select(x => x.ID).ToList();
                        item.SCORE = crispAutomationList.Where(x => criteriaIds.Contains(x.crisp_score_criteria.CRITERIA_ID)).Sum(x => x.crisp_score_criteria.SCORE);
                        CSPdb.CRISP_SCORES_CATEGORY.Add(item);
                        cpc.SCORE += item.SCORE;
                    }
                }

                cpc.NEED_FOCUS = cpc.SCORE < 90;
                CSPdb.CRISP_SCORES_PROJECT.Update(cpc);
                CSPdb.Commit(CanCommit);
                return;
            }

            //from 1 to 11
            var sowKpiResult = GetKPICRISPSOW(kpiscoreSow, config.CRISP_VALIDATIONS);
            if (sowKpiResult.CreateActionItem)
            {
                CreateActionItem(kpiscoreSow, custId, projId, month + "-" + year);
            }
            crispAutomationList.Add(sowKpiResult);
            crispAutomationList.Add(GetKPICRISPGoal(nonSOWkpiscore, kpiscoreSow.Any(), config.CRISP_VALIDATIONS));
            crispAutomationList.Add(GetRiskCRISP(risk_score, config.CRISP_VALIDATIONS));
            crispAutomationList.Add(GetIssuesCRISP(issue_score, config.CRISP_VALIDATIONS));
            crispAutomationList.Add(GetIdeasCRISP(ideas_score, config.CRISP_VALIDATIONS));
            crispAutomationList.Add(GetImprovementsCRISP(improvements_score, config.CRISP_VALIDATIONS));
            crispAutomationList.Add(GetConcernsCRISP(concerns_score, IsActionitemsPending(projId, endDate, "CSS"), config.CRISP_VALIDATIONS));
            crispAutomationList.Add(GetCSATCRISP(csat_score, config.CRISP_VALIDATIONS));
            crispAutomationList.Add(GetAuditReportFindingsforCRISP(mandatoryAudit_score, IsActionitemsPending(projId, endDate, ""), config.CRISP_VALIDATIONS));
            crispAutomationList.Add(GetHippaScoreforCRISP("", config.CRISP_VALIDATIONS));
            crispAutomationList.Add(GetPCFindingsforCRISP(training_score, config.CRISP_VALIDATIONS));


            cpc = new CRISP_SCORES_PROJECT
            {
                ISACTIVE = true,
                CUSTOMER_ID = custId,
                PROJECT_ID = projId,
                PUBLISH_DATE = startDate,
                CREATED_BY = emp,
                UPDATED_BY = emp,
                STATUS = "NEW",
                CREATED_DATE = DateTime.Now,
                UPDATED_DATE = DateTime.Now,
                COMMENTS = "Auto Generated",
            };
            CSPdb.CRISP_SCORES_PROJECT.Add(cpc);
            CSPdb.Commit(CanCommit);
            foreach (var item in config.CRISP_CATEGORY)
            {
                var newCategory = new CRISP_SCORES_CATEGORY
                {
                    CREATED_BY = emp,
                    UPDATED_BY = emp,
                    CATEGORY_ID = item.ID,
                    CRISP_SCORES_PROJECT_ID = cpc.ID,
                    COMMENTS = "Auto Generated",
                    CREATED_DATE = DateTime.Now,
                    UPDATED_DATE = DateTime.Now,
                    ISACTIVE = true,
                };
                crisp_scores_categoryList.Add(newCategory);
            }
            CSPdb.Commit(CanCommit);
            foreach (var item in crispAutomationList)
            {
                item.crisp_score_criteria.CREATED_BY = emp;
                item.crisp_score_criteria.UPDATED_BY = emp;
                item.crisp_score_criteria.CREATED_DATE = DateTime.Now;
                item.crisp_score_criteria.UPDATED_DATE = DateTime.Now;
                item.crisp_score_criteria.SCORE = GetScore(item.crisp_score_criteria, config.CRISP_CRITERIA);
                item.crisp_score_criteria.CRISP_SCORES_PROJECT_ID = cpc.ID;
                item.crisp_score_validations.CREATED_BY = emp;
                item.crisp_score_validations.UPDATED_BY = emp;
                item.crisp_score_validations.CREATED_DATE = DateTime.Now;
                item.crisp_score_validations.UPDATED_DATE = DateTime.Now;
                item.crisp_score_validations.CRISP_SCORES_PROJECT_ID = cpc.ID;
                CSPdb.CRISP_SCORES_CRITERIA.Add(item.crisp_score_criteria);
                CSPdb.CRISP_SCORES_VALIDATIONS.Add(item.crisp_score_validations);
            }
            cpc.CSM_GENERATED_COMMENTS = string.Join(", ", crispAutomationList.Where(x => !string.IsNullOrWhiteSpace(x.Comments)).Select(x => x.Comments).OrderBy(x => x).Distinct());
            var score = 0;
            foreach (var item in crisp_scores_categoryList)
            {
                var criteriaIds = config.CRISP_CRITERIA.Where(x => x.CATEGORY_ID == item.CATEGORY_ID).Select(x => x.ID).ToList();
                item.SCORE = crispAutomationList.Where(x => criteriaIds.Contains(x.crisp_score_criteria.CRITERIA_ID)).Sum(x => x.crisp_score_criteria.SCORE);
                CSPdb.CRISP_SCORES_CATEGORY.Add(item);
                score += item.SCORE;
            }
            cpc.SCORE = score;
            cpc.NEED_FOCUS = cpc.SCORE < 90;
            CSPdb.CRISP_SCORES_PROJECT.Update(cpc);
            CSPdb.Commit(CanCommit);
        }

        private void SendCRISPScoresMailAuto(string ToEmailId, string To, string cc, string Subject, List<CRISPScores> scores, string period, string path, bool isPremier, DateTime date, bool sendCCtoQualityHead = false)
        {


            //string SenderEmaiId = string.Empty;
            string filePath = HttpContext.Current.Server.MapPath("~/UploadFile/Mails/") + path;
            using (System.IO.StreamReader sr = new StreamReader(filePath))
            {
                if (sendCCtoQualityHead)
                {
                    if (!string.IsNullOrEmpty(cc))
                        cc = cc + "," + Constants.QUALITY_HEAD;
                    else cc = Constants.QUALITY_HEAD;
                }
                string emailContent = sr.ReadToEnd();
                emailContent = emailContent.Replace("{{TABLE}}", isPremier ? GetCrispScoresTableAutoForPremier(scores, period, date) : GetCrispScoresTableAuto(scores, period, date));
                emailContent = emailContent.Replace("{{TO_NAME}}", To);
                //emailContent = emailContent.Replace("{{TO_NAME}}", "Quality Team");
                var ep = new EmailProvider(Cldb, CSPdb);
                ep.SendEmail
                    (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = ToEmailId, cc = cc, bcc = Constants.BCC, content = emailContent, subject = Subject, hasAttachments = false, attachmentFilePath = "" }, Request
                    );
            }
        }
        private string GetCrispScoresTableAutoForPremier(List<CRISPScores> scoresList, string period, DateTime date)
        {
            StringBuilder sb = new StringBuilder();
            foreach (var item1 in scoresList.GroupBy(x => x.PORTFOLIO))
            {
                var scores = item1.OrderByDescending(x => x.TOTAL).ToList();
                sb.Append("<table style='border: 1px solid #A49D9C;border-collapse: collapse;font-family: Tahoma;font-size: 11px; color: #636363;padding: 3px;background-color: white;width = auto;cellpadding=2;'>");
                sb.Append("<tr>");
                sb.Append($"<th colspan=2>{item1.First().CUST_NM} - {item1.Key}</th>");
                //sb.Append("<th rowspan=2>Project</th>");

                sb.Append("<th colspan=6>CRISP Scores for " + period + "</th>");
                sb.Append("</tr>\n");


                sb.Append("<tr>");
                //sb.Append("<th>CSM</th>");

                //sb.Append("<th>Published Date</th>");

                //sb.Append("<th width='auto'>Portfolio</th>");
                sb.Append("<th class='crisp'>Project</th>");
                sb.Append("<th>Status</th>");

                sb.Append("<th>C<br/>(30)*</th>");
                sb.Append("<th>R<br/>(15)</th>");
                sb.Append("<th>I<br/>(20)</th>");
                sb.Append("<th>S<br/>(20)</th>");
                sb.Append("<th>P<br/>(15)</th>");
                sb.Append("<th>TOTAL</th>");

                //sb.Append("<th width='*' class='comments'>CSM System Remarks<br/>(CRISP Criteria(s) not met)</th>");
                //sb.Append("<th class='comments'>QA Remarks</th>");
                sb.Append("</tr>\n");

                foreach (CRISPScores item in scores)
                {
                    sb.Append("<tr>");
                    //sb.Append("<td>"); sb.Append(item.CSM); sb.Append("</td>");
                    //sb.Append("<td>"); sb.Append(item.CUST_NM); sb.Append("</td>");

                    //   sb.Append($"<td >{item.PORTFOLIO}</td>");
                    //

                    sb.Append($"<td class='crisp'><a href='{helper.GetAbsoulteUri()}/layout/crisp-report/{item.CUST_ID}/{item.PROJ_ID}/{date.Year}/{MonthLiterals[date.Month]}'>{item.PROJ_NM }</a></td>");
                    //sb.Append("<td>"); sb.Append(item.PUBLISH_DATE); sb.Append("</td>");

                    if (item.TOTAL >= 98)
                    {
                        sb.Append($"<td class='statusgreen'>Under Control</td>");
                    }
                    else if (item.TOTAL >= 90)
                    {
                        sb.Append($"<td class='statusorange'>Need Focus</td>");
                    }
                    else
                    {
                        sb.Append($"<td class='statusred'>Need Immediate Attention</td>");
                    }
                    sb.Append($"<td class='crisp'>{item.C }</td>");
                    sb.Append($"<td class='crisp'>{item.R }</td>");
                    sb.Append($"<td class='crisp'>{item.I }</td>");
                    sb.Append($"<td class='crisp'>{item.S }</td>");
                    sb.Append($"<td class='crisp'>{item.P }</td>");
                    sb.Append($"<td class='crisp'>{item.TOTAL }</td>");

                    //sb.Append($"<td class='comments'>{item.CSM_GENERATED_COMMENTS }</td>");
                    //sb.Append($"<td class='comments'>{item.COMMENTS }</td>");
                    sb.Append("</tr>\n");
                }
                sb.Append("</table>");
                sb.Append("<br/>");
            }

            return sb.ToString();
        }
        private string GetCrispScoresTableAuto(List<CRISPScores> scoresList, string period, DateTime date)
        {
            StringBuilder sb = new StringBuilder();
            foreach (var item1 in scoresList.GroupBy(x => x.CUST_NM))
            {
                var scores = item1.OrderByDescending(x => x.TOTAL).ToList();
                sb.Append("<table width='auto' cellpadding='2'>\n");
                sb.Append("<tr>");


                sb.Append($"<th colspan=2>{item1.Key}</th>");

                sb.Append("<th colspan=6>CRISP Scores for " + period + "</th>");
                sb.Append("</tr>\n");


                sb.Append("<tr>");
                //sb.Append("<th>CSM</th>");

                //sb.Append("<th>Published Date</th>");

                sb.Append("<th class='crisp'>Project</th>");
                sb.Append("<th>Status</th>");

                sb.Append("<th>C<br/>(30)*</th>");
                sb.Append("<th>R<br/>(15)</th>");
                sb.Append("<th>I<br/>(20)</th>");
                sb.Append("<th>S<br/>(20)</th>");
                sb.Append("<th>P<br/>(15)</th>");
                sb.Append("<th>TOTAL</th>");

                //sb.Append("<th width='*' class='comments'>CSM System Remarks<br/>(CRISP Criteria(s) not met)</th>");
                //sb.Append("<th class='comments'>QA Remarks</th>");
                sb.Append("</tr>\n");

                foreach (CRISPScores item in scores)
                {
                    sb.Append("<tr>");
                    //sb.Append("<td>"); sb.Append(item.CSM); sb.Append("</td>");
                    //sb.Append("<td>"); sb.Append(item.CUST_NM); sb.Append("</td>");

                    sb.Append($"<td class='crisp'><a href='{helper.GetAbsoulteUri()}/layout/crisp-report/{item.CUST_ID}/{item.PROJ_ID}/{date.Year}/{MonthLiterals[date.Month]}'>{item.PROJ_NM }</a></td>");
                    //sb.Append("<td>"); sb.Append(item.PUBLISH_DATE); sb.Append("</td>");

                    if (item.TOTAL >= 98)
                    {
                        sb.Append($"<td class='statusgreen'>Under Control</td>");
                    }
                    else if (item.TOTAL >= 90)
                    {
                        sb.Append($"<td class='statusorange'>Need Focus</td>");
                    }
                    else
                    {
                        sb.Append($"<td class='statusred'>Need Immediate Attention</td>");
                    }
                    sb.Append($"<td class='crisp'>{item.C }</td>");
                    sb.Append($"<td class='crisp'>{item.R }</td>");
                    sb.Append($"<td class='crisp'>{item.I }</td>");
                    sb.Append($"<td class='crisp'>{item.S }</td>");
                    sb.Append($"<td class='crisp'>{item.P }</td>");
                    sb.Append($"<td class='crisp'>{item.TOTAL }</td>");

                    //sb.Append($"<td class='comments'>{item.CSM_GENERATED_COMMENTS }</td>");
                    //sb.Append($"<td class='comments'>{item.COMMENTS }</td>");
                    sb.Append("</tr>\n");
                }
                sb.Append("</table>");
                sb.Append("<br/>");
            }

            return sb.ToString();
        }

        private int GetScore(CRISP_SCORES_CRITERIA cri, List<CRISP_CRITERIA> master)
        {
            var maxScore = master.FirstOrDefault(x => x.ID == cri.CRITERIA_ID);
            if (maxScore == null) return 0;
            return Convert.ToInt32(Math.Ceiling((Convert.ToDecimal(cri.SCORE_PERCENTAGE) / 100) * maxScore.SCORE));
        }

        private bool IsActionitemsPending(string projectId, DateTime endDate, string actionItemType)
        {
            var pendingitems = CSPdb.PROJECT_ACTIONITEM.GetAll().Where(x => x.ISACTIVE && x.PROJECT_ID == projectId && (actionItemType == "" || x.SOURCE == actionItemType)
            && x.STATUS != "Completed" && x.STATUS != "Cancelled" && x.STATUS != "Closed" && x.STATUS != "Suspended").ToList();
            pendingitems = pendingitems.Where(x => x.TARGET_DATE.HasValue && x.TARGET_DATE < endDate).ToList();
            return pendingitems.Any();
        }

        private void CreateActionItem(List<string> kpiScores, string custId, string projId, string period)
        {
            //todo: remove code after 2 days
            if (DateTime.Now.Month == 10) return;
            var overview = new ActionItemsViewDetails();
            overview.CUST_ID = custId;
            overview.PROJ_ID = projId;
            overview.RAG = "Red";
            overview.DESCRIPTION = $"{kpiScores.Count(x => x == "RED" || x == "AMBER").ToString()} out of {kpiScores.Count} KPIs not met the target specified in SOW for the period {period}. Perform RCA, prepare CAPA and submit Service Improvement Plan to customer";
            overview.SOURCE = $"CRISP - {period}";
            overview.SOURCE_DESCRIPTION = $"CRISP - {period}";
            overview.OWNER = "Team";

            overview.IDENTIFIED_DATE = DateTime.Today;
            overview.TARGET_DATE = DateTime.Today.AddDays(7);
            overview.STATUS = "In Progress";
            overview.PRIORITY = "High";

            overview.CREATED_BY = "SYSTEM";
            overview.CREATED_DATE = DateTime.Now;
            overview.UPDATED_BY = "SYSTEM";
            overview.UPDATED_DATE = DateTime.Now;
            overview.ISACTIVE = true;

            AddActionItemInternal(overview);
        }
    }

    public class CrispConfigHolder
    {
        public List<CRISP_CRITERIA> CRISP_CRITERIA { get; set; }
        public List<CRISP_CATEGORY> CRISP_CATEGORY { get; set; }
        public List<CRISP_VALIDATIONS> CRISP_VALIDATIONS { get; set; }

    }
}