// Require needed packages
require('dotenv').config()
var cors = require('cors')
let express = require('express')
let morgan = require('morgan')
let rowdyLogger = require('rowdy-logger')
let expressJwt = require('express-jwt')

// Instantiate app
let app = express()
let rowdyResults = rowdyLogger.begin(app)

// Set up middleware
//morgan - tellings us it hits the route
  // POST /auth/login 200 343.884 ms - 393
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false })) // Accept form data
app.use(express.json()) // Accept data from fetch (or any AJAX call)
app.use(cors({})) //TODO: add react app as origin for CORS


// Routes
app.use('/auth', require('./controllers/auth'))
app.use('/profile', expressJwt({ secret: process.env.JWT_SECRET}), require('./controllers/profile'))

app.get('*', (req, res) => {
  res.status(404).send({ message: 'Not Found' })
})

app.listen(process.env.PORT || 3000, () => {
  rowdyResults.print()
})
