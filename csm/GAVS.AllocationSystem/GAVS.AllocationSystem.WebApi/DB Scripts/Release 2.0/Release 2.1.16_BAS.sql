USE BAS

GO


IF EXISTS(Select 1 from sys.objects where name ='getMandatoryTrainingComplianceReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getMandatoryTrainingComplianceReport]
END

GO
 
CREATE PROCEDURE [dbo].[getMandatoryTrainingComplianceReport]                                  
 @startdate datetime,   
 @enddate datetime,  
 @customerid int  ,
 @projectid varchar(max) =''
                                
  AS                                  
  BEGIN                                  
 --          select cu.cust_nm, p.proj_nm,  h.COMPLIANCE_TRAINING_TITLE, c.emp_id, c.emp_name, convert(varchar, convert(date,c.date_of_completion)), c.attempted, c.correct_answers, c.total_marks,c.Total_percentage, c.result, p.quality_spoc from project p 
  
 --inner join proj_resource pr on p.proj_id = pr.proj_id  
 --inner join COMPLIANCE_TRAINING_ASSESSMENT_RESULT c on pr.emp_Id = c.emp_id  
 --inner join COMPLIANCE_TRAINING_ASSESSMENT_HEADER h on h.id = c.title_id  
 --inner join customer cu on cu.cust_id = p.cust_id  
 --where isnull(p.proj_status, '')!='close' and cu.cust_id = @customeridconvert(varchar, getdate(), 107)  
 --and c.date_of_completion between  @startdate and @enddate  
 --and pr.id is not null and pr.end_date > @startdate order by 1, 2, compliance_training_title, emp_name,  date_of_Completion  
 select cu.cust_nm, p.proj_nm,    pr.emp_id, emp_name =(select frst_nm from emp_info e where e.emp_id = pr.emp_id), [Allocation_End_Date] =convert(varchar,pr.end_date, 107), quality_spoc = ( select frst_nm from emp_info e where e.emp_id = p.quality_spoc),
  
 [Fundamentals_of_Quality_Certification] = (select top 1   concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')   from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =1 and r.emp_id = pr.emp_id and  r.date_of_completion between @startdate and @enddate order by r.date_of_completion ),  
 [HIPAA_Internal_Compliance_Certification] = (select top 1  concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')  from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =2 and r.emp_id = pr.emp_id and  r.date_of_completion between @startdate and @enddate order by r.date_of_completion ),  
 [Information_Security_Awareness_Certification] = (select top 1  concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')  from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =3 and r.emp_id = pr.emp_id and  r.date_of_completion
 between @startdate and @enddate order by r.date_of_completion ),  
 [OHSAS_Internal_Certification] = (select top 1  concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')  from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =4 and r.emp_id = pr.emp_id and  r.date_of_completion between @startdate and @enddate order by r.date_of_completion ),  
 [PCI_DSS_Compliance_Certification] = (select top 1  concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')  from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =5 and r.emp_id = pr.emp_id and  r.date_of_completion between @startdate and @enddate order by r.date_of_completion ),  
 [GDPR_Certification] = (select top 1  concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')  from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =6 and r.emp_id = pr.emp_id and  r.date_of_completion between @startdate and @enddate order by r.date_of_completion ),  
 [Secure_Coding_OWASP_Certification] = (select top 1  concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')  from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =7 and r.emp_id = pr.emp_id and  r.date_of_completion between @startdate and @enddate order by r.date_of_completion ),  
 [Infrastructure_Overview_Certification] = (select top 1  concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')  from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =8 and r.emp_id = pr.emp_id and  r.date_of_completion between @startdate and @enddate order by r.date_of_completion ),  
 [General_Compliance_and_Combating_Certification] = (select top 1  concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')  from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =9 and r.emp_id = pr.emp_id and  r.date_of_completion
 between @startdate and @enddate order by r.date_of_completion ),  
 [Continual_Improvement_Awareness_Certification] = (select top 1  concat( result, ' - (', convert(varchar,r.date_of_completion, 107),')')  from COMPLIANCE_TRAINING_ASSESSMENT_RESULT r where r.title_id =10 and r.emp_id = pr.emp_id and  r.date_of_completion
 between @startdate and @enddate order by r.date_of_completion )  
 from project p   
 inner join proj_resource pr on p.proj_id = pr.proj_id  
 inner join customer cu on cu.cust_id = p.cust_id  
 inner join emp_info ei on ei.emp_id = pr.emp_id   
 where isnull(p.proj_status, '')!='close' and (cu.cust_id = @customerid or @customerid =0 or @customerid  =-1) and ei.dor is null  
 and (@projectid ='' or p.PROJ_ID in (select * from fn_SplitString(@projectid,','))  )
 and pr.id is not null and pr.end_date > @startdate order by 1, 2,  emp_name    
END
GO


