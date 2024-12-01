IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEmployeeListfromCustomer' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getEmployeeListfromCustomer
END
GO

Create procedure getEmployeeListfromCustomer  

@customerId varchar(50)

As
begin

Select distinct E.EMP_ID as EMP_ID, e.frst_nm as Name, e.email_id as Mail
from
PROJ_RESOURCE PR inner join EMP_INFO E on PR.EMP_ID = E.EMP_ID
inner join PROJECT P on P.PROJ_ID = PR.PROJ_ID
where P.CUST_ID = @customerId and PR.CURR_INDC='Y' and PR.BILL_FLG=1 and E.DOR IS NULL and E.CSM_TITLE_ID in (1,2) and
pr.end_date > getdate() and isnull(p.proj_status,'') !='close'
order by E.FRST_NM
end
Go
