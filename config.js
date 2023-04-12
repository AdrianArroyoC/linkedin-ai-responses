const dotenv = require('dotenv');

const envExtension = process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '';
// General configuration
dotenv.config({
  path: `./envs/.env${envExtension}`,
});

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
