//using GAVS.AllocationSystem.Model.CSP;
//using GAVS.AllocationSystem.Model.CSP.ViewModels;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web;

//namespace GAVS.AllocationSystem.WebApi.Controllers
//{
//    public partial class AllSysController
//    {

//        private CAPARCADataHolder GetCAPADataCollection(List<int> idList)
//        {
//            var capaDataHolder = new CAPARCADataHolder();

//            capaDataHolder.AUDIT_MANAGEMENT_CAUSES = CSPdb.AUDIT_MANAGEMENT_CAUSES.GetAll().Where(x => x.ISACTIVE).ToList();

//            capaDataHolder.AUDIT_MANAGEMENT_ROOTCAUSES = CSPdb.AUDIT_MANAGEMENT_ROOTCAUSES.GetAll().Where(x => x.ISACTIVE).ToList();

//            capaDataHolder.AUDIT_FINDING_STAGES_MAPPING = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(x => x.ISACTIVE || idList.Contains(x.KPI_DETAILS_ID.Value)
//                                                          || idList.Contains(x.FINDING_ID.Value) || idList.Contains(x.ACTION_ITEM_ID.Value)).ToList();

//            capaDataHolder.CAPA_SUBMISSION = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(x => x.ISACTIVE || idList.Contains(x.KPI_DETAILS_ID.Value)
//                                                          || idList.Contains(x.FINDING_ID.Value) || idList.Contains(x.ACTION_ITEM_ID.Value)).ToList();

//            capaDataHolder.CAPA_REVIEW = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().Where(x => x.ISACTIVE || idList.Contains(x.KPI_DETAILS_ID.Value)
//                                                          || idList.Contains(x.FINDING_ID.Value) || idList.Contains(x.ACTION_ITEM_ID.Value)).ToList();

//            capaDataHolder.CAPA_IMPLEMENTATION = CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.GetAll().Where(x => x.ISACTIVE || idList.Contains(x.KPI_DETAILS_ID.Value)
//                                                          || idList.Contains(x.FINDING_ID.Value) || idList.Contains(x.ACTION_ITEM_ID.Value)).ToList();

//            capaDataHolder.CAPA_VERIFICATION = CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.GetAll().Where(x => x.ISACTIVE || idList.Contains(x.KPI_DETAILS_ID.Value)
//                                                          || idList.Contains(x.FINDING_ID.Value) || idList.Contains(x.ACTION_ITEM_ID.Value)).ToList();

//            return capaDataHolder;
//        }
//        private  FINDING_STAGE_DATA GetCAPAStagesInformation(int id, CAPARCADataHolder capaDataCollection, string flag)
//        {
            

//            var capaList = new List<AUDIT_FINDING_CAPPA_EXT>();
//            var caparevList = new List<AUDIT_FINDING_CAPPA_EXT>();
//            var capa = new List<AUDIT_FINDINGS_CAPA>();

//            var resultData = new FINDING_STAGE_DATA();
//            var extList = new List<AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED>();

//            var map = new List<AUDIT_FINDING_STAGES_MAPPING>();
//            var capaReview = new List<AUDIT_FINDING_CAPA_REVIEW>();
//            var capaImplementation = new List<AUDIT_FINDING_CAPA_IMPLEMENTATION>();
//            var capaVerification = new List<AUDIT_FINDING_CAPA_VERIFICATION>();

//            switch (flag)
//            {
//                case "KPI": 
//                    map = capaDataCollection.AUDIT_FINDING_STAGES_MAPPING.Where(t => t.KPI_DETAILS_ID == id).ToList(); 
//                    capa = capaDataCollection.CAPA_SUBMISSION.Where(t =>  t.ISACTIVE && t.KPI_DETAILS_ID == id ).OrderByDescending(x => x.CREATED_DATE).ToList();
//                    capaReview = capaDataCollection.CAPA_REVIEW.Where(x => x.ISACTIVE && x.KPI_DETAILS_ID == id).ToList();
//                    capaImplementation = capaDataCollection.CAPA_IMPLEMENTATION.Where(x => x.ISACTIVE && x.KPI_DETAILS_ID == id).ToList();
//                    capaVerification = capaDataCollection.CAPA_VERIFICATION.Where(x => x.ISACTIVE && x.FINDING_ID == id).ToList();
//                    break;
//                case "ActionItem": 
//                    map = capaDataCollection.AUDIT_FINDING_STAGES_MAPPING.Where(t => t.ACTION_ITEM_ID == id).ToList();
//                    capa = capaDataCollection.CAPA_SUBMISSION.Where(t => t.ISACTIVE && t.ACTION_ITEM_ID == id ).OrderByDescending(x => x.CREATED_DATE).ToList();
//                    capaReview = capaDataCollection.CAPA_REVIEW.Where(x => x.ISACTIVE && x.ACTION_ITEM_ID == id).ToList();
//                    capaImplementation = capaDataCollection.CAPA_IMPLEMENTATION.Where(x => x.ISACTIVE && x.KPI_DETAILS_ID == id).ToList();
//                    capaVerification = capaDataCollection.CAPA_VERIFICATION.Where(x => x.ISACTIVE && x.FINDING_ID == id).ToList();
//                    break;
//                case "AssessmentFinding": 
//                    map = capaDataCollection.AUDIT_FINDING_STAGES_MAPPING.Where(t => t.FINDING_ID == id).ToList();
//                    capa = capaDataCollection.CAPA_SUBMISSION.Where(t =>  t.ISACTIVE && t.FINDING_ID == id ).OrderByDescending(x => x.CREATED_DATE).ToList();
//                    capaReview = capaDataCollection.CAPA_REVIEW.Where(x => x.ISACTIVE && x.FINDING_ID == id).ToList();
//                    capaImplementation = capaDataCollection.CAPA_IMPLEMENTATION.Where(x => x.ISACTIVE && x.FINDING_ID == id).ToList();
//                    capaVerification = capaDataCollection.CAPA_VERIFICATION.Where(x => x.ISACTIVE && x.FINDING_ID == id).ToList();
//                    break;
//                default: break;
//            }

          
//            if (!capa.Any())
//                return resultData;

//            // Stage 1 - CAP Submission
//            resultData.CAPA_SUBMISSION.STATUS = map.FirstOrDefault(t => t.STAGE_ID == 1);
//            foreach (var c in capa)
//            {
//                var ext = new AUDIT_FINDING_CAPPA_EXT();
//                var rootCause = capaDataCollection.AUDIT_MANAGEMENT_ROOTCAUSES.FirstOrDefault(x => x.ID == c.ROOT_CAUSE_ID);
//                ext.CAUSE_ID = c.ROOT_CAUSE_ID;
//                ext.CAPPALIST = c;
//                ext.CAPPALIST.ROOT_CAUSE = rootCause.ROOT_CAUSE;
//                ext.CAPPALIST.CAUSE = capaDataCollection.AUDIT_MANAGEMENT_CAUSES.FirstOrDefault(x => x.ID == rootCause.CAUSE_ID).CAUSES;
//                capaList.Add(ext);
//            }

//            resultData.CAPA_SUBMISSION.CAPA = capaList;

//            //stage2 - Audit Review
//            resultData.CAPA_REVIEW.STATUS = map.FirstOrDefault(t => t.STAGE_ID == 2);
//            foreach (var c in capa)
//            {
//                var review = capaReview.FirstOrDefault(t =>  t.ROOT_CAUSE_ID == c.ROOT_CAUSE_ID && t.UNIQUE_ID == c.UNIQUE_ID && t.ISACTIVE || t.KPI_DETAILS_ID == c.KPI_DETAILS_ID || t.ACTION_ITEM_ID == c.ACTION_ITEM_ID || t.FINDING_ID == c.FINDING_ID);
//                if (review == null)
//                    review = new AUDIT_FINDING_CAPA_REVIEW();

//                var ext = new AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED();
//                ext.CAP_TARGET_DATE = c.CAP_TARGET_DATE;
//                ext.CAUSE = c.CAUSE;
//                ext.CORRECTION = c.CORRECTION;
//                ext.CORRECTIVE_ACTION_PLAN = c.CORRECTIVE_ACTION_PLAN;
//                ext.CREATED_BY = c.CREATED_BY;
//                ext.CREATED_DATE = c.CREATED_DATE;
//                ext.FINDING_ID = c.FINDING_ID;
//                ext.KPI_DETAILS_ID = c.KPI_DETAILS_ID;
//                ext.ACTION_ITEM_ID = c.ACTION_ITEM_ID;
//                ext.ID = c.ID;
//                ext.ISACTIVE = c.ISACTIVE;
//                ext.RESPONSIBLE = c.RESPONSIBLE;
//                ext.ISCAPAPPROVED = review.ISAPPROVED;
//                ext.ISCAPREJECTED = review.ISREJECTED;
//                ext.ISROOTCAUSE = c.ISROOTCAUSE;
//                ext.ISSUBMITTED = review.ISSUBMITTED;
//                ext.NOTES = c.NOTES;
//                ext.REMARKS = review.REMARKS;
//                ext.PLAN_FOR_EFFECTIVE_CAP = c.PLAN_FOR_EFFECTIVE_CAP;
//                ext.PLAN_TARGET_DATE = c.PLAN_TARGET_DATE;
//                ext.REVIEW_UPDATED_BY = review.UPDATED_BY;
//                ext.ROOT_CAUSE = c.ROOT_CAUSE;
//                ext.ROOT_CAUSE_ID = c.ROOT_CAUSE_ID;
//                ext.ISCHECKED = !(review.ISREJECTED);
//                ext.STATUS = review.STATUS;
//                ext.UNIQUE_ID = c.UNIQUE_ID;
//                ext.UPDATED_BY = c.UPDATED_BY;
//                ext.UPDATED_DATE = c.UPDATED_DATE;
//                extList.Add(ext);
//            }

//            resultData.CAPA_REVIEW.CAPA = extList;

//            //stage 3 -Audit Implementation
//            resultData.CAP_IMPLEMENTATION.STATUS = map.Where(t => t.STAGE_ID == 3).FirstOrDefault();
//            var implist = new List<AUDIT_FINDING_CAPA_IMPLEMENTATION>();         
//            foreach (AUDIT_FINDINGS_CAPA c in capa)
//            {
//                var imp = capaImplementation.OrderByDescending(x => x.ID).FirstOrDefault(t => t.ROOT_CAUSE_ID == c.ROOT_CAUSE_ID && t.UNIQUE_ID == c.UNIQUE_ID && t.ISACTIVE || t.KPI_DETAILS_ID == c.KPI_DETAILS_ID || t.ACTION_ITEM_ID == c.ACTION_ITEM_ID || t.FINDING_ID == c.FINDING_ID);
               
//                if (imp == null)
//                {
//                    imp = new AUDIT_FINDING_CAPA_IMPLEMENTATION();
//                    imp.FINDING_ID = c.FINDING_ID;
//                    imp.KPI_DETAILS_ID = c.KPI_DETAILS_ID;
//                    imp.ACTION_ITEM_ID = c.ACTION_ITEM_ID;
//                    imp.UNIQUE_ID = c.UNIQUE_ID;
//                    imp.ROOT_CAUSE_ID = c.ROOT_CAUSE_ID;
//                    imp.CAPADATA = c;
//                    implist.Add(imp);
//                }
//                else
//                {
//                    imp.CAPADATA = c;
//                    implist.Add(imp);
//                }
//            }
//            resultData.CAP_IMPLEMENTATION.CAPA = implist;

//            //stage 4 -Audit Verification

//            resultData.CAP_VERIFICATION.STATUS = map.Where(t => t.STAGE_ID == 4).FirstOrDefault();
          
//            var veriList = new List<AUDIT_FINDING_CAPA_VERIFICATION>();
//            foreach (AUDIT_FINDINGS_CAPA c in capa)
//            {
//                var verf = capaVerification.OrderByDescending(x => x.ID).FirstOrDefault(t => t.ROOT_CAUSE_ID == c.ROOT_CAUSE_ID && t.UNIQUE_ID == c.UNIQUE_ID && t.ISACTIVE 
//                          || t.KPI_DETAILS_ID == c.KPI_DETAILS_ID || t.ACTION_ITEM_ID == c.ACTION_ITEM_ID || t.FINDING_ID == c.FINDING_ID);
               
//                if (verf == null)
//                {
//                    verf = new AUDIT_FINDING_CAPA_VERIFICATION();
//                    verf.FINDING_ID = c.FINDING_ID;
//                    verf.KPI_DETAILS_ID = c.KPI_DETAILS_ID;
//                    verf.ACTION_ITEM_ID = c.ACTION_ITEM_ID;
//                    verf.UNIQUE_ID = c.UNIQUE_ID;
//                    verf.ROOT_CAUSE_ID = c.ROOT_CAUSE_ID;
//                    verf.CAPADATA = c;
//                    veriList.Add(verf);
//                }
//                else
//                {
//                    verf.CAPADATA = c;
//                    veriList.Add(verf);
//                }
//            }
//            resultData.CAP_VERIFICATION.CAPA = veriList;

//            return resultData;
//        }        

//        public class CAPARCADataHolder
//        {
//            public List<AUDIT_MANAGEMENT_CAUSES> AUDIT_MANAGEMENT_CAUSES { get; set; }
//            public List<AUDIT_MANAGEMENT_ROOTCAUSES> AUDIT_MANAGEMENT_ROOTCAUSES { get; set; }
//            public List<AUDIT_FINDING_STAGES_MAPPING> AUDIT_FINDING_STAGES_MAPPING { get; set; }
//            public List<AUDIT_FINDINGS_CAPA> CAPA_SUBMISSION { get; set; }
//            public List<AUDIT_FINDING_CAPA_REVIEW> CAPA_REVIEW { get; set; }
//            public List<AUDIT_FINDING_CAPA_IMPLEMENTATION> CAPA_IMPLEMENTATION { get; set; }
//            public List<AUDIT_FINDING_CAPA_VERIFICATION> CAPA_VERIFICATION { get; set; }
//        }

        


//        private FINDING_STAGE_DATA AddCapa(FINDING_STAGE_DATA results, KPI_DETAILS kpiDtls, PROJECT_ACTIONITEM actionItem, string serviceLevelMetric, string flag)
//        {
           
//            int empId = GetHeaderDetails_Int("empId");

//            Guid obj;
//            var fcap = new AUDIT_FINDINGS_CAPA();
//            string unique;

//            var capStatus = string.Empty;

//            var capExist = new AUDIT_FINDINGS_CAPA();

//            var stageStatus = new AUDIT_FINDING_STAGES_MAPPING();

//            var product = new PORTFOLIO_PRODUCT();


             
//            switch (flag)
//            {
//                case "KPI":
//                    capExist = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().FirstOrDefault(x => x.KPI_DETAILS_ID == kpiDtls.ID && x.ISACTIVE && x.ISSUBMITTED);
//                    stageStatus = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(x => x.KPI_DETAILS_ID == kpiDtls.ID && x.STAGE_ID == 1);
//                    product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == kpiDtls.PRODUCT_ID);
//                    break;
//                case "ActionItem":
//                    capExist = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().FirstOrDefault(x => x.ACTION_ITEM_ID == actionItem.ID && x.ISACTIVE && x.ISSUBMITTED);
//                    stageStatus = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(x => x.ACTION_ITEM_ID == actionItem.ID && x.STAGE_ID == 1);                    
//                    break;
//                case "AssessmentFinding":
//                    capExist = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().FirstOrDefault(x => x.KPI_DETAILS_ID == kpiDtls.ID && x.ISACTIVE && x.ISSUBMITTED);
//                    stageStatus = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(x => x.KPI_DETAILS_ID == kpiDtls.ID && x.STAGE_ID == 1);
//                    break;
//                default: break;
//            }


//            var responsible = new List<int>();

//            var requestDomain = helper.GetAbsoulteUri();
//            var month = kpiDtls.PERIOD.Month;
//            var year = kpiDtls.PERIOD.Year;
//            var path = "productkpi";

//            //return Ok(results);

//            if (stageStatus == null)
//            {
//                obj = Guid.NewGuid();
//                unique = obj.ToString();

//            }
//            else
//            {
//                if (stageStatus.STAGE_STATUS == "CAP Resubmit")
//                    capStatus = "CAP Resubmit";

//                if (results.CAPA_SUBMISSION.CAPA[0].CAPPALIST.UNIQUE_ID != null)
//                    unique = results.CAPA_SUBMISSION.CAPA[0].CAPPALIST.UNIQUE_ID;
//                else
//                {
//                    obj = Guid.NewGuid();
//                    unique = obj.ToString();
//                }
//            }

//            if (capExist == null)
//            {
//                var filteredRows = results.CAPA_SUBMISSION.CAPA.Where(x => x.CAPPALIST.STATUS != "CAP Approved").ToList();

//                foreach (AUDIT_FINDING_CAPPA_EXT cap in filteredRows)
//                {
//                    UpdateIsActiveForKpi(cap);
//                    fcap = new AUDIT_FINDINGS_CAPA();
//                    fcap.UNIQUE_ID = unique;
//                    fcap.CAP_TARGET_DATE = cap.CAPPALIST.CAP_TARGET_DATE;
//                    fcap.CORRECTION = cap.CAPPALIST.CORRECTION;
//                    fcap.CORRECTIVE_ACTION_PLAN = cap.CAPPALIST.CORRECTIVE_ACTION_PLAN;
//                    fcap.RESPONSIBLE = cap.CAPPALIST.RESPONSIBLE;
//                    fcap.CREATED_BY = empId;
//                    fcap.CREATED_DATE = DateTime.Now;
//                    fcap.ISACTIVE = true;
//                    fcap.ISROOTCAUSE = cap.CAPPALIST.ISROOTCAUSE;
//                    fcap.ISSUBMITTED = true;
//                    fcap.NOTES = cap.CAPPALIST.NOTES;
//                    fcap.STATUS = cap.CAPPALIST.STATUS;
//                    fcap.PLAN_FOR_EFFECTIVE_CAP = cap.CAPPALIST.PLAN_FOR_EFFECTIVE_CAP;
//                    fcap.PLAN_TARGET_DATE = cap.CAPPALIST.PLAN_TARGET_DATE;
//                    fcap.ROOT_CAUSE_ID = cap.CAPPALIST.ROOT_CAUSE_ID;
//                    fcap.UPDATED_BY = empId;
//                    fcap.UPDATED_DATE = DateTime.Now;
//                    fcap.KPI_DETAILS_ID = kpiDtls.ID;
//                    responsible.Add(fcap.RESPONSIBLE);
//                    CSPdb.AUDIT_FINDINGS_CAPA.Add(fcap);
//                    if (cap.CAPPALIST.STATUS == "CAP Submitted" || cap.CAPPALIST.STATUS == "CAP Resubmit")
//                        enableCAPReviewForKPI(cap);
//                }

//                if (results.CAPA_SUBMISSION.CAPA.Any())
//                {
//                    results.CAPA_SUBMISSION.CAPA[0].CAPPALIST.UNIQUE_ID = unique;
//                    if (capStatus == "CAP Resubmit")
//                        UpdateStatus(results.CAPA_SUBMISSION.CAPA[0].CAPPALIST, kpiDtls.ID);
//                    else
//                        AddStagesForCAPA(results.CAPA_SUBMISSION.CAPA[0].CAPPALIST, kpiDtls.ID);

//                    var capasendmail = new CAPASendMail();
//                    capasendmail.STAGE = "CAP Submission";
//                    capasendmail.STATUS = "CAP Submitted by PM";
//                    capasendmail.CAP_STAGE_ID = 1;
//                    if (capStatus == "CAP Resubmit")
//                        capasendmail.STATUS = "CAP Resubmitted by PM";
//                    capasendmail.ACTION = "Yes";
//                    capasendmail.CLASS = "hide";
//                    capasendmail.SUBJECT = $"CAP Submission";
//                    capasendmail.NEXT_ACTION = "Review CAP submitted";
//                    capasendmail.ACTION_CLASS = "showAction";
//                    capasendmail.PERIOD_TYPE = kpiDtls.PERIOD_TYPE;
//                    capasendmail.PERIOD_DATE = kpiDtls.PERIOD;
//                    capasendmail.SERVICE_LEVEL_METRIC_DESCRIPTION = serviceLevelMetric;
//                    capasendmail.PRODUCT_NAME = product != null ? product.PRODUCT_TITLE : string.Empty;
//                    capasendmail.PRODUCT_ID = kpiDtls.PRODUCT_ID;
//                    capasendmail.RESPONSIBILE_ID = responsible;
//                    capasendmail.URL = $"{requestDomain}/{path}/{product.CUST_ID}/{product.PORTFOLIO_ID}/{kpiDtls.PRODUCT_ID}/{kpiDtls.MODE_ID}/{month}/{year}/{kpiDtls.KPI_ID}";
//                    capasendmail.NOTE_MSG = $"<p> Details of CAPA against '{serviceLevelMetric}' can be viewed <a href = \'{capasendmail.URL}'\'> here </a>.</p>";
//                    SendMail(capasendmail);

//                }
//            }
//            return results;
//        }




//    }

//}