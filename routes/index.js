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
    Category.find({}, function (err, allcategories) {
        if (err) {
            console.log(err)
        }
        else {
            res.render("category", { categories: allcategories, currentUser: req.user });
        }
    })
})

router.post("/category",middleware.isLoggedIn, async function (req, res) {
    let parent = req.body.parent ? req.body.parent : null;
    const category = new Category({ name: req.body.name, parent })
    console.log(req.body.name);
    console.log(category);
    try {
        let newCategory = await category.save();
        buildAncestors(newCategory._id, parent);
        console.log(newCategory);
        res.status(201).send({ response: `Category ${newCategory._id}` });
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err);
    }

})

const buildAncestors = async (id, parent_id) => {
    let ancest = [];
    try {
        let parent_category = await Category.findOne({ "_id": parent_id }, { "name": 1, "slug": 1, "ancestors": 1 }).exec();
        if (parent_category) {
            const { _id, name, slug } = parent_category;
            const ancest = [...parent_category.ancestors];
            ancest.unshift({ _id, name, slug })
            const category = await Category.findByIdAndUpdate(id, { $set: { "ancestors": ancest } });
        }
    } catch (err) {
        console.log(err.message)
    }
}
module.exports = router;