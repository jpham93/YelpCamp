const express = require('express')
const router = express.Router({ mergeParams: true })  // needed to combine comments and campgrounds. Otherwise won't be about to locate id from 
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const middleware = require('../middleware')

// 1. NEW - get form for specific campground comments
router.get('/new', middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) console.log(err)
    else res.render('comments/new', { campground: foundCampground })
  })
})

// 2. CREATE - post form with information to campgrounds 
router.post('/', middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) console.log(err)
    else {
      Comment.create(req.body.comment, (err, newComment) => {
        if (err) console.log(err)
        else {
          // add username and id to comment
          newComment.author.id = req.user._id  // author and id are props of newComment's new schema
          newComment.author.username = req.user.username
          //save comment 
          newComment.save()
          foundCampground.comments.push(newComment)
          foundCampground.save()
          res.redirect(`/campgrounds/${req.params.id}`)
        }
      })
    }
  })
})

// 3. EDIT - get request for updating comments
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) res.redirect('back')
    else {
      res.render('/comments/edit', { campground_id: req.params.id, comment: foundComment })
    }
  })
})

// 4. UPDATE - put request for updating comment
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findOneAndUpdate({ _id: req.params.comment_id }, req.body.comment, (err, updatedComment) => {
    if (err) {
      res.redirect('back')
    } else {
      res.redirect(`/campgrounds/${req.params.id}`)
    }
  })
})

// 5. DESTROY - delete request for comment
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findOneAndRemove({ _id: req.params.comment_id }, (err) => {
    if (err) {
      res.redirect('back')
    } else {
      req.flash('success', 'Comment deleted')
      res.redirect(`/campgrounds/${req.params.id}`)
    }
  })
})

module.exports = router