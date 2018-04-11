var express = require("express");
var router  = express.Router();
var Campgrounds = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js"); // note you can leave out index.js because ("../middlewer")

// console.log("- load the body-parser module")
var bodyParser = require("body-parser");
// tell app to use the body parser.
router.use(bodyParser.urlencoded( { extended: true}));

var methodOverride = require("method-override");
// tell router to use the method-override so if _method is passed as a parameter the value given
// (after the equal sign is treated like given (PUT or POST or whatever.)
router.use(methodOverride("_method"));

var expressSanitizer = require("express-sanitizer");
// should be after body parser
router.use(expressSanitizer());

// routes are added to the router object instead of the app object.

// REST INDEX route
router.get("/campgrounds", function(req, res) {
	// get the campgrounds from the database
	Campgrounds.find({}, function(err, allCampgrounds) {
		if (err) {
			console.log("Error reading campgrounds from database")
		} else
		{
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	})
});

// REST CREATE ROUTE
// uses the same url as the get - part of the REST convention,.
router.post("/campgrounds", middleware.isLoggedIn,function(req, res) {
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {
		name: req.body.name, 
		image: req.body.image, 
		description: req.body.description,
		author: author
	};
	console.log(newCampground);
	// push the name and image variable as new object to the database
	Campgrounds.create(newCampground, function(err, newlyCreated) {
		if (err) {
			console.log("Error inserting new campground to database");
		} else {
			// console.log(newlyCreated);
			// redirects to the get route of /campgrounds.
			// res.render("index", {campgrounds: allCampgrounds});
			res.redirect("/campgrounds");
		}
	});
});

// REST NEW ROUTE
router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res) {
	// renders the new.ejs.
	res.render("campgrounds/new");
});

// REST SHOW ROUTE
router.get("/campgrounds/:id", function(req, res) {
	// find the campground in the database - populate into the campground
	// console.log(req.params.id);
	Campgrounds.findById(req.params.id).populate("comments").exec(function(err, campgroundDetails) {
		if (err) {
			req.flash("error", "Campground not found!");
		} else {
			// render the show.ejs to show the campground details
			res.render("campgrounds/show", {campground: campgroundDetails});
		}
	});
});

// REST EDIT ROUTE
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
	Campgrounds.findById(req.params.id, function(err, foundCampground) {
		if (err) {
			console.log(err);
			req.flash("error", "Campground not found!");
		} else {
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});

// UPDATE ROUTE
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req,res) {
		//find and update the correct campground.
	    Campgrounds.findByIdAndUpdate(req.params.id, req.body.campground, function(err) {
        if (err) {
			// console.log(updatedCampground);
			req.flash("error", "Error updating campground!");
            res.redirect("/campgrounds");
        } else {
			req.flash("success", "You succesfully updated the campground!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY ROUTE
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res) {
	Campgrounds.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			console.log("Error removing the campground");
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "You succesfully deleted the campground!");
			res.redirect("/campgrounds");
		}
	});
});

// middleware for checking if the user is logged in.
// moved to middleware/index.js

// routes have been added to the router object and this now needs to be exported.
module.exports = router;