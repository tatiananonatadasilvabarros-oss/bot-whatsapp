const { webcrypto } = require('node:crypto')
globalThis.crypto = webcrypto

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const express = require('express')
const qrcode = require('qrcode-terminal')

async function iniciarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_bot')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Ubuntu', 'Chrome', '22.0.04']
    })

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        // AQUI QUE O QR CODE APARECE
        if(qr) {
            console.log('\n=== ESCANEIA O QR CODE ABAIXO ===')
            qrcode.generate(qr, { small: true })
            console.log('=== ABRE O WHATSAPP E ESCANEIA ===\n')
        }

        if(connection === 'close') {
            const deslogado = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut
            console.log('Conexão fechada. Reconectando:',!deslogado)
            if(!deslogado) iniciarBot()
            else console.log('Bot deslogado. Delete a pasta auth_bot no Render.')
        }
        else if(connection === 'open') {
            console.log('\n✅ BOT CONECTADO COM SUCESSO! PODE FECHAR OS LOGS\n')
        }
    })

    sock.ev.on('creds.update', saveCreds)

    // RESPOSTA AUTOMÁTICA PRA TESTE
    sock.ev.on('messages.upsert', async (msg) => {
        const mensagem = msg.messages[0]
        if (!mensagem.key.fromMe && msg.type === 'notify') {
            const texto = mensagem.message?.conversation || mensagem.message?.extendedTextMessage?.text
            const remetente = mensagem.key.remoteJid

            console.log('Mensagem recebida:', texto)

            if (texto?.toLowerCase() === 'oi') {
                await sock.sendMessage(remetente, {
                    text: 'Oi! Sou o bot de vendas da Tati 😎\n\nDigita *menu* pra ver as opções.'
                })
            }

            if (texto?.toLowerCase() === 'menu') {
                await sock.sendMessage(remetente, {
                    text: '📋 *MENU TATI VENDAS*\n\n1️⃣ Ver produtos\n2️⃣ Falar com atendente\n3️⃣ Horário de entrega\n\nDigite o número da opção'
                })
            }
        }
    })
}

iniciarBot()

// Servidor pro Render não dormir
const app = express()
const PORT = process.env.PORT || 3000
app.get('/', (req, res) => res.send('Bot da Tati Online ✅'))
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
