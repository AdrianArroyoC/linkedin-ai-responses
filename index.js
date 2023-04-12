/**
 * @fileoverview Main entry point for the application. Sets up an Express server, schedules a cron job to run the LinkedIn service, and starts the server.
 */

const express = require('express');
const cron = require('node-cron');
const config = require('./config');
const LinkedInClass = require('./services/linkedIn.service');

const app = express();
const port = config.port || 3000;

/**
 * Schedules a cron job to run the LinkedIn service at the specified interval.
 */
cron.schedule(config.cron, () => {
  // eslint-disable-next-line no-console
  console.log('Running cron job..');
  const linkedIn = new LinkedInClass();
  linkedIn.run();
});

/**
 * Handles HTTP GET requests to the root path and returns a plain text response.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.get('/', (req, res) => {
  res.send('Server running...');
});

/**
 * Starts the Express server and listens for incoming connections.
 */
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Server in ${
      process.env.NODE_ENV || 'local'
    } mode, listening on port ${port}!`,
  );
  // For local testing
  // if (process.env.NODE_ENV === 'local') {
  //   const linkedIn = new LinkedInClass();
  //   linkedIn.run();
  // }
});
