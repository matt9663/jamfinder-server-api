const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Protected endpoints', () => {
  let db
  const { testUsers, testBands, testMessages } = helpers.makeMessagesFixture()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  beforeEach('clean up tables', () => helpers.cleanTables(db))

  afterEach('clean up tables', () => helpers.cleanTables(db))

  beforeEach('seed tables', () => 
    helpers.seedMessagesTable(
      db,
      testUsers,
      testBands,
      testMessages
    )
  )
  const protectedEndpoints = [
    {
      name: 'GET /api/bands/:band_id',
      path: `/api/bands/${testBands[0].id}`
    },
    {
      name: 'GET /api/messages/:band_id',
      path: `/api/bands/${testBands[0].id}`
    }
  ]
  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it('responds with 401 "missing bearer token" when no bearer token', () => {
        return supertest(app)
          .get(endpoint.path)
          .expect(401, { error: 'Missing bearer token' })
      })
      it('responds with 401, "unauthorized request" when invalid JWT secret', () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: 'Unauthorized request' })
      })
      it('responds 401 "Unauthorized request" when invalid user', () => {
        const invalidUser = {...testUsers[0], user_name: 'bad_user-name'}
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized request' })
      })
    })
  })
})