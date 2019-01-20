const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserModel = require('../models/userModel')

exports.user_signup = (req, res, next) => {
  console.log(res)

  // Check if user already exists
  UserModel.findOne({ email: req.body.email })
    .exec()
    .then(user => {
      if (user) {
        // 409 - Conflict
        // 422 - Unprocessable Entity
        return res.status(409).json({ message: 'Email existed '})
      } else {
        // Hash the password
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          const user = new UserModel({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email.toLowerCase(),
            password: hash
          })

          if (err) {
            return res.status(500).json({ error: err })
          } 

          user.save()
            .then(result => {
              console.log(result)
              res.status(201).json({ message: 'User created '})
            })
            .catch(err => {
              console.log(err)
              res.status(500).json({ error: err })
            })
        })// Hash
      }
    })
}

exports.user_login = (req, res, next) => {
  UserModel.findOne({ email: req.body.email })
    .exec()
    .then(user => {
      console.log(user)
      if (!user) {
        // If you return 404, it's not the best pattern
        // to handle failed authentication

        // You could use 401 of not authorized and tell
        // that the authentication process failed
        // because either email or password is wrong
        return res.status(401).json({ message: "Auth failed" })
      }

      // Match the new password w/ password in db
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          console.log(err)
          return res.status(500).json({ error: err })
        }

        if (result) {
          // Add jsonwebtoken

          // Assign to variable and run it synchronously
          const token = jwt.sign({ 
            email: user.email,
            usedId: user._id
          },
          process.env.JWT_KEY, {
            expiresIn: "1h"
          }) // jwt sign

          // You -supposedly- could send the tokens inside the header
          /*
           * res.status(200).header('x-auth', token).json(~)
           */  
          return res.status(200).json({ 
            message: 'Auth successful ',
            token: token
          })
        }

        // If the preceding block didn't get executed
        res.status(401).json({ message: "Auth failed" })
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err })
    })
}

exports.user_delete_user = (req, res, next) => {
  // You should've checked first if the user actually exists
  // before trying to delete the records
  UserModel.remove({ _id: req.params.userId })
    .exec()
    .then(result => res.status(200).json({ message: 'User deleted'} ))
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err })
    })
}