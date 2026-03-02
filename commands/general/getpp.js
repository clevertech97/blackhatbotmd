const axios = require('axios');

module.exports = {
  name: 'getpp',
  aliases: ['gp', 'getpic'],
  category: 'general',
  description: 'Get profile picture of a user',
  usage: '.getpp (reply, tag, or number)',
  
  async execute(sock, msg, args, extra) {
    try {
      let targetUser = null;

      // 1️⃣ If reply, get the sender of the quoted message
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMessage) {
        targetUser = msg.message.extendedTextMessage.contextInfo.participant;
      } 
      // 2️⃣ If mention, get the first mentioned user
      else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        targetUser = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } 
      // 3️⃣ If a number is passed as arguments
      else if (args.length > 0) {
        // join all args and remove all non-digit characters
        const number = args.join('').replace(/\D/g, '');
        if (number) targetUser = `${number}@s.whatsapp.net`;
      } 
      // 4️⃣ Default: sender
      else {
        targetUser = extra.sender;
      }

      if (!targetUser) {
        return extra.reply('❌ Could not identify the target user. Reply, tag, or provide a number.');
      }

      try {
        // Fetch profile picture URL
        const ppUrl = await sock.profilePictureUrl(targetUser, 'image');
        if (!ppUrl) return extra.reply('❌ Profile picture not found.');

        // Download picture
        const response = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 20000 });
        const buffer = Buffer.from(response.data);

        // Send as reply
        await sock.sendMessage(extra.from, {
          image: buffer,
          caption: `👤 Profile picture of @${targetUser.split('@')[0]}`,
          mentions: [targetUser]
        }, { quoted: msg });

      } catch (err) {
        if (err.message?.includes('item-not-found') || err.message?.includes('not found')) {
          return extra.reply('❌ Profile picture not found.');
        } else if (err.message?.includes('forbidden') || err.message?.includes('unauthorized')) {
          return extra.reply('❌ Profile picture is private or unavailable.');
        } else {
          return extra.reply('❌ Could not fetch profile picture.');
        }
      }

    } catch (error) {
      return extra.reply('❌ Could not fetch profile picture due to an error.');
    }
  }
};
