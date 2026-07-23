USE CSP 
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllFindingsByTypeforCustomer' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getAllFindingsByTypeforCustomer
END
GO

CREATE procedure
getAllFindingsByTypeforCustomer
as
begin
select  find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, SUMMARY.CUSTOMER_ID, SUMMARY.PROJECT_ID, find.created_date
from AUDIT_CHECKLIST_PROJECT_FINDINGS find
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY SUMMARY on find.AUDIT_ID = SUMMARY.ASSESSMENT_ID  and find.ISACTIVE = 1
and find.issubmitted = 1 and SUMMARY.ISACTIVE = 1
where not exists (select top 1* from AUDIT_FINDING_STAGES_MAPPING m where FINDING_ID = find.ID and ISACTIVE = 1 and ISCOMPLETE = 1 and
stage_id = (select top 1 id from AUDIT_FINDING_STAGES s WHERE m.STAGE_ID=s.ID   order by id desc))
AND    find.ISACTIVE=1
end


GO