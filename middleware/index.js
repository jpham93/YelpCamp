const Campground = require('../models/campground')
const Comment = require('../models/comment')

let middlewareObj = {}

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
  // is user logged in
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        res.flash('error', 'Campground not found')
        res.redirect('/campgrounds')
      }
      else {
        // does user own campground?
        if (foundCampground.author.id.equals(req.user._id)) { // foundCampground property is actually a mongoose object, not string. Must use method instead of '==='
          next()
        } else {
          res.flash('error', "You don't have permission to do that!")
          res.redirect('back')
        }
      }
    })
  } else {  // if user is not logged in
    req.flash('error', 'You need to be logged in to do that!')
    res.redirect('back')  // redirects user back to previous page
  }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
  // is user logged in
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        res.redirect('/campgrounds')
      }
      else {
        // does user own comment?
        if (foundComment.author.id.equals(req.user._id)) { // foundCampground property is actually a mongoose object, not string. Must use method instead of '==='
          next()
        } else {
          req.flash('error', "You don't have permission to do that!")
          res.redirect('back')
        }
      }
    })
  } else {  // if user is not logged in
    req.flash('error', 'You need to be logged in to do that!')
    res.redirect('back')  // redirects user back to previous page
  }
}

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error', 'You need to be logged in to do that!')
  res.redirect('/login')
}

module.exports = middlewareObj