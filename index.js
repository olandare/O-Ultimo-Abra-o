require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

// Configura o cliente OAuth2 usando variáveis de ambiente
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,           // CLIENT_ID do seu projeto
    process.env.CLIENT_SECRET,       // CLIENT_SECRET do seu projeto
    process.env.REDIRECT_URI         // URI de redirecionamento configurada no Google
);

// Configura os tokens usando variáveis de ambiente
oauth2Client.setCredentials({
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    scope: process.env.SCOPE,
    token_type: process.env.TOKEN_TYPE,
    expiry_date: process.env.EXPIRY_DATE
});

app.post('/enviar', upload.array('photos', 5), async (req, res) => {
    try {
        // Inicializa o Google Drive API
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

        const photoLinks = [];

        // Upload das fotos para o Drive
        for (const file of req.files) {
            const response = await drive.files.create({
                requestBody: {
                    name: file.originalname,
                    parents: [process.env.FOLDER_ID]
                },
                media: {
                    mimeType: file.mimetype,
                    body: fs.createReadStream(file.path)
                }
            });
            
            photoLinks.push(`https://drive.google.com/file/d/${response.data.id}/view`);
            fs.unlinkSync(file.path); // Remove o arquivo temporário
        }

        // Tenta ler a planilha primeiro
        const checkSheet = await sheets.spreadsheets.get({
            spreadsheetId: process.env.SHEET_ID
        });
        
        console.log('Planilha encontrada:', checkSheet.data.properties.title);

        // Se chegou aqui, a planilha existe. Agora vamos tentar escrever
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Página1!A:D',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    req.body.name,
                    req.body.email,
                    req.body.message || '',
                    photoLinks.join(', ')
                ]]
            }
        });

        console.log('Resultado da escrita:', {
            atualizacoes: result.data.updates,
            planilhaId: process.env.SHEET_ID,
            dados: {
                nome: req.body.name,
                email: req.body.email,
                links: photoLinks
            }
        });

        res.json({
            success: true,
            message: 'Dados salvos com sucesso!',
            paymentLink: 'https://seu-link-de-pagamento.com'
        });

    } catch (error) {
        console.error('Erro detalhado:', {
            mensagem: error.message,
            codigo: error.code,
            status: error.response?.status,
            erro: error.response?.data?.error,
            planilhaId: process.env.SHEET_ID
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar os dados. Detalhes: ' + error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
