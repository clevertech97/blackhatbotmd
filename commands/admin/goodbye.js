/**
 * Goodbye - Enable/disable goodbye messages
 */

const db = require('../../database');

module.exports = {
  name: 'goodbye',
  aliases: ['goodbyeon', 'goodbyeoff'],
  category: 'admin',
  desc: 'Enable/disable goodbye messages',
  usage: 'goodbye on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();
      const groupSettings = db.getGroupSettings(groupId);

      if (!action || !['on', 'off'].includes(action)) {
        const status = groupSettings.goodbye ? '✅ Enabled' : '❌ Disabled';
        return await sock.sendMessage(groupId, {
          text: `👋 *Goodbye Messages*\n\nStatus: ${status}\nMessage: ${groupSettings.goodbyeMessage}\n\nUsage: .goodbye on/off\n\nTo customize: .setgoodbye <message>`
        }, { quoted: msg });
      }

      const enable = action === 'on';
      db.updateGroupSettings(groupId, { goodbye: enable });

      // Send forwarded notification
      await sock.sendMessage(groupId, {
        text: `✅ Goodbye messages ${enable ? 'enabled' : 'disabled'}!${enable ? '\n\nLeaving members will now receive goodbye messages.' : ''}`,
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
      console.error('Goodbye Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Error: ${error.message}`
      }, { quoted: msg });
    }
  }
};
