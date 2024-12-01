USE BAS

GO

IF EXISTS(Select 1 from sys.objects where name ='getEmpIdsForAccount' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getEmpIdsForAccount]
END

GO

create procedure
getEmpIdsForAccount 
@custId int
As
begin

select distinct EI.* from PROJ_RESOURCE PR 
inner join PROJECT P on PR.PROJ_ID = P.PROJ_ID and PR.END_DATE >= GETDATE() and PR.CURR_INDC = 'Y' and PR.ID is not null
inner join EMP_INFO EI on PR.EMP_ID = EI.EMP_ID and EI.DOR is null
where P.CUST_ID = @custId and isnull(P.PROJ_STATUS,'') != 'CLOSE'

end

GO

IF not exists(Select 1 from sys.tables where name ='PROCESS_MODEL_AUDITOR' AND type='U')
BEGIN

create table PROCESS_MODEL_AUDITOR
(
	id int identity(1,1) not null,
	emp_id int not null,
	active_status bit not null,
	retired_on datetime null,
	CREATED_DATE datetime not null,
	created_by int not null,
	UPDATED_DATE datetime not null,
	UPDATED_BY int not null,
	ISACTIVE bit not null
)
END
GO

IF not exists(Select 1 from sys.tables where name ='AUDITOR_QUALIFIED_STANDARDS' AND type='U')
BEGIN

create table AUDITOR_QUALIFIED_STANDARDS
(
	id int identity(1,1) not null,
	EMP_ID int not null,
	QUALIFICATION_STATUS varchar(500) null,
	QUALIFIED_STANDARDS int not null,
	EFFECTIVE_FROM datetime null,
	INACTIVE_FROM datetime null,
	CREATED_DATE datetime not null,
	created_by int not null,
	UPDATED_DATE datetime not null,
	UPDATED_BY int not null,
	ISACTIVE bit not null
)

END

GO

IF EXISTS(Select 1 from sys.procedures where name ='getAuditorDetailsByCertifiedStandards' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAuditorDetailsByCertifiedStandards]
END
GO

create procedure
getAuditorDetailsByCertifiedStandards
@custid int,
@projid varchar(500)
as
begin

with cte as
(
select distinct process_model_id from csp..pm_project_service_area_process_mapping
where cust_id = @custid and proj_id = @projid and isactive = 1
)

select distinct EI.* from AUDITOR_QUALIFIED_STANDARDS PMAD
inner join EMP_INFO EI on PMAD.EMP_ID = EI.EMP_ID and PMAD.QUALIFICATION_STATUS = 'Active' and PMAD.EFFECTIVE_FROM <= GETDATE() and PMAD.INACTIVE_FROM is null
where PMAD.QUALIFIED_STANDARDS in (select process_model_id from cte) 

end
GO

IF EXISTS(Select 1 from sys.procedures where name ='getAuditorDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAuditorDetails]
END
GO

create procedure
getAuditorDetails
as 
begin
select EI.* from process_model_auditor audit
inner join EMP_INFO ei on audit.emp_id = ei.EMP_ID and audit.active_status = 1 and audit.retired_on is null and audit.isactive =1

end
GO

delete from process_model_auditor

GO

insert into process_model_auditor values (103285, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (103257, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (102941, 1, null, getdate(), 103245, getdate(), 103245, 1)  
insert into process_model_auditor values (102884, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (103333, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (103821, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (101152, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (101211, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (100311, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (101614, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (100019, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (101728, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (103464, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (102991, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (100062, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (102801, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (102898, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (103117, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (102791, 1, null, getdate(), 103245, getdate(), 103245, 1)
insert into process_model_auditor values (101560, 1, null, getdate(), 103245, getdate(), 103245, 1)

GO

delete from AUDITOR_QUALIFIED_STANDARDS

GO

insert into AUDITOR_QUALIFIED_STANDARDS values (103285, 'Active', 2, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (103285, 'Active', 4, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (103257, 'Active', 2, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (103257, 'Active', 4, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (102941, 'Active', 2, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (102941, 'Active', 4, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (102884, 'Active', 2, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (102884, 'Active', 4, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (103333, 'Active', 2, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (103333, 'Active', 4, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (103821, 'Active', 2, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (103821, 'Active', 4, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (101152, 'Active', 2, '2016-02-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (101152, 'Active', 3, '2016-02-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (101211, 'Active', 2, '2016-12-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (101211, 'Active', 3, '2016-12-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (100630, 'Active', 2, '2017-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (100630, 'Active', 3, '2017-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (101614, 'Active', 2, '2016-12-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (101614, 'Active', 3, '2016-12-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (103464, 'Active', 11, '2020-01-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (102991, 'Active', 11, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (100062, 'Active', 11, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (102801, 'Active', 11, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (102898, 'Active', 11, '2020-04-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (101152, 'Active', 11, '2020-04-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (102791, 'Active', 11, '2020-04-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (101560, 'Active', 11, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)
insert into AUDITOR_QUALIFIED_STANDARDS values (103333, 'Active', 11, '2020-06-01', null, GETDATE(), 103245, GETDATE(), 103245, 1)