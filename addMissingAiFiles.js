const fs = require('fs').promises;
const path = require('path');

const projectRoot = path.resolve(__dirname);
const verbose = process.argv.includes('--verbose');

const logger = {
  info: (...args) => { if (verbose) console.log(...args); },
  error: (...args) => console.error(...args)
};

let hadErrors = false;

const requiredDirs = ['data', 'logs'];
const fileSpecs = [
  {
    filePath: path.join(projectRoot, 'data', 'services.json'),
    content: JSON.stringify([
      {
        id: 1,
        title: 'AI Consulting',
        description: 'Expert guidance to integrate AI into your business.',
        icon: '?'
      }
    ], null, 2)
  },
  {
    filePath: path.join(projectRoot, 'data', 'projects.json'),
    content: JSON.stringify([
      {
        id: 1,
        title: 'Project Name',
        description: 'Brief description of the project.',
        image: ''
      }
    ], null, 2)
  },
  {
    filePath: path.join(projectRoot, 'data', 'about.json'),
    content: JSON.stringify({
      title: 'About Us',
      description: 'We are an AI agency specializing in cutting-edge solutions.',
      team: [
        {
          name: 'John Doe',
          role: 'Lead AI Engineer',
          photo: ''
        }
      ]
    }, null, 2)
  },
  {
    filePath: path.join(projectRoot, 'data', 'contact.json'),
    content: JSON.stringify({
      email: 'contact@aiagency.com',
      phone: '+1 (555) 123-4567',
      address: '123 AI Street, Tech City',
      socials: {
        linkedin: '',
        twitter: '',
        instagram: ''
      }
    }, null, 2)
  },
  {
    filePath: path.join(projectRoot, '.env'),
    content: 'API_KEY=\n'
  },
  {
    filePath: path.join(projectRoot, '.env.example'),
    content: 'API_KEY=your_api_key_here\n'
  },
  {
    filePath: path.join(projectRoot, 'README.md'),
    content: '# AI Agency\n\nA static, single-page website for an AI agency with dark-theme neon accents, glassmorphism UI, advanced animations, and fully responsive design.\n'
  },
  {
    filePath: path.join(projectRoot, 'CHANGELOG.md'),
    content: '# Changelog\n\nAll notable changes to this project will be documented in this file.\n'
  },
  {
    filePath: path.join(projectRoot, 'LICENSE'),
    content: `MIT License

Copyright (c) ${new Date().getFullYear()} AI Agency

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
`
  },
  {
    filePath: path.join(projectRoot, '.gitignore'),
    content: `node_modules/
.env
dist/
.DS_Store
`
  },
  {
    filePath: path.join(projectRoot, 'sample.csv'),
    content: 'id,name,value\n1,Sample,123\n'
  },
  {
    filePath: path.join(projectRoot, 'sample.txt'),
    content: 'This is a sample text file.\n'
  },
  {
    filePath: path.join(projectRoot, 'logs', '.gitkeep'),
    content: ''
  }
];

(async () => {
  for (const dir of requiredDirs) {
    const dirFull = path.join(projectRoot, dir);
    try {
      await fs.mkdir(dirFull, { recursive: true });
      logger.info(`Ensured directory: ${dirFull}`);
    } catch (err) {
      logger.error(`Error creating directory ${dirFull}:`, err);
      hadErrors = true;
    }
  }

  for (const spec of fileSpecs) {
    const filePath = spec.filePath;
    try {
      await fs.access(filePath);
      logger.info(`Exists: ${filePath}`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        try {
          await fs.writeFile(filePath, spec.content, 'utf8');
          logger.info(`Created: ${filePath}`);
        } catch (err2) {
          logger.error(`Error creating file ${filePath}:`, err2);
          hadErrors = true;
        }
      } else {
        logger.error(`Error accessing file ${filePath}:`, err);
        hadErrors = true;
      }
    }
  }

  if (hadErrors) {
    process.exit(1);
  }
})();