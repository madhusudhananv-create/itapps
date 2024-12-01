
use bas
go

IF not exists(SELECT 1 FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='All Assessment Compliance Report')
BEGIN
	INSERT INTO bas..REPORTS_SP_DETAILS VALUES ('reports_getAllAssessmentProcessModelComplianceScore', 'All Assessment Compliance Report', 'BAS');
END

GO


IF not exists(SELECT 1 FROM bas..REPORTS_PARAMS where [REPORT_SP_ID] = (SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='All Assessment Compliance Report'))
BEGIN

 DECLARE @ReportID INT SET @ReportID=(SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='All Assessment Compliance Report')

	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'StartDate', 'DATE', '2020-04-01');
     INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'EndDate', 'DATE', '2021-06-29');
	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'CustomerID', 'CUSTOMERID', '201100010');
END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getAllAssessmentProcessModelComplianceScore' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getAllAssessmentProcessModelComplianceScore]
END
GO

CREATE PROCEDURE                              
  dbo.reports_getAllAssessmentProcessModelComplianceScore                      
  @startDate Datetime,                    
  @endDate Datetime,                  
  @customerid int=0                  
  AS                              
  BEGIN          
          
   select  c.CUST_NM ,portfolio.TITLE as [Portfolio Name],  p.PROJ_NM,              
   AUDIT_TITLE [Assessment title],               
   Convert(varchar,Actual_audit_end_date,107) [Assessment End Date], chk.TITLE + '(' + cast(chk.VERSION as varchar) +' - ' + Convert(varchar,chk.EFFECTIVE_FROM,23)+')' as [Checklist Used ],   
   [Agile Scrum Compliance Score]=(select  top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=11 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1) group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),        
   [Agile Scrum Compliance Score Percentage ( % ) ]=        
   cast(((select  top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=11 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1) group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=11 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 )as decimal(5,2)),        
        
   [BMS - Integrated Standards Compliance Score]=(select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
       and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=14  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
    in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),        
   [BMS - Integrated Standards Compliance Score Percentage ( % )]=        
   cast(((select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=14  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=14 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100) as decimal(5,2)),        
        
   [HIPAA Compliance Score]=        
   (select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=5  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),               
           
   [HIPAA Compliance Score Percentage ( % )]=        
   cast(((select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=5  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=5 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100) as decimal(5,2)),        
           
           
   [ITIL4 Compliance Score]=(select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=12  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),        
        
   [ITIL4 Compliance Score Percentage ( % )]=        
   cast(((select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=12  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID in   
       (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=12 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID in   
       (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),        
           
        
        
   [ITSM Compliance Score]=(select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=4  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),        
        
   [ITSM Compliance Score Percentage ( % )]=        
   cast(((select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=4  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=4 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100) as decimal(5,2)),        
           
        
   [ISMS Compliance Score]=(select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=3  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),        
        
   [ISMS Compliance Score Percentage ( % )]=        
   cast(((select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=3  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=3 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),        
           
        
   [OHSAS Compliance Score]=(select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=6  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),        
        
   [OHSAS Compliance Score Percentage ( % )]=        
   cast(((select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=6  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=6 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),        
           
        
   [PCI-DSS Compliance Score]=(select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=7  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),        
        
   [PCI-DSS Compliance Score Percentage ( % )]=        
   cast(((select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=7  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=7 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),        
        
        
   [PMI-PMBOK Compliance Score]=(select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=9  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),        
      
  [PMI-PMBOK Compliance Score Percentage ( % )]=        
  cast(((select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=9  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=9 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),        
        
        
        
   [QMS Compliance Score]=(select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=2  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),        
        
   [QMS Compliance Score Percentage ( % )]=cast(((select top 1 sum(score) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=2  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /         
       nullif((select  top 1 sum(dtls.MAX_SCORE) from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID         
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=2 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID   
       in (select id from csp..PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)  
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)) ,  
     c.CUST_ID ,  p.PROJ_ID  
           
   from CSP..TASK t                            
                         
  inner join bas..CUSTOMER c on t.CUST_ID = c.CUST_ID                            
  inner join bas..PROJECT p on t.PROJ_ID = p.PROJ_ID                  
  inner join CSP..AUDIT_CHECKLIST_EXECUTION_SUMMARY find on t.id = find.assessment_ID and find.ISACTIVE = 1     
  inner join CSP..PM_CHECKLIST CHK ON find.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1   
     
  left join  csp..portfolio_Project portproj on t.CUST_ID = portproj.CUST_ID and t.PROJ_ID=portproj.PROJ_ID and portproj.ISACTIVE=1    
  left join  csp..PORTFOLIO portfolio on portproj.PORTFOLIO_ID = portfolio.ID and portfolio.ISACTIVE=1    
              
 WHERE  t.DUE_DATE between @startDate and @endDate and (@customerid=0 or  c.CUst_id = @customerid)      
                  
 ORDER by  c.CUST_NM, p.PROJ_NM,   [PLANNED_AUDIT_START_DATE] desc, [Assessment title] ,find.assessment_ID desc         
                         
 END 
 GO


 if exists(select 1 from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS  where STATUS_CATEGORY='MET' and MAX_SCORE = 0)
 begin
    update csp..AUDIT_CHECKLIST_EXECUTION_DETAILS set MAX_SCORE=SCORE where STATUS_CATEGORY='MET' and MAX_SCORE = 0
 end
 go

 if exists(select 1 from csp..AUDIT_CHECKLIST_EXECUTION_DETAILS  where  STATUS_CATEGORY='N/A' and MAX_SCORE > 0)
 begin
   update csp..AUDIT_CHECKLIST_EXECUTION_DETAILS set MAX_SCORE=0 where  STATUS_CATEGORY='N/A' and MAX_SCORE > 0
 end
 go 



  
  
IF not exists(SELECT 1 FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Process Health by Audits')
BEGIN
	INSERT INTO bas..REPORTS_SP_DETAILS VALUES ('reports_getMonthlyProcessHealthbyAudits', 'Monthly Process Health by Audits', 'BAS');
END

GO


IF not exists(SELECT 1 FROM bas..REPORTS_PARAMS where [REPORT_SP_ID] = (SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Process Health by Audits'))
BEGIN

 DECLARE @ReportID INT SET @ReportID=(SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Process Health by Audits')

	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'StartDate', 'DATE', '2020-04-01');
     INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'EndDate', 'DATE', '2021-07-01');
	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'CustomerID', 'CUSTOMERID', '201100010');
END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getMonthlyProcessHealthbyAudits' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMonthlyProcessHealthbyAudits]
END
GO

CREATE PROCEDURE                                
  dbo.reports_getMonthlyProcessHealthbyAudits                        
  @startDate Datetime,                      
  @endDate Datetime,                    
  @customerid int=0                    
  AS                                
  BEGIN            
            
  select FORMAT(t.DUE_DATE,'MMMM - yyyy') AS [Auidt Period],summ.AUDIT_TITLE,  
  c.CUST_NM,portfolio.TITLE as [Portfolio Name],p.PROJ_NM,chk.TITLE + '(' + cast(chk.VERSION as varchar) +' - ' + convert(varchar,chk.EFFECTIVE_FROM,23)+')' as [Checklist Used ],  
  sum(dtls.MAX_SCORE) as [Max Score],summ.score as [Actual Score],summ.PERCENTAGE_SCORE as [Process  Compliance ( % )]    
  from CSP..TASK t                        
                       
  inner join bas..CUSTOMER c on t.CUST_ID = c.CUST_ID                          
  inner join bas..PROJECT p on t.PROJ_ID = p.PROJ_ID     
  inner join CSP..AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ on t.ID=summ.ASSESSMENT_ID and summ.ISACTIVE=1   
  inner join CSP..PM_CHECKLIST CHK ON summ.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1   
  inner join csp..PM_CHECKLIST_QUESTIONS qus on summ.CHECKLIST_ID=qus.CHECKLIST_ID and qus.ISACTIVE=1  
  inner join csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and qus.ID=dtls.PM_CHECKLIST_QUESTION_ID and dtls.ISACTIVE=1  
  left join  csp..portfolio_Project portproj on t.CUST_ID = portproj.CUST_ID and t.PROJ_ID=portproj.PROJ_ID and portproj.ISACTIVE=1      
  left join  csp..PORTFOLIO portfolio on portproj.PORTFOLIO_ID = portfolio.ID and portfolio.ISACTIVE=1        
  where t.DUE_DATE between @startDate and @endDate and (@customerid=0 or  c.CUst_id = @customerid)   
  group by FORMAT(t.DUE_DATE,'MMMM - yyyy'),summ.ASSESSMENT_ID,summ.AUDIT_TITLE,c.CUST_NM,p.PROJ_NM,summ.score,summ.PERCENTAGE_SCORE,chk.TITLE,t.DUE_DATE,chk.VERSION,chk.EFFECTIVE_FROM,portfolio.TITLE  
  order by  year(t.DUE_DATE) desc, month(t.DUE_DATE) desc,summ.ASSESSMENT_ID desc,c.CUST_NM asc,p.PROJ_NM asc 
 END   
 GO


 IF  exists(SELECT 1 FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='All Assessment Compliance Report')
BEGIN
	update  bas..REPORTS_SP_DETAILS set [SP_DISPLAY_NAME] ='Process Compliance Score By Process Model' where [SP_DISPLAY_NAME] ='All Assessment Compliance Report'
END

GO