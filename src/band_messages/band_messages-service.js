const xss = require('xss')

const MessagesService = {
  getBandMessages(db, band_id) {
    return db
      .from('jamfinder_band_messages')
      .select('*')
      .where('band', band_id)
      .orderBy('date_published', 'desc')
  },
  serializeMessage(message) {
    return ({
      id: message.id,
      band: message.band,
      author: message.author,
      author_user_name: xss(message.author_user_name),
      date_published: message.date_published.toLocaleString(),
      message: xss(message.message)
    })
  },
  insertMessage(db, newMessage) {
    return db
      .insert(newMessage)
      .into('jamfinder_band_messages')
      .returning('*')
      .then(([message]) => message)
  }
}

module.exports = MessagesService