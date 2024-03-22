const express = require('express');
const app = express()
const path =require('path')
const bodyparser = require('body-parser');
const { log } = require('console');
var var_arr = ['refresh the browser to see your events']

app.use(express.static(path.join(__dirname, 'public')))
app.set('views',__dirname+ '/public/views')
app.set('view engine','html')
app.engine('html', require('ejs').renderFile);
app.use (bodyparser.urlencoded({extended:true}))
app.use(bodyparser. json())

app.get('/',(req,res)=>{
      res.render("index.html")
})

app.post('/',(req,res)=>{

      const tkn =req.body.token
      console.log(tkn)
      const fs = require('fs').promises;
      const path = require('path');
      const process = require('process');
      const {authenticate} = require('@google-cloud/local-auth');
      const {google} = require('googleapis');
      
      // If modifying these scopes, delete token.json.
      const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
      // The file token.json stores the user's access and refresh tokens, and is
      // created automatically when the authorization flow completes for the first
      // time.
      const TOKEN_PATH = path.join(process.cwd(), 'token.json');
      const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
      
      /**
       * Reads previously authorized credentials from the save file.
       *
       * @return {Promise<OAuth2Client|null>}
       */
      async function loadSavedCredentialsIfExist() {
        try {
          const content = await fs.readFile(TOKEN_PATH);
          const credentials = JSON.parse(content);
          return google.auth.fromJSON(credentials);
        } catch (err) {
          return null;
        }
      }
      
      /**
       * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
       *
       * @param {OAuth2Client} client
       * @return {Promise<void>}
       */
      async function saveCredentials(client) {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
          type: 'authorized_user',
          client_id: key.client_id,
          client_secret: key.client_secret,
          refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(TOKEN_PATH, payload);
      }
      
      /**
       * Load or request or authorization to call APIs.
       *
       */
      async function authorize() {
        let client = await loadSavedCredentialsIfExist();
        if (client) {
          return client;
        }
        client = await authenticate({
          scopes: SCOPES,
          keyfilePath: CREDENTIALS_PATH,
        });
        if (client.credentials) {
          await saveCredentials(client);
        }
        return client;
      }
      
      /**
       * Lists the next 10 events on the user's primary calendar.
       * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
       */
      function listEvents(auth) {
            async function fun(){
            const calendar = await google.calendar({version: 'v3', auth});
            calendar.events.list({
              calendarId: 'primary',
              timeMin: (new Date()).toISOString(),
              maxResults: 30,
              singleEvents: true,
              orderBy: 'startTime',
            }, (err, res) => {
              if (err) return console.log('The API returned an error: ' + err);
              const events = res.data.items;
              if (events.length) {
                console.log('Your upcoming events:', events);
                events.map((event, i) => {
                  var_arr.push(event);
                });
              } else {
                console.log('No upcoming events found.');
              }
            });
          }
          fun()
          }
          res.send(var_arr)
      res.render("index.html")
})

app.listen(3000, ()=>{
console.log("server on port ")
})