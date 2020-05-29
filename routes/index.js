var express = require("express");
var router = express.Router();
var passport = require("passport");
var middleware = require("../middleware");
var User = require("../models/user");
var Category = require("../models/category");
const buildAncestors = async (id, parent_id) => {
    let ancest = [];
    try {
        let parent_category = await Category.findOne({ "_id": parent_id }, { "name": 1, "slug": 1, "ancestors": 1 }).exec();
        if (parent_category) {
            const { _id, name, slug } = parent_category;
            const ancest = [...parent_category.ancestors];
            ancest.unshift({ _id, name, slug })
            const category = await Category.findByIdAndUpdate(id, { $set: { "ancestors": ancest } });
            // console.log(category);
        }
    } catch (err) {
        console.log(err.message)
    }
}
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
            res.redirect("/category");
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

router.get("/category", async function (req, res) {
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

router.get('/category', async (req, res) => {
    try {
        const result = await Category.find({ slug: req.query.slug })
            .select({
                "_id": false,
                "name": true,
                "ancestors.slug": true,
                "ancestors.name": true
            }
            ).exec();
        res.status(201).send({ "status": "success", "result": result });
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/add', async (req, res) => {
    res.render("category");
})

router.post('/category', async (req, res) => {
    let parent = req.body.parent ? req.body.parent : null;
    const category = new Category({ name: req.body.name, parent })
    try {
        let newCategory = await category.save();
        buildAncestors(newCategory._id, parent)
        // await category.save();
        // console.log("kjwdjeb");
        console.log(newCategory);
        res.status(201).send({ response: `Category ${newCategory._id}` });
    } catch (err) {
        res.status(500).send(err);
    }
});


router.get('/categories/:id/edit', middleware.checkCategoryOwnership, async (req, res) => {
    Category.findByIdAndUpdate(category_id, { $set: { "name": category_name, "slug": slugify(category_name) } });
    Category.update({ "ancestors._id": category_id },
        { "$set": { "ancestors.$.name": category_name, "ancestors.$.slug": slugify(category_name) } }, { multi: true });
})

router.delete("/categories/:id", middleware.checkCategoryOwnership, async (req, res)=>{
    err = await Category.findByIdAndRemove(category_id);
    if (!err)
        result = await Category.deleteMany({ "ancestors._id": category_id });
})
module.exports = router;