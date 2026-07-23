const fs = require('fs');
const filePath = 'src/components/AccountWiseAvgDashboard.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the CSS counting logic to use second sheet data
const oldCSSLogic =       // Get CSS counts from the second sheet data, filtered by CSAT cycle start date
      let cssSentCount = 0;
      let cssReceivedCount = 0;
      
      // If we have CSS dates and CSAT cycle start date, filter them
      if (csatCycleStartDateFormatted && row['CSS_SENT_DATES'] && row['CSS_RECEIVED_DATES']) {
        // Filter CSS_SENT_DATES that are >= CSAT cycle start date
        const filteredSentDates = row['CSS_SENT_DATES'].filter(sentDate => {
          if (!sentDate || sentDate === 'N/A' || sentDate === '') return false;
          // Convert sentDate to MM-DD-YYYY format for comparison
          const sentDateFormatted = formatDateToMMDDYYYY(sentDate);
          return isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted);
        });
        cssSentCount = filteredSentDates.length;
        
        // Filter CSS_RECEIVED_DATES that are >= CSAT cycle start date
        const filteredReceivedDates = row['CSS_RECEIVED_DATES'].filter(receivedDate => {
          if (!receivedDate || receivedDate === 'N/A' || receivedDate === '') return false;
          // Convert receivedDate to MM-DD-YYYY format for comparison
          const receivedDateFormatted = formatDateToMMDDYYYY(receivedDate);
          return isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted);
        });
        cssReceivedCount = filteredReceivedDates.length;
        
        // Debug logging for first few rows
        if (index < 3) {
          console.log(Customer  CSS filtering:, {
            csatCycleStartDate: csatCycleStartDateFormatted,
            originalSentCount: row['CSS_SENT_DATES'].length,
            filteredSentCount: cssSentCount,
            originalReceivedCount: row['CSS_RECEIVED_DATES'].length,
            filteredReceivedCount: cssReceivedCount
          });
        }
      } else {
        // Fallback to original counts if no filtering possible
        cssSentCount = row['CSS_SENT_COUNT'] || 0;
        cssReceivedCount = row['CSS_RECEIVED_COUNT'] || 0;
      };

const newCSSLogic =       // Get CSS counts from the second sheet data, filtered by CSAT cycle start date
      let cssSentCount = 0;
      let cssReceivedCount = 0;
      
      // Count CSS_SENT_DATE and CSS_RECEIVED_DATE from second sheet, grouped by CUSTOMER_ID
      if (excelData && excelData.secondSheetData && csatCycleStartDateFormatted) {
        // Filter second sheet data for this customer
        const customerSecondSheetData = excelData.secondSheetData.filter(secondRow => {
          const secondRowCustomerId = secondRow['CUSTOMER_ID'] || secondRow['CUST_ID'];
          return secondRowCustomerId === customerId;
        });
        
        // Count CSS_SENT_DATE entries >= CSAT cycle start date
        cssSentCount = customerSecondSheetData.filter(secondRow => {
          const sentDate = secondRow['CSS_SENT_DATE'];
          if (!sentDate || sentDate === 'N/A' || sentDate === '') return false;
          const sentDateFormatted = formatDateToMMDDYYYY(sentDate);
          return isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted);
        }).length;
        
        // Count CSS_RECEIVED_DATE entries >= CSAT cycle start date
        cssReceivedCount = customerSecondSheetData.filter(secondRow => {
          const receivedDate = secondRow['CSS_RECEIVED_DATE'];
          if (!receivedDate || receivedDate === 'N/A' || receivedDate === '') return false;
          const receivedDateFormatted = formatDateToMMDDYYYY(receivedDate);
          return isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted);
        }).length;
        
        // Debug logging for first few rows
        if (index < 3) {
          console.log(Customer  CSS counting from second sheet:, {
            csatCycleStartDate: csatCycleStartDateFormatted,
            secondSheetRowsForCustomer: customerSecondSheetData.length,
            cssSentCount: cssSentCount,
            cssReceivedCount: cssReceivedCount
          });
        }
      } else {
        // Fallback to original counts if no second sheet data available
        cssSentCount = row['CSS_SENT_COUNT'] || 0;
        cssReceivedCount = row['CSS_RECEIVED_COUNT'] || 0;
      };

content = content.replace(oldCSSLogic, newCSSLogic);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated CSS counting logic to use second sheet data!');
