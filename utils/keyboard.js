const { Markup } = require('telegraf');

class KeyboardBuilder {
    static mainMenu() {
        return Markup.inlineKeyboard([
            [Markup.button.callback('🎬 YouTube', 'plat:youtube'), 
             Markup.button.callback('🎵 TikTok', 'plat:tiktok')],
            [Markup.button.callback('📸 Instagram', 'plat:instagram'), 
             Markup.button.callback('📊 My Stats', 'stats')],
            [Markup.button.callback('🔥 Global Trends', 'global_trends'), 
             Markup.button.callback('❓ Help', 'help')]
        ]);
    }

    static categories(platform, categories) {
        const buttons = Object.entries(categories).map(([key, value]) => {
            return [Markup.button.callback(`${value.icon} ${value.name}`, `cat:${platform}:${key}`)];
        });
        buttons.push([Markup.button.callback('🔙 Back to Platforms', 'start')]);
        return Markup.inlineKeyboard(buttons);
    }

    static subCategories(platform, category, subcategories) {
        const buttons = subcategories.map(sub => {
            return [Markup.button.callback(`⭐ ${sub.toUpperCase()}`, `sub:${platform}:${category}:${sub}`)];
        });
        buttons.push([Markup.button.callback('🔙 Back', `plat:${platform}`)]);
        return Markup.inlineKeyboard(buttons);
    }

    static actions(platform, category, niche) {
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

    static backButton(action) {
        return Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Back', action)]
        ]);
    }
}

module.exports = KeyboardBuilder;
