const express = require('express');
const cron = require('node-cron');
const config = require('./config');

const app = express();
const port = config.port || 3000;

cron.schedule('* * * * *', () => {
  // eslint-disable-next-line no-console
  console.log('Running a job at every minute');
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
});
