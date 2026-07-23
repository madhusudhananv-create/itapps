IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_Migrate_project_data' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].usp_Migrate_project_data
END
GO

 
Create proc usp_Migrate_project_data          
(          
   @oldval varchar(100),          
    @newval varchar(100)          
           
)          
as          
BEGIN          
 BEGIN TRAN          
           
 insert into Proj_ID_migration_Master (ExistingId, newprojId, IsMigrated) values (@oldval  , REPLACE(@newval,'''',''),0)          
            
          
DECLARE cursor_project CURSOR          
FOR SELECT           
       existingid,           
        newprojid          
    FROM           
        Proj_ID_migration_Master where ismigrated =0;          
           
OPEN cursor_project;          
           
FETCH NEXT FROM cursor_project INTO           
    @oldval,           
    @newval;          
           
WHILE @@FETCH_STATUS = 0          
    BEGIN          
                   
   IF exists(select 1 from project )--where proj_id = @oldval)          
   BEGIN          
   IF EXISTS(select 1 from project)-- where proj_id = @newval)          
   BEGIN          
     --update project set end_date = getdate()-1 where proj_id = @oldval and end_date> getdate()            
               
   --END;          
   --ELSE          
   --BEGIN          
    update PROJMGT_TEAM set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJ_ROLE_MAP_BILLING set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update EMP_INFO_FOR_CUSTOMER set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJ_TIMESHEET set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJMGT_USERSTORY set PROJ_ID = @newval where PROJ_ID= @oldval          
    update BILLING_CYCLE set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROJECT_MILESTONE set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update RESRC_RIMBS_OTHERS set PROJ_ID = @newval where PROJ_ID= @oldval          
    update RESRC_RQST set PROJ_ID = @newval where PROJ_ID= @oldval          
    update TIMESHEET_SETTINGS set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJECT_NEW set TEMP_PROJ_ID = @newval where TEMP_PROJ_ID= @oldval          
    update PROJECT_NEW set PROJ_ID = @newval where PROJ_ID= @oldval          
    --update PROJ_RESRC_TIME_ENTRY set PROJ_ID = @newval where PROJ_ID= @oldval          
    --update PROJ_RESRC_TIME_ENTRY set BILLING_PROJ_ID = @newval where BILLING_PROJ_ID= @oldval          
    update PROJECT_COURSE_MAPPING set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    --update TEMP_CUSTOMERONBOARD set PROJ_ID = @newval where PROJ_ID= @oldval          
    update SOW_INFO set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update USER_RIGHTS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update EMP_PROJ_ROLE_MAP set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJECT_PREFERENCE set PROJ_ID = @newval where PROJ_ID= @oldval          
    --update Report_CSMUsageCompliance set PROJ_ID = @newval where PROJ_ID= @oldval          
    --update PROJ_RESOURCE set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJMGT_DEFECT set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJMGT_ITERATION set PROJ_ID = @newval where PROJ_ID= @oldval          
    update CONFIGURATION_EXT set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJMGT_RELEASE set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJ_REV set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJMGT_SUBPROJECT set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJMGT_TASK set PROJ_ID = @newval where PROJ_ID= @oldval          
    --update PROJECT set PARENT_PROJ_ID = @newval where PARENT_PROJ_ID= @oldval          
    --update PROJECT set PROJ_ID = @newval where PROJ_ID= @oldval          
          
    --csp          
    update PROJECT_PROCESS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update SQA_CHART_FILTER set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update LAST_updateD_DETAILS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROJECT_RISK set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update CUSTOMER_MOM_DETAILS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROJECT_ACTIONITEM set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update KPI set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update SUBPROJECT set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    --update PORTFOLIO_PROJECT set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROCESS_SERVICE_AREA_PROJECT_MAPPING set PROJ_ID = @newval where PROJ_ID= @oldval          
    update CSS_BATCH_CUSTOMERS set PROJ_ID = @newval where PROJ_ID= @oldval          
    update SUBPROJECT_TASK set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROJECT_ISSUE set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    --update PROJECT_BEST_PRACTICES_old set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update DASHBOARD_DETAILS set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJECT_LESSON_LEARNT set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROJECT_RAGS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    --update PROJECT_PROCESS_old set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update AUDIT_EXECUTION set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    --update PROJECT_INNOVATION_old set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update SQA_PROJECT_REPORTS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROCESS_MODEL_PROJECT_CONFIG set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROJECT_PEOPLE set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update HIGHLIGHTS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update SQA_REPORT_FILES set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update SQA_DUMP_ANALYSIS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update SQA_PROJECT_CHART_PARAMS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
                
    update PROJECT_SUCCESS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJECT_CSAT_DATA set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update CSAT_SURVEY_DATA set PROJ_ID = @newval where PROJ_ID= @oldval          
    update audit_checklist_execution_summary set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROJECT_VALUEADDS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update SQA_PROJECT_CHARTS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update TASK set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROCESS_MODEL_QUESTIONS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update CUSTOMER_PROJECTS set PROJ_ID = @newval where PROJ_ID= @oldval            
    --update SQA_REPORT_FILES_old set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PORTFOLIOS_OWNERS_PROJECT set PROJ_ID = @newval where PROJ_ID= @oldval          
    update CRISP_PROJECT_CATEGORY set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    --update portfolio_ProjectDel set PROJ_ID = @newval where PROJ_ID= @oldval          
    update PROJECT_SCOPE set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update CRISP_PROJECT_CRITERIA set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROJECT_INNOVATION set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update PROJECT_BEST_PRACTICES set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update CRISP_PROJECT_VALIDATIONS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update CRISP_SCORES_PROJECT set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update APP_ACCESS_CONTROLS set PROJ_ID = @newval where PROJ_ID= @oldval          
    update AUDIT_SCHEDULE set PROJ_ID = @newval where PROJ_ID= @oldval          
    --update PROJECT_INNOVATION_CLEANED set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    --update temptable set PROJ_ID = @newval where PROJ_ID= @oldval          
 update PROJECT_DELIVERY set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update KPI_GOALS set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    update AUDIT_CHECKLIST_PROJECT_SETUP set PROJECT_ID = @newval where PROJECT_ID= @oldval          
    --update PROJECT_CSAT_DATA_old set PROJECT_ID = @newval where PROJECT_ID= @oldval          
          
          
   END;          
   END;          
   FETCH NEXT FROM cursor_project INTO           
    @oldval,           
    @newval;          
          
    END;          
           
          
CLOSE cursor_project;          
deallocate cursor_project;          
          
update Proj_ID_migration_Master  set ismigrated =1          
commit          
END   
  
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetProjectMembersByProject' AND TYPE='P')
BEGIN
       DROP PROCEDURE GetProjectMembersByProject
END
GO

CREATE PROCEDURE GetProjectMembersByProject  
    @projectId varchar(25)  
AS  
BEGIN  
    SELECT p.PROJ_BUHEAD_EMP_ID as BUHEAD ,  
           buhead.FRST_NM AS BUHEAD_NAME,  
           p.PROJ_DM_EMP_ID as CSM,  
           dm.FRST_NM AS CSM_NAME,  
           p.PROJ_PM_EMP_ID as PM,  
           pm.FRST_NM AS PJT_MNGR_NAME,  
           p.PROJ_AM_EMP_ID AS AM,  
           am.FRST_NM AS ACNT_MNGR_NAME,  
           p.QUALITY_SPOC AS QA,  
           spoc.FRST_NM AS QSPOC_NAME  
    FROM PROJECT p  (NOLOCK)
    LEFT JOIN EMP_INFO buhead  (NOLOCK) ON buhead.emp_id = p.PROJ_BUHEAD_EMP_ID  
    LEFT JOIN EMP_INFO dm (NOLOCK) ON dm.emp_id = p.PROJ_DM_EMP_ID  
    LEFT JOIN EMP_INFO pm (NOLOCK) ON pm.emp_id = p.PROJ_PM_EMP_ID  
    LEFT JOIN EMP_INFO am (NOLOCK) ON am.emp_id = p.PROJ_AM_EMP_ID				
    LEFT JOIN EMP_INFO spoc (NOLOCK) ON spoc.emp_id = p.QUALITY_SPOC  
    WHERE p.PROJ_ID = @projectId AND  isnull(p.PROJ_STATUS,'') != 'Close'  
END

go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProjectMembersByProject' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProjectMembersByProject
END
GO

CREATE PROCEDURE getProjectMembersByProject    
    @projectId varchar(25)    
AS    
BEGIN    
    SELECT p.PROJ_BUHEAD_EMP_ID as BUHEAD ,    
           buhead.FRST_NM AS BUHEAD_NAME,    
           p.PROJ_DM_EMP_ID as CSM,    
           dm.FRST_NM AS CSM_NAME,    
           p.PROJ_PM_EMP_ID as PM,    
           pm.FRST_NM AS PJT_MNGR_NAME,    
           p.PROJ_AM_EMP_ID AS AM,    
           am.FRST_NM AS ACNT_MNGR_NAME,    
           p.QUALITY_SPOC AS QA,    
           spoc.FRST_NM AS QSPOC_NAME    
    FROM PROJECT p  (NOLOCK)  
    LEFT JOIN EMP_INFO buhead  (NOLOCK) ON buhead.emp_id = p.PROJ_BUHEAD_EMP_ID    
    LEFT JOIN EMP_INFO dm (NOLOCK) ON dm.emp_id = p.PROJ_DM_EMP_ID    
    LEFT JOIN EMP_INFO pm (NOLOCK) ON pm.emp_id = p.PROJ_PM_EMP_ID    
    LEFT JOIN EMP_INFO am (NOLOCK) ON am.emp_id = p.PROJ_AM_EMP_ID      
    LEFT JOIN EMP_INFO spoc (NOLOCK) ON spoc.emp_id = p.QUALITY_SPOC    
    WHERE p.PROJ_ID = @projectId AND  isnull(p.PROJ_STATUS,'') != 'Close'    
END

go


Declare @RESOURCEID int = 97
Declare @EMPID varchar(10) = '104864'
Declare @RescourceName varchar(250) = 'Project > Update Quality Partner'

if not exists(select 1 from APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) set @RESOURCEID = (select RESOURCE_ID from APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

if not exists(select 1 from APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,CREATED_DATE,UPDATED_DATE,ACCESS_LEVEL)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,1,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1)
end

if not exists (select 1 from APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin insert into APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'EDIT',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
end
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getQualitySpocs' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getQualitySpocs]
END
GO

CREATE PROCEDURE [dbo].[reports_getQualitySpocs]            
AS            
BEGIN            
 select p.proj_nm, convert(varchar,p.start_date,107) as start_date,convert(varchar,p.end_date,107)as end_date,           
 HeadCount = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y'),           
 c.cust_nm,     
 proj_status , p.project_type, p.BUSINESS_UNIT, p.DEPARTMENT, p.PROJECT_GROUP, p.CONTRACTING_UNIT, p.COUNTRY, p.METHODOLOGY,   
 status=case when isnull(proj_status, '') != ''  then 'Active' else 'Inactive' end,     
 Account_Owner = case when proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,  
 e.frst_nm as SPOC, e1.frst_nm as PM, e2.frst_nm as CSM         ,  
 p.proj_id  
 from project p inner join customer c on p.cust_id = c.cust_id            
 left join emp_info e on e.emp_id  = p.quality_spoc            
 inner join emp_info e1 on e1.emp_id  = p.PROJ_PM_EMP_ID            
 inner join emp_info e2 on e2.emp_id  = p.PROJ_DM_EMP_ID        
 where isnull(proj_status, '') != 'close'      
 order by c.cust_nm, p.proj_nm            
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='CONFIGURATION_EXT' AND COLUMN_NAME='UPDATED_BY' )
  BEGIN

 ALTER TABLE CONFIGURATION_EXT
ADD CREATED_BY varchar(50),
    CREATED_DATE datetime,
    UPDATED_BY varchar(50),
    UPDATED_DATE datetime;
    update CONFIGURATION_EXT set CREATED_BY = '104864' , UPDATED_BY = '104864' , CREATED_DATE= GETDATE() , UPDATED_DATE=GETDATE() WHERE CREATED_BY IS NULL OR CREATED_DATE IS NULL;


  END
GO

IF NOT EXISTS (SELECT 1 FROM PROJECT_CONFIGURATION_SETTING WHERE Setting_Name = 'SKIP INTERNAL AUDIT')
BEGIN 
Insert into PROJECT_CONFIGURATION_SETTING (Setting_Name,Setting_Type,Values_Collection,isActive,Created_Date,Created_By,Updated_Date,Updated_By,Setting_Key) 
values('SKIP INTERNAL AUDIT',3,'',1,GETDATE(),'104859',GETDATE(),'104859','SKIP_INTERNAL_AUDIT')
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getListofIssues' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].reports_getListofIssues
END
GO

Create procedure reports_getListofIssues                              
  @startDate Datetime,                            
  @endDate Datetime  ,    
  @CustomerID varchar(25)   = null                    
     
  AS                                      
  BEGIN          
        
  select C.CUST_NM ,P.PROJ_NM,I.DESCRIPTION,I.IMPACT_SUMMARY,I.BUSINESS_IMPACT,  
  I.GEO_LOCATION,I.ISSUE_TYPE,I.SEVERITY,I.ACTION_PLAN,I.ASSIGNED_TO,I.IDENTIFIED_BY,I.REPORTED_BY,  
  I.LEVEL,I.STATUS,I.COMMENTS,  
 Format(I.IDENTIFIED_DATE,'yyyy-MM-dd') IDENTIFIED_DATE ,      
 Format(I.TARGET_DATE,'yyyy-MM-dd') TARGET_DATE,      
 Format(I.ISSUE_RESOLVED_DATE,'yyyy-MM-dd') ISSUE_RESOLVED_DATE     
     
 from PROJECT_ISSUE I  
 join PROJECT P on  P.PROJ_ID = I.PROJECT_ID        
 join CUSTOMER C on C.CUST_ID = P.CUST_ID                             
   
 where I.TARGET_DATE between @startDate and @endDate and (isnull( @CustomerID ,'')=''  or C.CUST_ID = @CustomerID) and I.ISACTIVE=1
  order by C.CUST_NM,P.PROJ_NM   
 END   


 IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='[getAllProjectsNameForAPortfolioNew]' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllProjectsNameForAPortfolioNew]
END
GO

Create PROCEDURE getAllProjectsNameForAPortfolioNew        
 @PortfolioId integer        
 AS        
 BEGIN             
   select PR.PROJ_ID,PR.PROJ_NM from PROJECT PR        
   inner join PORTFOLIO_PROJECT PP on PP.PROJ_ID = PR.PROJ_ID        
   where PP.PORTFOLIO_ID = @PortfolioId   and ISNULL(PR.proj_status,'')!='close'
 END
 Go 

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='[getAllAccounts]' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllAccounts]
END
GO

Create PROCEDURE  getAllAccounts
  AS                                  
  BEGIN        
  select  '-1' as CUST_ID ,'All' as CUST_NM, 1 as SORT_ORDER    
  union    
  select  '-2' as CUST_ID,'Top 10 Accounts' as CUST_NM,2 as SORT_ORDER    
  union    
  select  '-3' as CUST_ID,'All Accounts Except Top 10 Accounts' as CUST_NM,3 as SORT_ORDER    
   union    
  select  C.CUST_ID,C.CUST_NM , 4 as SORT_ORDER from CUSTOMER C where c.CUST_ID in (select  distinct P.CUST_ID from PROJECT P where ISNULL(P.PROJ_STATUS,'') <> 'Close')      
  order by SORT_ORDER,CUST_NM    
End  


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAppreciationDetails' AND TYPE='P')
BEGIN
 DROP PROCEDURE getAppreciationDetails          
END
GO


CREATE PROCEDURE [dbo].[getAppreciationDetails]     
@projIds VARCHAR(MAX)                  
  AS                  
  BEGIN                  
                
    SELECT DISTINCT A.ID,P.CUST_ID AS CUST_ID,     
    P.PROJ_ID, P.PROJ_NM, PP.PORTFOLIO_ID, PF.TITLE AS PORTFOLIO_NAME,     
    A.APPRECIATED_BY,A.COMMENTS,A.RECIPIENT,E.FRST_NM as RECIPIENT_NM,A.DESIGNATION,    
    A.RECEIVED_DATE,A.CREATED_BY,A.CREATED_DATE,A.UPDATED_BY,A.UPDATED_DATE,A.ISACTIVE    
    FROM [APPRECIATION] A     
    INNER JOIN BAS.DBO.PROJECT P  ON a.PROJ_ID = p.PROJ_ID     
 AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,','))  AND A.ISACTIVE = 1  
  LEFT OUTER join BAS..EMP_INFO E on E.EMP_ID = A.RECIPIENT           
    LEFT OUTER JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJ_ID                  
    LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID     
    ORDER BY A.RECEIVED_DATE desc, proj_nm             
 END  
GO