IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProjectsByPM' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjectsByPM]
END
GO

CREATE Procedure getProjectsByPM  
  
@PmEmpId varchar(25)  
  
AS  
  
Begin  
  
select Top 1 STUFF((  
        SELECT ' ,' + PROJ_ID  
        FROM project  
        WHERE  
            BILL_TYPE = 1  
            AND ISNULL(PROJ_STATUS, '') != 'Close'  
            AND PROJ_ID NOT LIKE 'proj%'  
            AND ISNULL(PROJECT_TYPE, '') != 'Internal'  
            AND PROJ_PM_EMP_ID = @PmEmpId  
        FOR XML PATH('')), 1, 2, '') AS ProjectIds,  
 (e.FRST_NM) AS CSM,  
 (e.EMAIL_ID) AS CSM_MAIL_ID,  
    (e2.FRST_NM) AS PM,  
    (e2.EMAIL_ID) AS PM_Email_ID,  
 (e1.FRST_NM) AS QUALITY_PARTNER,  
    (e1.EMAIL_ID) AS QUALITY_PARTNER_MAIL_ID  
      
  FROM project p         
  inner join EMP_INFO e (NOLOCK) on e.EMP_ID=p.PROJ_DM_EMP_ID and e.DOR IS NULL  
  left join EMP_INFO e1 (NOLOCK) on e1.EMP_ID=p.QUALITY_SPOC and e1.DOR IS NULL      
  inner join EMP_INFO e2 (NOLOCK) on e2.EMP_ID=p.PROJ_PM_EMP_ID and e2.DOR IS NULL    
  inner join CUSTOMER c (NOLOCK) on c.CUST_ID=p.CUST_ID          
  WHERE p.BILL_TYPE=1 and ISNULL(P.PROJ_STATUS ,'') != 'Close'  
  and P.PROJ_ID not like 'proj%' and ISNULL(P.PROJECT_TYPE ,'') != 'Internal' and P.PROJ_PM_EMP_ID=@PmEmpId       
  
END  
GO
