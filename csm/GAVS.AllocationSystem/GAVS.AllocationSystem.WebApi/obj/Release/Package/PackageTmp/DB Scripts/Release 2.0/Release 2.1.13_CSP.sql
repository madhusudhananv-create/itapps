IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'LOWER_BOUND_SCORE'
          AND Object_ID = Object_ID('PM_MATURITYLEVEL_MAPPING'))
BEGIN
   alter table PM_MATURITYLEVEL_MAPPING
   add LOWER_BOUND_SCORE int
END

GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'UPPER_BOUND_SCORE'
          AND Object_ID = Object_ID('PM_MATURITYLEVEL_MAPPING'))
BEGIN
   alter table PM_MATURITYLEVEL_MAPPING
   add UPPER_BOUND_SCORE int
END

GO

IF not exists(SELECT 1 FROM PM_MATURITYLEVEL_MAPPING where [PROCESS_MODEL_ID] = 12)
BEGIN

insert into PM_MATURITYLEVEL_MAPPING values (12, 7, 1, '0-Survival', '0-Survival', 103245, getdate(), 103245, GETDATE(), 1, 0, 10)
insert into PM_MATURITYLEVEL_MAPPING values (12, 8, 2, '1-Awareness', '1-Awareness', 103245, getdate(), 103245, GETDATE(), 1, 11, 30)
insert into PM_MATURITYLEVEL_MAPPING values (12, 9, 3, '2-Committed', '2-Committed', 103245, getdate(), 103245, GETDATE(), 1, 31, 50)
insert into PM_MATURITYLEVEL_MAPPING values (12, 10, 4, '3-Proactive', '3-Proactive', 103245, getdate(), 103245, GETDATE(), 1, 51, 70)
insert into PM_MATURITYLEVEL_MAPPING values (12, 11, 5, '4-Service Aligned', '4-Service Aligned', 103245, getdate(), 103245, GETDATE(),1, 71, 90)
insert into PM_MATURITYLEVEL_MAPPING values (12, 12, 6, '5-Business Partnership', '5-Business Partnership', 103245, getdate(), 103245, GETDATE(), 1, 91, 100)

END

GO