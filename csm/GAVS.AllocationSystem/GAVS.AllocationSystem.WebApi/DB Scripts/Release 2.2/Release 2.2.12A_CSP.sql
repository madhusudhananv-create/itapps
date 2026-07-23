
USE CSP
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'DATATYPE_SYMBOL'
          AND Object_ID = Object_ID('UOM'))
BEGIN
   
alter table csp..UOM add DATATYPE_SYMBOL varchar(50)
END

GO

if exists (select * from CSP..UOM where DATATYPE = 'In USD')
begin

update CSP..UOM set DATATYPE_SYMBOL = '$' where DATATYPE = 'In USD'

end
go

if exists (select * from CSP..UOM where DATATYPE = 'In No')
begin

update CSP..UOM set DATATYPE_SYMBOL = 'No' where DATATYPE = 'In No'

end
go

if exists (select * from CSP..UOM where DATATYPE = 'In %')
begin

update CSP..UOM set DATATYPE_SYMBOL = '%' where DATATYPE = 'In %'

end
go

if exists (select * from CSP..UOM where DATATYPE = 'In Mins')
begin

update CSP..UOM set DATATYPE_SYMBOL = 'Mins' where DATATYPE = 'In Mins'

end
go

if exists (select * from CSP..UOM where DATATYPE = 'In Person hour')
begin

update CSP..UOM set DATATYPE_SYMBOL = 'Hrs' where DATATYPE = 'In Person hour'

end
go

if exists (select * from CSP..UOM where DATATYPE = 'In Number')
begin

update CSP..UOM set DATATYPE_SYMBOL = 'No' where DATATYPE = 'In Number'

end
go

if exists (Select 1 from sys.procedures where name ='usp_GetAllUOM' AND type='P')
begin
  drop procedure  dbo.usp_GetAllUOM
end 
go

CREATE PROCEDURE usp_GetAllUOM    
 AS  
  BEGIN  
  select ID,Title + '(' + DATATYPE + ')' AS TITLE, DATATYPE_SYMBOL from csp..UOM where isactive = 1  
  END  
  go

Declare  @RESOURCEID int = 71

Declare @RescourceName varchar(250) = 'Settings > Ci Leaderboard All CustomerAccess'
if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName) 
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'Control',@RescourceName,null,104211,104211)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	 EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	 values (@RESOURCEID,1,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)


end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104211,104211),
	(@RESOURCEID,'CREATE',null,104211,104211),
	(@RESOURCEID,'EDIT',null,104211,104211),
	(@RESOURCEID,'DELETE',null,104211,104211)
	

end
GO

if exists (Select 1 from sys.procedures where name ='usp_get_CIL_data' AND type='P')
begin
  drop procedure  dbo.usp_get_CIL_data
end 
go

CREATE PROC usp_get_CIL_data  
@CUSTID int,  
@PROJIDS VARCHAR(MAX),     
@STARTDATE DATETIME,                  
@ENDDATE DATETIME,   
@ImprovementType VARCHAR(50),  
@Status VARCHAR(50),  
@beneficiary int,  
@Uom int,  
@ALL bit  
  
AS  
BEGIN  
  
if(@ALL = 1)     
Begin  
SELECT C.CUST_ID, C.CUST_NM,COUNT(I.ID) AS TotalIdeas,   
SUM(BDS.NET_BENEFITS_YEAR) AS Net_Benefits,  
pp.PORTFOLIO_ID, port.TITLE AS 'PORTFOLIO_NM', P.PROJ_ID, P.PROJ_NM  
from IDEA I  
 INNER JOIN IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID AND IBS.ISACTIVE = 1  
 INNER JOIN BENEFIT_DETAILS_QUANTITATIVE BDS on IBS.ID = BDS.BENEFIT_SUMMARY_ID and BDS.ISACTIVE = 1  
 INNER JOIN IDEA_STATUS IDS on I.IDEA_STATUS_ID = IDS.ID  
 INNER JOIN UOM U on BDS.UOM_ID = U.ID  
 INNER JOIN IDEA_IMPROVEMENT_TYPE IT on I.IDEA_IMPROVEMENT_TYPE_ID = IT.ID  
 INNER JOIN [BAS].DBO.PROJECT P ON I.PROJECT_ID = P.PROJ_ID                   
 INNER JOIN [BAS].DBO.CUSTOMER C ON C.CUST_ID = P.CUST_ID                  
 LEFT JOIN  PORTFOLIO_PROJECT PP on PP.PROJ_ID = p.PROJ_ID and pp.ISACTIVE = 1                  
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1      
   
 where I.IDEA_STATUS_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Status,','))   
 AND (@CUSTID = -1 OR C.CUST_ID = @CUSTID)                   
 and I.IDEA_IMPROVEMENT_TYPE_ID IN (select ID from CSP..IDEA_IMPROVEMENT_TYPE where ISACTIVE = 1) 
  and (@PROJIDS = '' OR I.PROJECT_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))) and  
  I.IDENTIFIED_DATE >= @STARTDATE and I.IDENTIFIED_DATE <= @ENDDATE and BDS.UOM_ID = @Uom and IBS.BENEFICIARY_ID = @beneficiary and I.ISACTIVE = 1  
 GROUP BY C.CUST_ID, C.CUST_NM, pp.PORTFOLIO_ID, port.TITLE, P.PROJ_ID, P.PROJ_NM --,BDS.UOM_ID       
End  
Else  
Begin  
SELECT C.CUST_ID, C.CUST_NM,COUNT(I.ID) AS TotalIdeas,   
SUM(BDS.NET_BENEFITS_YEAR) AS Net_Benefits,  
pp.PORTFOLIO_ID, port.TITLE AS 'PORTFOLIO_NM', P.PROJ_ID, P.PROJ_NM  
from IDEA I  
 INNER JOIN IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID AND IBS.ISACTIVE = 1  
 INNER JOIN BENEFIT_DETAILS_QUANTITATIVE BDS on IBS.ID = BDS.BENEFIT_SUMMARY_ID and BDS.ISACTIVE = 1  
 INNER JOIN IDEA_STATUS IDS on I.IDEA_STATUS_ID = IDS.ID  
 INNER JOIN UOM U on BDS.UOM_ID = U.ID  
 INNER JOIN IDEA_IMPROVEMENT_TYPE IT on I.IDEA_IMPROVEMENT_TYPE_ID = IT.ID  
 INNER JOIN [BAS].DBO.PROJECT P ON I.PROJECT_ID = P.PROJ_ID                   
 INNER JOIN [BAS].DBO.CUSTOMER C ON C.CUST_ID = P.CUST_ID                  
 LEFT JOIN  PORTFOLIO_PROJECT PP on PP.PROJ_ID = p.PROJ_ID and pp.ISACTIVE = 1                  
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1      
   
 where I.IDEA_STATUS_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Status,',')) and C.CUST_ID = @CUSTID   
 and I.IDEA_IMPROVEMENT_TYPE_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING]( @ImprovementType ,','))  
  and (@PROJIDS = '' OR I.PROJECT_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))) and  
  I.IDENTIFIED_DATE >= @STARTDATE and I.IDENTIFIED_DATE <= @ENDDATE and BDS.UOM_ID = @Uom and IBS.BENEFICIARY_ID = @beneficiary and I.ISACTIVE = 1  
 GROUP BY C.CUST_ID, C.CUST_NM, pp.PORTFOLIO_ID, port.TITLE, P.PROJ_ID, P.PROJ_NM --,BDS.UOM_ID       
 End  
END       
go