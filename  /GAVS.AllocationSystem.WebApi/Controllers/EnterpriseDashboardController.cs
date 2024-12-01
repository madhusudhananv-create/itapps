using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("GetNPSScoreDataRange")]
        [ActionName("GetNPSScoreDataRange")]
        [HttpGet]
        public IHttpActionResult GetNPSScoreDataRange(string Quarter, string pQuarter, string cQuarter, string custIds)
        {
            List<string> lstQuarters = getQuarters();
            string Quarter1 = "";
            string Quarter2 = "";
            //string Quarter3 = "";
            //string Quarter4 = "";

            if (lstQuarters.Count > 3)
            {
                cQuarter = lstQuarters[0];
                pQuarter = lstQuarters[1];
                Quarter1 = lstQuarters[2];
                Quarter2 = lstQuarters[3];
            }


            ClsNPSScoreDataQuarter result = new ClsNPSScoreDataQuarter();
            List<PROJECT_CUSTOMER_NPS_DATA> csatdata = CSPdb.AppRepo.GetCSSTable(Quarter, pQuarter, cQuarter, custIds).ToList();



            result.lastQuarter = pQuarter;
            result.currentQuarter = cQuarter;

            result.Quarter1 = Quarter1;
            result.Quarter2 = Quarter2;


            //Dictionary<int?, List<int?>> empDict = new Dictionary<int?, List<int?>>();
            Dictionary<int?, List<clsQuarterDict>> empDict = new Dictionary<int?, List<clsQuarterDict>>();

            Dictionary<string, List<clsQuarterDict>> empDictCurrent = new Dictionary<string, List<clsQuarterDict>>();
            //Dictionary<string, List<clsQuarterDict>> empDictCurrentTemp = new Dictionary<string, List<clsQuarterDict>>();
            Dictionary<string, List<clsQuarterDict>> empDictLast = new Dictionary<string, List<clsQuarterDict>>();
            //Dictionary<string, List<clsQuarterDict>> empDictLastTemp = new Dictionary<string, List<clsQuarterDict>>();

            List<ClsNPSViewDetails> lstNPSViewDetails = new List<ClsNPSViewDetails>();

            List<ClsNPSViewDetails> lstAllProjectsByNPSScore = new List<ClsNPSViewDetails>();

            List<ClsCSATNPSViewDetails> lstCSATNPSDetails = new List<ClsCSATNPSViewDetails>();


            foreach (var csat in csatdata.Where(x => x.YEAR_QUARTER == cQuarter))
            {
                if (csat.NPS_SCORE >= 9)
                    result.Promotors++;

                if (csat.NPS_SCORE == 7 || csat.NPS_SCORE == 8)
                    result.Passives++;

                if (csat.NPS_SCORE <= 6)
                    result.Detractors++;


                

            }


            foreach (var csat in csatdata.Where(x => x.YEAR_QUARTER == pQuarter))
            {
                if (csat.NPS_SCORE >= 9)
                    result.PQPromotors++;

                if (csat.NPS_SCORE == 7 || csat.NPS_SCORE == 8)
                    result.PQPassives++;

                if (csat.NPS_SCORE <= 6)
                    result.PQDetractors++;
            }


            // get the max response from current quarter


            foreach (var csat in csatdata.Where(x => x.YEAR_QUARTER == cQuarter))
            {


                List<clsQuarterDict> output = new List<clsQuarterDict>();
                List<clsQuarterDict> list = new List<clsQuarterDict>();



                if (csat.RESPONDENT_NAME != null)
                {

                    if (!empDictCurrent.ContainsKey(csat.RESPONDENT_NAME.ToString()))
                    {
                        //output.Add(csat.NPS_SCORE);
                        output.Add(new clsQuarterDict(csat.ID, csat.YEAR_QUARTER, csat.NPS_SCORE));
                        empDictCurrent.Add(csat.RESPONDENT_NAME.ToString(), output);
                    }
                    else
                    {
                        if (empDictCurrent.TryGetValue(csat.RESPONDENT_NAME.ToString(), out list))
                        {
                            //list.Add(csat.NPS_SCORE);
                            list.Add(new clsQuarterDict(csat.ID, csat.YEAR_QUARTER, csat.NPS_SCORE));
                        }

                        empDictCurrent[csat.RESPONDENT_NAME.ToString()] = list;
                    }
                }
            }


            foreach (var key in empDictCurrent.Keys)
            {
                AddNPSDetails(empDictCurrent, csatdata, lstAllProjectsByNPSScore, key, "");
            }


                //foreach (var key in empDictCurrent.Keys)
                //    {
                //        if (empDictCurrent[key].Count > 0)
                //        {
                //            var maxValue = Max(empDictCurrent[key]);
                //            clsQuarterDict clsTemp = new clsQuarterDict(cQuarter, maxValue);
                //            List<clsQuarterDict> listTemp = new List<clsQuarterDict>();
                //            listTemp.Add(clsTemp);
                //            empDictCurrentTemp.Add(key, listTemp);
                //        }
                //    }


                // get the max response from last quarter


                foreach (var csat in csatdata.Where(x => x.YEAR_QUARTER == pQuarter))
            {

                List<clsQuarterDict> output = new List<clsQuarterDict>();
                List<clsQuarterDict> list = new List<clsQuarterDict>();



                if (csat.RESPONDENT_NAME != null)
                {

                    if (!empDictLast.ContainsKey(csat.RESPONDENT_NAME.ToString()))
                    {

                        output.Add(new clsQuarterDict(csat.ID, csat.YEAR_QUARTER, csat.NPS_SCORE));
                        empDictLast.Add(csat.RESPONDENT_NAME.ToString(), output);
                    }
                    else
                    {
                        if (empDictLast.TryGetValue(csat.RESPONDENT_NAME.ToString(), out list))
                        {

                            list.Add(new clsQuarterDict(csat.ID, csat.YEAR_QUARTER, csat.NPS_SCORE));
                        }

                        empDictLast[csat.RESPONDENT_NAME.ToString()] = list;
                    }
                }
            }


            //foreach (var key in empDictLast.Keys)
            //{
            //    if (empDictLast[key].Count > 0)
            //    {
            //     var maxValue = Max(empDictLast[key]);
            //     var maxvalue = empDictLast.Select(x => x.Key).Max();
            //       clsQuarterDict clsTemp = new clsQuarterDict(cQuarter, maxValue);
            //        List<clsQuarterDict> listTemp = new List<clsQuarterDict>();
            //        listTemp.Add(clsTemp);
            //        empDictLastTemp.Add(key, listTemp);
            //    }
            //}


            foreach (var key in empDictLast.Keys)
            {
                if (empDictCurrent.ContainsKey(key))
                {
                    if (empDictLast[key].Count > 0 && empDictCurrent[key].Count > 0)
                    {

                        if (empDictLast[key][0].Response >= 9 && empDictCurrent[key][0].Response >= 9)
                        {
                            result.Propro++;
                            AddNPSDetails(empDictCurrent, csatdata, lstNPSViewDetails, key, "Propro");
                        }

                        if (empDictLast[key][0].Response >= 9 && (empDictCurrent[key][0].Response == 7 || empDictCurrent[key][0].Response == 8))
                        {
                            result.Propas++;
                            AddNPSDetails(empDictCurrent, csatdata, lstNPSViewDetails, key, "Propas");
                        }

                        if (empDictLast[key][0].Response >= 9 && empDictCurrent[key][0].Response <= 6)
                        {
                            result.Prodet++;
                            AddNPSDetails(empDictCurrent, csatdata, lstNPSViewDetails, key, "Prodet");
                        }

                        if ((empDictLast[key][0].Response == 7 || empDictLast[key][0].Response == 8) && (empDictCurrent[key][0].Response == 7 || empDictCurrent[key][0].Response == 8))
                        {
                            result.Paspas++;
                            AddNPSDetails(empDictCurrent, csatdata, lstNPSViewDetails, key, "Paspas");
                            //AddNPSDetails1(empDictCurrent, csatdata, lstNPSViewDetails, key, "Paspas");
                        }

                        if ((empDictLast[key][0].Response == 7 || empDictLast[key][0].Response == 8) && empDictCurrent[key][0].Response >= 9)
                        {
                            result.Paspro++;
                            AddNPSDetails(empDictCurrent, csatdata, lstNPSViewDetails, key, "Paspro");
                        }

                        if ((empDictLast[key][0].Response == 7 || empDictLast[key][0].Response == 8) && empDictCurrent[key][0].Response <= 6)
                        {
                            result.Pasdet++;
                            AddNPSDetails(empDictCurrent, csatdata, lstNPSViewDetails, key, "Pasdet");
                        }

                        if (empDictLast[key][0].Response <= 6 && empDictCurrent[key][0].Response <= 6)
                        {
                            result.Detdet++;
                            AddNPSDetails(empDictCurrent, csatdata, lstNPSViewDetails, key, "Detdet");

                        }

                        if (empDictLast[key][0].Response <= 6 && empDictCurrent[key][0].Response >= 9)
                        {
                            result.Detpro++;
                            AddNPSDetails(empDictCurrent, csatdata, lstNPSViewDetails, key, "Detpro");
                        }

                        if (empDictLast[key][0].Response <= 6 && (empDictCurrent[key][0].Response == 7 || empDictCurrent[key][0].Response == 8))
                        {
                            result.Detpas++;
                            AddNPSDetails(empDictCurrent, csatdata, lstNPSViewDetails, key, "Detpas");
                        }


                    }

                }
            }

            result.ListNPSViewDetails = lstNPSViewDetails;
            //result.ListNPSViewDetails = AddNPSDetails(empDictCurrent,csatdata, lstNPSViewDetails,key,)
            //int year = DateTime.Now.Year;

            result.ListCSATScoreDetails = getCSATScoreDetails(lstQuarters, csatdata);


            result.ListNPSScoreDetails = getNPSScoreDetails(csatdata, cQuarter);

            result.ListAllProjectsByNPSScore = lstAllProjectsByNPSScore;


            return Ok(result);
        }



        private void AddNPSDetails(Dictionary<string, List<clsQuarterDict>> empDictCurrent, List<PROJECT_CUSTOMER_NPS_DATA> csatdata, List<ClsNPSViewDetails> lstNPSViewDetails, string key, string NPSStatus)
        {
            List<ClsNPSViewDetails> lst = new List<ClsNPSViewDetails>();
            ClsNPSViewDetails clsNPSViewDetails = GetCSATNPSDetails(csatdata, Convert.ToInt32(empDictCurrent[key][0].ID), NPSStatus);
            lstNPSViewDetails.Add(clsNPSViewDetails);            
        }        



        //private void AddNPSDetails1(Dictionary<string, List<clsQuarterDict>> empDictCurrent, List<PROJECT_CUSTOMER_NPS_DATA> csatdata, List<ClsNPSViewDetails> lstNPSViewDetails, string key, string NPSStatus)
        //{
        //    List<ClsCSATNPSViewDetails> lstClsCSATNPSViewDetails = new List<ClsCSATNPSViewDetails>();
            
        //    ClsCSATNPSViewDetails clsCSATNPSViewDetails = GetCSATNPSDetails1(csatdata, Convert.ToInt32(empDictCurrent[key][0].ID), NPSStatus);
        //    lstClsCSATNPSViewDetails.Add(clsCSATNPSViewDetails);
        //}

        [GET("GetNPScoreData")]
        [ActionName("GetNPScoreData")]
        [HttpGet]
        public IHttpActionResult GetNPScoreData(string Quarter)
        {

            List<PROJECT_CSAT_DATA> csatdata = CSPdb.AppRepo.GetCSSTable(Quarter).ToList();

            IEnumerable<string> Quarters = csatdata.Select(x => x.YEAR_QUARTER).OrderBy(x => x).Distinct();


            ClsNPSScoreDataQuarter result = new ClsNPSScoreDataQuarter();

            int i = 0;

            foreach (var item in Quarters)
            {
                if (i == 0)
                    result.lastQuarter = item;
                else
                    result.currentQuarter = item;

                i++;
            }


            return Ok(result);

        }

        public class clsQuarterDict
        {
            public long? ID;
            public string Quarter;
            public int? Response;

            public clsQuarterDict(long? vID, string vQuarter, int? vResponse)
            {
                ID = vID;
                Quarter = vQuarter;
                Response = vResponse;
            }
        }


        public class ClsNPSScore
        {
            public int Score;
            public int NPSProjectCount;

            public ClsNPSScore(int vScore, int vNPSProjectCount)
            {
                Score = vScore;
                NPSProjectCount = vNPSProjectCount;
            }
        }

       

        [GET("GetNPScoreDataDetails")]
        [ActionName("GetNPScoreDataDetails")]
        [HttpGet]
        public IHttpActionResult GetNPScoreDataDetails(string Quarter, string pQuarter, string cQuarter, string custIds)
        {

            //List<PROJECT_CSAT_DATA> csatdata = CSPdb.AppRepo.GetCSSTable(Quarter).ToList();
            List<PROJECT_CUSTOMER_NPS_DATA> csatdata = CSPdb.AppRepo.GetCSSTable(Quarter, pQuarter, cQuarter, custIds).ToList();

            List<ClsNPSViewDetails> result = new List<ClsNPSViewDetails>();

            foreach (var csat in csatdata.Where(x => x.YEAR_QUARTER == pQuarter))
            {

            }

            //GetCustomerTitle()




            return Ok(result);

        }



        public List<ClsNPSScoreDetails> getNPSScoreDetails(List<PROJECT_CUSTOMER_NPS_DATA> csatdata, string quarter)
        {
            List<ClsNPSScoreDetails> lstNPSScoreDetails = new List<ClsNPSScoreDetails>();
            int iNPSScoreProjectsCount = 0;

            for (int i = 1; i <= 10; i++)
            {
                iNPSScoreProjectsCount = csatdata.Where(t => t.NPS_SCORE == i && t.YEAR_QUARTER == quarter).ToList().Count;
                ClsNPSScoreDetails clsNPSScoreDetails = new ClsNPSScoreDetails(i, iNPSScoreProjectsCount);
                lstNPSScoreDetails.Add(clsNPSScoreDetails);
            }

            return lstNPSScoreDetails;
        }

        private List<ClsCSATScoreDetails> getCSATScoreDetails(List<string> lstQuarters, List<PROJECT_CUSTOMER_NPS_DATA> csatdata)
        {
            List<ClsCSATScoreDetails> lstCSATScoreDetails = new List<ClsCSATScoreDetails>();

            //string squarter = string.Empty;
            //int year = iyear;
            int iCSATCount = 0;
            //int y = ((year + 1) % 100);


            //string quart1 = "Q1" + " " + year + "-" + y;
            //string quart2 = "Q2" + " " + year + "-" + y;
            //string quart3 = "Q3" + " " + year + "-" + y;
            //string quart4 = "Q4" + " " + year + "-" + y;



            int iMinScore = 2;
            for (int i = 1; i <= 1; i++)
            {
                //squarter = "Q" + i + " " + year + "-" + y;
                iCSATCount = csatdata.Where(t => t.MIN_SCORE <= iMinScore && t.YEAR_QUARTER == lstQuarters[i - 1]).ToList().Count;
                ClsCSATScoreDetails clsDetails = new ClsCSATScoreDetails(1, lstQuarters[i - 1].ToString(), iCSATCount);
                lstCSATScoreDetails.Add(clsDetails);
            }

            iMinScore = 3;
            for (int i = 1; i <= 1; i++)
            {
                //squarter = "Q" + i + " " + year + "-" + y;
                iCSATCount = csatdata.Where(t => t.MIN_SCORE == iMinScore && t.YEAR_QUARTER == lstQuarters[i - 1]).ToList().Count;
                ClsCSATScoreDetails clsDetails = new ClsCSATScoreDetails(2, lstQuarters[i - 1].ToString(), iCSATCount);
                lstCSATScoreDetails.Add(clsDetails);
            }

            iMinScore = 4;
            for (int i = 1; i <= 1; i++)
            {
                //squarter = "Q" + i + " " + year + "-" + y;
                iCSATCount = csatdata.Where(t => t.MIN_SCORE == iMinScore && t.YEAR_QUARTER == lstQuarters[i - 1]).ToList().Count;
                ClsCSATScoreDetails clsDetails = new ClsCSATScoreDetails(3, lstQuarters[i - 1].ToString(), iCSATCount);
                lstCSATScoreDetails.Add(clsDetails);
            }

            iMinScore = 5;
            for (int i = 1; i <= 1; i++)
            {
                //squarter = "Q" + i + " " + year + "-" + y;
                iCSATCount = csatdata.Where(t => t.MIN_SCORE == iMinScore && t.YEAR_QUARTER == lstQuarters[i - 1]).ToList().Count;
                ClsCSATScoreDetails clsDetails = new ClsCSATScoreDetails(4, lstQuarters[i - 1].ToString(), iCSATCount);
                lstCSATScoreDetails.Add(clsDetails);
            }


            return lstCSATScoreDetails;
        }

        private List<string> getQuarters()
        {

            List<string> lstQuarters = new List<string>();

            List<CSS_BATCHES> cssBatches = CSPdb.CSS_BATCHES.GetAll().OrderByDescending(x=>x.END_DATE).Take(4).ToList();

            foreach (var item in cssBatches)
            {
                if(item.YEAR.ToString() != null && item.YEAR.ToString().Length > 3)
                    lstQuarters.Add("Q" + item.SEQUENCE + " " + item.YEAR + "-" + (item.YEAR +1).ToString().Substring(2,2));
            }

            return lstQuarters;

        }


        // Added Newly from AllsysController.cs

        //public int Max(List<clsQuarterDict> lst)
        //{
        //    int max = 0;
        //    for (int i = 0; i < lst.Count; i++)
        //    {
        //        if (max < lst[i].Response)
        //            max = Convert.ToInt32(lst[i].Response);
        //    }
        //    return max;
        //}


        CSATNPSSubDetails AddCSATNPSSubDetails(int ID, ClsCSATNPSViewDetails lstPCCND, List<PROJECT_CUSTOMER_NPS_DATA> csatdata, string quarter)
        {

            var objVerify = csatdata.Find(x => x.PROJECT_ID == lstPCCND.Project_ID && x.RESPONDENT_NAME == lstPCCND.Respondant_NAME && x.YEAR_QUARTER == quarter);
            CSATNPSSubDetails clsCSATNPSSubDetails = new CSATNPSSubDetails();

            if (objVerify != null)
            {

                clsCSATNPSSubDetails.Quarter = quarter;
                clsCSATNPSSubDetails.CSS = objVerify.MIN_SCORE.HasValue ? objVerify.MIN_SCORE.Value : 0;
                clsCSATNPSSubDetails.NPS = objVerify.NPS_SCORE.HasValue ? objVerify.NPS_SCORE.Value : 0;
                clsCSATNPSSubDetails.QualityScore = objVerify.OVERALL_QUALITY_OF_DELIVERABLE.HasValue ? objVerify.OVERALL_QUALITY_OF_DELIVERABLE.Value : 0;
                clsCSATNPSSubDetails.SuccessScore = objVerify.ENABLING_SUCCESS.HasValue ? objVerify.ENABLING_SUCCESS.Value : 0;
                clsCSATNPSSubDetails.ValueaddScore = objVerify.VALUE_ADDS.HasValue ? objVerify.VALUE_ADDS.Value : 0;
                clsCSATNPSSubDetails.CSSQualityFeedback = objVerify.OVERALL_QUALITY_OF_DELIVERABLE_REMARKS;
                clsCSATNPSSubDetails.CSSSuccesssFeedback = objVerify.ENABLING_SUCCESS_REMARKS;
                clsCSATNPSSubDetails.CSSValueaddFeedback = objVerify.VALUE_ADDS_REMARKS;
                clsCSATNPSSubDetails.NPSFeedback = objVerify.NPS_REMARKS;

            }

            return clsCSATNPSSubDetails;

        }



        //public ClsCSATNPSViewDetails GetCSATNPSDetails1(List<PROJECT_CUSTOMER_NPS_DATA> csatdata, int ID, string vNSPType)
        //{

        //    List<string> lstQuarters = getQuarters();
        //    string Quarter1 = "";
        //    string Quarter2 = "";
        //    string Quarter3 = "";
        //    string Quarter4 = "";

        //    if (lstQuarters.Count > 3)
        //    {
        //        Quarter4 = lstQuarters[0];
        //        Quarter3 = lstQuarters[1];
        //        Quarter2 = lstQuarters[2];
        //        Quarter1 = lstQuarters[3];
        //    }

        //    ClsCSATNPSViewDetails lstPCCND = new ClsCSATNPSViewDetails();

        //    lstPCCND.ID = csatdata.Find(x => x.ID == ID).ID;
        //    lstPCCND.Project_ID = csatdata.Find(x => x.ID == ID).PROJECT_ID;
        //    lstPCCND.Project_NAME = csatdata.Find(x => x.ID == ID).PROJECT_NAME;
        //    lstPCCND.Respondant_NAME = csatdata.Find(x => x.ID == ID).RESPONDENT_NAME;
        //    lstPCCND.NPSType = vNSPType;

        //    List<CSATNPSSubDetails> lstCSATNPSSubDetails = new List<CSATNPSSubDetails>();

        //    CSATNPSSubDetails clsCSATNPSSubDetails = new CSATNPSSubDetails();

        //    lstCSATNPSSubDetails.Add(AddCSATNPSSubDetails(ID, lstPCCND, csatdata, Quarter1));
        //    lstCSATNPSSubDetails.Add(AddCSATNPSSubDetails(ID, lstPCCND, csatdata, Quarter2));
        //    lstCSATNPSSubDetails.Add(AddCSATNPSSubDetails(ID, lstPCCND, csatdata, Quarter3));
        //    lstCSATNPSSubDetails.Add(AddCSATNPSSubDetails(ID, lstPCCND, csatdata, Quarter4));

        //    lstPCCND.LstCSATNPSSubDetails = lstCSATNPSSubDetails;

        //    return lstPCCND;
        //}


        public ClsNPSViewDetails GetCSATNPSDetails(List<PROJECT_CUSTOMER_NPS_DATA> csatdata, int ID, string vNSPType)
        {


            List<string> lstQuarters = getQuarters();
            string Quarter1 = "";
            string Quarter2 = "";
            string Quarter3 = "";
            string Quarter4 = "";

            if (lstQuarters.Count > 3)
            {
                Quarter4 = lstQuarters[0];
                Quarter3 = lstQuarters[1];
                Quarter2 = lstQuarters[2];
                Quarter1 = lstQuarters[3];
            }


            ClsNPSViewDetails lstPCCND = new ClsNPSViewDetails();
            lstPCCND.ID = csatdata.Find(x => x.ID == ID).ID;
            lstPCCND.Project_ID = csatdata.Find(x => x.ID == ID).PROJECT_ID;
            lstPCCND.Project_NAME = csatdata.Find(x => x.ID == ID).PROJECT_NAME;
            lstPCCND.Respondant_NAME = csatdata.Find(x => x.ID == ID).RESPONDENT_NAME;
            lstPCCND.NPSType = vNSPType;

            lstPCCND.CSATQuestion1 = csatdata.Find(x => x.ID == ID).CSAT_QUESTION_1;
            lstPCCND.CSATQuestion2 = csatdata.Find(x => x.ID == ID).CSAT_QUESTION_2;
            lstPCCND.CSATQuestion3 = csatdata.Find(x => x.ID == ID).CSAT_QUESTION_3;
            lstPCCND.NPSQuestion = csatdata.Find(x => x.ID == ID).NPS_QUESTION;
            

            lstPCCND.Quarter4 = Quarter4;

            lstPCCND.CSS4 = csatdata.Find(x => x.ID == ID).MIN_SCORE.Value;
            lstPCCND.NPS4 = csatdata.Find(x => x.ID == ID).NPS_SCORE.Value;
            lstPCCND.QualityScore4 = csatdata.Find(x => x.ID == ID).OVERALL_QUALITY_OF_DELIVERABLE.Value;
            lstPCCND.SuccessScore4 = csatdata.Find(x => x.ID == ID).ENABLING_SUCCESS.Value;
            lstPCCND.ValueaddScore4 = csatdata.Find(x => x.ID == ID).VALUE_ADDS.Value;
            lstPCCND.CSSQualityFeedback4 = csatdata.Find(x => x.ID == ID).OVERALL_QUALITY_OF_DELIVERABLE_REMARKS;
            lstPCCND.CSSSuccesssFeedback4 = csatdata.Find(x => x.ID == ID).ENABLING_SUCCESS_REMARKS;
            lstPCCND.CSSValueaddFeedback4 = csatdata.Find(x => x.ID == ID).VALUE_ADDS_REMARKS;
            lstPCCND.NPSFeedback4 = csatdata.Find(x => x.ID == ID).NPS_REMARKS;
            lstPCCND.Feedback4 = csatdata.Find(x => x.ID == ID).FEEDBACK;

            var objVerify = csatdata.Find(x => x.PROJECT_ID == lstPCCND.Project_ID && x.RESPONDENT_NAME == lstPCCND.Respondant_NAME && x.YEAR_QUARTER == Quarter3);

            if (objVerify != null)
            {
                lstPCCND.Quarter3 = Quarter3;

                lstPCCND.CSS3 = objVerify.MIN_SCORE.HasValue ? objVerify.MIN_SCORE.Value : 0;
                lstPCCND.NPS3 = objVerify.NPS_SCORE.HasValue ? objVerify.NPS_SCORE.Value : 0;
                lstPCCND.QualityScore3 = objVerify.OVERALL_QUALITY_OF_DELIVERABLE.HasValue ? objVerify.OVERALL_QUALITY_OF_DELIVERABLE.Value : 0;
                lstPCCND.SuccessScore3 = objVerify.ENABLING_SUCCESS.HasValue ? objVerify.ENABLING_SUCCESS.Value : 0;
                lstPCCND.ValueaddScore3 = objVerify.VALUE_ADDS.HasValue ? objVerify.VALUE_ADDS.Value : 0;
                lstPCCND.CSSQualityFeedback3 = objVerify.OVERALL_QUALITY_OF_DELIVERABLE_REMARKS;
                lstPCCND.CSSSuccesssFeedback3 = objVerify.ENABLING_SUCCESS_REMARKS;
                lstPCCND.CSSValueaddFeedback3 = objVerify.VALUE_ADDS_REMARKS;
                lstPCCND.NPSFeedback3 = objVerify.NPS_REMARKS;
                lstPCCND.Feedback3 = csatdata.Find(x => x.ID == ID).FEEDBACK;
            }

            objVerify = csatdata.Find(x => x.PROJECT_ID == lstPCCND.Project_ID && x.RESPONDENT_NAME == lstPCCND.Respondant_NAME && x.YEAR_QUARTER == Quarter2);

            if (objVerify != null)
            {
                lstPCCND.Quarter2 = Quarter2;

                lstPCCND.CSS2 = objVerify.MIN_SCORE.HasValue ? objVerify.MIN_SCORE.Value : 0;
                lstPCCND.NPS2 = objVerify.NPS_SCORE.HasValue ? objVerify.NPS_SCORE.Value : 0;
                lstPCCND.QualityScore2 = objVerify.OVERALL_QUALITY_OF_DELIVERABLE.Value;
                lstPCCND.SuccessScore2 = objVerify.ENABLING_SUCCESS.Value;
                lstPCCND.ValueaddScore2 = objVerify.VALUE_ADDS.Value;
                lstPCCND.CSSQualityFeedback2 = objVerify.OVERALL_QUALITY_OF_DELIVERABLE_REMARKS;
                lstPCCND.CSSSuccesssFeedback2 = objVerify.ENABLING_SUCCESS_REMARKS;
                lstPCCND.CSSValueaddFeedback2 = objVerify.VALUE_ADDS_REMARKS;
                lstPCCND.NPSFeedback2 = objVerify.NPS_REMARKS;
                lstPCCND.Feedback2 = csatdata.Find(x => x.ID == ID).FEEDBACK;
            }

            objVerify = csatdata.Find(x => x.PROJECT_ID == lstPCCND.Project_ID && x.RESPONDENT_NAME == lstPCCND.Respondant_NAME && x.YEAR_QUARTER == Quarter1);

            if (objVerify != null)
            {
                lstPCCND.Quarter1 = Quarter1;

                lstPCCND.CSS1 = objVerify.MIN_SCORE.HasValue ? objVerify.MIN_SCORE.Value : 0;
                lstPCCND.NPS1 = objVerify.NPS_SCORE.HasValue ? objVerify.NPS_SCORE.Value : 0;
                lstPCCND.QualityScore1 = objVerify.OVERALL_QUALITY_OF_DELIVERABLE.HasValue ? objVerify.OVERALL_QUALITY_OF_DELIVERABLE.Value : 0;
                lstPCCND.SuccessScore1 = objVerify.ENABLING_SUCCESS.HasValue ? objVerify.ENABLING_SUCCESS.Value : 0;
                lstPCCND.ValueaddScore1 = objVerify.VALUE_ADDS.HasValue ? objVerify.VALUE_ADDS.Value : 0;
                lstPCCND.CSSQualityFeedback1 = objVerify.OVERALL_QUALITY_OF_DELIVERABLE_REMARKS;
                lstPCCND.CSSSuccesssFeedback1 = objVerify.ENABLING_SUCCESS_REMARKS;
                lstPCCND.CSSValueaddFeedback1 = objVerify.VALUE_ADDS_REMARKS;
                lstPCCND.NPSFeedback1 = objVerify.NPS_REMARKS;
                lstPCCND.Feedback1 = csatdata.Find(x => x.ID == ID).FEEDBACK;


            }

            return lstPCCND;
        }

        public string GetProject_NAME(List<PROJECT_CUSTOMER_NPS_DATA> csatdata, string sProject_ID)
        {
            string sProject_NAME = string.Empty;
            sProject_NAME = csatdata.Find(x => x.PROJECT_ID == sProject_ID).PROJECT_NAME;
            return sProject_NAME;
        }

        public string GetCustomer_NAME(List<PROJECT_CUSTOMER_NPS_DATA> csatdata, string sProject_ID)
        {
            string sProject_NAME = string.Empty;
            sProject_NAME = csatdata.Find(x => x.PROJECT_ID == sProject_ID).CUSTOMER_NAME;
            return sProject_NAME;
        }







    }


    public class ClsNPSScoreDataQuarter
    {
        public int Promotors { get; set; }
        public int Passives { get; set; }
        public int Detractors { get; set; }


        public int PQPromotors { get; set; }
        public int PQPassives { get; set; }
        public int PQDetractors { get; set; }


        public int Propro { get; set; }
        public int Propas { get; set; }
        public int Prodet { get; set; }


        public int Paspro { get; set; }
        public int Paspas { get; set; }
        public int Pasdet { get; set; }


        public int Detpro { get; set; }
        public int Detpas { get; set; }
        public int Detdet { get; set; }


        public string currentQuarter { get; set; }
        public string lastQuarter { get; set; }

        public string Quarter1 { get; set; }
        public string Quarter2 { get; set; }

        public List<ClsNPSViewDetails> ListNPSViewDetails { get; set; }

        public List<ClsCSATScoreDetails> ListCSATScoreDetails { get; set; }

        public List<ClsNPSScoreDetails> ListNPSScoreDetails { get; set; }


        public List<ClsNPSViewDetails> ListAllProjectsByNPSScore { get; set; }


    }

    public class ClsNPSScoreDetails
    {
        public int NPSScore;
        public int ProjectsCount;

        public ClsNPSScoreDetails(int vNPSScore, int vProjectsCount)
        {
            NPSScore = vNPSScore;
            ProjectsCount = vProjectsCount;
        }
    }

    public class ClsCSATNPSViewDetails
    {
        public long? ID;
        public string Project_ID;
        public string Project_NAME;
        public string Respondant_NAME;
        public string NPSType;

        public string CSATQuestion1;
        public string CSATQuestion2;
        public string CSATQuestion3;
        public string NPSQuestion;
        public string OthersQuestion;

        public List<CSATNPSSubDetails> LstCSATNPSSubDetails;

        public ClsCSATNPSViewDetails() { }

        public ClsCSATNPSViewDetails(long vID, string vproject_ID, string vproject_Name, string vpespondant_Name, string vNPSType,
        string vCSATQuestion1,
        string vCSATQuestion2,
        string vCSATQuestion3,
        string vNPSQuestion,
        string vOthersQuestion, List<CSATNPSSubDetails> vlstCSATNPSSubDetails)
        {
            ID = vID;
            Project_ID = vproject_ID;
            Project_NAME = vproject_Name;
            Respondant_NAME = vpespondant_Name;
            NPSType = vNPSType;

            CSATQuestion1 = vCSATQuestion1;
            CSATQuestion2 = vCSATQuestion2;
            CSATQuestion3 = vCSATQuestion3;
            NPSQuestion = vNPSQuestion;
            OthersQuestion = vOthersQuestion;

            LstCSATNPSSubDetails = vlstCSATNPSSubDetails;
        }

    }

    public class CSATNPSSubDetails
    {
        public string Quarter;
        public int CSS;
        public int NPS;
        public int QualityScore;
        public int SuccessScore;
        public int ValueaddScore;
        public string CSSQualityFeedback;
        public string CSSSuccesssFeedback;
        public string CSSValueaddFeedback;
        public string NPSFeedback;
        public string Feedback;
    }


        public class ClsNPSViewDetails
        {
        public long? ID;
        public string Project_ID;
        public string Project_NAME;
        public string Respondant_NAME;
        public string NPSType;

        public string CSATQuestion1;
        public string CSATQuestion2;
        public string CSATQuestion3;
        public string NPSQuestion;
        public string OthersQuestion;

        public string Quarter1;
        public int CSS1;
        public int NPS1;
        public int QualityScore1;
        public int SuccessScore1;
        public int ValueaddScore1;
        public string CSSQualityFeedback1;
        public string CSSSuccesssFeedback1;
        public string CSSValueaddFeedback1;
        public string NPSFeedback1;
        public string Feedback1;


        public string Quarter2;
        public int CSS2;
        public int NPS2;
        public int QualityScore2;
        public int SuccessScore2;
        public int ValueaddScore2;
        public string CSSQualityFeedback2;
        public string CSSSuccesssFeedback2;
        public string CSSValueaddFeedback2;
        public string NPSFeedback2;
        public string Feedback2;

        public string Quarter3;
        public int CSS3;
        public int NPS3;
        public int QualityScore3;
        public int SuccessScore3;
        public int ValueaddScore3;
        public string CSSQualityFeedback3;
        public string CSSSuccesssFeedback3;
        public string CSSValueaddFeedback3;
        public string NPSFeedback3;
        public string Feedback3;


        public string Quarter4;
        public int CSS4;
        public int NPS4;
        public int QualityScore4;
        public int SuccessScore4;
        public int ValueaddScore4;
        public string CSSQualityFeedback4;
        public string CSSSuccesssFeedback4;
        public string CSSValueaddFeedback4;
        public string NPSFeedback4;
        public string Feedback4;



        public ClsNPSViewDetails() { }

        public ClsNPSViewDetails(int vID, string vproject_ID, string vproject_Name, string vpespondant_Name, string vNPSType,


        string vCSATQuestion1,
        string vCSATQuestion2,
        string vCSATQuestion3,
        string vNPSQuestion,
        string vOthersQuestion,

        string vQuarter1,
        int vCSS1,
        int vNPS1,
        int vQualityScore1,
        int vSuccessScore1,
        int vValueaddScore1,
        string vCSSQualityFeedback1,
        string vCSSSuccessFeedback1,
        string vCSSValueaddFeedback1,
        string vNPSFeedback1,
        string vFeedback1,

        string vQuarter2,
        int vCSS2,
        int vNPS2,
        int vQualityScore2,
        int vSuccessScore2,
        int vValueaddScore2,
        string vCSSQualityFeedback2,
        string vCSSSuccessFeedback2,
        string vCSSValueaddFeedback2,
        string vNPSFeedback2,
        string vFeedback2,

        string vQuarter3,
        int vCSS3,
        int vNPS3,
        int vQualityScore3,
        int vSuccessScore3,
        int vValueaddScore3,
        string vCSSQualityFeedback3,
        string vCSSSuccessFeedback3,
        string vCSSValueaddFeedback3,
        string vNPSFeedback3,
        string vFeedback3,

        string vQuarter4,
        int vCSS4,
        int vNPS4,
        int vQualityScore4,
        int vSuccessScore4,
        int vValueaddScore4,
        string vCSSQualityFeedback4,
        string vCSSSuccessFeedback4,
        string vCSSValueaddFeedback4,
        string vNPSFeedback4,
        string vFeedback4

        )
        {
            ID = vID;
            Project_ID = vproject_ID;
            Project_NAME = vproject_Name;
            Respondant_NAME = vpespondant_Name;
            NPSType = vNPSType;

            CSATQuestion1 = vCSATQuestion1;
            CSATQuestion2 = vCSATQuestion2;
            CSATQuestion3 = vCSATQuestion3;
            NPSQuestion = vNPSQuestion;
            OthersQuestion = vOthersQuestion;


            Quarter1 = vQuarter1;
            CSS1 = vCSS1;
            NPS1 = vNPS1;
            QualityScore1 = vQualityScore1;
            SuccessScore1 = vSuccessScore1;
            ValueaddScore1 = vValueaddScore1;
            CSSQualityFeedback1 = vCSSQualityFeedback1;
            CSSSuccesssFeedback1 = vCSSSuccessFeedback1;
            CSSValueaddFeedback1 = vCSSValueaddFeedback1;
            NPSFeedback1 = vNPSFeedback1;
            Feedback1 = vFeedback1;

            Quarter2 = vQuarter2;
            CSS2 = vCSS2;
            NPS2 = vNPS2;
            QualityScore2 = vQualityScore2;
            SuccessScore2 = vSuccessScore2;
            ValueaddScore2 = vValueaddScore2;
            CSSQualityFeedback2 = vCSSQualityFeedback2;
            CSSSuccesssFeedback2 = vCSSSuccessFeedback2;
            CSSValueaddFeedback2 = vCSSValueaddFeedback2;
            NPSFeedback2 = vNPSFeedback2;
            Feedback2 = vFeedback2;


            Quarter3 = vQuarter3;
            CSS3 = vCSS3;
            NPS3 = vNPS3;
            QualityScore3 = vQualityScore3;
            SuccessScore3 = vSuccessScore3;
            ValueaddScore3 = vValueaddScore3;
            CSSQualityFeedback3 = vCSSQualityFeedback3;
            CSSSuccesssFeedback3 = vCSSSuccessFeedback3;
            CSSValueaddFeedback3 = vCSSValueaddFeedback3;
            NPSFeedback3 = vNPSFeedback3;
            Feedback3 = vFeedback3;


            Quarter4 = vQuarter4;
            CSS4 = vCSS3;
            NPS4 = vNPS3;
            QualityScore4 = vQualityScore4;
            SuccessScore4 = vSuccessScore4;
            ValueaddScore4 = vValueaddScore4;
            CSSQualityFeedback4 = vCSSQualityFeedback4;
            CSSSuccesssFeedback4 = vCSSSuccessFeedback4;
            CSSValueaddFeedback4 = vCSSValueaddFeedback4;
            NPSFeedback4 = vNPSFeedback3;
            Feedback4 = vFeedback4;

        }
    }


    public class ClsCSATScoreDetails
    {
        public int CSATScore;
        public string Quarter;
        public int CSATCount;

        public ClsCSATScoreDetails(int icsatscore, string squarter, int icsatcount)
        {
            CSATScore = icsatscore;
            Quarter = squarter;
            CSATCount = icsatcount;
        }

    }


    





}