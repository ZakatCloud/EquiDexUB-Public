const fs = require('fs');
const path = require('path');

class NotesModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'notes';
    this.notesFile = path.join(__dirname, '..', 'notes.json');
    this.notes = this.loadNotes();
  }

  getCommands() { return ['notes', 'заметки', 'заметка']; }

  handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd === 'notes' || cmd === 'заметки') {
      this.listNotes(msg);
      return true;
    }

    if (cmd.startsWith('заметка ') || cmd.startsWith('note ')) {
      const content = text.replace(/^(заметка |note )/, '').trim();
      if (content.includes(':')) {
        const [name, note] = content.split(':').map(s => s.trim());
        if (name && note) {
          this.addNote(msg, name, note);
          return true;
        }
      }
    }

    if (cmd.startsWith('заметка:') || cmd.startsWith('note:')) {
      const note = text.replace(/^(заметка:|note:)/, '').trim();
      this.addNote(msg, 'default', note);
      return true;
    }

    if (cmd.startsWith('посмотреть ') || cmd.startsWith('view ')) {
      const name = text.replace(/^(посмотреть |view )/, '').trim();
      this.viewNote(msg, name);
      return true;
    }

    if (cmd.startsWith('удалить ') || cmd.startsWith('delete ')) {
      const name = text.replace(/^(удалить |delete )/, '').trim();
      this.deleteNote(msg, name);
      return true;
    }

    return false;
  }

  loadNotes() {
    try {
      if (fs.existsSync(this.notesFile)) {
        return JSON.parse(fs.readFileSync(this.notesFile, 'utf8'));
      }
    } catch {}
    return {};
  }

  saveNotes() {
    try {
      fs.writeFileSync(this.notesFile, JSON.stringify(this.notes, null, 2));
    } catch {}
  }

  async listNotes(msg) {
    const names = Object.keys(this.notes);
    
    if (names.length === 0) {
      await this.client.sendMessage(msg.chatId, {
        message: '📝 Заметок пока нет\n\nДобавить: `заметка имя: текст`',
        replyTo: msg.id
      });
      return;
    }

    let text = '📝 **Заметки:**\n\n';
    for (const name of names) {
      const preview = this.notes[name].substring(0, 30);
      text += `• ${name}: ${preview}...\n`;
    }

    text += '\n📖 Читать: `посмотреть имя`';

    await this.client.sendMessage(msg.chatId, { 
      message: text, 
      parseMode: 'markdown', 
      replyTo: msg.id 
    });
  }

  async addNote(msg, name, content) {
    this.notes[name.toLowerCase()] = content;
    this.saveNotes();
    
    await this.client.sendMessage(msg.chatId, {
      message: `✅ Заметка "${name}" сохранена!`,
      replyTo: msg.id
    });
  }

  async viewNote(msg, name) {
    const note = this.notes[name.toLowerCase()];
    
    if (!note) {
      await this.client.sendMessage(msg.chatId, {
        message: `❌ Заметка "${name}" не найдена`,
        replyTo: msg.id
      });
      return;
    }

    await this.client.sendMessage(msg.chatId, {
      message: `📝 **${name}:**\n\n${note}`,
      parseMode: 'markdown',
      replyTo: msg.id
    });
  }

  async deleteNote(msg, name) {
    if (this.notes[name.toLowerCase()]) {
      delete this.notes[name.toLowerCase()];
      this.saveNotes();
      
      await this.client.sendMessage(msg.chatId, {
        message: `✅ Заметка "${name}" удалена`,
        replyTo: msg.id
      });
    } else {
      await this.client.sendMessage(msg.chatId, {
        message: `❌ Заметка "${name}" не найдена`,
        replyTo: msg.id
      });
    }
  }
}

module.exports = NotesModule;