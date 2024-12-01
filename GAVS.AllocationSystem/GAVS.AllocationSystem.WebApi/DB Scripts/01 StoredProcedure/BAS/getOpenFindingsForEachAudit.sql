IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOpenFindingsForEachAudit' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOpenFindingsForEachAudit]
END
GO

CREATE procedure [dbo].getOpenFindingsForEachAudit 
        
@auditIds varchar(max)

AS

BEGIN

SELECT findings.AUDIT_ID, COUNT(*) as OPEN_FINDINGS
FROM AUDIT_CHECKLIST_PROJECT_FINDINGS findings  
INNER JOIN AUDIT_FINDING_STAGES_MAPPING AFM ON AFM.FINDING_ID = findings.ID AND AFM.ISACTIVE = 1  
LEFT JOIN AUDIT_FINDINGS_CAPA capa ON findings.id = capa.finding_id AND capa.isactive = 1 AND capa.issubmitted = 1  
WHERE capa.CORRECTIVE_ACTION_PLAN IS NULL AND capa.CAP_TARGET_DATE IS NULL   
    AND AFM.STAGE_ID = 1 AND AFM.STAGE_STATUS NOT IN ('Auditee Rejected')  
	AND findings.isactive = 1 AND findings.issubmitted = 1
	AND findings.AUDIT_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@auditIds,','))   
GROUP BY findings.AUDIT_ID
ORDER BY findings.AUDIT_ID

END
GO
