# EquiDex UserBot

Модульный Telegram UserBot с расширенным функционалом.

## Возможности

- 📦 Модульная система - добавляй команды без перезагрузки
- 🔄 Автозагрузка модулей
- ⚡ Rate limiting
- 🎯 Graceful shutdown
- 📊 Статистика использования

## Установка

```bash
# Клонировать репозиторий
git clone [https://github.com/your-repo/equidex-userbot.git](https://github.com/ZakatCloud/EquiDexUB-Public)
cd equidex-userbot

# Установить зависимости
npm install

# Настроить
cp .env.example .env
# Отредактируй .env - добавь API_ID и API_HASH от my.telegram.org

# Запустить
npm start
```

## Конфигурация

Создай файл `.env`:
```
API_ID=your_api_id
API_HASH=your_api_hash
```

Получить API credentials: https://my.telegram.org

## Команды

### Системные
- `help` / `помощь` - показать все команды
- `modules` - список модулей
- `stats` - статистика
- `reload [имя]` - перезагрузить модуль
- `settings` - настройки

### Утилиты
- `ping` / `пинг` - проверить бота
- `калькулятор 2+2` - вычисления
- `translate текст` - перевод
- `short ссылка` - сократить ссылку
- `время` / `time` - текущее время
- `whois домен` - информация о домене
- `погода город` - погода

### Заметки и напоминания
- `заметка имя: текст` - сохранить заметку
- `посмотреть имя` - прочитать заметку
- `notes` / `заметки` - список заметок
- `напомни текст через 10 мин` - напоминание
- `таймер 30 сек` - таймер

### Прочее
- `пароль` - сгенерировать пароль
- `профиль` - ваш профиль

## Развлечения

- `шутка` / `анекдот` - случайная шутка
- `факт` - интересный факт
- `8ball` / `шар` - магический шар
- `fortune` / `судьба` - предсказание судьбы
- `xkcd` - случайный комикс
- `compliment` - комплимент
- `dare` - правда или действие
- `quote` / `цитата` - вдохновляющие цитаты

## Создание модулей

```javascript
class MyModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'mymodule';
  }

  getCommands() {
    return ['моякоманда'];
  }

  async handleMessage(msg, text) {
    if (text.includes('моякоманда')) {
      await this.client.sendMessage(msg.chatId, {
        message: 'Привет!',
        replyTo: msg.id
      });
      return true;
    }
    return false;
  }
}

module.exports = MyModule;
```

## Структура проекта

```
equidex-userbot/
├── main.js          # Основной файл
├── modules/         # Модули (23 штуки)
│   ├── ping.js
│   ├── help.js
│   ├── stats.js
│   └── ...
├── settings.json    # Настройки
├── notes.json       # Заметки
├── .env             # Конфигурация
└── session.txt      # Сессия Telegram
```

## Модули (23)

### Системные
- `base` - базовые команды
- `ping` - проверка бота
- `help` - меню помощи
- `stats` - статистика
- `settings` - настройки

### Утилиты
- `calculator` - калькулятор
- `translate` - переводчик
- `shortlink` - сокращатель ссылок
- `time` - время и дата
- `whois` - информация о домене
- `send` - рассылка

### Полезное
- `notes` - заметки
- `reminds` - напоминания
- `profile` - профиль
- `pdf` - PDF инструменты

### Развлечения
- `8ball` - магический шар
- `rip` - шутка "умри"
- `insult` - оскорбления
- `compliment` - комплименты
- `dare` - правда или действие
- `urban` - цитаты
- `xkcd` - комиксы
- `fortune` - предсказания

## Лицензия

MIT
