/**
 * @fileoverview Chat completion utility using the OpenAI API.
 */

const { Configuration, OpenAIApi } = require('openai');
const config = require('../config');
const { apiKey, model } = config.openAI;
const { systemContent, userContent } = config.chatCompletion;
const configuration = new Configuration({ apiKey });
const openai = new OpenAIApi(configuration);

/**
 * Generate a response using the OpenAI chat completion API.
 * @param {string} content - The input content for the API.
 * @returns {string} The generated response from the API.
 */
async function chatCompletion(content) {
  const dateTimeContent = `Depending on how long ago the messages were sent, apologize for the delay, consider that current date is ${new Date()}.`;
  const languageCodeContent =
    'Add to the end the ISO 639-1 of the language you use in the completion inside brackets, i.e. [en] for English.';
  try {
    const messages = [
      {
        role: 'system',
        content: systemContent,
      },
      {
        role: 'user',
        content: `${userContent}${dateTimeContent}${content}${languageCodeContent}`,
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
