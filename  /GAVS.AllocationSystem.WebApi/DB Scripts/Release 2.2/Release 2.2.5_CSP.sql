USE CSP
GO

Declare  @RESOURCEID int = 800

Declare @RescourceName varchar(250) = 'SQA Management > Setup'
 
if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'Control',@RescourceName,null,104474,104474)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

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
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)


end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)
	

end

set @RescourceName = 'SQA Management > Setup > Setup Process Model'


if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
	values (801,'Control',@RescourceName,null,104474,104474)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin

	
	 insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	 EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	 values (@RESOURCEID,1,'','','',null,104474,104474,0,0,0,0,0),(@RESOURCEID,2,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104474,104474,0,0,0,0,0),(@RESOURCEID,4,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104474,104474,0,0,0,0,0),(@RESOURCEID,6,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),(@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),(@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),(@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)


end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)
	

end

set @RescourceName = 'SQA Management > Setup > Setup Checklist'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (802,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)
	
end

set @RescourceName = 'SQA Management > Setup > Map Checklist Questions and Process'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (803,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end

set @RescourceName = 'SQA Management > Setup > Risk Based Assessment'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (804,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)
end

set @RescourceName = 'SQA Management > Setup > Checklist based Assessment'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (805,'Control',@RescourceName,null,104474,104474)

set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

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
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end

set @RescourceName = 'SQA Management > PSPD'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (806,'Control',@RescourceName,null,104474,104474)

set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

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
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end
--

set @RescourceName = 'SQA Management > Requirements Tracker'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (807,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)
end
--
set @RescourceName = 'SQA Management > Planner'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (808,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end

--
set @RescourceName = 'SQA Management > Planner > View Planner'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (809,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end
--Add Event/Task

set @RescourceName = 'SQA Management > Planner > Add Event/Task'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (810,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end


set @RescourceName = 'SQA Management > Setup > Setup Process Model > Add Process Model'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (811,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end


set @RescourceName = 'SQA Management > Setup > Setup Process Model > Add Process Area & Process'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (812,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end


set @RescourceName = 'SQA Management > Setup > Setup Process Model > View Process Model & Process'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (813,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)
end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end

set @RescourceName = 'SQA Management > Setup > Setup Process Model > Map Process Model & Process'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (814,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end


set @RescourceName = 'SQA Management > Setup > Setup Process Model > View Service Area/Tower & Process'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (815,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)
end

set @RescourceName = 'SQA Management > Setup > Setup Process Model > Map Service Area/Tower & Process'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (816,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)
end

set @RescourceName = 'SQA Management > Setup > Setup Process Model > Add/Map Objective'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (817,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end

set @RescourceName = 'SQA Management > Setup > Setup Process Model > Add Risk'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (818,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end

--

set @RescourceName = 'SQA Management > Setup > Setup Process Model > Add Control'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (819,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end


set @RescourceName = 'SQA Management > Setup > Setup Process Model > Add Test'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (820,'Control',@RescourceName,null,104474,104474)

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
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)

end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end

Declare @assessmentId int  = (select ASSESSMENT_ID from csp..AUDIT_CHECKLIST_EXECUTION_SUMMARY where AUDIT_TITLE like 'Agile Maturity Level Assessment - ZIF 4.0%')

Declare @serviceAreaId int = (select id from csp..PROCESS_SERVICE_AREA_NEW where TITLE like 'Project Management%')

if exists (select 1 from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS where AUDIT_ID = @assessmentId and SERVICE_AREA_ID = @serviceAreaId)
begin

update csp..AUDIT_CHECKLIST_PROJECT_FINDINGS set ISACTIVE = 0 where AUDIT_ID = @assessmentId and SERVICE_AREA_ID = @serviceAreaId

end

GO

    IF EXISTS(Select 1 from sys.procedures where name ='getMonthActionItems' AND type='P')
    BEGIN
       DROP PROCEDURE [dbo].[getMonthActionItems]
    END

    GO

    CREATE PROCEDURE [dbo].[getMonthActionItems]              
	@ProjIds VARCHAR(MAX) 
	AS
	BEGIN

	SELECT  DATENAME(MM,A.COMPLETION_DATE) AS MONTH_NAME,COUNT(A.STATUS) AS STATUS              
	FROM [CSP].[DBO].[PROJECT_ACTIONITEM] A              
    INNER JOIN BAS.DBO.PROJECT P  ON a.PROJECT_ID = p.PROJ_ID AND 
	P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))  AND A.ISACTIVE = 1         
	and A.STATUS = 'Completed' and A.COMPLETION_DATE >= DATEADD(M,-6,GETDATE())
	LEFT OUTER JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJECT_ID              
	LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID              
    group by DATENAME(MM,A.COMPLETION_DATE)
	ORDER BY DATENAME(MM,A.COMPLETION_DATE)
		
	END

	GO

	IF EXISTS(Select 1 from sys.procedures where name ='getMonthlyRisksData' AND type='P')
    BEGIN
       DROP PROCEDURE [dbo].[getMonthlyRisksData]
    END

    GO
 
   CREATE procedure [dbo].[getMonthlyRisksData]        
    @ProjIds VARCHAR(MAX) 
   AS        
   BEGIN        
        
   SELECT DATENAME(MM,r.IDENTIFIED_DATE) AS MONTH_NAME,COUNT(r.STATUS) AS STATUS              
   FROM [CSP].[dbo].[PROJECT_RISK] r        
   inner join BAS.dbo.project p on p.proj_id =  r.PROJECT_ID     
   and P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@ProjIds,','))
   AND r.STATUS = 'Identified'  and r.ISACTIVE =1      
   LEFT OUTER JOIN portfolio_project pp on pp.proj_id =  r.PROJECT_ID          
   LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID              
   group by DATENAME(MM,r.IDENTIFIED_DATE)
   ORDER BY DATENAME(MM,r.IDENTIFIED_DATE)
		
   END 

   GO

   

	IF EXISTS(Select 1 from sys.procedures where name ='getMonthlyIssuesData' AND type='P')
    BEGIN
       DROP PROCEDURE [dbo].[getMonthlyIssuesData]
    END

    GO
 
   CREATE procedure [dbo].[getMonthlyIssuesData]        
    @ProjIds VARCHAR(MAX) 
   AS        
   BEGIN        
        
   SELECT DATENAME(MM,I.ISSUE_RESOLVED_DATE) AS MONTH_NAME,COUNT(I.STATUS) AS STATUS              
  FROM [CSP].[dbo].[PROJECT_ISSUE] I        
  inner join BAS.dbo.project p on p.proj_id =  I.PROJECT_ID     
  and P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@ProjIds,','))
  AND I.STATUS = 'Identified'  and I.ISACTIVE =1      
  LEFT OUTER JOIN portfolio_project pp on pp.proj_id =  I.PROJECT_ID          
  LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID              
  group by DATENAME(MM,I.ISSUE_RESOLVED_DATE)
  ORDER BY DATENAME(MM,I.ISSUE_RESOLVED_DATE)
		
  END 

   GO

Declare  @RESOURCEID int = 900

Declare @RescourceName varchar(250) = 'Dashboard > CSM Dashboard'
 
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
	 values (@RESOURCEID,1,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104211,104211,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104211,104211,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104211,104211,0,0,0,0,0)


end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104211,104211),
	(@RESOURCEID,'CREATE',null,104211,104211),
	(@RESOURCEID,'EDIT',null,104211,104211),
	(@RESOURCEID,'DELETE',null,104211,104211)
	

end
