const dotenv = require('dotenv');

const envExtension = process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '';
// General configuration
dotenv.config({
  path: `./envs/.env${envExtension}`,
});

module.exports = {
  port: process.env.PORT,
};
