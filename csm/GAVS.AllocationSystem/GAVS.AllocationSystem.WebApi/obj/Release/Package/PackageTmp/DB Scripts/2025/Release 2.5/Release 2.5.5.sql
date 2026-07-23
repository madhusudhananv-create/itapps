----------------Ignitirium Employee details Script----------------------

----employee SP-----
IF EXISTS(Select 1 from sys.objects where name ='usp_insert_employee' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_insert_employee]
END
GO

create PROCEDURE [dbo].[usp_insert_employee]      
    
@EMP_ID varchar(100),   
@EMPL_TYPE varchar(30),    
@FRST_NM varchar(100),      
@DOJ datetime,  
@LEVEL varchar(10),    
@TITLE varchar(100),    
@CSM_TITLE varchar(100),    
@EMAIL_ID varchar(100)
     
AS      
BEGIN      
 -- SET NOCOUNT ON added to prevent extra result sets from      
 -- interfering with SELECT statements.      
 SET NOCOUNT ON;        

 DECLARE @CSM_TITLE_ID int;
 SET @CSM_TITLE_ID = CASE 
        WHEN @CSM_TITLE = 'Customer Success Manager' THEN 1
        WHEN @CSM_TITLE = 'Project Manager' THEN 2
        WHEN @CSM_TITLE = 'Quality' THEN 7
        ELSE 3 -- Default value
    END;
    -- Insert statements for procedure here     
-- Only proceed if the EMP_ID does NOT exist in the table
    IF NOT EXISTS (SELECT 1 FROM [EMP_INFO] WHERE [EMP_ID] = @EMP_ID)
    BEGIN
	INSERT INTO EMP_INFO ( [EMP_ID]    
      ,[BASE_CNTRY_ID]    
      ,[EMPL_TYPE]    
      ,[FRST_NM]    
      ,[DOJ]   
	  ,[DOR]
      ,[LEVEL]    
      ,[TITLE]    
      ,[CSM_TITLE_ID]    
      ,[EMAIL_ID]    
      ,[POTENTIAL_TO_BILL]    
      ,[CREATED_BY]    
      ,[CREATED_DATE]    
      ,[UPDATED_BY]    
      ,[UPDATED_DATE]    
      ,[SUPERADMIN]
	  )
    values(    
		@EMP_ID,    
		1,
		@EMPL_TYPE,    
		@FRST_NM ,    
		@DOJ, 
		NULL,
		@LEVEL,    
		@TITLE,    
		@CSM_TITLE_ID,    
		@EMAIL_ID ,  
		0,
		'1001260',    
		GETDATE(),    
		'1001260',     
		GETDATE() ,   
		0		)     
	END
      
END
GO


----Customer SP------
IF EXISTS(Select 1 from sys.objects where name ='usp_insert_customer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_insert_customer]
END
GO
CREATE PROCEDURE [dbo].[usp_insert_customer]  
@CUST_ID varchar(50), @CUST_NM varchar(100), @BUSINESS_UNIT varchar(max)
AS  
BEGIN  
	-- SET NOCOUNT ON added to prevent extra result sets from  
	-- interfering with SELECT statements.  
	SET NOCOUNT ON;    
    -- Insert statements for procedure here  
	-- Only proceed if the EMP_ID does NOT exist in the table
    IF NOT EXISTS (SELECT 1 FROM [CUSTOMER] WHERE [CUST_ID] = @CUST_ID)
	BEGIN
		INSERT INTO CUSTOMER ( CUST_ID, CUST_NM, CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE, BUSINESS_UNIT) 
		VALUES ( @CUST_ID, @CUST_NM,'1001260', GETDATE(), '1001260', GETDATE(), @BUSINESS_UNIT ) 
	END
END
GO

-----Project SP------

IF EXISTS(Select 1 from sys.objects where name ='usp_insert_project' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_insert_project]
END
GO
CREATE PROCEDURE [dbo].[usp_insert_project]  
@PROJ_ID varchar(50), 
@PROJ_NM varchar(100),
@START_DATE datetime, 
@END_DATE datetime, 
@BILL_TYPE	bit,
@PROC_TYPE	varchar(50),
@PROJ_BUHEAD_EMP_ID varchar(50), 
@PROJ_DM_EMP_ID varchar(50), 
@PROJ_PM_EMP_ID varchar(50),
@PROJ_AM_EMP_ID varchar(50),
@CUST_ID varchar(50), 
@QUALITY_SPOC varchar(50), 
@PROJ_STATUS varchar(100), 
@BUSINESS_UNIT varchar(250), 
@PROJECT_TYPE varchar(250), 
@REVENUE_TYPE varchar(256), 
@PROJ_EP_ID varchar(200), 
@DP_ID varchar(200), 
@EXECUTION_TYPE varchar(1000), 
@ENGAGAMENT_TYPE varchar(1000),
@Parent_Proj_id varchar(50)

AS  
BEGIN  
	-- SET NOCOUNT ON added to prevent extra result sets from  
	-- interfering with SELECT statements.  
	SET NOCOUNT ON;    
    -- Insert statements for procedure here 
	    IF NOT EXISTS (SELECT 1 FROM [PROJECT] WHERE [PROJ_ID] = @PROJ_ID)
	BEGIN

		INSERT INTO Project (PROJ_ID,CUST_ADDR_ID, BILL_CRNCY_ID, PROJ_NM, START_DATE, END_DATE, BILL_TYPE, PROC_TYPE, PROJ_BUHEAD_EMP_ID, PROJ_DM_EMP_ID, PROJ_PM_EMP_ID, PROJ_AM_EMP_ID, CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE,
		CUST_ID, PARENT_PROJ_ID, QUALITY_SPOC, PROJ_STATUS, BUSINESS_UNIT, PROJECT_TYPE, REVENUE_TYPE, PROJ_EP_ID, DP_ID, EXECUTION_TYPE, ENGAGAMENT_TYPE)
		VALUES ( @PROJ_ID, 1,1
		, @PROJ_NM,
		@START_DATE, @END_DATE, @BILL_TYPE, @PROC_TYPE,
		@PROJ_BUHEAD_EMP_ID, @PROJ_DM_EMP_ID, @PROJ_PM_EMP_ID,@PROJ_AM_EMP_ID,
		'1001260', GETDATE(), '1001260', GETDATE(), @CUST_ID,@Parent_Proj_id, @QUALITY_SPOC,
		@PROJ_STATUS, @BUSINESS_UNIT, @PROJECT_TYPE,
		@REVENUE_TYPE, @PROJ_EP_ID, @DP_ID, @EXECUTION_TYPE, @ENGAGAMENT_TYPE) 
	END
END
GO

----Contact SP------
IF EXISTS(Select 1 from sys.objects where name ='usp_insertHalfyearlyRespondedProject' AND type='P')
BEGIN
	   DROP PROCEDURE [dbo].[usp_insertHalfyearlyRespondedProject]
END
GO
CREATE proc [dbo].[usp_insertHalfyearlyRespondedProject]              
@customerName varchar(255),              
@projectId  varchar(255),              
@respondentName varchar(255),              
@respondentEmail varchar(255),              
@respondentRole varchar(255)  ,            
 @spoc varchar(255),
 @predictedScore decimal
               
 as              
 BEGIN              
                
  declare @custId varchar(100) = ''              
  declare @contactId int              
                 
   select @custid = cust_id from customer where cust_nm =@customerName              
   if isnull( @custid  , '') = ''                
   BEGIN              
   --RAISEERROR('invalid customer name'  );              
   --rollback;             
   --print 'here'            
   return;              
  END              
  --insert contact              
  if not exists (select 1 from contacts where contact_emailid = @respondentEmail and ISACTIVE =1)              
  BEGIN              
    insert into contacts              
   select @custid, @respondentName, @respondentRole,'CUSTOMER', @respondentEmail,'-', '102802', getdate(), 1, null, null, getdate(), '102802',null            
              
   select @contactId = @@identity              
            
    print 'inserted contact'            
  END              
  ELSE              
  BEGIN              
   select @contactid = id from contacts where contact_emailid = @respondentEmail               
    --print 'update'            
  END              
              
  declare @customerUserId int =0            
    --insert customer user              
  if not exists (select 1 from customer_users where EMAILID = @respondentEmail and ISACTIVE =1)              
  BEGIN              
    insert into customer_users              
   select @respondentEmail, @respondentName, null, null, 0, null, null, '102802', getdate(),'102802', getdate(),  1, 0, null             
              
   select @customerUserId = @@identity              
   print 'inserted customer_user'            
  END              
  ELSE              
  BEGIN              
 select @customerUserId = id from customer_users where EMAILID = @respondentEmail  and ISACTIVE =1              
 print 'updated Customer_user'            
 print @customerUserId          
  END            
            
  --customer projects            
            
   if not exists (select 1 from CUSTOMER_PROJECTS where CUSTOMER_USER_ID = @customerUserId AND PROJ_ID = @projectId  and ISACTIVE =1 )              
  BEGIN              
  insert into CUSTOMER_PROJECTS              
    select @customerUserId, @custId, @customerName, @projectId, PROJ_NM, '102802', getdate(),'102802', getdate(),  1, 1, 'Half-Yearly',0,@spoc              
    FROM PROJECT WHERE PROJ_ID = @projectId            
 print 'Inserted Customer_Project'            
              
  END              
  ELSE              
  BEGIN              
  update customer_projects set CSAT_FREQUENCY ='Half-Yearly', SPOC = @spoc, CSAT_SURVEY =1 where CUSTOMER_USER_ID = @customerUserId AND PROJ_ID = @projectId        and ISACTIVE =1    
  update css_batch_customers set SPOC = @spoc, is_verified =1,PREDICTED_SCORE = @predictedScore where EMAIL_ID = @respondentEmail and PROJ_ID = @projectId and batch_id =35  and prod_id is null  and ISACTIVE =1 -- remove batchid check its temporary          
       
  print 'updated customer_project'            
  END            
                
                
 END
GO


-----Execution Scripts-------

-- Insert Employees
exec usp_insert_employee '11100264','Employee','Anaz K Kabeer','2020/05/18','','Associate Vice President','Quality','anaz.kabeer@neurealm.com'
exec usp_insert_employee '11100892','Employee','Aneela Thomas','2024/06/17','','Project Manager','Project Manager','aneela.thomas@neurealm.com'
exec usp_insert_employee '11100364','Employee','Anoop Gopalakrishnapillai','2021/05/24','','Head of Engineering','Project Manager','anoop.g@neurealm.com'
exec usp_insert_employee '11100469','Employee','Anuradha Noone','2021/11/29','','Senior Project Manager','Project Manager','anuradha.noone@neurealm.com'
exec usp_insert_employee '11100332','Employee','Aparna Puthumana','2021/02/15','','Project Manager','Customer Success Manager','aparna.puthumana@neurealm.com'
exec usp_insert_employee '11100502','Employee','Ashwin Ramachandran','2022/03/02','','VP - Sales','Customer Success Manager','ashwin.r@neurealm.com'
exec usp_insert_employee '11100131','Employee','Azif Saly','2024/03/04','','Vice President-BD','Customer Success Manager','azif.saly@neurealm.com'
exec usp_insert_employee '11100526','Employee','Devi Subramani','2022/05/02','','Senior Project Manager','Project Manager','devi.subramani@neurealm.com'
exec usp_insert_employee '11101128','Employee','Dhannya Raghunath','2025/05/12','','Senior Manager','Quality','dhannya.raghunath@neurealm.com'
exec usp_insert_employee '111C0227','Employee','Dhiya J','2025/11/24','','Executive','Quality','dhiya.j@neurealm.com'
exec usp_insert_employee '11100144','Employee','Divya Prabhu M','2018/10/29','','Technical Account Manager','Project Manager','divya.prabhu@neurealm.com'
exec usp_insert_employee '11100832','Employee','Haritha S','2023/11/27','','Assistant Project Manager','Project Manager','haritha.s@neurealm.com'
exec usp_insert_employee '11100367','Employee','Jayabharathi Kulandaivadivel','2021/06/01','','Head of Engineering','Project Manager','jayabharathi.k@neurealm.com'
exec usp_insert_employee '11101112','Employee','Joydeep Sarkar','2025/04/21','','Group Manager','Customer Success Manager','joydeep.sarkar@neurealm.com'
exec usp_insert_employee '11100724','Employee','Madhan Kumar K','2023/05/08','','Project Manager','Project Manager','madhan.kumar@neurealm.com'
exec usp_insert_employee '11100869','Employee','Manoj Balaram Thandassery','2024/04/08','','Vice President-BD','Customer Success Manager','manoj.thandassery@neurealm.com'
exec usp_insert_employee '11100064','Employee','Pradeep Sukumaran','2017/04/17','','Senior Vice President','Project Manager','pradeep.sukumaran@neurealm.com'
exec usp_insert_employee '11100307','Employee','Radhakrishnan Vadakkethil','2020/07/12','','Principal Engineer','Project Manager','radhakrishnan.vadakkethil@neurealm.com'
exec usp_insert_employee '11100529','Employee','Raghavendra S N','2022/05/09','','Senior Project Manager','Project Manager','raghavendra.sn@neurealm.com'
exec usp_insert_employee '11100730','Employee','Rajashree S C','2023/06/05','','Delivery Manager','Project Manager','rajashree.sc@neurealm.com'
exec usp_insert_employee '11100949','Employee','Sajina U','2024/08/26','','Project Manager','Project Manager','sajina.u@neurealm.com'
exec usp_insert_employee '11100220','Employee','Sathyanarayanan Chakrapani','2019/08/19','','Group Manager','Project Manager','sathya.chakrapani@neurealm.com'
exec usp_insert_employee '11100330','Employee','Shreenivas S G','2021/02/08','','Assistant Manager','Customer Success Manager','shreenivas.sg@neurealm.com'
exec usp_insert_employee '11101097','Employee','Sindhu Balasubramanyam','2025/03/24','','Project Manager','Project Manager','sindhu.b@neurealm.com'
exec usp_insert_employee '11190006','Employee','Sujith Mathew Iype','2013/05/27','','Co-Founder & COO','Project Manager','sujith@neurealm.com'
exec usp_insert_employee '11101136','Employee','Tess Joseph','2025/05/26','','Project Manager','Project Manager','tess.joseph@neurealm.com'
exec usp_insert_employee '11101045','Employee','Tony Thomas E','2025/06/01','','Vice President','Project Manager','tonyt@neurealm.com'
exec usp_insert_employee '111C0208','Employee','Zidan Z Hussain','2025/04/08','','Executive','Quality','zidan.hussain@neurealm.com'
exec usp_insert_employee '11101008','Employee','Ajith Nangaru Jayaraju','45614','','Manager','Customer Success Manager','ajith.nj@neurealm.com'

-- Insert Customers
---customer----
exec usp_insert_customer 'NXP','ALLEGIS GLOBAL SOLUTIONS (INDIA) PRIVATE LIMITED','SEAD'
exec usp_insert_customer 'AMZ','Amazon Development Centre (India)Private Limited','SEAD'
exec usp_insert_customer 'ADI','Analog Devices International','SEAD'
exec usp_insert_customer 'APT','Aptiv Services Deutschland GmbH','SEAD'
exec usp_insert_customer 'AIS','Aranya Information Systems Inc','SEAD'
exec usp_insert_customer 'ARM','ARM Ltd.','SEAD'
exec usp_insert_customer 'BER','Bertrandt S.A.S.','SEAD'
exec usp_insert_customer 'DMT','d-Matrix India Pvt Ltd','SEAD'
exec usp_insert_customer 'DLB','Dolby Laboratories, Inc','SEAD'
exec usp_insert_customer 'EDC','EdgeCortix Inc','SEAD'
exec usp_insert_customer 'ENP','Enphase Energy, Inc','SEAD'
exec usp_insert_customer 'ESP','Esperanto Technologies Inc.','SEAD'
exec usp_insert_customer 'GGL','Google LLC','SEAD'
exec usp_insert_customer 'INT','Intel Corporation','SEAD'
exec usp_insert_customer 'TDK','InvenSense Inc','SEAD'
exec usp_insert_customer 'JNX','JOYNEXT Technology GmbH','SEAD'
exec usp_insert_customer 'BRC','LSI India Research & Development Private Limited','SEAD'
exec usp_insert_customer 'AWS','Mahindra Teqo Private Limited','SEAD'
exec usp_insert_customer 'MAR','Marvell India Private Limited','SEAD'
exec usp_insert_customer 'MIC','Microchip Technology India Pvt. Ltd','SEAD'
exec usp_insert_customer 'MIP','MIPS Tech LLC','SEAD'
exec usp_insert_customer 'NVD','NVIDIA Graphics Pvt Ltd','SEAD'
exec usp_insert_customer 'ONS','ON Semiconductor Technology India Private Limited','SEAD'
exec usp_insert_customer 'PUI','Positioning Universal Inc','SEAD'
exec usp_insert_customer 'QTI','QUALCOMM TECHNOLOGIES INC.','SEAD'
exec usp_insert_customer 'REN','Renesas','SEAD'
exec usp_insert_customer 'SKW','Skyworks Semiconductor Pvt ltd','SEAD'
exec usp_insert_customer 'SNY','Sony India Software Centre Private Limited','SEAD'
exec usp_insert_customer 'SYN','Synaptics India Private Limited','SEAD'
exec usp_insert_customer 'TEN','TENSTORRENT INDIA PRIVATE LIMITED','SEAD'
exec usp_insert_customer 'TI','Texas Instruments (I) Pvt Ltd','SEAD'
exec usp_insert_customer 'TT','Turntide Drives Ltd','SEAD'
exec usp_insert_customer 'UHN','Uhnder Inc.','SEAD'
exec usp_insert_customer 'UNT','Untether AI','SEAD'
exec usp_insert_customer 'VAL','Valeo India Private Limited','SEAD'
exec usp_insert_customer 'HAR','Valueleaf IT Solutions Private Limited','SEAD'
exec usp_insert_customer 'VOC','VOCA AS','SEAD'
exec usp_insert_customer 'AMD','Xilinx, Inc.','SEAD'
exec usp_insert_customer 'ALT','Altera Semiconductor Technology India Pvt Ltd','SEAD'

-- Insert Projects
exec usp_insert_project'ADI_SW_AUDHIFI4OPT','HIFI4 Audio optimization','2025/01/05','2026/04/30','1','Billable','11100064','11100364','11100949','11100220','ADI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','ADI_SW_AUDHIFI4OPT'
exec usp_insert_project'ADI_SW_XAFPORT_TOOL','XAFPORT_TOOL','2024/11/25','2026/04/30','1','Billable','11100064','11100364','11100949','11100220','ADI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','ADI_SW_XAFPORT_TOOL'
exec usp_insert_project'ADI_SW_ZEPHYRAUDIO','ZEPHYRAUDIO','2025/06/03','2026/04/30','1','Billable','11100064','11100364','11100949','11100220','ADI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','ADI_SW_ZEPHYRAUDIO'
exec usp_insert_project'AMZ_SW_DLBVISION','DOLBY VISION','2025/07/21','2026/07/20','1','Billable','11100064','11100364','11101136','11100869','AMZ',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','AMZ_SW_DLBVISION'
exec usp_insert_project'ARM_V_SIONSITE','SIONSITE','2024/08/04','2026/12/31','1','Billable','11190006','11100730','11100730','11100131','ARM',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','ARM_V_SIONSITE'
exec usp_insert_project'BRC_V_DFT','Broadcom DFT','2025/09/22','2026/10/31','1','Billable','11190006','11100730','11100469','11100330','BRC',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','BRC_V_DFT'
exec usp_insert_project'BRC_V_EBIST','EBIST','2024/04/24','2026/10/31','1','Billable','11190006','11100730','11100469','11100330','BRC',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','BRC_V_EBIST'
exec usp_insert_project'DLB_V_VS12','VS12','2024/11/11','2026/02/28','1','Billable','11190006','11100730','11100469','11100869','DLB',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','DLB_V_VS12'
exec usp_insert_project'DMT_M_SI','SI','2022/09/05','2025/12/31','1','Billable','11100064','11100307','11100892','11100220','DMT',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','DMT_M_SI'
exec usp_insert_project'GOOG_V_MBU','MBU','2023/10/24','2026/03/31','1','Billable','11190006','11100730','11100730','11100220','GGL',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','GOOG_V_MBU'
exec usp_insert_project'MAR_V_CHEETAH','CHEETAH','2024/05/15','2026/04/30','1','Billable','11190006','11100730','11100332','11100330','MAR',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','MAR_V_CHEETAH'
exec usp_insert_project'MIC_V_PCIE5GIP','PCIE5GIP','2024/08/22','2026/03/31','1','Billable','11190006','11100730','11100469','11100330','MIC',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','MIC_V_PCIE5GIP'
exec usp_insert_project'MIP_V_DMA','DMA','2025/10/14','2026/06/30','1','Billable','11190006','11100730','11100332','11100502','MIP',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','MIP_V_DMA'
exec usp_insert_project'MIPS_E_FPGADEMO','FPGADEMO','2024/12/02','2025/12/31','1','Billable','11100064','11100364','11100949','11100502','MIP',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','MIPS_E_FPGADEMO'
exec usp_insert_project'MIPS_SW_INFRASUPT','INFRASUPT','2025/01/04','2026/02/28','1','Billable','11100064','11100364','11100949','11100502','MIP',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','MIPS_SW_INFRASUPT'
exec usp_insert_project'MIPS_V_SHOGUN','SHOGUN','2023/01/01','2026/03/31','1','Billable','11190006','11100730','11100332','11101112','MIP',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','MIPS_V_SHOGUN'
exec usp_insert_project'MIPS_V_RAVEN','RAVEN','2025/04/15','2026/04/14','1','Billable','11190006','11100730','11100332','11101112','MIP',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','MIPS_V_RAVEN'
exec usp_insert_project'NVD_E_AUTOMATION','AUTOMATION','2022/08/08','2026/01/05','1','Billable','11100064','11100364','11100529','11100220','NVD',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','NVD_E_AUTOMATION'
exec usp_insert_project'NVD_M_AIVAL','AIVAL','2023/09/25','2026/06/30','1','Billable','11100064','11100364','11100529','11100220','NVD',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','NVD_M_AIVAL'
exec usp_insert_project'NVD_M_NDAS_COV_VAL','NDASCOV','2024/01/03','2026/03/31','1','Billable','11100064','11100364','11100529','11100220','NVD',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','NVD_M_NDAS_COV_VAL'
exec usp_insert_project'NVD_S_DrOSAuto','NVIDIA Drive OS Automation','2025/10/31','2026/01/05','1','Billable','11100064','11100364','11100529','11100220','NVD',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','NVD_S_DrOSAuto'
exec usp_insert_project'NVD_SW_NDASARRCHECK','NDASARRCHECK','2024/10/10','2026/01/05','1','Billable','11100064','11100364','11100529','11100220','NVD',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','NVD_SW_NDASARRCHECK'
exec usp_insert_project'NVD_SW_NDASDOXMIG','NDASDOXMIG','2025/01/04','2026/01/05','1','Billable','11100064','11100364','11100529','11100220','NVD',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','NVD_SW_NDASDOXMIG'
exec usp_insert_project'ONS_V_AI_POC','Onsemi AI POC','2025/10/11','2026/01/31','1','Billable','11190006','11100730','11100469','11100869','ONS',NULL,'New','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','ONS_V_AI_POC'
exec usp_insert_project'ONS_V_SRSSIP','onsemi_IP_Phase1','2025/08/25','2026/04/30','1','Billable','11190006','11100730','11100469','11100869','ONS',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','ONS_V_SRSSIP'
exec usp_insert_project'SKW_SW_FWCOBALTPEARL','FWCOBALTPEARL','2024/01/06','2026/09/30','1','Billable','11100064','11100364','11100892','11100869','SKW',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','SKW_SW_FWCOBALTPEARL'
exec usp_insert_project'TI_E_DOLBY_CAREXP','DOLBYCAREXP','2024/02/12','2025/02/28','1','Billable','11100064','11100364','11100724','11100869','TI',NULL,'Complete','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_E_DOLBY_CAREXP'
exec usp_insert_project'TI_S_AWETEST','Audioweaver VLOP Kernel unit test improvement','2025/11/24','2026/06/30','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_S_AWETEST'
exec usp_insert_project'TI_S_BLDCSDK','BLDC Motor Control Programable SDK','2025/03/11','2026/01/31','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_S_BLDCSDK'
exec usp_insert_project'TI_S_BLDCSPP2','BLDC Single Phase','2025/08/12','2026/01/14','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_S_BLDCSPP2'
exec usp_insert_project'TI_S_C7xCORE','Support on C7x Core','2025/06/10','2026/09/28','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_S_C7xCORE'
exec usp_insert_project'TI_S_STRATEST','Sitart Test Infra','2025/08/18','2026/04/17','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_S_STRATEST'
exec usp_insert_project'TI_S_VLOPAWE','Optimise VLOP library Kernel','2025/01/10','2025/12/31','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_S_VLOPAWE'
exec usp_insert_project'TI_SW_EXTMCAL26X','EXTMCAL26X','2024/02/12','2025/04/30','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Complete','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_EXTMCAL26X'
exec usp_insert_project'TI_SW_FPDLINKFW','FPDLINKFW','2025/03/17','2025/12/31','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Complete','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_FPDLINKFW'
exec usp_insert_project'TI_SW_IMAGING_FUSA','IMAGING_FUSA','2025/01/20','2025/12/31','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_IMAGING_FUSA'
exec usp_insert_project'TI_SW_SDKAISUPPORT','SDKAISUPPORT','2025/10/02','2026/03/31','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_SDKAISUPPORT'
exec usp_insert_project'TI_SW_SITARAE2EMOD','E2E Sitara Moderation','2025/05/19','2025/12/31','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_SITARAE2EMOD'
exec usp_insert_project'TI_SW_XLIBCHOLESKY','XLIB Cholesky Optimization','2025/02/06','2025/10/31','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_XLIBCHOLESKY'
exec usp_insert_project'TI_V_EPIP','EPIP','2024/02/12','2026/11/30','1','Billable','11190006','11100730','11100332','11101112','TI',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_V_EPIP'
exec usp_insert_project'ALT_S_AGLXEXT','FreeRTOS SDK Support','2025/03/11','2026/04/30','1','Billable','11100064','11100364','11100892','11100502','ALT',NULL,'New','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','ALT_S_AGLXEXT'
exec usp_insert_project'APT_SW_CUSTOMOps','Radar phase2','2025/06/04','2025/09/19','1','Billable','11100064','11100367','11100367','11100131','APT',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','APT_SW_CUSTOMOps'
exec usp_insert_project'AWS_S_TEQO','IGN-SW-TEQO-SPDD','2025/08/21','2025/10/06','1','Billable','11100064','11100307','11100892','11101008','AWS',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','AWS_S_TEQO'
exec usp_insert_project'MIP_V_FUSA1','FUSA','2023/06/09','2025/03/31','1','Billable','11190006','11100730','11100332','11101112','MIP',NULL,'Complete','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','MIP_V_FUSA1'
exec usp_insert_project'TI_V_TDA54','TDA54','2024/11/04','2026/12/31','1','Billable','11190006','11100730','11101097','11100502','TI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_V_TDA54'
exec usp_insert_project'ARM_V_MANDALAY','Mandalay','2025/10/24','2026/03/31','1','Billable','11190006','11100730','11100730','11100131','ARM',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','ARM_V_MANDALAY'
exec usp_insert_project'ONS_V_PlatformIP_Ph1','Platform IP Development','2025/05/15','2026/12/30','1','Billable','11190006','11100730','11100469','11100869','ONS',NULL,'Plan','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','ONS_V_PlatformIP_Ph1'
exec usp_insert_project'TI_V_Audio_AMP_CONV','LUSK & Marvel DSP projects','2025/04/01','2026/03/30','1','Billable','11190006','11100730','11100469','11101112','TI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_V_Audio_AMP_CONV'
exec usp_insert_project'TI_SW_FUSIONGUI','Fusion GUI','2025/07/10','2025/11/25','1','Billable','11100064','11100307','11100724','11101112','TI',NULL,'Complete','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_FUSIONGUI'
exec usp_insert_project'TI_SW_DSPZENO','DSP ZENO','2025/06/02','2025/12/31','1','Billable','11100064','11100364','11101136','11101112','TI',NULL,'Close','SEAD','Fixed Price','Fixed Bid','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_DSPZENO'
exec usp_insert_project'DMT_SW_INFRA','Software Infra for QA','2024/12/26','2025/12/31','1','Billable','11100064','11100367','11100892','11100220','DMT',NULL,'Close','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','DMT_SW_INFRA'
exec usp_insert_project'TI_SW_PGA9XXFWSUP','PGA900','2024/09/04','2025/12/31','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Complete','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_PGA9XXFWSUP'
exec usp_insert_project'TI_SW_C7XE2ESUPPORT','C7x Support','2024/12/02','2026/01/31','1','Billable','11100064','11100364','11100724','11101112','TI',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','TI_SW_C7XE2ESUPPORT'
exec usp_insert_project'BRC_E_Networking','Broadcom Networking','2022/01/10','2026/10/31','1','Billable','11100064','11100364','11100724','11100330','BRC',NULL,'Plan','SEAD','Time and Material','Time and Material','11100264','11100264','Application Development (AD)','Application Development (AD)','BRC_E_Networking'

-- Insert Contacts Projects
exec usp_insertHalfyearlyRespondedProject'Analog Devices International','ADI_SW_AUDHIFI4OPT','Vivek Nigam','Vivek.Nigam@analog.com','Director','sajina.u@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Analog Devices International','ADI_SW_XAFPORT_TOOL','Srinivas Gollakota','Srinivas.Gollakota@analog.com','Director','sajina.u@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Analog Devices International','ADI_SW_ZEPHYRAUDIO','Srinivas Gollakota','Srinivas.Gollakota@analog.com','Director','sajina.u@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Altera Semiconductor Technology India Pvt Ltd','ALT_S_AGLXEXT','Yves Vandervennet','yves.vandervennet@altera.com','','aneela.thomas@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Amazon Development Centre (India)Private Limited','AMZ_SW_DLBVISION','Amit Verma','amitvrma@amazon.com','Manager','anoop.g@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'ARM Ltd.','ARM_V_MANDALAY','Vanitha Unnamalai Chandrasekaran','vanitha.unnamalaichandrasekaran@arm.com','','rajashree.sc@ignitarium.com','3.5'
exec usp_insertHalfyearlyRespondedProject'ARM Ltd.','ARM_V_MANDALAY','Marius Grigorescu','marius.grigorescu@arm.com','','rajashree.sc@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'ARM Ltd.','ARM_V_MANDALAY','Soyeb Khanusiya','soyeb.khanusiya@arm.com','','rajashree.sc@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'ARM Ltd.','ARM_V_SIONSITE','Nipun Mahajan','nipun.mahajan@arm.com','Technical director','rajashree.sc@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Mahindra Teqo Private Limited','AWS_S_TEQO','Ashutosh Gupta','GUPTA.ASHUTOSH2@mahindra.com','','aneela.thomas@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'LSI India Research & Development Private Limited','BRC_V_DFT','Daryl Pereira','daryl.pereira@broadcom.com','R&D Mgmt','anuradha.noone@ignitarium.com','3.5'
exec usp_insertHalfyearlyRespondedProject'LSI India Research & Development Private Limited','BRC_V_EBIST','Shanmukh Rao','shanmukh.rao@broadcom.com','R&D Mgmt','anuradha.noone@ignitarium.com','3.5'
exec usp_insertHalfyearlyRespondedProject'Dolby Laboratories, Inc','DLB_V_VS12','Pavan Gajala','Pavan.Gajjala@dolby.com','','anuradha.noone@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Dolby Laboratories, Inc','DLB_V_VS12','Yen Jonathan','Jonathan.Yen@dolby.com','','anuradha.noone@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'd-Matrix India Pvt Ltd','DMT_M_SI','Haj','helfadil@d-matrix.ai','Manager','aneela.thomas@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'd-Matrix India Pvt Ltd','DMT_SW_INFRA','Haj','helfadil@d-matrix.ai','Manager','aneela.thomas@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Google LLC','GOOG_V_MBU','Neil Sensarkar','nsensarkar@google.com','Director','rajashree.sc@ignitarium.com','3.5'
exec usp_insertHalfyearlyRespondedProject'Google LLC','GOOG_V_MBU','Sanjay Kumar','sanjaykumarca@google.com','Test Chip Manager','rajashree.sc@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Google LLC','GOOG_V_MBU','Aditya Prahalad Alluri','adityapalluri@google.com','Manager','rajashree.sc@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Marvell India Private Limited','MAR_V_CHEETAH','Apoorwa Kapse','akapse@marvell.com','Director','aparna.puthumana@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'Marvell India Private Limited','MAR_V_CHEETAH','Milind Agashe','magashe@marvell.com','Program Manager','aparna.puthumana@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'Microchip Technology India Pvt. Ltd','MIC_V_PCIE5GIP','Sri Anand Kumar','srianandkumar.chintakula@microchip.com','','anuradha.noone@ignitarium.com','3.5'
exec usp_insertHalfyearlyRespondedProject'MIPS Tech LLC','MIP_V_DMA','Raghavendra Santhanagopal','raghavendra.santhanagopal@globalfoundries.com','Sr. Director','supriya.unnikrishnan@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'MIPS Tech LLC','MIP_V_FUSA1','Sachin Garg','sachin.garg@globalfoundries.com','Design Manager','santhi.lakshmi@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'MIPS Tech LLC','MIP_V_FUSA1','Ajith Chandy Jose','ajithchandy.jose@globalfoundries.com','DV Manager','santhi.lakshmi@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'MIPS Tech LLC','MIPS_E_FPGADEMO','David Bell','dbell@mips.com','Manager','anoop.g@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'MIPS Tech LLC','MIPS_SW_INFRASUPT','Steve Mullinnix','smullinnix@mips.com','Sr. Director','radhakrishnan.vadakkethil@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'MIPS Tech LLC','MIPS_V_RAVEN','Raghavendra Santhanagopal','raghavendra.santhanagopal@globalfoundries.com','Sr. Director','santhi.lakshmi@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'MIPS Tech LLC','MIPS_V_SHOGUN','Saurabh Mishra','saurabh.mishra1@globalfoundries.com','Manager','santhi.lakshmi@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'NVIDIA Graphics Pvt Ltd','NVD_E_AUTOMATION','Sumeet Gupta','sumeetg@nvidia.com','Group Manager','raghavendra.sn@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'NVIDIA Graphics Pvt Ltd','NVD_M_AIVAL','Evan Dong','evand@nvidia.com','Group Manager','mohit.bangale@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'NVIDIA Graphics Pvt Ltd','NVD_M_NDAS_COV_VAL','Eric Brower','ebrower@nvidia.com','Group Manager','athira.sasidharan@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'NVIDIA Graphics Pvt Ltd','NVD_S_DrOSAuto','Amritha Deshmukh','amritad@nvidia.com','Functional Manager','raghavendra.sn@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'NVIDIA Graphics Pvt Ltd','NVD_SW_NDASARRCHECK','Eric Brower','ebrower@nvidia.com','Group Manager','shilpa.baby@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'NVIDIA Graphics Pvt Ltd','NVD_SW_NDASARRCHECK','Tariq Ahmed','tahamed@nvidia.com','Manager','shilpa.baby@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'NVIDIA Graphics Pvt Ltd','NVD_SW_NDASARRCHECK','Jack Yang','zhiyuy@nvidia.com','Manager','shilpa.baby@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'NVIDIA Graphics Pvt Ltd','NVD_SW_NDASDOXMIG','Houman Tavakoli Shiraji','htavakoli@nvidia.com','Functional Manager','nishitha.a@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'ON Semiconductor Technology India Private Limited','ONS_V_AI_POC','Venkat Ramakrishnan','rvenkat@onsemi.com','','anuradha.noone@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'ON Semiconductor Technology India Private Limited','ONS_V_PlatformIP_Ph1','Tarun Mahadev','Tarun.Mahadev@onsemi.com','','anuradha.noone@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'ON Semiconductor Technology India Private Limited','ONS_V_PlatformIP_Ph1','Hemant Gavali','Hemant.Gavali@onsemi.com','','anuradha.noone@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'ON Semiconductor Technology India Private Limited','ONS_V_SRSSIP','Tarun Mahadev','Tarun.Mahadev@onsemi.com','Manager','anuradha.noone@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Skyworks Semiconductor Pvt ltd','SKW_SW_FWCOBALTPEARL','Abhishek Singhal','abhi.singhal@skyworksinc.com','Manager','aneela.thomas@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_E_DOLBY_CAREXP','Asheesh Bhardwaj','asheeshb@ti.com','Manager','sreenath.pv@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_S_AWETEST','Frank Livingston','frank-livingston@ti.com','Manager','sreenath.pv@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_S_BLDCSDK','Prajith Jayarajan','prajith@ti.com','Manager','madhan.kumar@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_S_BLDCSPP2','Manu Balakrishnan','manub@ti.com','Manager','radhakrishnan.vadakkethil@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_S_C7xCORE','Nee Patel','neelpatel@ti.com','Manager','sreenath.pv@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_S_STRATEST','Venkatesan Krishnamoorthy','v-krishnamoorthy@ti.com','Manager','madhan.kumar@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_S_VLOPAWE','Frank Livingston','frank-livingston@ti.com','Manager','sreenath.pv@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_DSPZENO','Khasim Mohammad','khasim@ti.com','Manager','anoop.g@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_EXTMCAL26X','Shivasharan Nagalikar','shivasharan.nagalikar@ti.com','Manager','madhan.kumar@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_FPDLINKFW','Tomasz Chadzynski','t-chadzynski@ti.com','Manager','madhan.kumar@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_FUSIONGUI','Aravindan, K','k-aravindhan1@ti.com','','radhakrishnan.vadakkethil@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_FUSIONGUI','Ankit Kumar','a-kumar12@ti.com','','radhakrishnan.vadakkethil@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_IMAGING_FUSA','Hrushikesh Tukaram Garud','hrushikesh.garud@ti.com','Manager','madhan.kumar@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_SDKAISUPPORT','Pramod Swami','pramods@ti.com','Manager','jijo.j@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_SITARAE2EMOD','Karan Saxena','karan@ti.com','Manager','madhan.kumar@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_XLIBCHOLESKY','Asheesh Bhardwaj','asheeshb@ti.com','Manager','madhan.kumar@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_V_Audio_AMP_CONV','Ranjit Singh Garewal','r.singh@ti.com','','anuradha.noone@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_V_EPIP','Rajeev Suvarna','rajeev@ti.com','Manager','divya.prabhu@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_V_TDA54','Anish','anish@ti.com','Project manager','ashwin.r@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_V_TDA54','Sai Rajaraman','sairajaraman@ti.com','Manager/Lead','ashwin.r@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_PGA9XXFWSUP','Sheetal Liddar','hliddar@ti.com','Manager','madhan.kumar@ignitarium.com','3'
exec usp_insertHalfyearlyRespondedProject'Texas Instruments (I) Pvt Ltd','TI_SW_C7XE2ESUPPORT','Keerthy','j-keerthy@ti.com','Manager','madhan.kumar@ignitarium.com','4'
exec usp_insertHalfyearlyRespondedProject'LSI India Research & Development Private Limited','BRC_E_Networking','Shailesh','shailesh.mistry@broadcom.com','Manager','madhan.kumar@ignitarium.com','4'