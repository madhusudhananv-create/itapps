IF NOT EXISTS(Select 1 from sys.tables where name ='PROCESS_MODEL_REFERENCE' AND type='U')
BEGIN

CREATE TABLE PROCESS_MODEL_REFERENCE
(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	SECTION_REFERENCE varchar(250) NOT NULL,
	CONTROL_REFERENCE varchar(250) NULL,
	PROCESS_MODEL_ID int NOT NULL FOREIGN KEY REFERENCES PROCESS_MODEL(ID),
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
)

END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='PROCESS_AREA_MODEL_REFERENCE' AND type='U')
BEGIN

CREATE TABLE PROCESS_AREA_MODEL_REFERENCE
(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	PROCESS_ID int NOT NULL,
	PROCESS_MODEL_REFERENCE_ID int NOT NULL FOREIGN KEY REFERENCES PROCESS_MODEL_REFERENCE(ID),
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
)

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProcessModelReferences' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProcessModelReferences]
END
GO

CREATE Procedure getProcessModelReferences

as
Begin

select PM.TITLE as PROCESS_MODEL_NAME,
CONCAT_WS(' - ', PR.SECTION_REFERENCE, PR.CONTROL_REFERENCE) AS SECTION_REFERENCE,
PR.PROCESS_MODEL_ID,PR.ID as PROCESS_MODEL_REFERENCE_LIST
from PROCESS_MODEL_REFERENCE PR inner join PROCESS_MODEL PM on PM.ID = PR.PROCESS_MODEL_ID
where PR.ISACTIVE=1 and PM.ISACTIVE=1

End
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllMappedProcessByProcessModel' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllMappedProcessByProcessModel]
END
GO

CREATE PROCEDURE [dbo].[getAllMappedProcessByProcessModel]      
 
 as      
 begin      

SELECT 
    ML.ID AS PROCESS_MODEL_ID, 
    ML.TITLE AS PROCESS_MODEL_NAME, 
    PA.TITLE AS PROCESS_AREA, 
    PA.ID AS PROCESS_AREA_ID,      
    P.ID AS PROCESS_ID,      
    P.TITLE AS PROCESS_TITLE, 
    P.DESCRIPTION AS PROCESS_DESCRIPTION, 
    STRING_AGG((CONCAT_WS(' - ', PMR.SECTION_REFERENCE, PMR.CONTROL_REFERENCE)), ', ' ) AS REFERENCE_COLUMN
FROM 
    PROCESS P 
INNER JOIN 
    PROCESS_MODEL_PROCESS_MAPPING MP ON P.ID = MP.PROCESS_ID 
INNER JOIN 
    PROCESS_MODEL ML ON MP.PROCESS_MODEL_ID = ML.ID       
INNER JOIN 
    PROCESS_AREA PA ON P.PROCESS_AREA_ID = PA.ID  
LEFT JOIN
    PROCESS_AREA_MODEL_REFERENCE PAR ON PAR.PROCESS_ID = P.ID
LEFT JOIN
    PROCESS_MODEL_REFERENCE PMR ON PMR.ID = PAR.PROCESS_MODEL_REFERENCE_ID
WHERE 
    MP.ISACTIVE = 1 AND ML.ISACTIVE = 1 AND PA.ISACTIVE = 1 AND P.SHOW_IN_MASTER = 1 AND P.ISACTIVE=1
	AND (PMR.ISACTIVE = 1 OR PMR.ID IS NULL) AND (PAR.ISACTIVE = 1 OR PAR.ID IS NULL)  
GROUP BY
    ML.ID, ML.TITLE, PA.TITLE, PA.ID, P.ID, P.TITLE, P.DESCRIPTION
ORDER BY  
    ML.TITLE, PA.TITLE, P.TITLE

End
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllMappedProcessByServiceArea' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllMappedProcessByServiceArea]
END
GO

CREATE procedure getAllMappedProcessByServiceArea  

@serviceAreaId int=0  

as  
begin  

SELECT DISTINCT
    SA.ID AS SERVICE_AREA_ID,
    SA.TITLE AS SERVICE_AREA_NAME,
    PA.TITLE AS PROCESS_AREA,
    PA.ID AS PROCESS_AREA_ID,
    P.ID AS PROCESS_ID,
    P.TITLE AS PROCESS_TITLE,
    P.DESCRIPTION AS PROCESS_DESCRIPTION,
    STRING_AGG((CONCAT_WS(' - ', PMR.SECTION_REFERENCE, PMR.CONTROL_REFERENCE)), ', ' ) AS REFERENCE_COLUMN
FROM
    PROCESS P
INNER JOIN
    PROCESS_SERVICE_AREA_MAPPING MP  ON P.ID = MP.PROCESS_ID
INNER JOIN
    PROCESS_SERVICE_AREA_NEW SA ON MP.SERVICE_AREA_ID = SA.ID
INNER JOIN
    PROCESS_AREA PA ON P.PROCESS_AREA_ID = PA.ID
LEFT JOIN
    PROCESS_AREA_MODEL_REFERENCE PAR ON PAR.PROCESS_ID = P.ID
LEFT JOIN
    PROCESS_MODEL_REFERENCE PMR ON PMR.ID = PAR.PROCESS_MODEL_REFERENCE_ID
WHERE
    MP.ISACTIVE = 1 AND SA.ISACTIVE = 1 AND PA.ISACTIVE = 1 AND PA.SHOW_IN_MASTER = 1 AND P.ISACTIVE=1
	AND (PMR.ISACTIVE = 1 OR PMR.ID IS NULL) AND (PAR.ISACTIVE = 1 OR PAR.ID IS NULL)
    AND P.SHOW_IN_MASTER = 1 AND (ISNULL(@SERVICEAREAID, 0) = 0 OR (@SERVICEAREAID = SA.ID))
GROUP BY
	SA.ID,SA.TITLE,PA.TITLE,PA.ID,P.ID,P.TITLE,P.DESCRIPTION
ORDER BY
    SA.TITLE,PA.TITLE,P.TITLE

END
GO


Declare  @RESOURCEID int = 104
Declare @EMPID varchar(10) = '104864'
Declare @RescourceName varchar(250) = 'Settings > RISK REPOSITORY'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end
Go

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End
Go

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go

Declare  @RESOURCEID int = 105
Declare @EMPID varchar(10) = '104864'
Declare @RescourceName varchar(250) = 'RISK REPOSITORY > Add/Edit Risk'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
End
Go

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,1,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End
Go

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'EDIT',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_projectIds' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_get_projectIds ]
END
GO

CREATE PROCEDURE [dbo].[usp_get_projectIds ]   
 
@EmpID varchar(50) ,                                    
@ProjectID VARCHAR(20)=''                                    

 -- Add the parameters for the stored procedure here                                    
AS                                    
BEGIN                                    

 -- SET NOCOUNT ON added to prevent extra result sets from                                    
 -- interfering with SELECT statements.                                    
 SET NOCOUNT ON;                       
                 
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED ;                  
                   
  declare @allProjectsForCustomer bit ;                            
 declare @csmTitle int;                            
                           
  select @csmTitle = CSM_TITLE_ID from emp_info where emp_id = @empid                            
  if(@CSMTitle = 6 or @csmtitle = 1 or @csmtitle =2 or @csmtitle =4 or @csmtitle =9 or  @csmtitle =7)                            
  BEGIN                            
                                
   set @allProjectsForCustomer =1                            
  END                            
                           
                            
                                    
    IF @ProjectID=''                                    
     BEGIN                                    
                                      
   
       SELECT P .PROJ_ID, P .PROJ_NM, '' , C.CUST_ID, C.CUST_NM                               
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                     
                        
     ON       ((@allProjectsForCustomer = 1 and pr.cust_id = p.cust_id) or P.PROJ_ID=PR.PROJ_ID   )       AND PR.EMP_ID= @EmpID                                     
                                   
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID    and c.cust_id !='201100010'                               
                                   
      WHERE PR.END_DATE >= GETDATE()      --and isnull(p.proj_status,'' ) <>'close' and  P.CUST_ID not in (  '202100062','202100091' )                      
       and P.PARENT_PROJ_ID = P.PROJ_ID  and  (@allProjectsForCustomer = 0    or c.CUST_ID in (select c1.cust_id from customer c1 inner join VW_PROJECT_ACTIVE p1 on c1.CUST_ID = p1.CUST_ID     
    inner join VW_PROJ_RESOURCE_ACTIVE pr1 on p1.proj_id = pr1.PROJ_ID and pr1.END_DATE > getdate()    and   pr1.EMP_ID = @empid )       )                      
       --GROUP BY P.PROJ_ID, P.PROJ_NM                                
                    
                               
   union                              
                                       
       SELECT PP.PROJ_ID, PP.PROJ_NM ,'' , C.CUST_ID, C.CUST_NM                                    
       FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                     
       ON  P.PROJ_ID=PR.PROJ_ID      AND PR.EMP_ID= @EmpID                                     
                         
       INNER JOIN CUSTOMER C on C.CUST_ID = P.CUST_ID     and c.cust_id ='201100010'                               
       INNER JOIN VW_PROJECT_ACTIVE PP ON P.PARENT_PROJ_ID = PP.PROJ_ID                                    
       WHERE PR.END_DATE >= GETDATE() -1     --and isnull(p.proj_status,'' ) <>'close'           and  P.CUST_ID not in (  '202100062','202100091' )                      
       --GROUP BY PP.PROJ_ID, PP.PROJ_NM                                  
                                         
          union                   
     SELECT PP.PROJ_ID, PP.PROJ_NM,'' , C.CUST_ID, C.CUST_NM               
                                
       FROM VW_PROJECT_ACTIVE Pp  INNER JOIN CUSTOMER C on C.CUST_ID = Pp.CUST_ID                          
    where @allProjectsForCustomer = 1 and   PP.PARENT_PROJ_ID = PP.PROJ_ID   and  PP.END_DATE >= GETDATE() -1    -- and isnull(pp.proj_status,'' ) <>'close' and  pP.CUST_ID not in ('0', '201100010', '202100062','202100091' )                  
  and ( pp.PROJ_AM_EMP_ID =   @EmpID or pp.PROJ_BUHEAD_EMP_ID = @EmpID or pp.PROJ_DM_EMP_ID = @EmpID or pp.PROJ_PM_EMP_ID =@EmpID)                            
                                               
                                    
   END    
    ELSE                                  
     BEGIN                                  
      SELECT DISTINCT P.PROJ_ID, P.PROJ_NM,'' FROM VW_PROJECT_ACTIVE P INNER join VW_PROJ_RESOURCE_ACTIVE PR                                   
      ON P.PROJ_ID=PR.PROJ_ID                                   
      AND (PR.EMP_ID=@EmpID                                   
      OR P.PROJ_BUHEAD_EMP_ID=@EmpID                                   
      OR P.PROJ_DM_EMP_ID=@EmpID                                   
      OR P.PROJ_PM_EMP_ID=@EmpID                                   
      OR PR.PROJ_RM_EMP_ID=@EmpID                                   
      OR PR.PROJ_REVIEWER_EMP_ID=@EmpID) AND P.PROJ_ID=@ProjectID                                  
      INNER JOIN (SELECT PROJ_ID,EMP_ID,MAX(PROJ_RESRC_ID)PROJ_RESRC_ID FROM VW_PROJ_RESOURCE_ACTIVE GROUP BY PROJ_ID,EMP_ID) MPR                                  
ON PR.PROJ_RESRC_ID=MPR.PROJ_RESRC_ID                                   
      GROUP BY P.PROJ_ID,P.PARENT_PROJ_ID,P.PROJ_NM, p.QUALITY_SPOC                                  
                           
   END                                           
                           
END 
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_ACTIONITEM' AND COLUMN_NAME='SOURCE_DESCRIPTION')
BEGIN
ALTER TABLE PROJECT_ACTIONITEM ADD SOURCE_DESCRIPTION VARCHAR(MAX) NULL
END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSActionitem' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSActionitem]
END
GO

CREATE PROCEDURE getCSSActionitem   
  
@STARTDATE datetime,  
@ENDDATE datetime   
  
AS          
  
BEGIN       
  
select C.CUST_NM as ACCOUNT,P.PROJ_NM as PROJECT,CB.DISPLAY_NAME as CUSTOMER,E.FRST_NM as PROJECT_MANAGER,CB.EMAIL_ID as CUSTOMER_MAIL,  
SOURCE as SOURCE_CATEGORY, SOURCE_DESCRIPTION, 
FORMAT(CB.SURVEY_SENT_DATE,'yyyy-MM-dd') as SURVEY_SENT_DATE,FORMAT(CB.SURVEY_RECEIVED_DATE,'yyyy-MM-dd') as SURVEY_RECEIVED_DATE,  
PA.DESCRIPTION as ACTION_PLAN_DESCRIPTION, PA.STATUS,  
FORMAT(PA.IDENTIFIED_DATE,'yyyy-MM-dd') as IDENTIFIED_DATE,FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as TARGET_DATE,  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as COMPLETION_DATE,PA.BATCH_CUSTOMER_MONTHLY_ID,PA.PROJECT_ID,PA.CUSTOMER_ID  
  
from PROJECT_ACTIONITEM PA   
inner join PROJECT P on P.PROJ_ID = PA.PROJECT_ID  
inner join CUSTOMER C on C.CUST_ID = PA.CUSTOMER_ID  
inner join CSS_BATCH_CUSTOMER_MONTHLY CB on CB.ID = PA.BATCH_CUSTOMER_MONTHLY_ID  
inner join EMP_INFO E on E.EMP_ID = P.PROJ_PM_EMP_ID  
  
where PA.CUSTOMER_ID = '212100001' and PA.ISACTIVE=1 and CB.ISACTIVE=1 and PA.IDENTIFIED_DATE between @STARTDATE and @ENDDATE  
order by PA.IDENTIFIED_DATE,PROJECT,CUSTOMER desc  
  
END  
GO
