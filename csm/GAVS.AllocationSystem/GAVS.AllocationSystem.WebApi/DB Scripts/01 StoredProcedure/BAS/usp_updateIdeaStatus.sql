
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_updateIdeaStatus' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_updateIdeaStatus]
END
GO


CREATE PROCEDURE [dbo].[usp_updateIdeaStatus]  

@Id varchar(max),  
@Status varchar(50)  
as  
  
Begin  
  
IF(@Status = 'Approve')  
  
Begin  
  
Update IDEA SET IDEA_STATUS_ID = 4 where ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Id,','))  
  
End  
  
ELSE IF(@Status = 'Reject')  
  
Begin  
  
Update IDEA SET IDEA_STATUS_ID = 5 where ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Id,','))  
  
End  
  select I.ID, I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,I.IDENTIFIED_DATE,IIP.ESTIMATED_TARGET_DATE [TARGET_DATE]    
   ,(select top 1 frst_nm from EMP_INFO where EMP_ID = I.IDENTIFIED_BY)[Identified_By],    
  (select top 1 frst_nm from EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [Responsible]        
 ,(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],        
  I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]        
 ,(select top 1 PROJ_NM from PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]        
  from IDEA I        
  left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID         
  --join Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))          
  where I.ISACTIVE = 1        
 order by I.IDENTIFIED_DATE desc          
   
End
GO
