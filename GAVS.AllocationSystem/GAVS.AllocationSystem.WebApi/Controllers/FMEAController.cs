using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using System.Web.UI.WebControls;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("AddServiceLevelIdentifier")]
        [ActionName("AddServiceLevelIdentifier")]
        [HttpGet]
        public IHttpActionResult AddServiceLevelIdentifier(string identifier, string title, int serviceAreaId, string empid)
        {
            CSPdb.AppRepo.AddServiceLevelIdentifier(identifier, title, serviceAreaId, empid);
            return Ok("Success");
        }

        [GET("GetServiceLevelIdentifier")]
        [ActionName("GetServiceLevelIdentifier")]
        [HttpGet]
        public IHttpActionResult GetServiceLevelIdentifier(int serviceAreaId)
        {
            List<SERVICE_LEVEL_IDENTIFIER_MODEL> mapping = CSPdb.SERVICE_LEVEL_IDENTIFIER_MODEL.GetAll().Where(t => t.SERVICE_AREA_ID == serviceAreaId && t.ISACTIVE == true).ToList();
            return Ok(mapping);
        }

        [GET("AddFMEATask")]
        [ActionName("AddFMEATask")]
        [HttpGet]
        public IHttpActionResult AddFMEATask(int serviceAreaId, int processId, int serviceIdentifierId, string taskTitle, int taskCategoryId)
        {

            var existing = CSPdb.FMEA_Task_Model.GetAll().Any(x => x.TASK_TITLE == taskTitle && x.TASK_CATEGORY_ID == taskCategoryId);
            if (existing)
            {
                return Ok("Task Title exists already.");
            }

            CSPdb.AppRepo.AddFMEATask(serviceAreaId, processId, serviceIdentifierId, taskTitle, taskCategoryId);
            return Ok("Task added successfully");
        }

        [GET("GetFMEATasks")]
        [ActionName("GetFMEATasks")]
        [HttpGet]
        public IHttpActionResult GetFMEATasks(int serviceAreaId, int processId, int serviceIdentifierId)
        {
            List<FMEA_Task_Model> mapping = CSPdb.FMEA_Task_Model.GetAll().Where(t => t.SERVICE_AREA_ID == serviceAreaId && t.PROCESS_ID == processId && t.SERVICE_LEVEL_IDENTIFIER_ID == serviceIdentifierId).ToList();
            return Ok(mapping);
        }

        //[GET("GetFMEADATA")]
        //[ActionName("GetFMEADATA")]
        //[HttpGet]
        //public IHttpActionResult GetFMEADATA(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId)
        //{

        //    List<FMEADataModel> mapping = CSPdb.AppRepo.GetFMEADATA(fmeaTypeId, serviceAreaId, processId, serviceIdentifierId, taskId);
        //    return Ok(mapping);

        //}

        [GET("GetFailureModeMasterData")]
        [ActionName("GetFailureModeMasterData")]
        [HttpGet]
        public IHttpActionResult GetFailureModeMasterData(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId)
        {

            List<FMEADataModel> mapping = CSPdb.AppRepo.GetFMEADATA(fmeaTypeId, serviceAreaId, processId, serviceIdentifierId, taskId);
            return Ok(mapping);

        }

        [POST("AddFMEADataModel")]
        [ActionName("AddFMEADataModel")]
        [HttpPost]
        public IHttpActionResult AddFMEADataModel(HttpRequestMessage request)
        {
            string empId = Request.Headers.GetValues("empId").ToList()[0];
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            FMEAModel results = JsonConvert.DeserializeObject<FMEAModel>(json);
            FMEAModel query = new FMEAModel();
            query.FMEA_TYPE_ID = results.FMEA_TYPE_ID;
            query.SERVICE_AREA_ID = results.SERVICE_AREA_ID;
            //query.SERVICE_TOWER = results.SERVICE_TOWER;
            query.PROCESS_ID = results.PROCESS_ID;
            //query.PROCESS = results.PROCESS;

            query.SERVICE_LEVEL_IDENTIFIER_ID = results.SERVICE_LEVEL_IDENTIFIER_ID;
            //query.SERVICE_LEVEL = results.SERVICE_LEVEL;
            query.TASK_ID = results.TASK_ID;
            //query.TASK = results.TASK;
            query.FUNCTION_ACTIVITIES = results.FUNCTION_ACTIVITIES;
            query.POTENTIAL_FAILURE_MODE = results.POTENTIAL_FAILURE_MODE;
            query.POTENTIAL_FAILURE_EFFECT = results.POTENTIAL_FAILURE_EFFECT;
            query.POTENTIAL_CAUSE_FACTOR = results.POTENTIAL_CAUSE_FACTOR;
            query.POTENTIAL_CAUSE = results.POTENTIAL_CAUSE;
            query.RECOMMENDED_DETECTIVE_CONTROL = results.RECOMMENDED_DETECTIVE_CONTROL;
            query.RECOMMENDED_PREVENTIVE_CONTROL = results.RECOMMENDED_PREVENTIVE_CONTROL;
            query.FMEA_STATUS = results.FMEA_STATUS;

            query.CUST_ID = results.CUST_ID;
            query.PROJ_ID = results.PROJ_ID;

            query.CREATED_BY = empId;
            query.CREATED_DATE = DateTime.Now;
            query.UPDATED_BY = empId;
            query.UPDATED_DATE = DateTime.Now;
            query.isactive = true;

            CSPdb.FMEAModel.Add(query);
            CSPdb.Commit(CanCommit);
            return Ok();
        }

        [POST("UpdateFMEADataModel")]
        [ActionName("UpdateFMEADataModel")]
        [HttpPost]
        public IHttpActionResult UpdateFMEADataModel(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            string empId = GetHeaderDetails_String("empId");
            //int empIds = Convert.ToInt32(empId);
            dynamic json = jsonContent;
            FMEAModel results = JsonConvert.DeserializeObject<FMEAModel>(json);
            FMEAModel query = CSPdb.FMEAModel.GetById(results.ID);
            if (results != null)
            {
                query.FMEA_TYPE_ID = results.FMEA_TYPE_ID;
                query.SERVICE_AREA_ID = results.SERVICE_AREA_ID;
                //query.SERVICE_TOWER = results.SERVICE_TOWER;
                query.PROCESS_ID = results.PROCESS_ID;
                //query.PROCESS = results.PROCESS;

                query.SERVICE_LEVEL_IDENTIFIER_ID = results.SERVICE_LEVEL_IDENTIFIER_ID;
                //query.SERVICE_LEVEL = results.SERVICE_LEVEL;
                query.TASK_ID = results.TASK_ID;
                //query.TASK = results.TASK;
                query.FUNCTION_ACTIVITIES = results.FUNCTION_ACTIVITIES;
                query.POTENTIAL_FAILURE_MODE = results.POTENTIAL_FAILURE_MODE;
                query.POTENTIAL_FAILURE_EFFECT = results.POTENTIAL_FAILURE_EFFECT;

                query.POTENTIAL_CAUSE_FACTOR = results.POTENTIAL_CAUSE_FACTOR;
                query.POTENTIAL_CAUSE = results.POTENTIAL_CAUSE;
                query.RECOMMENDED_DETECTIVE_CONTROL = results.RECOMMENDED_DETECTIVE_CONTROL;
                query.RECOMMENDED_PREVENTIVE_CONTROL = results.RECOMMENDED_PREVENTIVE_CONTROL;
                query.FMEA_STATUS = results.FMEA_STATUS;

                query.CUST_ID = results.CUST_ID;
                query.PROJ_ID = results.PROJ_ID;

                query.UPDATED_BY = empId;
                query.UPDATED_DATE = DateTime.Now;
                query.isactive = true;

                CSPdb.FMEAModel.Update(query);
                CSPdb.Commit(CanCommit);
            }
            return Ok(query);
        }

        [POST("AddFMEADataStage2Model")]
        [ActionName("AddFMEADataStage2Model")]
        [HttpPost]
        public IHttpActionResult AddFMEADataStage2Model(HttpRequestMessage request)
        {
            var empId = GetHeaderDetails_String("empId");
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            FMEA_DATA_STAGE2_MODEL results = JsonConvert.DeserializeObject<FMEA_DATA_STAGE2_MODEL>(json);
            FMEA_DATA_STAGE2_MODEL query = new FMEA_DATA_STAGE2_MODEL();

            query.FMEA_DATA_ID = results.FMEA_DATA_ID;
            query.RF_OCCURRENCE_ID = results.RF_OCCURRENCE_ID;
            query.RF_SEVERITY_ID = results.RF_SEVERITY_ID;
            query.RF_DETECTION_ID = results.RF_DETECTION_ID;
            query.RPN = results.RPN;
            query.CURRENT_DETECTION_CONTROL = results.CURRENT_DETECTION_CONTROL;
            query.CURRENT_PREVENTIVE_CONTROL = results.CURRENT_PREVENTIVE_CONTROL;
            query.RESPONSIBLE = results.RESPONSIBLE;
            query.TARGET_DATE = DateTime.Now;
            query.ISAPPLICABLE = results.ISAPPLICABLE;

            query.CUST_ID = results.CUST_ID;
            query.PROJ_ID = results.PROJ_ID;

            CSPdb.FMEA_DATA_STAGE2_MODEL.Add(query);
            CSPdb.Commit(CanCommit);
            return Ok();
        }

        [POST("UpdateFMEADataStage2Model")]
        [ActionName("UpdateFMEADataStage2Model")]
        [HttpPost]
        public IHttpActionResult UpdateFMEADataStage2Model(HttpRequestMessage request)
        {
            var empId = GetHeaderDetails_String("empId");
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            FMEA_DATA_STAGE2_MODEL results = JsonConvert.DeserializeObject<FMEA_DATA_STAGE2_MODEL>(json);
            FMEA_DATA_STAGE2_MODEL query = new FMEA_DATA_STAGE2_MODEL();

            if (results != null)
            {
                query.ID = results.ID;
                query.FMEA_DATA_ID = results.FMEA_DATA_ID;
                query.RF_OCCURRENCE_ID = results.RF_OCCURRENCE_ID;
                query.RF_SEVERITY_ID = results.RF_SEVERITY_ID;
                query.RF_DETECTION_ID = results.RF_DETECTION_ID;
                query.RPN = results.RPN;
                query.CURRENT_DETECTION_CONTROL = results.CURRENT_DETECTION_CONTROL;
                query.CURRENT_PREVENTIVE_CONTROL = results.CURRENT_PREVENTIVE_CONTROL;
                query.RESPONSIBLE = results.RESPONSIBLE;
                query.TARGET_DATE = results.TARGET_DATE;
                query.ISAPPLICABLE = results.ISAPPLICABLE;
                query.RECOMMENDED_DETECTIVE_CONTROL_STAGE2 = results.RECOMMENDED_DETECTIVE_CONTROL_STAGE2;
                query.RECOMMENDED_PREVENTIVE_CONTROL_STAGE2 = results.RECOMMENDED_PREVENTIVE_CONTROL_STAGE2;
                CSPdb.FMEA_DATA_STAGE2_MODEL.Update(query);
                CSPdb.Commit(CanCommit);
            }
            return Ok(query);
        }

        [POST("UpdateFMEADataStage3Model")]
        [ActionName("UpdateFMEADataStage3Model")]
        [HttpPost]
        public IHttpActionResult UpdateFMEADataStage3Model(HttpRequestMessage request)
        {
            string empId = Request.Headers.GetValues("empId").ToList()[0];
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            FMEA_DATA_STAGE3_MODEL results = JsonConvert.DeserializeObject<FMEA_DATA_STAGE3_MODEL>(json);
            FMEA_DATA_STAGE3_MODEL query = new FMEA_DATA_STAGE3_MODEL();
            CSPdb.AppRepo.UpdateFMEADataStage3Model(results);
            return Ok("success");
        }

        [GET("GetFMEADATAStage2")]
        [ActionName("GetFMEADATAStage2")]
        [HttpGet]
        public IHttpActionResult GetFMEADATAStage2(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId)
        {
            List<GET_FMEA_DATA_STAGE2> mapping = CSPdb.AppRepo.GetFMEADATAStage2(fmeaTypeId, serviceAreaId, processId, serviceIdentifierId, taskId);
            return Ok(mapping);
        }

        [GET("GetFMEADATAStage3")]
        [ActionName("GetFMEADATAStage3")]
        [HttpGet]
        public IHttpActionResult GetFMEADATAStage3(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId)
        {
            List<GET_FMEA_DATA_STAGE3> mapping = CSPdb.AppRepo.GetFMEADATAStage3(fmeaTypeId, serviceAreaId, processId, serviceIdentifierId, taskId);
            return Ok(mapping);
        }

        [GET("GetRatingFactors")]
        [ActionName("GetRatingFactors")]
        [HttpGet]
        public IHttpActionResult GetRatingFactors(string ratingType)
        {
            List<FMEA_Rating_Factors_Model> mapping;

            if (ratingType == "All")
                mapping = CSPdb.FMEA_Rating_Factors_Model.GetAll().ToList();
            else
                mapping = CSPdb.FMEA_Rating_Factors_Model.GetAll().Where(t => t.RATING_FACTORS_CATEGORY == ratingType).ToList();

            return Ok(mapping);
        }

        [GET("UpdateApproval")]
        [ActionName("UpdateApproval")]
        [HttpGet]
        public IHttpActionResult UpdateApproval(int fmeaDataId, int fmeaStatus, string rejectionComments)
        {
            if (rejectionComments == null)
                rejectionComments = "";
            CSPdb.AppRepo.UpdateApproval(fmeaDataId, fmeaStatus, rejectionComments);
            return Ok("Success");
        }

        [GET("UpdateApprovalStage2")]
        [ActionName("UpdateApprovalStage2")]
        [HttpGet]
        public IHttpActionResult UpdateApprovalStage2(int fmeaDataId, int fmeaStatus, string rejectionComments)
        {
            //if (rejectionComments == null)
            //rejectionComments = "";

            string empId = Request.Headers.GetValues("empId").ToList()[0];
            CSPdb.AppRepo.UpdateApprovalStage2(fmeaDataId, fmeaStatus, rejectionComments, empId);
            return Ok("Success");
        }

        [GET("UpdateApprovalStage3")]
        [ActionName("UpdateApprovalStage3")]
        [HttpGet]
        public IHttpActionResult UpdateApprovalStage3(int fmeaDataId, int fmeaStatus, string rejectionComments)
        {
            //if (rejectionComments == null)
            //    rejectionComments = "";

            string empId = Request.Headers.GetValues("empId").ToList()[0];
            CSPdb.AppRepo.UpdateApprovalStage3(fmeaDataId, fmeaStatus, rejectionComments, empId);
            return Ok("Success");
        }

        [POST("DeleteFMEADataModel")]
        [ActionName("DeleteFMEADataModel")]
        [HttpPost]
        public IHttpActionResult DeleteFMEADataModel(int fmeaDataId)
        {
            //CSPdb.FMEAModel.Delete(fmeaDataId);
            //CSPdb.Commit(CanCommit);
            CSPdb.AppRepo.DeleteFMEAStage1(fmeaDataId);
            return Ok(fmeaDataId);
        }

        [GET("UpdateApplicable")]
        [ActionName("UpdateApplicable")]
        [HttpGet]
        public IHttpActionResult UpdateApplicable(int id, Boolean status)
        {
            CSPdb.AppRepo.UpdateApplicable(id, status);
            return Ok("Success");
        }

        private void UpdateMultipleRequests(int id, bool status, string request)
        {
            CSPdb.AppRepo.UpdateMultipleRequests(id, status, request);
        }

        [POST("UpdateFMEAStage2MultipleRequests")]
        [ActionName("UpdateFMEAStage2MultipleRequests")]
        [HttpPost]
        public IHttpActionResult UpdateFMEAStage2MultipleRequests(HttpRequestMessage request)
        {
            bool status = true;
            string type = this.GetHeaderDetails_String("type");
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            List<FMEA_DATA_STAGE2_MODEL> FMEAStage2MultipleApprovals = JsonConvert.DeserializeObject<List<FMEA_DATA_STAGE2_MODEL>>(json);

            if (type == "APPLICABLE")
            {
                foreach (FMEA_DATA_STAGE2_MODEL objRequests in FMEAStage2MultipleApprovals)
                {
                    UpdateMultipleRequests(objRequests.ID, objRequests.ISAPPLICABLE, type);
                }
            }

            if (type == "APPROVE")
            {
                foreach (FMEA_DATA_STAGE2_MODEL objRequests in FMEAStage2MultipleApprovals)
                {
                    UpdateMultipleRequests(objRequests.ID, objRequests.ISAPPROVE, type);
                }
            }

            if (type == "REJECT")
            {
                foreach (FMEA_DATA_STAGE2_MODEL objRequests in FMEAStage2MultipleApprovals)
                {
                    UpdateMultipleRequests(objRequests.ID, objRequests.ISREJECT, type);
                }
            }

            return Ok(status);
        }

        [GET("GetTasksForFMEA")]
        [ActionName("GetTasksForFMEA")]
        [HttpGet]
        public IHttpActionResult GetTasksForFMEA(string customerId, string projectId)
        {
            List<PlannedAudits> tasks = CSPdb.AppRepo.GetTasksForFMEA(customerId, projectId).ToList();
            return Ok(tasks);
        }

        [GET("GetFMEAStage2DataByTask")]
        [ActionName("GetFMEAStage2DataByTask")]
        [HttpGet]
        public IHttpActionResult GetFMEAStage2DataByTask(int taskId)
        {
            CSPdb.AppRepo.GetFMEAStage2DataByTask(taskId);
            return Ok();
        }

        //new

        [POST("AddFailureModeMaster")]
        [ActionName("AddFailureModeMaster")]
        [HttpPost]
        public IHttpActionResult AddFailureModeMaster([FromBody] Failure_Mode_Master results)
        {
            ValidateReqest(results);
            string empId = GetHeaderDetails_String("empId");
            Failure_Mode_Master query = new Failure_Mode_Master();
            query.FMEA_TYPE_ID = results.FMEA_TYPE_ID;
            query.SERVICE_AREA_ID = results.SERVICE_AREA_ID;
            query.PROCESS_ID = results.PROCESS_ID;
            query.SERVICE_LEVEL_IDENTIFIER_ID = results.SERVICE_LEVEL_IDENTIFIER_ID;
            query.TASK_ID = results.TASK_ID;
            query.FUNCTION_ACTIVITIES = results.FUNCTION_ACTIVITIES;
            query.POTENTIAL_FAILURE_MODE = results.POTENTIAL_FAILURE_MODE;
            query.POTENTIAL_FAILURE_EFFECT = results.POTENTIAL_FAILURE_EFFECT;
            query.POTENTIAL_CAUSE_FACTOR = results.POTENTIAL_CAUSE_FACTOR;
            query.POTENTIAL_CAUSE = results.POTENTIAL_CAUSE;
            query.RECOMMENDED_DETECTIVE_CONTROL = results.RECOMMENDED_DETECTIVE_CONTROL;
            query.RECOMMENDED_PREVENTIVE_CONTROL = results.RECOMMENDED_PREVENTIVE_CONTROL;
            query.CREATED_BY = empId;
            query.CREATED_DATE = DateTime.Now;
            query.UPDATED_BY = empId;
            query.UPDATED_DATE = DateTime.Now;
            query.ISACTIVE = true;

            CSPdb.Failure_Mode_Master.Add(query);
            CSPdb.Commit(CanCommit);
            return Ok(query);
        }

        [POST("UpdateFailureModeMaster")]
        [ActionName("UpdateFailureModeMaster")]
        [HttpPost]
        public IHttpActionResult UpdateFailureModeMaster([FromBody] Failure_Mode_Master results)
        {
            ValidateReqest(results);
            string empId = GetHeaderDetails_String("empId");
            Failure_Mode_Master query = CSPdb.Failure_Mode_Master.GetById(results.ID);
            if (query != null)
            {
                query.FMEA_TYPE_ID = results.FMEA_TYPE_ID;
                query.SERVICE_AREA_ID = results.SERVICE_AREA_ID;
                query.PROCESS_ID = results.PROCESS_ID;
                query.SERVICE_LEVEL_IDENTIFIER_ID = results.SERVICE_LEVEL_IDENTIFIER_ID;
                query.TASK_ID = results.TASK_ID;
                query.FUNCTION_ACTIVITIES = results.FUNCTION_ACTIVITIES;
                query.POTENTIAL_FAILURE_MODE = results.POTENTIAL_FAILURE_MODE;
                query.POTENTIAL_FAILURE_EFFECT = results.POTENTIAL_FAILURE_EFFECT;
                query.POTENTIAL_CAUSE_FACTOR = results.POTENTIAL_CAUSE_FACTOR;
                query.POTENTIAL_CAUSE = results.POTENTIAL_CAUSE;
                query.RECOMMENDED_DETECTIVE_CONTROL = results.RECOMMENDED_DETECTIVE_CONTROL;
                query.RECOMMENDED_PREVENTIVE_CONTROL = results.RECOMMENDED_PREVENTIVE_CONTROL;
                query.UPDATED_BY = empId;
                query.UPDATED_DATE = DateTime.Now;
                query.ISACTIVE = true;

                CSPdb.Failure_Mode_Master.Update(query);
                CSPdb.Commit(CanCommit);
            }
            return Ok(query);
        }

        [POST("ApproveFailureModeMaster")]
        [ActionName("ApproveFailureModeMaster")]
        [HttpPost]
        public IHttpActionResult ApproveFailureModeMaster(HttpRequestMessage request)
        {
            FMEAModel model = new FMEAModel();
            return Ok( );
        }

        [POST("RejectFailureModeMaster")]
        [ActionName("RejectFailureModeMaster")]
        [HttpPost]
        public IHttpActionResult RejectFailureModeMaster(HttpRequestMessage request)
        {
            return Ok();
        }


        [POST("UpdateStatusofFailures")]
        [ActionName("UpdateStatusofFailures")]
        [HttpPost]
        public IHttpActionResult UpdateStatusofFailures([FromBody] List<Failure_Mode_Master> failures)
        {
            ValidateReqest(failures);
            var ids = failures.Select(x => x.ID).ToList();
            var entities = CSPdb.Failure_Mode_Master.GetAll().Where(x => ids.Contains(x.ID)).ToList();
            foreach (var item in entities)
            {
                var failure = failures.FirstOrDefault(x => x.ID == item.ID);
                if (failure.STATUS != item.STATUS)
                {
                    item.STATUS = failure.STATUS;
                    CSPdb.Failure_Mode_Master.Update(item);
                }

            }
            CSPdb.Commit(CanCommit);

            return Ok(failures);
        }



    }
}