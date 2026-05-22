import fs from 'fs';
import path from 'path';

// Target the root public folder containing all your artist folders
const publicDir = './public/'; 

let deletedCount = 0;

const removeOldImages = (dir) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // If it's a folder, look inside it
      removeOldImages(fullPath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      // If it's a JPG or PNG, delete it
      try {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Deleted: ${fullPath}`);
        deletedCount++;
      } catch (err) {
        console.error(`❌ Failed to delete ${fullPath}:`, err);
      }
    }
  });
};

console.log('扫 🧹 Starting cleanup of old JPG and PNG files...');
removeOldImages(publicDir);
console.log(`\n✅ Done! Successfully removed ${deletedCount} old image files.`);