const express = require('express')
const app = express()

const knex = require('knex')
const config = require('./knexfile').development
const database = knex(config)

const port = process.env.PORT||4000

app.post('/users', (req, res) => {
    res.json({message: 'working'})
})

app.listen(port)