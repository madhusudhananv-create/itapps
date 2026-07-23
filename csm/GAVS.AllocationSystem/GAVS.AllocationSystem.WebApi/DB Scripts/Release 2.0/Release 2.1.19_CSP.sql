USE CSP

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 0,
UPPER_BOUND_SCORE = 24,
level_title = 'Impeded',
level_desc = 'Impeded'
WHERE process_model_id = 11 AND level_number = 1

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 25,
UPPER_BOUND_SCORE = 49,
level_title = 'In Transition',
level_desc = 'In Transition'
WHERE process_model_id = 11 AND level_number = 2

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 50,
UPPER_BOUND_SCORE = 74,
level_title = 'Sustainable',
level_desc = 'Sustainable'
WHERE process_model_id = 11 AND level_number = 3

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 75,
UPPER_BOUND_SCORE = 94,
level_title = 'Agile',
level_desc = 'Agile'
WHERE process_model_id = 11 AND level_number = 4

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 95,
UPPER_BOUND_SCORE = 100,
level_title = 'Ideal',
level_desc = 'Ideal'
WHERE process_model_id = 11 AND level_number = 5

GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'GO_CATEGORY'
          AND Object_ID = Object_ID('FINDINGSTYPE_VALUES'))
BEGIN
   alter table FINDINGSTYPE_VALUES
   add  GO_CATEGORY VARCHAR(500) NULL
END

GO

UPDATE FINDINGSTYPE_VALUES
SET GO_CATEGORY = 'GO'
WHERE ID = 1

GO

UPDATE FINDINGSTYPE_VALUES
SET GO_CATEGORY = 'NO-GO'
WHERE ID = 2

GO

UPDATE FINDINGSTYPE_VALUES
SET GO_CATEGORY = 'GO'
WHERE ID = 3

GO

UPDATE FINDINGSTYPE_VALUES
SET GO_CATEGORY = 'NO-GO'
WHERE ID = 4

GO

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
   and (@question_id = -1 or find.APPLICABLE_QUESTIONS = @question_id) and value.FINDINGTYPE_CATEGORY = 'MANDATORY' 
  end 

  GO