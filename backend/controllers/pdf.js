const fs = require('fs');
const uuid = require('uuid');
//const PdfReader = require('pdf2json');
const gm = require('gm');
const pdf = require('pdf-parse');
const PDFParser = require('pdf2json');
const pdf2image = require('pdf2image');
const {fromPath, fromBuffer} = require('pdf2pic');

const BASE_DIR = __dirname;
const RUNTIME_DIR = `${BASE_DIR}/runtime`;

try {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
} catch (error) {
  console.error('Error creating runtime directory:', error);
}

const MAX_PDF_PAGES = 3;

function savePdfToDisk(data, session) {
  //console.log(data);
  //const pdfData = data.split('base64,')[1];
  //const pdfData = data.toString('base64');
  //const pdfBuffer = Buffer.from(pdfData, 'base64');
  fs.writeFileSync(`${RUNTIME_DIR}/${session}.pdf`, data);
}

function cleanupIntermediateFiles(session) {
  fs.readdirSync(RUNTIME_DIR).forEach((file) => {
    if (file.startsWith(session)) {
      fs.unlinkSync(`${RUNTIME_DIR}/${file}`);
    }
  });
}

/*function extractPdfText(session) {
  const pdfText = [];
  const pdfPath = `${RUNTIME_DIR}/${session}.pdf`;

  if (!fs.existsSync(pdfPath)) {
    console.error(`Il file PDF ${pdfPath} non esiste.`);
    return null;
  }

  const pdfData = fs.readFileSync(pdfPath);
  const pdfParser = new PDFParser();

  pdfParser.on("pdfParser_dataError", errData => {
    console.error("Errore durante l'analisi del PDF:", errData.parserError);
    return null;
  });

  pdfParser.on("pdfParser_dataReady", pdfData => {
    pdfData.formImage.Pages.forEach(page => {
      const pageText = page.Texts.map(text => decodeURIComponent(text.R[0].T)).join(" ");
      pdfText.push(pageText);
    });

    const pdfTextString = pdfText.join('\n---***---\n');

    fs.writeFileSync(`${RUNTIME_DIR}/${session}.txt`, pdfTextString);
    console.log('Estrazione del testo PDF completata', pdfTextString);
    return pdfTextString;
  });

  pdfParser.loadPDF(pdfPath);
}*/

async function extractPdfText(session) {
  const pdfPath = `${RUNTIME_DIR}/${session}.pdf`;

  if (!fs.existsSync(pdfPath)) {
    console.error(`Il file PDF ${pdfPath} non esiste.`);
    return null;
  }

  try {
    const dataBuffer = fs.readFileSync(pdfPath);

    const data = await pdf(dataBuffer);
    const pdfText = data.text;

    fs.writeFileSync(`${RUNTIME_DIR}/${session}.txt`, pdfText);
    console.log('Estrazione del testo PDF completata', pdfText);

    return pdfText;
  } catch (error) {
    console.error("Errore durante l'estrazione del testo dal PDF:", error);
    return null;
  }
}

/*async function convertPdfToJpg(session) {
  const outputPath = "./images";
  const pdfPath = `${RUNTIME_DIR}/${session}.pdf`;
  const options = {
    density: 100,
    saveFilename: "untitled",
    savePath: outputPath,
    format: "png",
    width: 600,
    height: 600
  };
  try {
    //const convert = fromPath(pdfPath, options);
    //const images = await convert(1, { responseType: "base64" })
    const converter = fromBuffer(fs.readFileSync(pdfPath), options);
    const images = await converter(1);

    if (images.length > MAX_PDF_PAGES) {
      return 0;
    }
    console.log(images);
    const imagePath = `${RUNTIME_DIR}/${session}-1.jpg`;
    fs.writeFileSync(imagePath, images);
    images.forEach((imageBase64, index) => {
      const imagePath = `${RUNTIME_DIR}/${session}-${index}.jpg`;
      const imageBuffer = Buffer.from(imageBase64, "base64");
      fs.writeFileSync(imagePath, imageBuffer);
    });
    console.log('Convert pdf to img OK');
    //return images.length;
    return 1;
  } catch (error) {
    console.error(error);
    return 0;
  }
}*/

async function convertPdfToJpg(session) {
  const outputPath = "./images";
  const pdfPath = `${RUNTIME_DIR}/${session}.pdf`;
  const outputImagePath = `${RUNTIME_DIR}/${session}-1.jpg`;

  try {
    gm()
      .command('convert') // Utilizziamo il comando 'convert' di GraphicsMagick
      .in(pdfPath) // File di input PDF
      .density(100, 100) // Imposta la densità in DPI
      .resize(600, 600) // Ridimensiona l'immagine
      .quality(75) // Imposta la qualità dell'immagine
      .background('#FFFFFF') // Imposta il colore di sfondo
      .flatten() // Appiattisce l'immagine
      .write(outputImagePath, function (err) {
        if (!err) {
          console.log('Convertito PDF in immagine con successo.');
        } else {
          console.error('Errore durante la conversione del PDF in immagine:', err);
        }
      });
  } catch (error) {
    console.error(error);
    return 0;
  }
}

module.exports = {
  savePdfToDisk,
  cleanupIntermediateFiles,
  extractPdfText,
  convertPdfToJpg,
};
