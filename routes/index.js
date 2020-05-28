var express = require("express");
var router = express.Router();
var passport = require("passport");
var middleware = require("../middleware");
var User = require("../models/user");
var Category = require("../models/category");

router.get("/", function (req, res) {
    res.render("landing");
})
//show register form
router.get("/register", function (req, res) {
    res.render("register");
})

//handle sign up logic
router.post("/register", function (req, res) {
    var newUser = new User(
        {
            username: req.body.username,
            email: req.body.email,
        }
    );

    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            return res.render("register", { error: err.message });
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/");
        });
    });
});

//show my login form
router.get("/login", function (req, res) {
    res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/category",
    failureRedirect: "/login"
    // failureFlash: true,
    // successFlash: 'Welcome to Category Manager!'
}), function (req, res) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);   //to redirect user to previous url
    } else {
        res.redirect("/");
    }
});

//logout route
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

router.get("/category", function (req, res) {
    //get all the categories
    res.render('category');
})

router.post("/category", async function (req, res) {

    var category = new Category({ name: req.body.name })
    console.log(req.body.name);
    console.log(category);
    try {
        let newCategory = await category.save();
        console.log(newCategory);
        res.status(201).send({ response: `Category ${newCategory._id}` });
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err);
    }

})

module.exports = router;