'use strict';

const Logger = require('..');
const sinon = require('sinon');
const test = require('ava');
const uuid = require('uuid');

test.before(() => Logger.configure({
    dateFormat: null,
    level: 'silly',
    prettyPrint: true,
    timestamp: false
}));

test.beforeEach(t => {
    t.context.errorSpy = sinon.spy(console, 'error');
    t.context.logSpy = sinon.spy(console, 'log');

    t.context.ctx = {
        requestId: uuid.v4(),
        source: __filename
    };
    t.context.message = 'smth happened';
    t.context.meta = { extraData: 12345 };
});

test.afterEach(t => {
    t.context.errorSpy.restore();
    t.context.logSpy.restore();
});

test('Should logs some messages (including empty one)', t => {
    const { errorSpy, logSpy, message, meta } = t.context;
    const log = new Logger('some test controller');

    t.notThrows(() => log.debug(message, meta));
    t.notThrows(() => log.info(message));
    t.notThrows(() => log.warn(meta));
    t.true(errorSpy.notCalled);
    t.true(logSpy.calledThrice);
});
