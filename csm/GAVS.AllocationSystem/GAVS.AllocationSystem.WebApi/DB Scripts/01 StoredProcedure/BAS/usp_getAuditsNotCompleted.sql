IF EXISTS (
  SELECT 
    1 
  FROM 
    sys.procedures 
  WHERE 
    name = 'usp_getAuditsNotCompleted' 
    AND TYPE = 'P'
) BEGIN 
DROP 
  PROCEDURE [dbo].usp_getAuditsNotCompleted 
  END 
  GO 
  
  -- =============================================
  -- Author:  Indhu
  -- Create date: 01/Nov/2023
  -- Description: get Audits Not Completed
  -- =============================================
  CREATE PROCEDURE usp_getAuditsNotCompleted AS BEGIN 
SELECT 
  DISTINCT T.ID, 
  T.CUST_ID, 
  C.CUST_NM, 
  T.PROJ_ID, 
  P.PROJ_NM, 
  TC.TITLE TASK_CATEGORY, 
  T.DESCRIPTION, 
  T.STATUS, 
  T.PRIORITY, 
  T.SCHEDULED_START_DATE, 
  T.DUE_DATE, 
  T.OWNER, 
  AU.MANAGER_EMP_ID,
  T.ASSIGNED_TO, 
  A.AUDITOR_EMP_ID, 
  ISNULL(TR.FREQUENCY, 'On-Going') AS FREQUENCY, 
  t.COMMENTS 
FROM 
  [TASK] T (NOLOCK) 
  INNER JOIN TASK_TYPE TT (NOLOCK) ON TT.ID = T.TASK_TYPE_ID 
  and T.ISACTIVE = 1 
  INNER JOIN TASK_CATEGORY TC (NOLOCK) ON TC.ID = T.TASK_CATEGORY_ID 
  LEFT JOIN AUDIT_SCHEDULE A (NOLOCK) ON T.ID = A.TASK_ID 
  LEFT JOIN CUSTOMER C (NOLOCK) ON C.CUST_ID = T.CUST_ID 
  LEFT JOIN PROJECT P (NOLOCK) ON P.PROJ_ID = T.PROJ_ID 
  LEFT JOIN TASK_RECURRENCE TR (NOLOCK) ON T.ID = TR.TASK_ID 
   LEFT JOIN EMP_INFO AU ON AU.EMP_ID=A.AUDITOR_EMP_ID
WHERE 
  Due_Date is not null 
  AND T.TASK_TYPE_ID = 2 
  AND DUE_DATE < GETDATE() 
  AND t.ISACTIVE = 1 
  AND ISNULL(T.STATUS, '') NOT IN ('COMPLETED', 'CANCELLED') END
