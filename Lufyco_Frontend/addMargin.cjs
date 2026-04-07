const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'app', 'screens');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const rnImportMatch = content.match(/import\s+{([^}]*)}\s+from\s+["']react-native["']/);
  if (rnImportMatch) {
    const imported = rnImportMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    let newImports = [];
    if (!imported.includes('Platform')) newImports.push('Platform');
    if (!imported.includes('StatusBar')) newImports.push('StatusBar');
    
    if (newImports.length > 0) {
      const allImports = imported.concat(newImports).join(', ');
      const newImportStatement = `import { ${allImports} } from "react-native"`;
      content = content.replace(rnImportMatch[0], newImportStatement);
      changed = true;
    }
  }

  const styleRegex = /((?:safeArea|safe|container)\s*:\s*\{[^}]*)(\})/g;
  
  content = content.replace(styleRegex, (match, p1, p2) => {
    if (p1.includes('paddingTop') && p1.includes('Platform.OS')) {
      return match;
    }
    changed = true;
    const prefix = p1.trim().endsWith('{') || p1.trim().endsWith(',') ? p1 : p1 + ', ';
    return `${prefix}paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 ${p2}`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

processDirectory(screensDir);
console.log('Done!');
