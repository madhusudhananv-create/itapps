const XLSX = require('xlsx');
const path = require('path');

// Load the Excel file
const filePath = path.join(__dirname, 'data', 'customer_feedback_analysis.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('🔍 Investigating Missing Columns for Project 202P001210');
console.log('======================================================\n');

// Find the specific project
const targetProject = data.find(row => row.proj_id === '202P001210');

if (!targetProject) {
  console.log('❌ Project ID "202P001210" not found in the data.');
  process.exit(1);
}

console.log('✅ Found Project ID: 202P001210');
console.log('\n📊 Complete Raw Data:');
console.log('=====================');
Object.entries(targetProject).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n🔍 Column Analysis:');
console.log('==================');

// Check all possible column variations
const expectedColumns = [
  'TIMELINE_ADHERENCE',
  'QUALITY_OF_DELIVERY', 
  'TIMELY_RESOURCE_FULFILLMENT',
  'RISK_MANAGEMENT',
  'THOUGHT_LEADERSHIP'
];

expectedColumns.forEach(column => {
  const value = targetProject[column];
  console.log(`${column}: ${value} (${typeof value})`);
});

console.log('\n📋 All Available Columns in Excel:');
console.log('==================================');
const allColumns = Object.keys(data[0] || {});
allColumns.forEach((column, index) => {
  console.log(`${index + 1}. ${column}`);
});

console.log('\n🔍 Checking for Similar Column Names:');
console.log('=====================================');

// Check if there are similar column names
const similarColumns = allColumns.filter(col => 
  col.toLowerCase().includes('timeline') ||
  col.toLowerCase().includes('quality') ||
  col.toLowerCase().includes('risk') ||
  col.toLowerCase().includes('thought') ||
  col.toLowerCase().includes('leadership')
);

similarColumns.forEach(col => {
  console.log(`Found similar column: ${col}`);
});

console.log('\n📊 Sample Data from First Few Records:');
console.log('======================================');
data.slice(0, 3).forEach((record, index) => {
  console.log(`\nRecord ${index + 1}:`);
  Object.entries(record).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
});

console.log('\n🔍 Checking Column Names in Excel Headers:');
console.log('===========================================');

// Get the actual headers from the worksheet
const range = XLSX.utils.decode_range(worksheet['!ref']);
const headers = [];
for (let col = range.s.c; col <= range.e.c; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
  const cell = worksheet[cellAddress];
  if (cell) {
    headers.push(cell.v);
  }
}

console.log('Actual Excel Headers:');
headers.forEach((header, index) => {
  console.log(`${index + 1}. ${header}`);
});

console.log('\n🔍 Checking for Column Name Variations:');
console.log('=======================================');

// Check for common variations
const variations = [
  'TIMELINE_ADHERENCE',
  'TIMELINE ADHERENCE',
  'Timeline_Adherence',
  'Timeline Adherence',
  'QUALITY_OF_DELIVERY',
  'QUALITY OF DELIVERY',
  'Quality_of_Delivery',
  'Quality Of Delivery',
  'TIMELY_RESOURCE_FULFILLMENT',
  'TIMELY RESOURCE FULFILLMENT',
  'Timely_Resource_Fulfillment',
  'Timely Resource Fulfillment',
  'RISK_MANAGEMENT',
  'RISK MANAGEMENT',
  'Risk_Management',
  'Risk Management',
  'THOUGHT_LEADERSHIP',
  'THOUGHT LEADERSHIP',
  'Thought_Leadership',
  'Thought Leadership'
];

variations.forEach(variation => {
  const found = headers.find(header => header === variation);
  if (found) {
    console.log(`✅ Found exact match: ${variation}`);
  }
});

console.log('\n🔍 Checking for Partial Matches:');
console.log('=================================');

headers.forEach(header => {
  if (header.toLowerCase().includes('timeline') ||
      header.toLowerCase().includes('quality') ||
      header.toLowerCase().includes('risk') ||
      header.toLowerCase().includes('thought') ||
      header.toLowerCase().includes('leadership')) {
    console.log(`Found partial match: ${header}`);
  }
}); 