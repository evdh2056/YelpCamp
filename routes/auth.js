var express 	= require("express");
var router  	= express.Router();
var User 		= require("../models/user");
var flash		= require("connect-flash");
var passport 	= require("passport");

// AUTHORIZATION ROUTES ======================================================
// register routes
router.get("/register", function(req, res){
	res.render("users/register");
});

router.post("/register", function(req, res) {
	var newUser = new User({username: req.body.username});
	// if the user does not exist the user is added.
	User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
		if (err) {
			// if there is an error render the register page and return
			// console.log("error returning the body" + err);
			req.flash("error", err.message);
			return res.redirect("/register");
		} else {
			// passport.authenticate will log the user in, takes care of the session, store the information and runs the serializeUser method.
			// we use the local strategy here but we can change that and for example use the google or twitter strategy.
			passport.authenticate("local")(req, res, function() {
				console.log("User " + req.body.username + " is added");
				req.flash("success", "Congratulations " + req.body.username + ". You succesfully signe up for Yelpcamp!");
				res.redirect("/campgrounds");
			});
		};
	});
});

// login routes
router.get("/login", function(req, res){
	res.render("users/login");
});

// should be app.post(route, middleware, callback)
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function(req, res) {
	// this function could be omitted.
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "You logged out");
    res.redirect("/campgrounds");
});

// END AUTHORIZATION ROUTES ======================================================

// middleware for checking if the user is logged in.

module.exports = router;