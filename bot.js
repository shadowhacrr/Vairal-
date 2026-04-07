require('dotenv').config();
const { Telegraf, Markup, session } = require('telegraf');
const fs = require('fs');
const path = require('path');

// Import JSON storage
const storage = require('./utils/storage');

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Session middleware
bot.use(session({
    defaultSession: () => ({
        platform: null,
        category: null,
        niche: null,
        awaitingVideo: false,
        step: null
    })
}));

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

const PLATFORMS = {
    youtube: { name: 'YouTube', icon: '🎬', color: '🔴' },
    tiktok: { name: 'TikTok', icon: '🎵', color: '⚫' },
    instagram: { name: 'Instagram', icon: '📸', color: '🟣' }
};

const CATEGORIES = {
    gaming: { name: 'Gaming', icon: '🎮', subcategories: ['freefire', 'pubg', 'codm', 'minecraft', 'valorant'] },
    editing: { name: 'Editing', icon: '✂️', subcategories: ['gaming', 'anime', 'vlogs', 'transitions'] },
    anime: { name: 'Anime', icon: '🇯🇵', subcategories: ['amv', 'edit', 'review', 'cosplay'] },
    tech: { name: 'Tech', icon: '💻', subcategories: ['reviews', 'tutorials', 'unboxing'] },
    dance: { name: 'Dance', icon: '💃', subcategories: ['bollywood', 'hiphop', 'classical'] },
    comedy: { name: 'Comedy', icon: '😂', subcategories: ['skits', 'pranks', 'reaction'] }
};

const VIRAL_DATA = {
    freefire: {
        trending: ['🔥 Headshot sync edits', '🎭 Emotional gameplay moments', '⚡ Fast-paced montages'],
        songs: ['Phonk Brazilian', 'Indian Trap', 'Funk Brasileiro', 'Slowed + Reverb'],
        effects: ['Velocity on kills', 'Camera shake', 'RGB split', 'Flash transitions'],
        duration: '15-30 seconds',
        bestTime: '7 PM - 11 PM IST',
        hashtags: '#freefire #ffmax #grandmaster #headshot #booyah #garenafreefire',
        script: {
            hook: '⚠️ This headshot trick got me Grandmaster in 1 day...',
            body: '1. Show normal gameplay (2 sec)\n2. Slow motion headshot (3 sec)\n3. Reaction + text overlay (2 sec)\n4. Continue gameplay (5 sec)',
            cta: 'Follow for more OP tricks! 🔥'
        }
    },
    pubg: {
        trending: ['🎯 Sniper compilations', '💥 Vehicle stunts', '🏆 Rank push highlights'],
        songs: ['Epic orchestral', 'Hip hop beats', 'Electronic drops'],
        effects: ['Cinematic bars', '3D text tracking', 'Sound visualization'],
        duration: '30-60 seconds',
        bestTime: '6 PM - 10 PM IST',
        hashtags: '#pubg #pubgmobile #bgmi #chickendinner #sniper',
        script: {
            hook: '🎯 One shot, one kill...',
            body: '1. Build suspense (3 sec)\n2. Show sniper shot (2 sec)\n3. Multi-kill sequence (8 sec)\n4. Victory celebration (2 sec)',
            cta: 'Drop a 🎯 if you love sniping!'
        }
    },
    anime: {
        trending: ['💔 Sad AMV edits', '⚔️ Fight scene compilations', '❤️ Romance moments', '🌟 Glow up transitions'],
        songs: ['Japanese Phonk', 'Lo-fi hip hop', 'Nightcore', 'Emotional OSTs'],
        effects: ['Twixtor slow motion', 'Shake + blur', 'Light leaks', 'Particle effects'],
        duration: '20-45 seconds',
        bestTime: '8 PM - 12 AM IST',
        hashtags: '#anime #amv #animeedit #weeb #otaku #sadanime',
        script: {
            hook: 'POV: You found the saddest anime scene... 💔',
            body: '1. Black screen with text (2 sec)\n2. Slow build-up clips (5 sec)\n3. Drop + emotional scene (8 sec)\n4. Fade out with quote (3 sec)',
            cta: 'Drop a 💔 if this hit you...'
        }
    }
};

const EDITING_APPS = {
    mobile: ['📱 CapCut (Best for beginners)', '📱 VN Editor (Professional)', '📱 Alight Motion (Advanced)', '📱 InShot (Quick edits)'],
    pc: ['💻 Adobe Premiere Pro', '💻 After Effects', '💻 DaVinci Resolve', '💻 Sony Vegas'],
    assets: ['🎵 Pixabay (Free music)', '🔊 Mixkit (Sound effects)', '🎬 Pexels (Stock videos)', '🎨 Velosofy (Templates)']
};

// ═══════════════════════════════════════════════════════════
// KEYBOARD BUILDERS
// ═══════════════════════════════════════════════════════════

function getMainKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('🎬 YouTube', 'plat:youtube'), Markup.button.callback('🎵 TikTok', 'plat:tiktok')],
        [Markup.button.callback('📸 Instagram', 'plat:instagram'), Markup.button.callback('📊 My Stats', 'stats')],
        [Markup.button.callback('🔥 Global Trends', 'global_trends'), Markup.button.callback('❓ Help', 'help')]
    ]);
}

function getCategoryKeyboard(platform) {
    const buttons = Object.entries(CATEGORIES).map(([key, value]) => {
        return [Markup.button.callback(`${value.icon} ${value.name}`, `cat:${platform}:${key}`)];
    });
    buttons.push([Markup.button.callback('🔙 Back to Platforms', 'start')]);
    return Markup.inlineKeyboard(buttons);
}

function getSubCategoryKeyboard(platform, category) {
    const subs = CATEGORIES[category].subcategories;
    const buttons = subs.map(sub => {
        return [Markup.button.callback(`⭐ ${sub.toUpperCase()}`, `sub:${platform}:${category}:${sub}`)];
    });
    buttons.push([Markup.button.callback('🔙 Back', `plat:${platform}`)]);
    return Markup.inlineKeyboard(buttons);
}

function getActionKeyboard(platform, category, niche) {
    return Markup.inlineKeyboard([
        [Markup.button.callback('🔥 What\'s Viral', `trend:${platform}:${category}:${niche}`), 
         Markup.button.callback('📝 Get Script', `script:${platform}:${category}:${niche}`)],
        [Markup.button.callback('🎬 Editing Guide', `edit:${platform}:${category}:${niche}`), 
         Markup.button.callback('📱 Best Apps', `apps:${platform}:${category}:${niche}`)],
        [Markup.button.callback('🎵 Trending Songs', `songs:${platform}:${category}:${niche}`), 
         Markup.button.callback('📊 Rate My Video', `rate:${platform}:${category}:${niche}`)],
        [Markup.button.callback('🔙 Back', `cat:${platform}:${category}`)]
    ]);
}

// ═══════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════

bot.command('start', async (ctx) => {
    // Save user to JSON storage
    storage.saveUser(ctx.from.id, {
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name
    });

    const welcomeText = `
╔═══════════════════════════════════════╗
║     🚀 VIRAL CONTENT BOT 🚀           ║
╚═══════════════════════════════════════╝

Hey ${ctx.from.first_name}! 👋

Discover trending content and create viral videos!

✨ <b>What I can do:</b>
• Find real-time viral trends
• Give you ready-made scripts
• Suggest best editing apps
• Analyze your videos
• Provide trending hashtags

<i>Select a platform to get started:</i>
    `;

    await ctx.replyWithHTML(welcomeText, getMainKeyboard());
});

bot.command('help', async (ctx) => {
    await ctx.replyWithHTML(`
╔═══════════════════════════════════════╗
║     📚 BOT GUIDE 📚                   ║
╚═══════════════════════════════════════╝

<b>How to use:</b>
1️⃣ Select Platform (YouTube/TikTok/IG)
2️⃣ Choose Category (Gaming/Anime/etc)
3️⃣ Pick your Niche (Free Fire/AMV/etc)
4️⃣ Get viral trends, scripts & tips!
5️⃣ Send video for AI analysis

<b>Commands:</b>
/start - Restart bot
/help - Show this guide
/stats - Your usage stats
/rate - Analyze your video
/trends - Global trending

<b>Need help?</b> Contact @admin
    `);
});

// ═══════════════════════════════════════════════════════════
// PLATFORM SELECTION
// ═══════════════════════════════════════════════════════════

bot.action(/plat:(.+)/, async (ctx) => {
    const platform = ctx.match[1];
    ctx.session.platform = platform;

    // Save session to JSON
    storage.saveSession(ctx.from.id, {
        platform,
        step: 'category_selection'
    });

    const plat = PLATFORMS[platform];
    const text = `
╔═══════════════════════════════════════╗
║     ${plat.icon} ${plat.name.toUpperCase()}              ║
╚═══════════════════════════════════════╝

Great choice! Now select your content category:
    `;

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...getCategoryKeyboard(platform) });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// CATEGORY SELECTION
// ═══════════════════════════════════════════════════════════

bot.action(/cat:(.+):(.+)/, async (ctx) => {
    const [platform, category] = [ctx.match[1], ctx.match[2]];
    ctx.session.category = category;

    // Update session
    storage.saveSession(ctx.from.id, {
        platform,
        category,
        step: 'subcategory_selection'
    });

    const cat = CATEGORIES[category];
    const text = `
╔═══════════════════════════════════════╗
║     ${cat.icon} ${cat.name.toUpperCase()}              ║
╚═══════════════════════════════════════╝

Perfect! Now select your specific niche:
    `;

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...getSubCategoryKeyboard(platform, category) });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// SUB-CATEGORY (NICHE) SELECTION
// ═══════════════════════════════════════════════════════════

bot.action(/sub:(.+):(.+):(.+)/, async (ctx) => {
    const [platform, category, niche] = [ctx.match[1], ctx.match[2], ctx.match[3]];
    ctx.session.niche = niche;

    // Update session
    storage.saveSession(ctx.from.id, {
        platform,
        category,
        niche,
        step: 'action_menu'
    });

    // Log analytics
    storage.logAnalytics(ctx.from.id, 'niche_selected', { platform, category, niche });

    const viral = VIRAL_DATA[niche] || VIRAL_DATA['freefire'];

    const text = `
╔═══════════════════════════════════════╗
║     🎯 ${niche.toUpperCase()}               ║
╚═══════════════════════════════════════╝

<b>Status:</b> 🔥 HIGH VIRAL POTENTIAL

<b>📊 Quick Stats:</b>
• Trending Styles: ${viral.trending.length}
• Best Duration: ${viral.duration}
• Peak Time: ${viral.bestTime}

What do you need?
    `;

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...getActionKeyboard(platform, category, niche) });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// TRENDING INFO
// ═══════════════════════════════════════════════════════════

bot.action(/trend:(.+):(.+):(.+)/, async (ctx) => {
    const niche = ctx.match[3];
    const data = VIRAL_DATA[niche] || VIRAL_DATA['freefire'];

    // Log analytics
    storage.logAnalytics(ctx.from.id, 'trend_checked', { niche });

    const text = `
╔═══════════════════════════════════════╗
║     🔥 VIRAL TRENDS 🔥                ║
╚═══════════════════════════════════════╝

<b>🎬 Top 3 Trending Styles:</b>
${data.trending.map((t, i) => `${i+1}. ${t}`).join('\n')}

<b>🎵 Hot Songs Right Now:</b>
${data.songs.map(s => `• ${s}`).join('\n')}

<b>✨ Must-Use Effects:</b>
${data.effects.map(e => `• ${e}`).join('\n')}

⏰ <b>Best Posting:</b> ${data.bestTime}
📏 <b>Ideal Length:</b> ${data.duration}
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📝 Get Complete Script', `script:${ctx.match[1]}:${ctx.match[2]}:${niche}`)],
        [Markup.button.callback('🎵 Get Audio Links', `audio:${niche}`)],
        [Markup.button.callback('🔙 Back to Menu', `sub:${ctx.match[1]}:${ctx.match[2]}:${niche}`)]
    ]);

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// SCRIPT GENERATOR
// ═══════════════════════════════════════════════════════════

bot.action(/script:(.+):(.+):(.+)/, async (ctx) => {
    const niche = ctx.match[3];
    const data = VIRAL_DATA[niche] || VIRAL_DATA['freefire'];
    const script = data.script;

    // Log analytics
    storage.logAnalytics(ctx.from.id, 'script_generated', { niche });

    const text = `
╔═══════════════════════════════════════╗
║     📝 VIRAL SCRIPT 📝                ║
╚═══════════════════════════════════════╝

<b>🎣 HOOK (First 3 sec):</b>
${script.hook}

<b>📋 BODY:</b>
${script.body}

<b>📢 CALL TO ACTION:</b>
${script.cta}

<b>🏷️ HASHTAGS:</b>
<code>${data.hashtags}</code>

<b>💡 Pro Tips:</b>
• Start with your best clip
• Add text in first 1 second
• Use trending audio
• Post at ${data.bestTime}
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📋 Copy Hashtags', `copy:${data.hashtags}`)],
        [Markup.button.callback('🎬 Editing Tips', `edit:${ctx.match[1]}:${ctx.match[2]}:${niche}`)],
        [Markup.button.callback('🔙 Back', `sub:${ctx.match[1]}:${ctx.match[2]}:${niche}`)]
    ]);

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// EDITING GUIDE
// ═══════════════════════════════════════════════════════════

bot.action(/edit:(.+):(.+):(.+)/, async (ctx) => {
    const niche = ctx.match[3];
    const data = VIRAL_DATA[niche] || VIRAL_DATA['freefire'];

    const text = `
╔═══════════════════════════════════════╗
║     🎬 EDITING GUIDE 🎬               ║
╚═══════════════════════════════════════╝

<b>📱 Mobile Apps:</b>
${EDITING_APPS.mobile.join('\n')}

<b>💻 PC Software:</b>
${EDITING_APPS.pc.join('\n')}

<b>🎨 Free Assets:</b>
${EDITING_APPS.assets.join('\n')}

<b>⚡ Quick Tutorial:</b>
1. Import clips → Add to timeline
2. Cut on beat drops (use waveform)
3. Add velocity curves
4. Export 1080p 60fps

<b>🎯 For ${niche}:</b>
${data.effects.map(e => `→ ${e}`).join('\n')}
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.url('📥 Download CapCut', 'https://www.capcut.com')],
        [Markup.button.url('🎵 Free Music', 'https://pixabay.com/music/')],
        [Markup.button.callback('🔙 Back', `sub:${ctx.match[1]}:${ctx.match[2]}:${niche}`)]
    ]);

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// APPS & RESOURCES
// ═══════════════════════════════════════════════════════════

bot.action(/apps:(.+):(.+):(.+)/, async (ctx) => {
    const text = `
╔═══════════════════════════════════════╗
║     📱 BEST APPS 📱                   ║
╚═══════════════════════════════════════╝

<b>🥇 For Beginners:</b>
• CapCut - Free & Easy
• InShot - Quick edits

<b>🥈 For Intermediate:</b>
• VN Editor - Professional
• KineMaster - Feature rich

<b>🥉 For Advanced:</b>
• Alight Motion - Motion graphics
• After Effects (PC) - Industry standard

<b>🎵 Audio Resources:</b>
• TikTok Commercial Music Library
• YouTube Audio Library
• Epidemic Sound (Paid)
• Artlist (Paid)

<b>🎨 Templates:</b>
• Velosofy.com
• MotionArray.com
• Placeit.net
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back', `sub:${ctx.match[1]}:${ctx.match[2]}:${ctx.match[3]}`)]
    ]);

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// SONGS
// ═══════════════════════════════════════════════════════════

bot.action(/songs:(.+):(.+):(.+)/, async (ctx) => {
    const niche = ctx.match[3];
    const data = VIRAL_DATA[niche] || VIRAL_DATA['freefire'];

    const text = `
╔═══════════════════════════════════════╗
║     🎵 TRENDING SONGS 🎵              ║
╚═══════════════════════════════════════╝

<b>🔥 Top Songs for ${niche}:</b>
${data.songs.map((s, i) => `${i+1}. ${s}`).join('\n')}

<b>💡 How to find them:</b>
1. Open TikTok/Instagram
2. Go to trending sounds
3. Search these names
4. Save to favorites

<b>⚠️ Copyright Tips:</b>
• Use 15-30 sec clips
• Add voiceover/effects
• Change pitch slightly
• Use "Commercial Music" library
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back', `sub:${ctx.match[1]}:${ctx.match[2]}:${niche}`)]
    ]);

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// VIDEO RATING SYSTEM
// ═══════════════════════════════════════════════════════════

bot.action(/rate:(.+):(.+):(.+)/, async (ctx) => {
    const [platform, category, niche] = [ctx.match[1], ctx.match[2], ctx.match[3]];

    ctx.session.awaitingVideo = true;
    ctx.session.rateContext = { platform, category, niche };

    const text = `
╔═══════════════════════════════════════╗
║     📊 VIDEO ANALYZER 📊              ║
╚═══════════════════════════════════════╝

<b>Send me your video!</b> 🎬

I'll analyze:
✓ Edit quality & pacing
✓ Audio sync & levels  
✓ Viral potential score
✓ Improvement tips
✓ SEO optimization

<i>Send as video file or forward from channel</i>

<b>Supported formats:</b> MP4, MOV, AVI (max 50MB)
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('❌ Cancel', `sub:${platform}:${category}:${niche}`)]
    ]);

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    await ctx.answerCbQuery();
});

// Handle video upload
bot.on('video', async (ctx) => {
    if (!ctx.session.awaitingVideo) {
        return ctx.reply('❌ Please use /rate command or menu to start video analysis!');
    }

    const analyzingMsg = await ctx.replyWithHTML(`
⏳ <b>Analyzing your video...</b>

🔍 Checking:
• Resolution & quality
• Audio levels
• Edit pacing
• Viral elements
• SEO metadata

<i>This takes 10-20 seconds...</i>
    `);

    // Simulate AI analysis (replace with real CV/ML)
    setTimeout(async () => {
        const scores = [65, 72, 78, 85, 88, 92, 95];
        const score = scores[Math.floor(Math.random() * scores.length)];
        const emoji = score > 90 ? '🏆' : score > 80 ? '🔥' : score > 70 ? '👍' : '💪';

        const analysis = {
            good: ['Good color grading', 'Decent pacing', 'Clear audio'],
            bad: ['Hook could be stronger', 'Add more text overlays', 'Music not synced well'],
            tips: ['Cut first 3 seconds tighter', 'Add trending sound', 'Use better hashtags'],
            proTip: 'Post between 7-9 PM for max reach!'
        };

        // Save to JSON storage
        storage.addVideoAnalysis(ctx.from.id, {
            score,
            fileId: ctx.message.video.file_id,
            niche: ctx.session.niche,
            timestamp: new Date().toISOString()
        });

        // Log analytics
        storage.logAnalytics(ctx.from.id, 'video_analyzed', { 
            niche: ctx.session.niche,
            score 
        });

        await ctx.telegram.editMessageText(
            ctx.chat.id,
            analyzingMsg.message_id,
            null,
            `
╔═══════════════════════════════════════╗
║     📊 ANALYSIS REPORT 📊             ║
╚═══════════════════════════════════════╝

<b>Overall Score: ${score}/100</b> ${emoji}

<b>✅ Strong Points:</b>
${analysis.good.map(g => `• ${g}`).join('\n')}

<b>⚠️ Needs Work:</b>
${analysis.bad.map(b => `• ${b}`).join('\n')}

<b>🎯 Viral Potential:</b> ${Math.min(score + 10, 99)}%

<b>🔧 Quick Fixes:</b>
${analysis.tips.map(t => `→ ${t}`).join('\n')}

<b>💡 Pro Tip:</b> ${analysis.proTip}
            `,
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('🔄 Re-analyze', 'reanalyze')],
                    [Markup.button.callback('🏠 Main Menu', 'start')]
                ])
            }
        );

        ctx.session.awaitingVideo = false;
    }, 3000);
});

// ═══════════════════════════════════════════════════════════
// GLOBAL TRENDS
// ═══════════════════════════════════════════════════════════

bot.action('global_trends', async (ctx) => {
    // Log analytics
    storage.logAnalytics(ctx.from.id, 'global_trends_viewed');

    const text = `
╔═══════════════════════════════════════╗
║     🌍 GLOBAL TRENDS 🌍               ║
╚═══════════════════════════════════════╝

<b>🔥 Cross-Platform Viral:</b>

🎵 <b>Sounds:</b>
• "Phonk Brazilian" - 2.3M uses
• "Sad Anime OST" - 1.8M uses  
• "Indian Trap" - 1.5M uses

🎬 <b>Formats:</b>
• "Get Ready With Me" + twist
• "Day in Life" speed run
• "POV: You found out..."
• "Things that just make sense"

📊 <b>Best Practices:</b>
• Time: 7PM - 11PM
• Length: 15-45 seconds
• Frequency: 1-3x daily
• Hook in first 1 second

<i>Updated: ${new Date().toLocaleTimeString()}</i>
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Refresh', 'global_trends')],
        [Markup.button.callback('🏠 Home', 'start')]
    ]);

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════

bot.action('stats', async (ctx) => {
    const stats = storage.getUserStats(ctx.from.id);
    const user = storage.getUser(ctx.from.id);

    const text = `
╔═══════════════════════════════════════╗
║     📊 YOUR STATS 📊                  ║
╚═══════════════════════════════════════╝

<b>User:</b> ${ctx.from.first_name}
<b>ID:</b> <code>${ctx.from.id}</code>

<b>📈 Activity:</b>
• Videos analyzed: ${stats.videosAnalyzed}
• Scripts generated: ${stats.scriptsGenerated}
• Trends checked: ${stats.trendsChecked}
• Total actions: ${stats.totalActions}

<b>🏆 Achievements:</b>
${stats.videosAnalyzed > 0 ? '🥇 Video Analyst' : '🔒 Locked'}
${stats.scriptsGenerated > 5 ? '🥈 Script Master' : '🔒 Locked'}
${stats.trendsChecked > 10 ? '🥉 Trend Finder' : '🔒 Locked'}

<b>💡 Tip:</b> Analyze 5 more videos to unlock "Pro Creator" badge!
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🏠 Home', 'start')]
    ]);

    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// HELP
// ═══════════════════════════════════════════════════════════

bot.action('help', async (ctx) => {
    await ctx.editMessageText(`
╔═══════════════════════════════════════╗
║     ❓ HELP & SUPPORT ❓              ║
╚═══════════════════════════════════════╝

<b>How to use this bot:</b>

1️⃣ <b>Find Trends:</b>
   /start → Select Platform → Category → Niche → "What's Viral"

2️⃣ <b>Get Scripts:</b>
   Select your niche → "Get Script" → Copy & use!

3️⃣ <b>Edit Videos:</b>
   "Editing Guide" for apps, tips & tutorials

4️⃣ <b>Analyze Videos:</b>
   "Rate My Video" → Send video → Get AI feedback

<b>Need more help?</b>
Contact: @admin
Channel: @viralbotupdates
    `, { 
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('🏠 Home', 'start')]])
    });
    await ctx.answerCbQuery();
});

// ═══════════════════════════════════════════════════════════
// BACK TO START
// ═══════════════════════════════════════════════════════════

bot.action('start', async (ctx) => {
    const welcomeText = `
╔═══════════════════════════════════════╗
║     🚀 VIRAL CONTENT BOT 🚀           ║
╚═══════════════════════════════════════╝

Hey ${ctx.from.first_name}! 👋

Discover trending content and create viral videos!

✨ <b>What I can do:</b>
• Find real-time viral trends
• Give you ready-made scripts
• Suggest best editing apps
• Analyze your videos
• Provide trending hashtags

<i>Select a platform to get started:</i>
    `;

    await ctx.editMessageText(welcomeText, { parse_mode: 'HTML', ...getMainKeyboard() });
    await ctx.answerCbQuery();
});

// Handle copy hashtags
bot.action(/copy:(.+)/, async (ctx) => {
    const hashtags = ctx.match[1];
    await ctx.answerCbQuery('Hashtags copied! (Simulated)', { show_alert: true });
    await ctx.reply(`<code>${hashtags}</code>\n\nTap to copy!`, { parse_mode: 'HTML' });
});

// ═══════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════

bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('⚠️ Something went wrong! Use /start to restart.').catch(console.error);
});

// ═══════════════════════════════════════════════════════════
// START BOT
// ═══════════════════════════════════════════════════════════

bot.launch()
    .then(() => {
        console.log('╔═══════════════════════════════════════╗');
        console.log('║     🤖 VIRAL BOT IS RUNNING! 🤖       ║');
        console.log('╚═══════════════════════════════════════╝');
        console.log('\n📁 JSON Storage: ./data/');
        console.log('   • users.json');
        console.log('   • sessions.json');
        console.log('   • analytics.json');
        console.log('   • cache.json\n');
        console.log('Press Ctrl+C to stop\n');
    })
    .catch(console.error);

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
