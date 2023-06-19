//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const { log } = require('console');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const app = express();

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');

}


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});


// During save, documents are encrypted and then signed. During find, documents are authenticated and then decrypted

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));


app.get("/", (req, res) => {
    res.render("home")
});


app.get("/login", (req, res) => {
    res.render("login")
});


app.get("/register", (req, res) => {
    res.render("register")
});

app.post("/register", async (req, res) => {

    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    try {
        await newUser.save();
        res.render("secrets");
    } catch (e) {
        res.send(e.message);
    }

});

app.post("/login", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: email }).exec();
        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            }
        }
    } catch (e) {
        console.log(e.message);
    }

});




app.listen(3000, () => {
    console.log("Server started on port 3000");
});


