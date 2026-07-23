
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllIdeas' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllIdeas]
END
GO

CREATE PROCEDURE [dbo].[getAllIdeas]              
              
 @customerid varchar(max),            
 @startdate date,                  
 @enddate date              
              
 AS                  
 BEGIN                  
                 
select I.ID, I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,  
 CASE WHEN IBS.BENEFIT_TYPE_ID = 1 then 'Quantitative'    
 WHEN IBS.BENEFIT_TYPE_ID = 2 then 'Qualitative' END AS BENEFIT_TYPE,I.IDENTIFIED_DATE,max(IIP.ESTIMATED_TARGET_DATE) [TARGET_DATE]              
   ,(select top 1 frst_nm from EMP_INFO where EMP_ID = I.IDENTIFIED_BY)[Identified_By],              
  --(select top 1 frst_nm from EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [Responsible],                  
 (select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],                  
  I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]                  
 ,(select top 1 PROJ_NM from PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]                  
  from IDEA I                  
  left join IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1    
  left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID  and IIP.ISACTIVE = 1                                  
    
  join Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))                    
  where I.ISACTIVE = 1 and I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate       
  group  by I.ID,I.IDENTIFIED_DATE,I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,I.IDENTIFIED_BY,I.IDEA_IMPROVEMENT_TYPE_ID,I.IDEA_STATUS_ID,I.PROJECT_ID,IBS.BENEFIT_TYPE_ID        
 order by I.IDENTIFIED_DATE desc              
                  
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllIdeasByCustomer' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllIdeasByCustomer]
END
GO

CREATE PROCEDURE [dbo].[getAllIdeasByCustomer]            
                  
 @customerid varchar(max)                
                  
 AS                      
 BEGIN                      
                     
  select I.ID, I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,
  CASE WHEN IBS.BENEFIT_TYPE_ID = 1 then 'Quantitative'      
  WHEN IBS.BENEFIT_TYPE_ID = 2 then 'Qualitative' END AS BENEFIT_TYPE,  
  I.IDENTIFIED_DATE,max(IIP.ESTIMATED_TARGET_DATE) [TARGET_DATE]                  
  ,(select top 1 frst_nm from EMP_INFO where EMP_ID = I.IDENTIFIED_BY)[Identified_By],                  
  (select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],                      
  I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]                      
 ,(select top 1 PROJ_NM from PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]                      
  from IDEA I                      
  left join IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1        
  left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID  and IIP.ISACTIVE = 1                                      
  join Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))                        
  where I.ISACTIVE = 1 and I.IDEA_STATUS_ID = 2    
  group  by I.ID,I.IDENTIFIED_DATE,I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,I.IDENTIFIED_BY,I.IDEA_IMPROVEMENT_TYPE_ID,I.IDEA_STATUS_ID,I.PROJECT_ID,IBS.BENEFIT_TYPE_ID            
  order by I.IDENTIFIED_DATE desc     

END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getIdeasDetailbyId' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getIdeasDetailbyId]
END
GO

CREATE PROCEDURE [dbo].[getIdeasDetailbyId]          
                
 @ideaId int  
                
 AS                    
 BEGIN                    
                   
    select I.ID, I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,  
 CASE WHEN IBS.BENEFIT_TYPE_ID = 1 then 'Quantitative'      
 WHEN IBS.BENEFIT_TYPE_ID = 2 then 'Qualitative' END AS BENEFIT_TYPE,I.IDENTIFIED_DATE,max(IIP.ESTIMATED_TARGET_DATE) [TARGET_DATE]                
   ,(select top 1 frst_nm from EMP_INFO where EMP_ID = I.IDENTIFIED_BY)[Identified_By],                
  --(select top 1 frst_nm from EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [Responsible],                    
 (select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],                    
  I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]                    
 ,(select top 1 PROJ_NM from PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]                    
  from IDEA I                    
  left join IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1      
  left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID  and IIP.ISACTIVE = 1                                    
      
  join Project P ON P.PROJ_ID = I.PROJECT_ID   
  where I.ISACTIVE = 1 and I.ID = @ideaId and I.ISSUBMITTED =1  
  group  by I.ID,I.IDENTIFIED_DATE,I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,I.IDENTIFIED_BY,I.IDEA_IMPROVEMENT_TYPE_ID,I.IDEA_STATUS_ID,I.PROJECT_ID,IBS.BENEFIT_TYPE_ID          
 order by I.IDENTIFIED_DATE desc                
                    
END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_updateIdeaStatus' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_updateIdeaStatus]
END
GO


CREATE PROCEDURE [dbo].[usp_updateIdeaStatus]  

@Id varchar(max),  
@Status varchar(50)  
as  
  
Begin  
  
IF(@Status = 'Approve')  
  
Begin  
  
Update IDEA SET IDEA_STATUS_ID = 4 where ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Id,','))  
  
End  
  
ELSE IF(@Status = 'Reject')  
  
Begin  
  
Update IDEA SET IDEA_STATUS_ID = 5 where ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Id,','))  
  
End  
  select I.ID, I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,I.IDENTIFIED_DATE,IIP.ESTIMATED_TARGET_DATE [TARGET_DATE]    
   ,(select top 1 frst_nm from EMP_INFO where EMP_ID = I.IDENTIFIED_BY)[Identified_By],    
  (select top 1 frst_nm from EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [Responsible]        
 ,(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],        
  I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]        
 ,(select top 1 PROJ_NM from PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]        
  from IDEA I        
  left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID         
  --join Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))          
  where I.ISACTIVE = 1        
 order by I.IDENTIFIED_DATE desc          
   
End
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getServiceTowersMappedForProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getServiceTowersMappedForProjects]
END
GO

CREATE PROCEDURE dbo.reports_getServiceTowersMappedForProjects         
AS          
BEGIN          
SELECT       t.CUST_NM AS CUSTOMER,t.PROJ_ID AS PROJECT_ID,t.PROJ_NM AS PROJECT,ACCOUNT_OWNER,t.MANAGER,t.CSM,QA_SPOC, CASE WHEN t.CSV IS NULL THEN 'NO' ELSE 'YES' END SERVICE_TOWER_MAPPED, 
t.CSV AS SERVICE_TOWERS , t.CSM_MAIL_ID ,t.MANAGER_MAIL_ID ,t.QUALITY_PARTNER_MAIL_ID, case when QADOR is null then 'YES' else 'NO' end IS_QA_ACTIVE FROM
(select C.CUST_NM, P.PROJ_ID,PROJ_NM  ,ACCOUNT_OWNER = case when proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,     PM.FRST_NM +' '+ISNULL(PM.LAST_NM,'') AS MANAGER,
DM.FRST_NM +' '+ISNULL(DM.LAST_NM,'') AS CSM,PM.EMAIL_ID as MANAGER_MAIL_ID ,  
DM.EMAIL_ID as CSM_MAIL_ID, qa.EMAIL_ID as QUALITY_PARTNER_MAIL_ID,       QA.FRST_NM +' '+ISNULL(QA.LAST_NM,'') AS QA_SPOC,
CSV= STUFF (( SELECT   ', ' +  TITLE  FROM         PROCESS_SERVICE_AREA_PROJECT_MAPPING PSMAP (NOLOCK)         INNER JOIN PROCESS_SERVICE_AREA_NEW S (NOLOCK) 
ON PSMAP.SERVICE_AREA_ID =S.ID         WHERE p.PROJ_ID= PSMAP.PROJ_ID AND PSMAP.ISACTIVE=1 order by title           FOR XML PATH('')), 1, 2, ''), QA.DOR QADOR       from PROJECT P (NOLOCK)           
INNER JOIN CUSTOMER C (NOLOCK) ON         P.CUST_ID=C.CUST_ID     
INNER JOIN EMP_INFO PM (NOLOCK) ON         P.PROJ_PM_EMP_ID =PM.EMP_ID
INNER JOIN EMP_INFO DM (NOLOCK) ON         P.PROJ_DM_EMP_ID =DM.EMP_ID        
INNER JOIN EMP_INFO QA (NOLOCK) ON         P.QUALITY_SPOC =QA.EMP_ID
WHERE ISNULL(P.PROJ_STATUS ,'') != 'Close'   
and p.proj_id not like 'proj%'  
and ISNULL(P.PROJECT_TYPE ,'') != 'Internal' 
and proj_id not in (select proj_id from PROJECT_CONFIGURATION_DATA 
where Configuration_Setting_Id = 17 and isnull(Is_Approved,0) =1 and isnull(end_date,getdate()+1) > GETDATE() )   ) as t         
ORDER BY CUST_NM,PROJ_NM          
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProjbyCSM' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjbyCSM]
END
GO


CREATE proc getProjbyCSM     
@csmEmpId varchar(25)        
as         
begin         
SELECT p.PROJ_NM,p.START_DATE, p.END_DATE,e.EMAIL_ID AS CSM_MAIL_ID, e.FRST_NM +' '+ISNULL(e.LAST_NM,'') AS CSM, e1.FRST_NM +' '+ISNULL(e1.LAST_NM,'') AS QUALITY_PARTNER , 
 e1.EMAIL_ID as QUALITY_PARTNER_MAIL_ID ,c.CUST_NM as CUSTOMER,e2.FRST_NM +' '+ISNULL(e2.LAST_NM,'') AS Account_Manager, e2.EMAIL_ID as AM_Email_ID      
 FROM project p      
 inner join EMP_INFO e (NOLOCK) on e.EMP_ID=p.PROJ_DM_EMP_ID      
 left join EMP_INFO e1 (NOLOCK) on e1.EMP_ID=p.QUALITY_SPOC      
 inner join EMP_INFO e2 (NOLOCK) on e2.EMP_ID=p.PROJ_PM_EMP_ID      
 inner join CUSTOMER c (NOLOCK) on c.CUST_ID=p.CUST_ID      
 WHERE p.END_DATE BETWEEN GETDATE() AND DATEADD(month, 3, GETDATE()) and  p.BILL_TYPE=1  and ISNULL(P.PROJ_STATUS ,'') != 'Close'   and  p.PROJ_DM_EMP_ID=@csmEmpId    
 and  ISNULL(P.PROJECT_TYPE ,'') != 'Internal'    
 order by END_DATE       
 end
 Go


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForProjects]
END
GO

CREATE PROCEDURE [dbo].[Getcsstableforprojects]
    @startDate DATE,
    @endDate DATE,
    @projIds VARCHAR(max) = NULL
--declare  @startDate varchar(10)='2023-04-01',
--@endDate varchar(10)='2023-06-30'  -- Use BAS
AS
BEGIN
    DECLARE @startDateStr VARCHAR(50) = CONVERT(VARCHAR, Getdate(), 23),
            @endDateStr VARCHAR(50) = CONVERT(VARCHAR, Getdate(), 23)

    SELECT 0 ID,
           vw.survey_id,
           CB.cust_id CUSTOMER_ID,
           C.cust_nm AS CUSTOMER_Name,
           P.proj_id PROJECT_ID,
           P.proj_nm PROJECT_NAME,
           CT.contact_name AS RESPONDENT_NAME,
           P.PROJ_DM_EMP_ID [CSM_EMP_ID],
           P.PROJ_BUHEAD_EMP_ID [DELIVERY_HEAD_EMP_ID],
           SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],
           B.start_date AS START_DATE,
           B.end_date AS END_DATE,
           YEAR_QUARTER =
           (
               SELECT 'Q' + Cast(B.sequence AS VARCHAR) + ' ' + Cast(B.year AS VARCHAR) + '-'
                      + Cast(B.year - 1999 AS VARCHAR)
           ),
           CB.status,
           CT.contact_name + ' - ' + P.proj_nm AS [DISPLAY_TEXT],
           CB.id AS BATCH_CUSTOMER_ID,
           NULL AS BATCH_CUSTOMER_MONTHLIY_ID,
           Substring(Datename(month, Dateadd(month, Month(B.start_date), -1)), 1, 3) + ' '
           + Cast(Year(B.start_date) AS VARCHAR) [YEAR_MONTH],
           q1,
           q2,
           q3,
           q4,
           q5,
           q6,
           q7,
           q8,
           q9,
           q10,
           q11,
           q12,
           q13,
           q14,
           q15,
           CASE
               WHEN q1 IS NULL THEN
           (CASE
                WHEN q8 IS NOT NULL THEN
           (q8 + q6 + q7) / 3
                ELSE
           ((q13 + q14 + q10 + q11 + q12) / 5)
            END
           )
               ELSE
           (q1 + q2 + q3) / 3
           END AS [MIN_SCORE],
           NULL [RESPONSIVENESS],
           Q4 AS [NPS_SCORE],
           CASE
               WHEN Q1 IS NULL THEN
               (
                   SELECT TOP 1
                       RATING_DESCRIPTION
                   FROM CSS_QUESTION_REPLIES R (NOLOCK)
                   WHERE CB.ID = R.Batch_Customer_id
                         AND QUESTION_ID = 15
               )
               ELSE
           (
               SELECT TOP 1
                   RATING_DESCRIPTION
               FROM CSS_QUESTION_REPLIES R (NOLOCK)
               WHERE CB.ID = R.Batch_Customer_id
                     AND QUESTION_ID = 5
           )
           END AS [COMMENTS]
    FROM [css_batch_customers] CB (NOLOCK)
        INNER JOIN customer C (NOLOCK)
            ON C.cust_id = CB.cust_id
        INNER JOIN project P (NOLOCK)
            ON p.proj_id = CB.proj_id
        INNER JOIN css_batches B (NOLOCK)
            ON B.id = CB.batch_id
               AND B.isactive = 1
        INNER JOIN contacts CT (NOLOCK)
            ON CT.customer_id = CB.cust_id
               AND CT.contact_emailid = CB.email_id
               AND CT.isactive = 1
        INNER JOIN customer_users U (NOLOCK)
            ON U.emailid = CT.contact_emailid
        LEFT JOIN vwsurveyqratings vw (NOLOCK)
            ON vw.id = CB.survey_id
    WHERE (
              (B.start_date
          BETWEEN @startDate AND @endDate
              )
              OR (B.end_date
          BETWEEN @startDate AND @endDate
                 )
          )
          -- AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                  
          AND (
                  Isnull(@projIds, '-1') = '-1'
                  OR CB.proj_id IN (
                                       SELECT * FROM [DBO].[Fn_splitstring](@projIds, ',')
                                   )
              )
    UNION
    SELECT 0 ID,
           vw.survey_id,
           BCM.cust_id CUSTOMER_ID,
           C.cust_nm AS CUSTOMER_Name,
           p.proj_id [PROJECT_ID],
           'Premier Healthcare Solutions' [PROJECT_NAME],
           CT.contact_name AS RESPONDENT_NAME,
           P.PROJ_DM_EMP_ID [CSM_EMP_ID],
           P.PROJ_BUHEAD_EMP_ID [DELIVERY_HEAD_EMP_ID],
           SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],
           BM.start_date AS START_DATE,
           BM.end_date AS END_DATE,
           [YEAR_QUARTER] =
           (
               SELECT year_quarter
               FROM Fn_getquarter(@startDateStr, @endDateStr)
               WHERE start_date = BM.start_date
           ),
           BCM.status [STATUS],
           CT.contact_name + ' - ' + Substring(C.cust_nm, 1, 7) AS [DISPLAY_TEXT],
           NULL AS BATCH_CUSTOMER_ID,
           BCM.id AS BATCH_CUSTOMER_MONTHLIY_Id,
           Substring(Datename(month, Dateadd(month, BM.month, -1)), 1, 3) + ' ' + Cast(BM.year AS VARCHAR) [YEAR_MONTH],
           q1,
           q2,
           q3,
           q4,
           q5,
           q6,
           q7,
           q8,
           q9,
           q10,
           q11,
           q12,
           q13,
           q14,
           q15,
           CASE
               WHEN q1 IS NULL THEN
           (CASE
                WHEN q8 IS NOT NULL THEN
           (q8 + q6 + q7) / 3
                ELSE
           ((q12 + q13 + q10 + q11 + q12) / 5)
            END
           )
               ELSE
           (q1 + q2 + q3) / 3
           END AS [MIN_SCORE],
           NULL [RESPONSIVENESS],
           (
               SELECT TOP 1
                   AVG(RATING)
               FROM CSS_QUESTION_REPLIES R (NOLOCK)
               WHERE BCM.ID = R.Batch_Customer_Monthly_id
                     AND QUESTION_MODEL_ID = 4
           ) AS [NPS_SCORE],
           CASE
               WHEN Q1 IS NULL THEN
               (
                   SELECT TOP 1
                       RATING_DESCRIPTION
                   FROM CSS_QUESTION_REPLIES R (NOLOCK)
                   WHERE bcm.ID = R.Batch_Customer_Monthly_id
                         AND QUESTION_ID = 15
               )
               ELSE
           (
               SELECT TOP 1
                   RATING_DESCRIPTION
               FROM CSS_QUESTION_REPLIES R (NOLOCK)
               WHERE bcm.ID = R.Batch_Customer_Monthly_id
                     AND QUESTION_ID = 5
           )
           END AS [COMMENTS]
    FROM [css_batch_customer_monthly] BCM (NOLOCK)
        INNER JOIN bas.dbo.customer C (NOLOCK)
            ON c.cust_id = BCM.cust_id
        INNER JOIN project P (nolock)
            ON p.proj_id IN ((
                                 SELECT TOP 1
                                     proj_id
                                 FROM project (NOLOCK)
                                 WHERE cust_id = '212100001'
                                       AND (
                                               Isnull(@projIds, '-1') = '-1'
                                               OR proj_id IN (
                                                                 SELECT * FROM [DBO].[Fn_splitstring](@projIds, ',')
                                                             )
                                           )
                             )
                            )
        INNER JOIN css_batch_monthly BM (NOLOCK)
            ON BM.id = BCM.batch_monthly_id
        INNER JOIN contacts CT (NOLOCK)
            ON CT.customer_id = BCM.cust_id
               AND CT.contact_emailid = BCM.email_id
               AND CT.isactive = 1
        INNER JOIN customer_users U (NOLOCK)
            ON U.emailid = CT.contact_emailid
        LEFT JOIN vwsurveyqratings vw (NOLOCK)
            ON vw.id = bcm.survey_id
    WHERE (
              (CONVERT(VARCHAR, BM.start_date, 23)
          BETWEEN @startDate AND @endDate
              )
              OR (CONVERT(VARCHAR, BM.end_date, 23)
          BETWEEN @startDate AND @endDate
                 )
          )
    --   AND (@custIds = '-1' OR BCM.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))               
    --  AND (ISNULL(@projIds, '') = ''   OR bcm.proj_id IN (SELECT  *      FROM [DBO].[FN_SPLITSTRING](@projIds, ','))        )      
    ORDER BY cust_nm,
             proj_nm,
             year_quarter
END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getQualitySpocs' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getQualitySpocs]
END
GO


Create PROCEDURE reports_getQualitySpocs                
AS                
BEGIN                
	select   p.proj_nm, convert(varchar,p.start_date,107) as start_date,convert(varchar,p.end_date,107)as end_date,                 
HeadCount = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y'),                 
c.cust_nm,           
proj_status , p.project_type, p.BUSINESS_UNIT, p.DEPARTMENT, p.PROJECT_GROUP, p.CONTRACTING_UNIT, p.COUNTRY, p.METHODOLOGY,         
status=case when isnull(proj_status, '') != ''  then 'Active' else 'Inactive' end,           
Account_Owner = case when p.proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,        
e.frst_nm as SPOC, e1.frst_nm as PM, e3.FRST_NM as Account_Manager,e2.frst_nm as CSM, 
  Project_Configuration = STUFF( (SELECT ', ' + pcs.Setting_Name from project p1    
inner join PROJECT_CONFIGURATION_DATA pdc on pdc.Proj_Id = p.PROJ_ID    
inner join PROJECT_CONFIGURATION_SETTING pcs on pcs.Id= pdc.Configuration_Setting_Id  where p1.PROJ_ID=p.PROJ_ID  and isnull(pdc.end_date, getdate()) > GETDATE() order by 1 FOR XML PATH('')),1,1,'' )  ,
p.proj_id        
from project p inner join customer c on p.cust_id = c.cust_id                  
left join emp_info e on e.emp_id  = p.quality_spoc                  
  inner join emp_info e1 on e1.emp_id  = p.PROJ_PM_EMP_ID                  
   inner join emp_info e2 on e2.emp_id  = p.PROJ_DM_EMP_ID           
    left join emp_info e3 on e3.emp_id  = p.PROJ_AM_EMP_ID             
where isnull(proj_status, '') != 'close'            
order by c.cust_nm, p.proj_nm                
END    
GO


If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='DATA_UPDATE_NOTIFY_MAIL_TO')
Begin
Insert into CONFIGURATION_EXT values('DATA_UPDATE_NOTIFY_MAIL_TO','quality@gavstech.com,grc_team@gavstech.com','-1',null, null, 0,1,null,null,null,'105683',Getdate(),'105683',Getdate())
END
GO


--Declare @RESOURCEID int = 824
--Declare @EMPID varchar(10) = '105683'
--Declare @RescourceName varchar(250) = 'SQA Management > Update Process Model'

--if not exists(select 1 from APP_CONTROLS where RESOURCE_NAME = @RescourceName)
--begin insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
--values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) set @RESOURCEID = (select RESOURCE_ID from APP_CONTROLS where RESOURCE_NAME = @RescourceName )
--end

--if not exists(select 1 from APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
--begin insert into APP_ACCESS_CONTROLS
--(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
--EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,CREATED_DATE,UPDATED_DATE,ACCESS_LEVEL)
--values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,1,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1)
--end

--if not exists (select 1 from APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
--begin insert into APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
--values  
--(@RESOURCEID,'EDIT',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
--end
--GO




--Declare @RESOURCEID int = 825
--Declare @EMPID varchar(10) = '105683'
--Declare @RescourceName varchar(250) = 'SQA Management > Update Process Area'

--if not exists(select 1 from APP_CONTROLS where RESOURCE_NAME = @RescourceName)
--begin insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
--values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) set @RESOURCEID = (select RESOURCE_ID from APP_CONTROLS where RESOURCE_NAME = @RescourceName )
--end

--if not exists(select 1 from APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
--begin insert into APP_ACCESS_CONTROLS
--(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
--EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,CREATED_DATE,UPDATED_DATE,ACCESS_LEVEL)
--values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,1,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1)
--end

--if not exists (select 1 from APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
--begin insert into APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
--values  
--(@RESOURCEID,'EDIT',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
--end
--GO





--Declare @RESOURCEID int = 826
--Declare @EMPID varchar(10) = '105683'
--Declare @RescourceName varchar(250) = 'SQA Management > Update Service Tower'

--if not exists(select 1 from APP_CONTROLS where RESOURCE_NAME = @RescourceName)
--begin insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
--values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) set @RESOURCEID = (select RESOURCE_ID from APP_CONTROLS where RESOURCE_NAME = @RescourceName )
--end

--if not exists(select 1 from APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
--begin insert into APP_ACCESS_CONTROLS
--(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
--EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,CREATED_DATE,UPDATED_DATE,ACCESS_LEVEL)
--values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,1,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
--(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1)
--end

--if not exists (select 1 from APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
--begin insert into APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
--values  
--(@RESOURCEID,'EDIT',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
--end
--GO






Declare @RESOURCEID int = 824
Declare @EMPID varchar(10) = '105683'
Declare @RescourceName varchar(250) = 'SQA Management > Update Service Tower & Process Map'

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




IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllMappedProcessByServiceArea' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getAllMappedProcessByServiceArea
END
GO

CREATE procedure getAllMappedProcessByServiceArea
@serviceAreaId int=0
as
begin
    select distinct
        SA.id as serviceareaid,
        sa.title as serviceareaname,
        pa.title as processarea,
        pa.id as processareaid,
        p.id as processid,
        p.title as processtitle,
        p.description as processdescription
    from process p (NOLOCK)
        inner join PROCESS_SERVICE_AREA_MAPPING mp  (NOLOCK)
            on p.id = mp.process_id
        inner join PROCESS_SERVICE_AREA_NEW SA  (NOLOCK)
            on mp.SERVICE_AREA_ID = SA.id
        inner join process_area pa  (NOLOCK)
            on p.process_area_id = pa.id
    where mp.isactive = 1
          and sa.isactive = 1
          and pa.isactive = 1
          and pa.SHOW_IN_MASTER = 1
          and p.SHOW_IN_MASTER = 1
		  and (ISNULL(@serviceAreaId,0)=0 OR (@serviceAreaId= sa.ID))
    order by sa.title,
             pa.title,
             p.title
end

GO





Declare  @RESOURCEID int = 102
Declare @EMPID varchar(10) = '105683'
Declare @RescourceName varchar(250) = 'Send Quality Review Comments'

if not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)

set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end 

if not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())
end

if not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
end

GO

