IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductResponsibleList' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductResponsibleList
END
GO

Create procedure getProductResponsibleList  
@productId int

As 
Begin  
  
select pr.ID, p.TITLE as Portfolio_Name , pp.PRODUCT_TITLE  ,  
IIF(PR.PROJECT_ID IS NOT NULL, PJ.PROJ_ALIAS_NM, 
        IIF(ei.FRST_NM IS NULL, cu.DISPLAY_NAME, ei.FRST_NM)) AS Name,
pm.ID as MANAGEMENT_TYPE_ID,pm.MANAGEMENT_TYPE ,  
IIF(ei.EMAIL_ID is null , cu.EMAILID ,ei.EMAIL_ID ) AS MAIL, PR.CREATED_DATE as EFFECTIVE_FROM, PR.CREATED_BY, PR.CREATED_DATE
from PORTFOLIO p inner join PORTFOLIO_PRODUCTS pp on pp.PORTFOLIO_ID=p.ID   
inner join PRODUCT_RESPONSIBLE pr on pr.PRODUCT_ID=pp.ID   
inner join PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE pm on pm.ID=pr.MANAGEMENT_TYPE 
left join EMP_INFO ei on ei.EMP_ID=pr.EMP_ID   
left join customer_users cu on cu.EMAILID=pr.EMP_ID  
left join PROJECT PJ on PJ.PROJ_ID = PR.PROJECT_ID   

where pr.PRODUCT_ID = @productId  and p.ISACTIVE=1 and pp.ISACTIVE=1 and pr.ISACTIVE=1 and pm.ISACTIVE=1  
order by CASE pm.ID
            WHEN 3 THEN 0 -- CSM
            WHEN 2 THEN 1 -- LEAD
            WHEN 1 THEN 2 -- MANAGER
            WHEN 4 THEN 3 -- QUALITYSPOC
            WHEN 5 THEN 4 -- CUSTOMER
            WHEN 6 THEN 5 -- CUSTOMER_CSAT
			WHEN 7 THEN 6 -- PROJECT
            ELSE 7        -- Others
        END
End
GO
