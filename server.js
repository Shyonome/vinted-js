require('dotenv').config();
const express = require('express');
const server = express();

const cors = require("cors");
server.use(cors());

const expressFormidable = require('express-formidable');
server.use(expressFormidable());

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const post = require('./routes/post.js');
server.use(post);

/*----------*/

const get = require('./routes/get.js');
server.use(get);

/*----------*/

server.all('*', (request, response) => {
    response.status(400).json({ message: "Page not found" });
});

server.listen(process.env.PORT, () => {
    console.log("Server start ! 😎");
});