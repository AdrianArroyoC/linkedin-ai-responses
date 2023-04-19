/* eslint-disable no-console */
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
if (config.cron) {
  cron.schedule(config.cron, () => {
    console.log('Running cron job..');
    const linkedIn = new LinkedInClass();
    linkedIn.run();
  });
}

/**
 * Handles HTTP GET requests to the root path and returns a plain text response.
 * @name Main route
 * @path {GET} /
 * @response {string} Server running...
 * @code {200} Success
 */
app.get('/', (req, res) => {
  res.send('Server running...');
});

/**
 * Run the LinkedIn service.
 * @name LinkedIn service
 * @path {POST} /linkedin
 * @response {string} LinkedIn service running...
 * @code {200} Success
 */
app.post('/linkedin', (req, res) => {
  const linkedIn = new LinkedInClass();
  linkedIn.run();
  res.send('LinkedIn service running...');
});

/**
 * Starts the Express server and listens for incoming connections.
 */
app.listen(port, () => {
  console.log(
    `Server in ${
      process.env.NODE_ENV || 'local'
    } mode, listening on port ${port}!`,
  );
});
