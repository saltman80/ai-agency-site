const fs = require('fs').promises;
const path = require('path');

(async function addMissingAiFiles() {
  const aiDataDir = path.join(process.cwd(), 'data', 'ai');
  const requiredFiles = [
    { filename: 'home.json', content: { title: 'Home', sections: [] } },
    { filename: 'services.json', content: { title: 'Services', items: [] } },
    { filename: 'projects.json', content: { title: 'Projects', items: [] } },
    { filename: 'about.json', content: { title: 'About', team: [] } },
    { filename: 'contact.json', content: { title: 'Contact', details: {} } }
  ];

  await fs.mkdir(aiDataDir, { recursive: true });

  for (const file of requiredFiles) {
    const filePath = path.join(aiDataDir, file.filename);
    const fileData = JSON.stringify(file.content, null, 2);

    try {
      await fs.writeFile(filePath, fileData, { encoding: 'utf8', flag: 'wx' });
      console.log(`Created: ${file.filename}`);
    } catch (err) {
      if (err.code === 'EEXIST') {
        console.log(`Exists: ${file.filename}`);
      } else {
        throw err;
      }
    }
  }
})();