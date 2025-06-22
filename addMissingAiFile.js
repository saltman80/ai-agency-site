const fs = require('fs');
const path = require('path');

const rawFileName = process.argv[2] || 'ai-config.json';
const safeNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.json$/;
if (rawFileName !== path.basename(rawFileName) || !safeNameRegex.test(rawFileName)) {
  console.error('Error: Invalid file name. Only .json files with alphanumeric characters, dots, underscores, and hyphens are allowed, and no path separators.');
  process.exit(1);
}
const fileName = rawFileName;
const filePath = path.resolve(process.cwd(), fileName);

const defaultConfig = {
  apiKey: '',
  endpoint: 'https://api.your-ai-endpoint.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1500
};

try {
  if (fs.existsSync(filePath)) {
    console.log(`${fileName} already exists.`);
  } else {
    fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2), { encoding: 'utf8', mode: 0o600 });
    console.log(`Created ${fileName} with permissions 600.`);
  }

  const gitignorePath = path.resolve(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const lines = content.split(/\r?\n/);
    if (!lines.includes(fileName)) {
      fs.appendFileSync(gitignorePath, `${fileName}\n`, 'utf8');
      console.log(`Appended ${fileName} to .gitignore.`);
    }
  } else {
    console.warn(`Warning: .gitignore not found. Please add ${fileName} to .gitignore to avoid committing sensitive data.`);
  }
} catch (error) {
  console.error(`Error handling ${fileName}:`, error);
  process.exit(1);
}