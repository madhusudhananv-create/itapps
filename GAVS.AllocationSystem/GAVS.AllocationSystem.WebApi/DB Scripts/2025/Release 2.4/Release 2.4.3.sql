

IF EXISTS(Select 1 from sys.objects where name ='getProcessModelListByProcessAreaIds' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getProcessModelListByProcessAreaIds] 
END

GO
CREATE PROCEDURE [dbo].[getProcessModelListByProcessAreaIds]      
 @processAreaIds VARCHAR(MAX)  
 as   
 begin      

SELECT 
    ML.ID AS PROCESS_MODEL_ID, 
    ML.TITLE AS PROCESS_MODEL_NAME, 
    PA.TITLE AS PROCESS_AREA, 
    PA.ID AS PROCESS_AREA_ID,      
    P.ID AS PROCESS_ID,      
    P.TITLE AS PROCESS_TITLE, 
    P.DESCRIPTION AS PROCESS_DESCRIPTION 
FROM 
    PROCESS P 
INNER JOIN 
    PROCESS_MODEL_PROCESS_MAPPING MP ON P.ID = MP.PROCESS_ID 
INNER JOIN 
    PROCESS_MODEL ML ON MP.PROCESS_MODEL_ID = ML.ID       
INNER JOIN PROCESS_AREA PA ON P.PROCESS_AREA_ID = PA.ID  

WHERE 
    MP.ISACTIVE = 1 AND ML.ISACTIVE = 1 AND PA.ISACTIVE = 1 AND P.SHOW_IN_MASTER = 1 AND P.ISACTIVE=1
		and pa.id in(SELECT * FROM  [FN_SPLITSTRING](@processAreaIds,','))
ORDER BY  
    ML.TITLE, PA.TITLE, P.TITLE

END


 GO




IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='MERGE_CHECKLIST_MAX')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'MERGE_CHECKLIST_MAX',  
    '4',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO

Declare @RESOURCEID int = 825
Declare @EMPID varchar(10) = '104744'
Declare @RescourceName varchar(250) = 'SQA Management > Merge Checklist'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
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

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'PM_CHECKLIST' AND COLUMN_NAME='IS_MERGED')
BEGIN
ALTER TABLE PM_CHECKLIST add IS_MERGED BIT;
END
GO

