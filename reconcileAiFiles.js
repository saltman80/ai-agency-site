const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function getAllFiles(dir) {
    let entries;
    try {
        entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch (err) {
        throw new Error(`Unable to read directory: ${dir}\n${err.message}`);
    }
    let files = [];
    for (const entry of entries) {
        const res = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(await getAllFiles(res));
        } else if (entry.isFile()) {
            files.push(res);
        }
    }
    return files;
}

async function reconcile(inputDir, outputDir) {
    try {
        await fsp.access(inputDir);
    } catch (err) {
        console.error(`Input directory does not exist: ${inputDir}`);
        process.exit(1);
    }

    // Prevent overlapping directories
    const relOut = path.relative(inputDir, outputDir);
    if (!relOut.startsWith('..')) {
        console.error(`Output directory ${outputDir} is inside the input directory ${inputDir}. This can cause infinite loops. Please choose a different output directory.`);
        process.exit(1);
    }
    const relIn = path.relative(outputDir, inputDir);
    if (!relIn.startsWith('..')) {
        console.error(`Input directory ${inputDir} is inside the output directory ${outputDir}. This can cause infinite loops. Please choose different directories.`);
        process.exit(1);
    }

    const allFiles = await getAllFiles(inputDir);
    if (allFiles.length === 0) {
        console.warn(`No files found in input directory: ${inputDir}`);
        return;
    }

    await fsp.mkdir(outputDir, { recursive: true });

    const groups = new Map();

    for (const filePath of allFiles) {
        const rel = path.relative(inputDir, filePath);
        const dirname = path.dirname(rel);
        const filename = path.basename(rel);
        const match = filename.match(/^(.+?)\.part(\d+)(\..+)?$/);
        let baseName, part;
        if (match) {
            baseName = match[1] + (match[3] || '');
            part = parseInt(match[2], 10);
        } else {
            baseName = filename;
            part = null;
        }
        const groupKey = path.join(dirname, baseName);
        if (!groups.has(groupKey)) {
            groups.set(groupKey, { dirname, baseName, entries: [] });
        }
        groups.get(groupKey).entries.push({ path: filePath, part });
    }

    let writtenCount = 0;
    for (const [groupKey, group] of groups) {
        const { dirname, baseName, entries } = group;
        const targetDir = path.join(outputDir, dirname);
        await fsp.mkdir(targetDir, { recursive: true });
        const outPath = path.join(targetDir, baseName);

        const parts = entries.filter(e => e.part !== null);
        let toMerge;
        if (parts.length > 0) {
            const unnumbered = entries.filter(e => e.part === null);
            if (unnumbered.length > 0) {
                console.warn(`Ignoring ${unnumbered.length} unnumbered file(s) for ${groupKey}`);
            }
            const sortedParts = parts.sort((a, b) => a.part - b.part);
            // Validate sequential part numbers
            const partNumbers = sortedParts.map(e => e.part);
            const seen = new Set();
            let hasIssue = false;
            for (const num of partNumbers) {
                if (seen.has(num)) {
                    console.warn(`Duplicate part number ${num} for ${groupKey}`);
                    hasIssue = true;
                }
                seen.add(num);
            }
            const maxPart = partNumbers[partNumbers.length - 1];
            for (let i = 1; i <= maxPart; i++) {
                if (!seen.has(i)) {
                    console.warn(`Missing part number ${i} for ${groupKey}`);
                    hasIssue = true;
                }
            }
            if (hasIssue) {
                console.warn(`Proceeding with merging available parts for ${groupKey}`);
            }
            toMerge = sortedParts;
        } else {
            if (entries.length > 1) {
                console.warn(`Multiple files for ${groupKey}, merging by filename order`);
            }
            toMerge = entries.sort((a, b) => a.path.localeCompare(b.path));
        }

        // Merge using streams to avoid high memory usage
        const writeStream = fs.createWriteStream(outPath, { encoding: 'utf8' });
        for (let i = 0; i < toMerge.length; i++) {
            const entry = toMerge[i];
            try {
                await new Promise((resolve, reject) => {
                    const readStream = fs.createReadStream(entry.path, { encoding: 'utf8' });
                    readStream.on('error', err => reject(new Error(`Failed to read file: ${entry.path}\n${err.message}`)));
                    writeStream.on('error', err => reject(new Error(`Failed to write to ${outPath}\n${err.message}`)));
                    readStream.on('end', resolve);
                    readStream.pipe(writeStream, { end: false });
                });
            } catch (err) {
                console.error(err.message);
                process.exit(1);
            }
            if (i < toMerge.length - 1) {
                writeStream.write('\n');
            }
        }
        await new Promise((resolve, reject) => {
            writeStream.end(() => resolve());
            writeStream.on('error', reject);
        });

        console.log(`Reconciled: ${outPath}`);
        writtenCount++;
    }

    console.log(`Reconciliation complete. ${writtenCount} file(s) generated in ${outputDir}.`);
}

(async () => {
    const [, , inputArg, outputArg] = process.argv;
    const inputDir = inputArg ? path.resolve(inputArg) : path.resolve('ai_files');
    const outputDir = outputArg ? path.resolve(outputArg) : path.resolve('dist');
    try {
        await reconcile(inputDir, outputDir);
    } catch (err) {
        console.error(`Error during reconciliation:\n${err.stack}`);
        process.exit(1);
    }
})();