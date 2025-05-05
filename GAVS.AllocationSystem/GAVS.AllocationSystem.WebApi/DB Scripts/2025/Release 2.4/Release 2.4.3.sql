

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

Declare  @RESOURCEID int = 825

Declare @RescourceName varchar(250) = 'SQA Management > Merge Checklist'
if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName) 
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'Control',@RescourceName,null,104744,104744)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	 EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	 values (@RESOURCEID,1,'','','',null,104744,104744,1,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,104744,104744,1,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104744,104744,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,104744,104744,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104744,104744,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,104744,104744,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104744,104744,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104744,104744,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104744,104744,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104744,104744,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104744,104744,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104744,104744,0,0,0,0,0),
     (@RESOURCEID,13,'','','',null,104744,104744,0,0,0,0,0)


end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104744,104744),
	(@RESOURCEID,'CREATE',null,104744,104744),
	(@RESOURCEID,'EDIT',null,104744,104744),
	(@RESOURCEID,'DELETE',null,104744,104744)
	

end
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'PM_CHECKLIST' AND COLUMN_NAME='IS_MERGED')
BEGIN
ALTER TABLE PM_CHECKLIST add IS_MERGED BIT;
END
GO

