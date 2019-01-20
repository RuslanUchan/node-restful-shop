# Node Rest Shop API

### Introduction
rest-shop is a Node-Express-MongoDB based restful API that imitates the work of a shopping application backend processes.

This application is a tutorial from [Academind's Restful API with Node.js playlist](https://www.youtube.com/playlist?list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q)

### Setting up the environments
1. Install Node.js and ensure npm is installed by doing typing in the terminal `npm -v`
2. Clone the repository and change your directory to the cloned repo. Do `npm install` afterwards, this will install packages needed in the application
3. You can create an [Atlas MongoDB](https://www.mongodb.com/cloud/atlas) account for free to use be able to run the application out of the box, or set up your own local MongoDB and tweak the code for mongoose connection in the `app.js` file
4. If you have created an Atlas MongoDB account, create a file in your root project named `nodemon.json` and create an env variables like this 
```json
{ 
  "env": {
    "MONGO_USER": "your cluster member username",
    "MONGO_PASSWORD": "your cluster member password",
    "MONGO_DB": "rest-shop-or-anything",
    "JWT_KEY": "secret-or-any-keys"
  }
}
```

5. Next, you can run `npm start` to start the server
6. You can try the API call from [Postman](https:/www.getpostman.com/) or any other API tester tools

### Using the API
The API uses `checkAuth()` function using [jsonwebtoken](https://jwt.io/) that checks if user that does API call is already registered and authenticated.

In that case, you should **create a new user account first** on the `/users/signup` endpoint to be able to get the token and use it in the headers of the API call.

#### `/users` endpoint
Processes logic related to user *signup*, *login* and *removing user*.

Several API needs user to have *authenticated token* to be inserted in the API call header. The token could be generated after signing up and login via the API

- **Sign up**

  *Create new user data in database.*

  type: `POST`, endpoint: `/users/signup`

  body: `content-type: application/json`: `email (string), password (string)`

  return: `User created` message

  Auth? **No**
  
- **Login**

  *Get authentication token that is used across the API as verification for doing action. Login using the existing user data in the database.*

  type: `POST`, endpoint: `/users/login`

  body: `content-type: application/json`: `email (string), password(string)`

  return: `Auth successful` message and a usable token

  Auth? **No**

- **Delete user with specific ID**

  *Delete the user data in the database if the id passed into the endpoint exists (:userId). Deleted user won't be able to login and have to signup again.*

  type: `DELETE`, endpoint: `/users/:userId`

  body: `none`

  return: `User deleted` message

  Auth? **No**

#### `/products` endpoint.
Retrieves information related to products stored in the database

- **Get all products**

  *Get all products in the database.*

  type: `GET`, endpoint: `/products`

  body: `none`

  return: product objects with prop: `_id, name, price, productImage`

  Auth? **No**

- **Create new product**

  *Create new product to store in the database. Send the request by form-data and the product image extension must be `jpg` or `png`.*

  type: `POST`, endpoint: `/products`

  body: `form-data`: `name (string), price (number), productImage (file; png or jpg)`

  return: `Created product` message with product details

  Auth? **Yes**

- **Get single product**

  *Get single details data product by passing product ID to the endpoints (:productId).*

  type: `GET`, endpoint: `/products/:productId`

  body: `none`

  return: Single product details

  Auth? **No**

- **Update single product**

  *Update a product details by passing the updated data inside the body of the request and passing the product ID to the endpoint.*

  type: `PATCH`, endpoint: `/products/:productId`

  body: `content-type: application/json`: `name (string), price (number)`

  return: Single product details

  Auth? **Yes**

- **Delete single product**

  *Delete a single product by passing the product ID to the endpoint.*

  type: `DELETE`, endpoint: `/products/:productId`

  body: `none`

  return: `Product deleted` message

  Auth? **Yes**

#### `/orders` endpoint.
Retrieves information related to the orders of the product in the database. There's an implicit relationship between keys of the document used to made relationship between order and product.

- **Get all orders**

  *Get all orders inside the database.*

  type: `GET`, endpoint: `/orders`

  body: `none`

  return: All order details. `_id, product (productId), quantity (number)`.

  Auth? **Yes**

- **Create a new order**

  *Create a new order. Product ID is needed for the references of the product keys by the order.*

  type: `POST`, endpoint: `/orders`

  body: `content-type: application/json`: `product (productId), quantity (number)`

  return: `Order stored` and order details

  Auth? **Yes**

- **Get single order**

  *Get single order data from the database by passing the order ID to the endpoints (:orderId).*

  type: `GET`, endpoint: `/orders/:orderId`

  body: `none`

  return: Single order details

  Auth? **Yes**

- **Delete single order**

  *Delete single order from database by passing the order ID to the endpoints (orderId).*

  type: `DELETE`, endpoint: `/orders/orderId`

  body: `none`

  return: `Order deleted` message

  Auth? **Yes**

### To add
- User roles. e.g Admin, User; Only Admin can delete user account
- Outsource the multer configuration from product route