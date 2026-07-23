USE BAS
GO
 
IF NOT EXISTS(select 1 from REPORTS_SP_DETAILS where SP_DISPLAY_NAME='reports_CSATDUMP_Monthly')
BEGIN
INSERT INTO REPORTS_SP_DETAILS VALUES ('reports_CSATDUMP_Monthly','CSS Report Monthly','BAS')
INSERT INTO REPORTS_PARAMS VALUES (26,'StartDate','DATE','2021-04-01')
INSERT INTO REPORTS_PARAMS VALUES (26,'EndDate','DATE','2022-03-31')
END

GO

IF EXISTS(Select 1 from sys.procedures where name ='reports_CSATDUMP_Monthly' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSATDUMP_Monthly]
END
GO 



CREATE PROCEDURE [dbo].[reports_CSATDUMP_Monthly]

    @StartDate Date,              
    @EndDate Date
 
    AS
    BEGIN

    WITH CSM AS (                    
    SELECT P.CUST_ID,E.FRST_NM  CSM_NAME FROM BAS.DBO.project p                
    INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_DM_EMP_ID) ,         

    AM AS (                    
    SELECT distinct P.CUST_ID,E.FRST_NM  CSM_NAME FROM BAS.DBO.project p                
    INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_AM_EMP_ID          
            )
                
    SELECT  c.cust_nm [Customer Name], b.DISPLAY_NAME [Respondent Name],  B.EMAIL_ID  [Email Id]              
    , FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT sent Date]                
    ,FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT received Date],                
    FORMAT(SURVEY_SENT_DATE,'MMM') +'-' + CAST(YEAR(SURVEY_SENT_DATE) as varchar(10)) AS MONTH,
    (SELECT TOP 1 QUESTION FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 1)   [Q1 Question]              
    , (SELECT TOP 1 RATING FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 1)   [Q1 Rating]                
    , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 1)  [Q1 Comments]                
    , (SELECT TOP 1 QUESTION FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 2)  [Q2 Question]              
    , (SELECT TOP 1 RATING FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 2)   [Q2 Rating]                
    , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 2)  [Q2 Comments]                
    , (SELECT TOP 1 QUESTION FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 3)  [Q3 Question]              
    , (SELECT TOP 1 RATING FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 3)  [Q3 Rating]                
    , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 3)   [Q3 Comments]                
    , (SELECT TOP 1 RATING FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 4)  [NPS Rating]                
    , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 4)   [NPS Comments ]               
    , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '')  FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 5)   [Any Other Feedback]              
    , c.Cust_ID [Customer ID],
    STUFF((select distinct ',' + CSM.CSM_NAME from CSM CSM
    join CSP..CSS_BATCH_CUSTOMER_MONTHLY bcc on CSm.CUST_ID = bcc.CUST_ID
    for xml path ('')),1,1,'')as [Customer Success Manager],  
    STUFF((select distinct ',' + AM.CSM_NAME from AM AM
    join CSP..CSS_BATCH_CUSTOMER_MONTHLY bcc on AM.CUST_ID = bcc.CUST_ID
    for xml path ('')),1,1,'')as[ACCOUNT MANAGER]
 
    FROM [CSP].[dbo].[CSS_BATCH_CUSTOMER_MONTHLY] b                
    INNER JOIN CSP.DBO.CSS_BATCH_MONTHLY bt on   bt.id = b.BATCH_MONTHLY_ID          
    inner join bas.dbo.customer c on c.cust_id = b.cust_id                               
    WHERE b.STATUS = 'COMPLETED'  and
    (( bt.start_date between @StartDate and @EndDate    ) OR ( bt.ENd_date between @StartDate and @EndDate    ))          
    order by bt.id,[Customer Name]              
               
    END	
    go

if not exists (select 1 from bas..CONFIGURATION_EXT where [KEY]  = 'CUSTOMER_SUCCESS_SURVEY_CC')
begin

insert into bas..CONFIGURATION_EXT 
 values 
('CUSTOMER_SUCCESS_SURVEY_CC','sekar.thanigaimani@gavstech.com,Sriram.Radhakrishnan@gavstech.com,Balaji.Uppili@gavstech.com,PremierQualityTeam@gavstech.com', 212100001,null,null, 0,1)
end

if not exists (select 1 from bas..CONFIGURATION_EXT where [KEY]  = 'CSS_SUCCESS_MAIL_CC')
begin

insert into bas..CONFIGURATION_EXT 
 values 
('CSS_SUCCESS_MAIL_CC','PremierQualityTeam@gavstech.com', 212100001,null,null, 0,1)

end

if not exists (select 1 from bas..CONFIGURATION_EXT where [KEY]  = 'CUSTOMER_SUCCESS_SURVEY_TO')
begin

insert into bas..CONFIGURATION_EXT 
 values 
('CUSTOMER_SUCCESS_SURVEY_TO','Premier_Managers@gavstech.com, premier_PMO@gavstech.com', 212100001,null,null, 0,1)

end

if not exists (select 1 from bas..CONFIGURATION_EXT where [KEY]  = 'CSS_REQUEST_CC')
begin

insert into bas..CONFIGURATION_EXT values ('CSS_REQUEST_CC','balaji.ramamoorthy@gavstech.com', 202100079,null,null, 0,1)

end
go

			   



