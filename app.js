require('dotenv').config()

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSession = require("express-session");

//requiring models
var User = require('./models/user.js'),
    Category = require('./models/category');

//requiring routes
var indexRoutes = require("./routes/index")

var url = process.env.DATABASEURL || "mongodb://localhost:27017/category_manager";
mongoose.connect(url, { useNewUrlParser: true })
    .then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use('/public/images', express.static('.public/images'));
app.use('/public/javascripts/', express.static('./public/javascripts'));
app.use('/public/stylesheets/', express.static('./public/stylesheets'));
app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION
app.use(expressSession({
    secret: "Category Manager",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));//User.authenticate comes in with the passportlocalMongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
app.use("/", indexRoutes);

app.listen(process.env.PORT || 2000, function () {
    console.log("Server has started");
});