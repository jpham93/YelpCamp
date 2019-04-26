const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const middleware = require('../middleware')

//1. INDEX - show all campgrounds
router.get('/', (req, res) => {
  // get all campgrounds from db
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(err, 'INDEX route')
    } else {
      res.render('campgrounds/index', { campgrounds: allCampgrounds })
    }
  })
})

//2. NEW - show form to create new campground
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

//3. CREATE - add new campground to DB
router.post('/', middleware.isLoggedIn, (req, res) => {  // different routes because one is GET and POST
  // get data from form and add to campgrounds array
  let name = req.body.name
  let price = req.body.price
  let image = req.body.image
  let description = req.body.description
  let author = {
    id: req.user._id,
    username: req.user.username
  }
  let newCampground = { name: name, image: image, description: description, author: author, price: price }
  // create new campground and save to db
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      console.log(err, 'CREATE route')
    } else {
      res.redirect(`/campgrounds/${newlyCreated._id}`)
    }
  })
})

//4. SHOW - shows info about one campground a time
router.get('/:id', (req, res) => {

  // find the campground with provided ID
  Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
    if (err) {
      console.log(err, 'SHOW route')
    } else {
      // render show temlate with that campground
      res.render('campgrounds/show', { campground: foundCampground })
    }
  })
})

//5. EDIT - GET req to provide form for campground editting
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    res.render('campgrounds/edit', { campground: foundCampground })
  })
})

//6. UPDATE - PUT req of the new edits made to campground
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  // find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, { new: true }, (err, updatedCampground) => {
    if (err) {
      console.log(err, 'UPDATE Route')
      res.redirect('/campgrounds')
    }
    else {
      res.redirect(`/campgrounds/${req.params.id}`)
    }
  })
})

// 7. DESTROY - DELETE req of campground
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findOneAndRemove({ _id: req.params.id }, req.body.comment, (err, campgroundRemoved) => {
    if (err) res.redirect('/campgrounds')
    Comment.deleteMany({ _id: { $in: campgroundRemoved.comments } }, (err) => {
      if (err) console.log(err, 'DESTROY route')
      res.redirect('/campgrounds')
    })
  })
})

module.exports = router