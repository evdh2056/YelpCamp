var Campgrounds = require("../models/campground");
var Comment = require("../models/comment");
var flash = require("connect-flash");

// all middleware methods

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Campgrounds.findById(req.params.id, function(err, foundCampground) {
			if (err) {
				res.redirect("campgrounds");
			} else {
				// does the user own the campground?
				// take care - foundCampground.author.id is an object and req.user._id is a string so === won't work.
				// fortunately mongoose has a method for the comparison .equals
				if (foundCampground.author.id.equals(req.user._id)) {
					next();  // then we move on the next
				} else {
					req.flash("error", "You don't have permission to do that!");
					res.redirect("back");
				}
			}
		});
	} else {
		// goes back to where the user came from
		req.flash("error", "You don't have permission to do that!");
		res.redirect("back");
	};
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, function(err, foundComment) {
			if (err) {
				console.log(err);
				res.send("back")
			} else {
				if (foundComment.author.id.equals(req.user._id)) {
					next(); // move on to next
				} else {
					res.send("back");
				}
			}
		});
	} else {
		// goes back to where the user came from
		res.redirect("/login"); // not needed due to the next()
	}
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
	};
	req.flash("error", "Please sign in first!"); // the flash message shows on the next page /login
    res.redirect("/login");
}

module.exports = middlewareObj;