
use csp
go

if not exists(select 1 from sys.tables where name = 'CSP..TASK_2021_09_24')
	begin

		select * into  CSP..TASK_2021_09_24
		from csp..TASK

	end
	go

if exists (select 1 from CSP..TASK where TASK_CATEGORY_ID in (select ID from CSP..TASK_CATEGORY where TITLE ='AUDIT'))
begin

update CSP..TASK set TASK_CATEGORY_ID = (select ID from CSP..TASK_CATEGORY where TITLE ='ASSESSMENT' and ISACTIVE = 1) where TASK_CATEGORY_ID in (select ID from CSP..TASK_CATEGORY where TITLE ='AUDIT')

end
go

if not exists(select 1 from sys.tables where name = 'CSP..TASK_CATEGORY_2021_09_24')
	begin

		select * into  CSP..TASK_CATEGORY_2021_09_24
		from csp..TASK_CATEGORY

	end
	go


if exists(select 1 from CSP..TASK_CATEGORY where TITLE ='AUDIT')
begin
  update CSP..TASK_CATEGORY set ISACTIVE = 0 where TITLE ='AUDIT'
end
go

if exists (select 1 from CSP..PARAMETER_TABLE where NAME = 'AUDIT_CATEGORY')
begin
-- audit
 update CSP..PARAMETER_TABLE set ISACTIVE = 0 where NAME  = 'AUDIT_CATEGORY' and OPTIONS = 1 
 -- assessment 
 update csp..PARAMETER_TABLE set SORT_ORDER = 1 where NAME = 'AUDIT_CATEGORY' and OPTIONS = 4

end
go

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'SORT_ORDER'
          AND Object_ID = Object_ID('CSP..TASK_CATEGORY'))
BEGIN
    ALTER TABLE CSP..TASK_CATEGORY
	ADD SORT_ORDER int  null
END

GO

IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'SORT_ORDER'
          AND Object_ID = Object_ID('CSP..TASK_CATEGORY'))
begin

create table #table (Category_Title varchar(250),Sort_order int)

insert into #table values ('IDEATION',0),
('AUDIT',1),
('HEALTH CHECK',1),
('ASSESSMENT',1),
('Release Assessment',2),
('Maturity Level Assessment',3),
('Risk Assessment',4),
('FMEA',5),
('ADVISORY',6),
('CONTRIBUTE',7),
('REVIEW',8),
('MEETING',9),
('CONSULTATION',10),
('SoW-Requirements',11),
('MSA-Requirements',12),
('SD Review with Customer',13),
('Service Delivery (SD) Review - Internal',14),
('PCI-DSS V3.2',15),
('CR-Implementation',16)

update CSP..TASK_CATEGORY set sort_order = T.Sort_order

from #table T where T.Category_Title = TITLE

drop table #table

end
go

if exists(select 1 from CSP..TASK_CATEGORY where TITLE = 'ASSESSMENT')
begin

update CSP..TASK_CATEGORY set TITLE = 'PROCESS ASSESSMENT' where TITLE = 'ASSESSMENT'

end
go

if exists(select 1 from CSP..TASK_CATEGORY where TITLE = 'HEALTH CHECK')
begin

update CSP..TASK_CATEGORY set TITLE = 'PROCESS HEALTH CHECK' where TITLE = 'HEALTH CHECK'

end
go
