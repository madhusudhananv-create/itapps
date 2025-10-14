 

ALTER view [dbo].[VW_PROJECT_ACTIVE] 
as
select PROJ_ID,PROJ_NM,  START_DATE, END_DATE, PROJ_BUHEAD_EMP_ID,
PROJ_DM_EMP_ID,
PROJ_PM_EMP_ID,
PROJ_AM_EMP_ID,
CUST_ID,
PROJ_ALIAS_NM,
QUALITY_SPOC, PARENT_PROJ_ID,DP_ID,
PROJ_STATUS from project where isnull(proj_status,'') !='close' and cust_id not in ('202100062','202100091')

GO

IF EXISTS(Select 1 from sys.objects where name ='usp_get_projectIds' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_get_projectIds ] 
END

GO

CREATE PROCEDURE [dbo].[usp_get_projectIds ]             
           
@EmpID varchar(50) ,                                              
@CustomerId varchar(100)='',        
@ProjectID VARCHAR(100)=''                                              
          
 -- Add the parameters for the stored procedure here                                              
AS                                              
BEGIN                                              
          
 -- SET NOCOUNT ON added to prevent extra result sets from                                              
 -- interfering with SELECT statements.                                              
 SET NOCOUNT ON;                                 
                           
         declare @superAdmin bit =0 ;        
 declare @csmTitle int;      
 declare @allProjectsForCustomer bit =0;    
                                 
  select @csmTitle = CSM_TITLE_ID, @superAdmin= SuperAdmin from VW_EMP_INFO_Active where emp_id = @empid                                  
      
                             
       
  if(@CSMTitle = 6 or @csmtitle = 1 or @csmtitle =2 or @csmtitle =4 or @csmtitle =9 or  @csmtitle =7)                                      
  BEGIN                                      
                                          
   set @allProjectsForCustomer =1                                      
  END                                      
                                     
  if(@superAdmin =1 )    
  BEGIN    
       
  SELECT P .PROJ_ID, P .PROJ_NM, '' , C.CUST_ID, C.CUST_NM                                       
  FROM VW_PROJECT_ACTIVE P        
  INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID          
  where (isnull(@customerId,'') ='' or @customerId = c.cust_id)     
      
  END    
                                              
    ELSE IF @ProjectID=''                                              
     BEGIN                                              
                                                
             
       SELECT P .PROJ_ID, P .PROJ_NM, '' , C.CUST_ID, C.CUST_NM                                         
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                               
                                  
     ON       ((@allProjectsForCustomer = 1 and pr.cust_id = p.cust_id) or P.PROJ_ID=PR.PROJ_ID   )       AND PR.EMP_ID= @EmpID                                               
                                             
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID    and c.cust_id !='201100010'                                         
                                             
      WHERE PR.END_DATE >= GETDATE()  and (isnull(@customerId,'') ='' or @customerId = c.cust_id)    --and isnull(p.proj_status,'' ) <>'close' and  P.CUST_ID not in (  '202100062','202100091' )                                
       --and P.PARENT_PROJ_ID = P.PROJ_ID          
    and  (@allProjectsForCustomer = 0    or c.CUST_ID in (select c1.cust_id from customer c1 inner join VW_PROJECT_ACTIVE p1 on c1.CUST_ID = p1.CUST_ID               
    inner join VW_PROJ_RESOURCE_ACTIVE pr1 on p1.proj_id = pr1.PROJ_ID and pr1.END_DATE > getdate()    and   pr1.EMP_ID = @empid  )       )                                
       --GROUP BY P.PROJ_ID, P.PROJ_NM                                          
                              
                                         
   union                                        
                                                 
       SELECT P.PROJ_ID, P.PROJ_NM ,'' , C.CUST_ID, C.CUST_NM                                              
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                               
       ON  P.PROJ_ID=PR.PROJ_ID      AND PR.EMP_ID= @EmpID                                               
                                   
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID     and c.cust_id ='201100010'                                         
       --INNER JOIN VW_PROJECT_ACTIVE PP ON P.PARENT_PROJ_ID = PP.PROJ_ID                                              
       WHERE PR.END_DATE >= GETDATE() -1    and (isnull(@customerId,'') ='' or @customerId = c.cust_id) --and isnull(p.proj_status,'' ) <>'close'           and  P.CUST_ID not in (  '202100062','202100091' )                                
       --GROUP BY PP.PROJ_ID, PP.PROJ_NM                                            
                                                   
          union                             
     SELECT PP.PROJ_ID, PP.PROJ_NM,'' , C.CUST_ID, C.CUST_NM                         
                       
       FROM project Pp  INNER JOIN CUSTOMER C on C.CUST_ID = Pp.CUST_ID                                    
    where @allProjectsForCustomer = 1 --and   PP.PARENT_PROJ_ID = PP.PROJ_ID           
 --and  PP.END_DATE >= GETDATE() -1    -- and isnull(pp.proj_status,'' ) <>'close' and  pP.CUST_ID not in ('0', '201100010', '202100062','202100091' )                            
  and ( pp.PROJ_AM_EMP_ID =   @EmpID or pp.PROJ_BUHEAD_EMP_ID = @EmpID or pp.PROJ_DM_EMP_ID = @EmpID or pp.PROJ_PM_EMP_ID =@EmpID or pp.QUALITY_SPOC = @EmpID
  or pp.DP_ID = @EmpID)                                      
  and (isnull(@customerId,'') ='' or @customerId = c.cust_id)        
                                                         
                                              
   END              
    ELSE                                            
     BEGIN                                            
      SELECT DISTINCT P.PROJ_ID, P.PROJ_NM,'' FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                             
      ON P.PROJ_ID=PR.PROJ_ID                                             
      AND (PR.EMP_ID=@EmpID                                             
      OR P.PROJ_BUHEAD_EMP_ID=@EmpID                                             
      OR P.PROJ_DM_EMP_ID=@EmpID                                             
      OR P.PROJ_PM_EMP_ID=@EmpID                                             
      OR PR.PROJ_RM_EMP_ID=@EmpID                                             
      OR PR.PROJ_REVIEWER_EMP_ID=@EmpID
	  OR P.DP_ID = @EmpID) AND P.PROJ_ID=@ProjectID                                            
      INNER JOIN (SELECT PROJ_ID,EMP_ID,MAX(PROJ_RESRC_ID)PROJ_RESRC_ID FROM VW_PROJ_RESOURCE_ACTIVE GROUP BY PROJ_ID,EMP_ID) MPR                                            
ON PR.PROJ_RESRC_ID=MPR.PROJ_RESRC_ID                                             
      GROUP BY P.PROJ_ID, P.PROJ_NM, p.QUALITY_SPOC                                            
                                     
   END                                                     
                                     
END 
GO
IF EXISTS(Select 1 from sys.objects where name ='usp_get_project_new' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_get_project_new ] 
END

GO
  
CREATE PROCEDURE [dbo].[usp_get_project_new ]                                    
@EmpID varchar(50),                                    
@ProjectID VARCHAR(20)=''                                    
 -- Add the parameters for the stored procedure here                                    
AS                                    
BEGIN                                    
 -- SET NOCOUNT ON added to prevent extra result sets from                                    
 -- interfering with SELECT statements.                                    
 SET NOCOUNT ON;                       
                 
           
            declare @superAdmin bit =0 ;    
 declare @csmTitle int;  
 declare @allProjectsForCustomer bit =0;
                             
  select @csmTitle = CSM_TITLE_ID, @superAdmin= SuperAdmin from VW_EMP_INFO_Active where emp_id = @empid                              

  if(@superAdmin =1)
  BEGIN 
 ;with cte as 
 (
 SELECT P .PROJ_ID, P .PROJ_NM , C.CUST_ID, C.CUST_NM                                 
       FROM VW_PROJECT_ACTIVE P  
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID    )
	   select distinct cust_id, cust_nm,'' from cte
  end

 Else
 
                            
   BEGIN
  if(@CSMTitle = 6 or @csmtitle = 1 or @csmtitle =2 or @csmtitle =4 or @csmtitle =9 or  @csmtitle =7)                            
  BEGIN                            
                                
   set @allProjectsForCustomer =1                            
  END                            
                                  
    IF @ProjectID=''                                    
     BEGIN                                    
                                      
      SELECT   CUST_ID, CUST_NM, ''     FROM                                     
      (                                    
       SELECT P .PROJ_ID, P .PROJ_NM,P .PROJ_ALIAS_NM, '' BILLING_PROJ_ID, '' BILLING_PROJ_NM, MAX(PR.BILL_FLG+0) BILL_FLG, P.CUST_ID, C.CUST_NM, '' UPDATED_DATE, p.QUALITY_SPOC                                        
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                     
                        
     ON       ((@allProjectsForCustomer = 1 and pr.cust_id = p.cust_id) or P.PROJ_ID=PR.PROJ_ID   )       AND PR.EMP_ID= @EmpID                                     
                                   
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID       and c.cust_id !='201100010'                               
                                   
      WHERE PR.END_DATE >= GETDATE() -1     --and isnull(p.proj_status,'' ) <>'close' and  P.CUST_ID not in (  '202100062','202100091' )                      
       --and P.PARENT_PROJ_ID = P.PROJ_ID    
    and  (@allProjectsForCustomer =0   or c.cust_id ='201100010' or c.CUST_ID in (select c1.cust_id from customer c1 inner join VW_PROJECT_ACTIVE p1 on c1.CUST_ID = p1.CUST_ID   
	inner join VW_PROJ_RESOURCE_ACTIVE pr1 on p1.proj_id = pr1.PROJ_ID and pr1.END_DATE > getdate() -1  and   pr1.EMP_ID = @empid )       )                      
       GROUP BY P.PROJ_ID, P.PROJ_NM, P.PROJ_ALIAS_NM, P.PROJ_ID, P.PROJ_NM,  P.CUST_ID, C.CUST_NM , p.QUALITY_SPOC                                     
      ) TBL                                     
      GROUP BY PROJ_ID, PROJ_NM, PROJ_ALIAS_NM, BILLING_PROJ_ID, BILLING_PROJ_NM,  CUST_ID, CUST_NM, UPDATED_DATE  , QUALITY_SPOC                             
                               
   union                              
     SELECT   CUST_ID, CUST_NM, ''    FROM                                     
      (                                    
       SELECT P.PROJ_ID, P.PROJ_NM,P.PROJ_ALIAS_NM, '' BILLING_PROJ_ID, '' BILLING_PROJ_NM, MAX(PR.BILL_FLG+0) BILL_FLG, P.CUST_ID, C.CUST_NM, '' UPDATED_DATE, p.QUALITY_SPOC                                        
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                     
       ON  P.PROJ_ID=PR.PROJ_ID                                
       AND PR.EMP_ID= @EmpID                                     
                         
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID     and c.cust_id ='201100010'                               
       --INNER JOIN VW_PROJECT_ACTIVE PP ON P.PARENT_PROJ_ID = PP.PROJ_ID                            
       WHERE PR.END_DATE >= GETDATE() -1     --and isnull(p.proj_status,'' ) <>'close'           and  P.CUST_ID not in (  '202100062','202100091' )                      
       GROUP BY P.PROJ_ID, P.PROJ_NM, P.PROJ_ALIAS_NM, P.PROJ_ID, P.PROJ_NM,  P.CUST_ID, C.CUST_NM , p.QUALITY_SPOC                                     
      ) TBL                                     
      GROUP BY PROJ_ID, PROJ_NM, PROJ_ALIAS_NM, BILLING_PROJ_ID, BILLING_PROJ_NM,  CUST_ID, CUST_NM, UPDATED_DATE  , QUALITY_SPOC                                     
          union                   
     SELECT  Pp.CUST_ID, C.CUST_NM, ''                     
                                
       FROM VW_PROJECT_ACTIVE Pp  INNER JOIN CUSTOMER C on C.CUST_ID = Pp.CUST_ID                          
    where @allProjectsForCustomer = 1 --and   PP.PARENT_PROJ_ID = PP.PROJ_ID     
 and  PP.END_DATE >= GETDATE() -1    -- and isnull(pp.proj_status,'' ) <>'close' and  pP.CUST_ID not in ('0', '201100010', '202100062','202100091' )                  
    and ( pp.PROJ_AM_EMP_ID =   @EmpID or pp.PROJ_BUHEAD_EMP_ID = @EmpID or pp.PROJ_DM_EMP_ID = @EmpID or pp.PROJ_PM_EMP_ID =@EmpID
	 OR pp.DP_ID=@EmpID)                            
                                               
     END                                    
    ELSE                                    
     BEGIN                                    
      SELECT DISTINCT P.PROJ_ID,P.PARENT_PROJ_ID,P.PROJ_NM,'' UPDATED_DATE, QUALITY_SPOC FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                     
      ON P.PROJ_ID=PR.PROJ_ID                                     
      AND (PR.EMP_ID=@EmpID                                     
      OR P.PROJ_BUHEAD_EMP_ID=@EmpID                                     
      OR P.PROJ_DM_EMP_ID=@EmpID                                     
      OR P.PROJ_PM_EMP_ID=@EmpID                                     
      OR PR.PROJ_RM_EMP_ID=@EmpID                                     
      OR PR.PROJ_REVIEWER_EMP_ID=@EmpID
	  OR p.DP_ID=@EmpID) AND P.PROJ_ID=@ProjectID                                    
      INNER JOIN (SELECT PROJ_ID,EMP_ID,MAX(PROJ_RESRC_ID)PROJ_RESRC_ID FROM VW_PROJ_RESOURCE_ACTIVE GROUP BY PROJ_ID,EMP_ID) MPR                                    
ON PR.PROJ_RESRC_ID=MPR.PROJ_RESRC_ID                                     
      GROUP BY P.PROJ_ID,P.PARENT_PROJ_ID,P.PROJ_NM, p.QUALITY_SPOC                                    
                             
   END                                      
                                    
                           
END 
END
GO


 IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Combined_Aggregate' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined_Aggregate] 
END

GO

create procedure  [dbo].[reports_CSAT_Combined_Aggregate] 
@StartDate date,                     
@EndDate date                        
as

DECLARE @table table( 
[CUSTOMER NAME] varchar(4000),
[PROJECT NAME]	varchar(4000),
[TYPE OF ACCOUNT]	 varchar(4000),
[RESPONDENT NAME]	 varchar(4000),
EMAIL_ID	 varchar(4000),
[CSAT SENT DATE]	datetime ,
[CSAT RECEIVED DATE]	datetime null,
IS_VERIFIED	bit,
YEAR_QUARTER	 varchar(4000),
PORTFOLIO	varchar(4000),
QUESTION_CATEGORY	varchar(4000),
PERSPECTIVE	varchar(4000),
RATING	int ,
RATING_DESCRIPTION varchar(4000),
PROJECT_MANAGER	 varchar(4000),
[CUSTOMER SUCCESS MANAGER]	varchar(4000),
[ACCOUNT MANAGER]	varchar(4000),
[BU HEAD]	 varchar(4000),
[CSAT SPOC]	 varchar(4000),
PROJ_STATUS	 varchar(4000),
[BUSSINESS UNIT]	varchar(4000),
[CONTRACTING UNIT]	varchar(4000),
METHODOLOGY	varchar(4000),
DEPARTMENT	varchar(4000),
[PROJECT GROUP]	varchar(4000),
[PROJECT TYPE]	varchar(4000),
COUNTRY	varchar(4000),
[ACTION ITEM STATUS]	varchar(4000),
--[ACTION ITEM DESCRIPTION]	varchar(4000),
[ROOT CAUSE] varchar(4000),
[CORRECTIVE ACTION PLAN] varchar(4000),
[PREVENTIVE ACTION PLAN] varchar(4000),
[VOICE OF CUSTOMER URL]	varchar(4000),
ACTION_PLAN_SUBMISSION_TARGET_DATE	datetime null,
ACTION_PLAN_SUBMISSION_ACTUAL_DATE	datetime null,
ACTION_PLAN_COMPLETION_TARGET_DATE	datetime null,
ACTION_PLAN_COMPLETION_ACTUAL_DATE	datetime null,
PROJ_ID	varchar(4000),
CUSTOMER_ID varchar(4000) 
)

insert into @table 
exec  reports_CSAT_Combined @StartDate, @EndDate

select  [CUSTOMER NAME]  ,
 

[PROJECT NAME],
[TYPE OF ACCOUNT]	  ,

[CUSTOMER SUCCESS MANAGER], 
[ACCOUNT MANAGER]	 ,
[BU HEAD]	  ,
PROJ_STATUS	  ,
[BUSSINESS UNIT]	 ,
[CONTRACTING UNIT]	 ,
METHODOLOGY	 ,
DEPARTMENT	 ,
[PROJECT GROUP]	 ,
[PROJECT TYPE]	 ,
COUNTRY	 ,

YEAR_QUARTER, Criteria_AVG = (select avg(t1.rating) from @table t1 where t1.[PROJECT NAME] = t.[PROJECT NAME] and t1.YEAR_QUARTER = t.YEAR_QUARTER and t1.QUESTION_CATEGORY = 'criteria' ),
NPS_AVG = (select avg(t1.rating) from @table t1 where t1.[PROJECT NAME] = t.[PROJECT NAME] and t1.YEAR_QUARTER = t.YEAR_QUARTER and t1.QUESTION_CATEGORY = 'nps' ) from @table t
group by  [CUSTOMER NAME]  ,
 

[PROJECT NAME],
[TYPE OF ACCOUNT]	  ,
YEAR_QUARTER,
[CUSTOMER SUCCESS MANAGER], 
[ACCOUNT MANAGER]	 ,
[BU HEAD]	  ,
PROJ_STATUS	  ,
[BUSSINESS UNIT]	 ,
[CONTRACTING UNIT]	 ,
METHODOLOGY	 ,
DEPARTMENT	 ,
[PROJECT GROUP]	 ,
[PROJECT TYPE]	 ,
COUNTRY	 
 
GO






update CONTACTS set CONTACT_NAME = 'Greg Jensen' where CONTACT_EMAILID='Greg.Jensen@flyfrontier.com'
update customer_users set DISPLAY_NAME='Greg Jensen' where emailid='Greg.Jensen@flyfrontier.com'
update CSS_BATCH_CUSTOMERS set DISPLAY_NAME='Greg Jensen' where email_id='Greg.Jensen@flyfrontier.com'


--------------------------Action Item Status Change and Declaration Changes-------------------------------- BEGIN -----------------------------------------------------------------------


IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PROJECT_ACTIONITEM' AND COLUMN_NAME IN ('ACTUAL_CUST_DATE','PLANNED_CUST_DATE','CLOSURE_ACTUAL_CUST_DATE','ACTUAL_PLAN_DECLARATION','PLANNED_DECLARATION','CLOSURE_ACKNOWLEDGE')) 
BEGIN
ALTER TABLE PROJECT_ACTIONITEM ADD 
    ACTUAL_CUST_DATE DATETIME NULL,
    PLANNED_CUST_DATE DATETIME NULL,
    CLOSURE_ACTUAL_CUST_DATE DATETIME NULL,
    ACTUAL_PLAN_DECLARATION BIT NULL,
    PLANNED_DECLARATION BIT NULL,
    CLOSURE_ACKNOWLEDGE BIT NULL;
END

GO

update PROJECT_ACTIONITEM set STATUS='In Progress',UPDATED_DATE=GETDATE(),UPDATED_BY='104744' where STATUS in('Planned','Started') 
update PROJECT_ACTIONITEM set STATUS='Open',UPDATED_DATE=GETDATE(),UPDATED_BY='104744' where STATUS in('Identified') 

GO

 UPDATE project_actionitem SET TARGET_DATE = DATEADD(day, 
    CASE WHEN DATEPART(weekday, IDENTIFIED_DATE) = 1 THEN 14  
        WHEN DATEPART(weekday, IDENTIFIED_DATE) = 7 THEN 12  
        ELSE 10 + (2 * ((DATEPART(weekday, IDENTIFIED_DATE) + 9) / 7))
    END, IDENTIFIED_DATE) where (SOURCE like 'Customer Success Survey%' or source ='CSS' or SOURCE='CSAT')
		and status !='Completed'
GO

IF EXISTS(Select 1 from sys.objects where name ='getActionItemsViewDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getActionItemsViewDetails] 
END

GO
CREATE PROCEDURE [dbo].[getActionItemsViewDetails]                    
    
@PROJIDS VARCHAR(MAX)                    
      
AS   
  
BEGIN  

SELECT DISTINCT P.CUST_ID AS CUST_ID, [PROJECT_ID] AS PROJ_ID, P.PROJ_NM, PP.PORTFOLIO_ID, isnull(A.PORTFOLIO, '') AS PORTFOLIO_NAME, A.ORIGINAL_DESCRIPTION,      
A.ID AS ACTION_ITEM_ID, A.RAG, A.DESCRIPTION as [DESCRIPTION], A.SOURCE,   
SOURCE_DESCRIPTION = CASE WHEN CHARINDEX(',', A.SOURCE_DESCRIPTION, CHARINDEX(',', A.SOURCE_DESCRIPTION) + 1) > 0   
            THEN LEFT(A.SOURCE_DESCRIPTION, CHARINDEX(',', A.SOURCE_DESCRIPTION, CHARINDEX(',', A.SOURCE_DESCRIPTION) + 1) - 1)  
            ELSE A.SOURCE_DESCRIPTION END,   
A.OWNER, A.IDENTIFIED_DATE, A.TARGET_DATE, A.STATUS,    
A.PLANNED_TARGET_DATE, A.PLANNED_ACTUAL_DATE, A.BATCH_CUSTOMER_ID, A.BATCH_CUSTOMER_MONTHLY_ID,A.ROOT_CAUSE,  
A.PRIORITY, A.COMPLETION_DATE, A.COMMENTS, A.CREATED_DATE, A.CREATED_BY, A.UPDATED_BY, A.UPDATED_DATE,                      
                      
CASE WHEN (A.TARGET_DATE < GETDATE() AND A.STATUS  IN  ('In Progress')) THEN 'PAST_DUE_DATE'                
WHEN  (A.TARGET_DATE >= GETDATE() AND A.STATUS  IN   ('In Progress')) THEN 'DUE_FOR_CLOSURE'                           
END  AS STATUS_TYPE, A.ISACTIVE,A.PREVENTIVE_ACTION_PLAN,cq.PERSPECTIVE--,sa.CSS_REFERENCE  
,sa.SCORE,sa.CUSTOMER_REMARKS, A.ACTUAL_CUST_DATE, a.PLANNED_CUST_DATE, A.CLOSURE_ACTUAL_CUST_DATE, A.ACTUAL_PLAN_DECLARATION, A.PLANNED_DECLARATION, A.CLOSURE_ACKNOWLEDGE
  
FROM PROJECT_ACTIONITEM A                                        
INNER JOIN PROJECT P ON a.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,',')) AND A.ISACTIVE = 1  
CROSS APPLY fn_splitActionItemCssReference(A.CSS_REFERENCE) sa
inner join CSS_BATCH_CUSTOMERS CB on CB.ID = A.BATCH_CUSTOMER_ID    
inner join CSS_QUESTION_REPLIES CQ on cq.BATCH_CUSTOMER_ID=cb.id and sa.CSS_REFERENCE=cq.QUESTION
inner join CSS_QUESTION_MASTER cm on cm.id=cq.QUESTION_ID
LEFT OUTER JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJECT_ID                      
LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID  
where rating between 1 and 3 and cm.QUESTION_CATEGORY ='Criteria' and cm.ISACTIVE=1
ORDER BY A.IDENTIFIED_DATE desc   
      
 
      
END 
GO


IF EXISTS(Select 1 from sys.objects where name ='getActionItemsStatus' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getActionItemsStatus] 
END
GO


CREATE PROCEDURE [dbo].[getActionItemsStatus]                  
  AS                  
  BEGIN                  
                  
  select distinct p.cust_id AS CUST_ID, [PROJECT_ID] AS PROJ_ID, p.PROJ_NM, pp.PORTFOLIO_ID, pf.TITLE AS PORTFOLIO_NAME, A.ID As ACTION_ITEM_ID, A.RAG, A.DESCRIPTION, A.SOURCE, A.OWNER, A.IDENTIFIED_DATE, A.TARGET_DATE, A.STATUS,                  
  case when A.PRIORITY = 'high' then 'High'        
  when A.Priority ='normal' then 'Medium'       
  else a.PRIORITY  end as PRIORITY, A.COMPLETION_DATE, A.COMMENTS, A.CREATED_DATE, A.CREATED_BY, A.UPDATED_BY, A.UPDATED_DATE,                  
               
 CASE WHEN (A.TARGET_DATE < GETDATE() AND A.STATUS  IN ('In Progress')) THEN 'PAST_DUE_DATE'              
   WHEN  (A.TARGET_DATE >= GETDATE() AND A.STATUS  IN ('In Progress')) THEN 'DUE_FOR_CLOSURE'              
              
   END AS STATUS_TYPE, A.ISACTIVE              
   FROM PROJECT_ACTIONITEM A                  
                  
  inner join project p  on p.proj_id =  A.PROJECT_ID  and A.STATUS != 'Closed' and A.ISACTIVE = 1  and  isnull(p.PROJ_STATUS,'') != 'Close'        
  LEFT OUTER JOIN portfolio_project pp on pp.proj_id =  A.PROJECT_ID                  
  left outer join PORTFOLIO pf on pf.ID = pp.PORTFOLIO_ID         
      
                
  order by CUST_ID,  PROJ_NM                  
                  
  END
  GO


  IF EXISTS(Select 1 from sys.objects where name ='getActionItemsForProjects' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getActionItemsForProjects] 
END
GO
  CREATE PROCEDURE [dbo].[getActionItemsForProjects]        
@startDate Date,
@EndDate Date,
@PROJIDS VARCHAR(MAX)  
  AS            
  BEGIN            
          
  SELECT P.CUST_ID AS CUST_ID, [PROJECT_ID] AS PROJ_ID, P.PROJ_NM, PP.PORTFOLIO_ID, PF.TITLE AS PORTFOLIO_NAME, A.ID AS ACTION_ITEM_ID, A.RAG, A.DESCRIPTION, A.SOURCE, A.OWNER, A.IDENTIFIED_DATE, A.TARGET_DATE, A.STATUS,            
  A.PRIORITY, A.COMPLETION_DATE, A.COMMENTS, A.CREATED_DATE, A.CREATED_BY, A.UPDATED_BY, A.UPDATED_DATE,            
            
   CASE WHEN (A.TARGET_DATE < GETDATE() AND A.STATUS  IN ('In Progress')) THEN 'PAST_DUE_DATE'      
		WHEN  (A.TARGET_DATE >= GETDATE() AND A.STATUS  IN ('In Progress')) THEN 'DUE_FOR_CLOSURE'      
      
   END  AS STATUS_TYPE, A.ISACTIVE            
    FROM [PROJECT_ACTIONITEM] A  (NOLOCK) 
    INNER JOIN PROJECT P  (NOLOCK) ON a.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))  AND A.ISACTIVE = 1       
    LEFT OUTER JOIN PORTFOLIO_PROJECT PP (NOLOCK) ON PP.PROJ_ID =  A.PROJECT_ID            
    LEFT OUTER JOIN PORTFOLIO PF  (NOLOCK) ON PF.ID = PP.PORTFOLIO_ID            
  WHERE A.IDENTIFIED_DATE BETWEEN @startDate AND @EndDate
  OR  A.CREATED_DATE BETWEEN @startDate AND @EndDate
  OR  A.COMPLETION_DATE BETWEEN @startDate AND @EndDate
    ORDER BY A.IDENTIFIED_DATE desc      
 END 
 GO

  IF EXISTS(Select 1 from sys.objects where name ='getCSSTableForPeriod1' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForPeriod1] 
END
GO

CREATE PROCEDURE [dbo].[getCSSTableForPeriod1]              
            
@startDate varchar(10),                                            
@endDate varchar(10),                                            
@custIds varchar(max)='-1',                
@csmIds varchar(max)='-1',    
@frequency varchar(100) ='both'    
            
AS              
BEGIN                                          
                                                   
;With NonPremierAccounts AS (                                                  
                                                  
select CB.CUST_ID , P.PROJ_ID,P.PROJ_NM, isnull( CT.CONTACT_NAME, cb.DISPLAY_NAME) as CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='{SUBSTITUE_URL}/CustomerSuccessSurvey/'+ r1.SURVEY_ID,                            
ActionplanURL ='{SUBSTITUE_URL}/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20)) +'/'+P.PROJ_ID+'/true'  , r1.CREATED_DATE, r1.batch_customer_id,RN = row_number() OVER(partition by ct.contact_name, p.proj_id ORDER BY cb.id desc, r1.rating)           
  
,    
case when b.frequency ='Quarterly' then ' (Q)' else ' (H)' end as Frequency    
                    
FROM [CSS_BATCH_CUSTOMERS] CB  (NOLOCK)                            
INNER JOIN PROJECT P (NOLOCK) on p.proj_id = CB.proj_id                              
INNER JOIN CSS_BATCHES B (NOLOCK) ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1                              
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and PERSPECTIVE = 'Overall Experience' and R1.ISACTIVE = 1                              
LEFT JOIN CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1                              
LEFT join CSS_QUESTION_REPLIES r2 (NOLOCK) on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1                              
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )                              
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                                       
AND (@csmIds ='-1' OR p.PROJ_DM_EMP_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))                          
AND (@frequency ='both' or b.frequency = @frequency)    
),                                               
                                                  
PremierAccount As (                                                  
select CB.CUST_ID , 'Premier' as CUST_NM, P.PROJ_ID, P.PROJ_NM, isnull( CT.CONTACT_NAME, cb.DISPLAY_NAME) as CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='{SUBSTITUE_URL}/CustomerSuccessSurvey/'+ r1.SURVEY_ID,                      
  
    
      
ActionplanURL ='{SUBSTITUE_URL}/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20))+'/0/true', r1.CREATED_DATE, r1.batch_customer_monthly_id,                              
RN = row_number() OVER(partition by CB.EMAIL_ID, cB.ID, r1.SURVEY_ID ORDER BY cb.id desc, r1.rating )  , pp.id as PROD_ID,                
pp.PRODUCT_TITLE as PROD_NM  , ' (Q)' as Frequency                          
FROM [CSS_BATCH_CUSTOMER_MONTHLY] CB (NOLOCK)                               
INNER JOIN CSS_BATCH_monthly B (NOLOCK) ON B.ID = CB.BATCH_MONTHLY_ID and B.ISACTIVE = 1                              
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1                              
LEFT JOIN CONTACTS CT (NOLOCK)  on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1                              
LEFT JOIN CSS_QUESTION_REPLIES R2 (NOLOCK) on R2.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and R2.ISACTIVE = 1                              
LEFT JOIN PROJECT P ON CB.PROJ_ID = P.PROJ_ID                    
LEFT JOIN PORTFOLIO_PRODUCTS pp on cb.PROD_ID = pp.ID                
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )                               
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                              
AND (@csmIds ='-1' OR ( @csmIds !='-1' AND CB.cust_id in (select cust_id from PROJECT where  PROJ_DM_EMP_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))))                          
AND (@frequency ='both' or @frequency ='quarterly')    
),                              
                            
 ActionItem AS (                              
  select PA.PROJECT_ID,PA.Status,PA.TARGET_DATE from                                          
  PROJECT_ACTIONITEM PA (NOLOCK)                                         
  join                                     
  CSS_BATCH_CUSTOMERS BC  (NOLOCK)                                       
  on PA.BATCH_CUSTOMER_ID = BC.ID and (PA.SOURCE like  'CSS%' or PA.SOURCE like '%Customer Success Survey%') and PA.ISACTIVE = 1                                       
  and BC.ISACTIVE = 1 and PA.PROJECT_ID = BC.PROJ_ID                         
  join                                       
  CSS_BATCHES B (NOLOCK) ON B.ID = BC.BATCH_ID and BC.STATUS = 'COMPLETED'                            
  and ((B.START_DATE                                 
  BETWEEN @startDate AND @endDate) OR  (B.END_DATE BETWEEN @startDate AND @endDate))                              
  Where PA.Status not in ('Cancelled','Suspended')                 
  AND (@frequency ='both' or b.frequency = @frequency)    
)          ,          
PremierActionItem AS (                              
  select PA.PROJECT_ID,PA.Status,PA.TARGET_DATE from                                          
  PROJECT_ACTIONITEM PA (NOLOCK)                                         
  join                                     
  CSS_BATCH_CUSTOMER_MONTHLY BC  (NOLOCK)                                       
  on PA.BATCH_CUSTOMER_MONTHLY_ID = BC.ID and (PA.SOURCE like  'CSS%' or PA.SOURCE like '%Customer Success Survey%') and PA.ISACTIVE = 1                                       
  and BC.ISACTIVE = 1 and PA.PROJECT_ID = BC.PROJ_ID                         
  join                                       
  CSS_BATCH_monthly B (NOLOCK) ON B.ID = BC.BATCH_MONTHLY_ID and BC.STATUS = 'COMPLETED'                            
  and ((B.START_DATE                                 
  BETWEEN @startDate AND @endDate) OR  (B.END_DATE BETWEEN @startDate AND @endDate))                              
  Where PA.Status not in ('Cancelled','Suspended')         
  AND (@frequency ='both' or @frequency ='quarterly')    
)                    
                            
 SELECT A.PROJ_ID [PROJECT_ID], A.CUST_ID [CUSTOMER_ID],                                                  
 A.CONTACT_NAME RESPONDENT_NAME,                                                       
  A.CONTACT_NAME + ' - ' + A.PROJ_NM + Frequency  as [DISPLAY_TEXT] , A.MIN_SCORE,A.NPS_SCORE,Null as CSS_SCORE,A.URL,    ActionplanURL,                                      
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA Where PA.Status in ('Completed','Closed')  AND PA.PROJECT_ID=A.PROJ_ID),                              
  [ACTION_PLAN_NOT_SUBMITTED] =  (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA                               
  Where PA.Status in ('In Progress','Open') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)                                 
  FROM                               
  NonPremierAccounts A Where A.RN = 1                                
                                
  UNION                                     
                                
  SELECT                     
   '0' [PROJECT_ID], A.CUST_ID [CUSTOMER_ID]                                             
  , A.CONTACT_NAME RESPONDENT_NAME                              
  , CASE                 
  WHEN A.PROJ_ID IS not null  THEN A.CONTACT_NAME +' - ' + A.PROJ_NM    + Frequency                
  WHEN A.PROD_ID IS not null  THEN A.CONTACT_NAME +' - ' + A.PROD_NM     + Frequency                
    ELSE A.CONTACT_NAME +' - ' + A.CUST_NM     + Frequency                   
 END as [DISPLAY_TEXT]                    
  , null MIN_SCORE ,A.NPS_SCORE,A.MIN_SCORE as CSS_SCORE,A.URL,   ActionplanURL,            
            
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from PremierActionItem PA Where PA.Status in ('Completed','Closed')  AND PA.PROJECT_ID=A.PROJ_ID),                              
  [ACTION_PLAN_NOT_SUBMITTED] =  (select COUNT(distinct PA.PROJECT_ID) from PremierActionItem PA                               
  Where PA.Status in ('In Progress','Open') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)                     
            
  FROM                                       
  PremierAccount A Where A.RN = 1                                                   
  order by RESPONDENT_NAME                                
                                
END   

GO
  IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Combined' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined] 
END
GO
CREATE PROCEDURE [dbo].[reports_CSAT_Combined]                             
                            
@StartDate date,                           
@EndDate date                              
                          
AS                            
                          
BEGIN                              
                            
SELECT    distinct                          
c.cust_nm AS [Customer Name],                              
p.proj_nm AS [Project Name],                
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,               
display_name AS [Respondent Name],                              
B.EMAIL_ID AS [Email_Id],                              
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                              
[CSAT sent Date],                              
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                            
[Year_Quarter] = case when FREQUENCY ='Quarterly' then  'Q' else 'H' end+ CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year)   ,        
pp.TITLE AS [Portfolio],                              
qr.QUESTION_CATEGORY,                              
qr.PERSPECTIVE as PERSPECTIVE,                              
qr.RATING,                              
qr.RATING_DESCRIPTION,                  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                              
(SELECT                              
E.FRST_NM                              
FROM project                              
INNER JOIN EMP_INFO E                              
ON E.EMP_ID = project.PROJ_DM_EMP_ID                              
WHERE project.PROJ_ID = B.PROJ_ID)                              
AS [Customer Success Manager],                              
(SELECT                              
E.FRST_NM                              
FROM project                              
INNER JOIN EMP_INFO E                              
ON E.EMP_ID = project.PROJ_AM_EMP_ID                              
WHERE project.PROJ_ID = B.PROJ_ID)                              
AS [ACCOUNT MANAGER],                   
(SELECT                                
E.FRST_NM                                
FROM project                                
INNER JOIN EMP_INFO E                                
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                                
WHERE project.PROJ_ID = B.PROJ_ID)                                
AS [BU Head],    
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')),     
    1, 1, '') AS [CSAT SPOC],               
               
                 
p.PROJ_STATUS,                             
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                              
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                              
P.METHODOLOGY AS [METHODOLOGY],                              
P.DEPARTMENT AS [DEPARTMENT],                              
P.PROJECT_GROUP [PROJECT GROUP],                      
p.REVENUE_TYPE as [PROJECT TYPE],                  
P.COUNTRY [COUNTRY],                            
CASE                          
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Open')                          
THEN 'Improvement Plan submission Overdue'                          
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                          
THEN 'Improvement Plan Completion Overdue'                          
ELSE pa.status                           
END AS [Action Item Status],                          
                          
                         
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,         
PA.ROOT_CAUSE AS ROOT_CAUSE,      
PA.description as CORRECTIVE_ACTION_PLAN,       
PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,      
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,                          
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                        
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                        
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,             
p.proj_id,        
c.Cust_ID AS [Customer_ID]     
 ,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
                       
                          
FROM [CSS_BATCH_CUSTOMERS] b                              
INNER JOIN project p                              
ON p.proj_id = b.proj_id                  
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID                    
LEFT JOIN portfolio_project PR                              
ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                            
LEFT JOIN PORTFOLIO pp                              
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1                            
INNER JOIN customer c                              
ON c.cust_id = b.cust_id                              
INNER JOIN CSS_BATCHES bt                             
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1        and bt.FREQUENCY in ('Half-Yearly', 'Quarterly'             )    
INNER JOIN CSS_QUESTION_REPLIES QR                              
ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1                            
LEFT JOIN PROJECT_ACTIONITEM PA                             
ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.CSS_REFERENCE like '%' + qr.question +'%'     
left join EMP_INFO emp on emp.EMP_ID = p.QUALITY_SPOC    
    
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                            
AND (bt.start_date BETWEEN @StartDate AND @EndDate                              
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                        
                      
UNION        
                      
SELECT                              
c.cust_nm AS [Customer Name],                              
COALESCE( pps.PRODUCT_TITLE,P.PROJ_NM,'') AS [Project Name],                  
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,               
b.DISPLAY_NAME AS [Respondent Name],                              
B.EMAIL_ID AS [Email_Id],                              
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],                              
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                            
CASE                            
                             
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                          
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                         
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                         
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                             
END        as                    
[Quarter_Year],                              
pp.TITLE [Portfolio],                              
qr.QUESTION_CATEGORY,                              
qr.PERSPECTIVE as PERSPECTIVE,                                
qr.RATING,                              
qr.RATING_DESCRIPTION,                  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                              
(SELECT                              
E.FRST_NM                              
FROM project                              
INNER JOIN EMP_INFO E                              
ON E.EMP_ID = project.PROJ_DM_EMP_ID                              
WHERE project.PROJ_ID = p.PROJ_ID)                              
AS [Customer Success Manager],                              
(SELECT                              
E.FRST_NM                              
FROM project                              
INNER JOIN EMP_INFO E                              
ON E.EMP_ID = project.PROJ_AM_EMP_ID                              
WHERE project.PROJ_ID = p.PROJ_ID)                              
AS [ACCOUNT MANAGER],                  
(SELECT                                
E.FRST_NM                                
FROM project                                
INNER JOIN EMP_INFO E                                
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                                
WHERE project.PROJ_ID = p.PROJ_ID)                                
AS [BU Head],                
 '',            
p.PROJ_STATUS,                                
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                              
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                              
P.METHODOLOGY AS [METHODOLOGY],                              
P.DEPARTMENT AS [DEPARTMENT],                              
P.PROJECT_GROUP [PROJECT GROUP],                     
p.REVENUE_TYPE as [PROJECT TYPE],                  
P.COUNTRY [COUNTRY],                            
CASE                          
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Open')       
THEN 'Improvement Plan submission Overdue'                          
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                          
THEN 'Improvement Plan Completion Overdue'                          
ELSE pa.status                           
END AS [Action Item Status],                            
                     
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,              
PA.ROOT_CAUSE AS ROOT_CAUSE,      
PA.description as CORRECTIVE_ACTION_PLAN,       
PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,      
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,            
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                        
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                        
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,                 
p.proj_id,        
c.Cust_ID AS [Customer_ID]    
,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
                        
FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                              
INNER JOIN CSS_BATCH_MONTHLY bt                              
ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1                     
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID                    
INNER JOIN CSS_QUESTION_REPLIES QR                              
ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1                            
INNER JOIN customer c                              
ON c.cust_id = b.cust_id                              
                         
                          
                           
left join portfolio_products pps on b.prod_id = pps.id               
left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7    and prs.ISACTIVE =1        
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)               
LEFT JOIN portfolio_project PR                              
ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1             
LEFT JOIN PORTFOLIO pp                              
ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1             
LEFT JOIN PROJECT_ACTIONITEM PA                             
ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1        and pa.description like '%' + qr.question +'%'       
left join EMP_INFO emp on emp.EMP_ID = p.QUALITY_SPOC    
    
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                            
AND (bt.start_date BETWEEN @StartDate AND @EndDate                              
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                              
ORDER BY [Year_Quarter], [Customer Name];                          
END 
GO

  IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Consolidated' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Consolidated] 
END
GO
ALTER PROCEDURE [dbo].[reports_CSAT_Consolidated]                       
                      
@StartDate date,                     
@EndDate date                        
                    
AS                      
                    
BEGIN                        
     with cte as            
  (            
SELECT                        
c.cust_nm AS [Customer Name],                        
p.proj_nm AS [Project],               
[CSS Sent - Acc Level] = (select  cast(count(*)  as decimal(12,2)) from CSS_BATCH_CUSTOMERS cbc where cbc.BATCH_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1 and SURVEY_SENT_DATE is not null ),            
[CSS Recd - Acc Level] = (select  cast(count(*)   as decimal(12,2)) from CSS_BATCH_CUSTOMERS cbc where cbc.BATCH_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1  and STATUS in ('Completed') ),            
display_name AS [Respondent],                        
B.EMAIL_ID AS [Email_Id],                        
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                        
[CSAT sent Date],                        
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],                      
[Year_Quarter] = LEFT(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),                
b.STATUS,            
pp.TITLE AS [Portfolio],                        
     [Voice of Customer except NPS] =(select case when min(rating)< 3 then 'Red'            
            when min(rating) = 3 then 'Amber'            
            when min(rating) = 4 then 'Green'            
            when min(rating) =5 then 'Blue' end            
           from css_question_replies r where r.batch_customer_id = b.id and question_category ='criteria') ,            
[Voice of Customer - NPS]  = (select case when min(rating)< 9 then 'Red'            
           when   min(rating) >= 9 then 'Green'             
           else null end            
           from css_question_replies r where r.batch_customer_id = b.id and question_category ='NPS'),            
                       
                  
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_DM_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [Customer Success Manager],               
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_DM_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [CSM Mail],               
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [BU Head],               
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [BU Head Mail],     
--(SELECT                        
--E.FRST_NM                        
--FROM project                        
--INNER JOIN EMP_INFO E                        
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                        
--WHERE project.PROJ_ID = B.PROJ_ID)                        
--AS [ACCOUNT MANAGER],   
--(SELECT                        
--E.FRST_NM                        
--FROM EMP_INFO E                        
--where EMAIL_ID= SPOC)                        
--AS [CSS SPOC],  
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')),   
    1, 1, '') AS [CSAT SPOC],   
p.PROJ_STATUS,                       
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                        
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                        
--P.METHODOLOGY AS [METHODOLOGY],                        
P.DEPARTMENT AS [DEPARTMENT],               
p.REVENUE_TYPE as [PROJECT TYPE],            
--P.PROJECT_GROUP [PROJECT GROUP],                         
--P.COUNTRY [COUNTRY],              
                
TotalActionItems = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  ),            
SubmissionCompleted = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and  completion_date is not null and completion_date <getdate()),            
Planned = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and pa.status  in ('In Progress')),            
--After target date, RAG code (Considering all action item completion ) --Green-100% --Amber-60-99% --Red-Less than 60% --Within due date of target date - Grey , minimum of one is completed - green           
Completed =   (select count(*) from PROJECT_ACTIONITEM PA          
  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and pa.status  in ('Completed')),             
            
[CSS - Improvement Plan submission Status] = (select             
                       
            case when max( PA.TARGET_DATE) is null then 'NA'            
             when   max(pa.COMPLETION_DATE) is not null and max(pa.status) in ('Completed') then 'green'            
             when  max(pa.STATUS)   in ('identified') and max(PA.TARGET_DATE) < getdate()   then 'red'            
              --when max(PA.TARGET_DATE) < getdate()+3 and max(pa.COMPLETION_DATE) is   null then 'amber'            
              when  max(pa.COMPLETION_DATE) is   null then 'grey'            
              else 'NA' end             
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1     ),            
                      
 [CSS - Improvement Plan Implementation Status] = (select             
            case when max( PA.PLANNED_TARGET_DATE) is null then 'NA'            
             when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.planned_actual_date) is not null and max(pa.status) in ('Completed') then 'green'            
             when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.status) not in ('Completed')  then 'red'    --and max(pa.planned_actual_date) is   null        
              --when max(PA.PLANNED_TARGET_DATE) < getdate()+7 and max(pa.planned_actual_date) is   null then 'amber'            
              when  max(pa.planned_actual_date) is   null then 'grey'            
              else 'NA' end            
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1     ),            
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,            
            
--CASE                    
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                    
--THEN 'Improvement Plan submission Overdue'                    
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                    
--THEN 'Improvement Plan Completion Overdue'                    
--ELSE pa.status                     
--END AS [Action Item Status],                    
                    
--PA.description as [Action Item Description],                      
ACTION_PLAN_SUBMISSION_TARGET_DATE = (select  FORMAT(Max(PA.TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                    
ACTION_PLAN_SUBMISSION_ACTUAL_DATE =  (select  FORMAT(Max(PA.COMPLETION_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                    
ACTION_PLAN_COMPLETION_TARGET_DATE = (select  FORMAT(Max(PA.PLANNED_TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                
ACTION_PLAN_COMPLETION_ACTUAL_DATE = (select FORMAT(Max(PA.PLANNED_ACTUAL_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                   
c.Cust_ID AS [Customer_ID]  ,  
p.PROJ_ID  
                  
                    
FROM [CSS_BATCH_CUSTOMERS] b                        
INNER JOIN project p                        
ON p.proj_id = b.proj_id                
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID            
LEFT JOIN portfolio_project PR                      ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                      
LEFT JOIN PORTFOLIO pp                        
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1                      
INNER JOIN customer c                        
ON c.cust_id = b.cust_id                    INNER JOIN CSS_BATCHES bt                        
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1                       
 left join EMP_INFO e on e.EMP_ID = p.QUALITY_SPOC     ---SPOC Details                  
--LEFT JOIN PROJECT_ACTIONITEM PA                       
--ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                  
WHERE     b.ISACTIVE = 1                      
AND (bt.start_date BETWEEN @StartDate AND @EndDate                        
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                  
                
UNION               
            
SELECT                        
c.cust_nm AS [Customer Name],                        
coalesce( pps.product_title + ' (Product)' , p.proj_nm,'') AS [Project],                 
[CSS Sent - Acc Level] = (select  cast(count(*)    as decimal(12,2)) from CSS_BATCH_CUSTOMER_MONTHLY cbc where cbc.BATCH_MONTHLY_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1  and SURVEY_SENT_DATE is not null ),            
[CSS Recd - Acc Level] = (select  cast(count(*)  as decimal(12,2))  from CSS_BATCH_CUSTOMER_MONTHLY cbc where cbc.BATCH_MONTHLY_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1  and STATUS in ('completed') ),            
display_name AS [Respondent],                        
B.EMAIL_ID AS [Email_Id],                        
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                        
[CSAT sent Date],                        
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],                      
CASE                      
                       
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                    
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                   
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                   
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                       
END        as              
[Quarter_Year] ,             
b.STATUS,            
pp.TITLE AS [Portfolio],                        
     [Voice of Customer except NPS] =(select case when min(rating)< 3 then 'Red'            
            when min(rating) = 3 then 'Amber'            
            when min(rating) = 4 then 'Green'            
            when min(rating) =5 then 'Blue' end            
           from css_question_replies r where r.Batch_Customer_Monthly_id = b.id and question_category ='criteria') ,            
[Voice of Customer - NPS]  = (select case when min(rating)< 9 then 'Red'            
            when   min(rating) >= 9 then 'Green'             
           else null end            
           from css_question_replies r where r.Batch_Customer_Monthly_id = b.id and question_category ='NPS'),            
                       
                  
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_DM_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [Customer Success Manager],               
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_DM_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [CSM Mail],               
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [BU Head],               
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [BU Head Mail],  
--(SELECT                        
--E.FRST_NM                        
--FROM project                        
--INNER JOIN EMP_INFO E                        
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                        
--WHERE project.PROJ_ID = B.PROJ_ID)                        
--AS [ACCOUNT MANAGER],   
'',  
p.PROJ_STATUS,                       
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                        
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                        
--P.METHODOLOGY AS [METHODOLOGY],                        
P.DEPARTMENT AS [DEPARTMENT],                  
p.REVENUE_TYPE as [PROJECT TYPE],            
--P.PROJECT_GROUP [PROJECT GROUP],                        
--P.COUNTRY [COUNTRY],              
TotalActionItems = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  ),            
SubmissionCompleted = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and  completion_date is not null and completion_date <getdate()),            
Planned = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and pa.status  in ('In Progress')),            
 Completed =   (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and pa.status  in ('Completed')),             
            
[CSS - Improvement Plan submission Status] = (select             
            case when max( PA.TARGET_DATE) is null then 'NA'            
             when   max(pa.COMPLETION_DATE) is not null and max(pa.status) in ('Completed') then 'green'            
            when  max(pa.STATUS)   in ('identified') and max(PA.TARGET_DATE) < getdate()   then 'red'            
              --when max(PA.TARGET_DATE) < getdate()+3 and max(pa.COMPLETION_DATE) is   null then 'amber'            
              when  max(pa.COMPLETION_DATE) is   null then 'grey'            
              else 'NA' end             
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1     ),            
                      
 [CSS - Improvement Plan Implementation Status] = (select             
            case when max( PA.PLANNED_TARGET_DATE) is null then 'NA'            
             when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.planned_actual_date) is not null and max(pa.status) in ('Completed') then 'green'            
         when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.status) not in ('Completed')  then 'red'    --and max(pa.planned_actual_date) is   null        
              --when max(PA.PLANNED_TARGET_DATE) < getdate()+7 and max(pa.planned_actual_date) is   null then 'amber'            
              when  max(pa.planned_actual_date) is   null then 'grey'            
              else 'NA' end            
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1     ),            
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,            
            
--CASE                    
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                    
--THEN 'Improvement Plan submission Overdue'                  
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                    
--THEN 'Improvement Plan Completion Overdue'                    
--ELSE pa.status                     
--END AS [Action Item Status],                    
                    
--PA.description as [Action Item Description],                      
ACTION_PLAN_SUBMISSION_TARGET_DATE = (select  FORMAT(Max(PA.TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                    
ACTION_PLAN_SUBMISSION_ACTUAL_DATE =  (select  FORMAT(Max(PA.COMPLETION_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                    
ACTION_PLAN_COMPLETION_TARGET_DATE = (select  FORMAT(Max(PA.PLANNED_TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                
ACTION_PLAN_COMPLETION_ACTUAL_DATE = (select  FORMAT(Max(PA.PLANNED_ACTUAL_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                  
c.Cust_ID AS [Customer_ID]      ,  
p.PROJ_ID                   
                  
                    
FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                        
           
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID            
               
LEFT JOIN PORTFOLIO_PRODUCTS pps   on pps.ID = b.PROD_ID and pps.ISACTIVE  =1            
           
left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7      and  prs.isactive =1    
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)              
LEFT JOIN portfolio_project PR                        
ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                      
LEFT JOIN PORTFOLIO pp                        
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1           
INNER JOIN customer c                    
ON c.cust_id = b.cust_id                        
INNER JOIN CSS_BATCH_MONTHLY bt                        
ON bt.id = b.BATCH_MONTHLY_ID and bt.ISACTIVE = 1                       
  left join EMP_INFO e on e.EMP_ID = p.QUALITY_SPOC      ---SPOC Details            
--LEFT JOIN PROJECT_ACTIONITEM PA                       
--ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                  
WHERE     b.ISACTIVE = 1                      
AND (bt.start_date BETWEEN @StartDate AND @EndDate                        
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                          
)            
select [Customer Name],             
 [Type of Account] =  dbo.fn_getTypeOfAccount ([Customer_ID])  ,            
Project ,            
        
Respondent ,          
[CSS Response %] =  cast( [CSS Recd - Acc Level]/[CSS Sent - Acc Level] *100  as decimal(12,2)),            
Email_Id ,            
[CSAT sent Date],            
[CSAT received Date],             
           
[Voice of Customer except NPS] ,            
[Voice of Customer - NPS] ,          
   [No of Days Since Feedback Recd] = DATEDIFF(day, [CSAT received Date], getdate()),           
   [CSS - Improvement Plan submission Status] = case            
             when TotalActionItems =0 then 'NA'            
             when DATEDIFF(day, [CSAT received Date], getdate()) > 7             
             then              
              case when TotalActionItems = Planned + SubmissionCompleted then 'green'            
               --when cast(planned + SubmissionCompleted as decimal(12,2)) / cast(TotalActionItems as decimal(12,2)) > .6 then 'amber'            
               else 'red' end            
             else             
              case when Planned =0 then 'grey' else 'green' end            
              end,            
[CSS - Improvement Plan Implementation Status]   =  case            
             when TotalActionItems =0 then 'NA'            
             when DATEDIFF(day, [CSAT received Date], getdate()) > 28             
             then              
        case when TotalActionItems = Completed then 'green'            
              -- when cast(  Completed as decimal(12,2)) / cast(TotalActionItems as decimal(12,2)) > .6 then 'amber'            
               else 'red' end            
             else             
              case when Completed =0 then 'grey' else 'green' end            
              end,          
[Customer Success Manager] ,            
[CSM Mail],            
[BU Head],            
[BU Head Mail],    
[CSAT SPOC],  
[CONTRACTING UNIT],          
 [BUSSINESS UNIT] as [BUSINESS UNIT],            
 Department,            
PROJ_STATUS ,            
   [Project Type],            
 Year_Quarter ,            
STATUS ,            
Portfolio,           
 [Voice of Customer url] ,            
[ACTION_PLAN_SUBMISSION_TARGET_DATE] ,            
[ACTION_PLAN_SUBMISSION_ACTUAL_DATE],            
[ACTION_PLAN_COMPLETION_TARGET_DATE],             
[ACTION_PLAN_COMPLETION_ACTUAL_DATE],             
[CSS Sent - Acc Level],            
[CSS Recd - Acc Level],            
            
Customer_ID  ,  
proj_id  
 from cte            
ORDER BY [Year_Quarter], [Customer Name];                        
END   
GO

IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Halfyearly' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Halfyearly] 
END
GO
CREATE PROCEDURE [dbo].[reports_CSAT_Halfyearly]                         
                        
@StartDate date,                       
@EndDate date                         

AS                        
                      
BEGIN                          
                        
SELECT                          
c.cust_nm AS [Customer Name],                          
p.proj_nm AS [Project Name],            
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,           
display_name AS [Respondent Name],                          
B.EMAIL_ID AS [Email_Id],                          
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                          
[CSAT sent Date],                          
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                        
[Half_Year] = 'H' + CASE     
        WHEN bt.sequence IN (1 ) THEN '1'    
        WHEN bt.sequence IN (2) THEN '2'    
    END + ' - ' + CONVERT(varchar, bt.Year),                   
pp.TITLE AS [Portfolio],                          
qr.QUESTION_CATEGORY,                          
qr.QUESTION,                          
qr.RATING,                          
qr.RATING_DESCRIPTION,              
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                          
(SELECT                          
E.FRST_NM                          
FROM project                          
INNER JOIN EMP_INFO E                          
ON E.EMP_ID = project.PROJ_DM_EMP_ID                          
WHERE project.PROJ_ID = B.PROJ_ID)                          
AS [Customer Success Manager],                          
(SELECT                          
E.FRST_NM                          
FROM project                          
INNER JOIN EMP_INFO E                          
ON E.EMP_ID = project.PROJ_AM_EMP_ID                          
WHERE project.PROJ_ID = B.PROJ_ID)                          
AS [ACCOUNT MANAGER],               
(SELECT                            
E.FRST_NM                            
FROM project                            
INNER JOIN EMP_INFO E                            
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                            
WHERE project.PROJ_ID = B.PROJ_ID)                            
AS [BU Head],                
 STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC],            
             
p.PROJ_STATUS,                         
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                          
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                          
P.METHODOLOGY AS [METHODOLOGY],                          
P.DEPARTMENT AS [DEPARTMENT],                          
P.PROJECT_GROUP [PROJECT GROUP],                  
p.REVENUE_TYPE as [PROJECT TYPE],              
P.COUNTRY [COUNTRY],                        
CASE                      
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Open')                      
THEN 'Improvement Plan submission Overdue'                      
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                      
THEN 'Improvement Plan Completion Overdue'                      
ELSE pa.status                       
END AS [Action Item Status],                      
                      
                     
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,  
PA.ROOT_CAUSE AS ROOT_CAUSE,
PA.description as CORRECTIVE_ACTION_PLAN, 
PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,                      
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                    
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                    
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,         
p.proj_id,    
c.Cust_ID AS [Customer_ID]                         
   ,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
                    
                      
FROM [CSS_BATCH_CUSTOMERS] b                          
INNER JOIN project p                          
ON p.proj_id = b.proj_id              
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID                
LEFT JOIN portfolio_project PR                          
ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                        
LEFT JOIN PORTFOLIO pp                          
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1                        
INNER JOIN customer c                          
ON c.cust_id = b.cust_id                          
INNER JOIN CSS_BATCHES bt                         
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1                     
INNER JOIN CSS_QUESTION_REPLIES QR                          
ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1                        
LEFT JOIN PROJECT_ACTIONITEM PA                         
ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                    
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1 and bt.FREQUENCY ='halfyearly'                       
AND (bt.start_date BETWEEN @StartDate AND @EndDate                          
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    

                  
--UNION    
                  
--SELECT                          
--c.cust_nm AS [Customer Name],                          
--COALESCE( pps.PRODUCT_TITLE,P.PROJ_NM,'') AS [Project Name],              
--[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,           
--b.DISPLAY_NAME AS [Respondent Name],                          
--B.EMAIL_ID AS [Email_Id],                          
--FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],                          
--FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                        
--CASE                        
--    WHEN MONTH(b.SURVEY_SENT_DATE) BETWEEN 1 AND 6 THEN 'H1 - ' + CONVERT(varchar, YEAR(b.SURVEY_SENT_DATE))                      
--    WHEN MONTH(b.SURVEY_SENT_DATE) BETWEEN 7 AND 12 THEN 'H2 - ' + CONVERT(varchar, YEAR(b.SURVEY_SENT_DATE))                                     
--END AS [HALF_Year],                          
--pp.TITLE [Portfolio],                          
--qr.QUESTION_CATEGORY,                          
--qr.QUESTION,                          
--qr.RATING,                          
--qr.RATING_DESCRIPTION,              
--(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                          
--(SELECT                          
--E.FRST_NM                          
--FROM project                          
--INNER JOIN EMP_INFO E                          
--ON E.EMP_ID = project.PROJ_DM_EMP_ID                          
--WHERE project.PROJ_ID = p.PROJ_ID)                          
--AS [Customer Success Manager],                          
--(SELECT                          
--E.FRST_NM                          
--FROM project                          
--INNER JOIN EMP_INFO E                          
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                          
--WHERE project.PROJ_ID = p.PROJ_ID)                          
--AS [ACCOUNT MANAGER],              
--(SELECT                            
--E.FRST_NM                            
--FROM project                            
--INNER JOIN EMP_INFO E                            
--ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                            
--WHERE project.PROJ_ID = p.PROJ_ID)                            
--AS [BU Head],            
             
--p.PROJ_STATUS,                            
--p.BUSINESS_UNIT AS [BUSSINESS UNIT],                          
--P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                          
--P.METHODOLOGY AS [METHODOLOGY],                          
--P.DEPARTMENT AS [DEPARTMENT],                          
--P.PROJECT_GROUP [PROJECT GROUP],                 
--p.REVENUE_TYPE as [PROJECT TYPE],              
--P.COUNTRY [COUNTRY],                        
--CASE                      
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                      
--THEN 'Improvement Plan submission Overdue'                      
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                      
--THEN 'Improvement Plan Completion Overdue'                      
--ELSE pa.status                       
--END AS [Action Item Status],                        
--PA.description as [Action Item Description],                  
--[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,                
--FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,        
--FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                    
--FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                    
--FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,             
--p.proj_id,    
--c.Cust_ID AS [Customer_ID]                    
                    
--FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                          
--INNER JOIN CSS_BATCH_MONTHLY bt                          
--ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1                 
--inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID                
--INNER JOIN CSS_QUESTION_REPLIES QR                          
--ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1                        
--INNER JOIN customer c                          
--ON c.cust_id = b.cust_id                          
                     
                      
                       
--left join portfolio_products pps on b.prod_id = pps.id           
--left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7    and prs.ISACTIVE =1    
--LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)           
--LEFT JOIN portfolio_project PR                          
--ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1         
--LEFT JOIN PORTFOLIO pp                          
--ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1         
--LEFT JOIN PROJECT_ACTIONITEM PA                         
--ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1        and pa.description like '%' + qr.question +'%'                    
--WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                        
--AND (bt.start_date BETWEEN @StartDate AND @EndDate                          
--OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                          
ORDER BY [Half_Year], [Customer Name];                          
    
    
                        
END 
GO
IF EXISTS(Select 1 from sys.objects where name ='getCSSActionitem_All' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSActionitem_All] 
END
GO

CREATE PROCEDURE [dbo].[getCSSActionitem_All]     
    
@STARTDATE datetime,    
@ENDDATE datetime

    
AS            
    
BEGIN         
    
select  p.BUSINESS_UNIT,C.CUST_NM as ACCOUNT,P.PROJ_NM as PROJECT,CB.DISPLAY_NAME as CUSTOMER,
E.FRST_NM as PROJECT_MANAGER,  
E.email_id as [PM_MAIL_ID],    
E1.frst_nm as CSM ,    
E1.email_id as [CSM_MAIL_ID],
E2.frst_nm as [DELIVERY_PARTNER],    
E2.email_id as [DP_MAIL_ID], 
e3.FRST_NM as [DEX SPOC],
SOURCE as SOURCE_CATEGORY,
FORMAT(CB.SURVEY_SENT_DATE,'yyyy-MM-dd') as SURVEY_SENT_DATE,FORMAT(CB.SURVEY_RECEIVED_DATE,'yyyy-MM-dd') as SURVEY_RECEIVED_DATE    
,cq.PERSPECTIVE,--sa.CSS_REFERENCE,
sa.SCORE,sa.CUSTOMER_REMARKS,
PA.DESCRIPTION as  [DESCRIPTION / CORRECTIVE_ACTION_PLAN], PA.STATUS, PA.ROOT_CAUSE, PA.PREVENTIVE_ACTION_PLAN,   
FORMAT(PA.IDENTIFIED_DATE,'yyyy-MM-dd') as IDENTIFIED_DATE,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,
PA.BATCH_CUSTOMER_ID,PA.PROJECT_ID,PA.CUSTOMER_ID     ,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
     
from PROJECT_ACTIONITEM PA     
CROSS APPLY fn_splitActionItemCssReference(PA.CSS_REFERENCE) sa
inner join PROJECT P on P.PROJ_ID = PA.PROJECT_ID    
inner join CUSTOMER C on C.CUST_ID = PA.CUSTOMER_ID       
inner join CSS_BATCH_CUSTOMERS CB on CB.ID = PA.BATCH_CUSTOMER_ID    
inner join CSS_QUESTION_REPLIES CQ on cq.BATCH_CUSTOMER_ID=cb.id and sa.CSS_REFERENCE=cq.QUESTION
inner join CSS_QUESTION_MASTER cm on cm.id=cq.QUESTION_ID
inner join EMP_INFO E on E.EMP_ID = P.PROJ_PM_EMP_ID    
inner join EMP_INFO E1 on e1.emp_id  = p.PROJ_DM_EMP_ID                 
inner join EMP_INFO E2 on e2.EMP_ID = p.DP_ID 
left join EMP_INFO E3 on e3.EMP_ID  = p.QUALITY_SPOC 
where  PA.ISACTIVE=1 and CB.ISACTIVE=1  and PA.IDENTIFIED_DATE between @STARTDATE and @ENDDATE
and rating between 1 and 3 and cm.QUESTION_CATEGORY ='Criteria' and cm.ISACTIVE=1
order by PA.IDENTIFIED_DATE,PROJECT,CUSTOMER desc    
    
END    

GO

IF EXISTS(Select 1 from sys.objects where name ='fn_getActionItemsForProject' AND type='IF')
BEGIN
       DROP FUNCTION [dbo].[fn_getActionItemsForProject] 
END
GO
CREATE FUNCTION [dbo].[fn_getActionItemsForProject]          
(              
      @startDate datetime,          
      @endDate datetime ,        
   @proj_Id varchar(255)        
)          
RETURNS TABLE          
RETURN          
           
   With ActionItem As(       
   select A.PROJECT_ID, A.TARGET_DATE ,A.CREATED_DATE,A.UPDATED_DATE  ,A.STATUS      
   from         
   PROJECT_ACTIONITEM A        
   where A.PROJECT_ID = @proj_Id and A.ISACTIVE = 1 and A.STATUS  not in ('Cancelled','Completed')         
   and A.CREATED_DATE between @startDate and @endDate         
   )      
      
   select  COUNT(A.PROJECT_ID) as actionItem_Identified ,      
   actionItem_InOpen_Status = (select count(A.PROJECT_ID) from ActionItem A where A.STATUS in ('In Progress')),      
   actionItem_Beyond_Target_Date = (select top 1 count(A.TARGET_DATE) from ActionItem A where A.TARGET_DATE < @endDate)      
   from       
   ActionItem A
   
--------------------------Action Item Status Change and Declaration Changes--------------- END ---------------------------------------------------------------------
   
   GO