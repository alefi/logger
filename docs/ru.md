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

### Установка
```bash
npm install @alefi/logger --save
```

### Конфигурация
Логгер имеет предопределенные настройки по-умолчанию и явно не требует указания каких-либо параметров. Однако, любой из параметров может быть переопределен.
Подробнее см. [config/default.json.](config/default.json)

### Тестирование
```bash
npm install
npm test
```
[Todo](todo/ru.todo)
