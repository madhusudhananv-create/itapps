USE BAS
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='csp_get_ProjectResourceByProjId' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].csp_get_ProjectResourceByProjId
END
GO

CREATE proc [dbo].[csp_get_ProjectResourceByProjId]  
 @ProjId varchar(20)  
AS  
BEGIN  

 SET NOCOUNT ON;  
  
 select e.FRST_NM, e.EMP_ID, c.CUST_NM, c.CUST_ID, p.PROJ_NM, p.PROJ_ID, pr.BILL_FLG, pr.CURR_INDC, 
 pr.START_DATE, pr.END_DATE from PROJ_RESOURCE pr    
 inner join project p on pr.proj_id = p.proj_id    
 inner join customer c on p.cust_id = c.cust_id    
 inner join emp_info e on pr.emp_id = e.emp_id    
 where pr.PROJ_ID = @ProjId and PR.CURR_INDC='Y' and PR.END_DATE>=GETDATE()
 order by FRST_NM,cust_nm, proj_nm, CURR_INDC desc, BILL_FLG desc   
  
END  
GO
