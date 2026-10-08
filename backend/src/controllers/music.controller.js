const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");
const { uploadFile } = require("../services/storage.service")
const jwt = require("jsonwebtoken");

async function createMusic(req, res) {
    try {
        const { title } = req.body;
        const musicFile = req.files?.music?.[0] || req.file;
        const coverArtFile = req.files?.coverArt?.[0];

        if (!title) {
            return res.status(400).json({ message: "Track title is required" });
        }
        if (!musicFile) {
            return res.status(400).json({ message: "Audio file is required" });
        }

        const audioResult = await uploadFile(
            musicFile.buffer.toString('base64'),
            "yt-complete-backend/music",
            "music_"
        );

        let coverArtUrl = null;
        if (coverArtFile) {
            const coverResult = await uploadFile(
                coverArtFile.buffer.toString('base64'),
                "yt-complete-backend/cover-art",
                "cover_"
            );
            coverArtUrl = coverResult.url;
        }

        const music = await musicModel.create({
            uri: audioResult.url,
            title,
            artist: req.user.id,
            coverArt: coverArtUrl,
        });

        res.status(201).json({
            message: "Music created successfully",
            music: {
                id: music._id,
                _id: music._id,
                uri: music.uri,
                title: music.title,
                artist: music.artist,
                coverArt: music.coverArt,
            }
        });
    } catch (error) {
        console.error("Error creating music:", error);
        res.status(500).json({ message: error.message || "Failed to create music" });
    }
}

async function createAlbum(req,res) {
         const {title, musics} = req.body;

        const album = await albumModel.create({
            title, 
            artist: req.user.id,
            musics: musics,
        })

        res.status(201).json({
            message: "Album created successfully",
            album: {
                id: album._id,
                title: album.title,
                artist: album.artist,
                musics: album.musics,
            }
        })
}

async function getAllMusics(req,res) {
    const musics = await musicModel.find().skip(0).limit(100).populate("artist", "username email")

    res.status(200).json({
        message: "Musics fetched successfully",
        musics: musics,
    })
}

async function getAllAlbums(req, res){
    const albums = await albumModel.find().select("title artist").populate("artist", "username email")

    res.status(200).json({
        message: "Albums fetched successfully",
        albums: albums,
    })
}

async function getAlbumById(req,res){
    const albumId = req.params.albumId;

    const album = await albumModel.findById(albumId).populate("artist", "username email").populate("musics")

    return res.status(200).json({
        message: "Album fetched successfully",
        album: album,
    })
}

module.exports = { createMusic,createAlbum, getAllMusics, getAllAlbums, getAlbumById };