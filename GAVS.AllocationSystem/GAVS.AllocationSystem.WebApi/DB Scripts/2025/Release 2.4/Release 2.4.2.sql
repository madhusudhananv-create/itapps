IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_CC_LIST_HITEC')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_CC_LIST_HITEC',  
    'rajaneesh.kini@gavstech.com,nitin.naveen@gavstech.com,niraj.nadkar@gslab.com',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO

IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_CC_LIST_DIVER')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_CC_LIST_DIVER',  
    'lakshminarasimhan.j@gavstech.com,rajaneesh.kini@gavstech.com',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO

IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_CC_LIST_HEAL')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_CC_LIST_HEAL',  
    'srinivasan.m@gavstech.com,rajaneesh.kini@gavstech.com',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO