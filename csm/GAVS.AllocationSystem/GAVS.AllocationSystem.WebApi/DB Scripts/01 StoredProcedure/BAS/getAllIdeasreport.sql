
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllIdeasreport' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllIdeasreport]
END
GO

CREATE PROCEDURE [dbo].[getAllIdeasreport]              
     
@Startdate datetime,              
@Enddate datetime,              
@Customerid varchar(50)   
      
AS 

BEGIN              
                 
SELECT c.CUST_NM [CUSTOMER NAME], p.PROJ_NM [PROJECT NAME], port.title [PORTFOLIO NAME], I.DESCRIPTION,           
     
CASE WHEN IBS.BENEFICIARY_ID = 1 then 'For GAVS'    
WHEN IBS.BENEFICIARY_ID = 2 then 'For Customer' END AS BENEFICIARY,    
    
CASE WHEN IBS.BENEFIT_TYPE_ID =1 then 'Quantitative'    
WHEN IBS.BENEFIT_TYPE_ID=2 then 'Qualitative' END AS BENEFIT_TYPE,    
        
CASE WHEN IBS.TYPE_ID = 1 then 'Value'    
WHEN IBS.TYPE_ID =2 then 'Value_Add' END AS TYPE,    

CASE WHEN IBS.BENEFIT_PILLAR_ID = 1 then 'People'         
WHEN IBS.BENEFIT_PILLAR_ID = 2 then 'Process'        
WHEN IBS.BENEFIT_PILLAR_ID = 3 then 'Technology'        
    WHEN IBS.BENEFIT_PILLAR_ID = 4 then 'Facilities'        
    WHEN IBS.BENEFIT_PILLAR_ID = 5 then 'Assets' END AS BENEFIT_PILLAR_CATEGORY,    
BDL.BENEFIT_TITLE AS BENEFIT_TITLE,    
BDQ.NET_BENEFITS_YEAR AS NET_BENEFITS,    
    
(U.TITLE +' '+U.DATATYPE) AS UNIT_OF_MEASUREMENT,    
IDS.TITLE AS STATUS,    
CONVERT(VARCHAR(10), I.IDENTIFIED_DATE, 110) as IDENTIFIED_DATE, 
(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [IDEA_TYPE],                        
STUFF((SELECT ', ' + E.FRST_NM from EMP_INFO E inner join IDEA_IDENTIFIER IID on IID.IDENTIFIED_BY = E.EMP_ID
where IID.IDEA_ID = I.ID and IID.ISACTIVE=1 FOR XML PATH('')), 1, 1, '')[Identified_By],
(select top 1 frst_nm from EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [RESPONSIBLE],    
     
CONVERT(VARCHAR(10), IIP.ESTIMATED_TARGET_DATE, 110) AS TARGET_DATE ,               
CONVERT(VARCHAR(10), IIP.ACTUAL_START_DATE, 110) AS ACTUAL_START_DATE,    
CONVERT(VARCHAR(10), IIP.ACTUAL_END_DATE, 110) AS ACTUAL_END_DATE,     
PSA.TITLE AS SERVICE_AREA    
,I.COMMENTS ,(select top 1 frst_nm from EMP_INFO where EMP_ID = I.created_by) [CREATED_BY]          
,CONVERT(VARCHAR(10),I.created_date,110) AS CREATED_DATE,p.cust_id AS [CUSTOMER ID], [PROJECT_ID], pp.PORTFOLIO_ID [PORTFOLIO ID]

FROM [IDEA] I    
inner join IDEA_BENEFIT_SUMMARY IBS ON I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1   
left join BENEFIT_DETAILS_QUANTITATIVE BDQ ON IBS.ID = BDQ.BENEFIT_SUMMARY_ID and BDQ.ISACTIVE =1   
left join BENEFIT_DETAILS_QUALITATIVE BDL ON IBS.ID = BDL.BENEFIT_SUMMARY_ID  and BDL.ISACTIVE =1  
left join IDEA_IMPLEMENTATION_PLAN IIP ON I.ID = IIP.IDEA_ID    
inner join IDEA_STATUS IDS ON I.IDEA_STATUS_ID = IDS.ID        
LEFT join UOM U  ON BDQ.UOM_ID = U.ID    
LEFT join PROCESS_SERVICE_AREA_NEW PSA ON I.SERVICE_AREA_ID = PSA.ID    
inner join PROJECT p on p.proj_id =  I.PROJECT_ID           
inner join CUSTOMER c on c.CUST_ID = p.Cust_id               
LEFT OUTER JOIN PORTFOLIO_PROJECT pp on pp.proj_id =  I.PROJECT_ID             
LEFT OUTER JOIN PORTFOLIO port on pp.portfolio_id = port.id and port.isactive =1      
where I.ISACTIVE = 1 and I.IDENTIFIED_DATE >= @Startdate and I.IDENTIFIED_DATE <= @Enddate        
and I.IDEA_STATUS_ID in (2,3,4,8) and (@customerid='0' or C.CUST_ID = @Customerid)    
order by c.CUST_NM, p.PROJ_NM, IDENTIFIED_DATE desc              
     
END
GO
