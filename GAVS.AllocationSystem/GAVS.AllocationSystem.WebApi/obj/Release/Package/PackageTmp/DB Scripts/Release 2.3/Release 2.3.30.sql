GO
IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'usp_get_projectIds '
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].[usp_get_projectIds ]
END
GO

CREATE PROCEDURE [dbo].[usp_get_projectIds ]                                  
@EmpID varchar(50),                                  
@ProjectID VARCHAR(20)=''                                  
-- Add the parameters for the stored procedure here                                  
AS                                  
BEGIN                                  
-- SET NOCOUNT ON added to prevent extra result sets from                                  
-- interfering with SELECT statements.                                  
SET NOCOUNT ON;                     
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED ;                
  declare @allProjectsForCustomer bit ;                          
declare @csmTitle int;                          
  select @csmTitle = CSM_TITLE_ID from emp_info where emp_id = @empid                          
  if(@CSMTitle = 6 or @csmtitle = 1 or @csmtitle =2 or @csmtitle =4 or @csmtitle =9 or  @csmtitle =7)                          
  BEGIN                          
   set @allProjectsForCustomer =1                          
  END                          

    IF @ProjectID=''                                  
     BEGIN                                  

       SELECT P .PROJ_ID, P .PROJ_NM, ''                                 
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                   
     ON       ((@allProjectsForCustomer = 1 and pr.cust_id = p.cust_id) or P.PROJ_ID=PR.PROJ_ID   )       AND PR.EMP_ID= @EmpID                                   
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID    and c.cust_id !='201100010'                             
      WHERE PR.END_DATE >= GETDATE()      --and isnull(p.proj_status,'' ) <>'close' and  P.CUST_ID not in (  '202100062','202100091' )                    
       and P.PARENT_PROJ_ID = P.PROJ_ID  and  (@allProjectsForCustomer = 0    or c.CUST_ID in (select c1.cust_id from customer c1 inner join VW_PROJECT_ACTIVE p1 on c1.CUST_ID = p1.CUST_ID   
	   inner join VW_PROJ_RESOURCE_ACTIVE pr1 on p1.proj_id = pr1.PROJ_ID and pr1.END_DATE > getdate()    and   pr1.EMP_ID = @empid )       )                    
       --GROUP BY P.PROJ_ID, P.PROJ_NM                              

   union                            
       SELECT PP.PROJ_ID, PP.PROJ_NM ,''                                     
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                   
       ON  P.PROJ_ID=PR.PROJ_ID      AND PR.EMP_ID= @EmpID                                   
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID     and c.cust_id ='201100010'                             
       INNER JOIN VW_PROJECT_ACTIVE PP ON P.PARENT_PROJ_ID = PP.PROJ_ID                                  
       WHERE PR.END_DATE >= GETDATE() -1     --and isnull(p.proj_status,'' ) <>'close'           and  P.CUST_ID not in (  '202100062','202100091' )                    
       --GROUP BY PP.PROJ_ID, PP.PROJ_NM                                
          union                 
     SELECT PP.PROJ_ID, PP.PROJ_NM,''                  
       FROM VW_PROJECT_ACTIVE Pp  INNER JOIN CUSTOMER C on C.CUST_ID = Pp.CUST_ID                        
    where @allProjectsForCustomer = 1 and   PP.PARENT_PROJ_ID = PP.PROJ_ID   and  PP.END_DATE >= GETDATE() -1    -- and isnull(pp.proj_status,'' ) <>'close' and  pP.CUST_ID not in ('0', '201100010', '202100062','202100091' )                
    and ( pp.PROJ_AM_EMP_ID =   @EmpID or pp.PROJ_BUHEAD_EMP_ID = @EmpID or pp.PROJ_DM_EMP_ID = @EmpID or pp.PROJ_PM_EMP_ID =@EmpID)                          

   END  
    ELSE                                
     BEGIN                                
      SELECT DISTINCT P.PROJ_ID, P.PROJ_NM,''   FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                 
      ON P.PROJ_ID=PR.PROJ_ID                                 
      AND (PR.EMP_ID=@EmpID                                 
      OR P.PROJ_BUHEAD_EMP_ID=@EmpID                                 
      OR P.PROJ_DM_EMP_ID=@EmpID                                 
      OR P.PROJ_PM_EMP_ID=@EmpID                                 
      OR PR.PROJ_RM_EMP_ID=@EmpID                                 
      OR PR.PROJ_REVIEWER_EMP_ID=@EmpID) AND P.PROJ_ID=@ProjectID                                
      INNER JOIN (SELECT PROJ_ID,EMP_ID,MAX(PROJ_RESRC_ID)PROJ_RESRC_ID FROM VW_PROJ_RESOURCE_ACTIVE GROUP BY PROJ_ID,EMP_ID) MPR                                
ON PR.PROJ_RESRC_ID=MPR.PROJ_RESRC_ID                                 
      GROUP BY P.PROJ_ID,P.PARENT_PROJ_ID,P.PROJ_NM, p.QUALITY_SPOC                                
   END                                         
END
GO

IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'usp_get_project_new '
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].[usp_get_project_new ]
END
GO

create PROCEDURE [dbo].[usp_get_project_new ]                                
@EmpID varchar(50),                                
@ProjectID VARCHAR(20)=''                                
-- Add the parameters for the stored procedure here                                
AS                                
BEGIN                                
-- SET NOCOUNT ON added to prevent extra result sets from                                
-- interfering with SELECT statements.                                
SET NOCOUNT ON;                   
            SET TRANSACTION ISOLATION LEVEL READ COMMITTED ;              
  declare @allProjectsForCustomer bit ;                        
declare @csmTitle int;                        
  select @csmTitle = CSM_TITLE_ID from emp_info where emp_id = @empid                        
  if(@CSMTitle = 6 or @csmtitle = 1 or @csmtitle =2 or @csmtitle =4 or @csmtitle =9 or  @csmtitle =7)                        
  BEGIN                        
   set @allProjectsForCustomer =1                        
  END                        

	if(1=1)--dummy case                               
   BEGIN                                
    IF @ProjectID=''                                
     BEGIN                                
      SELECT   CUST_ID, CUST_NM, ''     FROM                                 
      (                                
       SELECT P .PROJ_ID, P .PROJ_NM,P .PROJ_ALIAS_NM, '' BILLING_PROJ_ID, '' BILLING_PROJ_NM, MAX(PR.BILL_FLG+0) BILL_FLG, P.CUST_ID, C.CUST_NM, '' UPDATED_DATE, p.QUALITY_SPOC                                    
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                 
     ON       ((@allProjectsForCustomer = 1 and pr.cust_id = p.cust_id) or P.PROJ_ID=PR.PROJ_ID   )       AND PR.EMP_ID= @EmpID                                 
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID     and c.cust_id !='201100010'                           
      WHERE PR.END_DATE >= GETDATE() -1     --and isnull(p.proj_status,'' ) <>'close' and  P.CUST_ID not in (  '202100062','202100091' )                  
       and P.PARENT_PROJ_ID = P.PROJ_ID  and  (@allProjectsForCustomer =0   or c.cust_id ='201100010' or c.CUST_ID in (select c1.cust_id from customer c1 inner join VW_PROJECT_ACTIVE p1 on c1.CUST_ID = p1.CUST_ID   inner join VW_PROJ_RESOURCE_ACTIVE pr1 on p1.proj_id = pr1.PROJ_ID and pr1.END_DATE > getdate() -1  and   pr1.EMP_ID = @empid )       )                  
       GROUP BY P.PROJ_ID, P.PROJ_NM, P.PROJ_ALIAS_NM, P.PROJ_ID, P.PROJ_NM,  P.CUST_ID, C.CUST_NM , p.QUALITY_SPOC                                 
      ) TBL                                 
      GROUP BY PROJ_ID, PROJ_NM, PROJ_ALIAS_NM, BILLING_PROJ_ID, BILLING_PROJ_NM,  CUST_ID, CUST_NM, UPDATED_DATE  , QUALITY_SPOC                         
   union                          
     SELECT   CUST_ID, CUST_NM, ''    FROM                                 
      (                                
       SELECT PP.PROJ_ID, PP.PROJ_NM,PP.PROJ_ALIAS_NM, '' BILLING_PROJ_ID, '' BILLING_PROJ_NM, MAX(PR.BILL_FLG+0) BILL_FLG, P.CUST_ID, C.CUST_NM, '' UPDATED_DATE, p.QUALITY_SPOC                                    
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                 
       ON  P.PROJ_ID=PR.PROJ_ID                            
       AND PR.EMP_ID= @EmpID                                 
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID     and c.cust_id ='201100010'                           
       INNER JOIN VW_PROJECT_ACTIVE PP ON P.PARENT_PROJ_ID = PP.PROJ_ID                                
       WHERE PR.END_DATE >= GETDATE() -1     --and isnull(p.proj_status,'' ) <>'close'           and  P.CUST_ID not in (  '202100062','202100091' )                  
       GROUP BY PP.PROJ_ID, PP.PROJ_NM, PP.PROJ_ALIAS_NM, P.PROJ_ID, P.PROJ_NM,  P.CUST_ID, C.CUST_NM , p.QUALITY_SPOC                                 
      ) TBL                                 
      GROUP BY PROJ_ID, PROJ_NM, PROJ_ALIAS_NM, BILLING_PROJ_ID, BILLING_PROJ_NM,  CUST_ID, CUST_NM, UPDATED_DATE  , QUALITY_SPOC                                 
          union               
     SELECT  Pp.CUST_ID, C.CUST_NM, ''                 
       FROM VW_PROJECT_ACTIVE Pp  INNER JOIN CUSTOMER C on C.CUST_ID = Pp.CUST_ID                      
    where @allProjectsForCustomer = 1 and   PP.PARENT_PROJ_ID = PP.PROJ_ID   and  PP.END_DATE >= GETDATE() -1    -- and isnull(pp.proj_status,'' ) <>'close' and  pP.CUST_ID not in ('0', '201100010', '202100062','202100091' )              
    and ( pp.PROJ_AM_EMP_ID =   @EmpID or pp.PROJ_BUHEAD_EMP_ID = @EmpID or pp.PROJ_DM_EMP_ID = @EmpID or pp.PROJ_PM_EMP_ID =@EmpID)                        
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
      OR PR.PROJ_REVIEWER_EMP_ID=@EmpID) AND P.PROJ_ID=@ProjectID                                
      INNER JOIN (SELECT PROJ_ID,EMP_ID,MAX(PROJ_RESRC_ID)PROJ_RESRC_ID FROM VW_PROJ_RESOURCE_ACTIVE GROUP BY PROJ_ID,EMP_ID) MPR                                
ON PR.PROJ_RESRC_ID=MPR.PROJ_RESRC_ID                                 
      GROUP BY P.PROJ_ID,P.PARENT_PROJ_ID,P.PROJ_NM, p.QUALITY_SPOC                                
   END                                  
   END                                 
END 