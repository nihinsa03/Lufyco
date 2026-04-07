const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, 'app/data/mockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

const mapping = [
    // Top 12
    { name: "SHIRTS", file: "SHIRTS.jpg" },
    { name: "JEANS", file: "JEANS.jpg" },
    { name: "TSHIRTS", file: "TSHIRTS.jpg" },
    { name: "CASUAL SHOES", file: "CASUAL SHOES.jpg" },
    { name: "SWEATER", file: "SWEATER.jpg" },
    { name: "SPORTS SHOES", file: "SPORTS SHOES.jpg" },
    { name: "TROUSERS", file: "TROUSERS.jpg" },
    { name: "KURTAS", file: "KURTAS.jpg" },
    { name: "JACKETS", file: "JACKETS.jpg" },
    { name: "WATCHES", file: "WATCHES.jpg" },
    { name: "BOTTLES", file: "BOTTLES.jpg" },
    { name: "PERFUME", file: "PERFUME.jpg" },

    // Bottom 12
    { name: "DRESSES", file: "DRESSES.jpg" },
    { name: "TOPS", file: "TOPS.jpg" },
    { name: "TROUSERS", file: "TROUSERS (2).jpg" },
    { name: "HEELS", file: "HEELS.jpg" },
    { name: "JACKETS", file: "JACKETS (2).jpg" },
    { name: "KURTAS", file: "KURTAS (2).jpg" },
    { name: "SAREES", file: "SAREES.jpg" },
    { name: "JEANS", file: "JEANS (2).jpg" },
    { name: "HANDBAGS", file: "HANDBAGS.jpg" },
    { name: "PERFUME", file: "PERFUME (2).jpg" },
    { name: "SPORTS SHOES", file: "SPORTS SHOES (2).jpg" },
    { name: "BOTTLES", file: "BOTTLES (2).jpg" }
];

let itemIndex = 0;
const lines = content.split('\n');
const newLines = lines.map(line => {
    if (line.includes('image: require(') && itemIndex < mapping.length) {
        const item = mapping[itemIndex];
        const idMatch = line.match(/id:\s*([^,]+)/);
        const genderMatch = line.match(/gender:\s*([^}\s]+)/);
        
        const idStr = idMatch ? `id: ${idMatch[1]}` : `id: 'cat_dyn_${itemIndex}'`;
        const genderStr = genderMatch ? `, gender: ${genderMatch[1]}` : '';
        
        itemIndex++;
        return `    { ${idStr}, name: '${item.name}', image: require('../../assets/images/categories/slider/${item.file}')${genderStr} },`;
    }
    return line;
});

fs.writeFileSync(mockDataPath, newLines.join('\n'));
console.log('Successfully paired ' + itemIndex + ' specific renamed images to exactly match the Figma design titles in mockData.ts!');
