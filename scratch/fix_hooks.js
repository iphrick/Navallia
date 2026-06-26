const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, '..', 'src', 'hooks');
const files = fs.readdirSync(hooksDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(hooksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Change `const { user } = useAuth();` to `const { user, barbershopId } = useAuth();`
  // Sometimes it's `const { user, role } = useAuth();` -> `const { user, role, barbershopId } = useAuth();`
  
  if (content.includes('useAuth()') && content.includes('user?.barbershopId')) {
    // Inject barbershopId into the destructured useAuth call if not present
    if (!content.includes('barbershopId } = useAuth()')) {
      content = content.replace(/const\s*{\s*([^}]+?)\s*}\s*=\s*useAuth\(\)/g, (match, p1) => {
        if (!p1.includes('barbershopId')) {
          return `const { ${p1}, barbershopId } = useAuth()`;
        }
        return match;
      });
    }

    // Replace `user?.barbershopId` with `barbershopId`
    content = content.replace(/user\?\.barbershopId/g, 'barbershopId');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
