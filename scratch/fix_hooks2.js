const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, '..', 'src', 'hooks');
const files = fs.readdirSync(hooksDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(hooksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  if (content.includes('user.barbershopId')) {
    content = content.replace(/user\.barbershopId/g, 'barbershopId');
    modified = true;
  }

  // Also fix components that might have similar issues if needed, but let's start with hooks
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
