use csp
GO
IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='AUDIT_FINDING_CAPA_STATUS_HISTORY' AND COLUMN_NAME='CREATED_BY' )
BEGIN
ALTER TABLE AUDIT_FINDING_CAPA_STATUS_HISTORY ADD  CREATED_BY varchar(50) 
END

GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='AUDIT_FINDING_CAPA_STATUS_HISTORY' AND COLUMN_NAME='CREATED_DATE' )
BEGIN
ALTER TABLE AUDIT_FINDING_CAPA_STATUS_HISTORY ADD  CREATED_DATE DATETIME NOT NULL DEFAULT (GETDATE()); 
END

GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='AUDIT_FINDING_CAPA_REVIEW' AND COLUMN_NAME='CREATED_BY' )
BEGIN
ALTER TABLE AUDIT_FINDING_CAPA_REVIEW ADD  CREATED_BY varchar(50) 
END

GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='AUDIT_FINDING_CAPA_REVIEW' AND COLUMN_NAME='CREATED_DATE' )
BEGIN
ALTER TABLE AUDIT_FINDING_CAPA_REVIEW ADD  CREATED_DATE datetime NOT NULL DEFAULT (GETDATE());
END

GO

IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('CREATED_BY')
          AND Object_ID = Object_ID('AUDIT_FINDINGS_CAPA'))
BEGIN
    alter table CSP..AUDIT_FINDINGS_CAPA alter column CREATED_BY varchar(50)

END
GO

IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('UPDATED_BY')
          AND Object_ID = Object_ID('AUDIT_FINDINGS_CAPA'))
BEGIN
    alter table CSP..AUDIT_FINDINGS_CAPA alter column UPDATED_BY varchar(50)

END
GO

IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('UPDATED_BY')
          AND Object_ID = Object_ID('AUDIT_FINDING_STAGES_MAPPING'))
BEGIN
    alter table CSP..AUDIT_FINDING_STAGES_MAPPING alter column CREATED_BY varchar(50)

END
GO

IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('UPDATED_BY')
          AND Object_ID = Object_ID('AUDIT_FINDING_STAGES_MAPPING'))
BEGIN
    alter table CSP..AUDIT_FINDING_STAGES_MAPPING alter column UPDATED_BY varchar(50)

END
GO

IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('UPDATED_BY')
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_STATUS_HISTORY'))
BEGIN
    alter table CSP..AUDIT_FINDING_CAPA_STATUS_HISTORY alter column UPDATED_BY varchar(50)

END
GO

IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('UPDATED_BY')
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_REVIEW'))
BEGIN
    alter table CSP..AUDIT_FINDING_CAPA_REVIEW alter column UPDATED_BY varchar(50)

END
GO

IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('UPDATED_BY')
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_IMPLEMENTATION'))
BEGIN
    alter table CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION alter column UPDATED_BY varchar(50)

END
GO

IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('UPDATED_BY')
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_VERIFICATION'))
BEGIN
    alter table CSP..AUDIT_FINDING_CAPA_VERIFICATION alter column UPDATED_BY varchar(50)

END
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('CREATED_BY','CREATED_DATE')
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_REVIEW'))
BEGIN
    alter table csp..AUDIT_FINDING_CAPA_REVIEW add CREATED_BY varchar(50) ,CREATED_DATE datetime default getdate()

END
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('CREATED_BY','CREATED_DATE')
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_IMPLEMENTATION'))
BEGIN
    alter table csp..AUDIT_FINDING_CAPA_IMPLEMENTATION add CREATED_BY varchar(50) ,CREATED_DATE datetime default getdate()

END
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('CREATED_BY','CREATED_DATE')
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_VERIFICATION'))
BEGIN
    alter table csp..AUDIT_FINDING_CAPA_VERIFICATION add CREATED_BY varchar(50) ,CREATED_DATE datetime default getdate()

END
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME in ('CREATED_BY','CREATED_DATE')
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_STATUS_HISTORY'))
BEGIN
    alter table csp..AUDIT_FINDING_CAPA_STATUS_HISTORY add CREATED_BY varchar(50) ,CREATED_DATE datetime default getdate()

END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='KPI' AND COLUMN_NAME='KPI_UniqueID' )
BEGIN
ALTER TABLE KPI ADD  KPI_UniqueID varchar(50) NULL
END

GO



-- Task Re-Schedule 

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'RESCHEDULE_DATE'
          AND Object_ID = Object_ID('TASK'))
BEGIN
    ALTER TABLE  CSP..TASK  ADD RESCHEDULE_DATE DATE NULL
END
GO


IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'RESCHEDULE_REASON'
          AND Object_ID = Object_ID('TASK'))
BEGIN
    ALTER TABLE  CSP..TASK  ADD RESCHEDULE_REASON VARCHAR(MAX) NULL
END
GO


IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'RESCHEDULE_REQUESTER'
          AND Object_ID = Object_ID('TASK'))
BEGIN
    ALTER TABLE  CSP..TASK  ADD RESCHEDULE_REQUESTER VARCHAR(50) NULL
END
GO



update AUDIT_FINDING_CAPA_REVIEW set CREATED_BY = UPDATED_BY, CREATED_DATE = UPDATED_DATE from CSP..AUDIT_FINDING_CAPA_REVIEW

update AUDIT_FINDING_CAPA_IMPLEMENTATION set CREATED_BY = UPDATED_BY, CREATED_DATE = UPDATED_DATE from CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION

update AUDIT_FINDING_CAPA_VERIFICATION set CREATED_BY = UPDATED_BY, CREATED_DATE = UPDATED_DATE from CSP..AUDIT_FINDING_CAPA_VERIFICATION


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetTrendDataForPortfolio' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].GetTrendDataForPortfolio
END
GO


CREATE PROC GetTrendDataForPortfolio 
@customerId varchar(50),              
@kpiName varchar(250),            
@portfolioId int ,  
@startDate DateTime,                                          
@endDate DateTime                             
AS                          
BEGIN    
  
declare  @quarterStartDate Datetime                        
declare @quarterEndDate datetime                        
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                        
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@endDate,1));    
                
with cte as                    
(                      
 SELECT                      
   k.ID                    
   ,PORTFOLIO_ID = (select PORTFOLIO_ID from PORTFOLIO_PRODUCTS pp where pp.ID =  k.PRODUCT_ID and ISACTIVE =1)          
   ,PORTFOLIO_NAME = (select TITLE from PORTFOLIO p where p.ID =  @portfolioId and ISACTIVE =1)          
   , k.KPI_NAME                    
   , k.PRODUCT_ID ,Kd.PERIOD  as Period                   
  ,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID                    
 ,  (select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                       
 ,   (select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR                       
 ,ft.id as FID                    
 ,ft.formula ,  
 case when kd.sla_status in ('MET','NA','ND') then 1 else 0 end as SLA_Status  
                     
                     
 FROM csp..KPI K                                      
            
JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1   
and              
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                              
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))  
INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                    
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                          
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                    
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                    
  INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                         
 where                      
 K.CUSTOMER_ID  = @customerId    and  isnull(KD.ISFLAG,0) = 0  and isnull(KD.ISDRAFT,0)=0                 
 and k.ISACTIVE =1                    
             
  )                    
 select * into #temp from cte          
          
 IF(@kpiName = '')          
 BEGIN          
 select KPI_NAME,                    
  PORTFOLIO_ID,PORTFOLIO_NAME                    
    ,'' as TITLE,Period      
 ,max( FID) as FORMULA_ID                    
 ,max( formula) as FORMULA                    
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                    
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')       
 and count(SLA_Status) >0 then convert(decimal,sum(SLA_Status))/CONVERT(decimal, count(SLA_Status)) *100       
 else sum(KPI_NUMERATOR) end as KPI_NUMERATOR             
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                      
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(t.ID))                    
                      
  from #temp t where  PORTFOLIO_ID=@portfolioId      and Period <> ''      
  group by KPI_NAME,PORTFOLIO_ID,Period,PORTFOLIO_NAME                    
  order by   3, 2,1                    
 END          
 ELSE          
 BEGIN          
  select                     
    KPI_NAME                    
 , PORTFOLIO_ID,PORTFOLIO_NAME                    
    ,'' as TITLE,Period      
 ,max( FID) as FORMULA_ID                    
 ,max( formula) as FORMULA                    
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                    
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')       
 and count(SLA_Status) >0 then convert(decimal,sum(SLA_Status))/CONVERT(decimal, count(SLA_Status)) *100       
 else sum(KPI_NUMERATOR) end as KPI_NUMERATOR             
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                       
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(t.ID))                    
                      
  from #temp t where KPI_NAME=@kpiName and PORTFOLIO_ID=@portfolioId and Period <> ''           
  group by   KPI_NAME, PORTFOLIO_ID,Period,PORTFOLIO_NAME                    
  order by   3, 2,1                    
  END          
  DROP TABLE #temp          
 END 
 GO



--- TASK_STATUS RESCHEDULE  

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF not exists(Select 1 from sys.tables where name ='TASK_STATUS_HISTORY' AND type='U')
BEGIN

CREATE TABLE [dbo].[TASK_STATUS_HISTORY](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[TASK_ID] int NOT NULL,  
	STATUS varchar(50) NULL,
	STATUS_DATE [datetime] NOT NULL,
	[RESCHEDULE_DATE] [date] NULL,
	[RESCHEDULE_REASON] [varchar](max) NULL,
	[RESCHEDULE_REQUESTER] [varchar](50) NULL,
	[USER_ID] [varchar](50) NULL,
	[CREATED_BY] [varchar](50) NULL,
	[CREATED_DATE] [datetime] NOT NULL,
	[UPDATED_BY] [varchar](50) NOT NULL,
	[UPDATED_DATE] [datetime] NOT NULL,
	[ISACTIVE] [bit] NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
 

ALTER TABLE [dbo].TASK_STATUS_HISTORY ADD  DEFAULT (getdate()) FOR [CREATED_DATE] 

ALTER TABLE [dbo].TASK_STATUS_HISTORY ADD  DEFAULT (getdate()) FOR [UPDATED_DATE] 

ALTER TABLE [dbo].TASK_STATUS_HISTORY ADD  DEFAULT ((1)) FOR [ISACTIVE] 

END


GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'RESCHEDULE_DATE'
          AND Object_ID = Object_ID('TASK'))
BEGIN
    ALTER TABLE  CSP..TASK  ADD RESCHEDULE_DATE DATE NULL
END
GO


IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'RESCHEDULE_REASON'
          AND Object_ID = Object_ID('TASK'))
BEGIN
    ALTER TABLE  CSP..TASK  ADD RESCHEDULE_REASON VARCHAR(MAX) NULL
END
GO


IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'RESCHEDULE_REQUESTER'
          AND Object_ID = Object_ID('TASK'))
BEGIN
    ALTER TABLE  CSP..TASK  ADD RESCHEDULE_REQUESTER VARCHAR(50) NULL
END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='deleteKPIDetailsData' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[deleteKPIDetailsData]
END
GO

CREATE procedure deleteKPIDetailsData          
  
@productId int,  
@startDate Datetime,  
@endDate Datetime   
  
As  
Begin  
  
declare @quarterStartDate Datetime                                          
declare @quarterEndDate datetime                                          
                                      
set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates ( @startDate,0 ) );                            
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates ( @startDate,1 ) );                                            
  
delete from  CSP..KPI_DETAILS  where (PRODUCT_ID=@productId or @productId = -1) and   
(PERIOD_TYPE in ('Monthly','Release') and PERIOD between @startDate and @endDate)   
or (PERIOD_TYPE in ('Quarterly') and PERIOD  between  @quarterStartDate and @quarterEndDate )      
  
End  
Go

IF EXISTS(Select 1 from sys.procedures where name ='getMonthlyFindingsByTime' AND type='P')
    BEGIN
       DROP PROCEDURE [dbo].[getMonthlyFindingsByTime]
    END

    GO
 
   CREATE procedure [dbo].[getMonthlyFindingsByTime]   
    @custId varchar(MAX),
	@projIds varchar(MAX) = '-1' 
   AS        
   BEGIN   
   with cte1 as          
  (SELECT find.id,find.FINDING_TYPE,find.FINDING_DESCRIPTION,accept.created_date as accepted,find.CREATED_DATE,
    DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) as [AGE_OF_FINDING] ,
	 case when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 0 and 7 then '< 7 days'  
	 when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 7 and 14 then '> 7 days' 
	 when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 14 and 21 then '> 14 days'  
	 when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 21 and 30 then '> 21 days'  
	 when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) > 30 then '> 30 days' else '' end as AgeByDays
   from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS find        
   inner join csp..AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID     
   inner join csp..AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID     
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID    
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID 
   Inner join CSP..AUDIT_FINDING_STAGES_MAPPING map on find.ID = map.FINDING_ID and map.ISACTIVE =1 and map.STAGE_ID = 4 and map.ISCOMPLETE = 0
   left join csp..AUDITEE_ACCEPTANCE  accept on find.ID = accept.finding_id and accept.isactive = 1
   where find.issubmitted = 1 and find.ISACTIVE = 1  and exe.CUSTOMER_ID = @custId 
   AND (@projIds = '-1' OR exe.PROJECT_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,',')))  

   --or (exe.PROJECT_ID = '-1')
   --and month(find.created_date) = month(GETDATE()) and year(find.CREATED_DATE) = year(GETDATE())
  ) 
  
 
    SELECT  cte1.AgeByDays,
    SUM( CASE WHEN FINDING_TYPE='Weakness' THEN 1 ELSE 0 END ) AS Weakness,
    SUM( CASE WHEN FINDING_TYPE='Strength' THEN 1 ELSE 0 END ) AS Strength,
    SUM( CASE WHEN FINDING_TYPE='Threat' THEN 1 ELSE 0 END ) AS Threat,
    SUM( CASE WHEN FINDING_TYPE='Opportunity' THEN 1 ELSE 0 END ) AS Opportunity,
	SUM( CASE WHEN FINDING_TYPE='Major' THEN 1 ELSE 0 END ) AS Major,
	SUM( CASE WHEN FINDING_TYPE='Minor' THEN 1 ELSE 0 END ) AS Minor,
	SUM( CASE WHEN FINDING_TYPE='Opportunities for Improvement' THEN 1 ELSE 0 END ) AS [OpportunitiesforImprovement],
	SUM( CASE WHEN FINDING_TYPE='Recommendations' THEN 1 ELSE 0 END ) AS  Recommendations
	FROM cte1
    GROUP BY cte1.AgeByDays 
END 
GO

   
IF EXISTS(Select 1 from sys.procedures where name ='getAllFindingsForCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsForCustomer]
END
GO

CREATE PROCEDURE [dbo].[getAllFindingsForCustomer]            
  @custid VARCHAR(50),            
  @startdate varchar(10),            
  @enddate varchar(10)            
  as              
  begin        
      
  if(@startdate = '' AND @enddate = '')    
  BEGIN    
  with cte1 as            
  (SELECT find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.CREATED_DATE, find.UPDATED_DATE, exe.ASSESSMENT_ID,         
         
  CASE           
            
  WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)          
  then (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id          
  and ISCOMPLETE = 1 and ISACTIVE = 1          
  order by STAGE_ID desc)           
          
  else (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id AND ISACTIVE = 1          
  order by STAGE_ID asc)          
            
  END as 'STAGE_ID',          
          
  CASE WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)          
  then (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id          
  and ISCOMPLETE = 1 and ISACTIVE = 1          
   order by STAGE_ID desc)           
          
   else (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id and ISACTIVE = 1 order by STAGE_ID)          
   END as 'STAGE_STATUS',      
         
    exe.CUSTOMER_ID, exe.PROJECT_ID, c.CUST_NM, p.PROJ_NM, pp.PORTFOLIO_ID, port.TITLE as PORTFOLIO_NAME ,  
 DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) as [AGE_OF_FINDING]  
   from AUDIT_CHECKLIST_PROJECT_FINDINGS find          
   inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID       
   inner join AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID       
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID      
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID            
 inner join BAS..CUSTOMER C ON C.CUST_ID = exe.CUSTOMER_ID and c.CUST_ID = @custid       
 INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID  and isnull(P.PROJ_STATUS,'') != 'Close'       
 left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1              
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1      
 left join csp..AUDITEE_ACCEPTANCE  accept on find.ID = accept.finding_id and accept.isactive = 1          
   where find.issubmitted = 1 and find.ISACTIVE = 1      
  )          
          
 select *,  
 case When cte1.AGE_OF_FINDING between 0 and 7 then '< 7 days'  
 when cte1.AGE_OF_FINDING between 7 and 14 then '> 7 days'  
 when cte1.AGE_OF_FINDING between 14 and 21 then '> 14 days'  
 when cte1.AGE_OF_FINDING between 21 and 30 then '> 21 days'  
 when cte1.AGE_OF_FINDING > 30 then '> 30 days' End AGE_OF_FINDING_IN_DAYS  
 from cte1          
 inner join AUDIT_FINDING_STAGES stage on cte1.STAGE_ID = stage.ID          
 order by cte1.ID          
 END    
    
 ELSE    
 BEGIN    
    
  with cte1 as            
  (SELECT find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.CREATED_DATE, find.UPDATED_DATE,exe.ASSESSMENT_ID,            
         
  CASE           
            
  WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)          
  then (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id          
  and ISCOMPLETE = 1 and ISACTIVE = 1          
  order by STAGE_ID desc)           
          
  else (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id AND ISACTIVE = 1          
  order by STAGE_ID asc)          
            
  END as 'STAGE_ID',      
          
  CASE WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)          
  then (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id          
  and ISCOMPLETE = 1 and ISACTIVE = 1          
   order by STAGE_ID desc)           
          
   else (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id and ISACTIVE = 1 order by STAGE_ID)          
   END as 'STAGE_STATUS',      
         
    exe.CUSTOMER_ID, exe.PROJECT_ID, c.CUST_NM, p.PROJ_NM, pp.PORTFOLIO_ID, port.TITLE as PORTFOLIO_NAME ,   
 DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) as [AGE_OF_FINDING]  
   from AUDIT_CHECKLIST_PROJECT_FINDINGS find          
   inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID       
   inner join AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID       
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID      
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID            
 inner join BAS..CUSTOMER C ON C.CUST_ID = exe.CUSTOMER_ID and c.CUST_ID = @custid       
 INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID and isnull(P.PROJ_STATUS,'') != 'Close'        
 left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1              
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1      
 left join csp..AUDITEE_ACCEPTANCE  accept on find.ID = accept.finding_id and accept.isactive = 1            
   where find.issubmitted = 1 and find.ISACTIVE = 1         
   and  Convert(varchar,find.CREATED_DATE,23) >= Convert(varchar,@startdate,23) and  Convert(varchar,find.CREATED_DATE,23) <= Convert(varchar,@enddate,23)        
  )          
          
 select *, 
 case When cte1.AGE_OF_FINDING between 0 and 7 then '< 7 days'  
 when cte1.AGE_OF_FINDING between 7 and 14 then '> 7 days'  
 when cte1.AGE_OF_FINDING between 14 and 21 then '> 14 days'  
 when cte1.AGE_OF_FINDING between 21 and 30 then '> 21 days'  
 when cte1.AGE_OF_FINDING > 30 then '> 30 days' End AGE_OF_FINDING_IN_DAYS  
 from cte1          
 inner join AUDIT_FINDING_STAGES stage on cte1.STAGE_ID = stage.ID          
 order by cte1.ID       
 END    
 END 
 GO

 IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='PROJECT_FINDINGS_BY_AGE' and [FIELD_NAME] = 'findinG_TYPE')
BEGIN
	insert into FILTER_PREFERENCE values ('PROJECT_FINDINGS_BY_AGE', 'findinG_TYPE', 'Finding Type', 'string', 1, 0, 0, null, 104474, getdate(), 104474, GETDATE(), 1)
END

GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='PROJECT_FINDINGS_BY_AGE' and [FIELD_NAME] = 'findinG_DESCRIPTION')
BEGIN
	insert into FILTER_PREFERENCE values ('PROJECT_FINDINGS_BY_AGE', 'findinG_DESCRIPTION', 'Finding Description', 'string', 1, 0, 0, null, 104474, getdate(), 104474, GETDATE(), 1)
END
GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='PROJECT_FINDINGS_BY_AGE' and [FIELD_NAME] = 'stagE_DESCRIPTION')
BEGIN
	insert into FILTER_PREFERENCE values ('PROJECT_FINDINGS_BY_AGE', 'stagE_DESCRIPTION', 'Stage Description', 'number', 1, 0, 0, null, 104474, getdate(), 104474, GETDATE(), 1)
END
GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='PROJECT_FINDINGS_BY_AGE' and [FIELD_NAME] = 'agE_OF_FINDING_IN_DAYS')
BEGIN
	insert into FILTER_PREFERENCE values ('PROJECT_FINDINGS_BY_AGE', 'agE_OF_FINDING_IN_DAYS', 'Age Of Findings', 'number', 1, 0, 0, null, 104474, getdate(), 104474, GETDATE(), 1)
END
GO




IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTaskDetailsByDateRange' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getTaskDetailsByDateRange
END
GO
/*  
---------------------------------------------------  
--  [dbo].[getTaskDetailsByDateRange] 
-- Author        : UNknown     
-- Date      :  NA   
-- Purpose       : get Task Details By DateRange
---------------------------------------------------   
-- ver     user             date             change     
-- 1.1    Indhu          20-12-2022       Added DAY_ID,QUARTER_ID for Monthly & Quarterly view
#########################################################################  */  
CREATE PROCEDURE [dbo].[getTaskDetailsByDateRange]      
@START_DATE DATETIME,      
@END_DATE DATETIME  ,    
@EMP_ID varchar(20)    
AS      
BEGIN          
     
 SELECT distinct  T.ID, DATEPART(M, coalesce(T.SCHEDULED_START_DATE, t.due_date)) MONTH_ID,
 DATEPART(Q, coalesce(T.SCHEDULED_START_DATE, t.due_date)) QUARTER_ID,
 DATEPART(WK, coalesce(T.SCHEDULED_START_DATE, t.due_date)) WEEK_ID,
 DATEPART(D, coalesce(T.SCHEDULED_START_DATE, t.due_date)) DAY_ID, 
 DATENAME(dw,coalesce(T.SCHEDULED_START_DATE, t.due_date)) DATE_NAME,
 cast(DATEADD( DAY , 2 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10)) [Week_Start_Date],
  cast(DATEADD( DAY , 8 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10))  [Week_End_Date],
 T.CUST_ID, C.CUST_NM, T.PROJ_ID, P.PROJ_NM, TT.ID TASK_TYPE_ID, TT.TITLE TASK_TYPE,TC.ID TASK_CATEGORY_ID, TC.TITLE TASK_CATEGORY, T.DESCRIPTION, T.STATUS,   
 T.SCHEDULED_START_DATE, T.SCHEDULED_DURATION, T.DUE_DATE, TC.COLOR_BG, TC.COLOR_MG, T.OWNER, T.Assigned_to, A.AUDITOR_EMP_ID     
 FROM [CSP].[dbo].[TASK] T   (NOLOCK) 
  INNER JOIN TASK_TYPE TT  (NOLOCK)  ON TT.ID =  T.TASK_TYPE_ID and T.ISACTIVE = 1    
  INNER JOIN TASK_CATEGORY TC  (NOLOCK)  ON TC.ID = T.TASK_CATEGORY_ID      
  LEFT JOIN AUDIT_SCHEDULE A   (NOLOCK) ON T.ID = A.TASK_ID    
  LEFT JOIN AUDIT_SCHEDULE_REF AE   (NOLOCK) on AE.AUDIT_SCHEDULE_ID = A.id and [key] = 'AUDITEE_EMP_ID'    
  LEFT JOIN BAS.DBO.CUSTOMER C   (NOLOCK) ON C.CUST_ID = T.CUST_ID      
  LEFT JOIN BAS.DBO.PROJECT P  (NOLOCK)  ON P.PROJ_ID = T.PROJ_ID      
      
 WHERE Due_Date is not null and ((  coalesce(T.SCHEDULED_START_DATE, t.due_date) >= @START_DATE and  coalesce(T.SCHEDULED_START_DATE, t.due_date) <= @END_DATE  ))    
 and (@EMP_ID ='-99' OR t.OWNER= @EMP_ID OR T.ASSIGNED_TO= @EMP_ID OR A.AUDITOR_EMP_ID = @EMP_ID OR AE.VALUE= @EMP_ID)    
     
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='FINDINGSTYPE_VALUES' AND COLUMN_NAME='MANDATORYTYPE_FOR_FAILED_STATUS' )
BEGIN
ALTER TABLE CSP..FINDINGSTYPE_VALUES ADD  MANDATORYTYPE_FOR_FAILED_STATUS BIT
END
GO


UPDATE CSP..FINDINGSTYPE_VALUES SET MANDATORYTYPE_FOR_FAILED_STATUS = (CASE WHEN FINDINGTYPE_VALUE 
IN ('Weakness','Threat','Major','Minor') then 1 else 0 end
) 
GO

IF EXISTS(Select 1 from sys.procedures where name ='getAllFindingsForCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsForCustomer]
END
GO

CREATE PROCEDURE [dbo].[getAllFindingsForCustomer]              
  @custid VARCHAR(50),              
  @startdate varchar(10),              
  @enddate varchar(10)              
  as                
  begin          
        
  if(@startdate = '' AND @enddate = '')      
  BEGIN      
  with cte1 as              
  (SELECT find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.CREATED_DATE, find.UPDATED_DATE, exe.ASSESSMENT_ID,           
           
  CASE             
              
  WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)            
  then (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id            
  and ISCOMPLETE = 1 and ISACTIVE = 1            
  order by STAGE_ID desc)             
            
  else (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id AND ISACTIVE = 1            
  order by STAGE_ID asc)            
              
  END as 'STAGE_ID',            
            
  CASE WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)            
  then (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id            
  and ISCOMPLETE = 1 and ISACTIVE = 1            
   order by STAGE_ID desc)             
            
   else (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id and ISACTIVE = 1 order by STAGE_ID)            
   END as 'STAGE_STATUS',   
   
    CASE WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)            
  then (select top 1 STATUS_DATE from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id            
  and ISCOMPLETE = 1 and ISACTIVE = 1            
   order by STAGE_ID desc)             
            
   else (select top 1 STATUS_DATE from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id and ISACTIVE = 1 order by STAGE_ID)            
   END as 'STATUS_DATE',
           
    exe.CUSTOMER_ID, exe.PROJECT_ID, c.CUST_NM, p.PROJ_NM, pp.PORTFOLIO_ID, port.TITLE as PORTFOLIO_NAME ,    
 DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) as [AGE_OF_FINDING]    
   from AUDIT_CHECKLIST_PROJECT_FINDINGS find            
   inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID         
   inner join AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID         
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID        
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID              
 inner join BAS..CUSTOMER C ON C.CUST_ID = exe.CUSTOMER_ID and c.CUST_ID = @custid         
 INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID  and isnull(P.PROJ_STATUS,'') != 'Close'         
 left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1                
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1        
 left join csp..AUDITEE_ACCEPTANCE  accept on find.ID = accept.finding_id and accept.isactive = 1            
   where find.issubmitted = 1 and find.ISACTIVE = 1        
  )            
            
 select *,    
 case When cte1.AGE_OF_FINDING between 0 and 7 then '< 7 days'    
 when cte1.AGE_OF_FINDING between 7 and 14 then '> 7 days'    
 when cte1.AGE_OF_FINDING between 14 and 21 then '> 14 days'    
 when cte1.AGE_OF_FINDING between 21 and 30 then '> 21 days'    
 when cte1.AGE_OF_FINDING > 30 then '> 30 days' End AGE_OF_FINDING_IN_DAYS    
 from cte1            
 inner join AUDIT_FINDING_STAGES stage on cte1.STAGE_ID = stage.ID            
 order by cte1.ID            
 END      
      
 ELSE      
 BEGIN      
      
  with cte1 as              
  (SELECT find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.CREATED_DATE, find.UPDATED_DATE,exe.ASSESSMENT_ID,              
           
  CASE             
              
  WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)            
  then (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id            
  and ISCOMPLETE = 1 and ISACTIVE = 1            
  order by STAGE_ID desc)             
            
  else (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id AND ISACTIVE = 1            
  order by STAGE_ID asc)            
              
  END as 'STAGE_ID',        
            
  CASE WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)            
  then (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id            
  and ISCOMPLETE = 1 and ISACTIVE = 1            
   order by STAGE_ID desc)             
            
   else (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id and ISACTIVE = 1 order by STAGE_ID)            
   END as 'STAGE_STATUS',  
   
   CASE WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)            
  then (select top 1  STATUS_DATE from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id            
  and ISCOMPLETE = 1 and ISACTIVE = 1            
   order by STAGE_ID desc)             
            
   else (select top 1 STATUS_DATE from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id and ISACTIVE = 1 order by STAGE_ID)            
   END as 'STATUS_DATE',     
           
    exe.CUSTOMER_ID, exe.PROJECT_ID, c.CUST_NM, p.PROJ_NM, pp.PORTFOLIO_ID, port.TITLE as PORTFOLIO_NAME ,     
 DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) as [AGE_OF_FINDING]    
   from AUDIT_CHECKLIST_PROJECT_FINDINGS find            
   inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID         
   inner join AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID         
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID        
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID              
 inner join BAS..CUSTOMER C ON C.CUST_ID = exe.CUSTOMER_ID and c.CUST_ID = @custid         
 INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID and isnull(P.PROJ_STATUS,'') != 'Close'          
 left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1                
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1        
 left join csp..AUDITEE_ACCEPTANCE  accept on find.ID = accept.finding_id and accept.isactive = 1              
   where find.issubmitted = 1 and find.ISACTIVE = 1           
   and  Convert(varchar,find.CREATED_DATE,23) >= Convert(varchar,@startdate,23) and  Convert(varchar,find.CREATED_DATE,23) <= Convert(varchar,@enddate,23)          
  )            
            
 select *,   
 case When cte1.AGE_OF_FINDING between 0 and 7 then '< 7 days'    
 when cte1.AGE_OF_FINDING between 7 and 14 then '> 7 days'    
 when cte1.AGE_OF_FINDING between 14 and 21 then '> 14 days'    
 when cte1.AGE_OF_FINDING between 21 and 30 then '> 21 days'    
 when cte1.AGE_OF_FINDING > 30 then '> 30 days' End AGE_OF_FINDING_IN_DAYS    
 from cte1            
 inner join AUDIT_FINDING_STAGES stage on cte1.STAGE_ID = stage.ID            
 order by cte1.ID         
 END      
 END   
 GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseCAPACount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseCAPACount
END
GO

  
CREATE PROC getProductWiseCAPACount              
@customerId  varchar(50) = '212100001',                         
@startDate datetime,                                                                        
@endDate datetime,                        
@productId int = 0  ,          
@iscustomer bit = 0    
    
AS    
BEGIN                        
  
declare @unclassifiedId int = (select ID from CSP..PORTFOLIO where TITLE='Unclassified')  
                     
declare @quarterStartDate Datetime                                            
declare @quarterEndDate datetime                                            
                                        
set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,0));                                            
set @quarterEndDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,1));                                
                        
                       
;with CTE AS          
 (                        
          
select PP.ID as ProductID,PP.PRODUCT_TITLE,KD.ID as KPI_DETAILS_ID,            
[SUBMITTED] = Count(CAPA.ID),            
[REVIEW] =  (select COUNT(R.ID) from CSP..AUDIT_FINDING_CAPA_REVIEW R  where R.KPI_DETAILS_ID = KD.ID and R.ISACTIVE = 1),            
[IMPLEMENTATION] = (select COUNT(IMP.ID) from CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1),           
[VERIFICATION] = (select COUNT(VER.ID)  from CSP..AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1),         
[CUSTOMER_APPROVAL] = (select COUNT(CUST_APPROVAL.ID) from CSP..CUSTOMER_CAPA_APPROVAL CUST_APPROVAL where  CUST_APPROVAL.CAPA_ID = MAX(CAPA.ID) and CUST_APPROVAL.ISACTIVE = 1),      
(select max(stage_ID) from CSP..AUDIT_FINDING_STAGES_MAPPING where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE          
          
from             
CSP..PORTFOLIO_PRODUCTS PP                 
left join CSP..KPI_DETAILS KD  on  KD.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1  and ( @iscustomer =0 or ISNULL(PP.IS_SERVICE_COMMENCED ,0) = 1   )                     
join CSP..KPI K on KD.KPI_ID = K.ID and  K.ISACTIVE = 1              
join CSP..AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1         
          
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0              
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and  PP.PORTFOLIO_ID!=@unclassifiedId  and                  
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between @startDate  and @endDate)                                        
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )            
          
 group by PP.ID ,PP.PRODUCT_TITLE,KD.ID            
 )          
 select ProductID,PRODUCT_TITLE,Count(KPI_DETAILS_ID) as NOT_MET,          
 [SUBMITTED] = SUM(case when CAPA_STAGE = 1 then SUBMITTED else 0 End),          
 [REVIEW] = SUM(case when CAPA_STAGE = 2 then Review else 0 End),          
 [IMPLEMENTATION] = SUM(case when CAPA_STAGE = 3 then IMPLEMENTATION else 0 End),          
 [VERIFICATION] = SUM(case when CAPA_STAGE = 4 then VERIFICATION else 0 End),      
 [CUSTOMER_APPROVAL] = SUM(case when CAPA_STAGE = 5 then CUSTOMER_APPROVAL else 0 End)      
 from CTE          
 group by ProductID,PRODUCT_TITLE          
 order by PRODUCT_TITLE         
END     
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getMonthlyFindingsByTime' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getMonthlyFindingsByTime
END
GO

CREATE procedure [dbo].[getMonthlyFindingsByTime]       
    @custId varchar(MAX),    
    @projIds varchar(MAX) = '-1'     
   AS            
   BEGIN       
   with cte1 as              
  (SELECT find.id,find.FINDING_TYPE,find.FINDING_DESCRIPTION,accept.created_date as accepted,find.CREATED_DATE,    
    DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) as [AGE_OF_FINDING] ,    
  case when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 0 and 7 then '< 7 days'      
  when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 7 and 14 then '> 7 days'     
  when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 14 and 21 then '> 14 days'      
  when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 21 and 30 then '> 21 days'      
  when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) > 30 then '> 30 days' else '' end as AgeByDays    
   from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS find            
   inner join csp..AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID         
   inner join csp..AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID         
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID        
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID     
   Inner join CSP..AUDIT_FINDING_STAGES_MAPPING map on find.ID = map.FINDING_ID and map.ISACTIVE =1 and map.STAGE_ID = 4 and map.ISCOMPLETE = 0    
   left join csp..AUDITEE_ACCEPTANCE  accept on find.ID = accept.finding_id and accept.isactive = 1    
   where find.issubmitted = 1 and find.ISACTIVE = 1  and exe.CUSTOMER_ID = @custId     
   AND (@projIds = '-1' OR exe.PROJECT_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,',')))
  )     
      
     
 SELECT  cte1.AgeByDays,FINDING_TYPE    
     
 FROM cte1    
    GROUP BY FINDING_TYPE,cte1.AgeByDays     
END 
GO

IF not exists(Select 1 from sys.tables where name ='APPRECIATION' AND type='U')
BEGIN
CREATE TABLE APPRECIATION
(
ID INT IDENTITY, 
CUST_ID VARCHAR(50) NOT NULL,
PROJ_ID VARCHAR(255) NOT NULL,
APPRECIATED_BY  VARCHAR(100) NOT NULL,
COMMENTS VARCHAR(2000) NOT NULL,
RECIPIENT VARCHAR(50) NOT NULL,
DESIGNATION VARCHAR(225) NULL,
RECEIVED_DATE DATETIME NOT NULL,
CREATED_BY VARCHAR(50) NOT NULL,
CREATED_DATE DATETIME DEFAULT GETDATE() NOT NULL,
UPDATED_BY VARCHAR(50) NOT NULL,
UPDATED_DATE DATETIME DEFAULT GETDATE() NOT NULL,
ISACTIVE BIT DEFAULT(1) NOT NULL
)
END
GO

Declare  @RESOURCEID int = 86

Declare @RescourceName varchar(250) = 'Settings > Appreciation'
if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName) 
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'Control',@RescourceName,null,104474,104474)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_ACCESS_CONTROLS 
	(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	 EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	 values (@RESOURCEID,1,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104474,104474,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,13,'','','',null,104474,104474,0,0,0,0,0)
end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values 
	(@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)

end
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAppreciationDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getAppreciationDetails
END
GO
CREATE PROCEDURE [dbo].[getAppreciationDetails] 
@projIds VARCHAR(MAX)              
  AS              
  BEGIN              
            
    SELECT DISTINCT A.ID,P.CUST_ID AS CUST_ID, 
    P.PROJ_ID, P.PROJ_NM, PP.PORTFOLIO_ID, PF.TITLE AS PORTFOLIO_NAME, 
    A.APPRECIATED_BY,A.APPRECIATED_COMMENTS,A.RECIPIENT,A.APPRECIATED_DESIGNATION,
    A.APPRECIATION_RECEIVED_DATE,A.CREATED_BY,A.CREATED_DATE,A.UPDATED_BY,A.UPDATED_DATE,A.ISACTIVE
    FROM [CSP].[DBO].[APPRECIATION] A 
    INNER JOIN BAS.DBO.PROJECT P  ON a.PROJ_ID = p.PROJ_ID 
	AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,','))  AND A.ISACTIVE = 1         
    LEFT OUTER JOIN BAS.DBO.PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJ_ID              
    LEFT OUTER JOIN BAS.DBO.PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID 
    ORDER BY A.APPRECIATION_RECEIVED_DATE desc        
 END
 GO