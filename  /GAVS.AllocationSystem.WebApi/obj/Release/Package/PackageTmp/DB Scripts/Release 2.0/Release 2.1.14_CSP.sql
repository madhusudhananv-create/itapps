IF EXISTS(Select 1 from sys.objects where name ='getFindingsForAuditWithStatus' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getFindingsForAuditWithStatus]
END

GO

CREATE procedure getFindingsForAuditWithStatus
  @audit_id int,
  @question_id int
  as
  begin
	  select find.*, exe.CURRENT_STATUS, value.FINDINGTYPE_CATEGORY, accept.status , 
	  (select top 1 ISCOMPLETE from AUDIT_FINDING_STAGES_MAPPING where finding_id = find.ID and isactive  = 1 order by STAGE_ID desc) AS ISCOMPLETE
	  from AUDIT_CHECKLIST_PROJECT_FINDINGS find 
	  inner join AUDIT_CHECKLIST_PROJECT_EXECUTION exe
	  on  find.AUDIT_ID = exe.AUDIT_ID and find.SERVICE_AREA_ID = exe.SERVICE_AREA_ID  and find.APPLICABLE_QUESTIONS = exe.APPLICABLE_QUESTIONS
	  and find.PROCESS_AREA_ID = exe.PROCESS_AREA_ID and find.process_model_id = exe.process_model_id and find.PROCESS_ID = exe.PROCESS_ID
	  inner join FINDINGSTYPE_VALUES value on find.FINDING_TYPE = value.FINDINGTYPE_VALUE and value.isactive = 1
	 left join AUDITEE_ACCEPTANCE accept on find.ID = accept.finding_id and accept.isactive = 1 and accept.ISSUBMITTED = 1
	  where find.ISACTIVE = 1 and find.issubmitted = 1 and exe.ISACTIVE = 1 and exe.ISSUBMITTED = 1 and find.AUDIT_ID = @audit_id 
	  and (@question_id = -1 or find.APPLICABLE_QUESTIONS = @question_id) and exe.CURRENT_STATUS = 'NMET' 
  end

  GO


IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'MAIL_SENT'
          AND Object_ID = Object_ID('CHECKLIST_SCORES_BY_AUDIT'))
BEGIN
   alter table CHECKLIST_SCORES_BY_AUDIT
   add MAIL_SENT bit
END

GO

update CHECKLIST_SCORES_BY_AUDIT
set mail_sent  = 1 