var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose")
var userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique:true, 
        required:true
    },
    password: String,
    email:{ 
        type: String,  
        unique:true,
        required:true
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);