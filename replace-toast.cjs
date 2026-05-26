const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('from "sonner"')) {
        content = content.replace(/import\s+\{\s*toast\s*\}\s+from\s+["']sonner["'];?/g, 'import { toast } from "@/lib/toast";');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir('./src');
console.log('Replaced sonner imports.');
