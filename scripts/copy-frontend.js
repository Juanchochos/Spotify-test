const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'frontend', 'dist', 'frontend', 'browser');
const target = path.join(__dirname, '..', 'backend', 'frontend-dist');

if (!fs.existsSync(source)) {
  console.error(`Angular build output not found at: ${source}`);
  console.error('Run "npm run build --prefix frontend" first.');
  process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log(`Copied frontend build to ${target}`);
