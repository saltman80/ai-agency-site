const fs = require('fs/promises');
const path = require('path');

(async () => {
  const [target = 'data/ai.json'] = process.argv.slice(2);
  const projectRoot = process.cwd();
  const filePath = path.resolve(projectRoot, target);
  const relativePath = path.relative(projectRoot, filePath);
  if (relativePath.startsWith('..')) {
    console.error(`Invalid target path: ${target}`);
    process.exit(1);
  }
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const defaultContent = JSON.stringify([], null, 2);
    await fs.writeFile(filePath, defaultContent, { flag: 'wx', encoding: 'utf8' });
    console.log(`Created missing AI file at ${filePath}`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.log(`AI file already exists at ${filePath}`);
    } else {
      console.error(`Error ensuring AI file: ${error.message}`);
      process.exit(1);
    }
  }
})();