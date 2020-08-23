const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}))

// Skab eller forbind til mongo database 
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Mongoose Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// save = encrypt
// find = decrypt
const secret = 'Thisisourkey'
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

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
    const user = new User({
        email: req.body.email,
        password: req.body.password
    });
    
    user.save(function (err) {
        res.render('explore')
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
            if (foundUser.password === req.body.password) {
                res.render('explore')
            }
        } else {
            res.redirect('login')
        }
    })
});

// server start
app.listen(3000, function () {
    console.log('Server er startede op ved port : 3000');
});