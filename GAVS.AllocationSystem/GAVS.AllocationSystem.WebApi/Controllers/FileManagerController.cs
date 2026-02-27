using AttributeRouting.Helpers;
using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.WebApi.ActionFilters;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;


namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        //0.Main methond
        [GET("GetProjectFileStructure"), ActionName("GetProjectFileStructure"), HttpGet]
        public IHttpActionResult GetProjectFileStructure(string customerId, string projectId)
        {
            var empId = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empId, customerId, projectId);
            var folderData = CreateFolderData(null, null);
            List<FOLDER_DATA> projectFolders = GetFolderData(customerId, projectId);
            var folderIds = projectFolders.Select(x => x.ID);
            var files = Cldb.FILE_DATA.GetAll().Where(x => folderIds.Contains(x.FOLDER_ID) && x.ISACTIVE).ToList();
            var parent = projectFolders.FirstOrDefault(x => x.PARENT_FOLDER_ID == 0);
            if (parent == null)
                return Ok(folderData);

            folderData = CreateFolderData(parent, files.Where(x => x.FOLDER_ID == parent.ID).ToList());
            foreach (var item in projectFolders.Where(x => x.ID != parent.ID).OrderBy(x => x.ID).ToList())
            {
                var fileList = files.Where(x => x.FOLDER_ID == item.ID).ToList();
                var newFolder = CreateFolderData(item, fileList);
                TraverseAndFitFolder(folderData, newFolder);

            }
            return Ok(folderData);
        }

        //1. create folder
        [POST("CreateFolder"), ActionName("CreateFolder"), HttpPost]
        public IHttpActionResult CreateFolder([FromBody] FolderData folderData, string customerId, string projectId)
        {
            var empId = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empId, "", projectId);
            var existing = GetFolderData(customerId, projectId).FirstOrDefault(x => x.PARENT_FOLDER_ID == folderData.ParentFolderId && x.FOLDER_NAME == folderData.FolderName);
            if (existing != null)
            {
                return BadRequest($"Folder with name {folderData.FolderName} already exists in same location. Please use different folder name or create in different Folder.");
            }
            CheckNameLengthAndValidation(folderData.FolderName);
            var ety = new FOLDER_DATA
            {
                PARENT_FOLDER_ID = folderData.ParentFolderId,
                ADDED_BY = empId,
                ADDED_DATE = DateTime.Now,
                FOLDER_NAME = folderData.FolderName,
                CUSTOMER_ID = customerId,
                PROJ_ID = projectId
            };
            UpdateAuditFields(ety);
            Cldb.FOLDER_DATA.Add(ety);
            Cldb.Commit(CanCommit);
            return Ok();
        }
        //2. rename folder
        [POST("RenameFolder"), ActionName("RenameFolder"), HttpPost]
        public IHttpActionResult RenameFolder([FromBody] FolderData folderData, string customerId, string projectId, string newName)
        {
            var empId = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empId, customerId, projectId);
            var existing = GetFolderData(customerId, projectId).FirstOrDefault(x => x.ID == folderData.ID && x.FOLDER_NAME == newName);
            if (existing != null)
            {
                return BadRequest($"Folder with name {folderData.FolderName} already exists in same location. Please use different folder name or create in different Folder.");
            }
            CheckNameLengthAndValidation(newName);
            var ety = Cldb.FOLDER_DATA.GetAll().FirstOrDefault(x => x.ISACTIVE && x.PROJ_ID == projectId && x.ID == folderData.ID);
            if (ety != null)
            {
                ety.FOLDER_NAME = newName;
                UpdateAuditFields(ety);
                Cldb.FOLDER_DATA.Update(ety);
                Cldb.Commit(CanCommit);
            }
            return Ok();
        }
        //3. delete folder
        [POST("DeleteFolder"), ActionName("DeleteFolder"), HttpPost]
        public IHttpActionResult DeleteFolder([FromBody] FolderData folderData, string customerId, string projectId)
        {
            var empId = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empId, customerId, projectId);
            var ety = GetFolderData(customerId, projectId).FirstOrDefault(x => x.ID == folderData.ID);
            if (ety != null)
            {
                UpdateAuditFields(ety);
                ety.ISACTIVE = false;
                Cldb.FOLDER_DATA.Update(ety);
                Cldb.Commit(CanCommit);
            }
            return Ok();
        }
        //4. Add File
        [POST("UploadFile"), ActionName("UploadFile"), HttpPost]
        public IHttpActionResult UploadFile(int folderId, string customerId, string projectId, int? findingId = null, int? stageId = null, int? rootCauseId = null)
        {
            var empId = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empId, customerId, projectId);
            var httpRequest = HttpContext.Current.Request;
            if (httpRequest.Files.Count > 0)
            {
                for (int i = 0; i < httpRequest.Files.Count; i++)
                {
                    var postedFile = httpRequest.Files[i];

                    if (findingId.HasValue)
                    {
                        var mappedIds = Cldb.AUDIT_EVIDENCE_DATA.GetAll().Where(x => x.ISACTIVE && x.FINDING_ID == findingId.Value).Select(x => x.FILE_DATA_ID).ToList();

                        var existingInFinding = Cldb.FILE_DATA.GetAll().FirstOrDefault(x => x.ISACTIVE && mappedIds.Contains(x.ID) && x.FILE_NAME == postedFile.FileName);

                        if (existingInFinding != null)
                        {
                            return BadRequest($"File '{postedFile.FileName}' already exists for this Finding. Please use different name for the file and upload again.");
                        }
                    }
                    else
                    {
                        var existingInFolder = Cldb.FILE_DATA.GetAll().FirstOrDefault(x => x.ISACTIVE && x.FOLDER_ID == folderId && x.FILE_NAME == postedFile.FileName);

                        if (existingInFolder != null)
                        {
                            return BadRequest($"File with name {postedFile.FileName} already exists in same location. Please use different name or create in different Folder.");

                        }
                    }
                    if (!findingId.HasValue)
                    {
                        CheckNameLengthAndValidation(postedFile.FileName);
                    }


                    string ServerFileName = Guid.NewGuid().ToString();
                    string contentType = postedFile.ContentType;
                    var filePath = HttpContext.Current.Server.MapPath("~/UploadFile/" + ServerFileName);

                    postedFile.SaveAs(filePath);
                    var ety = new FILE_DATA
                    {
                        FOLDER_ID = folderId,
                        FILE_NAME = postedFile.FileName,
                        FILE_GUID = ServerFileName,
                        FILE_EXTENSION = Path.GetExtension(postedFile.FileName),
                        FILE_TYPE = contentType,
                        UPLOADED_BY = empId,
                        UPLOAD_DATE = DateTime.Now,
                    };
                    UpdateAuditFields(ety);
                    Cldb.FILE_DATA.Add(ety);
                    Cldb.Commit();
                    if (findingId.HasValue && stageId.HasValue)
                    {
                        var evidenceMapping = new AUDIT_EVIDENCE_DATA
                        {
                            FINDING_ID = findingId.Value,
                            STAGE_ID = stageId.Value,
                            FILE_DATA_ID = ety.ID,
                            ROOTCAUSE_ID = rootCauseId.Value
                        };
                        UpdateAuditFields(evidenceMapping);
                        Cldb.AUDIT_EVIDENCE_DATA.Add(evidenceMapping);
                        Cldb.Commit();
                    }
                }




            }
            return Ok();
        }
        //5. Rename File
        [POST("RenameFile"), ActionName("RenameFile"), HttpPost]
        public IHttpActionResult RenameFile([FromBody] FileData fileData, string newFilename, string customerId, string projectId)
        {
            var empId = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empId, customerId, projectId);
            CheckNameLengthAndValidation(newFilename);
            var existing = Cldb.FILE_DATA.GetAll().FirstOrDefault(x => x.ISACTIVE && x.ID == fileData.ID && x.FILE_NAME == newFilename);
            if (existing != null)
            {
                return BadRequest($"File with name {newFilename} already exists in same location. Please use different name or create in different Folder.");
            }
            var ety = Cldb.FILE_DATA.GetAll().FirstOrDefault(x => x.ID == fileData.ID);
            if (ety != null)
            {
                ety.FILE_NAME = newFilename;
                UpdateAuditFields(ety);
                Cldb.Commit(CanCommit);
            }
            return Ok();
        }
        //6. Download File
        [POST("DownloadFile"), ActionName("DownloadFile"), HttpPost]
        public HttpResponseMessage DownloadFile([FromBody] FileData fileData, string customerId, string projectId)
        {
            var empId = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empId, customerId, projectId);
            if (!string.IsNullOrWhiteSpace(fileData.FilePath) && !string.IsNullOrWhiteSpace(fileData.FileName))
            {
                string uploadfolder = ConfigurationManager.AppSettings["uploadfolder"];
                string filePath = HttpContext.Current.Server.MapPath(uploadfolder) + fileData.FilePath;

                using (MemoryStream ms = new MemoryStream())
                {
                    using (FileStream file = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                    {
                        byte[] bytes = new byte[file.Length];
                        file.Read(bytes, 0, (int)file.Length);
                        ms.Write(bytes, 0, (int)file.Length);

                        HttpResponseMessage httpResponseMessage = new HttpResponseMessage();
                        httpResponseMessage.Content = new ByteArrayContent(bytes.ToArray());
                        httpResponseMessage.Content.Headers.Add("x-filename", fileData.FileName);
                        httpResponseMessage.Content.Headers.ContentType = new MediaTypeHeaderValue(fileData.FileType);
                        httpResponseMessage.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                        httpResponseMessage.Content.Headers.ContentDisposition.FileName = fileData.FileName;
                        httpResponseMessage.StatusCode = HttpStatusCode.OK;
                        return httpResponseMessage;
                    }
                }
            }
            return this.Request.CreateResponse(HttpStatusCode.NotFound, "File not found.");

        }
        //7. delete file
        [POST("DeleteFile"), ActionName("DeleteFile"), HttpPost]
        public IHttpActionResult DeleteFile([FromBody] FileData fileData, string customerId, string projectId)
        {
            var empId = GetHeaderDetails_String("empId");
            CheckUserHasAccess(empId, customerId, projectId);
            var ety = Cldb.FILE_DATA.GetAll().FirstOrDefault(x => x.ID == fileData.ID);
            if (ety != null)
            {
                UpdateAuditFields(ety);
                ety.ISACTIVE = false;
                var evidenceMapping = Cldb.AUDIT_EVIDENCE_DATA.GetAll().FirstOrDefault(x => x.FILE_DATA_ID == fileData.ID && x.ISACTIVE);

                if (evidenceMapping != null)
                {
                    UpdateAuditFields(evidenceMapping);
                    evidenceMapping.ISACTIVE = false;
                }

                Cldb.Commit(CanCommit);
            }
            return Ok();
        }

        //8. Move file - to be implemented later

        #region Private Method
        private FolderData CreateFolderData(FOLDER_DATA folderEty, List<FILE_DATA> files)
        {
            var result = new FolderData { FolderList = new List<FolderData>(), FileList = new List<FileData>(), };
            if (folderEty == null) return result;
            result = CreateFolderData(folderEty);
            result.FolderList = new List<FolderData>();
            var fileList = new List<FileData>();
            if (files != null && files.Any())
            {
                foreach (var item in files)
                {
                    fileList.Add(CreateFileData(item));
                }
                result.FileList = fileList;
            }

            return result;
        }

        private FolderData CreateFolderData(FOLDER_DATA folderEty)
        {
            var result = new FolderData
            {
                ID = folderEty.ID,
                ParentFolderId = folderEty.PARENT_FOLDER_ID,
                FolderName = folderEty.FOLDER_NAME,
                ISACTIVE = folderEty.ISACTIVE,
                CREATED_BY = folderEty.CREATED_BY,
                CREATED_DATE = folderEty.CREATED_DATE,
                UPDATED_BY = folderEty.UPDATED_BY,
                UPDATED_DATE = folderEty.UPDATED_DATE,
                FolderList = new List<FolderData>(),
                FileList = new List<FileData>()
            };


            return result;
        }
        private FileData CreateFileData(FILE_DATA fileEty)
        {
            return new FileData
            {
                ID = fileEty.ID,

                ISACTIVE = fileEty.ISACTIVE,
                CREATED_BY = fileEty.CREATED_BY,
                CREATED_DATE = fileEty.CREATED_DATE,
                UPDATED_BY = fileEty.UPDATED_BY,
                UPDATED_DATE = fileEty.UPDATED_DATE,
                FileName = fileEty.FILE_NAME,
                FilePath = fileEty.FILE_GUID,
                FileExtension = fileEty.FILE_EXTENSION,
                FileType = fileEty.FILE_TYPE,
                FolderId = fileEty.FOLDER_ID,

            };
        }

        private void TraverseAndFitFolder(FolderData parent, FolderData child)
        {
            if (child.ParentFolderId == parent.ID)
            {
                parent.FolderList.Add(child);
                return;
            }
            if (!parent.FolderList.Any())
            {
                return;
            }
            foreach (var item in parent.FolderList)
            {
                TraverseAndFitFolder(item, child);
            }
        }

        private void CheckNameLengthAndValidation(string folderName)
        {
            if (string.IsNullOrWhiteSpace(folderName))
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = "Name is empty. Please choose valid Name." });
            //check length
            if (folderName.Length > 250)
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = "Name length should be less than 250 characters" });
            //validations
            var regexItem = new Regex("^[a-zA-Z0-9 _.&()]*$");

            if (!regexItem.IsMatch(folderName))
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = "Invalid Name - Please use Aphabets or digits only." });
        }

        private List<FOLDER_DATA> GetFolderData(string customerId, string projectId)
        {
            var projectFolders = new List<FOLDER_DATA>();
            if (!string.IsNullOrWhiteSpace(customerId) && string.IsNullOrWhiteSpace(projectId))
            {
                projectFolders = Cldb.FOLDER_DATA.GetAll().Where(x => x.CUSTOMER_ID == customerId && x.ISACTIVE).ToList();
            }
            else if (!string.IsNullOrWhiteSpace(projectId))
            {
                projectFolders = Cldb.FOLDER_DATA.GetAll().Where(x => x.PROJ_ID == projectId && x.ISACTIVE).ToList();
            }

            return projectFolders;
        }
        #endregion


        [POST("GetAuditEvidence"), ActionName("GetAuditEvidence"), HttpGet]
        public IHttpActionResult GetAuditEvidence(int findingId, int stageId, int rootCauseId)
        {
            var evidenceMappings = Cldb.AUDIT_EVIDENCE_DATA.GetAll().Where(mapping => mapping.FINDING_ID == findingId && mapping.STAGE_ID == stageId && mapping.ROOTCAUSE_ID == rootCauseId && mapping.ISACTIVE).ToList();

            var fileIds = evidenceMappings.Select(m => m.FILE_DATA_ID).ToList();

            var files = Cldb.FILE_DATA.GetAll().Where(f => fileIds.Contains(f.ID) && f.ISACTIVE).ToList();

            var result = new List<object>();

            foreach (var mapping in evidenceMappings)
            {
                var file = files.FirstOrDefault(f => f.ID == mapping.FILE_DATA_ID);

                if (file != null)
                {
                    result.Add(new 
                    {
                        ID = mapping.FILE_DATA_ID,
                        FILE_GUID = file.FILE_GUID,
                        FILE_NAME = file.FILE_NAME,
                        FILE_TYPE = file.FILE_TYPE,
                        ROOTCAUSE_ID = mapping.ROOTCAUSE_ID,
                        STAGE_ID = mapping.STAGE_ID
                    });
                }
            }

            return Ok(result);

        }


    }



}