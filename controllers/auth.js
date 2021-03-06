require('dotenv').config()
let db = require('../models')
let router = require('express').Router()
let jwt = require('jsonwebtoken')

// POST /auth/login (find and validate user; send token)
router.post('/login', (req, res) => {
  console.log(req.body)
  //look up user by their email
  db.User.findOne({ email: req.body.email })
  .then(user => {
    //check whether the user exists
    if (!user){
      //they don't have an account.  Send error message
      return res.status(404).send({ message: 'user not found' })
    }
    //they exists but make sure password is correct
    if(!user.validPassword(req.body.password)){
      //incorrect password - send error back
      req.status(401).send({message: 'Invalid Credentials'})
    }

    //we have a good user - make them a new token, sent it to them
    let token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 8//8 hours, in seconds
    })
    res.send({ token })
  })
  .catch(err => {
    console.log('Error in post auth login', err)
    res.status(503).send({ message: 'Server-side error'})
  })
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



module.exports = router
