USE BAS
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCAPAStageID' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getCAPAStageID
END
GO

CREATE Procedure getCAPAStageID

@detailIds varchar(max)

as
begin

;with cte
AS
(
select KD.ID as DETAIL_ID,
[IMPLEMENTATION] = (select COUNT(DISTINCT IMP.KPI_DETAILS_ID) from AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1 and IMP.ISIMPLEMENTED=1),      
[VERIFICATION] = (select COUNT(DISTINCT VER.KPI_DETAILS_ID)  from AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1 and VER.ISVERIFIED=1),      
(select max(stage_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE,   
(select max(stage_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where AFSM.KPI_DETAILS_ID = KD.ID and AFSM.ISCOMPLETE=0 and AFSM.STAGE_STATUS='Corrective Action Plan Resubmit' and AFSM.ISACTIVE=1) as RESUBMISSION

from KPI_DETAILS KD where KD.ISACTIVE=1 and KD.ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@detailIds,','))
)
SELECT DETAIL_ID,CAPA_STAGE_ID=(case when RESUBMISSION = 1 then 0 
when CAPA_STAGE = 5 and IMPLEMENTATION = 1 and VERIFICATION = 0 then 3  
when CAPA_STAGE = 5 and IMPLEMENTATION = 1 and VERIFICATION = 1 then 4 else CAPA_STAGE End)
from CTE                                                                           
end
Go
