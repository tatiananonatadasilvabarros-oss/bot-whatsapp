const crypto = require('crypto');
global.crypto = crypto;

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // FORÇA O QR CODE
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if(qr) {
            console.log('===== ESCANEIA O QR CODE ABAIXO =====')
            qrcode.generate(qr, {small: false})
            console.log('=====================================')
        }
        
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Conexão fechada, reconectando...', shouldReconnect)
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('CONECTADO COM SUCESSO NO WHATSAPP!')
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()
