
require('dotenv').config();
const bodyParser = require("body-parser")
const express = require("express");
const mongoose = require("mongoose");
const secretKey = require('./config/secretKey');
const cookieParser = require("cookie-parser");

const app = express();

const {PORT, MONGO_URI} = process.env;

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('jwt-secret', secretKey.secretKey)

mongoose.connect(MONGO_URI, { useNewUrlParser: true})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function(){
    console.log('We are connected!')
})




// configure api router

app.use('/api', require('./routers/api'))


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
