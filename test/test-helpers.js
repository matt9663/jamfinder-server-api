const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      password: 'Password1!',
      user_name: 'test-user1', 
      genres: 'Funk/R&B', 
      instrument: 'Electric guitar', 
      influences: 'James Brown, Isaiah Sharkey, Nile Rogers', 
      bands: [1,2,3]
    },
    {
      id: 2,
      password: 'Password1!',
      user_name: 'test-user2', 
      genres: 'Metal/Folk', 
      instrument: 'Accordian', 
      influences: 'Weird Al', 
      bands: [1]
    },
    {
      id: 3, 
      password: 'Password1!',
      user_name: 'test-user3', 
      genres: 'Blues/Americana', 
      instrument: 'Electric bass', 
      influences: 'Ernest Tub, Robert Johnson, Blind Lemon Jefferson', 
      bands: [1]
    }
  ]
}

function makeBandsArray(users) {
  return [
    {
      id: 1, 
      band_name: 'Gutter Helmet & The Hawgs', 
      genre: 'Bog-rock', 
      description: 'Swamp blues straight from the Bayou', 
      new_members: true, 
      location: 'Loosianah, LA', 
      members: [1,2,3], 
      bandleader: users[0].id
    },
    {
      id: 2, 
      band_name: 'Boistrous Oysters', 
      genre: 'Jazz Fusion', 
      description: 'Super fast future jazz', 
      new_members: false, 
      location: 'Los Angeles, CA', 
      members: [1], 
      bandleader: users[0].id
    },
    {
      id: 3, 
      band_name: 'The Lunch Ladies', 
      genre: 'Indie-rock', 
      description: 'Angsty songs by dudes who are too old to be this angsty', 
      new_members: true, 
      location: 'Philadelphia, PA', 
      members: [2], 
      bandleader: users[1].id
    }
  ]
}

function makeMessagesArray(users, bands) {
  return [
    {
      id: 3, 
      band: bands[0].id, 
      author: users[1].id, 
      author_user_name: users[1].user_name, 
      date_published: '2/18/2020, 10:00:00 AM', 
      message: `Yeah that works for me, see you then!`
    },
    {
      id: 2, 
      band: bands[0].id, 
      author: users[0].id, 
      author_user_name: users[0].user_name, 
      date_published: '2/18/2020, 9:00:00 AM',
      message: `Since we have a show next week, are you guys available to meet for rehearsal this Saturday afternoon at 2pm?`
    },
    {
      id: 1, 
      band: bands[0].id, 
      author: users[2].id, 
      author_user_name: users[2].user_name, 
      date_published: '2/17/2020, 9:00:00 AM', 
      message: `Nice to meet everyone, thanks for letting me join the group. Excited to make some music will y'all!`
    },
    {
      id: 4, 
      band: bands[2].id, 
      author: users[1].id, 
      author_user_name: users[1].user_name, 
      date_published: '2/17/2020, 9:00:00 AM', 
      message: `I shouldn't be in the tests!`
    },
  ]
}

function makeMessagesFixture() {
  const testUsers = makeUsersArray()
  const testBands = makeBandsArray(testUsers)
  const testMessages = makeMessagesArray(testUsers, testBands)
  return { testUsers, testBands, testMessages }
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('jamfinder_users').insert(preppedUsers)
    .then(() => 
      db.raw(
        `SELECT setval('jamfinder_users_id_seq', ?)`,
        [users[users.length -1].id]
      )
    )
}

function seedBandsTable(db, users, bands) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('jamfinder_bands').insert(bands)
    await trx.raw(
      `SELECT setval('jamfinder_bands_id_seq', ?)`,
      [bands[bands.length - 1].id]
    )
  })
}

function seedMessagesTable(db, users, bands, messages) {
  return db.transaction(async trx => {
    await seedBandsTable(trx, users, bands)
    await trx.into('jamfinder_band_messages').insert(messages)
    await trx.raw(
      `SELECT setval('jamfinder_band_messages_id_seq', ?)`,
      [messages[messages.length - 1].id]
    )
  })
}

function makeAuthHeader (user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id}, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  })
  return `Bearer ${token}`
}

function cleanTables(db) {
  return db.transaction(trx => 
    trx.raw(
      `TRUNCATE
        jamfinder_band_messages,
        jamfinder_bands,
        jamfinder_users
        RESTART IDENTITY CASCADE
      `
    )
      .then(() => 
        Promise.all([
          trx.raw(`ALTER SEQUENCE jamfinder_band_messages_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE jamfinder_bands_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE jamfinder_users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('jamfinder_band_messages_id_seq', 0)`),
          trx.raw(`SELECT setval('jamfinder_bands_id_seq', 0)`),
          trx.raw(`SELECT setval('jamfinder_users_id_seq', 0)`)
        ])
      )
  )
}

module.exports = {
  makeUsersArray,
  makeBandsArray,
  makeMessagesArray,
  makeMessagesFixture,
  seedUsers,
  seedBandsTable,
  seedMessagesTable,
  cleanTables,
  makeAuthHeader
}