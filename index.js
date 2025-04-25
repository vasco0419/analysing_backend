const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors')
const mongoose = require('mongoose');

dotenv.config()
mongoose.connect(process.env.DATABASE_URL)

const db = mongoose.connection;
db.once("open", () => console.log("Connected to MongoDB"));

const routes = require('./routes');

dotenv.config()
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api', routes)

const port = process.env.PORT

app.listen(port, () => {
  console.info(`server started on port ${port}`); // eslint-disable-line no-console
});