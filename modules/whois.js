const https = require('https');
const dns = require('dns').promises;

class WhoisModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'whois';
  }

  getCommands() {
    return ['whois', 'dns', 'ipinfo'];
  }

  async handleMessage(msg, text) {
    const lowerText = text.toLowerCase().trim();
    
    if (lowerText.startsWith('whois ') || lowerText.startsWith('dns ') || lowerText.startsWith('ipinfo ')) {
      const target = text.split(' ')[1];
      if (!target) {
        await this.client.sendMessage(msg.chatId, {
          message: '❌ Укажите домен или IP\nПример: `whois vk.com`',
          replyTo: msg.id
        });
        return true;
      }
      
      await this.lookup(msg, target);
      return true;
    }
    
    return false;
  }

  async lookup(msg, target) {
    const loading = await this.client.sendMessage(msg.chatId, {
      message: '🔍 Ищу информацию...',
      replyTo: msg.id
    });

    try {
      const isIP = this.isValidIP(target);
      const isDomain = this.isValidDomain(target);
      
      if (!isIP && !isDomain) {
        await loading.edit({ text: '❌ Неверный формат' });
        return;
      }

      const [dnsInfo, geoInfo] = await Promise.all([
        this.getDNSInfo(target),
        isIP ? this.getGeoIP(target) : Promise.resolve(null)
      ]);

      let report = `🌐 **Информация: ${target}**\n\n`;
      
      if (dnsInfo) report += `🔗 **DNS:**\n${dnsInfo}\n\n`;
      if (geoInfo) report += `📍 **GEO:**\n${geoInfo}`;
      
      if (!dnsInfo && !geoInfo) {
        report += '❌ Данные не найдены';
      }

      await loading.edit({
        text: report,
        parseMode: 'markdown'
      });
    } catch (error) {
      await loading.edit({ text: '❌ Ошибка: ' + error.message });
    }
  }

  async getDNSInfo(target) {
    try {
      const records = [];
      
      const [a, aaaa, mx, txt, ns] = await Promise.allSettled([
        dns.resolve4(target).catch(() => []),
        dns.resolve6(target).catch(() => []),
        dns.resolveMx(target).catch(() => []),
        dns.resolveTxt(target).catch(() => []),
        dns.resolveNs(target).catch(() => [])
      ]);

      if (a.status === 'fulfilled' && a.value.length) {
        records.push(`A: ${a.value.join(', ')}`);
      }
      if (aaaa.status === 'fulfilled' && aaaa.value.length) {
        records.push(`AAAA: ${aaaa.value.join(', ')}`);
      }
      if (mx.status === 'fulfilled' && mx.value.length) {
        records.push(`MX: ${mx.value.map(m => m.exchange).join(', ')}`);
      }
      if (txt.status === 'fulfilled' && txt.value.length) {
        records.push(`TXT: ${txt.value[0]?.[0]?.substring(0, 50) || '...'}...`);
      }
      if (ns.status === 'fulfilled' && ns.value.length) {
        records.push(`NS: ${ns.value.join(', ')}`);
      }

      return records.length ? records.join('\n') : null;
    } catch {
      return null;
    }
  }

  async getGeoIP(ip) {
    return new Promise((resolve) => {
      const req = https.get(`https://ipapi.co/${ip}/json/`, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          try {
            const geo = JSON.parse(data);
            if (geo.error) {
              resolve(null);
              return;
            }
            resolve([
              `Страна: ${geo.country_name || 'N/A'}`,
              `Город: ${geo.city || 'N/A'}`,
              `Провайдер: ${geo.org || 'N/A'}`,
              `Часовой пояс: ${geo.timezone || 'N/A'}`
            ].filter(Boolean).join('\n'));
          } catch {
            resolve(null);
          }
        });
      });
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(null);
      });
      req.on('error', () => resolve(null));
    });
  }

  isValidIP(ip) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    return ip.split('.').every(part => {
      const n = parseInt(part, 10);
      return n >= 0 && n <= 255;
    });
  }

  isValidDomain(domain) {
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(domain);
  }
}

module.exports = WhoisModule;