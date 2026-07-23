USE BAS 
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_ExternalKPIsToProcess' AND TYPE='P')
BEGIN
DROP PROCEDURE usp_get_ExternalKPIsToProcess          
END
GO
--usp_get_ExternalKPIsToProcess '202100121','freshworks'
CREATE proc [dbo].[usp_get_ExternalKPIsToProcess]    
 @custId varchar(20),                            
 @source varchar(20),
 @startDate smalldatetime,
 @endDate smalldatetime
AS                                                    
BEGIN                       

  SELECT kd.ID,kd.KPI_DATA,kd.INPUT_DATE,kd.IS_PROCESSED,kd.CREATED_BY,kd.CREATED_DATE,kd.UPDATED_BY,kd.UPDATED_DATE,kd.ISACTIVE,kd.MASTER_ID
  FROM EXTERNAL_KPI_DATA KD (NOLOCK)
  INNER JOIN EXTERNAL_KPI_DATA_MASTER KM  (NOLOCK)
  ON KD.MASTER_ID = KM.ID
  WHERE  KM.ISACTIVE =1 AND ((@SOURCE='freshworks' AND KD.IS_PROCESSED<>1) OR @SOURCE='zif') 
  AND KM.SOURCE = @source AND KM.CUST_ID = @custId
                                                    
END     
  
