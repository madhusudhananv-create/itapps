USE BAS
GO
 

 IF NOT EXISTS(SELECT 1 FROM bas..configuration_ext WHERE [KEY] = 'PROJECTSETTING_APPROVERS')
 begin
 insert into bas..configuration_ext values ('PROJECTSETTING_APPROVERS', '101566,102802', -1, null, null, 0,1)
 end

 go

 IF NOT EXISTS(SELECT 1 FROM BAS.DBO.COMPLIANCE_TRAINING_ASSESSMENT_HEADER WHERE COMPLIANCE_TRAINING_TITLE ='CI Awareness Certification Course')
 BEGIN
	insert into bas..COMPLIANCE_TRAINING_ASSESSMENT_HEADER values ('CI Awareness Certification Course', 23, 23, 70, getdate(), '2021-12-31')
END
