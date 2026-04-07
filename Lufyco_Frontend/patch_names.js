const fs = require('fs');
const path = require('path');

const mockDataPath = path.join('d:/My_PaidProjects/Lufyco_Clothing/Lufyco_Frontend/app/data/mockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

const newNames = [
    // Top 12
    "Shirts", "Jeans", "Tshirts", "Casual Shoes", "Sweater", "Sports Shoes",
    "Trousers", "Kurtas", "Jackets", "Watches", "Bottles", "Perfume",
    // Bottom 12
    "Dresses", "Tops", "Trousers", "Heels", "Jackets", "Kurtas",
    "Sarees", "Jeans", "Handbags", "Perfume", "Sports Shoes", "Bottles"
];

let nameIndex = 0;
// We need to match the objects in mockCategories.
// The objects look like: { id: '...', name: '...', image: require(...), gender: '...' }
// We can use a regex to replace the name property of the first 24 occurrences.

content = content.replace(/name:\s*['"][^'"]+['"]/g, (match) => {
    // Only replace inside mockCategories. We assume the first 24 names found in the file correspond to it,
    // but to be safe, we know mockCategories objects are the first things exported.
    if (nameIndex < newNames.length) {
        const rep = `name: '${newNames[nameIndex].toUpperCase()}'`;
        nameIndex++;
        return rep;
    }
    return match;
});

fs.writeFileSync(mockDataPath, content);
console.log('Updated ' + nameIndex + ' names in mockData!');
