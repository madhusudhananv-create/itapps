USE CSP

GO

IF EXISTS(Select 1 from sys.procedures where name ='getAllIdeasByCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllIdeasByCustomer]
END
GO 

CREATE PROCEDURE getAllIdeasByCustomer                
                
 @customerid varchar(max)              
                
 AS                    
 BEGIN                    
                   
  select I.ID, I.DESCRIPTION,
  CASE WHEN IBS.BENEFIT_TYPE_ID = 1 then 'Quantitative'    
  WHEN IBS.BENEFIT_TYPE_ID = 2 then 'Qualitative' END AS BENEFIT_TYPE,
  I.IDENTIFIED_DATE,max(IIP.ESTIMATED_TARGET_DATE) [TARGET_DATE]                
  ,(select top 1 frst_nm from bas..EMP_INFO where EMP_ID = I.IDENTIFIED_BY)[Identified_By],                
  (select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],                    
  I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]                    
 ,(select top 1 PROJ_NM from BAS..PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]                    
  from IDEA I                    
  left join IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1      
  left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID  and IIP.ISACTIVE = 1                                    
  join BAS..Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))                      
  where I.ISACTIVE = 1 and I.IDEA_STATUS_ID = 2  
  group  by I.ID,I.IDENTIFIED_DATE,I.DESCRIPTION,I.IDENTIFIED_BY,I.IDEA_IMPROVEMENT_TYPE_ID,I.IDEA_STATUS_ID,I.PROJECT_ID,IBS.BENEFIT_TYPE_ID          
  order by I.IDENTIFIED_DATE desc   
 END 
 GO

IF EXISTS(Select 1 from sys.procedures where name ='getIdeaStatusCountByImprovementType' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getIdeaStatusCountByImprovementType]
END
GO 

CREATE PROCEDURE getIdeaStatusCountByImprovementType    
 
 @customerid varchar(max),    
 @projectid varchar(max),    
 @identifiedby varchar(max),    
 @startdate date,        
 @enddate date,      
 @beneficiaryid varchar(100),      
 @benefitpillarid varchar(200)      
       
 AS
 BEGIN
  
  SELECT 'Value' [Type], TYPE.TYPE [Improvement_Type],      
  SUM(CASE WHEN I.IDEA_STATUS_ID = 2 THEN 1 ELSE 0 END) AS 'Submitted',      
  SUM(CASE WHEN I.IDEA_STATUS_ID = 4 THEN 1 ELSE 0 END) AS 'Execution',      
  SUM(CASE WHEN I.IDEA_STATUS_ID = 3 THEN 1 ELSE 0 END) AS 'Implemented'      
   FROM IDEA_IMPROVEMENT_TYPE TYPE      
  INNER JOIN IDEA I ON I.IDEA_IMPROVEMENT_TYPE_ID = TYPE.ID  AND IDEA_IMPROVEMENT_TYPE_ID IN (6, 7, 8) and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))           
  INNER JOIN BAS..PROJECT P ON I.PROJECT_ID = P.PROJ_ID AND P.END_DATE >= GETDATE()      
  AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))        
  AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))    
  WHERE I.IDENTIFIED_DATE >= @startdate AND I.IDENTIFIED_DATE <= @enddate AND I.ISACTIVE = 1      
  AND EXISTS (SELECT 1 FROM IDEA_BENEFIT_SUMMARY WHERE IDEA_ID = I.ID AND ISACTIVE = 1 AND TYPE_ID = 1      
  AND BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))      
  AND BENEFICIARY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,',')))       
  GROUP BY TYPE.TYPE      
  UNION ALL      
  SELECT 'Value_Add' [Type], TYPE.TYPE [Improvement_Type],      
  SUM(CASE WHEN I.IDEA_STATUS_ID = 2 THEN 1 ELSE 0 END) AS 'Submitted',      
  SUM(CASE WHEN I.IDEA_STATUS_ID = 4 THEN 1 ELSE 0 END) AS 'Execution',      
  SUM(CASE WHEN I.IDEA_STATUS_ID = 3 THEN 1 ELSE 0 END) AS 'Implemented'      
   FROM IDEA_IMPROVEMENT_TYPE TYPE      
  INNER JOIN IDEA I ON I.IDEA_IMPROVEMENT_TYPE_ID = TYPE.ID  AND IDEA_IMPROVEMENT_TYPE_ID IN (6, 7, 8)  and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))          
  INNER JOIN BAS..PROJECT P ON I.PROJECT_ID = P.PROJ_ID AND P.END_DATE >= GETDATE()      
  AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))        
  AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))    
  WHERE I.IDENTIFIED_DATE >= @startdate AND I.IDENTIFIED_DATE <= @enddate AND I.ISACTIVE = 1      
  AND EXISTS (SELECT 1 FROM IDEA_BENEFIT_SUMMARY WHERE IDEA_ID = I.ID AND ISACTIVE = 1 AND TYPE_ID = 2      
  AND BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))      
  AND BENEFICIARY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,',')))       
  GROUP BY TYPE.TYPE      
 END   

 GO