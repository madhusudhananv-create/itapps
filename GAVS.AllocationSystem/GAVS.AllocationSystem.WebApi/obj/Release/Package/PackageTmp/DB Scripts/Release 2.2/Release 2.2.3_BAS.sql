
Use BAS
GO

IF not exists(SELECT 1 FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='List of Events and Tasks')
BEGIN
	INSERT INTO bas..REPORTS_SP_DETAILS VALUES ('reports_getListofEventsandTasks', 'List of Events and Tasks', 'BAS');
END

GO


IF not exists(SELECT 1 FROM bas..REPORTS_PARAMS where [REPORT_SP_ID] = (SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='List of Events and Tasks'))
BEGIN

 DECLARE @ReportID INT SET @ReportID=(SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] = 'List of Events and Tasks')

	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'StartDate', 'DATE', '2021-06-01');
     INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'EndDate', 'DATE', '2021-07-09');
	 
END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getListofEventsandTasks' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getListofEventsandTasks]
END
GO

CREATE PROCEDURE                                
  dbo.reports_getListofEventsandTasks                        
  @startDate Datetime,                      
  @endDate Datetime                   
                
  AS                                
  BEGIN    
  

  select c.CUST_NM ,P.PROJ_NM,TP.TITLE AS Type,TC.TITLE as Category,
  T.DESCRIPTION As [Audit / Assessment Title],T.ID AS [Task / Event Id],
  [Appraiser Name  / Auditor Name]=(select E.frst_nm from bas..emp_info E where E.EMP_ID = S.AUDITOR_ID),
  STUFF((select ',' + E.FRST_NM from bas..emp_info E join
    csp..CHECKLIST_EXECUTION_AUDITEE_DETAILS auditee on E.EMP_ID = auditee.AUDITEE_EMP_ID 
    and auditee.ISACTIVE=1 and auditee.AUDIT_ID = T.ID 
    for xml path ('')),1,1,''
  )as [Appraisee Name(s) / Auditee Name (s)],
	Format(T.SCHEDULED_START_DATE,'yyyy-MM-dd')SCHEDULED_START_DATE ,
	Format(T.DUE_DATE,'yyyy-MM-dd')DUE_DATE,
	Format(S.PLANNED_AUDIT_START_DATE,'yyyy-MM-dd')PLANNED_AUDIT_START_DATE,
	Format(S.PLANNED_AUDIT_END_DATE,'yyyy-MM-dd')PLANNED_AUDIT_END_DATE
	,Format(S.ACTUAL_AUDIT_START_DATE,'yyyy-MM-dd')ACTUAL_AUDIT_START_DATE,
	Format(S.ACTUAL_AUDIT_END_DATE,'yyyy-MM-dd')ACTUAL_AUDIT_END_DATE,S.AUDIT_PLANNED_HOURS,
	T.STATUS,T.CUST_ID,T.PROJ_ID
	from csp..TASK T
	join bas..CUSTOMER c on t.CUST_ID = c.CUST_ID                          
	join bas..PROJECT p on t.PROJ_ID = p.PROJ_ID  
	join 
	csp..TASK_TYPE TP on t.TASK_TYPE_ID = Tp.ID and T.ISACTIVE=1 and tp.ISACTIVE=1
	join 
	csp..TASK_CATEGORY TC on t.TASK_CATEGORY_ID = TC.id and TC.ISACTIVE=1
	join 
	csp..AUDIT_CHECKLIST_EXECUTION_SUMMARY S ON T.ID = S.ASSESSMENT_ID and s.ISACTIVE=1
  where t.DUE_DATE between @startDate and @endDate  
  order by C.CUST_ID, P.PROJ_ID --,T.DUE_DATE desc,T.ID desc,T.STATUS            
  
 END   
 GO