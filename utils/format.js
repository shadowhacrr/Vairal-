class Format {
    static box(title, content) {
        return `
╔═══════════════════════════════════════╗
║     ${title}               ║
╚═══════════════════════════════════════╝

${content}`;
    }

    static bold(text) {
        return `<b>${text}</b>`;
    }

    static italic(text) {
        return `<i>${text}</i>`;
    }

    static code(text) {
        return `<code>${text}</code>`;
    }

    static link(text, url) {
        return `<a href="${url}">${text}</a>`;
    }

    static list(items, ordered = false) {
        return items.map((item, i) => {
            return ordered ? `${i + 1}. ${item}` : `• ${item}`;
        }).join('\n');
    }

    static progressBar(value, max = 100, length = 10) {
        const filled = Math.round((value / max) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty) + ` ${value}%`;
    }
}

module.exports = Format;
