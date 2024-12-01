IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getMonthlyProcessHealthbyAudits' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMonthlyProcessHealthbyAudits]
END
GO

CREATE PROCEDURE [dbo].[reports_getMonthlyProcessHealthbyAudits]                          
  
@startDate Datetime,                        
@endDate Datetime,                      
@customerid varchar(50)='0'    

AS                                  
BEGIN              
              
select FORMAT(t.DUE_DATE,'MMMM - yyyy') AS [Auidt Period],summ.AUDIT_TITLE,    
c.CUST_NM,portfolio.TITLE as [Portfolio Name],p.PROJ_NM,chk.TITLE + '(' + cast(chk.VERSION as varchar) +' - ' + convert(varchar,chk.EFFECTIVE_FROM,23)+')' as [Checklist Used ],    
sum(dtls.MAX_SCORE) as [Max Score],summ.score as [Actual Score],summ.PERCENTAGE_SCORE as [Process  Compliance ( % )],
summ.UPDATED_SCORE as [CURRENT_SCORE],summ.UPDATED_PERCENTAGE_SCORE as [CURRENT_PROCESS_COMPLIANCE_PERCENTAGE ( % )]
from TASK t                          
                         
inner join CUSTOMER c on t.CUST_ID = c.CUST_ID                            
inner join PROJECT p on t.PROJ_ID = p.PROJ_ID       
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ on t.ID=summ.ASSESSMENT_ID and summ.ISACTIVE=1     
inner join PM_CHECKLIST CHK ON summ.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1     
inner join PM_CHECKLIST_QUESTIONS qus on summ.CHECKLIST_ID=qus.CHECKLIST_ID and qus.ISACTIVE=1    
inner join AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and qus.ID=dtls.PM_CHECKLIST_QUESTION_ID and dtls.ISACTIVE=1    
left join  portfolio_Project portproj on t.CUST_ID = portproj.CUST_ID and t.PROJ_ID=portproj.PROJ_ID and portproj.ISACTIVE=1        
left join  PORTFOLIO portfolio on portproj.PORTFOLIO_ID = portfolio.ID and portfolio.ISACTIVE=1          
where t.DUE_DATE between @startDate and @endDate and (@customerid='0' or  c.CUst_id = @customerid)     
group by FORMAT(t.DUE_DATE,'MMMM - yyyy'),summ.ASSESSMENT_ID,summ.AUDIT_TITLE,c.CUST_NM,p.PROJ_NM,summ.score,summ.PERCENTAGE_SCORE,
summ.UPDATED_SCORE,summ.UPDATED_PERCENTAGE_SCORE,chk.TITLE,t.DUE_DATE,chk.VERSION,chk.EFFECTIVE_FROM,portfolio.TITLE    
order by  year(t.DUE_DATE) desc, month(t.DUE_DATE) desc,summ.ASSESSMENT_ID desc,c.CUST_NM asc,p.PROJ_NM asc   
END
GO
