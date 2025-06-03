// Simple test to debug CSV parsing
const csvLine = '"Jun 3, 2025, 2:49:17 AM","@Guillaume Deramchi","@Guillaume Deramchi","2025-06-03","Jeremy\'s office","","SLACK",""';

console.log('Testing CSV parsing for line:');
console.log(csvLine);

// Parse CSV line
const values = [];
let current = '';
let inQuotes = false;

for (let i = 0; i < csvLine.length; i++) {
  const char = csvLine[i];
  
  if (char === '"') {
    inQuotes = !inQuotes;
  } else if (char === ',' && !inQuotes) {
    values.push(current.trim());
    current = '';
  } else {
    current += char;
  }
}
values.push(current.trim());

console.log('\nParsed values:');
values.forEach((value, index) => {
  console.log(`  [${index}]: "${value}"`);
});

console.log('\nSpecific fields:');
console.log(`User ID: "${values[2]}"`);
console.log(`Date: "${values[3]}"`);
console.log(`Zone: "${values[4]}"`);

export {};
