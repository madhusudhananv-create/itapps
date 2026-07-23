		IF not exists(SELECT 1 FROM BAS..CONFIGURATION_EXT where [key] ='ADDTASK_AllCustomers')
BEGIN
	insert into BAS..CONFIGURATION_EXT values ('ADDTASK_AllCustomers','103285', -1, null,null,0, 1)
END



