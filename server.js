// Importar dependências
const express = require('express');
const axios = require('axios');
const { google } = require('googleapis'); // Para integrar Google Sheets futuramente

const app = express();
app.use(express.json()); // Configura para interpretar JSON nas requisições

// Endpoint para receber confirmação de pagamento da Appmax
app.post('/pagamento-confirmado', async (req, res) => {
    const { email, status } = req.body;

    // Verifica se o status do pagamento é 'paid' (pago)
    if (status === 'paid') {
        console.log(`Pagamento confirmado para o e-mail: ${email}`);

        // Aqui, chamamos uma função para atualizar o status no Google Sheets (explicado anteriormente)
        await atualizarStatusNoGoogleSheets(email, 'pago');

        // Depois, iniciamos a criação do vídeo (essa função será configurada nas próximas etapas)
        iniciarCriacaoDeVideo(email);
    }

    res.status(200).send('Notificação de pagamento recebida com sucesso');
});

// Função para atualizar status de pagamento no Google Sheets
async function atualizarStatusNoGoogleSheets(email, status) {
    // Esta função será implementada em detalhes após a configuração básica
}

// Função para iniciar criação de vídeo (exemplo, configuração completa virá nas próximas etapas)
async function iniciarCriacaoDeVideo(email) {
    console.log(`Iniciando criação do vídeo para o e-mail: ${email}`);
    // Chamada à API da Lumalabs será implementada em etapas futuras
}

// Iniciar servidor na porta configurada
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
