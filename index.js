const { webcrypto } = require('node:crypto')
globalThis.crypto = webcrypto
const { webcrypto } = require('node:crypto')
globalThis.crypto = webcrypto

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const express = require('express')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    })

    if (!sock.authState.creds.registered) {
        const phoneNumber = '5511995507551'
        const code = await sock.requestPairingCode(phoneNumber)
        console.log(`SEU CÓDIGO DE PAREAMENTO: ${code}`)
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update
        if(connection === 'open') {
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
