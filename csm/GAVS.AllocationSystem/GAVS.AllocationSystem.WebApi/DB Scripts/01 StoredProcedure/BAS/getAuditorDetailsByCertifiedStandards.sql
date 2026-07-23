USE BAS
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAuditorDetailsByCertifiedStandards' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getAuditorDetailsByCertifiedStandards
END
GO

CREATE procedure [dbo].[getAuditorDetailsByCertifiedStandards] 

@custid varchar(50),    
@projid varchar(500)    
as    
begin    
    
with cte as    
(    
select distinct process_model_id from pm_project_service_area_process_mapping    
where cust_id = @custid and proj_id = @projid and isactive = 1    
)    
    
select distinct EI.* from AUDITOR_QUALIFIED_STANDARDS PMAD    
inner join EMP_INFO EI on PMAD.EMP_ID = EI.EMP_ID and PMAD.QUALIFICATION_STATUS = 'Active' and PMAD.EFFECTIVE_FROM <= GETDATE() and PMAD.INACTIVE_FROM is null    
where PMAD.QUALIFIED_STANDARDS in (select process_model_id from cte) and EI.DOR IS NULL and PMAD.ISACTIVE=1  
order by frst_nm  
end
GO
