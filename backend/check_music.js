const mongoose = require("mongoose");
const musicModel = require("./src/models/music.model");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const musics = await musicModel.find();
    console.log(musics);
    mongoose.disconnect();
}
check();
