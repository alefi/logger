'use strict';

const Logger = require('..');
const sinon = require('sinon');
const test = require('ava');
const uuidV4 = require('uuid/v4');

test.before(Logger.configure);

test.beforeEach(t => {
    t.context.errorSpy = sinon.spy(console, 'error');
    t.context.logSpy = sinon.spy(console, 'log');

    t.context.ctx = {
        requestId: uuidV4(),
        source: __filename
    };
    t.context.message = 'smth happened';
    t.context.meta = { extraData: 12345 };
});

test.afterEach(t => {
    t.context.errorSpy.restore();
    t.context.logSpy.restore();
});

test('Should configured once', t => {
    t.notThrows(() => Logger.configure());
});

test('Should logs some messages', t => {
    const { ctx, errorSpy, logSpy, message, meta } = t.context;
    const log = new Logger('some test controller')
        .context(ctx)
        .tag('crud');

    t.notThrows(() => log.info(message, meta));
    t.notThrows(() => log.info(message));
    t.true(errorSpy.notCalled);
    t.true(logSpy.calledTwice);
});

test('Should appends and then completely overrides the context', t => {
    const { errorSpy, logSpy, message, meta } = t.context;
    const log = new Logger('some test controller');

    t.notThrows(() => log.context());
    t.notThrows(() => log.context({ adding: true }));
    t.notThrows(() => log.context({ newContext: { some: 'data' } }, true));
    t.notThrows(() => log.info(message, meta));
    t.true(errorSpy.notCalled);
    t.true(logSpy.calledOnce);
});

test('Should appends the tags', t => {
    const { errorSpy, logSpy, message, meta } = t.context;
    const log = new Logger('some test controller');

    t.notThrows(() => log.tag([ 'crud', 'user' ]));
    t.notThrows(() => log.tag('crud', 'user'));
    t.notThrows(() => log.info(message, meta));
    t.true(errorSpy.notCalled);
    t.true(logSpy.calledOnce);
});

test('Should create and store nested logger before the parent one', t => {
    const { ctx } = t.context;

    new Logger('entity.item').context(ctx);
    t.notThrows(() => new Logger('entity').context(ctx));
});

test('Should creates child logger and inherits at least parent\'s context and tags', t => {
    const { errorSpy, logSpy, message, meta } = t.context;
    const log = new Logger('some test controller')
        .context({ parent: true })
        .tag([ 'parent' ]);

    const child = log.child('child')
        .context({
            module: 'submodule',
            parent: false
        })
        .tag('child');

    t.notThrows(() => child.info(message, meta));
    t.true(errorSpy.notCalled);
    t.true(logSpy.calledOnce);
});

test('Should log error object using generic way', t => {
    const {errorSpy, logSpy } = t.context;
    const log = new Logger('some test controller').context({}, true);
    const testError = new Error('test error');

    t.notThrows(() => log.error(testError.message, testError));
    t.true(errorSpy.calledOnce);
    t.true(logSpy.notCalled);
});

test('Should log error object using logger\'s throw method and then throw an error', t => {
    const {errorSpy, logSpy } = t.context;
    const log = new Logger('some test controller');
    const typeError = new TypeError('test error');

    t.throws(() => log.throw(typeError), TypeError);
    t.true(errorSpy.calledOnce);
    t.true(logSpy.notCalled);
});
