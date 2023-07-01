require('dotenv').config()
const express = require('express')
const Person = require('./modules/person')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
app.use(express.json())

const logger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    JSON.stringify(req.body),
  ].join(' ')
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

// Middleware Loading 🔃
app.use(express.static('dist'))
app.use(cors())
app.use(logger)

// To send the data for the info page 📨
app.get('/info', (req, res) => {
  const date = new Date()
  Person.countDocuments({})
    .then((result) => {
      res.send(
        `<p>Phonebook has info for ${result} people</p>
        <p>${date}</p>`
      )
    })
    .catch(() => {
      res.send('<p>Phonebook has info for 0 people</p>')
    })
})

// To get all the data of the persons
app.get('/api/persons', (req, res) => {
  Person.find({}).then((result) => {
    res.json(result)
  })
})

// To add a new person
app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson)
    })
    .catch((err) => {
      next(err)
    })
})

// To update the number of a person
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const id = req.params.id
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => {
      res.json(updatedPerson)
    })
    .catch((err) => {
      next(err)
    })
})

// To get the data of a single person
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then((result) => {
      if (result) {
        res.json(result)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => {
      console.log('⚠️ Error', error.message)
      next(error)
    })
})

// To delete a person 🚮
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndRemove(id)
    .then((result) => {
      res.status(204).end()
    })
    .catch((err) => {
      next(err)
    })
})
app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
