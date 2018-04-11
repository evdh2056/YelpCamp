var mongoose                = require("mongoose"),
    passportLocalMongoose   = require("passport-local-mongoose");
 
var UserSchema = new mongoose.Schema({
    username: String,
    author: String
});

// Add the methods of the passportLocalMongoose package to the UserSchema.
UserSchema.plugin(passportLocalMongoose);

// export the model
module.exports = mongoose.model("User", UserSchema);