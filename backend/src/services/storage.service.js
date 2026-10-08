const {ImageKit} = require("@imagekit/nodejs")

const ImageKItClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
})

async function uploadFile(file, folder = "yt-complete-backend/music", fileNamePrefix = "music_") {
    const result = await ImageKItClient.files.upload({
        file,
        fileName: `${fileNamePrefix}${Date.now()}`,
        folder,
    });

    return result;
}

module.exports = { uploadFile }; 