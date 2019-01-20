const express = require('express')
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

const ProductsController = require('../controllers/productsController')

router.get('/', ProductsController.products_get_products)

// Be careful when parsing the body of an incoming request
// Sometimes there are undetected parsing errors that comes from
// unhandled type of data (json, form data, multi-part)
router.post('/', checkAuth, upload.single('productImage'), ProductsController.products_create_product)

// Get single products
router.get('/:productId', ProductsController.products_get_product)

// Update product
router.patch('/:productId', checkAuth, ProductsController.products_patch_product)

// Delete product
router.delete('/:productId', checkAuth, ProductsController.products_delete_product)

module.exports = router