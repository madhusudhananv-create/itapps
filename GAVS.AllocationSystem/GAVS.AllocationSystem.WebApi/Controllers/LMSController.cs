using System;
using System.Linq;
using System.Web;
using AttributeRouting.Web.Mvc;
using System.Web.Http;
using GAVS.AllocationSystem.Model.AllSys.Tables;
using GAVS.AllocationSystem.WebApi.ActionFilters;
using System.Net.Http;
using Newtonsoft.Json;
using System.Net;
using System.Configuration;
using GAVS.AllocationSystem.Data.Contracts;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    [BearerTokenAuthorization]
    [ExceptionFilter]
    [ResponseTimeActionFilter]

    public class LMSController : ApiControllerBase
    {
       

    
        
        private const string EMPTY_ENROLLMENTID_MSG = "Unable to find LMS Course Enrollment with given ID: ";
        private readonly string ServiceEmail = string.Empty;
        private readonly string ServicePassword = string.Empty;

        public LMSController(ICloudDB cldb, ICSPDB cspdb)
        {
            Cldb = cldb;
            CSPdb = cspdb;
            ServiceEmail = ConfigurationManager.AppSettings["emailid"];
            ServicePassword = ConfigurationManager.AppSettings["emailpassword"];
            helper = new Controllers.ControllerHelper(cldb, cspdb);
        }


        [GET("GetLMSCourseById")]
        [ActionName("GetLMSCourseById")]
        [HttpGet]
        public IHttpActionResult GetLMSCourseById(int courseId)
        {
            var url = HttpContext.Current.Request.Url.AbsoluteUri;
            LogRequest(prefix: "LMS", content: url);
            var errorMsg = string.Empty;

            LMS_COURSE course = null;
            try
            {
                course = Cldb.LMS_COURSE.GetAll().FirstOrDefault(x => x.LMS_COURSE_ID == courseId && x.ISACTIVE);
                if (course == null) errorMsg = "unable to find course with id :" + courseId;
            }
            catch (Exception exp)
            {
                errorMsg = GetException(exp, url);
            }
            return GetResult<LMS_COURSE>(course, errorMsg);
        }


        [POST("AddUpdateLMSCourse")]
        [ActionName("AddUpdateLMSCourse")]
        [HttpPost]
        public IHttpActionResult AddUpdateLMSCourse(HttpRequestMessage request)
        {
            var empId = this.GetHeaderDetails_String("empId");
            var content = request.Content;
            var errorMsg = string.Empty;
            var jsonContent = content.ReadAsStringAsync().Result;
            // jsonContent ="{\"createD_BY\":\"GS - 1623\",\"createD_DATE\":\"2023 - 03 - 11T00: 48:17\",\"updateD_BY\":\"GS - 1623\",\"updateD_DATE\":\"2023 - 03 - 11T00: 48:17\",\"isactive\":true,\"lmS_COURSE_ID\":80,\"category\":\"test category\",\"fulL_NAME\":\"InfoSec & IT Compliance Assessment 2021@\",\"shorT_NAME\":\"InfoSec & IT Compliance Assessment 2021\",\"summary\":\"Test Summary\",\"starT_DATE\":\"2021 - 09 - 24T00: 00:00\",\"enD_DATE\":null}\"";
            LogRequest(prefix: "LMS", content: jsonContent);
            dynamic json = jsonContent;
            LMS_COURSE course = JsonConvert.DeserializeObject<LMS_COURSE>(json);

            CheckRequestIsValid(course, empId);
            try
            {
                if (course.LMS_COURSE_ID > 0)
                {
                    var exist = Cldb.LMS_COURSE.GetAll().FirstOrDefault(x => x.LMS_COURSE_ID == course.LMS_COURSE_ID && x.ISACTIVE);
                    if (exist != null)
                    {
                        exist.CATEGORY = course.CATEGORY;
                        exist.FULL_NAME = course.FULL_NAME;
                        exist.SHORT_NAME = course.SHORT_NAME;
                        exist.START_DATE = course.START_DATE;
                        exist.SUMMARY = course.SUMMARY;
                        UpdateAuditFields(exist, empId);
                        Cldb.LMS_COURSE.Update(exist);
                    }
                    else
                    {
                        UpdateAuditFields(course, empId);
                        Cldb.LMS_COURSE.Add(course);
                        //
                    }
                }
                else
                {
                    return Content(HttpStatusCode.Conflict, "Unable to Process the request with invalid course ID : " + course.LMS_COURSE_ID);
                }
                Cldb.Commit(CanCommit);
            }
            catch (Exception exp)
            {
                errorMsg = GetException(exp, jsonContent);
            }
            return Ok(errorMsg);
        }

        [POST("DeleteLMSCourse")]
        [ActionName("DeleteLMSCourse")]
        [HttpPost]
        public IHttpActionResult DeleteLMSCourse(HttpRequestMessage request)
        {
            var empId = this.GetHeaderDetails_String("empId");
            var content = request.Content;
            var errorMsg = string.Empty;
            var jsonContent = content.ReadAsStringAsync().Result;
            LogRequest(prefix: "LMS", content: jsonContent);
            dynamic json = jsonContent;
            LMS_COURSE course = JsonConvert.DeserializeObject<LMS_COURSE>(json);

            CheckRequestIsValid(course, empId);
            try
            {
                var exist = Cldb.LMS_COURSE.GetAll().FirstOrDefault(x => x.LMS_COURSE_ID == course.LMS_COURSE_ID && x.ISACTIVE);
                if (exist != null)
                {
                    UpdateAuditFields(exist, empId);
                    exist.ISACTIVE = false;
                    Cldb.LMS_COURSE.Update(exist);
                }
                else
                {
                    return Content(HttpStatusCode.Conflict, "Unable to find LMS Course with given ID: " + course.LMS_COURSE_ID);
                }
                Cldb.Commit(CanCommit);
            }
            catch (Exception exp)
            {
                errorMsg = GetException(exp, jsonContent);
            }
            return Ok(errorMsg);
        }

        [GET("GetLMSCourseEnrollmentById")]
        [ActionName("GetLMSCourseEnrollmentById")]
        [HttpGet]
        public IHttpActionResult GetLMSCourseEnrollmentById(int enrollmentId)
        {
            var url = HttpContext.Current.Request.Url.AbsoluteUri;
            LogRequest(prefix: "LMS", content: url);
            var errorMsg = string.Empty;

            LMS_COURSE_ENROLLMENT courseEnrollment = null;
            try
            {
                courseEnrollment = Cldb.LMS_COURSE_ENROLLMENT.GetAll().FirstOrDefault(x => x.LMS_ENROLLMENT_ID == enrollmentId && x.ISACTIVE);
                if (courseEnrollment == null) errorMsg = "unable to find course Enrolment with id :" + enrollmentId;
            }
            catch (Exception exp)
            {
                errorMsg = GetException(exp, url);
            }
            return GetResult<LMS_COURSE_ENROLLMENT>(courseEnrollment, errorMsg);
        }

        [POST("AddUpdateLMSCourseEnrollment")]
        [ActionName("AddUpdateLMSCourseEnrollment")]
        [HttpPost]
        public IHttpActionResult AddUpdateLMSCourseEnrollment(HttpRequestMessage request)
        {
            var empId = this.GetHeaderDetails_String("empId");
            var content = request.Content;
            var errorMsg = string.Empty;
            var jsonContent = content.ReadAsStringAsync().Result;
            LogRequest(prefix: "LMS", content: jsonContent);
            dynamic json = jsonContent;
            LMS_COURSE_ENROLLMENT courseEnrollment = JsonConvert.DeserializeObject<LMS_COURSE_ENROLLMENT>(json);

            CheckRequestIsValid(courseEnrollment, empId);
            if(string.IsNullOrWhiteSpace(courseEnrollment.EMP_ID))
                return Content(HttpStatusCode.Conflict, EMPTY_EMPLOYEEID_MSG + courseEnrollment.LMS_ENROLLMENT_ID);
            try
            {
                var course = Cldb.LMS_COURSE.GetAll().FirstOrDefault(x => x.LMS_COURSE_ID == courseEnrollment.COURSE_ID && x.ISACTIVE);

                if (course != null)
                {
                    if (courseEnrollment.LMS_ENROLLMENT_ID > 0)
                    {
                        var exist = Cldb.LMS_COURSE_ENROLLMENT.GetAll().FirstOrDefault(x => x.LMS_ENROLLMENT_ID == courseEnrollment.LMS_ENROLLMENT_ID && x.ISACTIVE);
                        if (exist != null)
                        {
                            exist.ENROLLMENT_DATE = courseEnrollment.ENROLLMENT_DATE;
                            exist.PROJ_ID = courseEnrollment.PROJ_ID;
                            exist.STATUS = courseEnrollment.STATUS;
                            exist.COURSE_ID = course.ID;
                            UpdateAuditFields(exist, empId);
                            Cldb.LMS_COURSE_ENROLLMENT.Update(exist);
                        }
                        else
                        {
                            courseEnrollment.COURSE_ID = course.ID;
                            UpdateAuditFields(courseEnrollment, empId);
                            Cldb.LMS_COURSE_ENROLLMENT.Add(courseEnrollment);
                        }
                    }
                    else
                    {
                        return Content(HttpStatusCode.Conflict, EMPTY_ENROLLMENTID_MSG + courseEnrollment.LMS_ENROLLMENT_ID);
                      
                    }
                }
                else
                {
                    return Content(HttpStatusCode.Conflict, "Course ID is not valid: " + courseEnrollment.COURSE_ID);
                }

                Cldb.Commit(CanCommit);
            }
            catch (Exception exp)
            {
                errorMsg = GetException(exp, jsonContent);
            }
            return Ok(errorMsg);
        }

        [POST("DeleteLMSCourseEnrollment")]
        [ActionName("DeleteLMSCourseEnrollment")]
        [HttpPost]
        public IHttpActionResult DeleteLMSCourseEnrollment(HttpRequestMessage request)
        {
            var empId = this.GetHeaderDetails_String("empId");
            var content = request.Content;
            var errorMsg = string.Empty;
            var jsonContent = content.ReadAsStringAsync().Result;
            LogRequest(prefix: "LMS", content: jsonContent);
            dynamic json = jsonContent;
            LMS_COURSE_ENROLLMENT courseEnrollment = JsonConvert.DeserializeObject<LMS_COURSE_ENROLLMENT>(json);

            CheckRequestIsValid(courseEnrollment, empId);
            try
            {
                var exist = Cldb.LMS_COURSE_ENROLLMENT.GetAll().FirstOrDefault(x => x.LMS_ENROLLMENT_ID == courseEnrollment.LMS_ENROLLMENT_ID && x.ISACTIVE);
                if (exist != null)
                {
                    UpdateAuditFields(exist, empId);
                    exist.ISACTIVE = false;
                    Cldb.LMS_COURSE_ENROLLMENT.Update(exist);
                }
                else
                {
                    return Content(HttpStatusCode.Conflict, EMPTY_ENROLLMENTID_MSG + courseEnrollment.LMS_ENROLLMENT_ID);
                }
                Cldb.Commit(CanCommit);
            }
            catch (Exception exp)
            {
                errorMsg = GetException(exp, jsonContent);
            }
            return Ok(errorMsg);
        }

        [GET("GetCompletedLMSCourseById")]
        [ActionName("GetCompletedLMSCourseById")]
        [HttpGet]
        public IHttpActionResult GetCompletedLMSCourseById(int enrollmentId)
        {
            var url = HttpContext.Current.Request.Url.AbsoluteUri;
            LogRequest(prefix: "LMS", content: url);
            var errorMsg = string.Empty;

            LMS_COURSE_COMPLETION courseCompletion = null;
            try
            {
                courseCompletion = Cldb.LMS_COURSE_COMPLETION.GetAll().FirstOrDefault(x => x.ENROLLMENT_ID == enrollmentId && x.ISACTIVE);
            }
            catch (Exception exp)
            {
                errorMsg = GetException(exp, url);
            }
            return GetResult<LMS_COURSE_COMPLETION>(courseCompletion, errorMsg);
        }

        [POST("AddUpdateLMSCourseCompletion")]
        [ActionName("AddUpdateLMSCourseCompletion")]
        [HttpPost]
        public IHttpActionResult AddUpdateLMSCourseCompletion(HttpRequestMessage request)
        {
            var empId = this.GetHeaderDetails_String("empId");
            var content = request.Content;
            var errorMsg = string.Empty;
            var jsonContent = content.ReadAsStringAsync().Result;
            LogRequest(prefix: "LMS", content: jsonContent);
            dynamic json = jsonContent;
            LMS_COURSE_COMPLETION courseCompletion = JsonConvert.DeserializeObject<LMS_COURSE_COMPLETION>(json);

            CheckRequestIsValid(courseCompletion, empId);
            try
            {
                var courseEnrollment = Cldb.LMS_COURSE_ENROLLMENT.GetAll().FirstOrDefault(x => x.LMS_ENROLLMENT_ID == courseCompletion.ENROLLMENT_ID && x.ISACTIVE);

                if (courseEnrollment != null)
                {
                    if (courseCompletion.ENROLLMENT_ID > 0)
                    {
                        var exist = Cldb.LMS_COURSE_COMPLETION.GetAll().FirstOrDefault(x => x.ENROLLMENT_ID == courseCompletion.ENROLLMENT_ID && x.ISACTIVE);
                        if (exist != null)
                        {
                            exist.START_DATE = courseCompletion.START_DATE;
                            exist.EMP_ID = courseEnrollment.EMP_ID;
                            exist.COMPLETED_DATE = courseCompletion.COMPLETED_DATE;
                            UpdateAuditFields(exist, empId);
                            Cldb.LMS_COURSE_COMPLETION.Update(exist);
                        }
                        else
                        {
                            UpdateAuditFields(courseCompletion, empId);
                            Cldb.LMS_COURSE_COMPLETION.Add(courseCompletion);
                        }
                    }
                    else
                    {
                        return Content(HttpStatusCode.Conflict, EMPTY_ENROLLMENTID_MSG + courseCompletion.ENROLLMENT_ID);
                      
                    }
                }
                else
                {
                    return Content(HttpStatusCode.Conflict, EMPTY_ENROLLMENTID_MSG + courseCompletion.ENROLLMENT_ID);
                }

                Cldb.Commit(CanCommit);
            }
            catch (Exception exp)
            {
                errorMsg = GetException(exp, jsonContent);
            }
            return Ok(errorMsg);
        }

        [POST("DeleteLMSCourseCompletion")]
        [ActionName("DeleteLMSCourseCompletion")]
        [HttpPost]
        public IHttpActionResult DeleteLMSCourseCompletion(HttpRequestMessage request)
        {
            var empId = this.GetHeaderDetails_String("empId");
            var content = request.Content;
            var errorMsg = string.Empty;
            var jsonContent = content.ReadAsStringAsync().Result;
            LogRequest(prefix: "LMS", content: jsonContent);
            dynamic json = jsonContent;
            LMS_COURSE_COMPLETION courseCompletion = JsonConvert.DeserializeObject<LMS_COURSE_COMPLETION>(json);

            CheckRequestIsValid(courseCompletion, empId);
            try
            {
                var exist = Cldb.LMS_COURSE_COMPLETION.GetAll().FirstOrDefault(x => x.ENROLLMENT_ID == courseCompletion.ENROLLMENT_ID && x.ISACTIVE);
                if (exist != null)
                {
                    UpdateAuditFields(exist, empId);
                    exist.ISACTIVE = false;
                    Cldb.LMS_COURSE_COMPLETION.Update(exist);
                }
                else
                {
                    return Content(HttpStatusCode.Conflict, EMPTY_ENROLLMENTID_MSG + courseCompletion.ENROLLMENT_ID);
                }
                Cldb.Commit(CanCommit);
            }
            catch (Exception exp)
            {
                errorMsg = GetException(exp, jsonContent);
            }
            return Ok(errorMsg);
        }

        private void CheckRequestIsValid<T>(T course, string empId = "") where T : class, new()
        {
            if (string.IsNullOrWhiteSpace(empId))
                empId = this.GetHeaderDetails_String("empId");

            if (course == null)
            {
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = ERROR_MSG });
            }
            if (string.IsNullOrWhiteSpace(empId))
            {
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = EMPTY_EMPLOYEEID_MSG });
            }
        }

    }
}