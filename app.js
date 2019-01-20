const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')

const app = express()

const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')
const userRoutes = require('./api/routes/users')

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongoatlas-qv5kn.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`, { useNewUrlParser: true })
  .catch((err) => {
    console.log(err)
  })

// Use morgan for logging
app.use(morgan('dev'))

// Serve static file
app.use('/uploads', express.static('uploads'))

// Set the right header for all request going out
// Anticipating CORS error
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*') // Allow every http access
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

  if (req.method === 'OPTIONS') {
    // Allow all http words you want with your API
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return status(200).json({})
  }

  next()
})

// The substitute for body-parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// All middleware we use go through use

// Forward request to routes
// Use this method to split them into feature basis
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/users', userRoutes)

// If any request passed the above middleware
// that means the request can't be handled by the routes
// This kind of request could be used as 
// routes that leads to a default pages or error pages

// Error
// Resource Not Found
app.use((req, res, next) => {
  const error = new Error('404 Resource Not Found')
  error.status = 404
  next(error) // Forward the error request
})

// Internal Server Error. Database transaction fails etc
app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

module.exports = app