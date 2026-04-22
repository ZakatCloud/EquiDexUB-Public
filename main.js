require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } =require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const input = require('input');
const fs = require('fs');
const path = require('path');

const BOT_NAME = 'EquiDex UserBot';
const VERSION = '2.0.0';

class EquiDexBot {
  constructor() {
    this.client = null;
    this.apiId = process.env.API_ID ? parseInt(process.env.API_ID) : 0;
    this.apiHash = process.env.API_HASH || '';
    this.modules = new Map();
    this.modulesDir = path.join(__dirname, 'modules');
    this.loadedModules = new Set();
    this.botUserId = null;
    this.commandStats = new Map();
    this.rateLimits = new Map();
    this.startTime = Date.now();
    this.logger = {
      info: (...args) => console.log(`[${new Date().toISOString()}] ℹ️`, ...args),
      error: (...args) => console.error(`[${new Date().toISOString()}] ❌`, ...args),
      warn: (...args) => console.warn(`[${new Date().toISOString()}] ⚠️`, ...args)
    };
  }

  async initialize() {
    this.logger.info(`${BOT_NAME} v${VERSION} initializing...`);
    
    if (!this.apiId || !this.apiHash) {
      this.logger.error('API_ID and API_HASH required in .env');
      process.exit(1);
    }

    if (fs.existsSync('./session.txt') && fs.readFileSync('./session.txt', 'utf8').trim() !== '') {
      await this.connectWithSession();
    } else {
      await this.createNewSession();
    }
  }

  async connectWithSession() {
    try {
      const sessionString = fs.readFileSync('./session.txt', 'utf8').trim();
      this.logger.info('Loading saved session...');
      const stringSession = new StringSession(sessionString);
      
      this.client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
        connectionRetries: 5,
        useWSS: false,
        floodSleepThreshold: 60,
        deviceModel: 'EquiDexBot',
        systemVersion: '2.0',
        appVersion: VERSION,
        baseLogger: { level: 'error' }
      });

      this.logger.info('Connecting to Telegram...');
      await this.client.connect();
      
      const me = await this.client.getMe();
      this.botUserId = me.id;
      this.logger.info(`Connected as: ${me.firstName} (@${me.username || 'no username'}) [ID: ${this.botUserId}]`);
      
      this.ensureModulesDir();
      await this.loadAllModules();
      await this.forceLoadDialogs();
      await this.setupHandler();
      this.startModuleWatcher();
    } catch (error) {
      this.logger.error('Session connection failed:', error.message);
      this.logger.info('Creating new session...');
      await this.createNewSession();
    }
  }

  async createNewSession() {
    try {
      this.logger.info('Creating new session...');
      const stringSession = new StringSession('');
      
      this.client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
        connectionRetries: 5,
        useWSS: false,
        floodSleepThreshold: 60,
        deviceModel: 'EquiDexBot',
        systemVersion: '2.0',
        appVersion: VERSION
      });

      this.logger.info('Starting client...');
      await this.client.start({
        phoneNumber: async () => await input.text('📱 Phone: '),
        password: async () => await input.text('🔑 Password: '),
        phoneCode: async () => await input.text('📲 Code: '),
        onError: (err) => this.logger.error('Auth error:', err),
      });

      const sessionString = this.client.session.save();
      fs.writeFileSync('./session.txt', sessionString);
      this.logger.info('Session saved to session.txt');
      
      const me = await this.client.getMe();
      this.botUserId = me.id;
      this.logger.info(`Authorized as: ${me.firstName} (@${me.username || 'none'}) [ID: ${this.botUserId}]`);
      
      this.ensureModulesDir();
      await this.loadAllModules();
      await this.forceLoadDialogs();
      await this.setupHandler();
      this.startModuleWatcher();
      
    } catch (error) {
      this.logger.error('Session creation failed:', error);
      if (fs.existsSync('./session.txt')) {
        fs.unlinkSync('./session.txt');
        this.logger.info('Invalid session file removed');
      }
    }
  }

  isOwner(msg) {
    if (!this.botUserId) return false;
    try {
      return msg.senderId?.toString() === this.botUserId.toString();
    } catch {
      return false;
    }
  }

  checkRateLimit(senderId, maxPerMinute = 30) {
    const now = Date.now();
    const key = senderId?.toString();
    if (!key) return false;
    
    const userLimits = this.rateLimits.get(key) || [];
    const recent = userLimits.filter(t => now - t < 60000);
    
    if (recent.length >= maxPerMinute) {
      return false;
    }
    
    recent.push(now);
    this.rateLimits.set(key, recent);
    return true;
  }

  ensureModulesDir() {
    if (!fs.existsSync(this.modulesDir)) {
      fs.mkdirSync(this.modulesDir, { recursive: true });
      this.logger.info('Created modules/ directory');
      this.createExampleModules();
    }
  }

  createExampleModules() {
    const helpModule = `class HelpModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'help';
  }

  getCommands() { return ['help', 'помощь', ' команды']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    if (['help', 'помощь'].includes(cmd) || cmd === ' команды') {
      await this.showHelp(msg);
      return true;
    }
    return false;
  }

  async showHelp(msg) {
    let text = '🤖 **EquiDex UserBot**\\n\\n';
    text += '**Available Commands:**\\n\\n';
    
    for (const [name, mod] of this.bot.modules) {
      const cmds = mod.getCommands?.() || [];
      if (cmds.length) {
        text += '📦 **' + name + ':**\\n';
        cmds.forEach(c => text += '  • ' + c + '\\n');
        text += '\\n';
      }
    }
    
    text += '**System:**\\n';
    text += '• modules - list modules\\n';
    text += '• reload [name] - reload module\\n';
    text += '• reload all - reload all\\n';
    text += '• stats - usage statistics';

    await this.client.sendMessage(msg.chatId, { message: text, parseMode: 'markdown', replyTo: msg.id });
  }
};

module.exports = HelpModule;
`;

    const pingModule = `class PingModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'ping';
  }

  getCommands() { return ['ping', 'пинг']; }

  async handleMessage(msg, text) {
    if (['ping', 'пинг'].includes(text.toLowerCase().trim())) {
      const latency = Math.round(Date.now() - this.bot.startTime);
      const uptime = Math.floor((Date.now() - this.bot.startTime) / 1000);
      const modules = this.bot.modules.size;
      
      await this.client.sendMessage(msg.chatId, {
        message: '🏓 **Pong!**\\n\\n' +
          '• Latency: ' + latency + 'ms\\n' +
          '• Uptime: ' + uptime + 's\\n' +
          '• Modules: ' + modules,
        parseMode: 'markdown',
        replyTo: msg.id
      });
      return true;
    }
    return false;
  }
};

module.exports = PingModule;
`;

    const exampleModules = {
      'help.js': helpModule,
      'ping.js': pingModule
    };

    for (const [filename, content] of Object.entries(exampleModules)) {
      const filepath = path.join(this.modulesDir, filename);
      if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, content);
        this.logger.info('Created example: ' + filename);
      }
    }
  }

  async loadAllModules() {
    this.logger.info('Loading modules...');
    
    if (!fs.existsSync(this.modulesDir)) {
      this.logger.warn('Modules directory not found');
      return;
    }

    const files = fs.readdirSync(this.modulesDir).filter(f => f.endsWith('.js') && !f.startsWith('_'));
    
    if (files.length === 0) {
      this.logger.warn('No module files found');
      return;
    }

    const loadPromises = files.map(async (file) => {
      const moduleName = path.basename(file, '.js');
      
      if (this.loadedModules.has(moduleName)) return;

      try {
        const modulePath = path.join(this.modulesDir, file);
        
        if (!fs.existsSync(modulePath)) return;

        delete require.cache[require.resolve(modulePath)];
        const ModuleClass = require(modulePath);

        if (typeof ModuleClass !== 'function') {
          this.logger.warn(`Module ${moduleName} is not a class/function`);
          return;
        }

        const instance = new ModuleClass(this.client, this);

        if (typeof instance.handleMessage !== 'function') {
          this.logger.warn(`Module ${moduleName} has no handleMessage`);
          return;
        }

        this.modules.set(moduleName, instance);
        this.loadedModules.add(moduleName);
        this.commandStats.set(moduleName, 0);
        
        this.logger.info(`✓ Loaded: ${moduleName}`);
        
      } catch (error) {
        this.logger.error(`Module ${moduleName} error:`, error.message);
      }
    });

    await Promise.all(loadPromises);
    this.logger.info(`Loaded ${this.modules.size} modules`);
  }

  async loadSingleModule(filepath) {
    const filename = path.basename(filepath);
    const moduleName = path.basename(filename, '.js');
    
    if (this.loadedModules.has(moduleName)) {
      this.modules.delete(moduleName);
      this.loadedModules.delete(moduleName);
      this.logger.info(`Reloading: ${moduleName}`);
    }

    try {
      delete require.cache[require.resolve(filepath)];
      const ModuleClass = require(filepath);
      
      if (typeof ModuleClass !== 'function') return false;
      
      const instance = new ModuleClass(this.client, this);
      
      if (typeof instance.handleMessage !== 'function') return false;
      
      this.modules.set(moduleName, instance);
      this.loadedModules.add(moduleName);
      
      if (!this.commandStats.has(moduleName)) {
        this.commandStats.set(moduleName, 0);
      }
      
      this.logger.info(`✓ Loaded: ${moduleName}`);
      return true;
      
    } catch (error) {
      this.logger.error(`Failed to load ${moduleName}:`, error.message);
      return false;
    }
  }

  startModuleWatcher() {
    this.logger.info('Module watcher started (10s interval)');
    
    setInterval(async () => {
      if (!fs.existsSync(this.modulesDir)) return;
      
      try {
        const currentFiles = new Set(
          fs.readdirSync(this.modulesDir)
            .filter(f => f.endsWith('.js') && !f.startsWith('_'))
            .map(f => path.basename(f, '.js'))
        );

        for (const moduleName of currentFiles) {
          if (!this.loadedModules.has(moduleName)) {
            await this.loadSingleModule(path.join(this.modulesDir, moduleName + '.js'));
          }
        }

        for (const loaded of this.loadedModules) {
          if (!currentFiles.has(loaded)) {
            this.modules.delete(loaded);
            this.loadedModules.delete(loaded);
            this.commandStats.delete(loaded);
            this.logger.info(`✓ Unloaded: ${loaded}`);
          }
        }
      } catch (error) {
        this.logger.error('Watcher error:', error.message);
      }
    }, 10000);
  }

  async forceLoadDialogs() {
    try {
      const dialogs = await this.client.getDialogs({});
      this.logger.info(`Loaded ${dialogs.length} dialogs`);
    } catch (error) {
      this.logger.warn('Dialog load error:', error.message);
    }
  }

  async setupHandler() {
    this.logger.info('Setting up message handler...');
    
    this.client.addEventHandler(async (event) => {
      try {
        if (!event.message?.text) return;
        
        const msg = event.message;
        const text = msg.text.toLowerCase().trim();
        
        if (!this.isOwner(msg)) {
          return;
        }

        if (!this.checkRateLimit(msg.senderId)) {
          return;
        }

        let handled = false;

        for (const [moduleName, moduleInstance] of this.modules) {
          if (typeof moduleInstance.handleMessage === 'function') {
            const startTime = Date.now();
            try {
              const result = await moduleInstance.handleMessage(msg, text);
              if (result) {
                const stats = this.commandStats.get(moduleName) || 0;
                this.commandStats.set(moduleName, stats + 1);
                handled = true;
                break;
              }
            } catch (error) {
              this.logger.error(`Module ${moduleName} error:`, error.message);
            }
          }
        }

        if (!handled && (text === 'модули' || text === 'modules')) {
          await this.showModules(msg);
          handled = true;
        }

        if (text.startsWith('перезагрузить модуль ') || text.startsWith('reload ')) {
          const name = text.replace(/^(перезагрузить модуль |reload )/, '').trim();
          await this.reloadModule(msg, name);
          handled = true;
        }

        if (text === 'перезагрузить все модули' || text === 'reload all') {
          await this.reloadAll(msg);
          handled = true;
        }

        if (text === 'статистика' || text === 'stats') {
          await this.showStats(msg);
          handled = true;
        }

        if (!handled && (text === 'помощь' || text === 'help' || text === '/start')) {
          await this.showHelp(msg);
        }
        
      } catch (error) {
        this.logger.error('Handler error:', error.message);
      }
    }, new NewMessage({}));

    this.logger.info(`${BOT_NAME} v${VERSION} ready!`);
    
    if (this.modules.size > 0) {
      this.logger.info(`Type "help" for commands`);
    }

    await this.sendStartupMessage();
  }

  async showModules(msg) {
    let text = '📦 **Modules:**\n\n';
    
    for (const [name, mod] of this.modules) {
      const cmds = mod.getCommands?.() || [];
      text += `**${name}** - ${cmds.length} commands\n`;
    }
    
    text += `\nTotal: ${this.modules.size} modules`;

    await this.client.sendMessage(msg.chatId, { message: text, parseMode: 'markdown', replyTo: msg.id });
  }

  async reloadModule(msg, name) {
    const filepath = path.join(this.modulesDir, name + '.js');
    
    if (!fs.existsSync(filepath)) {
      await this.client.sendMessage(msg.chatId, { message: `❌ Module "${name}" not found`, replyTo: msg.id });
      return;
    }

    const success = await this.loadSingleModule(filepath);
    await this.client.sendMessage(msg.chatId, { 
      message: success ? `✅ Reloaded: ${name}` : `❌ Failed: ${name}`, 
      replyTo: msg.id 
    });
  }

  async reloadAll(msg) {
    this.modules.clear();
    this.loadedModules.clear();
    await this.loadAllModules();
    
    await this.client.sendMessage(msg.chatId, { 
      message: `✅ Reloaded ${this.modules.size} modules`, 
      replyTo: msg.id 
    });
  }

  async showStats(msg) {
    let text = '📊 **Statistics:**\n\n';
    
    const sorted = [...this.commandStats.entries()].sort((a, b) => b[1] - a[1]);
    for (const [name, count] of sorted) {
      text += `• ${name}: ${count}\n`;
    }
    
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    
    text += `\n⏱ Uptime: ${hours}h ${mins}m`;
    text += `\n📦 Modules: ${this.modules.size}`;

    await this.client.sendMessage(msg.chatId, { message: text, parseMode: 'markdown', replyTo: msg.id });
  }

  async showHelp(msg) {
    let text = `🤖 **${BOT_NAME}** v${VERSION}\n\n`;
    text += '**Commands:**\n\n';

    for (const [moduleName, moduleInstance] of this.modules) {
      const commands = moduleInstance.getCommands?.() || [];
      if (commands.length > 0) {
        text += `📦 **${moduleName}:**\n`;
        commands.forEach(cmd => text += `  • ${cmd}\n`);
        text += '\n';
      }
    }

    text += '**System:**\n';
    text += '• modules - module list\n';
    text += '• reload [name] - reload module\n';
    text += '• reload all - reload all\n';
    text += '• stats - usage statistics';

    await this.client.sendMessage(msg.chatId, { message: text, parseMode: 'markdown', replyTo: msg.id });
  }

  async sendStartupMessage() {
    try {
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      
      await this.client.sendMessage('me', {
        message: `🤖 **${BOT_NAME}** v${VERSION} started!\n\n` +
          `📦 Modules: ${this.modules.size}\n` +
          `⏱ Ready in: ${uptime}s\n\n` +
          `Type "help" for commands`
      });
    } catch (error) {
      this.logger.warn('Startup message failed');
    }
  }

  async shutdown(signal) {
    this.logger.info('Graceful shutdown...');
    
    for (const timer of this.timers?.values() || []) {
      clearInterval(timer);
    }
    
    if (this.client) {
      await this.client.disconnect();
    }
    
    this.logger.info('Shutdown complete');
    process.exit(0);
  }
}

async function main() {
  const bot = new EquiDexBot();
  
  process.on('SIGINT', () => bot.shutdown('SIGINT'));
  process.on('SIGTERM', () => bot.shutdown('SIGTERM'));
  
  await bot.initialize();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});