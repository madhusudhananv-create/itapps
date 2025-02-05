using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;
namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AuthController
    {
        #region CSP Customer Success Survey

        [POST("SaveCSSSurveyAnswers")]
        [ActionName("SaveCSSSurveyAnswers")]
        [HttpPost]
        public IHttpActionResult SaveCSSSurveyAnswers(HttpRequestMessage request, string empId = "", bool? isCSMNotified = null, DateTime? meetingDate = null)
        {
            try
            {
                var content = request.Content;
                string jsonContent = content.ReadAsStringAsync().Result;
                dynamic json = jsonContent;
                BatchCustomerAndQuestions replies = JsonConvert.DeserializeObject<BatchCustomerAndQuestions>(json);

                string surveyId = string.Empty;
                if (replies.CSS_BATCH_CUSTOMERS_EXTENDED != null)
                {
                    foreach (CSS_QUESTION_REPLIES reply in replies.CSS_QUESTION_REPLIES)
                    {
                        surveyId = reply.SURVEY_ID;
                        var existing = CSPdb.CSS_QUESTION_REPLIES.GetAll().FirstOrDefault(x => x.BATCH_CUSTOMER_ID == reply.BATCH_CUSTOMER_ID &&
                                        x.SURVEY_ID == reply.SURVEY_ID && x.QUESTION_ID == reply.QUESTION_ID);
                        if (existing != null) continue;

                        CSS_QUESTION_REPLIES newReply = new CSS_QUESTION_REPLIES()
                        {
                            BATCH_CUSTOMER_ID = reply.BATCH_CUSTOMER_ID,
                            BATCH_CUSTOMER_MONTHLY_ID = reply.BATCH_CUSTOMER_MONTHLY_ID,
                            SURVEY_ID = reply.SURVEY_ID,
                            QUESTION_ID = reply.QUESTION_ID,
                            QUESTION_CATEGORY = reply.QUESTION_CATEGORY,
                            QUESTION = reply.QUESTION,
                            RATING = reply.RATING,
                            RATING_DESCRIPTION = reply.RATING_DESCRIPTION,
                            COMMENTS = reply.COMMENTS,
                            CREATED_BY = replies.CSS_BATCH_CUSTOMERS_EXTENDED.EMAIL_ID,
                            CREATED_DATE = DateTime.Now,
                            UPDATED_BY = replies.CSS_BATCH_CUSTOMERS_EXTENDED.EMAIL_ID,
                            UPDATED_DATE = DateTime.Now,
                            ISACTIVE = true
                        };
                        CSPdb.CSS_QUESTION_REPLIES.Add(newReply);
                        CSPdb.Commit(CanCommit);
                    }

                    var customerName = replies.CSS_BATCH_CUSTOMERS_EXTENDED.DISPLAY_NAME;
                    var project = Cldb.PROJECT.GetAll().Where(x => x.PROJ_ID == replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_ID).ToList();
                    CSPdb.AppRepo.UpdateCSSBatchCustomers(replies.CSS_BATCH_CUSTOMERS_EXTENDED.ID, replies.CSS_BATCH_CUSTOMERS_EXTENDED.SURVEY_ID.GetValueOrDefault(), replies.CSS_BATCH_CUSTOMERS_EXTENDED.SURVEY_SENT_DATE.Value, DateTime.Now, "COMPLETED", empId, meetingDate, isCSMNotified);

                    if (project != null)
                    {
                        createActionItemAndTask(replies, surveyId, project, customerName);            //create action item if csat is low 
                    }
                    if (!string.IsNullOrWhiteSpace(empId))
                    {
                        SendSurveySuccessEmailForQualitativeFeedback(replies, surveyId, replies.CSS_BATCH_CUSTOMERS_EXTENDED.EMAIL_ID, empId);
                    }
                    else
                    {
                        var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == replies.CSS_BATCH_CUSTOMERS_EXTENDED.BATCH_ID);
                        SendSurveyResultEmail(replies, surveyId, batch != null ? batch.FREQUENCY : "");
                        SendSurveySuccessEmail(replies, surveyId, batch != null ? batch.FREQUENCY : "");
                    }
                }
                else if (replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED != null)
                {
                    foreach (var reply in replies.CSS_QUESTION_REPLIES)
                    {
                        surveyId = reply.SURVEY_ID;
                        var existing = CSPdb.CSS_QUESTION_REPLIES.GetAll().FirstOrDefault(x => x.BATCH_CUSTOMER_MONTHLY_ID == reply.BATCH_CUSTOMER_MONTHLY_ID &&
                                        x.SURVEY_ID == reply.SURVEY_ID && x.QUESTION_ID == reply.QUESTION_ID);
                        if (existing != null) continue;

                        CSS_QUESTION_REPLIES newReply = new CSS_QUESTION_REPLIES()
                        {
                            BATCH_CUSTOMER_ID = reply.BATCH_CUSTOMER_ID,
                            BATCH_CUSTOMER_MONTHLY_ID = reply.BATCH_CUSTOMER_MONTHLY_ID,
                            SURVEY_ID = reply.SURVEY_ID,
                            QUESTION_ID = reply.QUESTION_ID,
                            QUESTION_CATEGORY = reply.QUESTION_CATEGORY,
                            QUESTION = reply.QUESTION,
                            RATING = reply.RATING,
                            RATING_DESCRIPTION = reply.RATING_DESCRIPTION,
                            COMMENTS = reply.COMMENTS,
                            CREATED_BY = replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.EMAIL_ID,
                            CREATED_DATE = DateTime.Now,
                            UPDATED_BY = replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.EMAIL_ID,
                            UPDATED_DATE = DateTime.Now,
                            ISACTIVE = true
                        };
                        CSPdb.CSS_QUESTION_REPLIES.Add(newReply);
                        CSPdb.Commit(CanCommit);
                    }
                    CSPdb.AppRepo.UpdateCSSBatchCustomersMonthly(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.ID, replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.SURVEY_ID.GetValueOrDefault(), replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.SURVEY_SENT_DATE.Value, DateTime.Now, "COMPLETED", empId, meetingDate, isCSMNotified);

                    var customerName = replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.DISPLAY_NAME;
                    var projIds = new List<string>();
                    if (!string.IsNullOrWhiteSpace(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROJ_ID))
                        projIds.Add(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROJ_ID);
                    else if (replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROD_ID.HasValue)
                        projIds.AddRange(helper.GetprojectIdsFromProduct(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROD_ID.Value));
                    else
                        projIds = GetProjectIdsForMonthlyCSAT(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.EMAIL_ID);
                    var projects = Cldb.PROJECT.GetAll().Where(x => x.PROJ_STATUS != "Close" && projIds.Contains(x.PROJ_ID)).ToList();

                    if (projects != null)
                    {
                        createActionItemAndTask(replies, surveyId, projects, customerName);            //create action item if csat is low 
                    }
                    if (!string.IsNullOrWhiteSpace(empId))
                    {
                        SendSurveySuccessEmailForQualitativeFeedback(replies, surveyId, replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.EMAIL_ID, empId);
                    }
                    else
                    {
                        SendSurveyResultEmailMonthly(replies, surveyId);
                        SendSurveySuccessEmailMonthly(replies, surveyId, replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.EMAIL_ID);
                    }
                }
                return Ok();
            }
            catch (Exception ex)
            {
                LogRequest(ex);
                throw ex;
            }
        }

        private void createActionItemAndTask(BatchCustomerAndQuestions replies, string surveyId, List<PROJECT> projects, string customerName)
        {
            var requestDomain = helper.GetAbsoulteUri();
            var path = "CustomerSuccessSurvey";
            var cssUrl = $"{requestDomain}//{path}/{surveyId}";
            var ratings = replies.CSS_QUESTION_REPLIES.Where(x => x.QUESTION_CATEGORY == "Criteria" || x.QUESTION_CATEGORY == "NPS").ToList();
            var criteriaRatings = ratings.Where(x => x.QUESTION_CATEGORY == "Criteria").ToList();
            var highRatings = criteriaRatings.Where(x => x.RATING >= 4).ToList();
            var lowRatings = ratings.Where(x => (x.QUESTION_CATEGORY == "Criteria" && x.RATING <= 3) || (x.QUESTION_CATEGORY == "NPS" && x.RATING < 9)).ToList();

            var questionIds = ratings.Select(x => x.QUESTION_ID).ToList();
            var questions = CSPdb.CSS_QUESTION_MASTER.GetAll().Where(x => questionIds.Contains(x.ID)).ToList();
            foreach (var item in projects)
            {
                if (lowRatings.Any())
                {
                    foreach (var l in lowRatings)
                    {
                        if (questions.FirstOrDefault(x => x.ID == l.QUESTION_ID)?.TRIGGER_RCA.GetValueOrDefault() == true)
                            CreateActionItemDetails(new List<CSS_QUESTION_REPLIES> { l }, item.CUST_ID, item.PROJ_ID, null, null, customerName, replies.SURVEY_PERIOD);
                    }

                }
                //if (criteriaRatings.Count > 1 && criteriaRatings.Count == highRatings.Count)
                //{
                //    var cssScore = highRatings.TrueForAll(x => x.RATING == 5) ? 5 : 4;
                //    CreateAuditTaskDetails(cssScore.ToString(), item.CUST_ID, item.PROJ_ID, cssUrl);
                //}
            }
        }

        [GET("GetCSSSurveyQuestions")]
        [ActionName("GetCSSSurveyQuestions")]
        [HttpGet]
        public IHttpActionResult GetCSSSurveyQuestions(string code, bool showQualitativeFeedback, bool showCSSFields = false)
        {

            try
            {
                CSS_SURVEY_ITERATION iteration = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(t => t.SURVEY_ID == code);
                if (iteration == null) return Ok();

                //Get BatchCustomer
                CSS_BATCH_CUSTOMERS batchCust = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(t => t.ID == iteration.BATCH_CUSTOMERS_ID && t.ISACTIVE == true);
                if (batchCust != null)
                {


                    CSS_BATCH_CUSTOMERS_EXTENDED batchesExt = helper.FillCustomerAndProjectNames(batchCust);
                    CSS_BATCHES batch = CSPdb.CSS_BATCHES.GetById(batchCust.BATCH_ID);
                    string surveyPeriod = GetSurveyPeriodString(batch.FREQUENCY, batch.SEQUENCE, batch.YEAR);
                    List<CSS_QUESTION_REPLIES> questionsWithReplies = new List<CSS_QUESTION_REPLIES>();

                    if (iteration.ID != batchCust.SURVEY_ID)
                    {
                        iteration = CSPdb.CSS_SURVEY_ITERATION.GetById(batchCust.SURVEY_ID.GetValueOrDefault());
                    }

                    if (iteration.STATUS == "COMPLETED")
                    {
                        //Get Answers if survey is completed
                        questionsWithReplies = CSPdb.CSS_QUESTION_REPLIES.GetAll().Where(t => t.SURVEY_ID == iteration.SURVEY_ID).ToList();
                    }

                    else
                    {
                        if (!showCSSFields) CheckCSSLinkValid(iteration, batchCust.CUST_ID);
                        //Get Question mode based on project
                        // By default - 1
                        //Logic needs to be correct to get latest questions.
                        List<CSS_QUESTION_MASTER> questions = new List<CSS_QUESTION_MASTER>();
                        int? questionModelId;
                        if (showQualitativeFeedback)
                        {
                            questionModelId = CSPdb.CSS_QUESTION_MODELS.GetAll().FirstOrDefault(x => x.MODEL_NAME == "Qualitative Feedback" && x.ISACTIVE)?.ID;
                        }
                        else
                        {
                            questionModelId = helper.GetQuestionModel(batchCust.CUST_ID, batchCust.PROJ_ID, false, batch.START_DATE, batch.END_DATE, batchCust.EMAIL_ID, batch.ID, batch.FREQUENCY);
                        }
                        questions = CSPdb.CSS_QUESTION_MASTER.GetAll().Where(t => t.MODEL_ID == questionModelId && t.EFFECTIVE_FROM <= DateTime.Now && t.ISACTIVE == true).ToList();
                        questionsWithReplies = GetQuestionReplies(questions, batchesExt.ID, iteration.SURVEY_ID, false);
                        questionsWithReplies = GetQuestionReplies(questions, batchesExt.ID, iteration.SURVEY_ID, false);
                    }
                    var questionMaster = CSPdb.CSS_QUESTION_MASTER.GetAll().ToList();
                    foreach (var reply in questionsWithReplies)
                    {
                        var question = questionMaster.FirstOrDefault(x => x.ID == reply.QUESTION_ID);
                        if (question != null)
                        {
                            reply.QUESTION_DETAIL = question.QUESTION_DETAIL;
                        }
                    }

                    BatchCustomerAndQuestions batchCustomerAndQuestions = new BatchCustomerAndQuestions();
                    batchCustomerAndQuestions.CSS_BATCH_CUSTOMERS_EXTENDED = batchesExt;
                    batchCustomerAndQuestions.CSS_QUESTION_REPLIES = questionsWithReplies;
                    if (showQualitativeFeedback && batchCustomerAndQuestions.CSS_QUESTION_REPLIES.Any(x => x.QUESTION_CATEGORY.ToUpper() == "NPS"))
                    {
                        batchCustomerAndQuestions.CSS_QUESTION_REPLIES.First(x => x.QUESTION_CATEGORY.ToUpper() == "NPS").canskip = true;
                    }
                    batchCustomerAndQuestions.SURVEY_PERIOD = surveyPeriod;
                    return Ok(batchCustomerAndQuestions);
                }
                else
                {
                    var batchCustMonthly = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().FirstOrDefault(t => t.ID == iteration.BATCH_CUSTOMER_MONTHLY_ID && t.ISACTIVE);
                    if (batchCustMonthly == null)
                        return Content(HttpStatusCode.BadRequest, "Unable to load the survey details at the moment. Please come back later or mail to csmplatformsupport@gavstech.com");

                    CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED monthlyExt = helper.FillCustomerAndProjectNames(batchCustMonthly);
                    var batchExt = helper.FillCustomerAndProjectNames(batchCustMonthly);
                    var batch = CSPdb.CSS_BATCH_MONTHLY.GetById(batchCustMonthly.BATCH_MONTHLY_ID);
                    string surveyPeriod = GetCurrentPeriodStringNew("quarterly", (batch.MONTH - 1) / 3, batch.YEAR);
                    if (batch.MONTH == batch.END_DATE.Month)
                        surveyPeriod = batch.START_DATE.ToString("MMM-yyyy");

                    List<CSS_QUESTION_REPLIES> questionsWithReplies = new List<CSS_QUESTION_REPLIES>();

                    if (monthlyExt.PROD_ID != null)
                        monthlyExt.PROD_NM = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == monthlyExt.PROD_ID).PRODUCT_TITLE;
                    if (monthlyExt.PROJ_ID != null)
                        monthlyExt.PROJ_NM = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == monthlyExt.PROJ_ID).PROJ_NM;

                    if (iteration.ID != batchCustMonthly.SURVEY_ID)
                    {
                        iteration = CSPdb.CSS_SURVEY_ITERATION.GetById(batchCustMonthly.SURVEY_ID.GetValueOrDefault());
                    }


                    if (iteration.STATUS == "COMPLETED")
                    {
                        //Get Answers if survey is completed
                        questionsWithReplies = CSPdb.CSS_QUESTION_REPLIES.GetAll().Where(t => t.SURVEY_ID == iteration.SURVEY_ID).ToList();
                    }

                    else
                    {
                        if (!showCSSFields) CheckCSSLinkValid(iteration, batchCustMonthly.PROJ_ID);
                        //Get Question mode based on project
                        // By default - 1
                        //Logic needs to be correct to get latest questions.
                        List<CSS_QUESTION_MASTER> questions = new List<CSS_QUESTION_MASTER>();
                        int? questionModelId;
                        if (showQualitativeFeedback)
                        {
                            questionModelId = CSPdb.CSS_QUESTION_MODELS.GetAll().FirstOrDefault(x => x.MODEL_NAME == "Qualitative Feedback" && x.ISACTIVE)?.ID;
                        }
                        else
                        {
                            questionModelId = helper.GetQuestionModel(batchCustMonthly.CUST_ID, batchCustMonthly.PROJ_ID, true, batch.START_DATE, batch.END_DATE, batchCustMonthly.EMAIL_ID, batch.ID, "quarterly");
                        }
                        questions = CSPdb.CSS_QUESTION_MASTER.GetAll().Where(t => t.MODEL_ID == questionModelId && t.EFFECTIVE_FROM <= DateTime.Now && t.ISACTIVE == true).ToList();
                        questionsWithReplies = GetQuestionReplies(questions, batchCustMonthly.ID, iteration.SURVEY_ID, true);
                        questionsWithReplies = GetQuestionReplies(questions, batchCustMonthly.ID, iteration.SURVEY_ID, true);
                    }
                    var questionMaster = CSPdb.CSS_QUESTION_MASTER.GetAll().ToList();
                    foreach (var reply in questionsWithReplies)
                    {
                        var question = questionMaster.FirstOrDefault(x => x.ID == reply.QUESTION_ID);
                        if (question != null)
                        {
                            reply.QUESTION_DETAIL = question.QUESTION_DETAIL;
                        }
                    }

                    BatchCustomerAndQuestions batchCustomerAndQuestions = new BatchCustomerAndQuestions();
                    batchCustomerAndQuestions.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED = monthlyExt;
                    batchCustomerAndQuestions.CSS_QUESTION_REPLIES = questionsWithReplies;
                    if (showQualitativeFeedback && batchCustomerAndQuestions.CSS_QUESTION_REPLIES.Any(x => x.QUESTION_CATEGORY.ToUpper() == "NPS"))
                    {
                        batchCustomerAndQuestions.CSS_QUESTION_REPLIES.First(x => x.QUESTION_CATEGORY.ToUpper() == "NPS").canskip = true;
                    }
                    batchCustomerAndQuestions.SURVEY_PERIOD = surveyPeriod;
                    return Ok(batchCustomerAndQuestions);
                }
            }
            catch (Exception ex)
            {
                LogRequest(ex, prefix: "CSS");
                throw;
            }

        }


        private void CheckCSSLinkValid(CSS_SURVEY_ITERATION iteration, string projectId)
        {



            DateTime validDate = DateTime.Now;

            if (!string.IsNullOrWhiteSpace(projectId))
            {
                validDate = helper.GetLaterDateForCSSValidity(iteration.SURVEY_SENT_DATE, projectId);
            }
            else
            {
                validDate = helper.GetLaterDateForCSSValidity(iteration.SURVEY_SENT_DATE, "");
            }

            if (validDate < DateTime.Now)
            {
                throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Customer Success Survey link is not valid anymore as { validDate.ToString("dd-MM-yyyy")} is the last valid date since it is triggered. Please contact the project team to enable it."));
            }


        }

        private void CreateActionItemDetails(List<CSS_QUESTION_REPLIES> lowratings, string custId, string projId, int? batchCustomerId, int? batchCustomerMonthlyId, string customerName, string period)
        {
            var overview = new ActionItemsViewDetails();
            overview.CUST_ID = custId;
            overview.PROJ_ID = projId;
            overview.RAG = "Red";

            var desc = new StringBuilder();
            var reference = new StringBuilder();

            desc.AppendLine("Improvement Plan for Criteria:");
            desc.Append(Environment.NewLine);
            foreach (var item in lowratings)
            {
                desc.AppendLine($"{item.QUESTION} - [{item.RATING}] ");
                if (!string.IsNullOrWhiteSpace(item.RATING_DESCRIPTION))
                {
                    desc.AppendLine($"Remarks: {item.RATING_DESCRIPTION} ");
                }
                desc.AppendLine("CAPA: [To be detailed by PM] ");
                desc.Append(Environment.NewLine);

                reference.AppendLine($"Question: {item.QUESTION} ");
                reference.Append(Environment.NewLine);
                reference.AppendLine($"Rating: {item.RATING} ");
                reference.Append(Environment.NewLine);
                if (!string.IsNullOrWhiteSpace(item.RATING_DESCRIPTION))
                {
                    reference.AppendLine($"Remarks: {item.RATING_DESCRIPTION} ");
                }
            }

            overview.DESCRIPTION = desc.ToString();
            overview.ORIGINAL_DESCRIPTION = overview.DESCRIPTION;
            overview.SOURCE = $"Customer Success Survey - {customerName}";
            overview.SOURCE_DESCRIPTION = $"CSAT - { period}, {customerName} , Lower CSAT Score in Question ({string.Join(", ", lowratings.Select(x => x.QUESTION)) })";
            overview.CSS_REFERENCE = reference.ToString();
            overview.OWNER = helper.GetPMEmpInfoFromProject(projId).FirstOrDefault()?.FRST_NM;
            overview.IDENTIFIED_DATE = DateTime.Today;
            overview.TARGET_DATE = DateTime.Today.AddDays(7);
            overview.STATUS = "Identified";
            overview.PRIORITY = "High";
            overview.PLANNED_TARGET_DATE = DateTime.Today.AddDays(28);
            overview.CREATED_BY = "SYSTEM";
            overview.CREATED_DATE = DateTime.Now;
            overview.UPDATED_BY = "SYSTEM";
            overview.UPDATED_DATE = DateTime.Now;
            overview.ISACTIVE = true;
            overview.BATCH_CUSTOMER_MONTHLY_ID = lowratings[0].BATCH_CUSTOMER_MONTHLY_ID;
            overview.BATCH_CUSTOMER_ID = lowratings[0].BATCH_CUSTOMER_ID;
            AddActionItemInternal(overview);
        }

        private void CreateAuditTaskDetails(string cssScore, string custId, string projId, string cssUrl)
        {
            var taskInputs = new AuditTaskInputs();
            taskInputs.CATEGORY_ID = 26; // Customer Success Achievement
            taskInputs.TASK_DESCRIPTION = $"Issue spot award to the project team achieved Customer Success Score {cssScore} out of 5 in all questions";

            var schedulestartdate = DateTime.Today;
            if (schedulestartdate.DayOfWeek == DayOfWeek.Saturday)
                schedulestartdate = schedulestartdate.AddDays(-1);
            else if (schedulestartdate.DayOfWeek == DayOfWeek.Sunday)
                schedulestartdate = schedulestartdate.AddDays(-2);
            taskInputs.SCHEDULED_START_DATE = schedulestartdate;
            taskInputs.DUE_DATE = schedulestartdate.AddDays(2);

            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId && x.PROJ_STATUS != "Close");
            if (project == null) return;
            var toMail = helper.GetDBConfig("QUALITY_HEAD_MAIL", "-1");
            var empList = Cldb.EMP_INFO.GetAll().Where(x => (x.EMAIL_ID == toMail || x.EMP_ID == project.QUALITY_SPOC) && x.DOR == null).ToList();
            taskInputs.AUDITOR_EMP_ID = empList.FirstOrDefault(x => x.EMP_ID == project.QUALITY_SPOC)?.EMP_ID != null ? project.QUALITY_SPOC : empList.FirstOrDefault(x => x.EMAIL_ID == toMail)?.EMP_ID;
            taskInputs.CUST_ID = custId;
            taskInputs.PROJ_ID = projId;
            taskInputs.PROJ_NM = project.PROJ_NM;
            taskInputs.PROJ_PM_ID = project.PROJ_PM_EMP_ID;
            taskInputs.CSS_SCORE = cssScore;
            taskInputs.CSS_URL = cssUrl;
            AddAuditTask(taskInputs);
        }

        private List<string> GetProjectIdsForMonthlyCSAT(string customerEMailId)
        {
            var result = new List<string>();

            var products = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.ISACTIVE && x.MANAGEMENT_TYPE == 6 && x.EMP_ID == customerEMailId).Select(x => x.PRODUCT_ID).ToList();
            if (!products.Any()) return result;
            var managementTypes = new List<int> { 7 };//tbd
            var productResponsibleList = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.ISACTIVE && products.Contains(x.PRODUCT_ID) && managementTypes.Contains(x.MANAGEMENT_TYPE)).Select(x => x.PROJECT_ID).ToList();
            if (!productResponsibleList.Any()) return result;

            result = productResponsibleList;
            return result;
        }
        private string GetCurrentMonthString(int month, int year)
        {

            var newDate = new DateTime(year, month, 1);

            return newDate.ToString("MMMM yyyy");
        }

        private string GetSurveyPeriodString(string Frequency, int Sequence, int Year)
        {
            string Period = Frequency;
            if (Frequency.ToLower() == "quarterly")
            {
                if (Sequence == 1)
                {
                    Period = "Apr-" + Year.ToString() + " to Jun-" + Year.ToString();
                }
                else if (Sequence == 2) { Period = "Jul-" + Year.ToString() + " to Sep-" + Year.ToString(); }
                else if (Sequence == 3) { Period = "Oct-" + Year.ToString() + " to Dec-" + Year.ToString(); }
                else if (Sequence == 4) { Period = "Jan-" + (Year + 1).ToString() + " to Mar-" + (Year + 1).ToString(); }
            }
            else if (Frequency.ToLower() == "halfyearly")
            {
                if (Sequence == 1)
                {
                    Period = "Jan-" + Year.ToString() + " to Jun-" + Year.ToString();
                }
                else if (Sequence == 2) { Period = "Jul-" + Year.ToString() + " to Dec-" + Year.ToString(); }
            }
            return Period;
        }

        private string GetCurrentPeriodStringNew(string Frequency, int Sequence, int Year)
        {
            string CurrentPeriod = string.Empty;
            if (Frequency.ToLower() == "quarterly")
            {
                if (Sequence == 1) { CurrentPeriod = "Apr-Jun " + (Year).ToString(); }
                else if (Sequence == 2) { CurrentPeriod = "Jul-Sep " + Year.ToString(); }
                else if (Sequence == 3) { CurrentPeriod = "Oct-Dec " + Year.ToString(); }
                else if (Sequence == 0 || Sequence == 4) { CurrentPeriod = "Jan-Mar " + (Year).ToString(); }

            }
            else if (Frequency.ToLower() == "halfyearly")
            {
                if (Sequence == 1)
                {
                    CurrentPeriod = "Jan-" + Year.ToString() + " to Jun-" + Year.ToString();
                }
                else if (Sequence == 2)
                {
                    CurrentPeriod = "Jul-" + Year.ToString() + " to Dec-" + Year.ToString();
                }
            }
            return CurrentPeriod;
        }

        List<CSS_QUESTION_REPLIES> GetQuestionReplies(List<CSS_QUESTION_MASTER> questions, int batch_customer_id, string code, bool isMonthly)
        {
            List<CSS_QUESTION_REPLIES> questionsWithReplies = new List<CSS_QUESTION_REPLIES>();
            foreach (CSS_QUESTION_MASTER q in questions)
            {
                CSS_QUESTION_REPLIES reply = new CSS_QUESTION_REPLIES()
                {

                    SURVEY_ID = code,
                    QUESTION_ID = q.ID,
                    QUESTION = q.QUESTION,
                    QUESTION_CATEGORY = q.QUESTION_CATEGORY,
                    QUESTION_DETAIL = q.QUESTION_DETAIL,
                    RATING_SCALE = q.RATING_SCALE.GetValueOrDefault(1)
                };
                if (isMonthly)
                    reply.BATCH_CUSTOMER_MONTHLY_ID = batch_customer_id;
                else
                    reply.BATCH_CUSTOMER_ID = batch_customer_id;
                questionsWithReplies.Add(reply);
            }

            return questionsWithReplies;
        }


        public class BatchCustomerAndQuestions
        {
            public CSS_BATCH_CUSTOMERS_EXTENDED CSS_BATCH_CUSTOMERS_EXTENDED { get; set; }
            public CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED { get; set; }
            public List<CSS_QUESTION_REPLIES> CSS_QUESTION_REPLIES { get; set; } = new List<Model.CSP.CSS_QUESTION_REPLIES>();
            public string SURVEY_PERIOD { get; set; }
        }

        private void SendSurveyResultEmail(BatchCustomerAndQuestions replies, string surveyId, string frequency)
        {

            string tomail = replies.CSS_BATCH_CUSTOMERS_EXTENDED.EMAIL_ID;
            string ccmail = helper.GetDBConfig("CSS_SUCCESS_MAIL_CC", "-1");
            string subject = string.Empty;
            string mailContent = string.Empty;

            //SUBJECT
            if (frequency.ToLower() == "halfyearly")
                subject = "Half Yearly Pulse Survey submitted successfully (" + replies.CSS_BATCH_CUSTOMERS_EXTENDED.CUST_NM + " | " + replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_NM +
                  ", Feedback Period - " + replies.SURVEY_PERIOD + ")";
            else
                subject = "Customer Success Survey submitted successfully (" + replies.CSS_BATCH_CUSTOMERS_EXTENDED.CUST_NM + " | " + replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_NM +
                        ", Feedback Period - " + replies.SURVEY_PERIOD + ")";
            //CONTENT
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CUSTOMER", replies.CSS_BATCH_CUSTOMERS_EXTENDED.DISPLAY_NAME);

            if (HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Contains("CustomerSuccessSurvey"))
            {
                EmailContentValues.Add("SURVEY_LINK", HttpContext.Current.Request.UrlReferrer.AbsoluteUri);
            }
            else
            {
                var surveyURL = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("CustomerSuccessSurvey", "");
                surveyURL += "/CustomerSuccessSurvey/" + surveyId;
                EmailContentValues.Add("SURVEY_LINK", surveyURL);

            }

            //var surveyURL = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("CustomerSuccessSurvey", ""); ;
            //surveyURL += "/CustomerSuccessSurvey/" + surveyId;
            //EmailContentValues.Add("SURVEY_LINK", surveyURL);

            mailContent = helper.GetEmailContent("CustomerSuccessSurveySuccessMail.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = ServiceEmail, smtpHost = "smtp.office365.com", smtpPassword = ServicePassword, smtpPortValue = "587" },
                new EmailContent { from = ServiceEmail, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }, Request
                );
        }
        private void SendSurveySuccessEmail(BatchCustomerAndQuestions replies, string surveyId, string frequency)
        {

            string tomail = string.Empty;
            string ccmail = string.Empty;
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_ID);
            string csmmails = string.Empty;
            string pmmmails = string.Empty;
            string qualitySpoc = string.Empty;
            string amMail = string.Empty;
            if (replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROD_ID.HasValue)
            {
                var projIds = helper.GetProjIdsForProduct(replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROD_ID);
                var projects = Cldb.PROJECT.GetAll().Where(x => projIds.Contains(x.PROJ_ID)).ToList();
                if (projects.Any())
                {
                    csmmails = helper.GetCSMMailsFromProject(projects[0]);
                    pmmmails = helper.GetPMMailsFromProject(projects[0]);
                    qualitySpoc = helper.GetQualitySpocMailForProject(projects[0], false);
                    amMail = helper.GetAMFromProject(projects[0]);
                }
            }
            if (project == null)
            {
                var portfolio = CSPdb.PORTFOLIO.GetAll().FirstOrDefault(x => x.ID.ToString() == replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_ID);
                if (portfolio == null) return;
                var projectId = CSPdb.PORTFOLIO_PROJECT.GetAll().FirstOrDefault(x => x.PORTFOLIO_ID.ToString() == replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_ID)?.PROJ_ID;
                if (string.IsNullOrWhiteSpace(projectId)) return;
                project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);
                csmmails = helper.GetCSMMailsFromProject(project);
                pmmmails = helper.GetPMMailsFromProject(project);
                qualitySpoc = helper.GetQualitySpocMailForProject(project, false);
                amMail = helper.GetAMFromProject(replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_ID);
            }
            else
            {
                csmmails = helper.GetCSMMailsFromProject(project);
                pmmmails = helper.GetPMMailsFromProject(project);
                qualitySpoc = helper.GetQualitySpocMailForProject(project, false);
                amMail = helper.GetAMFromProject(replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_ID);
            }

            string subject = string.Empty;
            string mailContent = string.Empty;


            //TO list
            tomail = helper.ConcatEmails(new List<string>() { csmmails, pmmmails, qualitySpoc, amMail });
            ccmail += helper.GetDBConfig("CUSTOMER_SUCCESS_SURVEY", replies.CSS_BATCH_CUSTOMERS_EXTENDED.CUST_ID);
            //CSM Names
            //string CSMNames = helper.GetCSMNamesFromProject(replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_ID);
            //if (CSMNames == string.Empty)
            //    CSMNames = "Quality,";
            //else
            //    CSMNames += ",";
            //SUBJECT
            //SUBJECT
            if (frequency.ToLower() == "halfyearly")
                subject = $"Half Yearly Pulse Survey submitted successfully ({ replies.CSS_BATCH_CUSTOMERS_EXTENDED.CUST_NM } | {replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_NM} , Feedback Period - { replies.SURVEY_PERIOD })";
            else
                subject = $"Customer Success Survey submitted successfully ({ replies.CSS_BATCH_CUSTOMERS_EXTENDED.CUST_NM } | {replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_NM} , Feedback Period - { replies.SURVEY_PERIOD })";


            //CONTENT
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            //var url = $"CustomerSuccessSurvey/{surveyId}";


            if (HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Contains("CustomerSuccessSurvey"))
            {
                EmailContentValues.Add("SURVEY_LINK", HttpContext.Current.Request.UrlReferrer.AbsoluteUri);
            }
            else
            {
                var surveyURL = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("CustomerSuccessSurvey", "");
                surveyURL += "/CustomerSuccessSurvey/" + surveyId;
                EmailContentValues.Add("SURVEY_LINK", surveyURL);

            }


            //EmailContentValues.Add("SURVEY_LINK", HttpContext.Current.Request.UrlReferrer.AbsoluteUri);

            mailContent = helper.GetEmailContent("CustomerSuccessSurveySurveyFeedback.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = ServiceEmail, smtpHost = "smtp.office365.com", smtpPassword = ServicePassword, smtpPortValue = "587" },
                new EmailContent { from = ServiceEmail, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }, Request
                );
        }

        private void SendSurveyResultEmailMonthly(BatchCustomerAndQuestions replies, string surveyId)
        {
            var email = ConfigurationManager.AppSettings["emailid"];
            var pass = ConfigurationManager.AppSettings["emailpassword"];
            var tomail = replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.EMAIL_ID;
            var ccmail = string.Empty;
            var subject = string.Empty;
            var mailContent = string.Empty;
            bool sendCCmail = bool.Parse(helper.GetDBConfig("CSS_LINK_CC_ENABLE", "-1"));

            ccmail = string.Join(",", helper.GetCCEmailIDsForPremier(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.EMAIL_ID, replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROJ_ID));
            if (!string.IsNullOrWhiteSpace(ccmail))
                ccmail += ",";
            ccmail += helper.GetDBConfig("CSS_SUCCESS_MAIL_CC", replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.CUST_ID);
            //SUBJECT
            var specStr = string.IsNullOrEmpty(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROJ_NM) && string.IsNullOrEmpty(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROD_NM) ? "" : (string.IsNullOrEmpty(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROD_NM) ? replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROJ_NM : replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROD_NM);
            subject = "CSS submitted successfully (" + replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.CUST_NM + "-" + specStr + ", Feedback Period - " + replies.SURVEY_PERIOD + ")";
            //CONTENT
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CUSTOMER", replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.DISPLAY_NAME);


            if (HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Contains("CustomerSuccessSurvey"))
            {
                EmailContentValues.Add("SURVEY_LINK", HttpContext.Current.Request.UrlReferrer.AbsoluteUri);
            }
            else
            {
                var surveyURL = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("CustomerSuccessSurvey", "");
                surveyURL += "/CustomerSuccessSurvey/" + surveyId;
                EmailContentValues.Add("SURVEY_LINK", surveyURL);

            }


            //var surveyURL = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("CustomerSuccessSurvey", ""); ;
            //surveyURL += "/CustomerSuccessSurvey/" + surveyId;
            //EmailContentValues.Add("SURVEY_LINK", surveyURL);

            mailContent = helper.GetEmailContent("CustomerSuccessSurveySuccessMail.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = email, smtpHost = "smtp.office365.com", smtpPassword = pass, smtpPortValue = "587" },
                new EmailContent { from = email, to = tomail, cc = sendCCmail ? ccmail : string.Empty, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }, Request
                );
        }

        private void SendSurveySuccessEmailMonthly(BatchCustomerAndQuestions replies, string surveyId, string emailId)
        {

            string tomail = string.Empty;
            string ccmail = string.Empty;
            bool sendCCmail = bool.Parse(helper.GetDBConfig("CSS_LINK_CC_ENABLE", "-1"));
            //var mails = helper.GetCSMMailsFromAccount(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.CUST_ID);

            //mails.AddRange(helper.GetQualitySPOCMailsFromAccount(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.CUST_ID)); ;
            string subject = string.Empty;
            string mailContent = string.Empty;


            //TO list
            tomail = helper.GetDBConfig("CUSTOMER_SUCCESS_SURVEY_TO", replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.CUST_ID);


            //CC list
            ccmail = string.Join(",", helper.GetCCEmailIDsForPremier(emailId, replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROJ_ID));
            if (!string.IsNullOrWhiteSpace(ccmail))
                ccmail += ",";
            ccmail += helper.GetDBConfig("CUSTOMER_SUCCESS_SURVEY_CC", replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.CUST_ID);

            var specStr = string.IsNullOrEmpty(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROJ_NM) && string.IsNullOrEmpty(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROD_NM) ? "" : (string.IsNullOrEmpty(replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROD_NM) ? replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROJ_NM : replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROD_NM);
            //SUBJECT
            //subject = "CSS Feedback submitted by " + replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.DISPLAY_NAME.Trim() + " of " +
            //        replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.CUST_NM + "-" + specStr + " Feedback Period - " + replies.SURVEY_PERIOD;
            subject = $"Customer Success Survey submitted successfully ({ replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.CUST_NM } | {specStr} , Feedback Period - { replies.SURVEY_PERIOD })";

            //CONTENT
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            //var url = $"CustomerSuccessSurvey/{surveyId}";


            if (HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Contains("CustomerSuccessSurvey"))
            {
                EmailContentValues.Add("SURVEY_LINK", HttpContext.Current.Request.UrlReferrer.AbsoluteUri);
            }
            else
            {
                var surveyURL = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("CustomerSuccessSurvey", "");
                surveyURL += "/CustomerSuccessSurvey/" + surveyId;
                EmailContentValues.Add("SURVEY_LINK", surveyURL);

            }


            //EmailContentValues.Add("SURVEY_LINK", HttpContext.Current.Request.UrlReferrer.AbsoluteUri);

            mailContent = helper.GetEmailContent("CustomerSuccessSurveySurveyFeedback.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = ServiceEmail, smtpHost = "smtp.office365.com", smtpPassword = ServicePassword, smtpPortValue = "587" },
                new EmailContent { from = ServiceEmail, to = tomail, cc = sendCCmail ? ccmail : Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }, Request
                );
        }

        private void SendSurveySuccessEmailForQualitativeFeedback(BatchCustomerAndQuestions replies, string surveyId, string emailId, string empId)
        {
            string tomail = emailId;
            string ccmail = string.Empty;
            var ccList = new List<string>();
            string mailContent = string.Empty;
            string actionItemContent = string.Empty;
            PROJECT project = null;

            string projectId = replies.CSS_BATCH_CUSTOMERS_EXTENDED != null && !string.IsNullOrWhiteSpace(replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_ID) ?
                replies.CSS_BATCH_CUSTOMERS_EXTENDED.PROJ_ID : replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.PROJ_ID;
            var accountName = replies.CSS_BATCH_CUSTOMERS_EXTENDED != null && !string.IsNullOrWhiteSpace(replies.CSS_BATCH_CUSTOMERS_EXTENDED.CUST_NM) ?
                replies.CSS_BATCH_CUSTOMERS_EXTENDED.CUST_NM : replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.CUST_NM;
            var customerName = replies.CSS_BATCH_CUSTOMERS_EXTENDED != null && !string.IsNullOrWhiteSpace(replies.CSS_BATCH_CUSTOMERS_EXTENDED.DISPLAY_NAME) ?
                replies.CSS_BATCH_CUSTOMERS_EXTENDED.DISPLAY_NAME : replies.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED.DISPLAY_NAME;

            var respondent = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId);
            var lowRatings = replies.CSS_QUESTION_REPLIES.Where(x => (x.QUESTION_CATEGORY == "Criteria" && x.RATING <= 3) || (x.QUESTION_CATEGORY == "NPS" && x.RATING < 9)).ToList();

            if (lowRatings.Any())
            {
                actionItemContent = $"We will get back to you with improvement action plan within seven days.";
            }
            if (!string.IsNullOrWhiteSpace(projectId))
            {
                project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);
                if (project != null)
                {
                    ccList.Add(helper.GetPMMailsFromProject(project));
                    ccList.Add(helper.GetQualitySpocMailForProject(project, false));
                    ccList.Add(helper.GetCSMMailsFromProject(project));
                    ccList.Add(helper.GetDBConfig("CSS_SUCCESS_MAIL_CC", "-1"));
                    ccList.Add(respondent.EMAIL_ID);
                }
            }
            else
            {
                ccList.AddRange(helper.GetCCEmailIDsForPremier(emailId, ""));
                ccList.AddRange(helper.GetCSMMailsFromAccount(emailId));
            }
            ccmail = string.Join(",", ccList);

            var subject = "CSS Feedback submitted by " + respondent.FRST_NM + " on behalf of " + customerName + " for " + accountName + " - " + project.PROJ_NM + " | " + ", Feedback Period - " + replies.SURVEY_PERIOD;
            var requestDomain = helper.GetAbsoulteUri();
            var path = "CustomerSuccessSurvey";
            var surveyURL = $"{requestDomain}//{path}/{surveyId}";

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CUSTOMER_NAME", customerName);
            EmailContentValues.Add("PROJECT_NAME", project != null ? project.PROJ_NM : "");
            EmailContentValues.Add("SURVEY_LINK", surveyURL);
            EmailContentValues.Add("RESPONDENT_NAME", respondent.FRST_NM);
            EmailContentValues.Add("RESPONDENT_ROLE", respondent.TITLE);
            EmailContentValues.Add("ACTION_ITEM_CONTENT", actionItemContent);
            mailContent = helper.GetEmailContent("CustomerSuccessSurveyQualitativeFeedback.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = ServiceEmail, smtpHost = "smtp.office365.com", smtpPassword = ServicePassword, smtpPortValue = "587" },
                new EmailContent { from = ServiceEmail, to = tomail, cc = ccmail, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }, Request
                );
        }
        #endregion
    }
}