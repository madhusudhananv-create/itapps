USE CSP
GO

Declare  @RESOURCEID int = 821

Declare @RescourceName varchar(250) = 'SQA Management > Execute'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (@RESOURCEID,'Control',@RescourceName,null,104474,104474)

set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end
go

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin
      insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	  EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	  values (@RESOURCEID,1,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0),
	  (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end
go

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end
go