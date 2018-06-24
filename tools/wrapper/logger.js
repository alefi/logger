'use strict';

/*
 * @module Logger wrapper
 * @example how it can be used on your app
 */

const appDescriptor = require('../../package');
const Logger = require('../../src');

const options = {
    applicationId: appDescriptor.name,
    level: 'silly',
    prettyPrint: true,
    useTimezone: true
};

// setup common parameters that would be used by each of logger instances
Logger.configure(options);

module.exports = Logger;
