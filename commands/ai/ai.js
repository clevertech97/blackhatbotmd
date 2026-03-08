/**
 * AI Chat Command - ChatGPT-style responses (Fixed for Malvin GPT-5)
 */

const APIs = require('../../utils/api');

module.exports = {
  name: 'ai',
  aliases: ['gpt', 'chatgpt', 'ask'],
  category: 'ai',
  description: 'Chat with AI (ChatGPT-style)',
  usage: '.ai <question>',

  async execute(sock, msg, args, extra) {
    try {
      if (!args || args.length === 0) {
        return extra.reply(
          '❌ Usage: .ai <question>\n\nExample: .ai What is the capital of France?'
        );
      }

      // Join args into string
      const question = args.join(' ');

      // Call AI API
      const response = await APIs.chatAI(question);

      // Extract the actual AI answer from the API response
      let answer = '';

      if (response) {
        // Malvin GPT-5 API returns 'result' field for the actual answer
        if (typeof response.result === 'string' && response.result.trim() !== '') {
          answer = response.result;
        } else if (typeof response.msg === 'string') {
          answer = response.msg;
        } else {
          // fallback: convert entire object to string (JSON)
          answer = JSON.stringify(response, null, 2);
        }
      } else {
        answer = '❌ No response from AI';
      }

      // Send back the clean AI answer
      await extra.reply(answer);

    } catch (error) {
      await extra.reply(`❌ AI Error: ${error.message || error}`);
    }
  }
};
