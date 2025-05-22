using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using GAVS.AllocationSystem.WebApi.Models;
using System.Text;
using System.Net.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("GetRiskFromRepository")]
        [ActionName("GetRiskFromRepository")]
        [HttpGet]
        public IHttpActionResult GetRiskFromRepository(string customerId, string projectId)
        {
            var riskDetails = Cldb.AppRepo.GetAllRiskFromRepository(customerId, projectId).ToList();
            return Ok(riskDetails);
        }

        [POST("AddRiskList")]
        [ActionName("AddRiskList")]
        [HttpPost]
        public IHttpActionResult AddRiskList([FromBody] List<PROJECT_RISK> riskList)
        {
            foreach (var item in riskList)
            {
                var overview = AddRiskInternal(item);
            }
            return Ok();
        }

        private PROJECT_RISK AddRiskInternal(PROJECT_RISK results)
        {
            PROJECT_RISK overview = new PROJECT_RISK();

            results.RISK_RATING = results.PROBABILITY_SCALE * results.IMPACT_SCALE;
            results.NEW_RISK_RATING = results.NEW_CONSEQUENCES_SCALE * results.NEW_LIKELIHOOD_SCALE;

            overview.PROJECT_ID = results.PROJECT_ID;
            overview.RAG = results.RAG;
            overview.DESCRIPTION = results.DESCRIPTION;
            overview.IMPACT = results.IMPACT;
            overview.PROBABILITY_SCALE = results.PROBABILITY_SCALE;
            overview.IMPACT_SCALE = results.IMPACT_SCALE;
            overview.OWNER = results.OWNER;
            overview.AREA = results.AREA;
            overview.IDENTIFIED_BY = results.IDENTIFIED_BY == null ? results.IDENTIFIED_BY : GetEmployeeNamebyId(results.IDENTIFIED_BY);
            overview.IDENTIFIED_DATE = DateTime.Now.ToLocalTime();
            overview.RISK_TREATMENT_STRATEGY = results.RISK_TREATMENT_STRATEGY;
            overview.TARGET_DATE = DateTime.Today.AddDays(30);
            overview.ACTUAL_DATE = results.ACTUAL_DATE.HasValue ? results.ACTUAL_DATE.Value.ToLocalTime() : (DateTime?)null;
            overview.STATUS = results.STATUS;
            overview.ACTION_TAKEN = results.ACTION_TAKEN;
            overview.CREATED_BY = results.CREATED_BY;
            overview.CREATED_DATE = DateTime.Now.ToLocalTime();
            overview.UPDATED_BY = results.CREATED_BY;
            overview.UPDATED_DATE = DateTime.Now.ToLocalTime();
            overview.ISACTIVE = true;
            overview.ACCEPT_TILL = results.ACCEPT_TILL.HasValue ? results.ACCEPT_TILL.Value.ToLocalTime() : (DateTime?)null;
            overview.RISK_REPOSITORY_ID = results.RISK_REPOSITORY_ID;
            overview.IS_DRAFT = results.IS_DRAFT;
            overview.RISK_CATEGORY = results.RISK_CATEGORY;
            overview.LOCATION = results.LOCATION;
            overview.RISK_RATING = results.PROBABILITY_SCALE * results.IMPACT_SCALE;
            if (!string.IsNullOrWhiteSpace(results.RISK_LEVEL))
            {
                overview.RISK_LEVEL = results.RISK_LEVEL;
            }
            else
            {
                overview.RISK_LEVEL = CalculateRiskLevel(overview.RISK_RATING);
            }
            overview.NEW_CONSEQUENCES_SCALE = results.NEW_CONSEQUENCES_SCALE;
            overview.NEW_LIKELIHOOD_SCALE = results.NEW_LIKELIHOOD_SCALE;
            overview.NEW_RISK_RATING = results.NEW_RISK_RATING;
            overview.NEW_RISK_LEVEL = results.NEW_RISK_LEVEL;
            overview.NEW_RISK_ASSESSMENT_DATE = results.NEW_RISK_ASSESSMENT_DATE;
            overview.RISK_TREATMENT_EFFECTIVENESS_STATUS = results.RISK_TREATMENT_EFFECTIVENESS_STATUS;
            overview.RISK_TREATMENT_EFFECTIVENESS_VERIFIED_BY = results.RISK_TREATMENT_EFFECTIVENESS_VERIFIED_BY;
            overview.RISK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE = results.RISK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE;

            CSPdb.PROJECT_RISK.Add(overview);
            CSPdb.Commit(CanCommit);
            UpdateRag(results.PROJECT_ID, ragCategory.risk, results.RAG, results.CREATED_BY);
            UpdateLastUpdatedDetails(results.PROJECT_ID, results.UPDATED_BY);
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(t => t.PROJ_ID == overview.PROJECT_ID);

            //add action Item
            ActionItemsViewDetails actionItem = new ActionItemsViewDetails();
            actionItem.CUST_ID = project.CUST_ID;
            actionItem.PROJ_ID = project.PROJ_ID;
            actionItem.RAG = "Red";
            actionItem.DESCRIPTION = string.IsNullOrWhiteSpace(results.ACTION_ITEM_DESCRIPTION) ? $"Risk Treatment Plan for risk - {overview.DESCRIPTION}" : results.ACTION_ITEM_DESCRIPTION;
            actionItem.SOURCE = "Risk";
            actionItem.OWNER = string.IsNullOrWhiteSpace(results.ACTION_ITEM_OWNER) ? "Team" : results.ACTION_ITEM_OWNER;
            actionItem.IDENTIFIED_DATE = (DateTime)(results.ACTION_ITEM_IDENTIFIED_DATE == null ? DateTime.Today : results.ACTION_ITEM_IDENTIFIED_DATE);
            actionItem.TARGET_DATE = (DateTime)(results.ACTION_ITEM_TARGET_DATE == null ? DateTime.Today.AddDays(30) : results.ACTION_ITEM_TARGET_DATE);
            actionItem.STATUS = string.IsNullOrWhiteSpace(results.ACTION_ITEM_STATUS) ? "Started" : results.ACTION_ITEM_STATUS;
            actionItem.PRIORITY = "High";
            actionItem.COMMENTS = results.ACTION_ITEM_COMMENTS;
            actionItem.CREATED_BY = results.CREATED_BY;
            actionItem.CREATED_DATE = DateTime.Now;
            actionItem.UPDATED_BY = results.CREATED_BY;
            actionItem.UPDATED_DATE = DateTime.Now;
            actionItem.ISACTIVE = true;
            actionItem.RISK_ID = overview.ID;
            AddActionItemInternal(actionItem);
            if (results.ISO_STD_ID != null)
            {
                foreach (var item in results.ISO_STD_ID)
                {
                    AddIsoStdRisk(item, overview.ID);

                }
            }

            //risk email
            List<EMP_RISK_ADD_SEND_EMAIL> listEmpEmail = Cldb.AppRepo.AddRiskEmail().Where(t => t.Proj_ID == overview.PROJECT_ID).ToList();

            //spliting to email address
            var teamMails = string.Join(",", listEmpEmail.Select(t => t.EMAIL_ID.ToString()));
            string csmMails = helper.GetCSMMailsFromProject(project);
            string pmMails = helper.GetPMMailsFromProject(project);
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string mailContent;

            string tomail = pmMails;
            string ccmail = helper.GetDBConfig("CSS_LINK_CC", "-1");
            var qualitySpoc = helper.GetQualitySpocMailForProject(overview.PROJECT_ID);


            string customerName = string.Empty;
            string projectName = string.Empty;

            if (project != null)
            {
                var customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID);
                customerName = customer?.CUST_NM;
                projectName = project.PROJ_NM;
            }

            subject = $"New Risk Identified - Project: {projectName}; Customer: {customerName}";
            ccmail = helper.ConcatEmails(new List<string>() { ccmail, csmMails, qualitySpoc });

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("PROJECT NAME", projectName);
            EmailContentValues.Add("IDENTIFIED ON", overview.IDENTIFIED_DATE.GetValueOrDefault().ToLocalTime().ToString("dd-MMM-yyyy"));
            EmailContentValues.Add("IDENTIFIED BY", overview.IDENTIFIED_BY == null ? overview.IDENTIFIED_BY : GetEmployeeNamebyId(overview.IDENTIFIED_BY));
            EmailContentValues.Add("RISK DESCRIPTION", overview.DESCRIPTION);
            EmailContentValues.Add("BUSINESS IMPACT", overview.IMPACT);
            EmailContentValues.Add("RISK OWNER", overview.OWNER == null ? overview.OWNER : GetEmployeeNamebyId(overview.OWNER));
            EmailContentValues.Add("STATUS", overview.STATUS);
            EmailContentValues.Add("RISK TREATMENT PLAN", overview.ACTION_TAKEN);
            EmailContentValues.Add("TARGET DATE", overview.TARGET_DATE.GetValueOrDefault().ToString("dd-MMM-yyyy"));
            EmailContentValues.Add("IS_DRAFT", overview.IS_DRAFT ? "Yes" : "No");

            mailContent = helper.GetEmailContent("AddNewRisk.htm", EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                Request
                );

            return overview;
        }

        public string CalculateRiskLevel(int? riskRating)
        {
            if (riskRating < 5)
            {
                return "Low";
            }
            else if (riskRating < 10)
            {
                return "Moderate";
            }
            else if (riskRating < 20)
            {
                return "High";
            }
            else
            {
                return "Catastrophic";
            }
        }


        [GET("GetAllRiskFromRepository")]
        [ActionName("GetAllRiskFromRepository")]
        [HttpGet]
        public IHttpActionResult GetAllRiskFromRepository()
        {
            var riskDetails = Cldb.RISK_REPOSITORY.GetAll().Where(x => x.ISACTIVE).OrderBy(t => t.RISK_DESCRIPTION).ToList();
            var riskServiceTower = Cldb.RISK_REPOSITORY2SERVICE_TOWER.GetAll().Where(x => x.ISACTIVE).OrderBy(t => t.RISK_REPOSITORY_ID).ToList();
            var serviceTowers = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().Where(x => x.ISACTIVE && x.SHOW_IN_MASTER).OrderBy(t => t.TITLE).ToList();
            foreach (var item in riskDetails)
            {
                var matchingReferences = riskServiceTower.Where(x => x.RISK_REPOSITORY_ID == item.ID).Select(x => x.SERVICE_TOWER_ID).ToArray();
                item.SERVICE_TOWER_LIST = matchingReferences;

                var matchingTowers = serviceTowers
                    .Where(x => matchingReferences.Contains(x.ID))
                    .Select(matchingTower => matchingTower.TITLE)
                    .ToArray();

                if (matchingTowers.Length > 0)
                {
                    item.SERVICE_TOWER_NAME = string.Join(", ", matchingTowers);
                }
                else
                {
                    item.SERVICE_TOWER_NAME = string.Empty;
                }
            }

            return Ok(riskDetails);
        }

        [POST("AddUpdateRiskRepository")]
        [ActionName("AddUpdateRiskRepository")]
        [HttpPost]
        public IHttpActionResult AddUpdateRiskRepository([FromBody] RISK_REPOSITORY riskRepository)
        {
            CheckAccessForFeature(105);
            LogRequest(content: JsonConvert.SerializeObject(riskRepository));
            if (riskRepository == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }

            var isUpdate = 0;

            if (riskRepository.ID != 0)  //Update
            {
                isUpdate = 1;
                CheckRiskUsedInProject(riskRepository);
                // CheckServiceTowerMappedWithProject(riskRepository)  --> Logic will be modified by Madhu for removing service tower

                var existingRiskRepo = Cldb.RISK_REPOSITORY.GetAll().Where(x => x.ID == riskRepository.ID).FirstOrDefault();
                var existingRiskServiceTower = Cldb.RISK_REPOSITORY2SERVICE_TOWER.GetAll().Where(x => x.RISK_REPOSITORY_ID == existingRiskRepo.ID && x.ISACTIVE).ToList();
                var existingServiceTowerIds = existingRiskServiceTower.Where(x => x.RISK_REPOSITORY_ID == existingRiskRepo.ID).Select(x => x.SERVICE_TOWER_ID).ToArray();
                existingRiskRepo.SERVICE_TOWER_LIST = existingServiceTowerIds;
                var previousVersion = new RISK_REPOSITORY()
                {
                    RISK_DESCRIPTION = existingRiskRepo.RISK_DESCRIPTION,
                    RISK_IMPACT = existingRiskRepo.RISK_IMPACT,
                    RISK_TREATMENT_STRATEGY = existingRiskRepo.RISK_TREATMENT_STRATEGY,
                    LIKELIHOOD = existingRiskRepo.LIKELIHOOD,
                    CONSEQUENCES = existingRiskRepo.CONSEQUENCES,
                    UPDATED_BY = existingRiskRepo.UPDATED_BY,
                    UPDATED_DATE = existingRiskRepo.UPDATED_DATE,
                    SERVICE_TOWER_LIST = existingRiskRepo.SERVICE_TOWER_LIST,
                    THREATS = existingRiskRepo.THREATS,
                    VULNERABILITIES = existingRiskRepo.VULNERABILITIES
                };

                existingRiskRepo.RISK_DESCRIPTION = riskRepository.RISK_DESCRIPTION;
                existingRiskRepo.RISK_IMPACT = riskRepository.RISK_IMPACT;
                existingRiskRepo.RISK_TREATMENT_STRATEGY = riskRepository.RISK_TREATMENT_STRATEGY;
                existingRiskRepo.CONSEQUENCES = riskRepository.CONSEQUENCES;
                existingRiskRepo.LIKELIHOOD = riskRepository.LIKELIHOOD;
                existingRiskRepo.THREATS = riskRepository.THREATS;
                existingRiskRepo.VULNERABILITIES = riskRepository.VULNERABILITIES;


                var existingRiskServiceTowers = Cldb.RISK_REPOSITORY2SERVICE_TOWER.GetAll().Where(x => x.RISK_REPOSITORY_ID == existingRiskRepo.ID && x.ISACTIVE).ToList();

                foreach (var item in existingRiskServiceTowers)
                {
                    item.ISACTIVE = false;
                }
                foreach (var item in riskRepository.SERVICE_TOWER_LIST)
                {
                    var existing = existingRiskServiceTowers.FirstOrDefault(x => x.SERVICE_TOWER_ID == item);
                    if (existing != null)
                    {
                        UpdateAuditFields(existing);
                    }
                    else
                    {
                        var linkEty = new RISK_REPOSITORY2SERVICE_TOWER
                        {
                            RISK_REPOSITORY_ID = riskRepository.ID,
                            SERVICE_TOWER_ID = item
                        };
                        UpdateAuditFields(linkEty);
                        Cldb.RISK_REPOSITORY2SERVICE_TOWER.Add(linkEty);
                    }
                }
                foreach (var item in existingRiskServiceTowers)
                {
                    Cldb.RISK_REPOSITORY2SERVICE_TOWER.Update(item);
                }

                UpdateAuditFields(existingRiskRepo);
                Cldb.RISK_REPOSITORY.Update(existingRiskRepo);
                Cldb.Commit(CanCommit);
                existingRiskRepo.SERVICE_TOWER_LIST = riskRepository.SERVICE_TOWER_LIST;
                var serviceTowers = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().Where(x => riskRepository.SERVICE_TOWER_LIST.Contains(x.ID)).ToList();
                previousVersion.SERVICE_TOWER_LIST = existingRiskServiceTowers.Select(x => x.SERVICE_TOWER_ID).ToArray();
                SendMailForRiskRepo(existingRiskRepo, isUpdate, previousVersion, serviceTowers);
                return Ok();
            }
            else // Add Risk Repo
            {
                UpdateAuditFields(riskRepository);
                Cldb.RISK_REPOSITORY.Add(riskRepository);
                Cldb.Commit(CanCommit);
                if (riskRepository.SERVICE_TOWER_LIST.Any())
                {
                    var riskRepositoryToServiceTower = new RISK_REPOSITORY2SERVICE_TOWER();
                    foreach (var item in riskRepository.SERVICE_TOWER_LIST)
                    {
                        riskRepositoryToServiceTower.RISK_REPOSITORY_ID = riskRepository.ID;
                        riskRepositoryToServiceTower.SERVICE_TOWER_ID = item;
                        UpdateAuditFields(riskRepositoryToServiceTower);
                        Cldb.RISK_REPOSITORY2SERVICE_TOWER.Add(riskRepositoryToServiceTower);
                        Cldb.Commit(CanCommit);
                    }
                }
                var serviceTowers = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().Where(x => riskRepository.SERVICE_TOWER_LIST.Contains(x.ID)).ToList();
                SendMailForRiskRepo(riskRepository, isUpdate, null, serviceTowers);
                return Ok();
            }

        }

        private void CheckRiskUsedInProject(RISK_REPOSITORY updatedRiskRepository)
        {
            var existingRiskRepository = Cldb.RISK_REPOSITORY.GetAll().Where(x => x.ID == updatedRiskRepository.ID).FirstOrDefault();
            var existingRiskServiceTower = Cldb.RISK_REPOSITORY2SERVICE_TOWER.GetAll().Where(x => x.RISK_REPOSITORY_ID == existingRiskRepository.ID && x.ISACTIVE).ToList();
            var existingServiceTowerIds = existingRiskServiceTower.Where(x => x.RISK_REPOSITORY_ID == existingRiskRepository.ID).Select(x => x.SERVICE_TOWER_ID).ToArray();
            existingRiskRepository.SERVICE_TOWER_LIST = existingServiceTowerIds;

            bool areFieldsEqual =
                                      existingRiskRepository.RISK_DESCRIPTION == updatedRiskRepository.RISK_DESCRIPTION &&
                                      existingRiskRepository.RISK_IMPACT == updatedRiskRepository.RISK_IMPACT &&
                                      existingRiskRepository.RISK_TREATMENT_STRATEGY == updatedRiskRepository.RISK_TREATMENT_STRATEGY &&
                                      existingRiskRepository.CONSEQUENCES == updatedRiskRepository.CONSEQUENCES &&
                                      existingRiskRepository.LIKELIHOOD == updatedRiskRepository.LIKELIHOOD &&
                                      existingRiskRepository.THREATS == updatedRiskRepository.THREATS &&
                                      existingRiskRepository.VULNERABILITIES == updatedRiskRepository.VULNERABILITIES;

            var projectRisk = CSPdb.PROJECT_RISK.GetAll().Where(x => x.RISK_REPOSITORY_ID == updatedRiskRepository.ID && x.ISACTIVE).ToList();
            if (projectRisk.Any() && !areFieldsEqual)
            {
                var projectIds = projectRisk.Select(x => x.PROJECT_ID).ToList();
                var projectList = Cldb.PROJECT.GetAll().Where(x => projectIds.Contains(x.PROJ_ID)).ToList();
                var projectNames = projectList.Select(x => x.PROJ_NM).ToList();
                var commaSeparatedProjectNames = string.Join(", ", projectNames);
                throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"The selected Risk from Respository is used in Project(s) - {commaSeparatedProjectNames}.So it is not possible to edit the master record now."));
            }
            CheckForRemoveServiceTower(updatedRiskRepository.SERVICE_TOWER_LIST, existingRiskRepository.SERVICE_TOWER_LIST);
        }

        private void CheckServiceTowerMappedWithProject(RISK_REPOSITORY riskRepository)
        {
            var pspdMappedRecords = CSPdb.PROCESS_SERVICE_AREA_PROJECT_MAPPING.GetAll().Where(x => x.ISACTIVE).ToList();
            var existing = Cldb.RISK_REPOSITORY.GetAll().FirstOrDefault(x => x.ID == riskRepository.ID && x.ISACTIVE);

            var existingRiskServiceTower = Cldb.RISK_REPOSITORY2SERVICE_TOWER.GetAll().Where(x => x.RISK_REPOSITORY_ID == riskRepository.ID && x.ISACTIVE).ToList();
            var serviceTowerToRemove = existing.SERVICE_TOWER_LIST.Except(riskRepository.SERVICE_TOWER_LIST ?? Enumerable.Empty<int>()).ToArray();

            var serviceTowerToMap = riskRepository.SERVICE_TOWER_LIST?.Except(existing.SERVICE_TOWER_LIST ?? Enumerable.Empty<int>()).ToArray();
            var projectRisk = CSPdb.PROJECT_RISK.GetAll().Where(x => x.RISK_REPOSITORY_ID == riskRepository.ID && x.ISACTIVE).ToList();
            var projectIds = projectRisk.Select(x => x.PROJECT_ID).ToList();
            var project = Cldb.PROJECT.GetAll().Where(x => projectIds.Contains(x.PROJ_ID)).ToList();
            var projectNames = project.Select(x => x.PROJ_NM).ToList();

            var commaSeparatedProjectNames = string.Join(", ", projectNames);
            if (serviceTowerToRemove?.Any() ?? false)
            {
                foreach (var item in existingRiskServiceTower.Where(x => serviceTowerToRemove?.Contains(x.SERVICE_TOWER_ID) ?? false))
                {

                    var isMatchingProject = projectRisk.Any(pr =>
                                             pspdMappedRecords.Any(p =>
                                            pr.PROJECT_ID == p.PROJ_ID && pr.RISK_REPOSITORY_ID == riskRepository.ID && p.SERVICE_AREA_ID == item.SERVICE_TOWER_ID && p.ISACTIVE));

                    var matchingProject = projectRisk.FirstOrDefault(pr =>
                                                                     pspdMappedRecords.Any(p =>
                                                                         pr.PROJECT_ID == p.PROJ_ID &&
                                                                         pr.RISK_REPOSITORY_ID == riskRepository.ID &&
                                                                         p.SERVICE_AREA_ID == item.SERVICE_TOWER_ID &&
                                                                         p.ISACTIVE)
                                                                     );




                    if (isMatchingProject)
                    {
                        projectNames = project.Where(x => x.PROJ_ID == matchingProject.PROJECT_ID).Select(x => x.PROJ_NM).ToList();
                        commaSeparatedProjectNames = string.Join(", ", projectNames);

                        throw new HttpResponseException(new HttpResponseMessage
                        {
                            StatusCode = System.Net.HttpStatusCode.BadRequest,
                            ReasonPhrase = $"The Service Tower mapping for this Risk from Repository is being used in Project(s) -{commaSeparatedProjectNames}. So Service Towers cannot be removed."
                        });
                    }
                }



            }
        }
        private void CheckForRemoveServiceTower(int[] newServiceTowers, int[] oldServiceTowers)
        {
            bool isServiceTowerRemoved = oldServiceTowers.All(item => newServiceTowers.Contains(item));
            if (!isServiceTowerRemoved)
            {
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = System.Net.HttpStatusCode.BadRequest, ReasonPhrase = $"The Service Tower mapping for this Risk from Repository it is being used in Project(s). So Service Towers cannot be removed." });
            }
            //logic to be given by Madhu
        }

        [POST("DeleteRiskFromRepository")]
        [ActionName("DeleteRiskFromRepository")]
        [HttpPost]
        public IHttpActionResult DeleteRiskFromRepository([FromBody] RISK_REPOSITORY riskRepository)
        {
            CheckAccessForFeature(105);
            LogRequest(content: JsonConvert.SerializeObject(riskRepository));
            if (riskRepository == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }
            var isDelete = 0;
            var projectRisk = CSPdb.PROJECT_RISK.GetAll().Where(x => x.RISK_REPOSITORY_ID == riskRepository.ID && x.ISACTIVE).ToList();


            if (projectRisk.Any())
            {
                var projectIds = projectRisk.Select(x => x.PROJECT_ID).ToList();
                var projectNames = Cldb.PROJECT.GetAll().Where(x => projectIds.Contains(x.PROJ_ID)).Select(x => x.PROJ_NM).ToList();
                var commaSeparatedProjectNames = string.Join(", ", projectNames);
                return Content(HttpStatusCode.Conflict, $"The selected Risk from Repository cannot be deleted as it is being used in Project(s) -{commaSeparatedProjectNames}.");

            }
            else
            {
                var existingRisk = Cldb.RISK_REPOSITORY.GetAll().FirstOrDefault(x => x.ID == riskRepository.ID && x.ISACTIVE);
                if (existingRisk != null)
                {
                    UpdateAuditFields(existingRisk);
                    existingRisk.ISACTIVE = false;
                    Cldb.RISK_REPOSITORY.Update(existingRisk);
                    Cldb.Commit(CanCommit);
                    isDelete = -1;
                }

                if (isDelete == -1)
                {
                    existingRisk.SERVICE_TOWER_LIST = riskRepository.SERVICE_TOWER_LIST;
                    var serviceTowers = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().Where(x => riskRepository.SERVICE_TOWER_LIST.Contains(x.ID)).ToList();
                    SendMailForRiskRepo(existingRisk, isDelete, null, serviceTowers);
                }
                return Ok();
            }

        }

        [GET("GetRiskLocation")]
        [ActionName("GetRiskLocation")]
        [HttpGet]
        public IHttpActionResult GetRiskLocation()
        {
            var riskLocation = Cldb.LOCATION.GetAll().Where(x => x.ISACTIVE).OrderBy(x => x.LOCATION_NAME).ToList();
            return Ok(riskLocation);
        }

        [GET("GetRiskCategory")]
        [ActionName("GetRiskCategory")]
        [HttpGet]
        public IHttpActionResult GetRiskCategory()
        {
            var riskCategory = Cldb.RISK_CATEGORY.GetAll().Where(x => x.ISACTIVE).OrderBy(x => x.CATEGORY).ToList();
            return Ok(riskCategory);
        }
        [GET("GetIsoStandardList")]
        [ActionName("GetIsoStandardList")]
        [HttpGet]
        public IHttpActionResult GetIsoStandardList()
        {
            var isoStandardList = Cldb.PROJECT_ISO_STANDARD.GetAll().Where(x => x.ISACTIVE).OrderBy(x => x.STANDARD_NAME).ToList();
            return Ok(isoStandardList);
        }
        [GET("GetIsoStandardProjectMappingList")]
        [ActionName("GetIsoStandardProjectMappingList")]
        [HttpGet]
        public IHttpActionResult GetIsoStandardProjectMappingList(string projectId)
        {
            var isoStdMappingList = Cldb.PROJECT_ISO_STANDARD_MAPPING.GetAll().Where(x => x.ISACTIVE && x.PROJECT_ID == projectId).ToList();
            return Ok(isoStdMappingList);
        }
        [GET("GetRiskIsoMappingList")]
        [ActionName("GetRiskIsoMappingList")]
        [HttpGet]
        public IHttpActionResult GetRiskIsoMappingList()
        {
            var isoStdMappingList = Cldb.RISK_ISO_STANDARD_MAPPING.GetAll().Where(x => x.ISACTIVE).ToList();
            return Ok(isoStdMappingList);
        }
        private void SendMailForRiskRepo(RISK_REPOSITORY riskRepository, int flag, RISK_REPOSITORY existingRiskRepository, List<PROCESS_SERVICE_AREA_NEW> serviceTowerList)
        {
            return;
            var ccMail = Constants._csmSupportMail;
            var toMail = Constants.BCC;// config

            var emailContentValues = new Dictionary<string, string>();
            var sb = new StringBuilder();

            var newUpdatedBy = "";
            var oldUpdatedBy = "";

            string ost = "";
            string nst = "";
            var serviceTowers = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().ToList();

            if (riskRepository.SERVICE_TOWER_LIST.Any())
            {
                nst = string.Join(",", serviceTowerList.Where(x => riskRepository.SERVICE_TOWER_LIST.Contains(x.ID)).Select(x => x.TITLE).OrderBy(x => x).ToList());
            }

            if (existingRiskRepository != null && existingRiskRepository.SERVICE_TOWER_LIST.Any())
            {
                ost = string.Join(",", serviceTowerList.Where(x => existingRiskRepository.SERVICE_TOWER_LIST.Contains(x.ID)).Select(x => x.TITLE).OrderBy(x => x).ToList());
            }


            newUpdatedBy = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == riskRepository.UPDATED_BY).FRST_NM;


            if (flag == 1 && existingRiskRepository?.UPDATED_BY != null)
            {
                oldUpdatedBy = Cldb.EMP_INFO.GetAll().FirstOrDefault(e => e.EMP_ID == existingRiskRepository.UPDATED_BY)?.FRST_NM;
            }


            switch (flag)
            {
                case 0:
                    emailContentValues.Add("action", "created");
                    break;
                case 1:
                    emailContentValues.Add("action", "updated");
                    break;
                case -1:
                    emailContentValues.Add("action", "deleted");
                    break;
            }
            var subject = $"Risk Repository Update";
            emailContentValues.Add("RISK_DESCRIPTION", riskRepository.RISK_DESCRIPTION);
            emailContentValues.Add("OLD_RISK_DESCRIPTION", existingRiskRepository?.RISK_DESCRIPTION);
            emailContentValues.Add("RISK_IMPACT", riskRepository.RISK_IMPACT);
            emailContentValues.Add("OLD_RISK_IMPACT", existingRiskRepository?.RISK_IMPACT);
            emailContentValues.Add("LIKELIHOOD", riskRepository.LIKELIHOOD.ToString());
            emailContentValues.Add("OLD_LIKELIHOOD", existingRiskRepository?.LIKELIHOOD.ToString());
            emailContentValues.Add("CONSEQUENCES", riskRepository.CONSEQUENCES.ToString());
            emailContentValues.Add("OLD_CONSEQUENCES", existingRiskRepository?.CONSEQUENCES.ToString());
            emailContentValues.Add("RISK_TREATMENT_STRATEGY", riskRepository.RISK_TREATMENT_STRATEGY);
            emailContentValues.Add("OLD_RISK_TREATMENT_STRATEGY", existingRiskRepository?.RISK_TREATMENT_STRATEGY);
            emailContentValues.Add("THREATS", riskRepository.THREATS);
            emailContentValues.Add("OLD_THREATS", existingRiskRepository?.THREATS);
            emailContentValues.Add("VULNERABILITIES", riskRepository.VULNERABILITIES);
            emailContentValues.Add("OLD_VULNERBILITIES", existingRiskRepository?.VULNERABILITIES);
            emailContentValues.Add("ST", nst.ToString());
            emailContentValues.Add("OST", ost.ToString());

            if (existingRiskRepository?.UPDATED_DATE == DateTime.MinValue)
            {
                emailContentValues.Add("OUD", " ");
            }
            else
            {
                emailContentValues.Add("OUD", existingRiskRepository?.UPDATED_DATE.ToString(_dateformat));
            }

            emailContentValues.Add("UD", riskRepository.UPDATED_DATE.ToString(_dateformat));
            emailContentValues.Add("UB", newUpdatedBy);
            emailContentValues.Add("OUB", oldUpdatedBy);


            var mailContent = helper.GetEmailContent("SendMailForRiskRepo.htm", emailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

            if (ep.SendEmail
                      (
                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                      new EmailContent
                      {
                          from = _email,
                          to = toMail,
                          cc = ccMail,
                          bcc = Constants.BCC,
                          content = mailContent,
                          subject = subject,
                          hasAttachments = false,
                          attachmentFilePath = ""
                      },
                      Request
                      ))
            {

            }
        }



    }


}