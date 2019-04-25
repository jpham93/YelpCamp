const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')

router.get('/', (req, res) => {
  res.render('landing')
})

/// AUTH ROUTES ///
// Register Route //
router.get('/register', (req, res) => { // show register form
  res.render('register')
})

router.post('/register', (req, res) => { // handle logic
  let newUser = new User({ username: req.body.username })
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      // console.log(err)
      req.flash('error', err.message) // username taken, passport can't be blank. This is thru Passport's error handling
      return res.redirect('/register')
    }
    passport.authenticate('local')(req, res, () => {
      req.flash('success', `Welcome to YelpCamp ${user.username}`)
      res.redirect('/campgrounds')
    })
  })
})

// Login Route //
router.get('/login', (req, res) => { // show register form
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/register',
}), (req, res) => {

})

// Logout Route //
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success', 'Logged you out!')
  res.redirect('/campgrounds')
})


module.exports = router