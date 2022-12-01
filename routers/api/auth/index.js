const router = require('express').Router()
const controllers = require('./controllers')
const authMiddleware = require('../../../middlewares/auth')

router.post('/register', controllers.register)
router.post('/login', controllers.login)
router.delete('/logout', controllers.logout)

router.use('/check', authMiddleware)
router.get('/check', controllers.check)

module.exports = router