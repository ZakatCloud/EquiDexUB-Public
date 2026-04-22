class PasswordModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'password';
  }

  getCommands() {
    return ['пароль', 'password', 'генпароль'];
  }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd === 'пароль' || cmd === 'password' || cmd === 'генпароль') {
      await this.generatePassword(msg, 16);
      return true;
    }

    const passMatch = cmd.match(/^пароль\s+(\d+)$/);
    if (passMatch) {
      const length = Math.min(Math.max(parseInt(passMatch[1]), 4), 64);
      await this.generatePassword(msg, length);
      return true;
    }

    return false;
  }

  async generatePassword(msg, length) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=';
    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');

    const strength = this.getStrength(password);

    const text = `🔐 **Пароль**\n\n` +
      `\`${password}\`\n\n` +
      `📏 Длина: ${length} символов\n` +
      `🔒 Надёжность: ${strength}`;

    await this.client.sendMessage(msg.chatId, { message: text, parseMode: 'markdown', replyTo: msg.id });
  }

  getStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score >= 6) return '💪 Отличная';
    if (score >= 4) return '👍 Хорошая';
    if (score >= 2) return '😐 Средняя';
    return '⚠️ Слабая';
  }
}

module.exports = PasswordModule;