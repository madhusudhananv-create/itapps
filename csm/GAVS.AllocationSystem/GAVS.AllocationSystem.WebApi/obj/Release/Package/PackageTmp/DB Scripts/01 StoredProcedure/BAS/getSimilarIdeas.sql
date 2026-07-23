IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getSimilarIdeas' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getSimilarIdeas]
END
GO

CREATE PROCEDURE getSimilarIdeas                

@description varchar(max)             

AS

BEGIN                    
                   
select I.ID as IDEA_ID, I.DESCRIPTION, I.IDENTIFIED_DATE,
(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [STATUS],
STUFF((SELECT ', ' + E.FRST_NM from EMP_INFO E inner join IDEA_IDENTIFIER IID on IID.IDENTIFIED_BY = E.EMP_ID
where IID.IDEA_ID = I.ID and E.DOR IS NULL and IID.ISACTIVE=1 FOR XML PATH('')), 1, 1, '')[IDENTIFIED_BY]
from IDEA I                    

where I.ISACTIVE = 1 AND I.DESCRIPTION LIKE @description + '%' 
order by I.IDENTIFIED_DATE desc                
                    
END  
GO
