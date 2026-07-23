const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const filePath = path.join(__dirname, 'data', 'ACSAT_ of New_customer_feedback_analysis.xlsx');
const workbook = XLSX.readFile(filePath);

// Get the "CSAT received Report" sheet
const sheetName = 'CSAT received Report ';
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON to work with the data
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Excel file analysis:');
console.log('Total rows:', jsonData.length);

// Get the headers
const headers = jsonData[0] || [];
const customerIdIndex = 0; // CUSTOMER_ID is now at index 0
const customerNameIndex = 1; // CUSTOMER NAME is now at index 1

console.log('CUSTOMER_ID column:', headers[customerIdIndex]);
console.log('CUSTOMER NAME column:', headers[customerNameIndex]);

// Extract customer data
const customerData = jsonData.slice(1) // Skip header row
  .filter(row => row && row.length > 0 && row[customerIdIndex] && row[customerNameIndex])
  .map(row => ({
    customerId: row[customerIdIndex],
    customerName: row[customerNameIndex]
  }));

console.log('\nCustomer data analysis:');
console.log('Total customer records:', customerData.length);

// Check for duplicate customer names
const customerNames = customerData.map(row => row.customerName);
const uniqueCustomerNames = [...new Set(customerNames)];

console.log('Unique customer names:', uniqueCustomerNames.length);

if (customerNames.length !== uniqueCustomerNames.length) {
  console.log('\n❌ DUPLICATE CUSTOMER NAMES FOUND!');
  
  // Find duplicates
  const nameCounts = {};
  customerNames.forEach(name => {
    nameCounts[name] = (nameCounts[name] || 0) + 1;
  });
  
  const duplicates = Object.entries(nameCounts)
    .filter(([name, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);
  
  console.log('\nDuplicate customer names:');
  duplicates.forEach(([name, count]) => {
    console.log(`"${name}" appears ${count} times`);
  });
  
  // Show sample of duplicate entries
  console.log('\nSample duplicate entries:');
  duplicates.slice(0, 3).forEach(([name, count]) => {
    const entries = customerData.filter(row => row.customerName === name);
    console.log(`\n"${name}" entries:`);
    entries.slice(0, 5).forEach((entry, index) => {
      console.log(`  ${index + 1}. ID: ${entry.customerId}, Name: "${entry.customerName}"`);
    });
    if (entries.length > 5) {
      console.log(`  ... and ${entries.length - 5} more`);
    }
  });
} else {
  console.log('✅ No duplicate customer names found in Excel file');
}

// Check for duplicate customer IDs
const customerIds = customerData.map(row => row.customerId);
const uniqueCustomerIds = [...new Set(customerIds)];

console.log('\nCustomer ID analysis:');
console.log('Total customer IDs:', customerIds.length);
console.log('Unique customer IDs:', uniqueCustomerIds.length);

if (customerIds.length !== uniqueCustomerIds.length) {
  console.log('\n❌ DUPLICATE CUSTOMER IDs FOUND!');
  
  // Find duplicates
  const idCounts = {};
  customerIds.forEach(id => {
    idCounts[id] = (idCounts[id] || 0) + 1;
  });
  
  const duplicateIds = Object.entries(idCounts)
    .filter(([id, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);
  
  console.log('\nDuplicate customer IDs:');
  duplicateIds.slice(0, 5).forEach(([id, count]) => {
    console.log(`"${id}" appears ${count} times`);
  });
} else {
  console.log('✅ No duplicate customer IDs found');
}
