USE CSP    

GO

IF EXISTS(Select 1 from sys.procedures where name ='getIdeabyId' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getIdeabyId]
END
GO


  
CREATE procedure    
getIdeabyId    
@id int    
as    
begin    
select  (select top 1 cust_id from bas..PROJECT where PROJ_ID = I.PROJECT_ID) [cust_id],      
PP.PORTFOLIO_ID,I.ID,I.PROJECT_ID,I.SERVICE_AREA_ID,I.IDEA_STATUS_ID,I.DESCRIPTION,  
I.POTENTIAL_SOLUTION_DESCRIPTION,I.POTENTIAL_SOLUTION_CATEGORY_ID,I.IDEA_IMPROVEMENT_TYPE_ID,I.IDENTIFIED_BY,I.IDENTIFIED_DATE,  
I.PROCESS_AREA_ID,I.PROCESS_ID,I.VERSION_ID,I.STAGE_ID,I.COMMENTS,I.CREATED_BY,I.CREATED_DATE,I.UPDATED_BY,  
I.UPDATED_DATE,I.ISACTIVE,I.ISSUBMITTED,I.review_comments from IDEA I     
left join PORTFOLIO_PROJECT PP ON I.PROJECT_ID = PP.PROJ_ID    
left join PORTFOLIO P ON PP.PORTFOLIO_ID = P.ID    
where I.ID = @id and I.ISACTIVE = 1      
end    
go


if not exists (select 1 from CSP..FILTER_PREFERENCE where TABLE_NAME = 'PM_CHECKLIST')
begin

insert into csp..FILTER_PREFERENCE values ('PM_CHECKLIST','description',	'Description','string',1,0,0,null,'104474',GETDATE(),'104474',GETDATE(),1)

insert into csp..FILTER_PREFERENCE values ('PM_CHECKLIST','maturitY_LEVEL',	'Maturity Level Applicable','number',1,0,0,null,'104474',GETDATE(),'104474',GETDATE(),1)

insert into csp..FILTER_PREFERENCE values ('PM_CHECKLIST','iS_WEIGHTAGE_APPLICABLE',	'Weightage Applicable','number',1,0,0,null,'104474',GETDATE(),'104474',GETDATE(),1)

end
go


if exists (select 1 from csp..TASK where STATUS = 'PLANNED' and PROJ_ID in (
'201P000299-11') and DESCRIPTION = 'Periodic Internal Assessment - Sept')
begin

update  csp..TASK set STATUS = 'CANCELLED' ,UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where STATUS = 'PLANNED' and PROJ_ID in (
'201P000299-11') and DESCRIPTION = 'Periodic Internal Assessment - Sept'

end


if exists (select 1 from csp..TASK where STATUS = 'PLANNED' and PROJ_ID in (
'202P000465-01') and DESCRIPTION = 'Monthly Health Check')
begin

update  csp..TASK set STATUS = 'CANCELLED'  ,UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where STATUS = 'PLANNED' and PROJ_ID in (
'202P000465-01') and DESCRIPTION = 'Monthly Health Check'

end

--jewish

if exists (select 1 from csp..TASK where   PROJ_ID in (
'202P000133-03') and DESCRIPTION  = 'Sample Assessment mail')
begin

update  csp..TASK set STATUS = 'CANCELLED'  ,UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'202P000133-03') and DESCRIPTION = 'Sample Assessment mail'

end


if exists (select 1 from csp..TASK where   PROJ_ID in (
'201P000463') and DESCRIPTION  in  ('ZIF 4.0 - Sprint 19 - Sprint Assessment',
'ZIF 4.0 - Sprint 19 - Grooming Gate Assessment',
'ZIF 4.0 - Sprint 19 - Sprint Planning Gate Assessment',
'ZIF 4.0 - Sprint 19 - Sprint Execution Gate Assessment') )
begin

update  csp..TASK set STATUS = 'CANCELLED',UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'201P000463') and DESCRIPTION  in  ( 'ZIF 4.0 - Sprint 19 - Sprint Assessment',
'ZIF 4.0 - Sprint 19 - Grooming Gate Assessment',
'ZIF 4.0 - Sprint 19 - Sprint Planning Gate Assessment',
'ZIF 4.0 - Sprint 19 - Sprint Execution Gate Assessment'
)

end

if exists (select 1 from csp..TASK where   PROJ_ID in (
'202P000391-02') and DESCRIPTION  in  ('QA assessment for the service deliveries ',
'QA assessment for the service deliveries ',
'QA assessment for the service deliveries ',
'QA assessment for the service deliveries ','ITIL Maturity Level Assessment- Nov 20' ) )
begin

update  csp..TASK set STATUS = 'CANCELLED' ,UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'202P000391-02') and  DESCRIPTION  in  ('QA assessment for the service deliveries ',
'QA assessment for the service deliveries ',
'QA assessment for the service deliveries ',
'QA assessment for the service deliveries ','ITIL Maturity Level Assessment- Nov 20' )

end


if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000161') and DESCRIPTION  = 'Release Assessment')
begin

update  csp..TASK set STATUS = 'CANCELLED'  ,UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000161') and DESCRIPTION = 'Release Assessment'

end

if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000144') and DESCRIPTION  = 'Sprint -12 / 13 / 14 / 15 ')
begin

update  csp..TASK set STATUS = 'CANCELLED',UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000144') and DESCRIPTION = 'Sprint -12 / 13 / 14 / 15 '

end

if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000117') and DESCRIPTION  = 'Monthly Release Assessment - Jan 2020')
begin

update  csp..TASK set STATUS = 'CANCELLED' ,UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000117') and DESCRIPTION = 'Monthly Release Assessment - Jan 2020'

end

if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000166') and DESCRIPTION  = 'ERPPL-FY21-S03 / ERPPL-FY21-S04')
begin

update  csp..TASK set STATUS = 'CANCELLED',UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000166') and DESCRIPTION = 'ERPPL-FY21-S03 / ERPPL-FY21-S04'

end

if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000164') and DESCRIPTION  = 'ERP-CS-FY21-S03 / S04, ERP-CB-FY21-S03 / S04')
begin

update  csp..TASK set STATUS = 'CANCELLED',UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000164') and DESCRIPTION = 'ERP-CS-FY21-S03 / S04, ERP-CB-FY21-S03 / S04'

end

if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000136') and DESCRIPTION  = 'F21 Sprint-3 / Sprint-4')
begin

update  csp..TASK set STATUS = 'CANCELLED',UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000136') and DESCRIPTION = 'F21 Sprint-3 / Sprint-4'

end

if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000169') and DESCRIPTION  = 'IMS Monthly Assessment - Jan 2021')
begin

update  csp..TASK set STATUS = 'CANCELLED',UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000169') and DESCRIPTION = 'IMS Monthly Assessment - Jan 2021'

end

if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000121') and DESCRIPTION  = 'Sprint Release Assessment - Jan 2021')
begin

update  csp..TASK set STATUS = 'CANCELLED',UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000121') and DESCRIPTION = 'Sprint Release Assessment - Jan 2021'

end

if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000121') and DESCRIPTION  = 'Sprint Release Assessment - Jan 2021')
begin

update  csp..TASK set STATUS = 'CANCELLED',UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000121') and DESCRIPTION = 'Sprint Release Assessment - Jan 2021'

end


if exists (select 1 from csp..TASK where   PROJ_ID in (
'212P000120') and DESCRIPTION  = 'Sprint Release Assessment - Jan 2021')
begin

update  csp..TASK set STATUS = 'CANCELLED',UPDATED_BY = 102941 ,UPDATED_DATE = GETDATE() where PROJ_ID in (
'212P000120') and DESCRIPTION = 'Sprint Release Assessment - Jan 2021'

end


if exists (select 1 from csp..task where STATUS = 'PLANNED'  and DUE_DATE  < '2021-06-01' order by DUE_DATE desc)
begin

update csp..task set status = 'CANCELLED' ,UPDATED_BY = 101566 ,UPDATED_DATE = GETDATE() where STATUS = 'PLANNED'  and DUE_DATE  < '2021-06-01'

end
go



 if exists(Select 1 from sys.procedures where name ='getFindingsForProject' AND type='P')
begin
drop procedure dbo.getFindingsForProject
end
go
CREATE PROCEDURE dbo.getFindingsForProject     
 @projId varchar(50),    
 @serviceAreaId int    
AS    
BEGIN    
    
select find.SERVICE_AREA_ID,find.PROCESS_MODEL_ID,find.PROCESS_AREA_ID, find.PROCESS_ID    
from     
csp..AUDIT_CHECKLIST_PROJECT_FINDINGS find   
where  find.ISACTIVE = 1  and find.issubmitted = 1 and find.SERVICE_AREA_ID = @serviceAreaId    
and find.AUDIT_ID     
in (select exe.ASSESSMENT_ID from csp..AUDIT_CHECKLIST_EXECUTION_SUMMARY exe where exe.PROJECT_ID = @projId and exe.ISACTIVE = 1 and exe.ISSUBMITTED = 1 )    
    
END 
go