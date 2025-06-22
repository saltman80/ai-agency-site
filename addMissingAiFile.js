const fs = require('fs').promises;
const path = require('path');

function printHelp() {
  console.log('Usage: addMissingAiFile.js [--template <templatePath>] <filePath>');
  console.log('Options:');
  console.log('  --template <templatePath>  Path to JSON template file (absolute or relative to script directory)');
  console.log('  -h, --help                 Show this help message');
  process.exit(0);
}

async function ensureFile(targetPath, templatePath) {
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isDirectory()) {
      console.error(`? Path exists and is a directory: ${targetPath}`);
      process.exit(1);
    }
    console.log(`? File exists: ${targetPath}`);
    return;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`? Error accessing path: ${err.message}`);
      process.exit(1);
    }
    console.log(`??  File missing: ${targetPath}`);
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  let data = {};
  if (templatePath) {
    const tplPath = path.isAbsolute(templatePath)
      ? templatePath
      : path.resolve(__dirname, templatePath);
    try {
      const tplRaw = await fs.readFile(tplPath, 'utf8');
      data = JSON.parse(tplRaw);
    } catch (err) {
      console.error(`? Template error (${tplPath}): ${err.message}`);
      process.exit(1);
    }
  }

  const content = JSON.stringify(data, null, 2);
  try {
    await fs.writeFile(targetPath, content, 'utf8');
    console.log(`? Created file: ${targetPath}`);
  } catch (err) {
    console.error(`? Error writing file: ${err.message}`);
    process.exit(1);
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
  }

  let templatePath = null;
  let filePath = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--template') {
      if (args[i + 1]) {
        templatePath = args[i + 1];
        i++;
      } else {
        printHelp();
      }
    } else if (!filePath) {
      filePath = args[i];
    } else {
      console.warn(`??  Ignoring extra argument: ${args[i]}`);
    }
  }

  if (!filePath) {
    printHelp();
  }

  const projectRoot = path.resolve(process.cwd());
  const targetPath = path.resolve(projectRoot, filePath);
  const relative = path.relative(projectRoot, targetPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    console.error(`? Invalid file path (outside project root): ${filePath}`);
    process.exit(1);
  }

  await ensureFile(targetPath, templatePath);
})().catch(err => {
  console.error(`? Unexpected error: ${err.message}`);
  process.exit(1);
});