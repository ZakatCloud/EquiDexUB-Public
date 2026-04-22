class TimeModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'time';
    this.timezones = {
      'москва': 'Europe/Moscow',
      'лондон': 'Europe/London',
      'нью-йорк': 'America/New_York',
      'токио': 'Asia/Tokyo',
      'пекин': 'Asia/Shanghai',
      'дубай': 'Asia/Dubai',
      'париж': 'Europe/Paris',
      'сидней': 'Australia/Sydney',
      'берлин': 'Europe/Berlin',
      'киев': 'Europe/Kiev',
      'алматы': 'Asia/Almaty',
      'ташкент': 'Asia/Tashkent'
    };
  }

  getCommands() { return ['time', 'время', 'дата']; }

  handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd === 'time' || cmd === 'время' || cmd === 'дата') {
      this.showTime(msg, 'москва');
      return true;
    }

    if (cmd.startsWith('time ') || cmd.startsWith('время ') || cmd.startsWith('дата ')) {
      const tz = text.replace(/^(time |время |дата )/, '').trim();
      this.showTime(msg, tz);
      return true;
    }

    return false;
  }

  async showTime(msg, tzName) {
    let tz = this.timezones[tzName.toLowerCase()] || 'Europe/Moscow';
    
    const now = new Date();
    const options = {
      timeZone: tz,
      timeZoneName: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'long'
    };

    try {
      const formatter = new Intl.DateTimeFormat('ru-RU', options);
      const formatted = formatter.format(now);

      const cityName = Object.entries(this.timezones)
        .find(([k, v]) => v === tz)?.[0] || tz;

      await this.client.sendMessage(msg.chatId, {
        message: `🕐 **${cityName.toUpperCase()}**\n\n${formatted}`,
        parseMode: 'markdown',
        replyTo: msg.id
      });
    } catch (error) {
      await this.client.sendMessage(msg.chatId, {
        message: '❌ Не удалось получить время',
        replyTo: msg.id
      });
    }
  }
}

module.exports = TimeModule;