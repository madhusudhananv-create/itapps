

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