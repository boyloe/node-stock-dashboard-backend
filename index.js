const express = require('express')
const app = express()

const knex = require('knex')
const config = require('./knexfile').development
const database = knex(config)
const bodyParser = require('body-parser')
const bcrypt =  require('bcrypt')
const jwt = require('jsonwebtoken')
const { response } = require('express')


app.use(bodyParser.json())

const port = process.env.PORT||4000

app.post('/users', (req, res) => {
    const { user } = req.body
    bcrypt.hash(user.password,12)
        .then(hashedPassword => {
            return database("users")
                .insert({ 
                    username: user.username,
                    password_hash: hashedPassword
                }).returning("*")            
        }).then(users => {
            const user = users[0]
            res.json({ user })
        }).catch(error => {
            res.json({ error: error.message})
        })
})

app.post("/login", (req, res) => {
    const { user } = req.body
    
    database('users')
        .select()
        .where({ username: user.username })
        .first()
        .then(retrievedUser => {
            if (!retrievedUser) throw new Error ('Invalid Username ')
            return Promise.all([
                bcrypt.compare(user.password, retrievedUser.password_hash),
                Promise.resolve(retrievedUser),
            ])
        }).then(results => {

            const [ arePasswordsTheSame, user ] = results

            if(!arePasswordsTheSame) throw new Error("Invalid Password")
            const payload = {username: user.username}
            const secret = process.env.SECRET||"SUPERSECRET!"            

            jwt.sign(payload, secret, (error, token) => {
                if (error) throw new Error('Signing did not work')

                res.json({ token })
            })
        }).catch(error => {
            res.json({ error: error.message})
        })
})


app.get("/lucky-charms", (request, response) => {
    const authHeader = request.get('Authorization')
    const token = authHeader.split(' ')[1]
    const secret = process.env.SECRET||"SUPERSECRET!"
    jwt.verify(token, secret, (error, payload) => {
        if (error) response.json({error: error.message})
        database("users")
            .select()
            .where({username: payload.username})
            .first()
            .then(user => {
                response.json({message: `${user.username} found me Lucky Charms`})
            }).catch(error => {
                response.json({error: error.message})
            })
    })
})

app.listen(port)
