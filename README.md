# 🚀 Viral Content Bot

Complete Telegram bot for content creators to discover trending topics, get viral scripts, and analyze their videos.

## ✨ Features

- **Multi-Platform Support**: YouTube, TikTok, Instagram
- **Trend Analysis**: Real-time viral trends for any niche
- **Script Generator**: Ready-to-use viral scripts with hooks
- **Video Analysis**: AI-powered video rating system
- **Editing Guide**: Best apps, effects, and tutorials
- **Stylish UI**: Beautiful inline keyboards with emojis

## 🎯 Flow

```
/start → Platform → Category → Niche → Actions

Example:
/start → TikTok → Gaming → FreeFire → [What's Viral / Get Script / Rate Video]
```

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and add your BOT_TOKEN
```

### 3. Get Bot Token
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow instructions
4. Copy token to `.env`

### 4. Run Bot
```bash
npm start
# or for development:
npm run dev
```

## 📁 Structure

```
viral-content-bot/
├── bot.js              # Main bot file
├── package.json        # Dependencies
├── .env.example        # Environment template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🎮 Available Niches

### Gaming
- Free Fire
- PUBG Mobile
- Call of Duty Mobile
- Minecraft
- Valorant

### Editing
- Gaming Edits
- Anime AMV
- Vlog Transitions

### Anime
- AMV (Anime Music Videos)
- Edit Compilations
- Reviews
- Cosplay

## 🔥 Commands

| Command | Description |
|---------|-------------|
| `/start` | Launch bot |
| `/help` | Show guide |
| `/stats` | Your usage stats |

## 💡 Tips for Viral Content

1. **Hook in 1 second** - First 3 seconds matter most
2. **Trending Audio** - Use sounds with <100K uses
3. **Post Timing** - 7PM-11PM for best reach
4. **Hashtags** - Mix 3 popular + 3 niche tags
5. **Consistency** - Post 1-3 times daily

## 📝 Customization

Add new niches in `bot.js`:
```javascript
const VIRAL_DATA = {
    yourniche: {
        trending: ['Style 1', 'Style 2'],
        songs: ['Song 1', 'Song 2'],
        effects: ['Effect 1'],
        duration: '15-30 seconds',
        bestTime: '7 PM - 10 PM',
        hashtags: '#tag1 #tag2',
        script: {
            hook: 'Your hook',
            body: 'Your body',
            cta: 'Your CTA'
        }
    }
};
```

## 🤝 Support

Contact: [@admin](https://t.me/admin)
Channel: [@viralbotupdates](https://t.me/viralbotupdates)

## 📄 License

MIT License - Feel free to use and modify!

---

**Made with ❤️ for content creators**
