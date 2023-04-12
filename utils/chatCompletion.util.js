const { Configuration, OpenAIApi } = require('openai');
const config = require('../config');
const { apiKey, model } = config.openAI;
const { systemContent, userContent } = config.chatCompletion;
const configuration = new Configuration({ apiKey });
const openai = new OpenAIApi(configuration);

async function chatCompletion(content) {
  try {
    const messages = [
      {
        role: 'system',
        content: systemContent,
      },
      {
        role: 'user',
        content: `${userContent}${content}`,
      },
    ];
    const response = await openai.createChatCompletion({
      model,
      messages,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
}

module.exports = { chatCompletion };
