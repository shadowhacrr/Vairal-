const fs = require('fs');
const path = require('path');

class JSONStorage {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.usersFile = path.join(this.dataDir, 'users.json');
        this.sessionsFile = path.join(this.dataDir, 'sessions.json');
        this.analyticsFile = path.join(this.dataDir, 'analytics.json');
        this.cacheFile = path.join(this.dataDir, 'cache.json');

        this.init();
    }

    init() {
        // Create data directory if not exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }

        // Initialize files with empty objects/arrays
        const files = [this.usersFile, this.sessionsFile, this.cacheFile];
        files.forEach(file => {
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, JSON.stringify({}, null, 2));
            }
        });

        // Analytics is an array
        if (!fs.existsSync(this.analyticsFile)) {
            fs.writeFileSync(this.analyticsFile, JSON.stringify([], null, 2));
        }

        console.log('✅ JSON Storage initialized');
    }

    // Users
    getUsers() {
        return JSON.parse(fs.readFileSync(this.usersFile, 'utf8'));
    }

    saveUser(userId, userData) {
        const users = this.getUsers();
        users[userId] = {
            ...users[userId],
            ...userData,
            lastActive: new Date().toISOString()
        };
        fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
    }

    getUser(userId) {
        return this.getUsers()[userId] || null;
    }

    // Sessions
    getSessions() {
        return JSON.parse(fs.readFileSync(this.sessionsFile, 'utf8'));
    }

    saveSession(userId, sessionData) {
        const sessions = this.getSessions();
        sessions[userId] = {
            ...sessionData,
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(this.sessionsFile, JSON.stringify(sessions, null, 2));
    }

    getSession(userId) {
        return this.getSessions()[userId] || null;
    }

    clearSession(userId) {
        const sessions = this.getSessions();
        delete sessions[userId];
        fs.writeFileSync(this.sessionsFile, JSON.stringify(sessions, null, 2));
    }

    // Analytics
    getAnalytics() {
        return JSON.parse(fs.readFileSync(this.analyticsFile, 'utf8'));
    }

    logAnalytics(userId, action, data = {}) {
        const analytics = this.getAnalytics();
        analytics.push({
            userId,
            action,
            ...data,
            timestamp: new Date().toISOString()
        });
        fs.writeFileSync(this.analyticsFile, JSON.stringify(analytics, null, 2));
    }

    getUserStats(userId) {
        const analytics = this.getAnalytics();
        const userActions = analytics.filter(a => a.userId === userId);

        return {
            totalActions: userActions.length,
            videosAnalyzed: userActions.filter(a => a.action === 'video_analyzed').length,
            scriptsGenerated: userActions.filter(a => a.action === 'script_generated').length,
            trendsChecked: userActions.filter(a => a.action === 'trend_checked').length,
            lastActive: userActions.length > 0 ? userActions[userActions.length - 1].timestamp : null
        };
    }

    // Cache
    getCache() {
        return JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
    }

    setCache(key, data, ttlMinutes = 30) {
        const cache = this.getCache();
        cache[key] = {
            data,
            expiresAt: new Date(Date.now() + ttlMinutes * 60000).toISOString()
        };
        fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
    }

    getCacheItem(key) {
        const cache = this.getCache();
        const item = cache[key];

        if (!item) return null;

        // Check expiration
        if (new Date(item.expiresAt) < new Date()) {
            delete cache[key];
            fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
            return null;
        }

        return item.data;
    }

    clearExpiredCache() {
        const cache = this.getCache();
        const now = new Date();
        let cleared = 0;

        Object.keys(cache).forEach(key => {
            if (new Date(cache[key].expiresAt) < now) {
                delete cache[key];
                cleared++;
            }
        });

        if (cleared > 0) {
            fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
            console.log(`✅ Cleared ${cleared} expired cache items`);
        }
    }

    // Video Analysis History
    getVideoHistory(userId) {
        const user = this.getUser(userId);
        return user?.videoHistory || [];
    }

    addVideoAnalysis(userId, analysis) {
        const user = this.getUser(userId) || {};
        if (!user.videoHistory) user.videoHistory = [];

        user.videoHistory.push({
            ...analysis,
            analyzedAt: new Date().toISOString()
        });

        // Keep only last 50 videos
        if (user.videoHistory.length > 50) {
            user.videoHistory = user.videoHistory.slice(-50);
        }

        this.saveUser(userId, user);
    }
}

module.exports = new JSONStorage();
