const crypto = require('crypto');
global.crypto = crypto;
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if(qr) {
            console.log('QR Code gerado! Escaneie com seu WhatsApp:')
            qrcode.generate(qr, {small: true})
        }
        
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('Conexão fechada, reconectando...', shouldReconnect)
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('Conectado ao WhatsApp!')
        }
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message || m.key.fromMe) return

        const messageText = m.message.conversation || m.message.extendedTextMessage?.text || ''
        const sender = m.key.remoteJid

        console.log('Mensagem recebida:', messageText)

        // Resposta automática simples
        if (messageText.toLowerCase().includes('oi') || messageText.toLowerCase().includes('olá')) {
            await sock.sendMessage(sender, { text: 'Olá! Sou o bot de vendas. Como posso te ajudar? 😊' })
        } else if (messageText.toLowerCase().includes('preço')) {
            await sock.sendMessage(sender, { text: 'Nossos preços começam em R$ 97. Quer saber mais?' })
        } else {
            await sock.sendMessage(sender, { text: 'Recebi sua mensagem! Em breve um atendente fala com você.' })
        }
    })
}

connectToWhatsApp()
