const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('band messages endpoint', () => {
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

  describe('GET /api/messages/:band_id', () => {
    context('given no messages', () => {
      beforeEach('seed users table', () => 
        helpers.seedBandsTable(
          db,
          testUsers,
          testBands
        )
      )
      it('responds with 200 and an empty list', () => {
        const testUser = testUsers[0]
        const testBand = testBands[0]
        return supertest(app)
          .get(`/api/messages/${testBand.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, [])
      })
    })
    context('given messages', () => {
      beforeEach('seed messages', () => 
        helpers.seedMessagesTable(
          db,
          testUsers,
          testBands,
          testMessages
        )
      )
      it('responds with 200 and a list of messages for that band', () => {
        const testUser = testUsers[0]
        const testBand = testBands[0]
        const expectedMessages = testMessages.filter(message => message.band === testBand.id)
        return supertest(app)
          .get(`/api/messages/${testBand.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedMessages)
      })
    })
  })
  describe('POST /api/messages/:band_id', () => {
    beforeEach('insert users and bands', () => 
      helpers.seedBandsTable(
        db,
        testUsers,
        testBands
      )
    )
    it('creates a new message, responding with 201 and the new message', () => {
      const testUser = testUsers[0]
      const testBand = testBands[0]
      const newMessage = {
        band: testBand.id,
        author: testUser.id,
        author_user_name: testUser.user_name,
        message: 'Testing testing 1 2 3!'
      }
      return supertest(app)
        .post(`/api/messages/${testBand.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newMessage)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.message).to.eql(newMessage.message)
          expect(res.body).to.have.property('date_published')
          expect(res.body.author_user_name).to.eql(testUser.user_name)
          expect(res.body.author).to.eql(testUser.id)
          expect(res.body.band).to.eql(testBand.id)
        })
        .expect(res => 
          db
            .from('jamfinder_band_messages')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.message).to.eql(newMessage.message)
            })
        )
    })
  })
})