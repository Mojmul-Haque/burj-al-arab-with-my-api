const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const app = express()
const MongoClient = require('mongodb').MongoClient
app.use(cors())
app.use(bodyParser.json())
const pass = 'Mojmul210865'
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zd8xq.mongodb.net/Burj-Al-Arab?retryWrites=true&w=majority`
var admin = require('firebase-admin')

console.log(process.env.DB_PASS)
// admin jwt token verify

const serviceAccount = require(`${process.env.FIRE_DB}`)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

// idToken comes from the client app

app.get('/', (req, res) => {
  res.send('show off')
})

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
client.connect(err => {
  const roomBook = client.db('Burj-Al-Arab').collection('RoomBooking')
  //   data post
  app.post('/addRoom', (req, res) => {
    roomBook.insertOne(req.body).then(result => {
      console.log(result)
      res.send(result.insertedCount > 0)
    })
  })

  //    get data and pass to ui

  app.get('/bookings', (req, res) => {
    const queryToken = req.headers.authorization
    const queryEmail = req.query.email
    if (queryToken && queryToken.startsWith('Bearer ')) {
      const idToken = queryToken.split(' ')[1]
      admin
        .auth()
        .verifyIdToken(idToken)
        .then(decodedToken => {
          const tokenEmail = decodedToken.email
          if (tokenEmail === queryEmail) {
            roomBook.find({ email: queryEmail }).toArray((err, documents) => {
              res.send(documents)
            })
          } else {
            res.status(401).send('Unauthorized user')
          }
        })
        .catch(error => {
          console.log(error, 'this is erro')
          res.send(error.message)
        })
    } else {
      res.status(401).send('Unauthorized user')
    }
  })
})

app.listen(5000)
