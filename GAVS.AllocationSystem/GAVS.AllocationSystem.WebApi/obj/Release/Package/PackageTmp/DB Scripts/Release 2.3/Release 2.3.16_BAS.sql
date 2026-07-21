USE BAS
GO

declare @KEY nvarchar(500) = 'HIDE_UOM'
declare @VALUE nvarchar(500) = 'Volume of Incidents'
declare @CUST_ID varchar(50) = '212100001'
declare @PROJ_ID varchar(500) = null
declare @COMMENTS varchar(1000) = null
declare @ISENCRYPT bit = 0
declare @ISACTIVE bit = 1
declare @START_DATE datetime = null
declare @END_DATE datetime = null

if not exists (select 1 from BAS..CONFIGURATION_EXT where [KEY]=@KEY)
begin

insert into BAS..CONFIGURATION_EXT values (@KEY,@VALUE,@CUST_ID,@PROJ_ID,@COMMENTS,@ISENCRYPT,@ISACTIVE,@START_DATE,@END_DATE)

end
go


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getQualitySpocs' AND TYPE='P')
BEGIN
 DROP PROCEDURE reports_getQualitySpocs          
END
GO

CREATE  PROCEDURE [dbo].[reports_getQualitySpocs]          
AS          
BEGIN          
 declare @url varchar(50) = 'https://csm.gavstech.com/layout/checklistfindings/'
       
 select p.proj_id, p.proj_nm, convert(varchar,p.start_date,107) as start_date,convert(varchar,p.end_date,107)as end_date,         
 Current_HeadCount = (select count(*) from bas..PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 
 and pr.CURR_INDC ='y' and getdate() between pr.start_date and pr.end_date),         
 c.cust_nm as Customer_NM,   
 proj_status , p.project_type,p.BUSINESS_UNIT,p.DEPARTMENT,p.PROJECT_GROUP,  
 status= proj_status ,   
 e.frst_nm as SPOC, e1.frst_nm as PM, e2.frst_nm as CSM   ,
 Audit_Title=(select top 1 TC.TITLE from CSP..TASK T inner join CSP..TASK_CATEGORY TC on TC.ID=T.TASK_CATEGORY_ID
                where T.PROJ_ID=P.PROJ_ID and T.ISACTIVE=1 order by T.DUE_DATE desc),
 Audit_Status=(select top 1 status from CSP..TASK T where T.PROJ_ID=P.PROJ_ID and T.ISACTIVE=1 order by T.DUE_DATE desc) ,
 Last_Audit_Date=(select top 1 convert(varchar,DUE_DATE,107) from CSP..TASK T where T.PROJ_ID=P.PROJ_ID and T.ISACTIVE=1 order by T.DUE_DATE desc),
 URL = @url + c.cust_id + '/' + p.PROJ_ID   + '/' + (select top 1 convert(varchar(max) ,T.ID) from CSP..TASK T where T.PROJ_ID=P.PROJ_ID and T.ISACTIVE=1 order by T.DUE_DATE desc )
 from 
 bas.dbo.project p 
 inner join bas.dbo.customer c on p.cust_id = c.cust_id          
 left join BAS..emp_info e on e.emp_id  = p.quality_spoc          
 inner join BAS..emp_info e1 on e1.emp_id  = p.PROJ_PM_EMP_ID          
 inner join BAS..emp_info e2 on e2.emp_id  = p.PROJ_DM_EMP_ID      
 where isnull(proj_status, '') != 'close'    
 order by c.cust_nm, p.proj_nm       
END
GO