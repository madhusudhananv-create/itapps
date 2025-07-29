 

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
                      
CASE WHEN (A.TARGET_DATE < GETDATE() AND A.STATUS  IN ('Planned' , 'Started', 'Identified')) THEN 'PAST_DUE_DATE'                
WHEN  (A.TARGET_DATE >= GETDATE() AND A.STATUS  IN ('Planned' , 'Started',  'Identified')) THEN 'DUE_FOR_CLOSURE'                           
END  AS STATUS_TYPE, A.ISACTIVE,A.PREVENTIVE_ACTION_PLAN,cq.PERSPECTIVE--,sa.CSS_REFERENCE  
,sa.SCORE,sa.CUSTOMER_REMARKS
  
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
