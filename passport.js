const LocalStrategy = require("passport-local").Strategy,
             bcrypt = require("bcrypt"),
          { users } = require("./models")

function initialize(passport) {
    passport.use(new LocalStrategy({ usernameField: "username" }, (username, password, done) => {
        users.findOne( { username: username } )
        .then(async (user) => {
            if (!user) return done(null, false, { message: "Credenziali sbagliate/inesistenti." })
            else {
                try {
                    if (await bcrypt.compare(password, user.password)) return done(null, user)
                    else return done(null, false, { message: "Credenziali sbagliate/inesistenti." })
                } catch (err) { return done(err) }
            }
        })
        .catch((err) => console.log(err) )
    }))

    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        users.findById(id, (err, user) => {
            done(err, user)
        })
    })
}

module.exports = initialize
