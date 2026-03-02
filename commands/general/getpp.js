const axios = require('axios');

module.exports = {
  name: 'getpp',
  aliases: ['gp', 'getpic'],
  category: 'general',
  description: 'Get profile picture of a user',
  usage: '.getpp (reply to message, tag user, or enter number)',
  
  async execute(sock, msg, args, extra) {
    try {
      let targetUser = null;

      // 1️⃣ Check if it's a reply
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMessage) {
        targetUser = msg.message.extendedTextMessage.contextInfo.participant;
      }

      // 2️⃣ Check if user is tagged
      if (!targetUser) {
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJid && mentionedJid.length > 0) {
          targetUser = mentionedJid[0];
        }
      }

      // 3️⃣ Check if args provided (number input, may have spaces)
      if (!targetUser && args[0]) {
        let number = args.join('').replace(/\D/g, ''); // remove spaces & non-digits
        if (!number.includes('@s.whatsapp.net')) {
          number += '@s.whatsapp.net';
        }
        targetUser = number;
      }

      // 4️⃣ Default to sender if none
      if (!targetUser) targetUser = extra.sender;

      if (!targetUser) {
        return extra.reply('❌ Could not identify target user. Reply, tag, or provide a number.');
      }

      // 5️⃣ Try to get profile picture
      let ppUrl = '';
      try {
        ppUrl = await sock.profilePictureUrl(targetUser, 'image');
      } catch {
        ppUrl = 'https://i.ibb.co/2k7V8dM/default-avatar.png'; // fallback avatar
      }

      const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // 6️⃣ Send as forwarded
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
      return extra.reply('❌ Unable to fetch profile picture at this time.');
    }
  }
};
