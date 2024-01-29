/* L’identificativo interno della tua applicazione.  8207*/
var fattureInCloudSdk = require("@fattureincloud/fattureincloud-js-sdk");

var oauth = new fattureInCloudSdk.OAuth2AuthorizationCodeManager(
  "wPtnjKSFF0NMhCmbHmCiy4VXKfecrr9P", //client id
  "6pmCvkztxUJXs1Kp2M9PxF1V8MdRmugKg6brrnZ9rsmFDSTVQtub82KYqjNiDplK",  // client secret
  "http://localhost:8000/oauth"
);

var scopes = [
    fattureInCloudSdk.Scope.SETTINGS_ALL,
    fattureInCloudSdk.Scope.ISSUED_DOCUMENTS_INVOICES_READ,
  ];

exports.saveAccessToken = async(req, res) => {
    try {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
  
    let query = req.url.split("?")[1];
    let params = new URLSearchParams(query);
  
    if (params.get("code") == null) {
      res.writeHead(302, {
        Location: oauth.getAuthorizationUrl(
          [fattureInCloudSdk.Scope.ENTITY_SUPPLIERS_READ],
          "EXAMPLE_STATE"
        ),
      });
      res.end();
    } else {
      try {
        let token = await oauth.fetchToken(params.get("code"));
  
        fs.writeFileSync(
          "./token.json",
          JSON.stringify(token, null, 4),
          (err) => {
            if (err) {
              console.error(err);
              return;
            }
          }
        );
        res.write("Token succesfully retrived and stored in token.json");
      } catch (e) {
        console.log(e);
      }
      res.end();
    }        
    } catch (error) {
        console.error(error);
    }

  }  

exports.getUrlFatture = async (req, res) => {
    try {
        const scopes = [
            fattureInCloudSdk.Scope.SETTINGS_ALL,
            fattureInCloudSdk.Scope.ISSUED_DOCUMENTS_INVOICES_READ,
          ];
          
        const url = oauth.getAuthorizationUrl(scopes, "EXAMPLE_STATE");
        res.status(200).json(url);
        console.log(url);        
    } catch (error) {
        console.error(error);
    }
  };

exports.callback = async (req, res) => {
    const params = oauth.getParamsFromUrl(req.originalUrl);
    const authorizationCode = params.authorizationCode;
  
    try {
      const tokenObj = await oauth.fetchToken(authorizationCode);
      const accessToken = tokenObj.accessToken;
      const refreshToken = tokenObj.refreshToken;
      
      console.log(accessToken)
      console.log(refreshToken)
      
      res.status(200).json({ message: "Autenticazione completata con successo." });
    } catch (error) {
      console.error("Errore durante l'autenticazione:", error);
      res.status(500).json({ error: "Errore durante l'autenticazione." });
    }
  };

