let mongoose = require('mongoose')
let bcrypt = require('bcryptjs')

// TODO: Create user schema
let userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    }, 
    lastname: String,
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 6
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    pic: String,
    admin: {
        type: Boolean,
        default: false
    }
})

//hash passwords - done can be called anything
userSchema.pre('save', function(done){
    //hash if it's a ne, as opposed to modified
    if (this.isNew){
        this.password = bcrypt.hashSync(this.password, 12)
    }
    //indicate were ok to move on
    done()
})

//make a JSON representation of the user (for sending on the JWT payload)
userSchema.set('toJSON', {
    transform: (doc, user) => {
        delete user.password
        delete user.lastname
        delete user.__v
        return user
    }
})

//make a function that compares passwords
userSchema.methods.validPassword = function (typedPassword) {
    //typed passowrd: plain text, just typed in by user
    //this.password: stored hashed password
    return bcrypt.compareSync(typedPassword, this.password)
}

// TODO: Export user model
module.exports = mongoose.model('User', userSchema)