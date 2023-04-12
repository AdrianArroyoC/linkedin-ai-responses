/**
 * @fileoverview Configuration module for the application. Reads environment variables and exports a configuration object.
 */

const dotenv = require('dotenv');

const envExtension = process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '';
// General configuration
dotenv.config({
  path: `./envs/.env${envExtension}`,
});

/**
 * @typedef {object} Config
 * @property {string} port - The port the server listens on.
 * @property {boolean} headless - Whether to run the service in headless mode.
 * @property {string} cron - The cron schedule expression.
 * @property {object} openAI - OpenAI API configuration.
 * @property {string} openAI.apiKey - OpenAI API key.
 * @property {string} openAI.model - OpenAI model to use.
 * @property {object} chatCompletion - Chat completion configuration.
 * @property {string} chatCompletion.systemContent - System content for chat completion.
 * @property {string} chatCompletion.userContent - User content for chat completion.
 * @property {object} linkedIn - LinkedIn login credentials.
 * @property {string} linkedIn.email - LinkedIn email address.
 * @property {string} linkedIn.password - LinkedIn password.
 */

/**
 * @type {Config}
 */
module.exports = {
  port: process.env.PORT,
  headless: process.env.HEADLESS === 'true',
  cron: process.env.CRON,
  openAI: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
  },
  chatCompletion: {
    systemContent: process.env.CHAT_COMPLETION_SYSTEM_CONTENT,
    userContent: process.env.CHAT_COMPLETION_USER_CONTENT,
  },
  linkedIn: {
    email: process.env.LINKEDIN_EMAIL,
    password: process.env.LINKEDIN_PASSWORD,
  },
};
