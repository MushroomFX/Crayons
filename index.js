const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load settings from settings.json file
const settingsPath = path.join(__dirname, 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

async function fetchImage(tags, x, y) {
    const response = await fetch(`https://source.unsplash.com/random/${x}x${y}/?${tags.join(",")}`);
    let imageUrl = response.url;
    imageUrl = imageUrl.replace('&fit=max', '&fit=crop');
    return imageUrl;
}

function downloadImage(imageUrl, localPath) {
    const fileStream = fs.createWriteStream(localPath);

    https.get(imageUrl, response => {
        response.on('data', chunk => {
            fileStream.write(chunk);
        });

        response.on('end', () => {
            fileStream.end();
            console.log('Image downloaded and saved:', localPath);
        });

        response.on('error', error => {
            console.error('Error downloading image:', error);
        });
    }).on('error', error => {
        console.error('Error initiating image request:', error);
    });
}

async function loadImages(amount) {

    const folderPath = path.join(__dirname, 'images');

    fs.mkdirSync('images', { recursive: true });

    for (let i = 0; i < amount; i++) {
        const imageUrl = await fetchImage(settings.tags, settings.x, settings.y);
        // console.log('Fetched image URL:', imageUrl);
        const localPath = path.join(__dirname, 'images', `image_${settings.tags.join("_")}_${i}.jpg`);
        downloadImage(imageUrl, localPath);
    }

    removeDuplicateImages(folderPath);
}

function calculateHash(filePath) {
    const hash = crypto.createHash('md5');
    const fileData = fs.readFileSync(filePath);
    hash.update(fileData);
    return hash.digest('hex');
}

function removeDuplicateImages(folderPath) {
    const imageHashes = {};

    fs.readdirSync(folderPath).forEach(fileName => {
        const filePath = path.join(folderPath, fileName);
        if (fs.statSync(filePath).isFile()) {
            const fileHash = calculateHash(filePath);
            if (imageHashes[fileHash]) {
                console.log(`Removing duplicate: ${filePath}`);
                fs.unlinkSync(filePath); // Delete the duplicate image
            } else {
                imageHashes[fileHash] = filePath;
            }
        }
    });
    
    process.exit();
}

loadImages(settings.fetches);
