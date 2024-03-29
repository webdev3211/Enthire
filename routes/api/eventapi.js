const express = require("express");

const router = express.Router();


const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

let em = "";
let emailsarr = [];

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}


function listEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    // calendar.events.list({
    //     calendarId: 'primary',
    //     timeMin: (new Date()).toISOString(),
    //     maxResults: 10,
    //     singleEvents: true,
    //     orderBy: 'startTime',
    // }, (err, res) => {
    //     if (err) return console.log('The API returned an error: ' + err);
    //     const events = res.data.items;
    //     if (events.length) {
    //         console.log('Upcoming 10 events:');
    //         events.map((event, i) => {
    //             const start = event.start.dateTime || event.start.date;
    //             console.log(`${start} - ${event.summary}`);
    //         });
    //     } else {
    //         console.log('No upcoming events found.');
    //     }
    // });

    // const em = email;




    var event = {
        'summary': 'The meeting for the A26 project is scheduled.',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to work with Etherio',
        'start': {
            'dateTime': '2019-11-23T09:08:00-07:00',
            'timeZone': 'Asia/Kolkata',
        },
        'end': {
            'dateTime': '2019-11-23T17:08:00-07:00',
            'timeZone': 'Asia/Kolkata',
        },
        'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=1'
        ],
        'attendees': [
            // { 'email': 'a@b.com' }
        ],
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 },
            ],
        },
    };


    // var obj = { 'email': 'bng442@gmail.com' };

    // event.attendees.push(obj);

    var size = emailsarr.length;



    for (var i = 0; i < size; i++) {
        emailsarr[i] = emailsarr[i].trim().toString();
        var obj = { 'email': `${emailsarr[i]}` };
        event.attendees.push(obj);
    }



    // console.log(event);
    // return;

    calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: event,
    }, function (err, event) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        console.log('Event created');
    });


}





router.post("/", (req, res) => {

    const email = req.body.email;

    // emailsarr = [];

    emailsarr = email.split(',');

    console.log(emailsarr);



    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) {
            return res.json({
                success: 'false',
            })
            // return console.log('Error loading client secret file:', err);
        }
        else {
            try {
                authorize(JSON.parse(content), listEvents);
                return res.json({
                    success: 'true',
                    'msg': 'All emails entered has been informed of the event'
                })

            } catch (err) {
                console.log('What the heck');
            }

        }        // Authorize a client with credentials, then call the Google Calendar API.
    });







});


module.exports = router;
