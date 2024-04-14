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

    // Path to the OEBPS folder
    const oebpsPath = path.join(outputDirPath, 'OEBPS');

    // Read all HTML files in the OEBPS folder
    fs.readdir(oebpsPath, (err, files) => {
        if (err) {
            console.error('Error reading OEBPS folder:', err);
            process.exit(1);
        }

        files.forEach((file) => {
            if (path.extname(file) === '.html') {
                const htmlFilePath = path.join(oebpsPath, file);

                // Read the HTML file
                fs.readFile(htmlFilePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(`Error reading HTML file ${file}:`, err);
                        return;
                    }

                    // Load the HTML content into Cheerio
                    const $ = cheerio.load(data);

                    // Apply Bionic Reading style to the text content
                    $('p, h1, h2, h3, h4, h5, h6').each((index, element) => {
                        const text = $(element).text();
                        const bionicText = colorMode === 'black'
                            ? applyBionicReadingBlack(text, unfocusedOpacity)
                            : applyBionicReadingColor(text, boldColors, unfocusedOpacity);
                        $(element).html(bionicText);
                    });

                    // Write the modified content back to the HTML file
                    fs.writeFile(htmlFilePath, $.html(), 'utf8', (err) => {
                        if (err) {
                            console.error(`Error writing HTML file ${file}:`, err);
                        }
                    });
                });
            }
        });

        // Create a new EPUB file with Bionic prefix
        const prefix = colorMode === 'black' ? 'BionicB_' : 'BionicC_';
        const epubFileName = `${prefix}${name}.epub`;
        const epubFilePath = path.join(dir, epubFileName);
        
        const output = fs.createWriteStream(epubFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
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

        // Finalize the archive (i.e. we are done appending files, but streams have to finish yet)
        archive.finalize();
    });
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