const xss = require('xss');
const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (password.length > 72) {
      return 'Password must be no more than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password cannot start or end with empty space';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain at least 1 lowercase, uppercase, number, & special character';
    }
    return null;
  },
  hasUserWithUserName(db, user_name) {
    return db('jamfinder_users')
      .where({ user_name })
      .first()
      .then(user => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('jamfinder_users')
      .returning('*')
      .then(([user]) => user);
  },
  serializeUser(user) {
    return {
      id: user.id,
      user_name: xss(user.user_name),
      genres: xss(user.genres),
      instrument: xss(user.instrument),
      influences: xss(user.influences),
      bands: user.bands,
    };
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  updateUser(db, id, updatedUser) {
    return db('jamfinder_users')
      .where('id', id)
      .update(updatedUser)
      .returning('*')
      .then(([user]) => user);
  },
  getUser(db, id) {
    return db('jamfinder_users')
      .select('id', 'user_name', 'genres', 'instrument', 'influences', 'bands')
      .where('id', id)
      .first();
  },
  getUsersInBand(db, band_id) {
    return db('jamfinder_users')
    .select('id', 'user_name', 'genres', 'instrument', 'influences', 'bands')
    .whereRaw('? = ANY (bands)', band_id);
  },
}

module.exports = UsersService;
