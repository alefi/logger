'use strict';

const Logger = require('..');
const sinon = require('sinon');
const test = require('ava');
const uuidV4 = require('uuid/v4');

test.before(t => {
    t.context.sandbox = sinon.createSandbox();
    t.context.sandbox.spy(console, 'error');
    t.context.sandbox.spy(console, 'log');
    Logger.configure();
});

test.beforeEach(t => {
    t.context.ctx = {
        requestId: uuidV4(),
        source: __filename
    };
    t.context.message = 'smth happened';
    t.context.meta = { extraData: 12345 };
    t.context.sandbox.resetHistory();
});

test.after(t => t.context.sandbox.verifyAndRestore());

test('Should configured once', t => {
    t.notThrows(() => Logger.configure());
});

test('Should create and store nested logger before the parent one', t => {
    const { ctx } = t.context;

    new Logger('entity.item').context(ctx);
    t.notThrows(() => new Logger('entity').context(ctx));
});

test.serial('Should logs some messages', t => {
    const { ctx, message, meta, sandbox } = t.context;
    const log = new Logger('some test controller')
        .context(ctx)
        .tag('crud');

    t.notThrows(() => log.info(message, meta));
    t.notThrows(() => log.info(message));
    sandbox.assert.notCalled(console.error);
    sandbox.assert.calledTwice(console.log);
});

test.serial('Should appends and then completely overrides the context', t => {
    const { message, meta, sandbox } = t.context;
    const log = new Logger('some test controller');

    t.notThrows(() => log.context());
    t.notThrows(() => log.context({ adding: true }));
    t.notThrows(() => log.context({ newContext: { some: 'data' } }, true));
    t.notThrows(() => log.info(message, meta));
    sandbox.assert.notCalled(console.error);
    sandbox.assert.calledOnce(console.log);
});

test.serial('Should appends the tags', t => {
    const { message, meta, sandbox } = t.context;
    const log = new Logger('some test controller');

    t.notThrows(() => log.tag([ 'crud', 'user' ]));
    t.notThrows(() => log.tag('crud', 'user'));
    t.notThrows(() => log.info(message, meta));
    sandbox.assert.notCalled(console.error);
    sandbox.assert.calledOnce(console.log);
});

test.serial('Should creates child logger and inherits at least parent\'s context and tags', t => {
    const { message, meta, sandbox } = t.context;
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
    sandbox.assert.notCalled(console.error);
    sandbox.assert.calledOnce(console.log);
});

test.serial('Should log error object using generic way', t => {
    const { sandbox } = t.context;
    const log = new Logger('some test controller').context({}, true);
    const testError = new Error('test error');

    t.notThrows(() => log.error(testError.message, testError));
    sandbox.assert.calledOnce(console.error);
    sandbox.assert.notCalled(console.log);
});

test.serial('Should log error object using logger\'s throw method and then throw an error', t => {
    const { sandbox } = t.context;
    const log = new Logger('some test controller');
    const typeError = new TypeError('test error');

    t.throws(() => log.throw(typeError), TypeError);
    sandbox.assert.calledOnce(console.error);
    sandbox.assert.notCalled(console.log);
});
