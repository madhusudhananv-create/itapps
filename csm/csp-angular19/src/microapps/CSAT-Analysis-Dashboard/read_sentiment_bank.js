const XLSX = require('xlsx');
const path = require('path');

// Read the sentiment analysis word bank Excel file
const filePath = path.join(__dirname, 'data', 'Sentiment_analysis_word_bank.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  
  console.log('Sheet names:', sheetNames);
  
  // Read each sheet
  sheetNames.forEach(sheetName => {
    console.log(`\n=== Sheet: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Data:', jsonData);
    
    // Show first few rows
    console.log('First 10 rows:');
    jsonData.slice(0, 10).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });
  });
  
} catch (error) {
  console.error('Error reading Excel file:', error);
}
