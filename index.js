const { webcrypto } = require('node:crypto')
globalThis.crypto = webcrypto

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const express = require('express')
const qrcode = require('qrcode-terminal')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if(qr) {
            console.log('ESCANEIA O QR CODE ABAIXO:')
            qrcode.generate(qr, {small: true})
        }
        
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Conexão fechada, reconectando:', shouldReconnect)
            if(shouldReconnect) connectToWhatsApp()
        } else if(connection === 'open') {
            console.log('BOT CONECTADO! PODE FECHAR O LOG')
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()

const app = express()
const PORT = process.env.PORT || 3000
app.get('/', (req, res) => res.send('Bot online'))
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
