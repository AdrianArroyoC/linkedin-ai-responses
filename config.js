const dotenv = require('dotenv');

const envExtension = process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '';
// General configuration
dotenv.config({
  path: `./envs/.env${envExtension}`,
});

module.exports = {
  port: process.env.PORT,
  headless: process.env.HEADLESS === 'true',
  openAI: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
  },
  linkedIn: {
    email: process.env.LINKEDIN_EMAIL,
    password: process.env.LINKEDIN_PASSWORD,
  },
};
