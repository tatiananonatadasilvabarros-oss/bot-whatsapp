const crypto = require('crypto');
global.crypto = crypto;

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_' + Date.now())
    
    const sock = makeWASocket({
        auth: state,
        browser: ['Bot WhatsApp', 'Chrome', '1.0.0']
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update
        
        if(qr) {
            console.log('===== ESCANEIA O QR CODE AGORA =====')
            qrcode.generate(qr, { small: false })
            console.log('===================================')
        }
        
        if(connection === 'open') {
            console.log('BOT CONECTADO NO WHATSAPP!')
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

startBot()
