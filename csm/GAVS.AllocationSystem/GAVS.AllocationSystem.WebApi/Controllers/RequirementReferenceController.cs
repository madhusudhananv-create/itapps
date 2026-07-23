using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using static GAVS.AllocationSystem.Model.CSP.CSPMODEL.Client;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        //Method for getting the Req_Category details

        [GET("GetCategories")]
        [ActionName("GetCategories")]
        [HttpGet]
        public IHttpActionResult GetCategories()
        {
            List<REQ_CATEGORY> result = CSPdb.REQ_CATEGORY.GetAll().ToList<REQ_CATEGORY>();
            return Ok(result);
        }

        //Method for getting the Req_Level details

        [GET("GetApplicabilityLevels")]
        [ActionName("GetApplicabilityLevels")]
        [HttpGet]
        public IHttpActionResult GetApplicabilityLevels()
        {
            List<REQ_LEVEL> result = CSPdb.REQ_LEVEL.GetAll().Where(x => x.isActive).ToList<REQ_LEVEL>();
            return Ok(result);
        }

        [GET("GetRequirementReferenceStatusList")]
        [ActionName("GetRequirementReferenceStatusList")]
        [HttpGet]
        public IHttpActionResult GetRequirementReferenceStatusList()
        {
            var status = CSPdb.CUST_REQ_STATUS.GetAll().Where(t => t.IsActive).ToList<CUST_REQ_STATUS>();
            return Ok(status);
        }

        //Requirement_reference Form Save

        [POST("AddRequirementRef")]
        [ActionName("AddRequirementRef")]
        [HttpPost]
        public IHttpActionResult AddRequirementRef(HttpRequestMessage request)
        {
            LogRequest(prefix: "AddRequirementRef");
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;

            dynamic json = jsonContent;

            var results = JsonConvert.DeserializeObject<CUST_REQ_REF_VM>(json);

            //string projid = ((PROJECT_VALUEADDS)results).PROJECT_ID;

            CUST_REQ_REF overview = new CUST_REQ_REF();
            CUST_REQ_STAGE_STATUS statusRecord = new CUST_REQ_STAGE_STATUS();

            if (results != null)
            {
                overview.Applicability_Level = results.Applicability_Level;
                overview.Customer_Project_Name = results.Customer_Project_Name;
                overview.Doc_Req_Reference = results.Doc_Req_Reference;
                overview.Doc_Revision_No = results.Doc_Revision_No;
                overview.Doc_Revision_Date = results.Doc_Revision_Date;
                overview.Requirement_Title = results.Requirement_Title;
                overview.Requirement_Desc = results.Requirement_Desc;
                overview.Compliance_fulfilment = results.Compliance_fulfilment;
                overview.Documents_Evidence = results.Documents_Evidence;
                overview.Owner = results.Owner;
                overview.Concerned_Authority = results.Concerned_Authority;
               
                overview.Status = results.Status;
                overview.Comments = results.Comments;
                overview.Issues = results.Issues;
                overview.DocumentTargetDate = results.DocumentTargetDate;
                overview.Responsibility = results.Responsibility;
                UpdateAuditFields(overview);

                CSPdb.CUST_REQ_REF.Add(overview);
                CSPdb.Commit(CanCommit);
                results.ID = overview.ID;
                AddReqCategoryMapping(results.ID, results.Category_Id, results.Created_By);

                if (statusRecord != null)
                {
                    statusRecord.Req_ID = overview.ID;
                    statusRecord.Status = overview.Status;
                    UpdateAuditFields(statusRecord);
                    CSPdb.CUST_REQ_STAGE_STATUS.Add(statusRecord);
                    CSPdb.Commit(CanCommit);
                }

                if (overview.Applicability_Level == 2)
                {
                    AddReqLevelMapping(req_reference_id: overview.ID, applicability_level_id: overview.Applicability_Level, created_by: results.Created_By, customer_project_name: null, customer: results.Customer, projects: results.ProjectName);
                }
                else
                {
                    if(overview.Applicability_Level == 8 || overview.Applicability_Level == 9|| overview.Applicability_Level == 10)
                    {
                        return Ok();
                    }
                    else
                    {
                        AddReqLevelMapping(req_reference_id: overview.ID, applicability_level_id: overview.Applicability_Level, created_by: results.Created_By, customer_project_name: results.Customer_Project_Name, customer: "0", projects: null);
                    }                     }

             
            }
            return Ok(overview);
            
        }


        //Req_CAT_Mapping save
        private void AddReqCategoryMapping(int req_reference_id, int[] category_Id, string created_by)
        {

            REQ_CAT_MAPPING addreqCatgeoryMapping;

            foreach (var catid in category_Id)
            {
                addreqCatgeoryMapping = new REQ_CAT_MAPPING();

                addreqCatgeoryMapping.REQ_REF_ID = req_reference_id;
                addreqCatgeoryMapping.REQ_CAT_ID = catid;
                addreqCatgeoryMapping.Created_By = created_by;
                addreqCatgeoryMapping.Updated_By = created_by;
                addreqCatgeoryMapping.Created_Date = DateTime.Now;
                addreqCatgeoryMapping.Updated_Date = DateTime.Now;

                addreqCatgeoryMapping.isActive = true;
                CSPdb.REQ_CAT_MAPPING.Add(addreqCatgeoryMapping);
            }

            CSPdb.Commit(CanCommit);

        }

        //Req_Level_Mapping save
        private void AddReqLevelMapping(int req_reference_id, int applicability_level_id, string created_by, string[] customer_project_name = null, string customer = "0", string[] projects = null)
        {

            REQ_LEVEL_MAPPING addReqLevelMapping;

            if (applicability_level_id == 2)
            {
                foreach (var proj in projects)
                {
                    addReqLevelMapping = new REQ_LEVEL_MAPPING();

                    addReqLevelMapping.REQ_REF_ID = req_reference_id;
                    addReqLevelMapping.Applicability_Level_ID = applicability_level_id;
                    addReqLevelMapping.MAPPED_ID_INT = customer;
                    addReqLevelMapping.MAPPED_ID_STRING = proj;

                    addReqLevelMapping.Created_By = created_by;
                    addReqLevelMapping.Updated_By = created_by;

                    addReqLevelMapping.Created_Date = DateTime.Now;
                    addReqLevelMapping.Updated_Date = DateTime.Now;
                    addReqLevelMapping.isActive = true;

                    CSPdb.REQ_LEVEL_MAPPING.Add(addReqLevelMapping);
                }
                
            }
            else
            {
                if (customer_project_name.Any())
                {

                    foreach (var id in customer_project_name)
                    {
                        addReqLevelMapping = new REQ_LEVEL_MAPPING();

                        addReqLevelMapping.REQ_REF_ID = req_reference_id;
                        addReqLevelMapping.Applicability_Level_ID = applicability_level_id;

                        addReqLevelMapping.MAPPED_ID_INT = id;

                        addReqLevelMapping.Created_By = created_by;
                        addReqLevelMapping.Updated_By = created_by;

                        addReqLevelMapping.Created_Date = DateTime.Now;
                        addReqLevelMapping.Updated_Date = DateTime.Now;
                        addReqLevelMapping.isActive = true;

                        CSPdb.REQ_LEVEL_MAPPING.Add(addReqLevelMapping);
                    }
                    
                }

            }
            CSPdb.Commit(CanCommit);
        }

        //Method for updating

        [POST("UpdateRequirementRef")]
        [ActionName("UpdateRequirementRef")]
        [HttpPost]
        public IHttpActionResult UpdateRequirementRef([FromBody] CUST_REQ_REF_VM cust_req)
        {
            LogRequest(prefix: "UpdateRequirementRef", content: JsonConvert.SerializeObject(cust_req));
            if (cust_req != null)
            {
                var record = CSPdb.CUST_REQ_REF.GetAll().Where(x => x.ID == cust_req.ID).FirstOrDefault();
                var statusRecord = CSPdb.CUST_REQ_STAGE_STATUS.GetAll().FirstOrDefault(x => x.Req_ID == cust_req.ID);

                if (record.Status != cust_req.Status)
                {
                    if (statusRecord != null)
                    {
                        statusRecord.Req_ID = cust_req.ID;
                        statusRecord.Status = cust_req.Status;
                        UpdateAuditFields(statusRecord);
                        CSPdb.CUST_REQ_STAGE_STATUS.Add(statusRecord);
                    }
                }

                if (record != null)
                {
                    record.Applicability_Level = cust_req.Applicability_Level;
                    record.Customer_Project_Name = cust_req.Customer_Project_Name;
                    record.Doc_Req_Reference = cust_req.Doc_Req_Reference;
                    record.Doc_Revision_No = cust_req.Doc_Revision_No;
                    record.Doc_Revision_Date = cust_req.Doc_Revision_Date;
                    record.Requirement_Title = cust_req.Requirement_Title;
                    record.Requirement_Desc = cust_req.Requirement_Desc;
                    record.Compliance_fulfilment = cust_req.Compliance_fulfilment;
                    record.Documents_Evidence = cust_req.Documents_Evidence;
                    record.Owner = cust_req.Owner;
                    record.Concerned_Authority = cust_req.Concerned_Authority;
                    record.Status = cust_req.Status;
                    record.Comments = cust_req.Comments;
                    record.Issues = cust_req.Issues;
                    record.DocumentTargetDate = cust_req.DocumentTargetDate;
                    record.Responsibility = cust_req.Responsibility;
                    UpdateAuditFields(record);
 
                    CSPdb.CUST_REQ_REF.Update(record);
                    UpdateReqCatMapping(cust_req.ID, cust_req.Category_Id, cust_req.Updated_By);
                    if (cust_req.Applicability_Level == 2)
                    {
                        UpdateReqLevelMapping(req_reference_id: record.ID, applicability_level_id: cust_req.Applicability_Level, updated_by: cust_req.Updated_By, customer_Project_Name: null, customer: cust_req.Customer, projects: cust_req.ProjectName);
                    }
                    else
                    {
                       if(cust_req.Applicability_Level == 8 || cust_req.Applicability_Level == 9 || cust_req.Applicability_Level == 10)
                        {
                            return Ok();
                        }
                        else
                        {
                            UpdateReqLevelMapping(req_reference_id: record.ID, applicability_level_id: cust_req.Applicability_Level, updated_by: cust_req.Updated_By, customer_Project_Name: cust_req.Customer_Project_Name, customer: "0", projects: null);
                        } 
       }

                }
            }

            return Ok(cust_req);
        }

        private void UpdateReqCatMapping(int req_reference_id, int[] category_Id, string updated_by)
        {
            REQ_CAT_MAPPING upreqCatgeoryMapping;
            var existingrows = CSPdb.REQ_CAT_MAPPING.GetAll().Where(x => x.REQ_REF_ID == req_reference_id).ToList();
            if (existingrows.Count > 0)
            {
                existingrows.ForEach(x => x.isActive = false);
                CSPdb.REQ_CAT_MAPPING.Update(existingrows);
            }
            foreach (var catid in category_Id)
            {
                upreqCatgeoryMapping = new REQ_CAT_MAPPING();
                upreqCatgeoryMapping.REQ_REF_ID = req_reference_id;
                upreqCatgeoryMapping.REQ_CAT_ID = catid;
                upreqCatgeoryMapping.Created_By = updated_by;
                upreqCatgeoryMapping.Updated_By = updated_by;
                upreqCatgeoryMapping.Created_Date = DateTime.Now;
                upreqCatgeoryMapping.Updated_Date = DateTime.Now;
                upreqCatgeoryMapping.isActive = true;
                CSPdb.REQ_CAT_MAPPING.Add(upreqCatgeoryMapping);
            }

            CSPdb.Commit(CanCommit);
        }
        private void UpdateReqLevelMapping(int req_reference_id, int applicability_level_id, string updated_by, string[] customer_Project_Name = null, string customer = "0", string[] projects = null)
        {
            REQ_LEVEL_MAPPING upReqLevelMapping;
            var existingrows = CSPdb.REQ_LEVEL_MAPPING.GetAll().Where(x => x.REQ_REF_ID == req_reference_id && x.isActive).ToList();
            if (existingrows.Count > 0)
            {
                existingrows.ForEach(x => x.isActive = false);
                CSPdb.REQ_LEVEL_MAPPING.Update(existingrows);
            }

            if (applicability_level_id == 2)
            {
                foreach (var proj in projects)
                {
                    upReqLevelMapping = new REQ_LEVEL_MAPPING();

                    upReqLevelMapping.REQ_REF_ID = req_reference_id;
                    upReqLevelMapping.Applicability_Level_ID = applicability_level_id;
                    upReqLevelMapping.MAPPED_ID_INT = customer;
                    upReqLevelMapping.MAPPED_ID_STRING = proj;
                    upReqLevelMapping.Created_By = updated_by;
                    upReqLevelMapping.Updated_By = updated_by;
                    upReqLevelMapping.Created_Date = DateTime.Now;
                    upReqLevelMapping.Updated_Date = DateTime.Now;
                    upReqLevelMapping.isActive = true;

                    CSPdb.REQ_LEVEL_MAPPING.Add(upReqLevelMapping);
                }
            }
            else
            {
                if (customer_Project_Name.Any())
                {

                    foreach (var id in customer_Project_Name)
                    {
                        upReqLevelMapping = new REQ_LEVEL_MAPPING();

                        upReqLevelMapping.REQ_REF_ID = req_reference_id;
                        upReqLevelMapping.Applicability_Level_ID = applicability_level_id;
                        upReqLevelMapping.MAPPED_ID_INT = id;
                        upReqLevelMapping.Created_By = updated_by;
                        upReqLevelMapping.Updated_By = updated_by;
                        upReqLevelMapping.Created_Date = DateTime.Now;
                        upReqLevelMapping.Updated_Date = DateTime.Now;
                        upReqLevelMapping.isActive = true;

                        CSPdb.REQ_LEVEL_MAPPING.Add(upReqLevelMapping);
                    }
                }
            }
            CSPdb.Commit(CanCommit);
        }

        [POST("DeleteRequirementReference")]
        [ActionName("DeleteRequirementReference")]
        [HttpPost]
        public IHttpActionResult DeleteRequirementReference([FromBody] CUST_REQ_REF_VM cust_req)
        {
            LogRequest(prefix: "DeleteRequirementReference", content: JsonConvert.SerializeObject(cust_req));
            if (cust_req != null)
            {
                var record = CSPdb.CUST_REQ_REF.GetAll().Where(x => x.ID == cust_req.ID).FirstOrDefault();

                if (record.Status == "Implemented")
                {
                    return Content(HttpStatusCode.Conflict, "This Requirement has been Implemented, so it cannot be deleted");
                }

                else
                {
                    if (record != null)
                    {
                        record.ISACTIVE = false;

                        CSPdb.CUST_REQ_REF.Update(record);
                        CSPdb.Commit(CanCommit);
                    }
                }
            }

            return Ok(cust_req);
        }

        [POST("GetReqReference")]
        [ActionName("GetReqReference")]
        [HttpPost]
        public IHttpActionResult GetReqReference([FromBody] RequirementModel requirementModel)
        {
            List<CUST_REQ_REF> result = new List<CUST_REQ_REF>();
            if (requirementModel != null)
            {
                result = CSPdb.CUST_REQ_REF.GetAll().Where(x => x.Doc_Revision_Date >= requirementModel.START_DATE && x.Doc_Revision_Date <= requirementModel.END_DATE && x.ISACTIVE).
                    OrderByDescending(x => x.Doc_Revision_Date).ToList();
            }
            List<CUST_REQ_REF_VM> output = new List<CUST_REQ_REF_VM>();
            CUST_REQ_REF_VM newrow;
            foreach (var row in result)
            {
                newrow = new CUST_REQ_REF_VM();
                newrow.ID = row.ID;
                newrow.Applicability_Level = row.Applicability_Level;
                newrow.Customer_Project_Name = CSPdb.REQ_LEVEL_MAPPING.GetAll().Where(x => x.REQ_REF_ID == row.ID && x.isActive).Select(x => x.MAPPED_ID_INT).ToArray();

                if (row.Applicability_Level == 2)
                {
                    newrow.Customer = newrow.Customer_Project_Name[0];
                    newrow.ProjectName = CSPdb.REQ_LEVEL_MAPPING.GetAll().Where(x => x.REQ_REF_ID == row.ID && x.isActive).Select(x => x.MAPPED_ID_STRING).ToArray();
                }

                newrow.Category_Id = CSPdb.REQ_CAT_MAPPING.GetAll().Where(x => x.REQ_REF_ID == row.ID && x.isActive).Select(x => x.REQ_CAT_ID).ToArray();
                newrow.Doc_Req_Reference = row.Doc_Req_Reference;
                newrow.Doc_Revision_No = row.Doc_Revision_No;
                newrow.Doc_Revision_Date = row.Doc_Revision_Date;
                newrow.Requirement_Title = row.Requirement_Title;
                newrow.Requirement_Desc = row.Requirement_Desc;
                newrow.Compliance_fulfilment = row.Compliance_fulfilment;
                newrow.Documents_Evidence = row.Documents_Evidence;
                newrow.Owner = row.Owner;
                newrow.Concerned_Authority = row.Concerned_Authority;
                newrow.Status = row.Status;
                newrow.Comments = row.Comments;
                newrow.Issues = row.Issues;
                newrow.DocumentTargetDate = row.DocumentTargetDate;
                newrow.Responsibility = row.Responsibility;

                output.Add(newrow);
            }
            return Ok(output);

        }

        public class RequirementModel
        {
            public DateTime START_DATE { get; set; }
            public DateTime END_DATE { get; set; }

            public int[] CATEGORY_IDS { get; set; }
        }

        [GET("GetReqStageStatus")]
        [ActionName("GetReqStageStatus")]
        [HttpGet]
        public IHttpActionResult GetReqStageStatus(int reqID)
        {
            return Ok(CSPdb.AppRepo.GetReqStageStatus(reqID).ToList());
        }

    }
}