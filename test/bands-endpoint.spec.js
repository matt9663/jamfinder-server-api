const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Bands endpoint', function() {
  let db
  const { testUsers, testBands } = helpers.makeMessagesFixture()
  const testBand = testBands[0]
  const testUser = testUsers[0]

  before('make knex instance' ,() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('GET /api/bands', () => {
    context('when no bands are given', () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/bands')
          .expect(200, [])
      })
    })
    context('when bands are in the db', () => {
      beforeEach('insert bands', () => 
        helpers.seedBandsTable(
          db,
          testUsers,
          testBands
        )
      )
      it('responds with 200 and a list of bands', () => {
        return supertest(app)
          .get('/api/bands')
          .expect(200, testBands)
      })
    })
  })
  describe('GET /api/bands/:band_id', () => {
    context('when there are no bands', () => {
      it('responds with 404 not found', () => {
        const id = testBand.id
        return supertest(app)
          .get(`/api/bands/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: 'Band does not exist' })
      })
    })
    context('when bands are given', () => {
      beforeEach('insert bands', () => 
        helpers.seedBandsTable(
          db,
          testUsers,
          testBands
        )
      )
      it('returns only the expected band', () => {
        const id = testBand.id
        const expectedBand = testBand
        return supertest(app)
          .get(`/api/bands/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedBand)
      })
    })
  })
  describe.only('POST /api/bands', () => {
    beforeEach('seed users' , () => {
      helpers.seedUsers(
        db,
        testUsers
      )
    })
    it('creates a new band, responding with 201 and the new band object', () => {
      const testUser = testUsers[0]
      const newBand = {
        band_name: 'Truck Buddies',
        genre: 'Truckcore',
        location: 'Historic Route 66',
        new_members: true,
        description: 'Good truckin rock music'
      }
      return supertest(app)
        .post('/api/bands')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newBand)
        .expect(201)
        .expect(res)
    })
  })
  describe('GET /api/bands/user/:user_id', () => {
    beforeEach('insert bands', () => 
        helpers.seedBandsTable(
          db,
          testUsers,
          testBands
        )
      )
    it('returns only the bands that the user is a member of', () => {
      const testUser = testUsers[0]
      const expectedBands = testBands.filter(band => band.members.includes(testUser.id))
      return supertest(app)
        .get(`/api/bands/user/${testUser.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, expectedBands)
    })
  })
})