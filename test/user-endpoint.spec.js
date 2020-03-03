const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const bcrypt = require('bcryptjs')

describe('Users endpoint', function() {
  let db
  const { testUsers } = helpers.makeMessagesFixture()
  const testUser = {
    id: testUsers[0].id,
    user_name: testUsers[0].user_name,
    genres: testUsers[0].genres,
    instrument: testUsers[0].instrument,
    influences: testUsers[0].influences,
    bands:testUsers[0].bands
  }

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

  describe('GET /api/users/:user_id', () => {
    context('given no users', () => {
      it('responds with 404 and an error', () => {
        return supertest(app)
          .get(`/api/users/${testUser.id}`)
          .expect(404, { error: 'User does not exist'})
      })
    })
    context('given users', () => {
      beforeEach('insert users', () => 
        helpers.seedUsers(
          db,
          testUsers
        )
      )
      it('responds with 200 and the requested user', () => {
        const id = testUser.id
        const expectedUser = testUser
        return supertest(app)
          .get(`/api/users/${id}`)
          .expect(200, expectedUser)
      })
    })
  })
  describe('POST /api/users', () => {
    context('Data input validation', () => {
      beforeEach('seed tables', () => 
        helpers.seedUsers(
          db,
          testUsers
        )
      )
      const requiredFields = ['user_name', 'password', 'instrument']
      requiredFields.forEach(field => {
        const registerAttemptBody = {
          user_name: 'really-good-guitar-guy',
          password: 'Password1!',
          instrument: 'Electric guitar'
        }
        it(`responds with 400 required error when ${field} is missing`, () => {
          delete registerAttemptBody[field]
          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, { error: `Missing ${field} in request body` })
        })
      })
      it('responds 400 when password length is too long', () => {
        const userLongPass = {
          user_name: 'really-goot-UN',
          password: '*'.repeat(73),
          instrument: 'triangle'
        }
        return supertest(app)
          .post('/api/users')
          .send(userLongPass)
          .expect(400, { error: 'Password must be no more than 72 characters' })
      })
      it('responds 400 when password length is too short', () => {
        const userShortPass = {
          user_name: 'really-goot-UN',
          password: '123456',
          instrument: 'triangle'
        }
        return supertest(app)
          .post('/api/users')
          .send(userShortPass)
          .expect(400, { error: 'Password must be at least 8 characters' })
      })
      it('responds 400 when password starts with space', () => {
        const userSpaceStartPass = {
          user_name: 'really-goot-UN',
          password: ' 1234567889',
          instrument: 'triangle'
        }
        return supertest(app)
          .post('/api/users')
          .send(userSpaceStartPass)
          .expect(400, { error: 'Password cannot start or end with empty space' })
      })
      it('responds 400 when password ends with space', () => {
        const userSpaceEndPass = {
          user_name: 'really-goot-UN',
          password: '1234567889 ',
          instrument: 'triangle'
        }
        return supertest(app)
          .post('/api/users')
          .send(userSpaceEndPass)
          .expect(400, { error: 'Password cannot start or end with empty space' })
      })
      it('responds 400 when password is not complex enough', () => {
        const userEasyPass = {
          user_name: 'really-goot-UN',
          password: 'ezpasswordrighthere',
          instrument: 'triangle'
        }
        return supertest(app)
          .post('/api/users')
          .send(userEasyPass)
          .expect(400, { error: 'Password must contain at least 1 lowercase, uppercase, number, & special character' })
      })
      it('responds with 400 error if duplicate user name is tried', () => {
        const dupedUser = {
          user_name: 'test-user1',
          password: 'Password1!',
          instrument: 'DRUMZZZZ'
        }
        return supertest(app)
          .post('/api/users')
          .send(dupedUser)
          .expect(400, { error: 'User name already taken'})
      })
    })
    context('successful register', () => {
      it('responds with 201, serialized user, storing bcrypted password', () => {
        const newUser = {
          user_name: 'cool-new-guy',
          password: 'Password1!',
          instrument: 'Electric bass'
        }
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.user_name).to.eql(newUser.user_name)
            expect(res.body.instrument).to.eql(newUser.instrument)
            expect(res.body).to.not.have.property('password')
          })
          .expect(res => 
            db
              .from('jamfinder_users')
              .select('*')
              .where('id', res.body.id)
              .first()
              .then(row => {
                expect(row.user_name).to.eql(newUser.user_name)
                expect(row.instrument).to.eql(newUser.instrument)
                return bcrypt.compare(newUser.password, row.password)
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true
              })
          )
      })
    })
  })
  describe('PATCH /api/users', () => {
    context('successful update', () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers
        )
      )
      it('responds with 200 and updates only the listed fields', () => {
      const user = testUser
      const updatedFields = {
        genres: 'Third-wave ska',
        instrument: 'Trumpet'
      }
      return supertest(app)
        .patch(`/api/users/${user.id}`)
        .send(updatedFields)
        .expect(200)
        .expect(res => {
          expect(res.body.genres).to.eql(updatedFields.genres)
          expect(res.body.instrument).to.eql(updatedFields.instrument)
        })
        .expect(res => 
          db
            .from('jamfinder_users')
            .select('*')
            .where('id', res.body.id)
            .first()
            .then(row => {
              expect(row.user_name).to.eql(user.user_name)
              expect(row.instrument).to.eql(updatedFields.instrument)
              expect(row.genres).to.eql(updatedFields.genres)
              expect(row.influences).to.eql(user.influences)
            })
        )
      })    
    })
  })
})
