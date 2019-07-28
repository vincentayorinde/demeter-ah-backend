import AWS from 'aws-sdk';

AWS.config.loadFromPath(`${__dirname}/creds.json`);
