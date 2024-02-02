const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const cors = require('cors');
const uuid = require('uuid');
const mongoose = require('mongoose');
const { register, login, googleLogin } = require('./controllers/auth');
const { getUrlFatture, callback, saveAccessToken, saveToken } = require('./controllers/fattureInCloud');
const http = require('http'); // Importa il modulo http per creare un server HTTP
const socketIo = require('socket.io');
const {
  savePdfToDisk,
  cleanupIntermediateFiles,
  extractPdfText,
  convertPdfToJpg,
} = require('./controllers/pdf');
const { inference } = require('./controllers/openai');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Crea un server HTTP da utilizzare con Express
const io = new socketIo.Server(server, {
  cors: {
    origin: '*',
  },
});

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

//GET PDF AND EXTRACT TEXT
const BASE_DIR = __dirname;
const RUNTIME_DIR = `${BASE_DIR}/runtime`;

try {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
} catch (error) {
  console.error('Error creating runtime directory:', error);
}

const MAX_PDF_PAGES = 3;

io.on('connection', async (socket) => {
  console.log('A user connected to the /openai namespace');

  socket.emit('server_command', { cmd: 'greeting', data: 'Joined to openai.' });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('upload_pdf', async (data) => {

    if (!data) {
      console.error('Dati del PDF non validi.');
      return;
    }
    const session = uuid.v4();

    savePdfToDisk(data, session);
    const imageCount = await convertPdfToJpg(session);

    if (imageCount === 0) {
      cleanupIntermediateFiles(session);
      return;
    }

    const pdfText = await extractPdfText(session);
    const configs = {
      session,
      runtimeDir: RUNTIME_DIR,
      imageCount,
      pdfText,
      isDetailHigh: data.is_detail_high || false,
    };

    const callables = {
      socket_emit_private: socket_emit_private,
      notify_frontend: notify_frontend,
    };

    socket_emit_private({
      cmd: 'ai_response_done',
      data: await inference(configs, callables, data.is_mock || false),
    });

    cleanupIntermediateFiles(session);
  });
});

function socket_emit_private(payload) {
  io.emit('server_command', payload);
}

function notify_frontend(message, type = 'success') {
  socket_emit_private({
    cmd: 'message',
    data: {
      message,
      type,
    },
  });
}

// AUTH
app.post('/auth/register', register);
app.post('/auth/login', login);
app.post('/auth/google-login', googleLogin);

// FATTURE IN CLOUD
app.get('/auth/authorize', getUrlFatture);
app.get('/auth/callback', callback);
app.post('/save-token', saveToken);

io.on('connection', (socket) => {
  console.log('Un client si è connesso tramite Socket.io');
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Il server è in ascolto sulla porta ${port}`);
});
