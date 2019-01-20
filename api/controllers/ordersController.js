// Made the routes cleaner by extracting the logic of the
// routes into a separate controller function that handles
// the logic for the routes
const mongoose = require('mongoose')

const OrderModel = require('../models/orderModel')
const ProductModel = require('../models/productModel')

exports.orders_get_orders = (req, res, next) => {
  OrderModel.find()
    .select('product quantity _id')
    .populate('product', 'name')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => (
          {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: 'GET',
              description: 'GET SINGLE ORDER',
              url: `http://localhost:3000/orders${doc._id}`
            }
          } // Orders
        )) // Map
      }) // Json
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
}

exports.orders_create_order = (req, res, next) => {
  // Check if product actually exists, so that order
  // could link to the product
  // hint: product is parent, order is child
  // order can't exists without product
  ProductModel.findById(req.body.productId)
    .then(product => {
      // If product not exists
      if (!product) {
        // with return, the code that follows won't get executed
        return res.status(404).json({ message: 'Product not found', })
      }
      // Create new order
      const order = new OrderModel({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      })

      return order.save() // return the promise
    })
    .then(result => {
      console.log(result)
      res.status(201).json({
        message: 'Order stored',
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: 'GET',
          description: 'GET SINGLE ORDER',
          url: `http://localhost:3000/orders${result._id}`
        }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err })
    })
}

exports.orders_get_order = (req, res, next) => {
  OrderModel.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
      // Ir order not exists
      if (!order) {
        return res.status(404).json({ message: 'Order not found '})
      }
      res.status(200).json({
        _id: order._id,
        product: order.product,
        quantity: order.quantity,
        request: {
          type: 'GET',
          description: 'GET ALL ORDER',
          url: 'http://localhost:3000/orders',
        }
      })
    })
    .catch(err => {
      res.status(500).json({ error: err })
    })
}

exports.orders_delete_order = (req, res, next) => {
  OrderModel.remove( {_id: req.params.orderId })
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Order deleted',
      request: {
        type: 'POST',
        description: 'CREATE A NEW ORDER',
        url: 'http://localhost:3000/orders',
        body: { productId: 'ID', quantity: 'Number' }
      }
    })
  })
  .catch(err => {
    res.status(500).json({ error: err })
  })
}