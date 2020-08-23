const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}))

// express session
app.use(session({
    secret: 'Our key',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Skab eller forbind til mongo database 
mongoose.connect('mongodb://localhost:27017/passportUserDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);

// Mongoose Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// mongoose plugin fra passport
userSchema.plugin(passportLocalMongoose);

// Mongoose Model
const User = new mongoose.model('User', userSchema);

// Passport skaber en local strategi
passport.use(User.createStrategy());

// skab cookie og destruere cookie
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
    User.register({username: req.body.username}, req.body.password, function (err, newUser) {
    if (err) {
        console.log(err);
        res.redirect('/register');
    } else {
        passport.authenticate('local')(req, res, function () {
            res.redirect('/explore')
        });
    }        
    })
});

// login route
app.route('/login')

.get(function (req, res) {
    res.render('login');
})

.post(function (req, res) {
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    
    req.login(user, function (err) {
        if (err) {
          console.log(err);
        } else {
          passport.authenticate('local')(req, res, function () {
            res.redirect('/explore');
          });
        }
    });

});

// explore route
app.route('/explore')

.get(function (req, res) {
    if (req.isAuthenticated()) {
        res.render('explore')
    } else {
        res.redirect('/login')
    }
})

// server start
app.listen(3000, function () {
    console.log('Server er startede op ved port : 3000');
});