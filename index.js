const express = require('express');
const cron = require('node-cron');
const config = require('./config');
const LinkedInClass = require('./services/linkedIn.service');

const app = express();
const port = config.port || 3000;

cron.schedule(config.cron, () => {
  // eslint-disable-next-line no-console
  console.log('Running cron job..');
  const linkedIn = new LinkedInClass();
  linkedIn.run();
});

app.get('/', (req, res) => {
  res.send('Server running...');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Server in ${
      process.env.NODE_ENV || 'local'
    } mode, listening on port ${port}!`,
  );
  // For local testing
  if (process.env.NODE_ENV === 'local') {
    const linkedIn = new LinkedInClass();
    linkedIn.run();
  }
});
