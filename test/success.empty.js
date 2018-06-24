'use strict';

const _ = require('lodash');
const Logger = require('..');
const sinon = require('sinon');
const test = require('ava');
const levels = _.keys( require('../src/levels') );

test.before(() => Logger.configure({ level: 'non-existent-level' }));

test.beforeEach(t => {
    t.context.errorSpy = sinon.spy(console, 'error');
    t.context.logSpy = sinon.spy(console, 'log');
});

test.afterEach(t => {
    t.context.errorSpy.restore();
    t.context.logSpy.restore();
});

test('Should not logs anything', t => {
    const { errorSpy, logSpy } = t.context;
    const log = new Logger('some test controller');

    t.notThrows(() => levels.forEach(level => log[ level ]('this should not appears')));

    t.true(errorSpy.notCalled);
    t.true(logSpy.notCalled);
});
