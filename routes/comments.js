var express 	= require("express");
var router  	= express.Router();
var Campgrounds = require("../models/campground");
var Comment 	= require("../models/comment");
var flash		= require("connect-flash");
var middleware 	= require("../middleware/index.js"); // note you can leave out index.js because ("../middlewer")

// ================== COMMENTS ROUTES========================

// NEW ROUTE
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req, res) {
	Campgrounds.findById(req.params.id, function(err, campgroundDetails) {
		if (err) {
			console.log("Error finding details of the campground");
		} else {
			// console.log(campgroundDetails);
			// render the show.ejs to show the campground details
			res.render("comments/new", {campground: campgroundDetails});
		}
	});
});

// CREATE ROUTE
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req, res) {
	// first find the campground.
	// console.log(req.user._id);
	Campgrounds.findById(req.params.id, function(err, campground){
		var author = req.user._id;
		// console.log(author);
		var text = req.body.comment.text;
		// you can also use req.body.comment and pass this.
		if (err) {
			console.log(err);
			res.redirect("/campgrounds:");
		} else {
			// console.log("Trying to create a comment");
			Comment.create({author,text}, function(err, comment) {
				// console.log("This is the comment" + comment);
				if(err){
					console.log(err);
				} else {
					// add the username and id to the comment.
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//add/save the comment
					comment.save();
					// add/save the comment with the campground
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "You succesfully added a comment!");
					res.redirect("/campgrounds/" + campground._id);
				}
			}); // end create.
		}		
	});
});

// EDIT ROUTE

router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
	// req.params.id contains the id of the comment.
	// console.log(req.params.id);
	// console.log(req.body.comment);
	Comment.findById(req.params.comment_id, function(err, foundComment) {
		if (err) {
			console.log(err);
			req.flash("error", "Error finding the comment");
			res.redirect("back");
		} else {
			// render the edit.ejs to show the comment
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment} );
		}
	});
});

// UPDATE ROUTE
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req,res) {
	// console.log(req.params.id);
	// console.log(req.body.comment);
	// find and update the correct comment.
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err) {
		if (err) {
			console.log(err);
			res.redirect("back");
		} else {
			req.flash("success", "You succesfully changed the comment!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err) {
		if (err) {
			console.log("Error removing the comment");
			res.redirect("back");
		} else {
			req.flash("success", "You succesfully deleted the comment!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// ===================END COMMENTS ROUTES =====================
// middleware for checking ownership of the comment.
// move to index.js

// middleware for checking if the user is logged in.
// moved to index.js

module.exports = router;