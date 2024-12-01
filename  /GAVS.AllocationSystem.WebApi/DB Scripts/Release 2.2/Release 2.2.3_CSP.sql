USE CSP    

GO


IF EXISTS(select 1 from sys.procedures where name ='usp_getcrispideas' and type='P')
BEGIN

DROP PROCEDURE usp_getcrispideas

END


GO

CREATE PROCEDURE [dbo].[usp_getcrispideas] 

@PROJECT_ID varchar(15),  
@START_DATE datetime,  
@END_DATE datetime  

AS  
BEGIN  

     --SELECT * INTO #IDEAS FROM PROJECT_INNOVATION where PROJECT_ID = @PROJECT_ID AND ISACTIVE = 1 AND STATUS != 'Completed'  AND              
     --  (IDENTIFIED_DATE >= @START_DATE AND IDENTIFIED_DATE <= @END_DATE)                

     SELECT * INTO #IDEAS FROM IDEA WHERE PROJECT_ID = @PROJECT_ID  
     AND ISACTIVE = 1  
     AND (IDENTIFIED_DATE >= @START_DATE  
     AND IDENTIFIED_DATE <= @END_DATE)  
  
     SELECT * INTO #ideations FROM csp..TASK WHERE TASK_CATEGORY_id = 16  
     AND proj_id = @PROJECT_ID  
     AND DUE_DATE BETWEEN @START_DATE AND @END_DATE  
  
     DECLARE @ideationMark bit  
  
     IF (EXISTS (SELECT * FROM #ideations) OR EXISTS (SELECT * FROM #IDEAS))  
          SET @ideationMark = 1;  
  
  
     IF EXISTS (SELECT * FROM #IDEAS)  
     BEGIN  
          SELECT I.ID,I.IDEA_STATUS_ID,IIS.TITLE,I.IDENTIFIED_DATE,I.DESCRIPTION,IIP.ESTIMATED_TARGET_DATE INTO #PASTDUEIDEAS FROM #IDEAS I
		  join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID
		  join IDEA_STATUS IIS ON I.IDEA_STATUS_ID = IIS.ID
		  WHERE (IIP.ESTIMATED_TARGET_DATE IS NULL  
          OR IIP.ESTIMATED_TARGET_DATE < @END_DATE)  
          AND (IIS.TITLE != 'Completed' OR IIS.TITLE != 'Implemented')  


          SELECT I.ID,IIT.TYPE,I.IDEA_STATUS_ID,IIS.TITLE,I.IDENTIFIED_DATE,I.DESCRIPTION,IIP.ESTIMATED_TARGET_DATE INTO #DUEFORCLOSUREINNOVATION FROM #IDEAS I
		  join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID
		  join IDEA_IMPROVEMENT_TYPE IIT on I.IDEA_IMPROVEMENT_TYPE_ID = IIT.ID
		  join IDEA_STATUS IIS ON I.IDEA_STATUS_ID = IIS.ID
		  WHERE IIP.ESTIMATED_TARGET_DATE >= @END_DATE  
          AND I.IDEA_IMPROVEMENT_TYPE_ID = 6
          
		  
		  --SELECT * INTO #DUEFORCLOSUREIDEAS FROM #IDEAS WHERE ISINNOVATION = 0  
  
          IF NOT EXISTS (SELECT * FROM #ideations)  
          BEGIN  
               IF EXISTS (SELECT * FROM #PASTDUEIDEAS) --OR EXISTS (SELECT * FROM #DUEFORCLOSUREIDEAS)                  
                    SELECT 'RED' AS IDEAS_TAG  
               ELSE   
                    SELECT 'AMBER' AS IDEAS_TAG  
          END  
  
  
          ELSE  
          IF (EXISTS (SELECT * FROM #DUEFORCLOSUREINNOVATION) AND @ideationMark = 1)  
               SELECT 'GREEN' AS IDEAS_TAG  
          ELSE  
               SELECT 'AMBER' AS IDEAS_TAG  
          --ELSE IF   EXISTS (SELECT * FROM #DUEFORCLOSUREIDEAS)                
          --SELECT 'RED' AS IDEAS_TAG                
  
          DROP TABLE #PASTDUEIDEAS  
          DROP TABLE #DUEFORCLOSUREINNOVATION  
         -- DROP TABLE #DUEFORCLOSUREIDEAS  
          DROP TABLE #ideations  
     END  
     ELSE  
     IF NOT EXISTS (SELECT * FROM #IDEAS) AND @ideationMark = 0  
          SELECT 'RED' AS IDEAS_TAG  
     ELSE  
          SELECT 'AMBER' AS IDEAS_TAG  
  
  DROP TABLE #IDEAS  
END

GO

IF EXISTS(select 1 from sys.procedures where name ='usp_getcrispimprovements' and type='P')
BEGIN

DROP PROCEDURE usp_getcrispimprovements

END


GO
  
  
CREATE PROCEDURE [dbo].[usp_getcrispimprovements]  
@PROJECT_ID varchar(15),  
@START_DATE datetime,  
@END_DATE datetime  

AS  
BEGIN  

--SELECT * INTO #IDEAS FROM PROJECT_INNOVATION where PROJECT_ID = @PROJECT_ID AND ISACTIVE = 1 AND STATUS != 'Completed'  AND  
 --  (IDENTIFIED_DATE >= @START_DATE AND IDENTIFIED_DATE <= @END_DATE)  
 SELECT * INTO #IDEAS FROM IDEA where PROJECT_ID = @PROJECT_ID AND ISACTIVE = 1   AND  
   (IDENTIFIED_DATE >= @START_DATE AND IDENTIFIED_DATE <= @END_DATE)  
 IF EXISTS(SELECT * FROM #IDEAS)   
 BEGIN  
  SELECT I.ID,I.IDEA_IMPROVEMENT_TYPE_ID,I.IDENTIFIED_DATE,IIP.ESTIMATED_TARGET_DATE INTO #PASTDUEIDEAS FROM #IDEAS I 
  join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID
  where (IIP.ESTIMATED_TARGET_DATE IS NULL OR IIP.ESTIMATED_TARGET_DATE < getdate())
  
  SELECT I.ID,I.IDEA_IMPROVEMENT_TYPE_ID,IIT.TYPE,I.IDENTIFIED_DATE,IIP.ESTIMATED_TARGET_DATE INTO #DUEFORCLOSUREIMPROVEMENTS FROM #IDEAS I
  join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID
  join IDEA_IMPROVEMENT_TYPE IIT on I.IDEA_IMPROVEMENT_TYPE_ID = IIT.ID 
  where  IIP.ESTIMATED_TARGET_DATE >= getdate() AND I.IDEA_IMPROVEMENT_TYPE_ID = 8  
  
  SELECT I.ID,I.IDEA_IMPROVEMENT_TYPE_ID,IIT.TYPE,I.IDENTIFIED_DATE,IIP.ESTIMATED_TARGET_DATE INTO #DUEFORCLOSUREIDEAS FROM #IDEAS I
  join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID
  join IDEA_IMPROVEMENT_TYPE IIT on I.IDEA_IMPROVEMENT_TYPE_ID = IIT.ID 
  WHERE I.IDEA_IMPROVEMENT_TYPE_ID = 8  
     
  IF EXISTS (SELECT * FROM #PASTDUEIDEAS)  
  SELECT 'RED' AS IDEAS_TAG  
    
  ELSE IF EXISTS (SELECT * FROM #DUEFORCLOSUREIMPROVEMENTS)  
  SELECT 'GREEN' AS IDEAS_TAG  
  
  ELSE IF NOT EXISTS (SELECT * FROM #DUEFORCLOSUREIDEAS)  
  SELECT 'RED' AS IDEAS_TAG  
  
  DROP TABLE #PASTDUEIDEAS    
  DROP TABLE #DUEFORCLOSUREIMPROVEMENTS    
  DROP TABLE #DUEFORCLOSUREIDEAS   
   
 END  
  ELSE IF NOT EXISTS(SELECT * FROM  #IDEAS)  
  SELECT 'RED' AS IDEAS_TAG    
 DROP TABLE #IDEAS    
END 

GO


--IF EXISTS(Select 1 from sys.procedures where name ='getIdeabyId' AND type='P')
--BEGIN
--       DROP PROCEDURE [dbo].[getIdeabyId]
--END
--GO

--create procedure
--getIdeabyId
--@id int
--as
--begin
--select  (select top 1 cust_id from bas..PROJECT where PROJ_ID = I.PROJECT_ID) [cust_id],  
--PP.PORTFOLIO_ID,* from IDEA I 
--left join PORTFOLIO_PROJECT PP ON I.PROJECT_ID = PP.PROJ_ID
--left join PORTFOLIO P ON PP.PORTFOLIO_ID = P.ID
--where I.ID = @id and I.ISACTIVE = 1  
--end

--GO



IF EXISTS(Select 1 from sys.procedures where name ='getAllProjectsNameForAPortfolioNew' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllProjectsNameForAPortfolioNew]
END

GO


CREATE PROCEDURE getAllProjectsNameForAPortfolioNew      
@PortfolioId integer      
      
AS      
BEGIN      
       
   select PR.PROJ_ID,PR.PROJ_NM from BAS.dbo.PROJECT PR      
   inner join PORTFOLIO_PROJECT PP on PP.PROJ_ID = PR.PROJ_ID      
   where PP.PORTFOLIO_ID = @PortfolioId      
END       

GO




 USE CSP
 GO

	if not exists(select 1 from sys.tables where name = 'csp..Backup_AUDIT_CHECKLIST_EXECUTION_DETAILS_2021_07_09')
	begin

		select * into  csp..Backup_AUDIT_CHECKLIST_EXECUTION_DETAILS_2021_07_09
		from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS

	end

	if exists (select 1 from  csp..AUDIT_CHECKLIST_EXECUTION_DETAILS where STATUS_CATEGORY='N/A' and ( SCORE > 0 or UPDATED_SCORE > 0))
	begin

	 update csp..AUDIT_CHECKLIST_EXECUTION_DETAILS set SCORE=0.00 ,UPDATED_SCORE=0.00 where STATUS_CATEGORY='N/A' and ( SCORE > 0 or UPDATED_SCORE > 0)

	end

if exists (select 1 from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where audit_id = 427 and id=310)
 begin

 update csp..AUDIT_CHECKLIST_PROJECT_FINDINGS set ISACTIVE=0 where audit_id = 427 and id=310

 end

 if exists (select 1 from csp..AUDITEE_ACCEPTANCE where  finding_id=310)
 begin

 update csp..AUDITEE_ACCEPTANCE set ISACTIVE=0 where finding_id=310

 end

 if exists (select 1 from csp..AUDIT_FINDING_STAGES_MAPPING where finding_id=310)
 begin

 update csp..AUDIT_FINDING_STAGES_MAPPING set ISACTIVE=0 where finding_id=310

 end


if exists (select 1 from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where audit_id = 406 and id=849)
 begin

 update csp..AUDIT_CHECKLIST_PROJECT_FINDINGS set ISACTIVE=0 where audit_id = 406 and id=849

 end

 if exists (select 1 from csp..AUDITEE_ACCEPTANCE where  finding_id=849)
 begin

 update csp..AUDITEE_ACCEPTANCE set ISACTIVE=0 where finding_id=849

 end

 if exists (select 1 from csp..AUDIT_FINDING_STAGES_MAPPING where finding_id=849)
 begin

 update csp..AUDIT_FINDING_STAGES_MAPPING set ISACTIVE=0 where finding_id=849

 end


if exists (select 1 from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where audit_id = 406 and id=851)
 begin

 update csp..AUDIT_CHECKLIST_PROJECT_FINDINGS set ISACTIVE=0 where audit_id = 406 and id=851

 end

 if exists (select 1 from csp..AUDITEE_ACCEPTANCE where finding_id=851)
 begin

 update csp..AUDITEE_ACCEPTANCE set ISACTIVE=0 where finding_id=851

 end

 if exists (select 1 from csp..AUDIT_FINDING_STAGES_MAPPING where finding_id=851)
 begin

 update csp..AUDIT_FINDING_STAGES_MAPPING set ISACTIVE=0 where finding_id=851

 end

if exists (select 1 from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where audit_id = 406 and id=845)
 begin

 update csp..AUDIT_CHECKLIST_PROJECT_FINDINGS set ISACTIVE=0 where audit_id = 406 and id=845

 end

 if exists (select 1 from csp..AUDITEE_ACCEPTANCE where  finding_id=845)
 begin

 update csp..AUDITEE_ACCEPTANCE set ISACTIVE=0 where finding_id=845

 end

 if exists (select 1 from csp..AUDIT_FINDING_STAGES_MAPPING where finding_id=845)
 begin

 update csp..AUDIT_FINDING_STAGES_MAPPING set ISACTIVE=0 where finding_id=845

 end

 if exists(select 1 from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where audit_id=503)
begin

update csp..AUDIT_CHECKLIST_PROJECT_FINDINGS set ISACTIVE=0 where 
 audit_id=503

end

if exists ( select 1 from csp..AUDITEE_ACCEPTANCE where finding_id in (select id from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where audit_id=503))
begin

update csp..AUDITEE_ACCEPTANCE set isactive=0 where finding_id in (select id from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where audit_id=503)

end

if exists (select 1 from csp..AUDIT_FINDING_STAGES_MAPPING where finding_id in (select id from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where audit_id=503))
begin

update csp..AUDIT_FINDING_STAGES_MAPPING set isactive=0 where finding_id in (select id from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where audit_id=503)

end


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
    
select  distinct @projId,find.SERVICE_AREA_ID,find.PROCESS_MODEL_ID,find.PROCESS_AREA_ID, find.PROCESS_ID    
from     
csp..AUDIT_CHECKLIST_PROJECT_FINDINGS find   
where  find.ISACTIVE=1  and find.SERVICE_AREA_ID=@serviceAreaId    
and find.AUDIT_ID     
in (select exe.ASSESSMENT_ID from csp..AUDIT_CHECKLIST_EXECUTION_SUMMARY exe where exe.PROJECT_ID=@projId and exe.ISACTIVE=1)    
    
END 
go