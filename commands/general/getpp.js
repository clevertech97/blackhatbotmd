const axios = require('axios');

module.exports = {
    name: 'getpp',
    aliases: ['gp', 'getpic'],
    category: 'general',
    description: 'Get profile picture of a user (supports numbers with + and spaces)',
    usage: '.gp (reply, tag, or number)',
    
    async execute(sock, msg, args, extra) {
        try {
            let targetUser = null;

            // 1️⃣ Check if user replied to a message
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                targetUser = msg.message.extendedTextMessage.contextInfo.participant;
            } 
            // 2️⃣ Check if user is tagged
            else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
                targetUser = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } 
            // 3️⃣ If typed number (with + and spaces)
            else if (args.length > 0) {
                // Remove +, spaces, non-digit characters
                const num = args.join('').replace(/\D/g,'');
                targetUser = `${num}@s.whatsapp.net`;
            } 
            // 4️⃣ Fallback to sender
            else {
                targetUser = extra.sender;
            }

            if (!targetUser) return extra.reply('❌ Could not identify target user.');

            // 5️⃣ Fetch profile picture
            let ppUrl = '';
            try {
                ppUrl = await sock.profilePictureUrl(targetUser, 'image');
            } catch {
                // Fallback image
                ppUrl = 'https://files.catbox.moe/pjthvh.jpg';
            }

            // 6️⃣ Download image
            const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);

            // 7️⃣ Send forwarded style with thumbnail
            await sock.sendMessage(extra.from, {
                image: buffer,
                caption: `👤 Profile picture of @${targetUser.split('@')[0]}`,
                mentions: [targetUser],
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422524788798@newsletter',
                        newsletterName: '𝐛𝐥𝐚𝐜𝐤 𝐡𝐚𝐭 𝐛𝐨𝐭 𝐦𝐝'
                    }
                }
            }, { quoted: msg });

        } catch (error) {
            console.error('GetPP Error:', error);
            await extra.reply('❌ Profile picture not found or invalid number.');
        }
    }
};
