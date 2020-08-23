require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var session = require("express-session");
var findOrCreate = require('mongoose-findorcreate');
var GoogleStrategy = require('passport-google-oauth20').Strategy;


const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: 'Our key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Skab eller forbind til mongo database 
mongoose.connect('mongodb://localhost:27017/OAuthDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);

// Mongoose Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});

// Schema plugin
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// Mongoose Model
const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secret"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

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

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secret', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/explore');
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