const { google } = require('googleapis');
const credentials = require('./credentials.json');

const oauth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris[0]
);

// Cole o código que você recebeu aqui
const code = 'COLE_O_CODIGO_AQUI';

async function getTokens() {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Seus tokens:', tokens);
    } catch (error) {
        console.error('Erro:', error);
    }
}

getTokens();