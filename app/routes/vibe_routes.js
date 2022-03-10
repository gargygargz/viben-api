// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for vibes
const Vibe = require('../models/vibe')
const Likes = require('../models/likes')
const Favorites = require('../models/favorites')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existent document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { vibe: { title: '', text: 'foo' } } -> { vibe: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// CREATE
// POST /vibes
router.post('/vibes', requireToken, (req, res, next) => {
  // set owner of new vibe to be current user
  req.body.vibe.owner = req.user.id

  Vibe.create(req.body.vibe)
    // respond to successful `create` with status 201 and JSON of new "vibe"
    .then(vibe => {
      res.status(201).json({ vibe: vibe.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs t,he error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// INDEX (one user)
// GET /vibes
router.get('/vibes', requireToken, (req, res, next) => {
  Vibe.find({ owner: req.user._id }) // we added for users to only see what they created
    .populate('owner')
    .then((vibes) => {
      // `vibes` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return vibes.map((vibe) => vibe.toObject())
    })
  // respond with status 200 and JSON of the vibes
    .then((vibes) => res.status(200).json({ vibes: vibes }))
  // if an error occurs, pass it to the handler
    .catch(next)
})

// INDEX (all users)
// GET /vibes
router.get('/vibes/all', requireToken, (req, res, next) => {
  // show vibes from all users
  Vibe.find() // users see what all users created
    .populate('owner')
    // .populate({
    //   path: 'likes',
    //   populate: {
    //     path: 'owner'
    //   }
    // })
    .then((vibes) => {
      console.log(vibes)
      // `vibes` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return vibes.map((vibe) => vibe.toObject())
    })
  // respond with status 200 and JSON of the vibes
    .then((vibes) => res.status(200).json({ vibes: vibes }))
  // if an error occurs, pass it to the handler
    .catch(next)
})

// INDEX (favorites one user)
// GET /vibes/favorites
router.get('/vibes/favorites', requireToken, (req, res, next) => {
  Vibe.find() // we added for users to only see what they created
    .populate('owner')
    .then((vibes) => {
      // `vibes` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return vibes.map((vibe) => vibe.toObject())
    })
  // respond with status 200 and JSON of the vibes
    .then((vibes) => res.status(200).json({ vibes: vibes }))
  // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /vibes/5a7db6c74d55bc51bdf39793
router.get('/vibes/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Vibe.findById(req.params.id)
    .populate('owner')
    .then(handle404)
  // if `findById` is successful, respond with 200 and "vibe" JSON
    .then((vibe) => res.status(200).json({ vibe: vibe.toObject() }))
  // if an error occurs, pass it to the handler
    .catch(next)
})

// UPDATE
// PATCH /vibes/5a7db6c74d55bc51bdf39793
router.patch('/vibes/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.vibe.owner

  Vibe.findById(req.params.id)
    .then(handle404)
    .then((vibe) => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, vibe)

      // pass the result of Mongoose's `.update` to the next `.then`
      return vibe.updateOne(req.body.vibe)
    })
  // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
  // if an error occurs, pass it to the handler
    .catch(next)
})

// UPDATE Like Button
// PATCH /vibes/5a7db6c74d55bc51bdf39793
router.patch('/vibes/likes/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  // delete req.body.vibe.owner

  Vibe.findById(req.params.id)
    .then(handle404)
    .then((vibe) => {
      console.log(vibe)
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      // requireOwnership(req, vibe)

      // pass the result of Mongoose's `.update` to the next `.then`
      Likes.create(req.body.like).then(like => {
        vibe.likes.push(like.id)
        return vibe.save()
      })
        .then(() => res.sendStatus(204))
      // vibe.updateOne(req.body.vibe)
        .catch(next)
    })
  // if that succeeded, return 204 and no JSON
  // if an error occurs, pass it to the handler
})

// UPDATE Favorites Button
// PATCH /vibes/5a7db6c74d55bc51bdf39793
router.patch('/vibes/favorites/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  // delete req.body.vibe.owner

  Vibe.findById(req.params.id)
    .then(handle404)
    .then((vibe) => {
      console.log(vibe)
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      // requireOwnership(req, vibe)

      // pass the result of Mongoose's `.update` to the next `.then`
      Favorites.create(req.body.favorite).then(favorite => {
        vibe.favorited.push(favorite.id)
        return vibe.save()
      })
        .then(() => res.sendStatus(204))
      // vibe.updateOne(req.body.vibe)
        .catch(next)
    })
  // if that succeeded, return 204 and no JSON
  // if an error occurs, pass it to the handler
})

// // UPDATE Like Button v2 with Likes model
// // PATCH /vibes/5a7db6c74d55bc51bdf39793
// router.patch('/vibes/:id', requireToken, removeBlanks, (req, res, next) => {
//   // if the client attempts to change the `owner` property by including a new
//   // owner, prevent that by deleting that key/value pair
//   // delete req.body.vibe.owner

//   Vibe.findById(req.params.id)
//     .then(handle404)
//     .then((vibe) => {
//       // pass the `req` object and the Mongoose record to `requireOwnership`
//       // it will throw an error if the current user isn't the owner
//       // requireOwnership(req, vibe)

//       // pass the result of Mongoose's `.update` to the next `.then`
//       return vibe.updateOne(req.body.vibe)
//     })
//   // if that succeeded, return 204 and no JSON
//     .then(() => res.sendStatus(204))
//   // if an error occurs, pass it to the handler
//     .catch(next)
// })

// DESTROY
// DELETE /vibes/5a7db6c74d55bc51bdf39793
router.delete('/vibes/:id', requireToken, (req, res, next) => {
  Vibe.findById(req.params.id)
    .then(handle404)
    .then((vibe) => {
      // throw an error if current user doesn't own `vibe`
      requireOwnership(req, vibe)
      // delete the vibe ONLY IF the above didn't throw
      vibe.deleteOne()
    })
  // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
  // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
