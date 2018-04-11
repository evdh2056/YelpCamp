// SETUP *******************

//load all needed modules
var express 				= require("express"),
	app 					= express(),
	bodyParser 				= require("body-parser"),
	request 				= require("request"),
	mongoose 				= require("mongoose"),
	flash					= require("connect-flash"),
	passport                = require("passport"),
    LocalStrategy           = require("passport-local"),
	passportLocalMongoose   = require("passport-local-mongoose"),
	// load schema and models and seed.js
	Campgrounds 			= require("./models/campground.js"),
	Comment 				= require("./models/comment.js"),
	seedDB 					= require("./seed.js"),
	User                    = require("./models/user");

// load the routes.
var authRoutes 				= require("./routes/auth"),
	campgroundRoutes		= require("./routes/campgrounds"),
	commentRoutes			= require("./routes/comments");
	// indexRoutes				= require("./routes/index");

// the public directory serves Express
app.use(express.static("public"));
// console.log("- View engine is set to ejs");
app.set("view engine", "ejs");

// AUTHENTICATION WITH PASSPORT =======================
// add the express session for usage with passport in
app.use(require("express-session")({
    secret: "Just add anything you want.",
    resave: false,
    saveUninitialized: false
}));

// use flash (should be before the passport initialization)
app.use(flash());

// setup passport
app.use(passport.initialize());
app.use(passport.session());

// Give passport a stratey, in this case LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// methods responsible for coding and decoring the session, 
// taking the passwords from the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// This makes currentUser available in every route.
app.use(function(req,res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");	
	res.locals.success = req.flash("success");
	next();
});

// END AUTHENTICATION WITH PASSPORT =======================

// tell app to use the body parser.
app.use(bodyParser.urlencoded( { extended: true}));

// use the auth, campground and comment Routes.
app.use(authRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);
// app.use(indexRoutes);
// note: you can also define common parts of the routes so you don't have to use is in the get/post
// e.g. app.use("/campgrounds", campgroundroutes); or app.use("/campgrounds/:id/comments")
// the get would then be app.get("/", callback) or app.get("/new", callback)

// Connect to the database.
mongoose.connect("mongodb://localhost/yelpcampdb_v13");

// test db connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("- Mongodb connected")
});

// re-create the start/test database.
// seedDB();

// ROUTES *******************************************************************

// create home route
app.get("/", function(req, res) {
	// renders the home page.
	res.render("index");
});

// create default / missing page route.
app.get("*", function(req, res) {
	req.flash("error", "This page does not exist");
	res.redirect("/campgrounds");
});

// middleware for checking if the user is logged in.
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Server start *******************************
// and set listen port
app.listen(3000, function() {
	console.log("- YelpCamp Server started, listens to port 3000");
});
