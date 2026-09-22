const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Replace $ followed by { or variable
      content = content.replace(/\$\$\{/g, '৳${');
      // For JSX like ${food.price}
      content = content.replace(/\$\{([a-zA-Z0-9_.]+)\.toFixed\(2\)\}/g, '৳{$1.toLocaleString()}');
      // For standalone $
      content = content.replace(/>\$({\w)/g, '>৳$1');
      content = content.replace(/>\$([0-9]+)/g, '>৳$1');
      content = content.replace(/>\$\{/g, '>৳${');
      // Fix .toFixed(2) in general
      content = content.replace(/\.toFixed\(2\)/g, '.toLocaleString()');

      // Specifically check strings like `Add $${...}`
      content = content.replace(/Add \$\$\{/g, 'Add ৳${');
      content = content.replace(/`Place Order — \$\$\{/g, '`Place Order — ৳${');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'frontend/src'));
