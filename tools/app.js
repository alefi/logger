// Sample app with logger calling examples.
'use strict';

const Logger = require('./wrapper/logger');

const log1 = new Logger('log1');
const log2 = new Logger('log2');
const log3 = new Logger('log3').context({ log3: 'text' });
const log31 = new Logger('log3').context({ log31: 'text' });

log1.info('log1-msg-info', { extraMeta: 1 });
// 23.06.2018 22:52:16.436  - info [logger::log1] log1-msg-info {"extraMeta":1}
log1.debug('log1-msg-debug', { extraMeta: 2 });
// 23.06.2018 22:52:16.440  - debug [logger::log1] log1-msg-debug {"extraMeta":2}
log2.info('log2-msg-info', { extraMeta: 3 });
// 23.06.2018 22:52:16.440  - info [logger::log2] log2-msg-info {"extraMeta":3}
log3.warn('log3-msg-warn');
// 23.06.2018 22:52:16.441  - warn [logger::log3] log3-msg-warn {"ctx":{"log3":"text","log31":"text"}}
log31.error('log31-msg-error');
// 23.06.2018 22:52:16.441  - error [logger::log3] log31-msg-error {"ctx":{"log3":"text","log31":"text"}}

const log4 = new Logger('log4')
    .context({ requestId: 'arbitrary-string-as-reqId' })
    .tag([ 'crud', 'user' ]);

log4.log('test debugging message', { extraMeta: 4 });
// 23.06.2018 22:52:16.443 arbitrary-string-as-reqId - log [logger::log4] test debugging message {"extraMeta":4,"ctx":{"requestId":"arbitrary-string-as-reqId"},"tags":["crud","user"]}
log4.info('test info message', { extraMeta: 5 });
// 23.06.2018 22:52:16.443 arbitrary-string-as-reqId - info [logger::log4] test info message {"extraMeta":5,"ctx":{"requestId":"arbitrary-string-as-reqId"},"tags":["crud","user"]}
log4.debug('test debugging message');
// 23.06.2018 22:52:16.443 arbitrary-string-as-reqId - debug [logger::log4] test debugging message {"ctx":{"requestId":"arbitrary-string-as-reqId"},"tags":["crud","user"]}

const child = new Logger('parent')
    .tag('parent')
    .child('child')
    .tag('child', 'extraTag');

child.debug('test debugging message');
// 23.06.2018 22:52:16.444  - debug [logger::parent.child] test debugging message {"tags":["parent","child","extraTag"]}
