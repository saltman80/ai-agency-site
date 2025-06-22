const path = require('path');
const { promises: fs } = require('fs');

(async () => {
  const defaultDataDir = path.join(__dirname, 'data');
  const baseDataDir = process.env.BASE_DATA_PATH || process.argv[2] || defaultDataDir;

  try {
    await fs.mkdir(baseDataDir, { recursive: true });

    const sections = ['home', 'services', 'projects', 'about', 'contact'];
    let createdCount = 0;

    for (const section of sections) {
      const filePath = path.join(baseDataDir, `${section}.json`);
      try {
        await fs.access(filePath);
        // File exists: verify JSON validity
        try {
          const content = await fs.readFile(filePath, 'utf8');
          JSON.parse(content);
        } catch {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupPath = `${filePath}.bak-${timestamp}`;
          await fs.rename(filePath, backupPath);
          await fs.writeFile(filePath, JSON.stringify({}, null, 2), { encoding: 'utf8' });
          console.warn(`Warning: Invalid JSON in ${filePath}. Backed up to ${backupPath} and recreated.`);
          createdCount++;
        }
      } catch {
        // File missing: create atomically
        try {
          await fs.writeFile(filePath, JSON.stringify({}, null, 2), { flag: 'wx', encoding: 'utf8' });
          console.log(`Created missing AI file: ${filePath}`);
          createdCount++;
        } catch (err) {
          if (err.code !== 'EEXIST') throw err;
        }
      }
    }

    if (createdCount === 0) {
      console.log('All AI files are present and valid.');
    }
  } catch (error) {
    console.error('Error adding missing AI files:', error);
    process.exit(1);
  }
})();