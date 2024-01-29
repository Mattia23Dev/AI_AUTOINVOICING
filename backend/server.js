const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { register, login, googleLogin } = require('./controllers/auth');
const { getUrlFatture, callback, saveAccessToken } = require('./controllers/fattureInCloud');
require('dotenv').config();

const app = express();
const router = express.Router();
const port = process.env.PORT || 8000;

mongoose.connect(process.env.DB_CONNECT)
  .then(() => {
    console.log('Connessione a MongoDB Atlas avvenuta con successo');
  })
  .catch((error) => {
    console.error('Errore durante la connessione a MongoDB Atlas:', error);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
  })
);

//AUTH
app.post('/auth/register', register);
app.post('/auth/login', login);
app.post('/auth/google-login', googleLogin);

//FATTURE IN CLOUD
app.get('/auth/authorize', getUrlFatture);
app.get('/auth/callback', callback);

app.listen(port, () => {
  console.log(`Il server è in ascolto sulla porta ${port}`);
});
