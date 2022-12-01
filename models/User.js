const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_TOKEN
const bcrypt = require("bcryptjs");

const saltRounds = 10;

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String
    },
    admin:{
        type: Boolean,
        dafault: false
    }
})


UserSchema.statics.create = function(username, userId, email, password){
    const user = new this({
        userId,
        username,
        email,
        password
    })

    return user.save();
}

UserSchema.statics.findOneByEmail = function(email){
    return this.findOne({
        email
    }).exec()
}

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compare(password, this.password)
}

UserSchema.methods.assignAdmin = function(){
    this.admin = true
    return this.save()
}

UserSchema.pre("save", function(next){
    let user =this;
    if(user.isModified("password")){
        bcrypt.genSalt(saltRounds, function(err,salt){
            if(err) return next(err);
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                next();
            })

        })
    } else{
        next();
    }
});

UserSchema.methods.generateToken = function(){
    let user = this;
    let token = jwt.sign({ id: user._id }, secret);
    user.token = token;
    this.save();
}


UserSchema.statics.findByToken = function(token, cb){
    let user = this;
    jwt.verify(token, secret, (err, decoded)=>{
        user.findOne({ _id: decoded.id }, function(err, user){
            if (err) return cb(err);
            cb(null, user);
        })
    })
}

const Users = mongoose.model('Users', UserSchema);

module.exports = Users