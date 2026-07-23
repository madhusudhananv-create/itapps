Practice wise Response Rate Dashboard - data file
=================================================
Place the following file in this folder to load it automatically when you click
"Practice wise Response Rate Dashboard" on the Account/BU wise Response Rate page:

  New_customer_feedback_analysis_New-Practice.xlsx

Required structure:
  Sheet1: CSAT received Report
  Sheet2: CSAT sent and received Report (must contain a "Practice" column)

Columns used from Sheet2:
  - Practice (group by)
  - CSS_SENT_DATE or CSAT SENT DATE (for #Polled; count where date >= CSAT cycle start)
  - CSS_RECEIVED_DATE or CSAT RECEIVED DATE (for #Responded; count where date >= CSAT cycle start)
  - ACTUAL SCORE (for Average CSAT Score)

Date format for comparison: MM-DD-YYYY (CSAT cycle start date from the app).
