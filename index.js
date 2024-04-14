const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const cheerio = require('cheerio');
const archiver = require('archiver');

// Check if the EPUB file is provided as an argument
if (process.argv.length < 3) {
    console.log('Please provide the path to the EPUB file as an argument.');
    process.exit(1);
}

// Get the EPUB file path from the command-line argument
const epubFilePath = process.argv[2];

// Get the color mode from the command-line argument
const colorMode = process.argv.includes('--black') ? 'black' : 'color';

// Extract the file name and directory from the EPUB file path
const { dir, name, ext } = path.parse(epubFilePath);

// Create the ZIP file path by changing the extension to .zip
const zipFilePath = path.join(dir, `${name}.zip`);

// Create the output directory path
const outputDirPath = path.join(__dirname, name);

// Array of colors for the bold parts
const boldColors = ['#604E31', '#742A4A', '#6DB1FF', '#4AC069'];

// Default opacity for the unfocused parts
const unfocusedOpacity = 0.7;

// Copy the EPUB file to the ZIP file path
fs.copyFile(epubFilePath, zipFilePath, (err) => {
    if (err) {
        console.error('Error copying EPUB file:', err);
        process.exit(1);
    }

    console.log('EPUB file copied to ZIP file successfully.');

    // Create a new instance of AdmZip
    const zip = new AdmZip(zipFilePath);

    // Extract the ZIP file to the output directory
    zip.extractAllTo(outputDirPath, true);

    console.log('ZIP file extracted successfully.');

    // Delete the ZIP file
    fs.unlink(zipFilePath, (err) => {
        if (err) {
            console.error('Error deleting ZIP file:', err);
        } else {
            console.log('ZIP file deleted successfully.');
        }
    });

    // Function to apply Bionic Reading style to HTML and XHTML files recursively
    function applyBionicReadingToFiles(folderPath) {
        fs.readdirSync(folderPath).forEach((file) => {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);

            // Recursively process subdirectories
            if (stats.isDirectory()) {
                applyBionicReadingToFiles(filePath);
            } else if (stats.isFile() && (path.extname(file) === '.html' || path.extname(file) === '.xhtml')) {
                // Read the HTML or XHTML file
                const data = fs.readFileSync(filePath, 'utf8');

                // Load the HTML or XHTML content into Cheerio
                const $ = cheerio.load(data);

                // FIXME: Using .text() will make a links invalid
                // Apply Bionic Reading style to the text content
                $('a, p, h1, h2, h3, h4, h5, h6, li, th, td').each((index, element) => {
                    const text = $(element).text();
                    const bionicText = colorMode === 'black'
                        ? applyBionicReadingBlack(text, unfocusedOpacity)
                        : applyBionicReadingColor(text, boldColors, unfocusedOpacity);
                    $(element).html(bionicText);
                });

                // Write the modified content back to the file
                fs.writeFileSync(filePath, $.html(), 'utf8');
            }
        });
    }

    // Apply Bionic Reading style to HTML and XHTML files recursively in the decompressed folder
    applyBionicReadingToFiles(outputDirPath);

    // Create a new EPUB file with Bionic prefix
    const prefix = colorMode === 'black' ? 'BionicB_' : 'BionicC_';
    const epubFileName = `${prefix}${name}.epub`;
    const epubFilePath = path.join(dir, epubFileName);

    const output = fs.createWriteStream(epubFilePath);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // Listen for all archive data to be written
    output.on('close', () => {
        console.log(`EPUB file created: ${epubFilePath}`);

        // Delete the decompressed folder
        fs.rm(outputDirPath, { recursive: true, force: true }, (err) => {
            if (err) {
                console.error('Error deleting decompressed folder:', err);
            } else {
                console.log('Decompressed folder deleted successfully.');
            }
        });
    });

    // Catch warnings
    archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
            console.warn(err);
        } else {
            throw err;
        }
    });

    // Catch errors
    archive.on('error', (err) => {
        throw err;
    });

    // Pipe archive data to the output file
    archive.pipe(output);

    // Append the decompressed EPUB folder to the archive
    archive.directory(outputDirPath, false);

    // Finalize the archive
    archive.finalize();
});

// Function to apply Bionic Reading style to the text (black mode)
function applyBionicReadingBlack(text, opacity) {
    const words = text.split(/(\W+)/);
    const bionicWords = words.map((word) => {
        if (!/\w/.test(word)) {
            return word;
        }
        const halfLength = Math.ceil(word.length / 2);
        const firstHalf = `<b>${word.slice(0, halfLength)}</b>`;
        const secondHalf = `<span style="color: rgba(0, 0, 0, ${opacity});">${word.slice(halfLength)}</span>`;
        return `${firstHalf}${secondHalf}`;
    });
    return bionicWords.join('');
}

// Function to apply Bionic Reading style to the text (color mode)
function applyBionicReadingColor(text, boldColors, opacity) {
    let boldColorIndex = 0;
    const words = text.split(/(\W+)/);
    const bionicWords = words.map((word) => {
        if (!/\w/.test(word)) {
            return word;
        }
        const halfLength = Math.ceil(word.length / 2);
        const firstHalf = `<b style="color: ${boldColors[boldColorIndex]};">${word.slice(0, halfLength)}</b>`;
        const secondHalf = `<span style="color: rgba(0, 0, 0, ${opacity});">${word.slice(halfLength)}</span>`;
        boldColorIndex = (boldColorIndex + 1) % boldColors.length;
        return `${firstHalf}${secondHalf}`;
    });
    return bionicWords.join('');
}