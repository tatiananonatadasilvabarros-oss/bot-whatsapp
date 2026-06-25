const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // ESSA LINHA É OBRIGATÓRIA NO RENDER
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('CONECTADO! BOT ONLINE!')
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()
