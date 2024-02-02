const fs = require('fs');
const base64 = require('base64-js'); // Puoi utilizzare 'base64' per gestire base64 in Node.js
const axios = require('axios'); // Per le chiamate HTTP
const OpenAI = require('openai');

const MODEL_GPT_4_VISION = 'gpt-4-vision-preview';
const CURRENT_DIR = __dirname;
const MOCKED_RESPONSE = `
Customer Name: John Doe
Invoice Number: INV12345
Invoice Date: 2022-01-27
...
`;
const exampleText = `
{
  "type": "self_own_invoice",
  "entity": {
    "id": 1,
    "name": "META PLATFORMS IRELAND LIMITED",
    "vat_number": "9692928F",
    "tax_code": "",
    "address_street": "4 GRAND CANAL SQUARE, GRAND CANAL HARBOUR DUBLIN 2",
    "address_postal_code": "00000",
    "address_city": "IRLANDA",
    "address_province": "(EE)",
    "country": "IRELAND",
    "ei_code": "xxxxxxx",
  },
  "date": "2024-01-02",
  "number": 1,
  "numeration": "",
  "subject": "",
  "visible_subject": "“Autofattura per acquisto servizi dall'estero Acquisti di servizi da soggetti non residenti“. Fattura nr: 236936296 del 01/01/2024",
  "currency": {
    "id": "EUR"
  },
  "language": {
    "code": "it",
    "name": "Italiano"
  },
  "e_invoice": true,
  "items_list": [
    {
      "product_id": 4,
      "code": "tv3",
      "name": "Facebook - Invoice n. 236936296",
      "net_price": 4321.99,
      "category": "",
      "discount": 0,
      "qty": 1,
      "vat": {
        "id": 0
      },
      "stock": true,
      "description": "Autofattura per acquisto servizi dall'estero Acquisti di servizi da soggetti non residenti. Fattura nr: 236936296 del 01/01/2024",
      "not_taxable": false
    }
  ],
  "payments_list": [
    {
      "amount": 5272.83,
      "due_date": "2024-01-02"
    }
  ],
  "template": {
    "id": 150
  }
}
`;

const exampleImgPath = `${__dirname}/example.png`;
const exampleImgData = fs.readFileSync(exampleImgPath, { encoding: 'base64' });

const SYSTEM_PROMPT = `
You are an expert in analyzing invoices from Fatture in Cloud (https://developers.fattureincloud.it/) and invoices creation documentation from this url https://developers.fattureincloud.it/docs/guides/invoice-creation/, You take screenshots of a invoice from a client, and then you do a self invoice.

IMPORTANT:
  1. You MUST use the text in the screenshots and DO NOT come up with your own idea. The invoice should be read top to bottom, left to right. Read it as if you are the filler of the form and read it clearly and carefully.
  2. You will receive both text and image data from a PDF invoice.
  3. Your task is to extract and structure information such as customer name, invoice number, invoice date, total price invoice, and other relevant details.
  4. Return the structured information in a clear format.

EXAMPLE:
---
Text data from PDF:
${exampleText}
---
Image data from PDF:
![Image data from PDF](data:image/png;base64,${exampleImgData})
---
Structured Information:
"type": self_own_invoice (un'autofattura in cui l'emittente del documento appare sia come cliente che come fornitore),
"entity": {
  "name": Denominazione --> denominazione e ragione sociale dell’azienda,
  "vat_number": p.iva: dell’azienda laddove possibile, sennò lasciare vuoto,
  "address_street": indirizzo → città e indirizzo,
  "address_postal_code": cap → 00000,
  "address_city": città → NAZIONE (es: Londra → Gran Bretagna),
  "address_province": provincia → EE (in maiuscolo),
  "country": "Italia",
  "ei_code": codice Destinatario (7 volte x) → xxxxxxx
  },
  "date": data della fattura,
  "visible_subject": “Integrazione/autofattura per acquisto servizi dall’estero Acquisti di servizi da soggetti non residenti” seguito da “Fattura n. [invoice number] del [invoice date]”,
  "number": il numero progressivo della fattura, se omesso viene impostato automaticamente ( 'numero documento' , es. 107 ), è di tipo numero,
  "e_invoice": Deve essere impostata su true perchè fatture elettroniche,
  "items_list": [
      {
        "name": nome del prodotto o servizio,
        "qty": quantità del prodotto o servizio, deve essere di tipo numero,
        "description": descrizione del prodotto o servizio, inserendo anche il numero fattura ricevuta (se presente) e la data della fattura ricevuta dal fornitore estero,
        "net_price": prezzo del totale senza iva, deve essere di tipo numero,
        "discount": lo sconto percentuale che si applica al netto, deve essere di tipo numero,
        "vat": {
            "id": è l'iva nel paese, nel caso dell'italia 22%,
        }
      }
  ],
  "payments_list": [
    {
      "amount":  l'importo del pagamento di tipo numero,
    },
  ],
}
...
`;

const schema = `
"type": self_own_invoice (un'autofattura in cui l'emittente del documento appare sia come cliente che come fornitore),
"entity": {
  "name": Denominazione --> denominazione e ragione sociale dell’azienda,
  "vat_number": p.iva: dell’azienda laddove possibile, sennò lasciare vuoto,
  "address_street": indirizzo → città e indirizzo,
  "address_postal_code": cap → 00000,
  "address_city": città → NAZIONE (es: Londra → Gran Bretagna),
  "address_province": provincia → EE (in maiuscolo),
  "country": "Italia",
  "ei_code": codice Destinatario (7 volte x) → xxxxxxx
  },
  "date": data della fattura,
  "visible_subject": “Integrazione/autofattura per acquisto servizi dall’estero Acquisti di servizi da soggetti non residenti” seguito da “Fattura n. [invoice number] del [invoice date]”,
  "number": il numero progressivo della fattura, se omesso viene impostato automaticamente ( 'numero documento' , es. 107 ), è di tipo numero,
  "e_invoice": Deve essere impostata su true perchè fatture elettroniche,
  "items_list": [
      {
        "name": nome del prodotto o servizio,
        "qty": quantità del prodotto o servizio, deve essere di tipo numero,
        "description": descrizione del prodotto o servizio, inserendo anche il numero fattura ricevuta (se presente) e la data della fattura ricevuta dal fornitore estero,
        "net_price": prezzo del totale senza iva, deve essere di tipo numero,
        "discount": lo sconto percentuale che si applica al netto, deve essere di tipo numero,
        "vat": {
            "id": è l'iva nel paese, nel caso dell'italia 22%,
        }
      }
  ],
  "payments_list": [
    {
      "amount":  l'importo del pagamento di tipo numero,
    },
  ],
}`

/*
  "ei_raw": {
    "FatturaElettronicaBody": {
      "DatiGenerali": {
        "DatiGeneraliDocumento": [
          {
            "TipoDocumento": "TD17"
          }
        ]
      },
      "DatiFattureCollegate": {
        "IdDocumento": Number,
        "Data": AAAA-MM-GG,
      }
    }
  }
*/

const USER_PROMPT = `
Generate a self invoice json from screenshots and text of a invoice using the schema defined by Fatture in Cloud API: ${schema}.
`;

const bytesToDataUrl = (imageBytes, mimeType) => {
  const base64Image = base64.fromByteArray(imageBytes).toString('utf-8');
  return `data:${mimeType};base64,${base64Image}`;
};

const getImageUrl = (filePath) => {
  const imageBytes = fs.readFileSync(filePath);
  const mimeMapper = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  };
  return bytesToDataUrl(imageBytes, mimeMapper[filePath.slice(-4)]);
};

const EXAMPLE_IMG_URL = getImageUrl(`${CURRENT_DIR}/example.png`);

const createOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
};

const delayedIterator = (data) => {
  let index = 0;
  return {
    next: () => {
      if (index < data.length) {
        return Promise.resolve({ value: data[index++], done: false });
      } else {
        return Promise.resolve({ done: true });
      }
    },
  };
};

const streamOpenAIResponse = async (messages, callables, isMock) => {
  if (isMock) {
    const response = delayedIterator(MOCKED_RESPONSE.split('\n'));
    let fullResponse = '';
    let buffer = '';
    for await (const chunk of response) {
      fullResponse += chunk;
      buffer += chunk;
      if (buffer.endsWith('\n')) {
        callables.notify_frontend('OpenAI Mock Response', 'info');
        buffer = '';
      }
    }
    return fullResponse;
  } else {
    try {
      const openaiClient = createOpenAIClient(); 
      const response = await openaiClient.chat.completions.create({
        model: MODEL_GPT_4_VISION, //'gpt-4-turbo-preview',
        messages,
        stream: true,
        timeout: 600,
        maxTokens: 4096,
        temperature: 0,
      });
      let fullResponse = '';
      let buffer = '';
      for (const chunk of response) {
        const content = chunk.choices[0].delta.content || '';
        fullResponse += content;
        buffer += content;
        if (buffer.endsWith('\n')) {
          callables.notify_frontend('OpenAI API Response', 'info');
          buffer = '';
        }
      }
      return fullResponse;
    } catch (error) {
      console.error(error);
      callables.notify_frontend('OpenAI API Error', 'error');
      return null;
    }
  }
};

const generatePrompt = (configs) => {
  console.log("CONFIGS: ", configs);
  const pages = configs.imgDataUrl.length;
  const userPrompt = USER_PROMPT + `IMPORTANT: The PDF file has ${pages} page${pages <= 1 ? '' : 's'}, make sure to inference all of them.`;
  return [
    {
      role: 'system',
      content: SYSTEM_PROMPT.replace('{{exampleText}}', configs.pdfText).replace('{{exampleImageData}}', exampleImgData),
    },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: EXAMPLE_IMG_URL, detail: 'low' },
        },
        ...configs.imgDataUrl.map((imageDataUrl) => ({
          type: 'image_url',
          image_url: { url: imageDataUrl, detail: configs.isDetailHigh ? 'high' : 'low' },
        })),
        {
          type: 'text',
          text: userPrompt,
        },
      ],
    },
  ];
};

const inference = (configs, callables, isMock = true) => {
  const imgDataUrl = Array.from({ length: configs.imageCount }, (_, i) => {
    return getImageUrl(`${configs.runtimeDir}/${configs.session}-${i}.jpg`);
  });
  configs.imgDataUrl = imgDataUrl;
  callables.socket_emit_private({ cmd: 'pdf_screenshot', data: imgDataUrl });
  return streamOpenAIResponse(generatePrompt(configs), callables, isMock);
};

module.exports = {
    inference,
  };
