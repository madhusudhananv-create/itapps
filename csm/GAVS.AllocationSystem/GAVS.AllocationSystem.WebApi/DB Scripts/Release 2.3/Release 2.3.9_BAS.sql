USE BAS
GO

IF NOT EXISTS(SELECT 1 FROM BAS..REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME = 'Quality SPOC for all projects')
BEGIN
update  BAS..REPORTS_SP_DETAILS set SP_DISPLAY_NAME = 'List of Active Projects'  where  SP_DISPLAY_NAME = 'Quality SPOC for all projects'
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getQualitySpocs' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getQualitySpocs]
END
GO


CREATE procedure reports_getQualitySpocs      
AS      
BEGIN      
 select p.proj_id, p.proj_nm, convert(varchar,p.start_date,107) as start_date,convert(varchar,p.end_date,107)as end_date,     
 HeadCount = (select count(*) from bas..PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y'),     
 c.cust_nm, proj_status , e.frst_nm as SPOC, e1.frst_nm as PM, e2.frst_nm as CSM     
 from bas.dbo.project p inner join bas.dbo.customer c on p.cust_id = c.cust_id      
 left join emp_info e on e.emp_id  = p.quality_spoc      
  inner join emp_info e1 on e1.emp_id  = p.PROJ_PM_EMP_ID      
   inner join emp_info e2 on e2.emp_id  = p.PROJ_DM_EMP_ID  
   where isnull(proj_status, '') != 'close'
 --where p.end_date> getdate()  and isnull(proj_status, '') != 'close'    
 order by c.cust_nm, p.proj_nm      
      
END 
GO

