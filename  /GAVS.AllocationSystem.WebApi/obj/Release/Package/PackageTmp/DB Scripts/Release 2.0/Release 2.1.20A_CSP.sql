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