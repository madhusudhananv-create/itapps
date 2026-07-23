USE BAS
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='get_CSMList' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[get_CSMList]
END
GO


CREATE PROCEDURE [dbo].[get_CSMList]          
          
AS          
BEGIN          
 -- SET NOCOUNT ON added to prevent extra result sets from          
 -- interfering with SELECT statements.          
 SET NOCOUNT ON;         
      
 Select cust_id,Proj_id, Frst_nm, frst_nm as csm,emp_id as csm_Id from bas..project p (NOLOCK) 
 inner join bas..emp_info e (NOLOCK) on e.emp_id = p.PROJ_DM_EMP_ID    
 and dor is null    
 GROUP BY    
 cust_id,Proj_id, Frst_nm, emp_id     
         
END    
GO

