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
    const codeOld = req.query.code;
    const userId = req.query.userId;
    const url = req.query.url;
  
    try {
      var params = oauth.getParamsFromUrl(url);
      console.log(url);
      console.log(userId);
      var code = params.authorizationCode;
      var state = params.state;
      //const tokenObj = await getToken(code);
      const tokenObj = await oauth.fetchToken(code);
      const accessToken = tokenObj.accessToken;
      const refreshToken = tokenObj.refreshToken;
      console.log(JSON.stringify(tokenObj));

      /*const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: "Utente non trovato." });
      }
  
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
  
      await user.save();*/
  
      console.log(accessToken);
      console.log(refreshToken);
  
      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      console.error("Errore durante l'autenticazione:", error);
      res.status(500).json({ error: "Errore durante l'autenticazione.", error });
    }
  };
