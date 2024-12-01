using GAVS.AllocationSystem.Data;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [Route("SaveIdeaDetails")]
        [ActionName("SaveIdeaDetails")]
        [HttpPost]
        public IHttpActionResult SaveIdeaDetails([FromBody] IDEA inputIdea)
        {
            LogRequest(content: JsonConvert.SerializeObject(inputIdea), prefix: "");

            ValidateReqest(inputIdea);

            var idea = GetEntity(CSPdb.IDEA.GetAll(), inputIdea);
            idea.IDEA_STATUS_ID = inputIdea.IDEA_STATUS_ID;
            idea.IDEA_IMPROVEMENT_TYPE_ID = inputIdea.IDEA_IMPROVEMENT_TYPE_ID;
            idea.DESCRIPTION = inputIdea.DESCRIPTION;
            idea.POTENTIAL_SOLUTION_CATEGORY_ID = inputIdea.POTENTIAL_SOLUTION_CATEGORY_ID;
            idea.POTENTIAL_SOLUTION_DESCRIPTION = inputIdea.POTENTIAL_SOLUTION_DESCRIPTION;
            idea.PROCESS_AREA_ID = inputIdea.PROCESS_AREA_ID;
            idea.PROCESS_ID = inputIdea.PROCESS_ID;
            idea.SERVICE_AREA_ID = inputIdea.SERVICE_AREA_ID;
            idea.PROJECT_ID = inputIdea.PROJECT_ID;
            idea.COMMENTS = inputIdea.COMMENTS;
            idea.IDENTIFIED_DATE = inputIdea.IDENTIFIED_DATE;

            if (!idea.ISSUBMITTED)
                idea.STAGE_ID = inputIdea.STAGE_ID;

            idea.ISSUBMITTED = inputIdea.ISSUBMITTED;

            if (idea.ID == 0)
                CSPdb.IDEA.Add(idea);
            else
                CSPdb.IDEA.Update(idea);
            CSPdb.Commit(CanCommit);

            if (inputIdea.IDENTIFIED_BY != null && inputIdea.IDENTIFIED_BY.Length > 0)
            {
                var existingIdetifier = Cldb.IDEA_IDENTIFIER.GetAll().Where(x => x.IDEA_ID == idea.ID && x.ISACTIVE).ToList();
                foreach (var item in existingIdetifier)
                {
                    item.ISACTIVE = false;
                }
                foreach (var item in inputIdea.IDENTIFIED_BY)
                {
                    var existing = existingIdetifier.FirstOrDefault(x => x.IDENTIFIED_BY == item);
                    if (existing != null)
                    {
                        UpdateAuditFields(existing);
                    }
                    else
                    {
                        var identifier = new IDEA_IDENTIFIER
                        {
                            IDEA_ID = idea.ID,
                            IDENTIFIED_BY = item
                        };
                        UpdateAuditFields(identifier);
                        Cldb.IDEA_IDENTIFIER.Add(identifier);
                    }
                }
                foreach (var item in existingIdetifier)
                {
                    Cldb.IDEA_IDENTIFIER.Update(item);
                }
            }

            Cldb.Commit(CanCommit);
            return Ok(idea);
        }

        private void UpdateIdeaStageId(int IdeaId, int StageId, IDEA idea = null)
        {
            if (idea == null)
                idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == IdeaId);
            if (idea != null)
            {
                idea.STAGE_ID = StageId;
                CSPdb.IDEA.Update(idea);
                CSPdb.Commit(CanCommit);
            }
        }

        [Route("GetSimilarIdeas")]
        [ActionName("GetSimilarIdeas")]
        [HttpPost]
        public IHttpActionResult GetSimilarIdeas([FromBody] IDEA idea)
        {
            ValidateReqest(idea);
            var similarIdeas = Cldb.AppRepo.getSimilarIdeas(idea.DESCRIPTION).ToList();
            return Ok(similarIdeas);
        }

        [Route("GetIdeaStatus")]
        [ActionName("GetIdeaStatus")]
        [HttpGet]
        public IHttpActionResult GetIdeaStatus()
        {
            return Ok(CSPdb.IDEA_STATUS.GetAll().Where(x => x.ISACTIVE).ToList());
        }

        [Route("GetprojectsNameForAPortfolioNew")]
        [ActionName("GetprojectsNameForAPortfolioNew")]
        [HttpGet]
        public IHttpActionResult GetprojectsNameForAPortfolioNew(int portfolio)
        {
            return Ok(CSPdb.AppRepo.GetprojectsNameForAPortfolioNew(portfolio).ToList());
        }

        [Route("SaveIdeaBenefits")]
        [ActionName("SaveIdeaBenefits")]
        [HttpPost]
        public IHttpActionResult SaveIdeaBenefits([FromBody] List<IdeaBenefits> ideaBenefitList)
        {
            ValidateReqest(ideaBenefitList);

            foreach (var ideaBenefits in ideaBenefitList)
            {
                var inputSummary = ideaBenefits.IDEA_BENEFIT_SUMMARY;
                ValidateReqest(inputSummary);

                var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == inputSummary.IDEA_ID);
                if (idea == null)
                    return BadRequest("There is no corresponding idea exists in database");

                var summaryRec = GetEntity(CSPdb.IDEA_BENEFIT_SUMMARY.GetAll(), inputSummary);
                summaryRec.IDEA_ID = inputSummary.IDEA_ID;
                summaryRec.BENEFIT_PILLAR_ID = inputSummary.BENEFIT_PILLAR_ID;
                summaryRec.TYPE_ID = inputSummary.TYPE_ID;
                summaryRec.BENEFICIARY_ID = inputSummary.BENEFICIARY_ID;
                summaryRec.BENEFIT_TYPE_ID = inputSummary.BENEFIT_TYPE_ID;
                summaryRec.CATEGORY_ID = inputSummary.CATEGORY_ID;
                summaryRec.IS_ONETIME = inputSummary.IS_ONETIME;

                if (summaryRec.ID == 0)
                    CSPdb.IDEA_BENEFIT_SUMMARY.Add(summaryRec);
                else
                    CSPdb.IDEA_BENEFIT_SUMMARY.Update(summaryRec);

                CSPdb.Commit(CanCommit);

                ideaBenefits.IDEA_BENEFIT_SUMMARY.ID = summaryRec.ID;

                if (!idea.ISSUBMITTED)
                    UpdateIdeaStageId(inputSummary.IDEA_ID, 2);

                var inputBenefits = ideaBenefits.BENEFIT_DETAILS_QUANTITATIVE_VM;
                var inputQualitativeBenefit = ideaBenefits.BENEFIT_DETAILS_QUALITATIVE;

                var benefitList = new List<BENEFIT_DETAILS_QUANTITATIVE>();

                if (inputBenefits != null)
                {
                    // Delete already existing data
                    var deleteDetails = CSPdb.BENEFIT_DETAILS_QUANTITATIVE.GetAll().Where(x => x.ISACTIVE && x.BENEFIT_SUMMARY_ID == summaryRec.ID).ToList();
                    CSPdb.BENEFIT_DETAILS_QUANTITATIVE.DeleteList(deleteDetails);

                    // Add new benefit details

                    foreach (var benefit in inputBenefits.BENEFITS_ARRAY)
                    {
                        var newRec = new BENEFIT_DETAILS_QUANTITATIVE();
                        newRec.BENEFIT_SUMMARY_ID = summaryRec.ID;
                        newRec.UOM_ID = benefit.UOM_ID;
                        newRec.CURRENT_STATE_MONTH = benefit.CURRENT_STATE_MONTH;
                        newRec.CURRENT_STATE_YEAR = benefit.CURRENT_STATE_YEAR;
                        newRec.FUTURE_STATE_MONTH = benefit.FUTURE_STATE_MONTH;
                        newRec.FUTURE_STATE_YEAR = benefit.FUTURE_STATE_YEAR;
                        newRec.NET_BENEFITS_MONTH = benefit.NET_BENEFITS_MONTH;
                        newRec.NET_BENEFITS_YEAR = benefit.NET_BENEFITS_YEAR;
                        UpdateAuditFields(newRec);
                        benefitList.Add(newRec);
                    }

                    CSPdb.BENEFIT_DETAILS_QUANTITATIVE.AddList(benefitList);
                }

                var qualRec = new BENEFIT_DETAILS_QUALITATIVE();

                if (inputQualitativeBenefit.BENEFIT_TITLE != null)
                {
                    qualRec = GetEntity(CSPdb.BENEFIT_DETAILS_QUALITATIVE.GetAll(), inputQualitativeBenefit);
                    qualRec.BENEFIT_SUMMARY_ID = summaryRec.ID;
                    qualRec.BENEFIT_TITLE = inputQualitativeBenefit.BENEFIT_TITLE;
                    qualRec.BENEFIT_DESCRIPTION = inputQualitativeBenefit.BENEFIT_DESCRIPTION;
                    qualRec.TAG = inputQualitativeBenefit.TAG;
                    if (inputQualitativeBenefit.ID == 0)
                        CSPdb.BENEFIT_DETAILS_QUALITATIVE.Add(qualRec);
                    else
                        CSPdb.BENEFIT_DETAILS_QUALITATIVE.Update(qualRec);
                }

                CSPdb.Commit(CanCommit);

                if (inputBenefits != null)
                {
                    foreach (var benefit in inputBenefits.BENEFITS_ARRAY)
                    {
                        var rec = benefitList.Find(x => x.UOM_ID == benefit.UOM_ID);
                        if (rec != null)
                        {
                            benefit.ID = rec.ID;
                        }
                    }
                }

                if (inputQualitativeBenefit != null)
                    inputQualitativeBenefit.ID = qualRec.ID;
            }

            return Ok(ideaBenefitList);
        }

        [Route("SaveIdeaImplementationDetails")]
        [ActionName("SaveIdeaImplementationDetails")]
        [HttpPost]
        public IHttpActionResult SaveIdeaImplementationDetails([FromBody] IDEA_IMPLEMENTATION_PLAN implPlan)
        {
            ValidateReqest(implPlan);

            var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == implPlan.IDEA_ID);
            if (idea == null)
                return BadRequest("There is no corresponding idea exists in database");

            var impRec = GetEntity(CSPdb.IDEA_IMPLEMENTATION_PLAN.GetAll(), implPlan);
            impRec.IDEA_ID = implPlan.IDEA_ID;
            impRec.ESTIMATED_EFFORTS = implPlan.ESTIMATED_EFFORTS;
            impRec.RESPONSIBLE = implPlan.RESPONSIBLE;
            impRec.ESTIMATED_START_DATE = implPlan.ESTIMATED_START_DATE;
            impRec.ESTIMATED_TARGET_DATE = implPlan.ESTIMATED_TARGET_DATE;
            impRec.COMMENTS = implPlan.COMMENTS;
            impRec.MILESTONE = implPlan.MILESTONE;
            impRec.DESCRIPTION = implPlan.DESCRIPTION;
            impRec.ISSUBMITTED = implPlan.ISSUBMITTED;
            if (impRec.ID == 0)
                CSPdb.IDEA_IMPLEMENTATION_PLAN.Add(impRec);
            else
                CSPdb.IDEA_IMPLEMENTATION_PLAN.Update(impRec);

            CSPdb.Commit(CanCommit);
            UpdateIdeaStageId(implPlan.IDEA_ID, 3);

            return Ok(impRec);
        }

        [Route("UpdateIdeaDetails")]
        [ActionName("UpdateIdeaDetails")]
        [HttpGet]
        public IHttpActionResult UpdateIdeaDetails(int IdeaId, string Comments)
        {

            var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == IdeaId);
            if (idea != null)
            {
                idea.COMMENTS = Comments;
                CSPdb.IDEA.Update(idea);
                CSPdb.Commit(CanCommit);
            }
            return Ok();
        }

        [Route("DeleteIdea")]
        [ActionName("DeleteIdea")]
        [HttpGet]
        public IHttpActionResult DeleteIdea(int ideaId)
        {
            LogRequest(content: ideaId.ToString(), prefix: "");

            var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == ideaId);
            var ideaIdentifier = Cldb.IDEA_IDENTIFIER.GetAll().Where(x => x.IDEA_ID == ideaId && x.ISACTIVE).Select(x => x.IDENTIFIED_BY).ToList();
            var empId = GetHeaderDetails_String("empId");
            if (idea != null && ideaIdentifier.Contains(empId))
            {
                CheckUserHasAccess(empId, "", idea.PROJECT_ID);
                idea.ISACTIVE = false;
                CSPdb.IDEA.Update(idea);
                CSPdb.Commit(CanCommit);
            }
            else
            {
                string err = "Idea Can Only be Deleted by Identified Person.";
                return Content(HttpStatusCode.Conflict, err);
            }
            return Ok();
        }

        [Route("DeleteIdeaBenefit")]
        [ActionName("DeleteIdeaBenefit")]
        [HttpPost]
        public IHttpActionResult DeleteIdeaBenefit([FromBody] IdeaBenefits ideaBenefitList)
        {
            LogRequest(content: JsonConvert.SerializeObject(ideaBenefitList), prefix: "");
            ValidateReqest(ideaBenefitList);
            var empId = GetHeaderDetails_String("empId");
            var inputSummary = ideaBenefitList.IDEA_BENEFIT_SUMMARY;
            var inputQuantitativeBenefits = ideaBenefitList.BENEFIT_DETAILS_QUANTITATIVE_VM;
            var inputQualitativeBenefit = ideaBenefitList.BENEFIT_DETAILS_QUALITATIVE;
            var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == inputSummary.IDEA_ID);
            if (idea == null)
                return Content(HttpStatusCode.Conflict, "There is no corresponding idea exists in database :" + inputSummary.IDEA_ID);

            CheckUserHasAccess(empId, "", idea.PROJECT_ID);
            var summaryRec = CSPdb.IDEA_BENEFIT_SUMMARY.GetAll().FirstOrDefault(x => x.ID == inputSummary.ID && x.ISACTIVE);
            var qualitativeRec = CSPdb.BENEFIT_DETAILS_QUALITATIVE.GetAll().FirstOrDefault(x => x.BENEFIT_SUMMARY_ID == inputQualitativeBenefit.BENEFIT_SUMMARY_ID && x.ISACTIVE);
            var quantitativeRec = CSPdb.BENEFIT_DETAILS_QUANTITATIVE.GetAll().Where(x => x.BENEFIT_SUMMARY_ID == inputQuantitativeBenefits.BENEFIT_SUMMARY_ID && x.ISACTIVE).ToList();

            if (summaryRec != null)
            {
                summaryRec.ISACTIVE = false;
                summaryRec.UPDATED_DATE = DateTime.Now;
                summaryRec.UPDATED_BY = empId;
                CSPdb.IDEA_BENEFIT_SUMMARY.Update(summaryRec);
            }
            if (qualitativeRec != null)
            {
                qualitativeRec.ISACTIVE = false;
                qualitativeRec.UPDATED_DATE = DateTime.Now;
                qualitativeRec.UPDATED_BY = empId;
                CSPdb.BENEFIT_DETAILS_QUALITATIVE.Update(qualitativeRec);
            }
            foreach (var rec in quantitativeRec)
            {
                if (rec != null)
                {
                    rec.ISACTIVE = false;
                    rec.UPDATED_DATE = DateTime.Now;
                    rec.UPDATED_BY = empId;
                    CSPdb.BENEFIT_DETAILS_QUANTITATIVE.Update(rec);
                }
            }
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        [Route("SubmitIdea")]
        [ActionName("SubmitIdea")]
        [HttpPost]
        public IHttpActionResult SubmitIdea([FromBody] int ideaId)
        {
            LogRequest(content: ideaId.ToString(), prefix: "");

            var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == ideaId && x.ISACTIVE);
            if (idea == null)
                return Content(HttpStatusCode.Conflict, "There is no corresponding idea exists in database");

            CheckUserHasAccess(GetHeaderDetails_String("empId"), "", idea.PROJECT_ID);
            idea.ISSUBMITTED = true;
            idea.IDEA_STATUS_ID = 2;
            CSPdb.IDEA.Update(idea);

            var isRecExists = CSPdb.IDEA_STAGE_STATUS.GetAll().FirstOrDefault(x => x.IDEA_ID == ideaId && x.ACTION == IDEA_STAGE_ACTION.IDEA_SUBMITTED);
            var action = isRecExists != null ? IDEA_STAGE_ACTION.IDEA_RESUBMITTED : IDEA_STAGE_ACTION.IDEA_SUBMITTED;

            var status = new IDEA_STAGE_STATUS()
            {
                IDEA_ID = idea.ID,
                ACTION = action,
                COMMENTS = idea.COMMENTS,
                UPDATED_BY = idea.UPDATED_BY,
                UPDATED_DATE = idea.UPDATED_DATE
            };

            var csmId = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == idea.PROJECT_ID)?.PROJ_DM_EMP_ID;
            var reviewStatus = new IDEA_STAGE_STATUS()
            {
                IDEA_ID = idea.ID,
                ACTION = IDEA_STAGE_ACTION.IDEA_SENT_FOR_APPROVAL,
                COMMENTS = idea.COMMENTS,
                UPDATED_BY = csmId.ToString(),
                UPDATED_DATE = DateTime.Now
            };

            CSPdb.IDEA_STAGE_STATUS.Add(status);
            CSPdb.IDEA_STAGE_STATUS.Add(reviewStatus);

            UpdateIdeaStageId(ideaId, 4);
            SendEmail_IdeaSubmitted(ideaId);
            return Ok();
        }


        [Route("GetIdeaCategories")]
        [ActionName("GetIdeaCategories")]
        [HttpGet]
        public IHttpActionResult GetIdeaCategories()
        {
            return Ok(CSPdb.IDEA_CATEGORY.GetAll().ToList());
        }

        [Route("GetIdeaImprovementsAndCategories")]
        [ActionName("GetIdeaImprovementsAndCategories")]
        [HttpGet]
        public IHttpActionResult GetIdeaImprovementsAndCategories()
        {
            return Ok(new { Categories = CSPdb.POTENTIAL_SOLUTION_CATEGORY.GetAll().ToList(), Improvements = CSPdb.IDEA_IMPROVEMENT_TYPE.GetAll().ToList() });
        }

        [Route("GetApplicableBenefits")]
        [ActionName("GetApplicableBenefits")]
        [HttpPost]
        public IHttpActionResult GetApplicableBenefits([FromBody] int[] Categoryids)
        {
            var categories = String.Join(",", Categoryids);
            return Ok(CSPdb.AppRepo.GetApplicableBenefits(categories).ToList());
        }

        [Route("GetServiceAreasForProject")]
        [ActionName("GetServiceAreasForProject")]
        [HttpGet]
        public IHttpActionResult GetServiceAreasForProject(string projId)
        {
            var empid = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empid, "", projId);
            return Ok(CSPdb.AppRepo.GetServiceAreasForproject(projId).ToList());
        }

        [Route("GetCategoryByBenefitPillar")]
        [ActionName("GetCategoryByBenefitPillar")]
        [HttpGet]
        public IHttpActionResult GetCategoryByBenefitPillar(int PillarId, int TypeId)
        {
            return Ok(CSPdb.IDEA_CATEGORY.GetAll().Where(x => x.ISACTIVE && x.BENEFIT_PILLAR_ID == PillarId && x.BENEFIT_TYPE_ID == TypeId).ToList());
        }

        [Route("GetAllIdeas")]
        [ActionName("GetAllIdeas")]
        [HttpPost]
        public IHttpActionResult GetAllIdeas([FromBody] IdeaInputs ideaInputs)
        {
            var empId = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empId, ideaInputs.CUSTOMER_ID, string.Empty);
            var ideas = CSPdb.AppRepo.GetAllIdeas(ideaInputs.CUSTOMER_ID, ideaInputs.START_DATE, ideaInputs.END_DATE).ToList();
            return Ok(ideas);
        }

        [Route("GetAllIdeasByCustomer")]
        [ActionName("GetAllIdeasByCustomer")]
        [HttpGet]
        public IHttpActionResult GetAllIdeasByCustomer(string customerId)
        {
            var empid = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empid, customerId, string.Empty);
            return Ok(CSPdb.AppRepo.GetAllIdeasByCustomer(customerId).ToList());
        }


        [Route("GetIdeaStageStatus")]
        [ActionName("GetIdeaStageStatus")]
        [HttpGet]
        public IHttpActionResult GetIdeaStageStatus(int Ideaid)
        {
            return Ok(CSPdb.AppRepo.GetIdeaStageStatus(Ideaid).ToList());
        }

        [Route("GetIdeaDetailsById")]
        [ActionName("GetIdeaDetailsById")]
        [HttpGet]
        public IHttpActionResult GetIdeaDetailsById(int Ideaid)
        {

            var details = new AllIdeaDetails();
            var idea = CSPdb.AppRepo.GetIdeabyId(Ideaid);
            var ideaIdentifier = Cldb.IDEA_IDENTIFIER.GetAll().Where(x => x.IDEA_ID == Ideaid && x.ISACTIVE).Select(x => x.IDENTIFIED_BY).ToList();
            if (idea == null)
                return BadRequest("No idea exists with the given Id");


            idea.IDENTIFIED_BY = ideaIdentifier.ToArray();

            details.IDEA = idea;

            var benefitSummaryRecs = CSPdb.IDEA_BENEFIT_SUMMARY.GetAll().Where(x => x.ISACTIVE && x.IDEA_ID == Ideaid).ToList();
            var benefitSummaryIds = benefitSummaryRecs.Select(x => x.ID);
            var benefitPillarIds = benefitSummaryRecs.Where(x => x.BENEFIT_PILLAR_ID != null).Select(x => (int)x.BENEFIT_PILLAR_ID);
            var quantitativeBenefitRecs = CSPdb.BENEFIT_DETAILS_QUANTITATIVE.GetAll().Where(x => x.ISACTIVE && benefitSummaryIds.Contains(x.BENEFIT_SUMMARY_ID)).ToList();
            var qualitativeBenefitRecs = CSPdb.BENEFIT_DETAILS_QUALITATIVE.GetAll().Where(x => x.ISACTIVE && benefitSummaryIds.Contains(x.BENEFIT_SUMMARY_ID)).ToList();
            var categories = CSPdb.IDEA_CATEGORY.GetAll().Where(x => benefitPillarIds.Contains(x.BENEFIT_PILLAR_ID)).ToList();
            var categoryString = String.Join(",", benefitSummaryRecs.Select(x => x.CATEGORY_ID));
            var applBenefits = CSPdb.AppRepo.GetApplicableBenefits(categoryString).ToList();

            var benefitList = new List<IdeaBenefits>();
            foreach (var summary in benefitSummaryRecs)
            {
                var newBenefit = new IdeaBenefits();
                newBenefit.IDEA_BENEFIT_SUMMARY = summary;
                newBenefit.IDEA_BENEFIT_SUMMARY.CATEGORIES = categories.Where(x => x.BENEFIT_PILLAR_ID == (int)summary.BENEFIT_PILLAR_ID).ToList();
                if (summary.BENEFIT_TYPE_ID == BENEFIT_TYPE.Quantitative)
                {
                    var quantitativeBenefitRec = quantitativeBenefitRecs.Where(x => x.BENEFIT_SUMMARY_ID == summary.ID);
                    var benefitVM = new BENEFIT_DETAILS_QUANTITATIVE_VM();
                    benefitVM.BENEFIT_SUMMARY_ID = summary.ID;
                    benefitVM.IS_ONETIME = summary.IS_ONETIME;
                    benefitVM.ID = summary.ID;

                    var benefitDetails = new List<Benefits>();
                    foreach (var rec in quantitativeBenefitRec)
                    {
                        var benefit = new Benefits();
                        benefit.CURRENT_STATE_MONTH = rec.CURRENT_STATE_MONTH;
                        benefit.CURRENT_STATE_YEAR = rec.CURRENT_STATE_YEAR;
                        benefit.FUTURE_STATE_MONTH = rec.FUTURE_STATE_MONTH;
                        benefit.FUTURE_STATE_YEAR = rec.FUTURE_STATE_YEAR;
                        benefit.NET_BENEFITS_MONTH = rec.NET_BENEFITS_MONTH;
                        benefit.NET_BENEFITS_YEAR = rec.NET_BENEFITS_YEAR;
                        benefit.UOM_ID = rec.UOM_ID;
                        benefit.ID = rec.ID;
                        var benefitRow = applBenefits.FirstOrDefault(x => x.UOM_ID == rec.UOM_ID);
                        if (benefitRow != null)
                        {
                            benefit.TITLE = benefitRow.TITLE;
                            benefit.DATATYPE = benefitRow.DATATYPE;
                        }
                        benefitDetails.Add(benefit);
                    }
                    benefitVM.BENEFITS_ARRAY = benefitDetails;
                    newBenefit.BENEFIT_DETAILS_QUANTITATIVE_VM = benefitVM;
                    newBenefit.BENEFIT_DETAILS_QUALITATIVE = new BENEFIT_DETAILS_QUALITATIVE();
                }
                else if (summary.BENEFIT_TYPE_ID == BENEFIT_TYPE.Qualitative)
                {
                    var qualitativeBenefitRec = qualitativeBenefitRecs.FirstOrDefault(x => x.BENEFIT_SUMMARY_ID == summary.ID);
                    newBenefit.BENEFIT_DETAILS_QUALITATIVE = qualitativeBenefitRec != null ? qualitativeBenefitRec : new BENEFIT_DETAILS_QUALITATIVE();
                    newBenefit.BENEFIT_DETAILS_QUANTITATIVE_VM = new BENEFIT_DETAILS_QUANTITATIVE_VM();
                }
                benefitList.Add(newBenefit);
            }
            details.IDEA_BENEFITS = benefitList;

            details.IMPLEMENTATION_SCHDULES = CSPdb.IDEA_IMPLEMENTATION_PLAN.GetAll().Where(x => x.ISACTIVE && x.IDEA_ID == Ideaid).ToList();

            details.IdeaStages = CSPdb.AppRepo.GetIdeaStageStatus(Ideaid).ToList();

            return Ok(details);
        }
        private bool CheckIfEntityPropertiesChanged<T>(T entity1, T entity2) where T : class
        {
            var props = entity1.GetType().GetProperties();
            var excludeList = new List<string>() { "ISSUBMITTED", "ISACTIVE", "CREATED_BY", "CREATED_DATE", "UPDATED_BY", "UPDATED_DATE" };
            props = props.Where(p => !excludeList.Contains(p.Name)).ToArray<PropertyInfo>();
            foreach (var prop in props)
            {
                if (!Object.Equals(prop.GetValue(entity1), prop.GetValue(entity2)))
                    return true;
            }

            return false;
        }

        [Route("SaveReviewerResponse")]
        [ActionName("SaveReviewerResponse")]
        [HttpPost]
        public IHttpActionResult SaveReviewerResponse([FromBody] ReviewerResponse response)
        {
            LogRequest(content: JsonConvert.SerializeObject(response), prefix: "");
            var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == response.IDEA_ID && x.ISACTIVE);
            if (idea == null)
                return Content(HttpStatusCode.BadRequest, "There is no idea exists with the given id :" + response.IDEA_ID);

            idea.IDEA_STATUS_ID = response.IDEA_STATUS_ID;
            idea.REVIEW_COMMENTS = response.REVIEW_COMMENTS;
            CSPdb.IDEA.Update(idea);

            if (idea.IDEA_STATUS_ID == 5) // Rejected
            {
                idea.ISSUBMITTED = false;
                CSPdb.IDEA.Update(idea);
            }

            var reviewRec = CSPdb.IDEA_STAGE_STATUS.GetAll()
                    .Where(x => x.IDEA_ID == response.IDEA_ID)
                    .OrderByDescending(x => x.ID)
                    .FirstOrDefault();

            if (reviewRec == null)
                return BadRequest("Idea is not submitted yet");

            var empId = GetHeaderDetails_String("empId");

            reviewRec.ACTION = $"Idea {response.IDEA_STATUS_TITLE}";
            reviewRec.UPDATED_DATE = DateTime.Now;
            reviewRec.UPDATED_BY = empId;
            CSPdb.IDEA_STAGE_STATUS.Update(reviewRec);

            if (idea.IDEA_STATUS_ID == 4) // Approved
            {
                var implementationRows = CSPdb.IDEA_IMPLEMENTATION_PLAN.GetAll().Where(x => x.ISACTIVE && x.IDEA_ID == idea.ID).ToList();
                implementationRows.ForEach(i => i.IDEA_STATUS_ID = 7);
                CSPdb.IDEA_IMPLEMENTATION_PLAN.Update(implementationRows);
            }

            CSPdb.Commit(CanCommit);

            return Ok(response);
        }



        [Route("DeleteImplementationSchdule")]
        [ActionName("DeleteImplementationSchdule")]
        [HttpPost]
        public IHttpActionResult DeleteImplementationSchdule(int ImpId)
        {
            var impRec = CSPdb.IDEA_IMPLEMENTATION_PLAN.GetAll().FirstOrDefault(x => x.ISACTIVE && x.ID == ImpId);

            if (impRec == null)
                return BadRequest("No record exists with the given Implementation Id");

            impRec.ISACTIVE = false;
            CSPdb.IDEA_IMPLEMENTATION_PLAN.Update(impRec);
            CSPdb.Commit(CanCommit);

            if (isAllCompleted(impRec.IDEA_ID))
            {
                var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ISACTIVE && x.ID == impRec.IDEA_ID);
                if (idea != null)
                {
                    idea.IDEA_STATUS_ID = 3;
                    CSPdb.IDEA.Update(idea);
                }
            }

            CSPdb.Commit(CanCommit);
            return Ok();
        }

        [Route("GetImplementationSchdule")]
        [ActionName("GetImplementationSchdule")]
        [HttpGet]
        public IHttpActionResult GetImplementationSchdule(int IdeaId)
        {
            var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == IdeaId && x.ISACTIVE);
            if (idea == null)
                return BadRequest("There is no idea exists with the given id");

            var schdules = CSPdb.IDEA_IMPLEMENTATION_PLAN.GetAll().Where(x => x.ISACTIVE && x.IDEA_ID == IdeaId).ToList();

            return Ok(schdules);
        }

        [Route("UpdateImplementationSchdule")]
        [ActionName("UpdateImplementationSchdule")]
        [HttpPost]
        public IHttpActionResult UpdateImplementationSchdule([FromBody] IDEA_IMPLEMENTATION_PLAN schdule)
        {
            LogRequest(content: JsonConvert.SerializeObject(schdule), prefix: "");
            ValidateReqest(schdule);
            var impRec = CSPdb.IDEA_IMPLEMENTATION_PLAN.GetAll().FirstOrDefault(x => x.ISACTIVE && x.ID == schdule.ID);
            if (impRec == null)
                return BadRequest("There is no implementation schdule exists");

            var empId = GetHeaderDetails_String("empId");
            impRec.IDEA_STATUS_ID = schdule.IDEA_STATUS_ID;
            impRec.ACTUAL_START_DATE = schdule.ACTUAL_START_DATE;
            impRec.ACTUAL_END_DATE = schdule.ACTUAL_END_DATE;
            impRec.UPDATED_BY = empId;
            impRec.UPDATED_DATE = DateTime.Now;

            CSPdb.IDEA_IMPLEMENTATION_PLAN.Update(impRec);

            CSPdb.Commit(CanCommit);
            var idea = new IDEA();
            if (isAllCompleted(schdule.IDEA_ID))
            {
                idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ISACTIVE && x.ID == schdule.IDEA_ID);
                if (idea != null)
                {
                    idea.IDEA_STATUS_ID = 3;
                    CSPdb.IDEA.Update(idea);
                }
            }

            CSPdb.Commit(CanCommit);
            if (idea.ID > 0)
            {
                SendEmail(idea.ID);
            }
            return Ok(schdule);
        }


        private bool isAllCompleted(int IdeaId)
        {
            var impList = CSPdb.IDEA_IMPLEMENTATION_PLAN.GetAll().Where(x => x.ISACTIVE && x.IDEA_ID == IdeaId).ToList();
            foreach (var imp in impList)
            {
                if (imp.IDEA_STATUS_ID != 8)
                    return false;
            }

            return true;
        }

        [Route("UpdateIdeaStatus")]
        [ActionName("UpdateIdeaStatus")]
        [HttpPost]
        public IHttpActionResult UpdateIdeaStatus([FromBody] IdeaStatusUpdate ideas)
        {
            CheckAccessForFeature(80);
            LogRequest(content: JsonConvert.SerializeObject(ideas), prefix: "");
            var empId = GetHeaderDetails_String("empId");
            foreach (var ideaId in ideas.IdeaId)
            {
                var idea = CSPdb.IDEA.GetAll().FirstOrDefault(x => x.ID == ideaId && x.ISACTIVE);
                var reviewRec = CSPdb.IDEA_STAGE_STATUS.GetAll()
                    .FirstOrDefault(x => x.IDEA_ID == ideaId);

                if (reviewRec == null)
                {
                    return BadRequest("Idea is not submitted yet");
                }

                if (idea.IDEA_STATUS_ID == 4)
                {
                    return BadRequest("The selected Idea is already Approved");
                }
                else if (idea.IDEA_STATUS_ID == 5)
                {
                    return BadRequest("The selected Idea is already Rejected");
                }
                else if (idea.IDEA_STATUS_ID == 2)
                {
                    reviewRec.ACTION = ideas.Status == 4 ? IDEA_STAGE_ACTION.IDEA_APPROVED : IDEA_STAGE_ACTION.IDEA_REJECTED;
                    reviewRec.UPDATED_DATE = DateTime.Now;
                    reviewRec.UPDATED_BY = empId;
                    CSPdb.IDEA_STAGE_STATUS.Update(reviewRec);

                    if (ideas.Status == 5)
                    {
                        idea.IDEA_STATUS_ID = 5;
                        idea.ISSUBMITTED = false;
                        UpdateAuditFields(idea, empId);
                        CSPdb.IDEA.Update(idea);
                        UpdateIdeaStageId(ideaId, 5, idea);
                    }
                    if (ideas.Status == 4)
                    {
                        idea.IDEA_STATUS_ID = 4;
                        UpdateAuditFields(idea, empId);
                        CSPdb.IDEA.Update(idea);
                        UpdateIdeaStageId(ideaId, 4, idea);
                        var implementationRows = CSPdb.IDEA_IMPLEMENTATION_PLAN.GetAll().Where(x => x.ISACTIVE && x.IDEA_ID == ideaId).ToList();
                        implementationRows.ForEach(i => i.IDEA_STATUS_ID = 7);
                        CSPdb.IDEA_IMPLEMENTATION_PLAN.Update(implementationRows);
                    }
                }
                CSPdb.Commit();
                SendEmail(ideaId);
            }
            return Ok();
        }

        [Route("GetIdeasDetailById")]
        [ActionName("GetIdeasDetailById")]
        [HttpGet]
        public IHttpActionResult GetIdeasDetailById(int ideaId)
        {
            return Ok(CSPdb.AppRepo.GetIdeasDetailById(ideaId));
        }

        [Route("GetCustomerByEmpId")]
        [ActionName("GetCustomerByEmpId")]
        [HttpGet]
        public IHttpActionResult GetCustomerByEmpId(string EmpId)
        {
            var Customers = (from x in CSPdb.IDEA.GetAll().ToList()
                             join y in Cldb.PROJECT.GetAll().ToList()
                             on x.PROJECT_ID equals y.PROJ_ID
                             join z in Cldb.CUSTOMER.GetAll().ToList()
                             on y.CUST_ID equals z.CUST_ID
                             join e in Cldb.EMP_INFO.GetAll().ToList()
                             on y.PROJ_DM_EMP_ID equals e.EMP_ID
                             where x.IDEA_STATUS_ID == 2 && x.ISACTIVE == true && e.EMP_ID == EmpId
                             select new
                             {
                                 CUST_ID = z.CUST_ID,
                                 CUST_NM = z.CUST_NM
                             }).Distinct().OrderBy(x => x.CUST_ID).ToList();

            return Ok(Customers);
        }

        [Route("GetIdeaImprovementTypes")]
        [ActionName("GetIdeaImprovementTypes")]
        [HttpGet]
        public IHttpActionResult GetIdeaImprovementTypes()
        {
            var ideaImprovementType = CSPdb.IDEA_IMPROVEMENT_TYPE.GetAll().Where(x => x.ISACTIVE).OrderBy(x => x.TYPE).ToList();
            return Ok(ideaImprovementType);
        }

        private void SendEmail_IdeaSubmitted(int Ideaid)
        {
            var idea = CSPdb.AppRepo.GetImplementedIdea(Ideaid);
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == idea.PROJECT_ID);

            //spliting to email address
            string csmMails = helper.GetCSMMailsFromProject(project);
            string pmMails = helper.GetPMMailsFromProject(project);
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string mailContent;

            string ccmail = string.Empty;// helper.GetDBConfig("CSS_LINK_CC", "-1");
            var qualitySpoc = helper.GetQualitySpocMailForProject(project);

            string customerName = string.Empty;
            string projectName = string.Empty;

            var customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID);
            customerName = customer?.CUST_NM;
            projectName = project.PROJ_NM;

            subject = $"Idea has been Submitted - Project: {projectName}; Customer: {customerName}";
            string tomail = helper.ConcatEmails(new List<string>() { csmMails });
            string url = $"{helper.GetAbsoulteUri()}/newdashboard/cust/{customer.CUST_ID}/true/listview/{Ideaid}";
            ccmail = helper.ConcatEmails(new List<string>() { pmMails, ccmail, qualitySpoc });

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("Project Name", projectName);
            EmailContentValues.Add("Identified Date", idea.IDENTIFIED_DATE.ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Process Area", idea.PROCESS_AREA);
            EmailContentValues.Add("Description", idea.DESCRIPTION);
            EmailContentValues.Add("Description Of Solution", idea.POTENTIAL_SOLUTION_DESCRIPTION);
            EmailContentValues.Add("Status", idea.STATUS);
            EmailContentValues.Add("Target Date", idea.ESTIMATED_TARGET_DATE.GetValueOrDefault().ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Actual Date", idea.ESTIMATED_START_DATE.GetValueOrDefault().ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Responsible", idea.RESPONSIBLE);
            EmailContentValues.Add("Approver Name", idea.APPROVER_NAME);
            EmailContentValues.Add("URL", url);
            mailContent = helper.GetEmailContent("ApproveIdea.htm", EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                Request
                );
        }

        private void SendEmail(int Ideaid)
        {
            var idea = CSPdb.AppRepo.GetImplementedIdea(Ideaid);

            if (idea == null) return;
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == idea.PROJECT_ID);

            //spliting to email address
            string csmMails = helper.GetCSMMailsFromProject(project);
            string pmMails = helper.GetPMMailsFromProject(project);
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string mailContent;

            string ccmail = string.Empty;// helper.GetDBConfig("CSS_LINK_CC", "-1");
            var qualitySpoc = helper.GetQualitySpocMailForProject(project);
            string customerName = string.Empty;
            string projectName = string.Empty;

            var customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID);
            customerName = customer?.CUST_NM;
            projectName = project.PROJ_NM;

            subject = $"Idea {idea.STATUS } - Project: {projectName}; Customer: {customerName}";
            string tomail = helper.ConcatEmails(new List<string>() { pmMails, csmMails, qualitySpoc });
            ccmail = Constants.QUALITY_HEAD;

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("Project Name", projectName);
            EmailContentValues.Add("Identified Date", idea.IDENTIFIED_DATE.ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Process Area", idea.PROCESS_AREA);
            EmailContentValues.Add("Description", idea.DESCRIPTION);
            EmailContentValues.Add("Description Of Solution", idea.POTENTIAL_SOLUTION_DESCRIPTION);
            EmailContentValues.Add("Status", idea.STATUS);
            EmailContentValues.Add("Estimated Target Date", idea.ESTIMATED_TARGET_DATE.GetValueOrDefault().ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Estimated Start Date", idea.ESTIMATED_START_DATE.GetValueOrDefault().ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Actual Target Date", idea.STATUS == "Implemented" ? idea.ACTUAL_TARGET_DATE.GetValueOrDefault().ToLocalTime().ToString(_dateformat) : "");
            EmailContentValues.Add("Actual Start Date", idea.STATUS == "Implemented" ? idea.ACTUAL_START_DATE.GetValueOrDefault().ToLocalTime().ToString(_dateformat) : "");
            EmailContentValues.Add("Responsible", idea.RESPONSIBLE);
            EmailContentValues.Add("Approver Name", idea.APPROVER_NAME);

            mailContent = helper.GetEmailContent("AddInnovation.htm", EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                Request
                );

        }
    }

}