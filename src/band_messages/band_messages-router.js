const express = require('express')
const MessagesService = require('./band_messages-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const messagesRouter = express.Router()
const jsonBodyParser = express.json()

messagesRouter
  .route('/:band_id')
  .all(requireAuth)
  .get((req, res, next) => {
    let band = req.params.band_id
    MessagesService.getBandMessages(
      req.app.get('db'),
      band
    )
      .then(messages => {
        res.json(messages.map(MessagesService.serializeMessage))
      })
      .catch(next)
  })

messagesRouter
  .route('/:band_id')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    const { message } = req.body
    let newMessage = { message }
    if (!newMessage) {
      return res.status(400).json({ error: 'Message body cannot be blank'})
    }
    newMessage.band = req.params.band_id
    newMessage.author = req.user.id
    newMessage.author_user_name = req.user.user_name
    newMessage.date_published = new Date()
    MessagesService.insertMessage(
      req.app.get('db'),
      newMessage
    )
      .then(message => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${message.id}`))
          .json(MessagesService.serializeMessage(message))
      })
      .catch(next)
  })

module.exports = messagesRouter