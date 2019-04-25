const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  methodOverride = require('method-override'),
  flash = require('connect-flash')

const seedDB = require('./seeds')

// Models //
const User = require('./models/user')

// Routes //
const commentRoutes = require('./routes/comments')
const campgroundRoutes = require('./routes/campgrounds')
const authRoutes = require('./routes/index')

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true })
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))  // safe way to use absolute path in case files get moved around
app.use(methodOverride('_method'))

// seedDB() // seed the db

// Passport Configuration //
app.use(require('express-session')({
  secret: 'This is the super secret page',
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// flash configuration //
app.use(flash());

// middleware for applying username to all routes that need user info
app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  next()
})

app.use(authRoutes)
app.use('/campgrounds', campgroundRoutes)  // uses /campgrounds as base router. So any routes defined in campgrounds is added on to /campgrounds/[additional routes]
app.use('/campgrounds/:id/comments/', commentRoutes)

app.listen(process.env.PORT || 3000, () => {
  console.log('Yelp Camp Server started. Now listening...')
})