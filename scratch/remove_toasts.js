const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, '..', 'src', 'hooks');
const files = fs.readdirSync(hooksDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(hooksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  const lines = content.split('\n');
  const newLines = lines.filter(line => !line.includes('error("Erro",'));

  if (lines.length !== newLines.length) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`Removed error toasts from ${file}`);
  }
}
