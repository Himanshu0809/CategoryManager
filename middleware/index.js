//add category model
var Category=require('../models/category')
//all the middlewares goes here

var middlewareObj = {};

middlewareObj.checkCategoryOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Category.findOne({ slug: req.params.slug }, function (err, foundCategory) {
            if (err || !foundCategory) {
                res.redirect("back")
            } else {
                //does user own the category
                if (foundCategory.user.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        console.log("You must be logged in to do that")
        //if the user is not logged in we will do this
        res.redirect("back");
        //it wil redirect the user to the previous page
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log("You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;