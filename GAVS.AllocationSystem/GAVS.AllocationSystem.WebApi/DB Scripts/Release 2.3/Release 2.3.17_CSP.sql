USE CSP
GO
IF not exists(SELECT 1 FROM PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE where MANAGEMENT_TYPE='CUSTOMER')
BEGIN
INSERT INTO PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE(MANAGEMENT_TYPE,	CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('CUSTOMER','105683',getdate(),'105683',getdate(),1)
END


-- for Customers
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=1 AND MANAGEMENT_TYPE=5 AND EMP_ID='steven_mccrickard@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(1,'steven_mccrickard@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=1 AND MANAGEMENT_TYPE=5 AND EMP_ID='tom_palmer@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(1,'tom_palmer@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=2 AND MANAGEMENT_TYPE=5 AND EMP_ID='chris_borgelt@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(2,'chris_borgelt@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=2 AND MANAGEMENT_TYPE=5 AND EMP_ID='jonathan_haese@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(2,'jonathan_haese@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=3 AND MANAGEMENT_TYPE=5 AND EMP_ID='scott_gehrman@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(3,'scott_gehrman@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=3 AND MANAGEMENT_TYPE=5 AND EMP_ID='ted_brannon@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(3,'ted_brannon@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=8 AND MANAGEMENT_TYPE=5 AND EMP_ID='matthew_lilley@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(8,'matthew_lilley@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=8 AND MANAGEMENT_TYPE=5 AND EMP_ID='steven_mccrickard@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(8,'steven_mccrickard@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=10 AND MANAGEMENT_TYPE=5 AND EMP_ID='satish_thakur@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(10,'satish_thakur@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=11 AND MANAGEMENT_TYPE=5 AND EMP_ID='Jessica_Shurley@PremierInc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(11,'Jessica_Shurley@PremierInc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=12 AND MANAGEMENT_TYPE=5 AND EMP_ID='Selena_Montague@PremierInc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(12,'Selena_Montague@PremierInc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=12 AND MANAGEMENT_TYPE=5 AND EMP_ID='Ted_Brannon@PremierInc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(12,'Ted_Brannon@PremierInc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=14 AND MANAGEMENT_TYPE=5 AND EMP_ID='stephanie_legrand@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(14,'stephanie_legrand@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=15 AND MANAGEMENT_TYPE=5 AND EMP_ID='steven_mccrickard@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(15,'steven_mccrickard@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=21 AND MANAGEMENT_TYPE=5 AND EMP_ID='kavita_pachalla@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(21,'kavita_pachalla@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=24 AND MANAGEMENT_TYPE=5 AND EMP_ID='sandeep_giri@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(24,'sandeep_giri@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=25 AND MANAGEMENT_TYPE=5 AND EMP_ID='jeffrey_wong@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(25,'jeffrey_wong@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=27 AND MANAGEMENT_TYPE=5 AND EMP_ID='kavita_pachalla@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(27,'kavita_pachalla@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=28 AND MANAGEMENT_TYPE=5 AND EMP_ID='kavita_pachalla@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(28,'kavita_pachalla@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=29 AND MANAGEMENT_TYPE=5 AND EMP_ID='jeffrey_wong@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(29,'jeffrey_wong@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=31 AND MANAGEMENT_TYPE=5 AND EMP_ID='sandeep_giri@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(31,'sandeep_giri@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=33 AND MANAGEMENT_TYPE=5 AND EMP_ID='sandeep_giri@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(33,'sandeep_giri@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=36 AND MANAGEMENT_TYPE=5 AND EMP_ID='caroline_viehweg@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(36,'caroline_viehweg@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=38 AND MANAGEMENT_TYPE=5 AND EMP_ID='kavita_pachalla@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(38,'kavita_pachalla@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=42 AND MANAGEMENT_TYPE=5 AND EMP_ID='satish_thakur@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(42,'satish_thakur@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=43 AND MANAGEMENT_TYPE=5 AND EMP_ID='aasia_siddiq@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(43,'aasia_siddiq@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=47 AND MANAGEMENT_TYPE=5 AND EMP_ID='John_House@PremierInc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(47,'John_House@PremierInc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=47 AND MANAGEMENT_TYPE=5 AND EMP_ID='Josh_Penderville@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(47,'Josh_Penderville@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=47 AND MANAGEMENT_TYPE=5 AND EMP_ID='srikanth_ramayanam@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(47,'srikanth_ramayanam@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=49 AND MANAGEMENT_TYPE=5 AND EMP_ID='John_House@PremierInc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(49,'John_House@PremierInc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=49 AND MANAGEMENT_TYPE=5 AND EMP_ID='Josh_Penderville@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(49,'Josh_Penderville@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=49 AND MANAGEMENT_TYPE=5 AND EMP_ID='srikanth_ramayanam@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(49,'srikanth_ramayanam@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=50 AND MANAGEMENT_TYPE=5 AND EMP_ID='John_House@PremierInc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(50,'John_House@PremierInc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=50 AND MANAGEMENT_TYPE=5 AND EMP_ID='Josh_Penderville@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(50,'Josh_Penderville@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=50 AND MANAGEMENT_TYPE=5 AND EMP_ID='srikanth_ramayanam@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(50,'srikanth_ramayanam@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=52 AND MANAGEMENT_TYPE=5 AND EMP_ID='John_House@PremierInc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(52,'John_House@PremierInc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=52 AND MANAGEMENT_TYPE=5 AND EMP_ID='Josh_Penderville@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(52,'Josh_Penderville@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=52 AND MANAGEMENT_TYPE=5 AND EMP_ID='srikanth_ramayanam@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(52,'srikanth_ramayanam@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=53 AND MANAGEMENT_TYPE=5 AND EMP_ID='John_House@PremierInc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(53,'John_House@PremierInc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=53 AND MANAGEMENT_TYPE=5 AND EMP_ID='Josh_Penderville@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(53,'Josh_Penderville@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=53 AND MANAGEMENT_TYPE=5 AND EMP_ID='srikanth_ramayanam@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(53,'srikanth_ramayanam@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=60 AND MANAGEMENT_TYPE=5 AND EMP_ID='jeffrey_wong@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(60,'jeffrey_wong@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=66 AND MANAGEMENT_TYPE=5 AND EMP_ID='ron_dahlgren@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(66,'ron_dahlgren@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=68 AND MANAGEMENT_TYPE=5 AND EMP_ID='theresa_smith@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(68,'theresa_smith@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=69 AND MANAGEMENT_TYPE=5 AND EMP_ID='kavita_pachalla@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(69,'kavita_pachalla@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=69 AND MANAGEMENT_TYPE=5 AND EMP_ID='stephanie_harris@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(69,'stephanie_harris@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=70 AND MANAGEMENT_TYPE=5 AND EMP_ID='aasia_siddiq@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(70,'aasia_siddiq@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=71 AND MANAGEMENT_TYPE=5 AND EMP_ID='satish_thakur@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(71,'satish_thakur@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=72 AND MANAGEMENT_TYPE=5 AND EMP_ID='jeffrey_wong@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(72,'jeffrey_wong@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END



GO 


IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='SUBPROJECT_TASK' AND COLUMN_NAME='RESPONSIBILITY' )
BEGIN
ALTER TABLE SUBPROJECT_TASK add RESPONSIBILITY VARCHAR(100) NULL 
END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=72 AND MANAGEMENT_TYPE=5 AND EMP_ID='jeffrey_wong@premierinc.com' )   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(72,'jeffrey_wong@premierinc.com',5,'105683',getdate(),'105683',getdate(),1)  END

-- for Portfolio leads 
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=1 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(1,'104198',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=70 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(70,'104198',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=70 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(70,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=21 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(21,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=2 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(2,'104198',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=27 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(27,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=66 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(66,'104198',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=38 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(38,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=68 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(68,'104198',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=71 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(71,'104198',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=28 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(28,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=24 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(24,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=8 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(8,'104198',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=10 AND  emp_id='105895' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(10,'105895',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=10 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(10,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=3 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(3,'104198',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=49 AND  emp_id='102462' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(49,'102462',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=50 AND  emp_id='102462' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(50,'102462',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=42 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(42,'104198',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=43 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(43,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=31 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(31,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=33 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(33,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=36 AND  emp_id='100630' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(36,'100630',2,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=15 AND  emp_id='104198' AND MANAGEMENT_TYPE=2)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(15,'104198',2,'105683',getdate(),'105683',getdate(),1)  END

-- for CSM 
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=8 AND MANAGEMENT_TYPE=3 AND EMP_ID='100985'  AND ISACTIVE=1)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(8,'100985',3,'105683',getdate(),'105683',getdate(),1)  END
IF not exists(SELECT 1 FROM Product_responsible where PRODUCT_ID=26 AND MANAGEMENT_TYPE=3 AND EMP_ID='100985'  AND ISACTIVE=1)   begin   INSERT INTO CSP..Product_responsible(PRODUCT_ID,EMP_ID,MANAGEMENT_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)  VALUES(26,'100985',3,'105683',getdate(),'105683',getdate(),1)  END

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='KPI_DETAILS' AND COLUMN_NAME='ISEXNODATA' )
  BEGIN

  ALTER TABLE KPI_DETAILS ADD  [ISEXNODATA] BIT NOT NULL DEFAULT 0 WITH VALUES 

  END 

GO
IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='KPI_DETAILS' AND COLUMN_NAME='EX_HIGHLIGHTS' )
  BEGIN

  ALTER TABLE KPI_DETAILS ADD  EX_HIGHLIGHTS VARCHAR(MAX) NULL

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
    A.APPRECIATED_BY,A.COMMENTS,A.RECIPIENT,A.DESIGNATION,  
    A.RECEIVED_DATE,A.CREATED_BY,A.CREATED_DATE,A.UPDATED_BY,A.UPDATED_DATE,A.ISACTIVE  
    FROM [CSP].[DBO].[APPRECIATION] A   
    INNER JOIN BAS.DBO.PROJECT P  ON a.PROJ_ID = p.PROJ_ID   
 AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,','))  AND A.ISACTIVE = 1           
    LEFT OUTER JOIN csp..PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJ_ID                
    LEFT OUTER JOIN csp..PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID   
    ORDER BY A.RECEIVED_DATE desc, proj_nm           
 END

Declare @RESOURCEID int = 85
Declare @EMPID int = 104859
Declare @RescourceName varchar(250) = 'CAP Approve/Reject'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID) 
set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into csp..APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,1,0,0),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0)
end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY)
values  
(@RESOURCEID,'EDIT',null,@EMPID,@EMPID) 
end
GO
 