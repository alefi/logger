# Logger

### Особенности

Логгер требует однократного конфигурирования <b>до создания первого экземпляра</b>. Поддерживается chaining.

[Пример обертки для использования логгера в коде приложения.](../tools/wrapper/logger.js)

Создание логгера, добавление к нему контекста и тэгов для фильтрации:

```javascript
const Logger = require('./logger');

const log = new Logger('ctrl.get')
    .context({ requestId: 'arbitrary-string-as-reqId' })
    .tag([ 'crud', 'user' ]);

log.debug('test debugging message');
// 23.06.2018 23:06:17.352 arbitrary-string-as-reqId - debug [logger::ctrl.get] test debugging message {"ctx":{"requestId":"arbitrary-string-as-reqId"},"tags":["crud","user"]}
```

Создание дочернего логгера с добавлением собственного тэга:

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

Проброс ошибки с логированием:

```javascript
const Logger = require('./logger');

const log = new Logger('ctrl');
const typeError = new TypeError('smth bad happened');

log.throw(typeError);
// 30.06.2018 10:26:48.713  - error [logger::ctrl] smth bad happened {"error":{"name":"TypeError","message":"smth bad happened","stack":"TypeError: smth bad happened\n    at Object.<anonymous> (<...>/logger/tools/app.js:8:19)\n    at Module._compile (module.js:652:30)\n<...>"}}
```

### Установка

```bash
npm install @alefi/logger --save
```

### Конфигурация

Логгер имеет предопределенные настройки по-умолчанию и явно не требует указания каких-либо параметров. Однако, любой из параметров может быть переопределен.
Подробнее см. [config/default.json.](../src/config/default.json)

### Тестирование

```bash
npm install
npm test
```

[Todo](todo/ru.todo)
