/* L’identificativo interno della tua applicazione.  8207*/
var fattureInCloudSdk = require("@fattureincloud/fattureincloud-js-sdk");
const User = require("../models/user");
const axios = require("axios");

var oauth = new fattureInCloudSdk.OAuth2AuthorizationCodeManager(
  "wPtnjKSFF0NMhCmbHmCiy4VXKfecrr9P", //client id
  "6pmCvkztxUJXs1Kp2M9PxF1V8MdRmugKg6brrnZ9rsmFDSTVQtub82KYqjNiDplK",  // client secret
  "https://autoinvoicing-ai.netlify.app/oauth" //https://autoinvoicing-ai.netlify.app/oauth
);

var scopes = [
    fattureInCloudSdk.Scope.SETTINGS_ALL,
    fattureInCloudSdk.Scope.ISSUED_DOCUMENTS_INVOICES_READ,
  ]; 

exports.getUrlFatture = async (req, res) => {

    try {
      const scopes = [
        "entity.clients:a",
        "entity.suppliers:a",
        "products:a",
        "stock:a",
        "issued_documents.invoices:a",
        "issued_documents.credit_notes:a",
        "issued_documents.quotes:a",
        "issued_documents.proformas:a",
        "issued_documents.receipts:a",
        "issued_documents.delivery_notes:a",
        "issued_documents.orders:a",
        "issued_documents.work_reports:a",
        "issued_documents.supplier_orders:a",
        "received_documents:a",
        "receipts:a",
        "calendar:a",
        "archive:a",
        "taxes:a",
        "cashbook:a",
        "settings:a"
      ];
          
        const url = oauth.getAuthorizationUrl(scopes, "EXAMPLE_STATE");
        res.status(200).json(url);
        console.log(url);        
    } catch (error) {
        console.error(error);
    }
  };

  exports.callback = async (req, res) => {
    const url = req.query.url;
  
    try {
      var params = oauth.getParamsFromUrl(url);
      console.log(url);
      var code = params.authorizationCode;
      var state = params.state;

      const tokenObj = await oauth.fetchToken(code);
      const tokenOb = JSON.stringify(tokenObj);

      console.log(tokenOb);
  
      res.status(200).json({ tokenObj });
    } catch (error) {
      console.error("Errore durante l'autenticazione:", error);
      res.status(500).json({ error: "Errore durante l'autenticazione.", error });
    }
  };

  exports.saveToken = async (req, res) => {
    try {

      const { userId, access_token, refresh_token, expires_in } = req.body;
      console.log(req.body);
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'Utente non trovato.' });
      }
  
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      user.tokenExpiration = new Date(Date.now() + expires_in * 1000);
  
      await user.save();
  
      res.status(200).json({ message: 'Token salvati con successo.' });
    } catch (error) {
      console.error('Errore durante il salvataggio dei token:', error);
      res.status(500).json({ error: 'Errore durante il salvataggio dei token.' });
    }
  };
