
	IF not exists(select 1 from [CSP].[dbo].[APP_CONTROLS] where RESOURCE_ID=51) BEGIN 
	 INSERT INTO [CSP].[dbo].[APP_CONTROLS] ([RESOURCE_ID],[RESOURCE_TYPE],[RESOURCE_NAME],[COMMENTS],[CREATED_BY],[CREATED_DATE],[UPDATED_BY],[UPDATED_DATE],[ISACTIVE]) VALUES(51, 'Control', 'Project > Mandatory Training Compliance', null, 103724, GETDATE(), 103724, GETDATE(),1) 
	 END 
	 GO

	 IF not exists(select 1 from [CSP].[dbo].[APP_CONTROL_FEATURES] where RESOURCE_ID=51 and FEATURE='VIEW') 
	 BEGIN
	 insert into csp.dbo.APP_CONTROL_FEATURES values (51,'VIEW', null, 103724, GETDATE(), 103724, GETDATE(),1) 
	 END 
	 GO

	 IF not exists(select 1 from [CSP].[dbo].[APP_ACCESS_CONTROLS] where RESOURCE_ID=51) 
	 BEGIN
	 insert into csp.dbo.APP_ACCESS_CONTROLS values 
	 (51, 1, 1, '',null,'', 1,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 2, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 3, '',null,'', 1,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 4, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 5, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 6, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 7, '',null,'', 1,1,1,1,1,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 8, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 9, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 10, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (51, 1, 11, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1)
	 END 
	 GO


	 
 IF not exists(select 1 from [CSP].[dbo].[APP_CONTROLS] where RESOURCE_ID=52) BEGIN 
	 INSERT INTO [CSP].[dbo].[APP_CONTROLS] ([RESOURCE_ID],[RESOURCE_TYPE],[RESOURCE_NAME],[COMMENTS],[CREATED_BY],[CREATED_DATE],[UPDATED_BY],[UPDATED_DATE],[ISACTIVE]) VALUES(52, 'Control', 'Project > CRISP', null, 103724, GETDATE(), 103724, GETDATE(),1) 
	 END 
	 GO

	 IF not exists(select 1 from [CSP].[dbo].[APP_CONTROL_FEATURES] where RESOURCE_ID=52 and FEATURE='VIEW') 
	 BEGIN
	 insert into csp.dbo.APP_CONTROL_FEATURES values (52,'VIEW', null, 103724, GETDATE(), 103724, GETDATE(),1) 
	 END 
	 GO

	 IF not exists(select 1 from [CSP].[dbo].[APP_ACCESS_CONTROLS] where RESOURCE_ID=52) 
	 BEGIN
	 insert into csp.dbo.APP_ACCESS_CONTROLS values 
	 (52, 1, 1, '',null,'', 1,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 2, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 3, '',null,'', 1,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 4, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 5, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 6, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 7, '',null,'', 1,1,1,1,1,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 8, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 9, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 10, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1), 
	 (52, 1, 11, '',null,'', 0,0,0,0,0,null , 103724, GETDATE(), 103724, GETDATE(),1)
	 END 
	 GO