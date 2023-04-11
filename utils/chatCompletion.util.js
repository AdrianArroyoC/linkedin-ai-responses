const { Configuration, OpenAIApi } = require('openai');
const { openAI } = require('../config');
const configuration = new Configuration({
  apiKey: openAI.apiKey,
});
const openai = new OpenAIApi(configuration);

async function chatCompletion(content) {
  try {
    const { model } = openAI;
    const messages = [
      {
        role: 'system',
        content:
          'You are an assistant that helps answer unread messages on LinkedIn.',
      },
      {
        role: 'user',
        content,
      },
    ];
    const response = await openai.createChatCompletion({
      model,
      messages,
    });
    return response.data.choices[0].text;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
}

module.exports = { chatCompletion };
