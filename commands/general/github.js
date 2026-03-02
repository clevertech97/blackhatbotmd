/**
 * GitHub Command - Interactive real-time stats + clickable buttons + forwarded
 */
const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'github',
    aliases: ['repo', 'git', 'source', 'sc', 'script'],
    category: 'general',
    description: 'Show bot GitHub repository with interactive stats and clickable buttons',
    usage: '.github [stars|forks|watchers|clone]',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        try {
            const chatId = extra.from;
            const repoUrl = 'https://github.com/clevertech97/blackhatbotmd';
            const apiUrl = 'https://api.github.com/repos/clevertech97/blackhatbotmd';

            const loadingMsg = await extra.reply('🔍 Fetching GitHub repository information...');

            try {
                const response = await axios.get(apiUrl, { headers: { 'User-Agent': 'blackhatbotmd' } });
                const repo = response.data;

                // Determine what to show based on args
                let caption = '';
                switch ((args[0] || '').toLowerCase()) {
                    case 'stars':
                        caption = `⭐ Stars: ${repo.stargazers_count.toLocaleString()}`;
                        break;
                    case 'forks':
                        caption = `🍴 Forks: ${repo.forks_count.toLocaleString()}`;
                        break;
                    case 'watchers':
                        caption = `👁️ Watchers: ${repo.watchers_count.toLocaleString()}`;
                        break;
                    case 'clone':
                        caption = `📥 Clone URL:\n\`git clone ${repo.clone_url}\``;
                        break;
                    default:
                        caption = `╭━━〔 *GitHub Repository* 〕━━┈⊷

🤖 *Bot Name:* ${config.botName}
🔗 *Repository:* ${repo.name}
👨‍💻 *Owner:* ${repo.owner.login}
📄 *Description:* ${repo.description || 'No description provided'}
🌐 *URL:* ${repo.html_url}

📊 *Repository Statistics*
⭐ Stars: ${repo.stargazers_count.toLocaleString()}
🍴 Forks: ${repo.forks_count.toLocaleString()}
👁️ Watchers: ${repo.watchers_count.toLocaleString()}
📦 Size: ${(repo.size / 1024).toFixed(2)} MB

╰━━━━━━━━━━━━━━━━━━━┈⊷
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.botName}*`;
                        break;
                }

                // Clickable URL buttons
                const templateButtons = [
                    { urlButton: { displayText: '⭐ Star', url: `${repo.html_url}/stargazers` } },
                    { urlButton: { displayText: '🍴 Fork', url: `${repo.html_url}/fork` } },
                    { urlButton: { displayText: '📥 Clone', url: `https://github.com/clevertech97/blackhatbotmd.git` } }
                ];

                // Send forwarded message with thumbnail, caption, buttons
                await sock.sendMessage(chatId, {
                    image: { url: repo.owner.avatar_url },
                    caption: caption,
                    templateButtons: templateButtons,
                    headerType: 4,
                    mentions: [extra.sender],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363422524788798@newsletter',
                            newsletterName: '𝐛𝐥𝐚𝐜𝐤 𝐡𝐚𝐭 𝐛𝐨𝐭 𝐦𝐝'
                        }
                    }
                });

            } catch (apiError) {
                console.error('GitHub API Error:', apiError.message);

                const fallbackCaption = `╭━━〔 *GitHub Repository* 〕━━┈⊷

🤖 *Bot Name:* ${config.botName}
🔗 *Repository:* 𝐛𝐥𝐚𝐜𝐤 𝐡𝐚𝐭 𝐛𝐨𝐭 𝐦𝐝
👨‍💻 *Owner:* clevertech97
🌐 URL: ${repoUrl}

⚠️ Unable to fetch real-time stats. Please visit repository directly.

╰━━━━━━━━━━━━━━━━━━━┈⊷
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.botName}*`;

                await sock.sendMessage(chatId, {
                    image: { url: 'https://i.ibb.co/2k7V8dM/default-avatar.png' },
                    caption: fallbackCaption,
                    templateButtons: [
                        { urlButton: { displayText: '🌐 Open Repo', url: repoUrl } }
                    ],
                    headerType: 4,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363422524788798@newsletter',
                            newsletterName: '𝐛𝐥𝐚𝐜𝐤 𝐡𝐚𝐭 𝐛𝐨𝐭 𝐦𝐝'
                        }
                    }
                });
            }

        } catch (error) {
            console.error('GitHub command error:', error);
            await extra.reply(`❌ Error: ${error.message}`);
        }
    }
};
