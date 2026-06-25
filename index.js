const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Desliga QR
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    })

   5511995507551
    if (!sock.authState.creds.registered) {
        const phoneNumber = '55XXXXXXXXXXX' // COLOCA SEU NÚMERO AQUI COM DDI 55 + DDD
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
