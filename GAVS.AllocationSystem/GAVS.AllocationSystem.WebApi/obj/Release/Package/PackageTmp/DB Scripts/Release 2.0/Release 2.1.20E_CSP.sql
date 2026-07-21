IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID =3)
BEGIN
	 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3, 'Attend phone call', 'Service Desk engineer is not available in the seat during the shift',
 'Unhappy customer / escalated by customer as the call not attended by SD',  161, 'Not planning the break and taking unscheduled breaks', 
 '1.Abandaoned calls list / automated email triggered when a call is missed / not attended', 'scheduled break time', 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)

INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3, 'Attend phone call', 'Engineer not logged into call handling software during the shift',
 'Unhappy Customer / customer escalation',  161, 'Lack of Awareness', 
 'Checking the dashboard to see the no of phones logged in during the shift', 'Project Induction / Training at the time on-boarding and evaluation post induction', 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)

INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3, 'Attend phone call', 'Possibility of engineer missing calls when multiple users (more no. of concurrent calls) trying to reach SD at the same time',
 'Customer may wait for a long time and may abort the call, results in unhappy customer', 162, 'All engineers are busy on attending other customers',
 'Monitoring the dashboard for the number of calls queued', 'Availability of self- service or alternative channels (Chat, web forms)', 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)

INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3, 'Attend phone call', 'Internet link is down either internally or externally',
 'Customer critical issues may be missed to address within the SLA/ Customer escalation',  162, 'Internal Network is down due to a failure occurred internally or externally', 
 'Incidents reported from internal users and alerts from monitoring tool', 'Alternative available network to connect', 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)

INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3, 'Attend phone call', 'Technical issues in call handling tool during the call',
 'Customer escalation/Frustrated customer',  162, 'Occurance of techincal faults in call handling tool , i.e., Unable to take calls though the tool is logged in, Unable hear voices properly, frequent call disconnection', 
 'Dashboard not showing the call logs for the particular engineer/ issue reported by engineer in person', 'Routing the calls to other avaialble engineers until the issue is resolved', 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)

INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3, 'Attend phone call', 'Unattended calls when engineer is not scheduled for the shift',
 'customer dissatification/ Escalation ',  161, 'Engineer didn’t logout properly after the shift timing', 
 'Cross verifying the no of logins for each shift schedule', 'Logging out from the phone after the shift ends', 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)

INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3, 'Listening to the call', 'Not paying attention to the customer while on the call', 'extended call time/ frustrated customer', 161, 
'Lack of Awareness on how to handle call', 'Tracking the Average call handled time and total no of tickets resolved via phone by each engineer', 'Project Induction / Training at the time on-boarding and evaluation post induction',
 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 
INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3, 'Listening to the call', 'Communication gap between the customer and the Engineer', 'Frustrated customer.', 161, 
'Lack of communication skills', 'Auditing call samples and customer feedback', 'Soft skills traning taken by LMS team',
 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 
INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3, 'Listening to the call', 'Probing irrelevant questions to customer', 'extended call time/ frustrated customer', 161, 
'Lack of Awareness on how to handle call', 'Tracking the Average call handled time and total no of tickets resolved via phone by each engineer', 'Project Induction / Training at the time on-boarding and evaluation post induction',
 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3,'Hold Procedures','Engineer not communicating the customer on the actions being taken',
 'Customer may wait for a long wait time without understanding the need to wait',165,
 'Lack of Awareness on how to handle call',
 'Auditing the call samples of each engineer to identify the average call handled time and adherence other call handling procedures',
 'Project Induction / Training at the time on-boarding and evaluation post induction',
 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)
 
 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 3,'Hold Procedures','Keeping the call on hold without informing the customer',
 'Customer feels disrespected/not vlaued',161,'Lack of Awareness on how to handle call','Regular call samplings',
 'Project Induction / Training at the time on-boarding and evaluation post induction',
  0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)

END

GO

IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID =4)
BEGIN
	INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 4, 'Attend email','Unattended emails for long time',
 'Irate customer/Penalities for missing SLA',161,'Not checking the email box regularly',
 'No of emails unattended for a particular period','constant mailbox monitoring ',
 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)
 
 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 4,'Attend email','Mail box memory full',
 'Undeliverable emails/ customer escalation',162,
 'Not archeiving the email box at a regular interval','Monitoring the memory ','Archieving the email box at regualr intervals',
 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)
 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 4,'Attend email','Network issue emailbox not working',
 'customer dissatification/ Penalities',163,'Internal network is down/ intermediate network issues',
 'Alerts from monitoring tool','Connecting to alternative network',
 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)
END

GO

IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID =5)
BEGIN

INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 5, 'Inciden acknolwedgment',
 'Tickets not acknolwedged within SLA','Penalities for missing SLA',161,'Not monitoring the ticket queue regularly',
 'No of tickets unattended for a particular period','Constant ticket queue monitoring',
 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL
)
 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 5, 'Incident categorization & prioritization',
 'Improper ticket categorization','SLA breach',161,'Lack of awareness in classifying the tickets ,
  worngly classifying Incident as service requests and service requests as incidents',
 'Ticket auditing','Incident management process awareness',
0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 5, 'Incident categorization & prioritization','Improper ticket prioritization/Impact /Urgency','Delayed resolution/SLA breach',165,
 'Lack of awareness on how to assign priority and category based on the issue','Ticket auditing','Incident management process awareness',
0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 5,
 'Incident categorization & prioritization','Categorization/priortization is not defined for all issues in SOP/ ticketing tool','Delayed resolution/SLA breach',164,
 '1) No defined process to categorize/priortize the in scope issues 
2) Limitations in the tool to capture all type of issue categorization/priortization',
'Reviewing the ticket on daily basis/ticket auditing',
'SOP is defined for all inscope issues and tool is configured to capture all category of issues',
  0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)
END

GO


IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID =6)
BEGIN
	INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 6,'Incident triaging','Inappropriate ticket routing ',
 'SLA Breach/ delayed resolution/ loss of business', 165,'Issues are not getting assigned to right person /right team','Tracking the no of tickets routed from Service Desk','Awareness and SOP are provided on tasks handled by Service Desk and traiging procedures'

  ,0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 6,
 'Incident Diagnosis','Long winded email conversations','Long wait time/Delayed Resolution',165,'Not collecting required information from the customer at the first instance and sending multiple emails to collect the information','tracking the no of tickets pending for user information','Availability of request templates to collect the necessary information'

  ,0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 6, 
 'Incident Diagnosis','Non-availability of SOP / KB','Incidents are not resolved within SLA',165,'SOP/KB are not created for all issues & not maintained in a common repository','Tracking whether the SOP/KB are created/ updated as and when new issues are found or new process is introduced','All KB/SOPs are created and stored in a common repository'

, 0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 6, 
 'Incident Documentation','Poor doucmentation on the issues reported','Incidents are not resolved within SLA',165,'Engineer is not recording all the information collected from the customer for traiging the issue','Ticket auditing','No'

 ,0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 6, 
 'Incident Documentation','Not recording the worknotes & resolution notes','Breach in ticket quality standard',
 165,'Engineer fails to document the actions taken for the resolution in worknotes & resolution notes','Ticket auditing','Resolution comments and resolution codes are mandate to capture'

 
 ,0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 6, 
 'Incident Resolution','Incidents not resolved within SLA',
 'Penalities for missing SLA/Unhappy customer',161,
 'Not taking regular action on the incident reported, i.e., following up with the customer /vendor/Support team for a resolution','Auditing & publishing of score cards','Regular follow ups on the  incidents assigned'

 ,0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 6, 
 'Incident Resolution','Not receiving acknolwedgement from customer after incident is resolved','Customer Dissatisfication',
 161,'Lack of awareness on incident management process','Reviewing the incident resolution closure comment  to check whether the incident is resolved with customer acknowlegement','No'

 ,0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 6, 
 'Incident Resolution','Making false commitments to customer incase of unresolved issues'
 ,'Mistrust/negative feedback',163,'Lack of Awareness on how to the handle and triage the issue in case if the Service Desk engineer is unable to resolve the issue','No of Pending tickets and its ageing','Awareness and SOP are provided on tasks handled by Service Desk and traiging procedures'


 ,0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

END

GO

IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID =7)
BEGIN
	
 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 7, 
 'Shift Handover','Engineer didn’t follow the shift handover process','Long wait time/Delayed Resolution', 161,
 'shift handover process is not followed by the engineer and didn’t communicate the team and management on the issues recorded,
  resolved and pending for the shift handled','Monitoring th shift handover email from each engineer at the end of every shift ','Shift - Handover process is in palce'
 ,0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

 INSERT INTO Failure_Mode_Master VALUES (155, 86, 134, 3, 7, 
'Incident backlogs reporting','No mechanism to track the ticket backlogs',
'Long wait time/Delayed Resolution',165,'No process is set to track and monitor the backlogs and ageing tickets on daily basis',
'Reviewing the backlogs in the tool','Shift handover template has the field to capture the overall backlogs and individual wise'
 ,0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

END

GO

IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID =8)
BEGIN

	INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Attend phone call',
'Service Desk engineer is not available in the seat during the shift',
'Unhappy customer / escalated by customer as the call not attended by SD',161,
'Not planning the break and taking unscheduled breaks','1.Abandaoned calls list / automated email triggered when a call is missed / not attended','scheduled break time',
0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)


INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Attend phone call','Engineer not logged into call handling software during the shift','Unhappy Customer / customer escalation',161,'Lack of Awareness','Checking the dashboard to see the no of phones logged in during the shift','Project Induction / Training at the time on-boarding and evaluation post induction',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Attend phone call','Possibility of engineer missing calls when multiple users (more no. of concurrent calls) trying to reach SD at the same time','Customer may wait for a long time and may abort the call, results in unhappy customer',162,'All engineers are busy on attending other customers','Monitoring the dashboard for the number of calls queued','Availability of self- service or alternative channels (Chat, web forms)',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Attend phone call','Internet link is down either internally or externally','Customer critical issues may be missed to address within the SLA/ Customer escalation',162,'Internal Network is down due to a failure occurred internally or externally','Incidents reported from internal users and alerts from monitoring tool','Alternative available network to connect',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Attend phone call','Technical issues in call handling tool during the call','Customer escalation/Frustrated customer',162,'Occurance of techincal faults in call handling tool , i.e., Unable to take calls though the tool is logged in, Unable hear voices properly, frequent call disconnection ','Dashboard not showing the call logs for the particular engineer/ issue reported by engineer in person','Routing the calls to other avaialble engineers until the issue is resolved',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Attend phone call','Unattended calls when engineer is not scheduled for the shift','customer dissatification/ Escalation ',161,'Engineer didn’t logout properly after the shift timing','Cross verifying the no of logins for each shift schedule','Logging out from the phone after the shift ends',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Listening to the call','Not paying attention to the customer while on the call','extended call time/ frustrated customer',161,'Lack of Awareness on how to handle call','Tracking the Average call handled time and total no of tickets resolved via phone by each engineer','Project Induction / Training at the time on-boarding and evaluation post induction',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)


INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Listening to the call','Communication gap between the customer and the Engineer','Frustrated customer.',161,'Lack of communication skills','Auditing call samples and customer feedback','Soft skills traning taken by LMS team',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)


INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Listening to the call','Probing irrelevant questions to customer','extended call time/ frustrated customer',161,'Lack of Awareness on how to handle call','Tracking the Average call handled time and total no of tickets resolved via phone by each engineer','Project Induction / Training at the time on-boarding and evaluation post induction',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Hold Procedures','Keeping the call on hold without informing the customer','Customer feels disrespected/not vlaued',161,'Lack of Awareness on how to handle call','Regular call samplings','Project Induction / Training at the time on-boarding and evaluation post induction',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 8,'Hold Procedures','Engineer not communicating the customer on the actions being taken','Customer may wait for a long wait time without understanding the need to wait',165,'Lack of Awareness on how to handle call','Auditing the call samples of each engineer to identify the average call handled time and adherence other call handling procedures','Project Induction / Training at the time on-boarding and evaluation post induction',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)
END

GO


IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID = 9)
BEGIN
	INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 9,'Attend email','Unattended emails for long time','Irate customer/Penalities for missing SLA',161,'Not checking the email box regularly','No of emails unattended for a particular period','constant mailbox monitoring ',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 9,'Attend email','Mail box memory full','Undeliverable emails/ customer escalation',162,'Not archeiving the email box at a regular interval','Monitoring the memory ','Archieving the email box at regualr intervals',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 9,'Attend email','Network issue emailbox not working','customer dissatification/ Penalities',163,'Internal network is down/ intermediate network issues','Alerts from monitoring tool','Connecting to alternative network',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)



END

GO

IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID = 9)
BEGIN

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 10,'Request Categorization/Priortization','Tickets not acknolwedged within SLA','Penalities for missing SLA',161,'Not monitoring the ticket queue regularly','No of tickets unattended for a particular period','Constant ticket queue monitoring',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 10,'Request Categorization/Priortization','Improper request categorization','SLA breach',161,'Lack of awareness in classifying the tickets , worngly classifying Incident as service requests and service requests as incidents','Ticket auditing','Incident management process awareness',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 10,'Request Categorization/Priortization','Improper request prioritization/Impact /Urgency','Delayed resolution/SLA breach',165,'Lack of awareness on how to assign priority and category based on the issue','Ticket auditing','Incident management process awareness',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 10,'Request Categorization/Priortization','Categorization/priortization is not defined for all issues in SOP/ ticketing tool','Delayed resolution/SLA breach',164,'1) No defined process to categorize/priortize the in scope issues 
2) Limitations in the tool to capture all type of issue categorization/priortization','Reviewing the ticket on daily basis/ticket auditing','SOP is defined for all inscope issues and tool is configured to capture all category of issues',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL);
END

GO

IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID = 11)
BEGIN

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 11,'Request Triaging','Inappropriate ticket routing ','SLA Breach/ delayed resolution/ loss of business',165,'Requests are not getting assigned to right person /right team','Tracking the no of tickets routed from Service Desk','Awareness and SOP are provided on tasks handled by Service Desk and traiging procedures',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 11,'Request Diagonsis','Delayed service request approvals','Frustrated customer/customer escalation',165,'Requests are not being sent for business approval or approval is delayed due to wrong queue assignment, ex., access to an application request is being assigned to billing department for approval','tracking the no of requests pending for approval','Service request fullfilment process SOP',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 11,'Request Diagonsis','Long winded email conversations','Long wait time',165,'Not collecting required information from the customer at the first instance and sending multiple emails to collect the information','tracking the no of tickets pending for user information','Availability of request templates to collect the necessary information',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 11,'Request Diagonsis','Non-availability of SOP / KB','Requests are not resolved within SLA',165,'SOP/KB are not created for all requests & not maintained in a common repository','Tracking whether the SOP/KB are created/ updated as and when new issues are found or new process is introduced','All KB/SOPs are created and stored in a common repository',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 11,'Request Documentation','Poor doucmentation on the request reported','Incidents are not resolved within SLA',165,'Engineer is not recording all the information collected from the customer for traiging the issue','Ticket auditing','No',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 11,'Request Documentation','Not recording the worknotes & resolution notes','Breach in ticket quality standard',165,'Engineer fails to document the actions taken for the resolution in worknotes & resolution notes','Ticket auditing','Resolution comments and resolution codes are mandate to capture',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 11,'Request resolution','Requests not resolved within SLA','Penalities for missing SLA/Unhappy customer',161,'Not taking regular action on the ticket','Auditing & publishing of score cards','Regular follow ups on tickets assigned',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 11,'Request resolution','Making false commitments to customer incase of unresolved requests','Mistrust/negative feedback',163,'Lack of Awareness on how to the handle and triage the issue','No of Pending tickets and its ageing','Awareness and SOP are provided on tasks handled by Service Desk and traiging procedures',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

END
GO

IF not exists(SELECT 1 FROM Failure_Mode_Master where TASK_ID = 12)
BEGIN

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 12,'Shift Handover','Engineer didn’t follow the shift handover process','Long wait time/Delayed Resolution',161,'shift handover process is not followed by the engineer and didn’t communicate the team and management on the issues recorded, resolved and pending for the shift handled','Monitoring th shift handover email from each engineer at the end of every shift ','Shift - Handover process is in palce',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)

INSERT INTO FAILURE_MODE_MASTER VALUES(155, 86, 405, 3, 12,'Ticket backlogs monitoring','No mechanism to track the ticket backlogs','Long wait time/Delayed Resolution',165,'No process is set to track and monitor the backlogs and ageing tickets on daily basis','Reviewing the backlogs in the tool','Shift handover template has the field to capture the overall backlogs and individual wise',0, 103245, GETDATE(), 103245, GETDATE(), 1, NULL)
END

GO