class CalculatorModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'calculator';
  }

  getCommands() {
    return ['калькулятор', 'посчитай', 'сложи', 'вычти', 'умножь', 'подели', 'степень', 'корень'];
  }

  async handleMessage(msg, text) {
    const lowerText = text.toLowerCase().trim();

    if (lowerText === 'калькулятор' || lowerText === 'посчитай') {
      await this.showHelp(msg);
      return true;
    }

    const calcMatch = lowerText.match(/^калькулятор\s+(.+)$/);
    if (calcMatch) {
      await this.calculate(msg, calcMatch[1]);
      return true;
    }

    if (lowerText.startsWith('сложи ')) {
      const nums = lowerText.replace('сложи ', '').split(/[\s,]+/);
      if (nums.length >= 2) {
        const result = nums.reduce((a, b) => (parseFloat(a) || 0) + (parseFloat(b) || 0), 0);
        await this.client.sendMessage(msg.chatId, { message: `➕ Сумма: ${result}`, replyTo: msg.id });
        return true;
      }
    }

    if (lowerText.startsWith('вычти ')) {
      const nums = lowerText.replace('вычти ', '').split(/[\s,]+/);
      if (nums.length >= 2) {
        const result = parseFloat(nums[0]) - parseFloat(nums[1]);
        await this.client.sendMessage(msg.chatId, { message: `➖ Разность: ${result}`, replyTo: msg.id });
        return true;
      }
    }

    if (lowerText.startsWith('умножь ')) {
      const nums = lowerText.replace('умножь ', '').split(/[\s,]+/);
      if (nums.length >= 2) {
        const result = nums.reduce((a, b) => (parseFloat(a) || 1) * (parseFloat(b) || 1), 1);
        await this.client.sendMessage(msg.chatId, { message: `✖️ Произведение: ${result}`, replyTo: msg.id });
        return true;
      }
    }

    if (lowerText.startsWith('подели ')) {
      const nums = lowerText.replace('подели ', '').split(/[\s,]+/);
      if (nums.length >= 2) {
        if (parseFloat(nums[1]) === 0) {
          await this.client.sendMessage(msg.chatId, { message: '❌ На ноль делить нельзя!', replyTo: msg.id });
        } else {
          const result = parseFloat(nums[0]) / parseFloat(nums[1]);
          await this.client.sendMessage(msg.chatId, { message: `➗ Результат: ${result}`, replyTo: msg.id });
        }
        return true;
      }
    }

    if (lowerText.startsWith('степень ')) {
      const nums = lowerText.replace('степень ', '').split(/[\s,]+/);
      if (nums.length >= 2) {
        const base = parseFloat(nums[0]);
        const exp = parseFloat(nums[1]);
        if (isNaN(base) || isNaN(exp)) {
          await this.client.sendMessage(msg.chatId, { message: '❌ Неверные числа', replyTo: msg.id });
          return true;
        }
        const result = Math.pow(base, exp);
        await this.client.sendMessage(msg.chatId, { message: `🔢 ${base} в степени ${exp} = ${result}`, replyTo: msg.id });
        return true;
      }
    }

    if (lowerText.startsWith('корень ')) {
      const num = parseFloat(lowerText.replace('корень ', ''));
      if (!isNaN(num)) {
        const result = Math.sqrt(num);
        await this.client.sendMessage(msg.chatId, { message: `√ Корень из ${num} = ${result}`, replyTo: msg.id });
        return true;
      }
    }

    return false;
  }

  async showHelp(msg) {
    const helpText = `🧮 **Калькулятор**

Использование:
• \`калькулятор 2 + 2\` - вычислить
• \`сложи 5 10 15\` - сложить
• \`вычти 10 3\` - вычесть
• \`умножь 4 5 2\` - умножить
• \`подели 100 4\` - деление
• \`степень 2 8\` - степень
• \`корень 16\` - корень`;

    await this.client.sendMessage(msg.chatId, { message: helpText, parseMode: 'markdown', replyTo: msg.id });
  }

  async calculate(msg, expression) {
    try {
      const sanitized = this.sanitizeExpression(expression);
      
      if (!sanitized) {
        await this.client.sendMessage(msg.chatId, { message: '❌ Недопустимые символы', replyTo: msg.id });
        return;
      }

      const result = this.safeEval(sanitized);

      if (isNaN(result) || !isFinite(result)) {
        await this.client.sendMessage(msg.chatId, { message: '❌ Невозможно вычислить', replyTo: msg.id });
        return;
      }

      await this.client.sendMessage(msg.chatId, { 
        message: `🧮 **Результат:** ${result}`, 
        parseMode: 'markdown',
        replyTo: msg.id 
      });
    } catch (error) {
      await this.client.sendMessage(msg.chatId, { message: '❌ Ошибка вычисления', replyTo: msg.id });
    }
  }

  sanitizeExpression(expr) {
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[^0-9+\-*/.()\s]/g, '')
      .trim();
  }

  safeEval(expr) {
    const tokens = expr.replace(/\s+/g, '').split(/([+\-*/()])/).filter(t => t);
    let result = 0;
    let currentOp = '+';
    
    for (const token of tokens) {
      if (['+', '-', '*', '/'].includes(token)) {
        currentOp = token;
      } else if (!isNaN(parseFloat(token))) {
        const num = parseFloat(token);
        switch (currentOp) {
          case '+': result += num; break;
          case '-': result -= num; break;
          case '*': result *= num; break;
          case '/': result /= num; break;
        }
      }
    }
    
    return result;
  }
}

module.exports = CalculatorModule;