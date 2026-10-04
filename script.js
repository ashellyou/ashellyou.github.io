const REPO = 'DP-Hridayan/aShellYou';
const API = `https://api.github.com/repos/${REPO}`;
const CACHE_KEY = 'ashell-stats-v2';
const CACHE_TTL = 60 * 60 * 1000;

const SEEDS = [
    ['#B5353F', 21], ['#F06435', 38], ['#E07200', 54], ['#C78100', 71], ['#B28B00', 89],
    ['#999419', 107], ['#7D9B36', 124], ['#5BA053', 142], ['#30A370', 160], ['#00A38C', 178],
    ['#00A1A3', 196], ['#169EB7', 215], ['#389AC7', 232], ['#5695D2', 249], ['#728FD8', 267],
    ['#8C88D8', 285], ['#A282D1', 302], ['#B67CC2', 321], ['#C677AD', 340], ['#B23268', 359]
];
const DEFAULT_HUE = 124;

const TILE_PRESETS = [
    { name: 'Caffeine', icon: 'coffee', on: 'svc power stayon true', off: 'svc power stayon false' },
    { name: 'Fast animations', icon: 'animation', on: 'settings put global animator_duration_scale 0.5', off: 'settings put global animator_duration_scale 1' },
    { name: 'Dark mode', icon: 'dark_mode', on: 'cmd uimode night yes', off: 'cmd uimode night no' },
    { name: 'ADB over Wi-Fi', icon: 'wifi_tethering', on: 'settings put global adb_wifi_enabled 1', off: 'settings put global adb_wifi_enabled 0' },
    { name: 'Show taps', icon: 'touch_app', on: 'settings put system show_touches 1', off: 'settings put system show_touches 0' },
    { name: 'Layout bounds', icon: 'border_outer', on: 'setprop debug.layout true', off: 'setprop debug.layout false' }
];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    initAppbar();
    initReveal();
    initParallax();
    initSegmented();
    initQuickTiles();
    initSeeds();
    loadStats();
});

function squish(el) {
    if (!el || reduceMotion.matches) return;
    el.classList.add('is-moving');
    clearTimeout(el.squishTimer);
    el.squishTimer = setTimeout(() => el.classList.remove('is-moving'), 260);
}

function initAppbar() {
    const bar = document.getElementById('appbar');
    if (!bar) return;
    const update = () => bar.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
}

function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('is-in'));
        return;
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            entry.target.querySelectorAll('[data-count]').forEach(countUp);
            if (entry.target.matches('[data-count]')) countUp(entry.target);
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => observer.observe(el));
}

function countUp(el) {
    const target = Number(el.dataset.to);
    if (!Number.isFinite(target) || el.dataset.done) return;
    el.dataset.done = '1';
    const suffix = el.dataset.suffix || '';
    if (reduceMotion.matches) {
        el.textContent = formatCount(target) + suffix;
        return;
    }
    const start = performance.now();
    const duration = 1400;
    const tick = now => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = formatCount(Math.round(target * eased)) + suffix;
        if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function formatCount(n) {
    if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
    if (n >= 1e4) return `${Math.round(n / 1e3)}k`;
    return n.toLocaleString('en-US');
}

function initParallax() {
    const items = [...document.querySelectorAll('[data-parallax]')];
    if (!items.length || reduceMotion.matches) return;
    let ticking = false;
    const update = () => {
        const y = window.scrollY;
        items.forEach(el => {
            el.style.setProperty('--py', `${(y * Number(el.dataset.parallax)).toFixed(1)}px`);
        });
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
}

function initSegmented() {
    const list = document.querySelector('.segmented');
    if (!list) return;
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const thumb = list.querySelector('.segmented__thumb');

    const moveThumb = (tab, animate) => {
        if (animate) squish(thumb);
        thumb.style.setProperty('--tx', `${tab.offsetLeft}px`);
        thumb.style.setProperty('--tw', `${tab.offsetWidth}px`);
    };

    const select = (tab, focus) => {
        tabs.forEach(t => {
            const active = t === tab;
            t.setAttribute('aria-selected', String(active));
            t.tabIndex = active ? 0 : -1;
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            panel.hidden = !active;
            panel.classList.toggle('is-active', active);
        });
        moveThumb(tab, true);
        if (focus) tab.focus();
    };

    tabs.forEach(tab => tab.addEventListener('click', () => select(tab, false)));
    list.addEventListener('keydown', e => {
        const index = tabs.indexOf(document.activeElement);
        if (index < 0) return;
        const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (step) {
            e.preventDefault();
            select(tabs[(index + step + tabs.length) % tabs.length], true);
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            select(tabs[e.key === 'Home' ? 0 : tabs.length - 1], true);
        }
    });

    const current = () => tabs.find(t => t.getAttribute('aria-selected') === 'true');
    moveThumb(current());
    window.addEventListener('resize', () => moveThumb(current()));
    document.fonts?.ready.then(() => moveThumb(current()));
}

function initQuickTiles() {
    const grid = document.getElementById('qs-grid');
    const logs = document.getElementById('qs-logs');
    const seg = document.querySelector('.qs__seg');
    if (!grid || !logs || !seg) return;

    const SLOTS = 6;
    const tiles = [{ ...TILE_PRESETS[0], active: true }];
    let nextPreset = 1;
    const minute = 60 * 1000;
    const now = Date.now();
    const caffeine = TILE_PRESETS[0];
    const history = [
        { name: caffeine.name, icon: caffeine.icon, cmd: caffeine.on, ok: true, at: now - 12 * minute },
        { name: caffeine.name, icon: caffeine.icon, cmd: caffeine.off, ok: true, at: now - 2 * 60 * minute },
        { name: caffeine.name, icon: caffeine.icon, cmd: caffeine.on, ok: true, at: now - 5 * 60 * minute },
        { name: caffeine.name, icon: caffeine.icon, cmd: caffeine.off, ok: false, error: 'Shizuku is not running', at: now - 26 * 60 * minute },
        { name: caffeine.name, icon: caffeine.icon, cmd: caffeine.on, ok: true, at: now - 3 * 24 * 60 * minute }
    ];

    const relativeTime = at => {
        const minutes = Math.floor((Date.now() - at) / minute);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} mins ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days < 7) return `${days} days ago`;
        return 'Long ago';
    };

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    const renderLogs = animateFirst => {
        logs.replaceChildren();
        const total = history.length;
        const success = history.filter(h => h.ok).length;
        const rate = total ? `${((success / total) * 100).toFixed(1)}%` : '0.0%';

        const stats = el('div', 'qs-stats');
        const totalCard = el('div', 'qs-stat');
        totalCard.append(el('span', '', 'Total executions'), el('b', '', String(total)));
        const icon = el('i', 'ms ms--fill', 'analytics');
        icon.setAttribute('aria-hidden', 'true');
        totalCard.append(icon);
        const rateCard = el('div', 'qs-stat qs-stat--primary');
        rateCard.append(el('span', '', 'Success rate'), el('b', '', rate));
        stats.append(totalCard, rateCard);

        const recent = el('div', 'qs-recent');
        const filter = el('span', 'qs-filter');
        const filterIcon = el('i', 'ms', 'filter_alt');
        filterIcon.setAttribute('aria-hidden', 'true');
        filter.append(filterIcon, 'Filter');
        recent.append(el('b', '', 'Recent activity'), filter);

        const list = el('ol', 'qs-log-list');
        list.setAttribute('aria-live', 'polite');
        history.forEach((entry, index) => {
            const item = el('li', 'qs-log' + (entry.ok ? '' : ' is-failed') + (animateFirst && index === 0 ? ' is-new' : ''));
            const head = el('div', 'qs-log__head');
            const badgeIcon = el('span', 'qs-log__icon ms', entry.icon);
            badgeIcon.setAttribute('aria-hidden', 'true');
            const meta = el('div');
            meta.append(el('b', '', entry.name), el('small', '', `Shizuku \u2022 ${relativeTime(entry.at)}`));
            head.append(badgeIcon, meta, el('span', 'qs-log__badge', entry.ok ? 'Success' : 'Failed'));
            const cmd = el('div', 'qs-log__cmd');
            cmd.append(el('code', '', entry.cmd));
            item.append(head, cmd);
            if (!entry.ok && entry.error) item.append(el('p', 'qs-log__err', `Error: ${entry.error}`));
            list.append(item);
        });

        logs.append(stats, recent, list);
    };

    const render = newIndex => {
        grid.replaceChildren();
        for (let i = 0; i < SLOTS; i++) {
            const tile = tiles[i];
            const item = document.createElement('div');
            item.setAttribute('role', 'listitem');
            const button = document.createElement('button');
            button.type = 'button';
            if (tile) {
                button.className = 'qs__tile' + (i === newIndex ? ' is-new' : '');
                button.setAttribute('aria-pressed', String(tile.active));
                button.innerHTML = '<span class="ms" aria-hidden="true"></span><span><b></b><small></small></span>';
                button.querySelector('.ms').textContent = tile.icon;
                button.querySelector('b').textContent = tile.name;
                button.querySelector('small').textContent = tile.active ? 'On' : 'Off';
                button.addEventListener('click', () => {
                    tile.active = !tile.active;
                    history.unshift({ name: tile.name, icon: tile.icon, cmd: tile.active ? tile.on : tile.off, ok: true, at: Date.now() });
                    if (history.length > 20) history.pop();
                    button.setAttribute('aria-pressed', String(tile.active));
                    button.querySelector('small').textContent = tile.active ? 'On' : 'Off';
                    renderLogs(true);
                });
            } else {
                button.className = 'qs__slot';
                button.innerHTML = `<span class="ms" aria-hidden="true">add</span><span>Tile ${i + 1}</span>`;
                button.setAttribute('aria-label', `Add tile ${i + 1}`);
                button.addEventListener('click', () => {
                    const preset = TILE_PRESETS[nextPreset % TILE_PRESETS.length];
                    nextPreset++;
                    tiles.push({ ...preset, active: false });
                    render(tiles.length - 1);
                    grid.querySelectorAll('button')[tiles.length - 1]?.focus();
                });
            }
            item.appendChild(button);
            grid.appendChild(item);
        }
    };

    const buttons = [...seg.querySelectorAll('button')];
    const show = view => {
        if (seg.dataset.view && seg.dataset.view !== view) squish(seg.querySelector('.qs__thumb'));
        seg.dataset.view = view;
        buttons.forEach(b => {
            const active = b.dataset.view === view;
            b.setAttribute('aria-selected', String(active));
            b.tabIndex = active ? 0 : -1;
        });
        grid.hidden = view !== 'tiles';
        logs.hidden = view !== 'logs';
        if (view === 'logs') renderLogs(false);
    };
    buttons.forEach(b => b.addEventListener('click', () => show(b.dataset.view)));
    seg.addEventListener('keydown', e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const next = seg.dataset.view === 'tiles' ? 'logs' : 'tiles';
        show(next);
        buttons.find(b => b.dataset.view === next).focus();
    });

    render(-1);
    show('tiles');
}

function initSeeds() {
    const group = document.getElementById('seeds');
    if (!group) return;
    const root = document.documentElement;

    SEEDS.forEach(([hex, hue], index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'seed';
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-label', `Seed colour ${index + 1}`);
        const checked = hue === DEFAULT_HUE;
        button.setAttribute('aria-checked', String(checked));
        button.tabIndex = checked ? 0 : -1;
        button.style.setProperty('--sw', hex);
        button.style.backgroundColor = hex;
        button.dataset.hue = String(hue);
        group.appendChild(button);
    });

    const buttons = [...group.querySelectorAll('.seed')];
    const metaTheme = document.querySelector('meta[name="theme-color"]');

    const select = (button, focus) => {
        buttons.forEach(b => {
            b.setAttribute('aria-checked', 'false');
            b.tabIndex = -1;
        });
        button.setAttribute('aria-checked', 'true');
        button.tabIndex = 0;
        if (focus) button.focus();
        const hue = Number(button.dataset.hue);
        if (!reduceMotion.matches) {
            root.classList.add('is-retheming');
            clearTimeout(root.rethemeTimer);
            root.rethemeTimer = setTimeout(() => root.classList.remove('is-retheming'), 760);
        }
        if (hue === DEFAULT_HUE) {
            root.style.removeProperty('--hue');
        } else {
            root.style.setProperty('--hue', String(hue));
        }
        if (metaTheme) {
            requestAnimationFrame(() => {
                metaTheme.content = getComputedStyle(document.body).backgroundColor;
            });
        }
    };

    group.addEventListener('click', e => {
        const button = e.target.closest('.seed');
        if (button) select(button, false);
    });

    group.addEventListener('keydown', e => {
        const index = buttons.indexOf(document.activeElement);
        if (index < 0) return;
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (step) {
            e.preventDefault();
            select(buttons[(index + step + buttons.length) % buttons.length], true);
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            select(buttons[e.key === 'Home' ? 0 : buttons.length - 1], true);
        }
    });
}

function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return Date.now() - data.at < CACHE_TTL ? data : null;
    } catch {
        return null;
    }
}

function writeCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, at: Date.now() }));
    } catch {
    }
}

async function getJson(url) {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(String(res.status));
    return res;
}

async function sumDownloads() {
    let total = 0;
    for (let page = 1; page <= 10; page++) {
        const releases = await getJson(`${API}/releases?per_page=100&page=${page}`).then(r => r.json());
        releases.forEach(release => release.assets.forEach(asset => { total += asset.download_count; }));
        if (releases.length < 100) break;
    }
    return total;
}

async function fetchStats() {
    const results = await Promise.allSettled([
        getJson(API).then(r => r.json()).then(d => d.stargazers_count),
        getJson(`${API}/contributors?per_page=1&anon=1`).then(async r => {
            const match = (r.headers.get('Link') || '').match(/page=(\d+)>; rel="last"/);
            return match ? Number(match[1]) : (await r.json()).length;
        }),
        getJson(`${API}/releases/latest`).then(r => r.json()).then(d => d.tag_name),
        sumDownloads()
    ]);
    const [stars, contributors, version, downloads] = results.map(r => (r.status === 'fulfilled' ? r.value : null));
    return { stars, contributors, version, downloads };
}

function renderStats(stats) {
    const setCount = (key, value) => {
        document.querySelectorAll(`[data-stat="${key}"]`).forEach(el => {
            el.dataset.to = String(value);
            const cell = el.closest('[data-live]');
            if (cell) cell.hidden = false;
            if (cell?.classList.contains('is-in') || !('IntersectionObserver' in window)) countUp(el);
        });
    };
    if (Number.isFinite(stats.stars)) setCount('stars', stats.stars);
    if (Number.isFinite(stats.downloads) && stats.downloads > 0) setCount('downloads', stats.downloads);
    if (Number.isFinite(stats.contributors)) setCount('contributors', stats.contributors);
    if (stats.version) {
        document.querySelectorAll('[data-stat="version"]').forEach(el => { el.textContent = stats.version; });
    }
}

async function loadStats() {
    try {
        const res = await fetch('stats.json', { cache: 'no-cache' });
        if (res.ok) {
            const stats = await res.json();
            if (Number.isFinite(stats.stars)) {
                renderStats(stats);
                return;
            }
        }
    } catch {
    }
    const cached = readCache();
    if (cached) {
        renderStats(cached);
        return;
    }
    try {
        const stats = await fetchStats();
        renderStats(stats);
        if (stats.stars !== null) writeCache(stats);
    } catch {
    }
}
