const express = require('express');
const path = require('path');
const BandsService = require('./bands-service');
const { requireAuth } = require('../middleware/jwt-auth');

const bandsRouter = express.Router();
const jsonBodyParser = express.json();

bandsRouter
  .route('/')
  .get((req, res, next) => {
    BandsService.getAllBands(
      req.app.get('db')
    )
      .then(bands => {
        res.json(bands.map(BandsService.serializeBand))
      })
      .catch(next);
  });

bandsRouter
  .route('/user/:user_id')
  .all(requireAuth)
  .get((req, res, next) => {
    BandsService.getByUser(
    req.app.get('db'),
    req.params.user_id,
  )
    .then(bands => {
      res.json(bands.map(BandsService.serializeBand))
    })
    .catch(next);
  });

bandsRouter
  .route('/:band_id')
  .all(requireAuth)
  .all(checkBandExists)
  .get((req, res) => {
    res.json(BandsService.serializeBand(res.band))
  });

  async function checkBandExists(req, res, next) {
    try {
      const band = await BandsService.getById(
        req.app.get('db'),
        req.params.band_id,
      )
      if (!band)
        return res.status(404).json({
          error: 'Band does not exist'
        })
      res.band = band;
      next()
    } catch (error) {
      next(error)
    }
  };

bandsRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { band_name, genre, location, new_members, description } = req.body;
    const newBand = { band_name, genre, location, new_members, description };
    for (const field of ['band_name', 'genre', 'location']) 
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing ${field} in request body`
        });
    newBand.bandleader = req.user.id;
    newBand.members = [req.user.id];
    BandsService.insertBand(
      req.app.get('db'),
      newBand,
    )
      .then(band => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${band.id}`))
          .json(BandsService.serializeBand(band))
      })
      .catch(next);
  });

bandsRouter
  .route('/:band_id')
  .patch(jsonBodyParser, (req, res, next) => {
    id = req.params.band_id;
    BandsService.updateBand(
      req.app.get('db'),
      id,
      req.body,
    )
      .then(band => {
        res.json(BandsService.serializeBand(band))
      })
      .catch(next);
  });

module.exports = bandsRouter;
