const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')

describe('auth endpoints', () => {
  let db
  const { testUsers } = helpers.makeMessagesFixture()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('POST /api/auth/login', () => {
    beforeEach('insert users', () => 
      helpers.seedUsers(
        db,
        testUsers
      )
    )
    const requiredFields = ['user_name', 'password']

    requiredFields.forEach(field => {
      const loginAttempt = {
        user_name: testUser.user_name,
        password: testUser.password
      }
      it(`responds with 400 required error when ${field} is missing`, () => {
        delete loginAttempt[field]
        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttempt)
          .expect(400, {error: `Missing ${field} in request body`})
      })
    })
    it('responds with 400 invalid error when bad user name', () => {
      const invalidUser = {
        user_name: 'wrongo-bongo',
        password: testUser.password
      }
      return supertest(app)
        .post('/api/auth/login')
        .send(invalidUser)
        .expect(400, { error: 'Incorrect user name or password' })
    })
    it('responds with 400 invalid error when bad password', () => {
      const invalidPass = {
        user_name: testUser.user_name,
        password: 'wrongo-bongO1!'
      }
      return supertest(app)
        .post('/api/auth/login')
        .send(invalidPass)
        .expect(400, { error: 'Incorrect user name or password' })
    })
    it('responds with 200 and JWT auth token using secret when valid creds', () => {
      const happyCase = {
        user_name: testUser.user_name,
        password: testUser.password
      }
      const expectedToken = jwt.sign(
        {user_id: testUser.id},
        process.env.JWT_SECRET,
        {
          subject: testUser.user_name,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256'
        }
      )
      return supertest(app)
        .post('/api/auth/login')
        .send(happyCase)
        .expect(200, { authToken: expectedToken, user: { bands: testUser.bands, id: testUser.id, user_name: testUser.user_name } })
    })
  })
})