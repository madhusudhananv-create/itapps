USE CSP
GO

---3.	Security threat Mitigation Reference no to be changed as N.K.5
IF NOT EXISTS (SELECT 1 FROM REFERENCE_MASTER WHERE REFERENCE='N.K.5')
BEGIN 
UPDATE REFERENCE_MASTER 
SET REFERENCE='N.K.5',
UPDATED_BY =105683,
UPDATED_DATE=GETDATE() 
WHERE REFERENCE='B.BE.6'

END



---changed in the descriptions (tooltip)
UPDATE PRODUCT_SERVICE_LEVEL_METRICS 
SET SERVICE_LEVEL_METRIC_DESCRIPTION='* No of backlog items submitted within 10 business (epic level)/ Total backlogs offered for the measurement period
 * No of backlog items submitted within 3 business days (story level) / Total backlogs offered for the measurement period.',
UPDATED_BY =105683,
UPDATED_DATE=GETDATE() 
WHERE REFERENCE_ID=1




-- Denom ,nume changes

  UPDATE [CSP].[dbo].[BASE_MEASURE] SET  
  NUMERATORDESCRIPTION='Total no of P1 incidents resolved within the specification limit',
  DENOMINATORDESCRIPTION='Total no of P1 incidents resolved for the measurement period',
  UPDATED_BY =105683,
  UPDATED_DATE=GETDATE() 
  WHERE ID='25'

  UPDATE [CSP].[dbo].[BASE_MEASURE] SET  
  NUMERATORDESCRIPTION='Total no of P2 incidents resolved within the specification limit',
  DENOMINATORDESCRIPTION='Total no of P2 incidents resolved for the measurement period',
  UPDATED_BY =105683,
  UPDATED_DATE=GETDATE() 
  WHERE ID='26'

  
  
  UPDATE [CSP].[dbo].[BASE_MEASURE] SET  
  NUMERATORDESCRIPTION='Total no of P3 incidents resolved within the specification limit',
  DENOMINATORDESCRIPTION='Total no of P3 incidents resolved for the measurement period',
  UPDATED_BY =105683,
  UPDATED_DATE=GETDATE() 
  WHERE ID='27'

   UPDATE [CSP].[dbo].[BASE_MEASURE] SET  
  NUMERATORDESCRIPTION='Total number of recurring tests that are automated',
  DENOMINATORDESCRIPTION='Total number of  tests planned',
  UPDATED_BY =105683,
  UPDATED_DATE=GETDATE() 
  WHERE ID='11'



  UPDATE [CSP].[dbo].[BASE_MEASURE] SET  
  NUMERATORDESCRIPTION='Total no of service catalog items automated',
  DENOMINATORDESCRIPTION='Total no of service catalog items identified',
  UPDATED_BY =105683,
  UPDATED_DATE=GETDATE() 
  WHERE ID='18'
   

   
  UPDATE [CSP].[dbo].[BASE_MEASURE] SET  
  NUMERATORDESCRIPTION='Total no of problems resolved & closed with in the specification limit',
  DENOMINATORDESCRIPTION='Total no of problems closed in the current month',
  UPDATED_BY =105683,
  UPDATED_DATE=GETDATE() 
  WHERE ID='17'
   
   
  UPDATE [CSP].[dbo].[BASE_MEASURE] SET  
  NUMERATORDESCRIPTION='Total no of backlog items delivered on time and accepted per month per product',
  DENOMINATORDESCRIPTION='Total no of backlog items committed per month per product.',
  UPDATED_BY =105683,
  UPDATED_DATE=GETDATE() 
  WHERE ID='8'