const axios = require('axios');

class TrendService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    }

    async getTrends(platform, niche) {
        const cacheKey = `${platform}_${niche}`;

        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.time < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            // Mock data for demo
            const data = {
                platform,
                niche,
                trending: true,
                lastUpdated: new Date().toISOString(),
                score: Math.floor(Math.random() * 30) + 70 // 70-100
            };

            // Cache result
            this.cache.set(cacheKey, { data, time: Date.now() });

            return data;
        } catch (error) {
            console.error('Trend API Error:', error.message);
            return { error: true, message: 'Using cached data' };
        }
    }

    async getHashtags(niche) {
        const hashtags = {
            freefire: ['#freefire', '#ffmax', '#grandmaster', '#headshot', '#booyah', '#garenafreefire'],
            pubg: ['#pubg', '#pubgmobile', '#bgmi', '#chickendinner', '#sniper', '#rankpush'],
            codm: ['#codm', '#callofduty', '#codmobile', '#multiplayer', '#battleroyale'],
            minecraft: ['#minecraft', '#mcpe', '#redstone', '#building', '#survival'],
            valorant: ['#valorant', '#valorantclips', '#headshot', '#clutch', '#ranked'],
            anime: ['#anime', '#amv', '#animeedit', '#weeb', '#otaku', '#sadanime'],
            editing: ['#editing', '#videoedit', '#capcut', '#aftereffects', '#transitions']
        };

        return hashtags[niche] || ['#viral', '#trending', '#fyp', '#foryou', '#content'];
    }

    clearCache() {
        this.cache.clear();
        console.log('✅ Trend cache cleared');
    }
}

module.exports = new TrendService();
