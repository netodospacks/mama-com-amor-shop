const fs = require('fs');

let content = fs.readFileSync('src/data/catalog.ts', 'utf8');

// 1. Extract DIA_DOS_NAMORADOS items
const start = content.indexOf('DIA_DOS_NAMORADOS: [');
const end = content.indexOf('PRODUTOS: [');
// The array text for DIA_DOS_NAMORADOS
let namoradosText = content.substring(start, end);

// Find the actual closing bracket of the array
const bracketEnd = namoradosText.lastIndexOf('],');
const namoradosArrayStr = namoradosText.substring('DIA_DOS_NAMORADOS: ['.length, bracketEnd);

// 2. Remove isNew: true,
let updatedNamorados = namoradosArrayStr.replace(/isNew:\s*true,\s*/g, '');

// 3. Update KIT 8 price
updatedNamorados = updatedNamorados.replace(/name:\s*"KIT 08",\s*price:\s*"R\$\s*49,90"/g, 'name: "KIT 08", price: "R$ 79,90"');

// 4. Remove Kits 17, 18, 20, 25
// This might be tricky with regex, we can split by '{' and filter
const kitsToRemove = ['"KIT 17"', '"KIT 18"', '"KIT 20"', '"KIT 25"'];
let items = updatedNamorados.split(/(?=\n\s*\{\s*id: "dn-)/);

items = items.filter(item => !kitsToRemove.some(k => item.includes(`name: ${k}`)));
let finalNamoradosItems = items.join('').trim();

// Add a comma if it doesn't end with one (it shouldn't but let's be careful)
if (finalNamoradosItems.endsWith(',')) {
    finalNamoradosItems = finalNamoradosItems.substring(0, finalNamoradosItems.length - 1);
}

// 5. Move to KITS
// Find KITS
const kitsStart = content.indexOf('KITS: [');
const kitsEnd = content.indexOf('],', kitsStart);

let kitsArrayStart = content.substring(kitsStart, kitsStart + 'KITS: ['.length);
let kitsArrayInner = content.substring(kitsStart + 'KITS: ['.length, kitsEnd);

// Append the new kits
let newKitsInner = kitsArrayInner.trim() + ',\n    ' + finalNamoradosItems;
let newKitsSection = kitsArrayStart + '\n    ' + newKitsInner + '\n  ]';

// Replace KITS section
content = content.substring(0, kitsStart) + newKitsSection + content.substring(kitsEnd + 1);

// 6. Rename DIA_DOS_NAMORADOS to DIA_DOS_PAIS and make it empty
const toReplace = content.substring(start, end);
content = content.replace(toReplace, 'DIA_DOS_PAIS: [],\n  ');

fs.writeFileSync('src/data/catalog.ts', content);
console.log("Done");
