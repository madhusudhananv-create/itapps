USE CSP

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 0,
UPPER_BOUND_SCORE = 24,
level_title = 'Level0 - Impeded',
level_desc = 'Level0 - Impeded'
WHERE process_model_id = 11 AND level_number = 1

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 25,
UPPER_BOUND_SCORE = 49,
level_title = 'Level1 - In Transition',
level_desc = 'Level1 - In Transition'
WHERE process_model_id = 11 AND level_number = 2

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 50,
UPPER_BOUND_SCORE = 74,
level_title = 'Level2 - Sustainable',
level_desc = 'Level2 - Sustainable'
WHERE process_model_id = 11 AND level_number = 3

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 75,
UPPER_BOUND_SCORE = 94,
level_title = 'Level3 - Agile',
level_desc = 'Level3 - Agile'
WHERE process_model_id = 11 AND level_number = 4

GO

UPDATE PM_MATURITYLEVEL_MAPPING
SET LOWER_BOUND_SCORE = 95,
UPPER_BOUND_SCORE = 100,
level_title = 'Level4 - Ideal',
level_desc = 'Level4 - Ideal'
WHERE process_model_id = 11 AND level_number = 5

GO

IF EXISTS(Select 1 from sys.objects where name ='getProjectKpiActualsForPeriod' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjectKpiActualsForPeriod]
END

GO

create PROCEDURE
  getProjectKpiActualsForPeriod
  @projectid varchar(200),
  @period datetime
  as
  begin


 SELECT T.START_DATE [KpiStartDate], T.END_DATE [KpiEndDate], T.SLA_TARGET_VERYHIGH_DESCRIPTION [veryhighdesc], 
	T.SLA_TARGET_VERYHIGH_OPERATOR [targetveryhighoperator], 
	T.SLA_TARGET_VERYHIGH_VALUE [targetveryhighvalue],
	T.SLA_TARGET_HIGH_DESCRIPTION [highdesc], T.SLA_TARGET_HIGH_OPERATOR [targethighoperator], T.SLA_TARGET_HIGH_VALUE [targethighvalue],
	T.SLA_TARGET_MEDIUM_DESCRIPTION [mediumdesc], T.SLA_TARGET_MEDIUM_OPERATOR [targetmediumoperator], T.SLA_TARGET_MEDIUM_VALUE [targetmediumvalue],
	T.SLA_TARGET_LOW_DESCRIPTION [lowdesc], T.SLA_TARGET_LOW_OPERATOR [targetlowoperator], T.SLA_TARGET_LOW_VALUE [targetlowvalue],
	CAST(D.KPI_ACTUAL AS DECIMAL(10, 2)) [KpiActualValue]

	 FROM KPI_GOALS  G
  INNER JOIN KPI K ON g.ID = k.GOAL_ID AND G.PROJECT_ID = @projectid
  INNER JOIN KPI_TARGETS T ON T.KPI_ID = K.ID and @period between T.START_DATE  AND T.END_DATE  
  INNER JOIN KPI_DETAILS D ON D.KPI_ID = K.ID AND D.ISACTIVE =1 AND PERIOD >= (SELECT DATEADD(mm, DATEDIFF(mm, 0,@period)  , 0))
   AND PERIOD <= (SELECT DATEADD(mm, DATEDIFF(mm, 0, @period ) +1 , 0))
  where g.ISACTIVE =1  and k.ISACTIVE = 1 and t.ISACTIVE = 1  and G.END_DATE > @period 
  
  end