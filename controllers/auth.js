require('dotenv').config()
let db = require('../models')
let router = require('express').Router()
let jwt = require('jsonwebtoken')

// POST /auth/login (find and validate user; send token)
router.post('/login', (req, res) => {
  console.log(req.body)
  res.send('STUB POST /auth/login')
})

// POST to /auth/signup (create user; generate token)
router.post('/signup', (req, res) => {
  console.log(req.body)
  //look up user by email to ensure they're new and not a duplicate
  db.User.findOne({email: req.body.email})
  .then(user => {
    //if user exists already - do ont let them create another account
    if (user) {
      //no! sign up instead
      return res.status(409).send({ message: 'Email address in use' })
    }

    //we know the user is a legit new user: create new user
    db.User.create(req.body)
    .then(newUser => {
      //Yay! Things worked and user exists now!  Create a token for the new user
      let token = jwt.sign(newUser.toJSON(), process.env.JWT_SECRET, {
        expiresIn: 120 //60 * 60 * 8 // 8 hours, in seconds
      })
      res.send({ token })
    })
    .catch(innerErr => {
      console.log('Error creating user',innerErr)
      if(innerErr.name === 'ValidationError'){
        res.status(412).send({ message: `ValidationError! ${innerErr.message}.`})
      }
      else {
        res.status(500).send({message: 'Error creating user'})
      }
    })
  })
  .catch(err => {
    console.log('Error in POST /auth/signup', err)
    res.status(503).send({ message: 'Database or server error'})
  })
})

// NOTE: User should be logged in to access this route
router.get('/profile', (req, res) => {
  // The user is logged in, so req.user should have data!
  // TODO: Anything you want here!

  // NOTE: This is the user data from the time the token was issued
  // WARNING: If you update the user info those changes will not be reflected here
  // To avoid this, reissue a token when you update user data
  res.send({ message: 'Secret message for logged in people ONLY!' })
})

module.exports = router
