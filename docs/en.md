# Logger

### Features
The logger requires to be configured once <b>prior to first instance being created</b>. Chaining supported.

[The wrapper example that could be used in application.](../tools/wrapper/logger.js)

Logger creation with adding context and tags that could be used when filtering log messages later:
```javascript
const Logger = require('./logger');

const log = new Logger('ctrl.get')
    .context({ requestId: 'arbitrary-string-as-reqId' })
    .tag([ 'crud', 'user' ]);

log.debug('test debugging message');
// 23.06.2018 23:06:17.352 arbitrary-string-as-reqId - debug [logger::ctrl.get] test debugging message {"ctx":{"requestId":"arbitrary-string-as-reqId"},"tags":["crud","user"]}
```

The child logger creation with its own tag being added:
```javascript
const Logger = require('./logger');

const log = new Logger('ctrl.get')
    .tag('example', 'parent')
    .child('child')
    .tag('child', 'smth else');

log.info('test info message', { some: 'meta' });
// 23.06.2018 23:06:17.357  - info [logger::ctrl.get.child] test info message {"some":"meta","tags":["example","parent","child","smth else"]}
log.debug('test debugging message');
// 23.06.2018 23:06:17.357  - debug [logger::ctrl.get.child] test debugging message {"tags":["example","parent","child","smth else"]}
```

### Installation
```bash
npm install @alefi/logger --save
```

### Configuration
The logger has preconfigured default values and do not requires any mandatory settings to be provided while configured. However, any of these values could be overridden.
For details see [config/default.json.](../src/config/default.json)

### Test
```bash
npm install
npm test
```
[Todo](todo/en.todo)
