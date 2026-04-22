const fs = require('fs');
const path = require('path');

class RemindsModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'reminds';
    this.reminders = new Map();
  }

  getCommands() { return ['напомни', ' remind', 'таймер']; }

  handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd.startsWith('напомни ') || cmd.startsWith('напоминание ')) {
      const content = cmd.replace(/^(напомни |напоминание )/, '');
      if (content.includes(' через ') || content.includes(' за ')) {
        const parts = content.split(/ через | за /);
        if (parts.length === 2) {
          const reminder = parts[0].trim();
          const timeStr = parts[1].trim();
          const seconds = this.parseTime(timeStr);
          if (seconds > 0) {
            this.setReminder(msg, reminder, seconds);
            return true;
          }
        }
      }
    }

    if (cmd.startsWith('таймер ')) {
      const timeStr = cmd.replace('таймер ', '');
      const seconds = this.parseTime(timeStr);
      if (seconds > 0) {
        this.setTimer(msg, seconds);
        return true;
      }
    }

    const activeReminders = [...this.reminders.entries()].filter(([k, v]) => v.active);
    if (cmd === 'напоминания' || cmd === 'reminders') {
      this.listReminders(msg, activeReminders);
      return true;
    }

    return false;
  }

  parseTime(timeStr) {
    const match = timeStr.match(/^(\d+)\s*(сек|мин|м|час|ч|день|д)?$/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2] || 'сек';
    
    switch (unit) {
      case 'сек': return value;
      case 'мин':
      case 'м': return value * 60;
      case 'час':
      case 'ч': return value * 3600;
      case 'день':
      case 'д': return value * 86400;
      default: return value;
    }
  }

  async setReminder(msg, text, seconds) {
    const id = `${msg.chatId}_${Date.now()}`;
    this.reminders.set(id, { active: true, text, chatId: msg.chatId });
    
    const timeStr = this.formatTime(seconds);
    
    await this.client.sendMessage(msg.chatId, {
      message: `🔔 Напоминание установлено на ${timeStr}:\n"${text}"`,
      replyTo: msg.id
    });

    setTimeout(async () => {
      if (this.reminders.get(id)?.active) {
        this.reminders.delete(id);
        await this.client.sendMessage(msg.chatId, {
          message: `🔔 **НАПОМИНАНИЕ!**\n${text}`,
          parseMode: 'markdown'
        });
      }
    }, seconds * 1000);
  }

  async setTimer(msg, seconds) {
    const timeStr = this.formatTime(seconds);
    
    const timerMsg = await this.client.sendMessage(msg.chatId, {
      message: `⏱ Таймер: ${timeStr}\nИдут обратный отсчёт...`,
      replyTo: msg.id
    });

    let remaining = seconds;
    const interval = setInterval(async () => {
      remaining -= 10;
      if (remaining <= 0) {
        clearInterval(interval);
        await timerMsg.edit({ text: `⏰ **ВРЕМЯ ВЫШЛО!**` });
        await this.client.sendMessage(msg.chatId, { message: '⏰ Таймер завершён!' });
      } else {
        await timerMsg.edit({ text: `⏱ Осталось: ${this.formatTime(remaining)}` });
      }
    }, 10000);

    setTimeout(() => clearInterval(interval), seconds * 1000);
  }

  async listReminders(msg, reminders) {
    if (reminders.length === 0) {
      await this.client.sendMessage(msg.chatId, {
        message: '🔔 Нет активных напоминаний',
        replyTo: msg.id
      });
      return;
    }

    let text = '📝 **Напоминания:**\n\n';
    for (const [id, data] of reminders) {
      text += `• ${data.text}\n`;
    }

    await this.client.sendMessage(msg.chatId, {
      message: text,
      parseMode: 'markdown',
      replyTo: msg.id
    });
  }

  formatTime(seconds) {
    if (seconds >= 86400) {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}д ${hours}ч`;
    }
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}ч ${mins}м`;
    }
    if (seconds >= 60) {
      return `${Math.floor(seconds / 60)}м ${seconds % 60}с`;
    }
    return `${seconds}сек`;
  }
}

module.exports = RemindsModule;