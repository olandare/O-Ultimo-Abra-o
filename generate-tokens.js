const express = require('express');
const { google } = require('googleapis');
const credentials = require('./credentials.json');

const app = express();
const port = 3000;

const oauth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris[0]
);

const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets'
];

app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Seus tokens:', tokens);
        res.send('Tokens gerados com sucesso! Você pode fechar esta janela.');
        
        // Opcional: salvar os tokens em um arquivo
        const fs = require('fs');
        fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
    } catch (error) {
        console.error('Erro:', error);
        res.send('Erro ao gerar tokens.');
    }
});

app.get('/', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('Acesse o endereço acima no navegador para iniciar o processo de autorização');
});