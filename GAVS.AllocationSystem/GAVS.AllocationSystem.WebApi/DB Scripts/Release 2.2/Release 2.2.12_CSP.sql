
use csp

create table AUDIT_CHECKLIST_WEIGHTAGE_SCORES
(
ID int identity not null,
CHECKLIST_ID int not null,
WEIGHTAGE_ID int not null,
WEIGHTAGE_SCORE decimal(5,4) not null,
CREATED_BY int not null,
CREATED_DATE datetime not null default getdate(),
UPDATED_BY int,
UPDATED_DATE datetime default getdate(),
ISACTIVE bit not null default 1
)

if exists (select 1 from csp..AUDIT_CHECKLIST_WEIGHTAGE where WEIGHTAGE_TITLE  like '%MAJOR%')
begin

update CSP..PM_CHECKLIST_QUESTIONS set WEIGHTAGE_ID = 1 where WEIGHTAGE_ID = 8

update csp..AUDIT_CHECKLIST_WEIGHTAGE set WEIGHTAGE_TITLE = 'Major' where WEIGHTAGE_TITLE  like '%MAJOR%'

delete from CSP..AUDIT_CHECKLIST_WEIGHTAGE where ID in (8)

end

if exists (select 1 from csp..AUDIT_CHECKLIST_WEIGHTAGE where WEIGHTAGE_TITLE  like '%MINOR%')
begin

update CSP..PM_CHECKLIST_QUESTIONS set WEIGHTAGE_ID = 2 where WEIGHTAGE_ID in (5,9)

update csp..AUDIT_CHECKLIST_WEIGHTAGE set WEIGHTAGE_TITLE = 'Minor' where WEIGHTAGE_TITLE  like '%MINOR%'


delete from CSP..AUDIT_CHECKLIST_WEIGHTAGE where ID in (5,9)

end

if exists (select 1 from csp..AUDIT_CHECKLIST_WEIGHTAGE where WEIGHTAGE_TITLE  like '%MANDATORY%')
begin

update CSP..PM_CHECKLIST_QUESTIONS set WEIGHTAGE_ID = 3 where WEIGHTAGE_ID in (4,7)

update csp..AUDIT_CHECKLIST_WEIGHTAGE set WEIGHTAGE_TITLE = 'Mandatory' where WEIGHTAGE_TITLE  like '%MANDATORY%'

delete from CSP..AUDIT_CHECKLIST_WEIGHTAGE where ID in (4,7)

end

if exists (select 1 from csp..AUDIT_CHECKLIST_WEIGHTAGE where WEIGHTAGE_TITLE  like '%0.5%')
begin

delete from CSP..AUDIT_CHECKLIST_WEIGHTAGE where ID in (6)

end

dbcc checkident('PM_CHECKLIST_QUESTIONS',reseed,3)

update CSP..AUDIT_CHECKLIST_WEIGHTAGE set WEIGHTAGE_ID = id

declare checklistcursor cursor  
scroll for  
select ID from CSP..PM_CHECKLIST where IS_WEIGHTAGE_APPLICABLE = 1 and ISACTIVE = 1 order by ID 
  
Declare @checklistId int  
Declare @createdBy varchar(10)= '104474'
Declare @createdDate datetime = getdate()


open checklistcursor  
  
fetch first from checklistcursor into @checklistId

if not exists (select 1 from CSP..AUDIT_CHECKLIST_WEIGHTAGE_SCORES where CHECKLIST_ID = @checklistId and ISACTIVE = 1)
begin

 insert into CSP..AUDIT_CHECKLIST_WEIGHTAGE_SCORES values 
 (@checklistId,1,0.5000,@createdBy,@createdDate,@createdBy,@createdDate,1),
 (@checklistId,2,0.2500,@createdBy,@createdDate,@createdBy,@createdDate,1),
 (@checklistId,3,2.0000,@createdBy,@createdDate,@createdBy,@createdDate,1)

end


while @@FETCH_STATUS=0  
begin  
  
fetch next from checklistcursor into @checklistId
  if not exists (select 1 from CSP..AUDIT_CHECKLIST_WEIGHTAGE_SCORES where CHECKLIST_ID = @checklistId and ISACTIVE = 1)
begin

 insert into CSP..AUDIT_CHECKLIST_WEIGHTAGE_SCORES values 
 (@checklistId,1,0.5000,@createdBy,@createdDate,@createdBy,@createdDate,1),
 (@checklistId,2,0.2500,@createdBy,@createdDate,@createdBy,@createdDate,1),
 (@checklistId,3,2.0000,@createdBy,@createdDate,@createdBy,@createdDate,1)

end

  
end  
  
close checklistcursor  
  
deallocate checklistcursor  
go

IF EXISTS(Select 1 from sys.procedures where name ='getWeightageForChecklist' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getWeightageForChecklist]
END
GO 

CREATE PROCEDURE [dbo].getWeightageForChecklist 
@checklistId  int      
AS                    
BEGIN        

select wgt.ID,chkwgt.CHECKLIST_ID, wgt.WEIGHTAGE_ID as WEIGHTAGE_ID,wgt.WEIGHTAGE_TITLE,chkwgt.WEIGHTAGE_SCORE , chkwgt.CREATED_BY,chkwgt.CREATED_DATE , 
chkwgt.UPDATED_BY,chkwgt.UPDATED_DATE,chkwgt.ISACTIVE,cast(1 as bit) as 'IS_CHECKED'
from CSP..AUDIT_CHECKLIST_WEIGHTAGE  wgt 
join
CSP..AUDIT_CHECKLIST_WEIGHTAGE_SCORES chkwgt on wgt.ID = chkwgt.WEIGHTAGE_ID and chkwgt.CHECKLIST_ID = @checklistId and chkwgt.ISACTIVE = 1 and wgt.ISACTIVE = 1
union all
select wgt.ID as ID,@checklistId as CHECKLIST_ID, wgt.WEIGHTAGE_ID as WEIGHTAGE_ID, wgt.WEIGHTAGE_TITLE,wgt.WEIGHTAGE_SCORE , wgt.CREATED_BY,wgt.CREATED_DATE , wgt.UPDATED_BY,wgt.UPDATED_DATE,
wgt.ISACTIVE, cast(0 as bit) as 'IS_CHECKED'
from CSP..AUDIT_CHECKLIST_WEIGHTAGE  wgt where wgt.ISACTIVE = 1 and wgt.WEIGHTAGE_ID not in (select chkwgt.WEIGHTAGE_ID from CSP..AUDIT_CHECKLIST_WEIGHTAGE_SCORES chkwgt 
where chkwgt.CHECKLIST_ID = @checklistId and chkwgt.ISACTIVE = 1)
order by WEIGHTAGE_ID          
                    
END 
go


IF EXISTS(Select 1 from sys.procedures where name ='getCheckPointsforProjectNew' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCheckPointsforProjectNew]
END
GO 
CREATE PROCEDURE getCheckPointsforProjectNew  
 @CUSTOMER_ID int,   
 @PROJECT_ID varchar(50),    
 @SERVICE_AREAS  varchar(max)   
 AS    
 BEGIN   
 SELECT DISTINCT CONF.CUST_ID AS 'CUSTOMER_ID',CONF.PROJ_ID as 'PROJECT_ID',  
 area.id as SERVICE_AREA_ID,AREA.TITLE AS SERVICE_AREA_NAME,  
 model.ID as PROCESS_MODEL_ID, model.DESCRIPTION as PROCESS_MODEL_DESCRIPTION,                  
 PROCESS.id as process_id, PROCESS.TITLE AS PROCESS_DESCRIPTION,  
 CHKWEIGHTSCORE.WEIGHTAGE_ID as WEIGHTAGE_ID, CHKWEIGHTSCORE.WEIGHTAGE_SCORE, WEIGHT.WEIGHTAGE_TITLE,  
 QUES.ID AS PM_CHECKLIST_QUESTION_ID ,CHK.VERSION AS VERSION_ID, QUES.TITLE AS 'LOOK_FOR',   
 CHK.status_list_id AS 'STATUS_LIST_ID' ,chk.FINDINGSTYPE_ID,     
 chk.TITLE as CHECKLIST_NAME,chk.ID as CHECKLIST_ID, chk.VERSION as VERSION_ID,   
 chk.CORRECTIVE_ACTION_TRACKING as CORRECTIVE_ACTION_TRACKING,chk.IS_WEIGHTAGE_APPLICABLE ,chk.MATURITY_LEVEL,chk.process_model_id AS 'MAPPED_PROCESS_MODEL',  
 MAPP.display_order, QUES.CHECKLIST_ID, PA.ID as PROCESS_AREA_ID,  
 PA.TITLE as PROCESS_AREA_DESCRIPTION,chk.EFFECTIVE_FROM as CHECKLIST_EFFECTIVE_FROM   
 FROM PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING CONF             
 INNER JOIN PROCESS PROCESS on PROCESS.ID = CONF.PROCESS_ID AND PROCESS.ISACTIVE = 1  
 INNER JOIN PROCESS_MODEL_PROCESS_MAPPING PRO on PRO.PROCESS_ID = process.ID  AND PRO.ISACTIVE = 1 AND CONF.ISACTIVE = 1  
 INNER JOIN pm_process_questions_mapping MAPP on MAPP.PROCESS_ID = CONF.PROCESS_ID  and   MAPP.SERVICE_AREA_ID = CONF.SERVICE_AREA_ID AND MAPP.ISACTIVE = 1                                          
 INNER JOIN PM_CHECKLIST_QUESTIONS QUES ON QUES.ID = MAPP.question_id AND QUES.ISACTIVE = 1     
 INNER JOIN PM_CHECKLIST CHK ON CHK.ID = QUES.CHECKLIST_ID AND CHK.ISACTIVE = 1 and CHK.EFFECTIVE_FROM <= GETDATE()          
 INNER JOIN PROCESS_SERVICE_AREA_NEW AREA on AREA.ID = CONF.SERVICE_AREA_ID  AND AREA.ISACTIVE = 1     
 AND (@SERVICE_AREAS = '' or (AREA.ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@SERVICE_AREAS,','))))   
 INNER JOIN PROCESS_MODEL MODEL on MODEL.ID = CONF.PROCESS_MODEL_ID  AND MODEL.ISACTIVE =1   
 INNER JOIN PROCESS_AREA PA on PA.ID = MAPP.PROCESS_AREA_ID and PA.ISACTIVE = 1
 LEFT JOIN AUDIT_CHECKLIST_WEIGHTAGE WEIGHT on WEIGHT.WEIGHTAGE_ID = QUES.WEIGHTAGE_ID   
 LEFT JOIN AUDIT_CHECKLIST_WEIGHTAGE_SCORES  CHKWEIGHTSCORE on CHKWEIGHTSCORE.CHECKLIST_ID = CHK.ID and CHKWEIGHTSCORE.ISACTIVE = 1 and CHKWEIGHTSCORE.WEIGHTAGE_ID = WEIGHT.WEIGHTAGE_ID
 where CONF.PROJ_ID = @PROJECT_ID and CONF.CUST_ID = @CUSTOMER_ID     
 order by QUES.CHECKLIST_ID, AREA.ID, PROCESS.ID, MAPP.display_order asc   
 END 
 GO


IF EXISTS(Select 1 from sys.procedures where name ='getWeightageForAllChecklist' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getWeightageForAllChecklist]
END
GO 
CREATE PROCEDURE [dbo].getWeightageForAllChecklist 
AS                      
BEGIN          
  
 select wgt.ID,chkwgt.CHECKLIST_ID, wgt.WEIGHTAGE_ID as WEIGHTAGE_ID,wgt.WEIGHTAGE_TITLE,chkwgt.WEIGHTAGE_SCORE , chkwgt.CREATED_BY,chkwgt.CREATED_DATE ,   
 chkwgt.UPDATED_BY,chkwgt.UPDATED_DATE,chkwgt.ISACTIVE
 from CSP..AUDIT_CHECKLIST_WEIGHTAGE  wgt   
 join  
 CSP..AUDIT_CHECKLIST_WEIGHTAGE_SCORES chkwgt on wgt.ID = chkwgt.WEIGHTAGE_ID and chkwgt.ISACTIVE = 1 and wgt.ISACTIVE = 1  
 order by chkwgt.CHECKLIST_ID,wgt.WEIGHTAGE_ID            
                      
END
GO

IF EXISTS(Select 1 from sys.procedures where name ='getChecklistUsedInAssessment' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getChecklistUsedInAssessment]
END
GO 
CREATE PROCEDURE [dbo].getChecklistUsedInAssessment 
AS                      
BEGIN          
  
 select A.CHECKLIST_ID,A.ASSESSMENT_ID,A.AUDIT_TITLE from CSP..PM_CHECKLIST C
 join
 CSP..AUDIT_CHECKLIST_EXECUTION_SUMMARY A on C.ID = A.CHECKLIST_ID and C.ISACTIVE = 1 and A.ISACTIVE = 1
                      
END
GO