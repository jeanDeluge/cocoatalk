const jwt = require('jsonwebtoken');
const User = require('../../../models/User')
const secret = process.env.SECRET_TOKEN

exports.register = (req, res) => {
    const { username, userId, password, email } = req.body
    let newUser = null

    // create a new user if does not exist

    const create = (user)=>{
        if(user){
            throw new Error('email exists')
        }else{
            return User.create(username, userId, email, password)
        }
    }

    const count = (user) =>{
        newUser = user
        return User.count({}).exec()
    }

    const assign = (count) =>{
        if(count === 1){
            return newUser.assignAdmin()
        }else{
            return Promise.resolve(false);
        }
    }

    const respond = (isAdmin)=>{
        res.json({
            message : 'registrerd successfully',
            admin: isAdmin ? true: false
        })
    }

    const onError = (error) => {
        res.status(409).json({
            message: error.message
        })
    }

    User.findOneByEmail(email)
    .then(create)
    .then(count)
    .then(assign)
    .then(respond)
    .catch(onError)
}

exports.login = (req, res) => {
    const {email, password} = req.body

    // check the user info & generate the jwt
        // check the user info & generate the jwt
    const check = (user) => {
        if(!user) {
            // user does not exist
            throw new Error('login failed')
        } else {
            // user exists, check the password
            if(user.comparePassword(password)) {
                // create a promise that generates jwt asynchronously
                user.generateToken()
                return user.token
            } else {
                throw new Error('login failed')
            }
        }
    }
    // respond the token 
    const respond = (token) => {
        res.cookie("x_auth", token).status(200).json({
            message: 'logged in successfully',
            token
        })
    }

    // error occured
    const onError = (error) => {
        res.status(403).json({
            message: error.message
        })
    }

    // find the user
    User.findOneByEmail(email)
    .then(check)
    .then(respond)
    .catch(onError)

}



exports.check = (req, res) => {
    // read the token from header or url 
    const token = req.cookies.x_auth

    // token does not exist
    if(!token) {
        return res.status(403).json({
            success: false,
            message: 'not logged in'
        })
    }

    // create a promise that decodes the token
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if(err) reject(err)
                resolve(decoded)
            })
        }
    )

    // if token is valid, it will respond with its info
    const respond = (token) => {
        res.json({
            success: true,
            info: token
        })
    }

    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        res.status(403).json({
            success: false,
            message: error.message
        })
    }

    // process the promise
    p.then(respond).catch(onError)
}


exports.logout = (req, res) => {
    const token = req.cookies.x_auth
    User.findOneAndUpdate({token: token}, {token: ""}, (err, user) =>{
        if (err) return res.json({ success: false, err});
        return res.status(200).send({
            success: true,
            user: this.username
        })
    })

}