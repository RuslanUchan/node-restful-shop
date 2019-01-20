const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  // Verify the token
  // It'll throw an error if it fails
  // Whether it's token not exists in the body, or verification failed
  try {
    // Sucessful authenticate
    // To send token, use the pattern
    // : Beareer <token>
    const token = req.headers.authorization.split(" ")[1] // Split the bearer
    // console.log(token)
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    req.userData = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Auth failed '})
  }
}