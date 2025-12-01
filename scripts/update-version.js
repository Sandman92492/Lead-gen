import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swPath = path.join(__dirname, '../public/sw.js');
const timestamp = new Date().toISOString();

// Read current sw.js
let swContent = fs.readFileSync(swPath, 'utf-8');

// Remove old timestamp comment if exists
swContent = swContent.replace(/\/\/ Build timestamp: .+\n/, '');

// Add new timestamp comment at the top (after the first comment)
const lines = swContent.split('\n');
lines.splice(1, 0, `// Build timestamp: ${timestamp}`);
swContent = lines.join('\n');

// Write updated sw.js
fs.writeFileSync(swPath, swContent);
console.log(`✓ Updated sw.js with build timestamp: ${timestamp}`);
