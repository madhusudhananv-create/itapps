USE BAS
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getPremierKPIRemainderMailReport' AND TYPE='P')
BEGIN
 DROP PROCEDURE getPremierKPIRemainderMailReport          
END
GO

CREATE procedure [dbo].getPremierKPIRemainderMailReport

@custId varchar(20),
@projectID varchar(20),
@startDate DATE,
@endDate DATE 

AS

BEGIN          
  
Declare @quarterStartDate DateTime            
Declare @quarterEndDate DateTime            
            
Set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,0))            
Set @quarterEndDate = (Select csp.dbo.Fn_GetQuarterDates(@enddate,1))             

;with cte as
(
select distinct P.PROJ_NM,P.PROJ_ID ,
PORTFOLIO_NAME=(select Title from CSP..PORTFOLIO where ID=(select top 1 PORTFOLIO_ID from CSP..PORTFOLIO_PROJECT where PROJ_ID=PP.PROJ_ID)),
KPI_Count = (select count(*) from CSP..KPI_GOALS where PROJECT_ID=PP.PROJ_ID  and ISACTIVE=1 ),  

No_of_KPIs_Entered = (select count(*) from CSP..KPI_DETAILS KD  inner join CSP..KPI K on K.ID = KD.KPI_ID where K.PROJECT_ID=PP.PROJ_ID and K.ISACTIVE=1 and KD.ISACTIVE=1 and isnull(isdraft,0) = 0 and  
	(( K.FREQUENCY in ('Monthly') and cast(period as date) between @startDate and @endDate ) or (K.FREQUENCY ='Quarterly' and cast(period as date) between @quarterStartDate and @quarterEndDate))),        

Manager_ID=(select EMP_ID from BAS..EMP_INFO where EMP_ID = (select top 1 PROJ_PM_EMP_ID from BAS..PROJECT where PROJ_ID=PP.PROJ_ID )),
Manager=(select FRST_NM from BAS..EMP_INFO where EMP_ID = (select top 1 PROJ_PM_EMP_ID from BAS..PROJECT where PROJ_ID=PP.PROJ_ID )),
Manager_Email=(select EMAIL_ID from BAS..EMP_INFO where EMP_ID = (select top 1 PROJ_PM_EMP_ID from BAS..PROJECT where PROJ_ID=PP.PROJ_ID )),

CSM_ID=(select EMP_ID from BAS..EMP_INFO where EMP_ID = (select top 1 PROJ_DM_EMP_ID from BAS..PROJECT where PROJ_ID=PP.PROJ_ID )),
CSM=(select FRST_NM from BAS..EMP_INFO where EMP_ID = (select top 1 PROJ_DM_EMP_ID from BAS..PROJECT where PROJ_ID=PP.PROJ_ID )),
CSM_Email=(select EMAIL_ID from BAS..EMP_INFO where EMP_ID = (select top 1 PROJ_DM_EMP_ID from BAS..PROJECT where PROJ_ID=PP.PROJ_ID )),

QA_Spoc_ID=(select EMP_ID from BAS..EMP_INFO where EMP_ID = (select top 1 QUALITY_SPOC from BAS..PROJECT where PROJ_ID=PP.PROJ_ID )),
QA_Spoc=(select FRST_NM from BAS..EMP_INFO where EMP_ID = (select top 1 QUALITY_SPOC from BAS..PROJECT where PROJ_ID=PP.PROJ_ID )),
QASpoc_Email=(select EMAIL_ID from BAS..EMP_INFO where EMP_ID = (select top 1 QUALITY_SPOC from BAS..PROJECT where PROJ_ID=PP.PROJ_ID ))

from  
BAS..PROJECT P     
INNER join
CSP..PORTFOLIO_PROJECT PP on PP.PROJ_ID = P.PROJ_ID
Inner join
CSP..KPI_GOALS G  on G.PROJECT_ID = PP.PROJ_ID

where (@projectId =-1 or PP.PROJ_ID = @projectId) and ISNULL(P.PROJ_STATUS,'')!='Close' and PP.PORTFOLIO_ID!=2 )
--and P.PROJ_PM_EMP_ID=@PM_EMPId and P.PROJ_DM_EMP_ID=@CSM_EMPId)

select PORTFOLIO_NAME,PROJ_NM,PROJ_ID,KPI_Count,No_of_KPIs_Entered,
Status=case when No_of_KPIs_Entered>=KPI_Count then 'Submitted'	else 'Not Submitted' end,
Manager_ID,Manager,Manager_Email,CSM_ID,CSM,CSM_Email,QA_Spoc_ID,QA_Spoc,QASpoc_Email
from cte order by PORTFOLIO_NAME,PROJ_NM , Status 
 
END  
GO
