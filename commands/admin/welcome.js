/**
 * Welcome - Enable/disable welcome messages
 */

const db = require('../../database');

module.exports = {
  name: 'welcome',
  aliases: ['welcomeon', 'welcomeoff'],
  category: 'admin',
  desc: 'Enable/disable welcome messages',
  usage: 'welcome on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();
      const groupSettings = db.getGroupSettings(groupId);

      if (!action || !['on', 'off'].includes(action)) {
        const status = groupSettings.welcome ? '✅ Enabled' : '❌ Disabled';
        return await sock.sendMessage(groupId, {
          text: `👋 *Welcome Messages*\n\nStatus: ${status}\nMessage: ${groupSettings.welcomeMessage}\n\nUsage: .welcome on/off\n\nTo customize: .setwelcome <message>`
        }, { quoted: msg });
      }

      const enable = action === 'on';
      db.updateGroupSettings(groupId, { welcome: enable });

      // Send forwarded notification
      await sock.sendMessage(groupId, {
        text: `✅ Welcome messages ${enable ? 'enabled' : 'disabled'}!${enable ? '\n\nNew members will now receive welcome messages.' : ''}`,
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
      console.error('Welcome Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Error: ${error.message}`
      }, { quoted: msg });
    }
  }
};
