IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getIdeasDetailbyId' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getIdeasDetailbyId]
END
GO

CREATE PROCEDURE [dbo].[getIdeasDetailbyId]          
                
 @ideaId int  
                
 AS                    
 BEGIN                    
                   
    select I.ID, I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,  
 CASE WHEN IBS.BENEFIT_TYPE_ID = 1 then 'Quantitative'      
 WHEN IBS.BENEFIT_TYPE_ID = 2 then 'Qualitative' END AS BENEFIT_TYPE,I.IDENTIFIED_DATE,max(IIP.ESTIMATED_TARGET_DATE) [TARGET_DATE]                
   ,(select top 1 frst_nm from EMP_INFO where EMP_ID = I.IDENTIFIED_BY)[Identified_By],                
  --(select top 1 frst_nm from EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [Responsible],                    
 (select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],                    
  I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]                    
 ,(select top 1 PROJ_NM from PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]                    
  from IDEA I                    
  left join IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1      
  left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID  and IIP.ISACTIVE = 1                                    
      
  join Project P ON P.PROJ_ID = I.PROJECT_ID   
  where I.ISACTIVE = 1 and I.ID = @ideaId and I.ISSUBMITTED =1  
  group  by I.ID,I.IDENTIFIED_DATE,I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,I.IDENTIFIED_BY,I.IDEA_IMPROVEMENT_TYPE_ID,I.IDEA_STATUS_ID,I.PROJECT_ID,IBS.BENEFIT_TYPE_ID          
 order by I.IDENTIFIED_DATE desc                
                    
END
GO
