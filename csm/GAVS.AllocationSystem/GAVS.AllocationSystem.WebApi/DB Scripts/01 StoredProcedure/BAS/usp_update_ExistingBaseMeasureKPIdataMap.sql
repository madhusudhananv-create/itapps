--USE [BAS]
--GO 

IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'usp_update_ExistingBaseMeasureKPIdataMap'
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].usp_update_ExistingBaseMeasureKPIdataMap
END
GO

-- =============================================
-- Author:  Indhu
-- Create date: 07/Jun/2023
-- Description: delete Existing Base Measure KPIdata Map
-- =============================================
CREATE PROCEDURE [dbo].usp_update_ExistingBaseMeasureKPIdataMap
    @extTable TT_BASE_MEASURE_EXTERNAL_KPI_DATA READONLY,
    @empId varchar(10) 
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;
    if EXISTS (SELECT 1 FROM @extTable)
    BEGIN

        --- delete missing Maps
        DELETE bmkd
        from BASE_MEASURE_EXTERNAL_KPI_DATA bmkd
            left JOIN @extTable temp
                ON bmkd.KPI_BASE_MEASURE_VALUE_ID = temp.KPI_BASE_MEASURE_VALUE_ID
                   AND temp.EXTERNAL_KPI_DATA_ID = bmkd.EXTERNAL_KPI_DATA_ID
                   AND bmkd.KPI_DATATYPE = temp.KPI_DATATYPE
                   AND bmkd.ISACTIVE = 1
        WHERE temp.KPI_BASE_MEASURE_VALUE_ID is nULL --AND temp.KPI_DATA IS NOT NULL 

        --- update old Maps
        UPDATE bmkd
        SET bmkd.KPI_DATA_JSON = temp.KPI_DATA_JSON,
            bmkd.updated_BY = @empID,
            bmkd.UPDATED_DATE = getdate()
        FROM BASE_MEASURE_EXTERNAL_KPI_DATA bmkd
            left JOIN @extTable temp
                ON bmkd.KPI_BASE_MEASURE_VALUE_ID = temp.KPI_BASE_MEASURE_VALUE_ID
                   AND temp.EXTERNAL_KPI_DATA_ID = bmkd.EXTERNAL_KPI_DATA_ID
                   AND bmkd.KPI_DATATYPE = temp.KPI_DATATYPE
                   AND bmkd.ISACTIVE = 1
        WHERE temp.KPI_BASE_MEASURE_VALUE_ID is NOT nULL --AND temp.KPI_DATA IS NOT NULL 

        --- Insert New Maps
        INSERT INTO BASE_MEASURE_EXTERNAL_KPI_DATA
        (
            KPI_BASE_MEASURE_VALUE_ID,
            EXTERNAL_KPI_DATA_ID,
            KPI_DATA_JSON,
            CREATED_BY,
            CREATED_DATE,
            UPDATED_BY,
            UPDATED_DATE,
            ISACTIVE,
            KPI_DATATYPE
        )
        SELECT temp.KPI_BASE_MEASURE_VALUE_ID,
               temp.EXTERNAL_KPI_DATA_ID,
               temp.KPI_DATA_JSON,
               @empId,
               getdate(),
               @empId,
               getdate(),
               1,
               temp.KPI_DATATYPE
        FROM @extTable temp
            left JOIN BASE_MEASURE_EXTERNAL_KPI_DATA bmkd
                ON bmkd.KPI_BASE_MEASURE_VALUE_ID = temp.KPI_BASE_MEASURE_VALUE_ID
                   AND temp.EXTERNAL_KPI_DATA_ID = bmkd.EXTERNAL_KPI_DATA_ID
                   AND bmkd.KPI_DATATYPE = temp.KPI_DATATYPE
                   AND bmkd.ISACTIVE = 1
        WHERE bmkd.KPI_BASE_MEASURE_VALUE_ID is nULL --AND temp.KPI_DATA IS NOT NULL 


		--update rows as Processed (so that rows  won't be considered again
		UPdate ek
		SET IS_PROCESSED=1
		FROM @extTable temp
		INNER JOIN EXTERNAL_KPI_DATA ek
		ON ek.KPI_DATA=temp.KPI_DATA_JSON
		WHERE IS_PROCESSED=0


    END

END