USE BAS
GO

If not Exists(Select * from BAS..CONFIGURATION_EXT where [KEY] ='NewAccount_ToList')
Begin
Insert into BAS..CONFIGURATION_EXT values('NewAccount_ToList','SOC@gavstech.com, ITsupport@gavstech.com, adminsupport@gavstech.com, hroperations@gavstech.com',-1,null, null, 0,1,null,null)
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='get_CSMList' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[get_CSMList]
END
GO

IF not exists(SELECT 1 FROM BAS..CONFIGURATION_EXT where [key] ='DEFAULT_STARTUP_AUDITOR' AND CUST_ID='-1')
BEGIN
	insert into BAS..CONFIGURATION_EXT values ('DEFAULT_STARTUP_AUDITOR','105013', '-1', null,'Non Premier',0, 1,null,null)  --hari
END
GO

IF not exists(SELECT 1 FROM BAS..CONFIGURATION_EXT where [key] ='DEFAULT_STARTUP_AUDITOR' AND CUST_ID='212100001')
BEGIN
	insert into BAS..CONFIGURATION_EXT values ('DEFAULT_STARTUP_AUDITOR','104296', '212100001', null,'Premier',0, 1,null,null)  --vijesh
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
