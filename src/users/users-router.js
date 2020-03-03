const express = require('express')
const path = require('path')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
  .route('/:user_id')
  .all(checkUserExists)
  .get((req, res) => {
    res.json(UsersService.serializeUser(res.user))
  })

  async function checkUserExists(req, res, next) {
    try {
      const user = await UsersService.getUser(
        req.app.get('db'),
        req.params.user_id
      )
      if (!user)
        return res.status(404).json({
          error: 'User does not exist'
        })
      res.user = user
      next()
    } catch (error) {
      nexts(error)
    }
  }

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { user_name, password, genres, instrument, influences } = req.body
    for (const field of ['user_name', 'password', 'instrument']) 
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing ${field} in request body`
        })
    const passwordError = UsersService.validatePassword(password)
    if (passwordError) {
      return res.status(400).json({
        error: passwordError
      })
    }
    UsersService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: 'User name already taken' })
        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              genres,
              instrument,
              influences
            }
            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user))
              })
          })
      })
      .catch(next)
  })
usersRouter
  .route('/:user_id')
  .patch(jsonBodyParser, (req, res, next) => {
    id = req.params.user_id
    UsersService.updateUser(
      req.app.get('db'),
      id,
      req.body
    )
      .then(user => {
        res.json(UsersService.serializeUser(user))
      })
      .catch(next)
  })

  module.exports = usersRouter