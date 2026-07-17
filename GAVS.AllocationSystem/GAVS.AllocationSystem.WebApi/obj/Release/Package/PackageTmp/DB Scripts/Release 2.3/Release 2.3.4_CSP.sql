
USE CSP
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getViewCssDetailsForCSATInsights' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[getViewCssDetailsForCSATInsights]
END
GO
CREATE PROCEDURE [dbo].[getViewCssDetailsForCSATInsights]                      
@startDate varchar(10),                    
@endDate varchar(10),                    
@custIds varchar(max)                    
AS                      
BEGIN             
      select CB.CUST_ID ,C.CUST_NM ,P.PROJ_ID,P.PROJ_NM, CT.CONTACT_NAME ,B.START_DATE AS START_DATE,B.END_DATE AS END_DATE, 
	 
      YEAR_QUARTER  = (select 'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)),            
      RATING_QUARTER = STUFF((select ':' + Cast(R1.RATING as varchar)  from CSP..CSS_QUESTION_REPLIES R1 Where R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1            
      for xml path ('')),1,1,''),CB.STATUS As SURVEY_STATUS,CT.CONTACT_NAME + ' - ' + P.PROJ_NM as [DISPLAY_TEXT],CB.ID as BATCH_CUSTOMER_ID,null as BATCH_CUSTOMER_MONTHLIY_ID            
      ,URL ='https://csm.gavstech.com//layout/surveyfeedback/' + cast(CB.CUST_ID AS varchar) +'/'+ P.PROJ_ID + '/Quartely/' + CAST(B.SEQUENCE AS VARCHAR) + '/'+CAST(B.YEAR AS VARCHAR) +'/'+ cast(U.ID AS VARCHAR)      
     ,SURVEY_FEEDBACK_URL_FOR_CUSTOMER = 'https://csm.gavstech.com//layout/surveyfeedback/' + cast(CB.CUST_ID AS varchar) +  '/Quartely/' + CAST(B.SEQUENCE AS VARCHAR) + '/'+CAST(B.YEAR AS VARCHAR) +'/'+ cast(U.ID AS VARCHAR)    
      FROM [CSP].[dbo].[CSS_BATCH_CUSTOMERS] CB              
      INNER JOIN BAS..CUSTOMER C ON C.CUST_ID = CB.CUST_ID             
      INNER JOIN BAS.DBO.PROJECT P on p.proj_id = CB.proj_id              
      INNER JOIN CSP.DBO.CSS_BATCHES B ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1             
      INNER JOIN CSP..CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1              
      INNER JOIN CSP..CUSTOMER_USERS U on U.EMAILID = CT.CONTACT_EMAILID          
      WHERE (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate))              
      AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                
                
       Union              
              
        SELECT BCM.CUST_ID,C.CUST_NM ,'' [PROJ_ID] ,'' PROJ_NM ,                 
        CT.CONTACT_NAME  ,BM.START_DATE AS START_DATE,BM.END_DATE AS END_DATE,              
       [YEAR_QUARTER] = (select YEAR_QUARTER from fn_getQuarter(@startDate,@endDate) where START_DATE = BM.START_DATE),                    
        RATING_QUARTER = STUFF((select ':' + Cast(R1.RATING as varchar)  from CSP..CSS_QUESTION_REPLIES R1 Where R1.Batch_Customer_Monthly_id = BCM.ID and BCM.ISACTIVE =1     
        and BCM.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1     
        for xml path ('')),1,1,''),BCM.STATUS As SURVEY_STATUS,CT.CONTACT_NAME +' - ' +substring( C.CUST_NM ,1,7) as [DISPLAY_TEXT],null as BATCH_CUSTOMER_ID ,BCM.Id as BATCH_CUSTOMER_MONTHLIY_Id ,           
        URL ='https://csm.gavstech.com//layout/surveyfeedback/' + cast(BCM.CUST_ID AS varchar) + '/Monthly/' + CAST(BM.MONTH AS VARCHAR) + '/'+CAST(BM.YEAR AS VARCHAR) +'/'+ cast(U.ID AS VARCHAR)          
        ,SURVEY_FEEDBACK_URL_FOR_CUSTOMER = 'https://csm.gavstech.com//layout/surveyfeedback/' + cast(BCM.CUST_ID AS varchar) + '/Monthly/' + CAST(BM.MONTH AS VARCHAR) + '/'+CAST(BM.YEAR AS VARCHAR) +'/'+ cast(U.ID AS VARCHAR)     
        FROM [CSP].[dbo].[CSS_BATCH_CUSTOMER_MONTHLY] BCM                
        INNER JOIN BAS.DBO.CUSTOMER C on c.cust_id = BCM.cust_id                      
        INNER JOIN CSP.DBO.CSS_BATCH_MONTHLY BM ON BM.ID = BCM.BATCH_MONTHLY_ID                 
        INNER JOIN CSP..CONTACTS CT on CT.CUSTOMER_ID = BCM.CUST_ID and CT.CONTACT_EMAILID = BCM.EMAIL_ID and CT.ISACTIVE = 1      
        INNER JOIN CSP..CUSTOMER_USERS U on U.EMAILID = CT.CONTACT_EMAILID     
        WHERE ((convert(varchar,BM.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,BM.END_DATE,23) BETWEEN @startDate AND @endDate))                     
        AND (@custIds = '-1' OR BCM.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))             
        order by CUST_NM,PROJ_NM,YEAR_QUARTER            
END 
GO
