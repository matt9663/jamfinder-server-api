const xss = require('xss')

const BandsService = {
  getAllBands(db) {
    return db
      .from('jamfinder_bands')
      .select('*')
  },
  getById(db, id) {
    return BandsService.getAllBands(db)
      .where('id', id)
      .first()
  },
  insertBand(db, newBand) {
    return db
      .insert(newBand)
      .into('jamfinder_bands')
      .returning('*')
      .then(([band]) => band)
      .then(band =>
        BandsService.getById(db, band.id)
      )
  },
  serializeBand(band) {
    return ({
      id: band.id,
      band_name: xss(band.band_name),
      genre: xss(band.genre),
      location: xss(band.location),
      description: xss(band.description),
      members: band.members,
      new_members: band.new_members,
      bandleader: band.bandleader
    })
  },
  updateBand(db, id, updatedBand) {
    return db('jamfinder_bands')
      .where('id', id)
      .update(updatedBand)
      .returning('*')
      .then(([band]) => band)
  }
}

module.exports = BandsService
