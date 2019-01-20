const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')

const checkAuth = require('../middleware/check-auth')

const router = express.Router()

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Callback to do something before storing the file
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    // Executes this callback whenever a new file is received
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

// Filter various mimetypes coming to multer
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    // store a file
    cb(null, true)
  } else {
    // reject a file
    cb(null, false)
  }
}

// Apply configuration to multer
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 5},
  fileFilter: fileFilter
})

const ProductModel = require('../models/productModel')

router.get('/', (req, res, next) => {
  ProductModel.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
      console.log(docs)

      // Configure a more detailed response from the server
      // We can attach many sorts of metadata here
      const response = {
        count: docs.length,
        products: docs.map(doc => (
          {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            productImage: doc.productImage,
            request: {
              type: 'GET',
              description: 'GET SINGLE PRODUCT',
              url: `http://localhost:3000/products/${doc._id}`
            }
          }
        ))
      }

      // if (docs.length > 0) {
      res.status(200).json(response)
      // } else {
        // res.status(404).json({message: "No entries found"})
      // }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
})

// Be careful when parsing the body of an incoming request
// Sometimes there are undetected parsing errors that comes from
// unhandled type of data (json, form data, multi-part)
router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
  // If there's no token in the body of the request, throw Auth failed
  console.log(req.file)

  // In the documentation of our API, we must state what
  // kind of data our API needs to be used correctly
  const product = new ProductModel({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  })
  product.save()
    .then(result => {
      console.log(result)
      res.status(201).json({
        message: 'Created product successfully',
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: 'GET',
            url: `http://localhost:3000/products${result._id}`
          }
        }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

// Get single products
router.get('/:productId', (req, res, next) => {
  const id = req.params.productId
  
  ProductModel.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
      console.log(doc)
      // Send the response along with the asynchronous block
      // If document exists
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: 'GET',
            description: 'GET ALL PRODUCTS',
            url: 'http://localhost:3000/products'
          }
        })
      } else {
        res.status(404).json({ message: "No valid entry found for the requested ID"})
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
})

// Update product
router.patch('/:productId', checkAuth, (req, res, next) => {
  const id = req.params.productId

  // Create default value, if only 1 value gets updated
  const props = req.body

  ProductModel.updateOne({ _id: id }, props)
    .exec()
    .then(result => {
      console.log(result)
      res.status(200).json({
        message: 'Product updated',
        request: {
          type: 'GET',
          description: 'GET INFO OF THE PRODUCT',
          url: `http://localhost:3000/products/${id}`
        }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
})

// Update product
router.delete('/:productId', checkAuth, (req, res, next) => {
  const id = req.params.productId
  ProductModel.remove({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Entry deleted",
        request: {
          type: 'POST',
          description: 'CREATE NEW PRODUCTS',
          url: 'http://localost:3000/products',
          body: { name: 'String', price: 'Number' }
        }
      })
    })
    .catch(err => {
      res.status(500).json({error: err})
    })
})

module.exports = router