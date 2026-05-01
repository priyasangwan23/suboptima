const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx') || dirFile.endsWith('.css') || dirFile.endsWith('.js')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const files = walkSync('../frontend/src');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace css background: white;
  content = content.replace(/background:\s*white;/g, 'background: var(--white);');
  content = content.replace(/background:\s*#fff;/g, 'background: var(--white);');
  content = content.replace(/background:\s*#ffffff;/g, 'background: var(--white);');
  
  // Replace jsx background: 'white'
  content = content.replace(/background:\s*'white'/g, "background: 'var(--white)'");
  content = content.replace(/background:\s*'#fff'/g, "background: 'var(--white)'");
  content = content.replace(/background:\s*'#ffffff'/g, "background: 'var(--white)'");

  // Replace text-main
  content = content.replace(/color:\s*#1e293b;/ig, 'color: var(--text-main);');
  content = content.replace(/color:\s*'#1e293b'/ig, "color: 'var(--text-main)'");

  // Replace text-muted
  content = content.replace(/color:\s*#64748b;/ig, 'color: var(--text-muted);');
  content = content.replace(/color:\s*'#64748b'/ig, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*#94a3b8;/ig, 'color: var(--text-muted);');
  content = content.replace(/color:\s*'#94a3b8'/ig, "color: 'var(--text-muted)'");

  // Replace border
  content = content.replace(/border:\s*1px solid #e2e8f0;/g, 'border: 1px solid var(--border);');
  content = content.replace(/border:\s*'1px solid #e2e8f0'/g, "border: '1px solid var(--border)'");
  
  // Replace input-bg
  content = content.replace(/background:\s*#f8fafc;/g, 'background: var(--input-bg);');
  content = content.replace(/background:\s*'#f8fafc'/g, "background: 'var(--input-bg)'");
  content = content.replace(/background:\s*#f1f5f9;/g, 'background: var(--input-bg);');
  content = content.replace(/background:\s*'#f1f5f9'/g, "background: 'var(--input-bg)'");

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Updated: ' + file);
  }
}
