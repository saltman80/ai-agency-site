const fs = require('fs').promises;
const path = require('path');

async function addMissingAiFiles(baseDir) {
  const requiredFiles = [
    {
      filePath: 'data/ai-plan.json',
      defaultContent: { plan: [] }
    },
    {
      filePath: 'data/services.json',
      defaultContent: []
    },
    {
      filePath: 'data/projects.json',
      defaultContent: []
    },
    {
      filePath: 'content/about.md',
      defaultContent: '# About\n\nWelcome to our AI agency.\n'
    },
    {
      filePath: 'data/contact.json',
      defaultContent: { email: '', phone: '' }
    }
  ];

  for (const { filePath, defaultContent } of requiredFiles) {
    const fullPath = path.resolve(baseDir, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    try {
      await fs.access(fullPath);
      if (path.extname(fullPath).toLowerCase() === '.json') {
        try {
          const data = await fs.readFile(fullPath, 'utf8');
          JSON.parse(data);
        } catch (err) {
          if (err.name === 'SyntaxError') {
            const content = typeof defaultContent === 'string'
              ? defaultContent
              : JSON.stringify(defaultContent, null, 2) + '\n';
            await fs.writeFile(fullPath, content, 'utf8');
            console.log(`Recreated malformed file: ${filePath}`);
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        const content = typeof defaultContent === 'string'
          ? defaultContent
          : JSON.stringify(defaultContent, null, 2) + '\n';
        await fs.writeFile(fullPath, content, 'utf8');
        console.log(`Created missing file: ${filePath}`);
      } else {
        throw err;
      }
    }
  }
}

if (require.main === module) {
  (async () => {
    const argv = process.argv.slice(2);
    let baseDir = __dirname;
    for (let i = 0; i < argv.length; i++) {
      if (argv[i] === '--base-path' || argv[i] === '-b') {
        if (i + 1 < argv.length) {
          baseDir = path.resolve(process.cwd(), argv[i + 1]);
          i++;
        } else {
          console.error('Error: --base-path requires a path argument');
          process.exit(1);
        }
      }
    }
    try {
      await addMissingAiFiles(baseDir);
    } catch (err) {
      console.error('Error adding missing AI files:', err);
      process.exit(1);
    }
  })();
}

module.exports = { addMissingAiFiles };