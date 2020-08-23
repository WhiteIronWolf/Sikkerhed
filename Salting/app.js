const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;
const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}))

// Skab eller forbind til mongo database 
mongoose.connect('mongodb://localhost:27017/bcryptUserDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Mongoose Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Mongoose Model
const User = new mongoose.model('User', userSchema);

// index route
app.route('/')

.get(function (req, res) {
    res.render('index');
})

// register route
app.route('/register')

.get(function (req, res) {
    res.render('register');
})

.post(function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        
        user.save(function (err) {
            res.render('explore')
        });        
    });
});

// login route
app.route('/login')

.get(function (req, res) {
    res.render('login');
})

.post(function (req, res) {
    User.findOne({email: req.body.email}, function(err, foundUser){
        if (err) {
            console.log(err);
        } else if (foundUser) {
            bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
                if (result == true) {
                    res.render('explore');
                }
            });
        } else {
            res.redirect('login')
        }
    })
});

// server start
app.listen(3000, function () {
    console.log('Server er startede op ved port : 3000');
});