// ==============================================================================
//  YouTube Fix for Yandex  —  Debug Module
//  src/debug.js   •   v4.4.6   •   by Xanix
// ==============================================================================
//
//  ПОДКЛЮЧЕНИЕ (локальная разработка, Tampermonkey):
//    Раскомментируй строку @require в заголовке скрипта и укажи свой путь:
//
//      // @require  file:///C:/Users/ИМЯ/Desktop/YouTube-Fix-for-Yandex-main/src/debug.js
//
//    Или через GitHub (кэшируется при установке):
//      // @require  https://raw.githubusercontent.com/Xanixsl/YouTube-Fix-for-Yandex/main/src/debug.js
//
//  АКТИВАЦИЯ:
//    В USER_DEFAULTS установи:  debugMode: true
//
//  ВАЖНО: этот файл не входит в production-сборку скрипта.
//         @require строка в заголовке закомментирована по умолчанию.
// ==============================================================================

/* global unsafeWindow, performance */
/* jshint esversion: 8 */

// Используем var — доступен в том же TM-скоупе что и основной скрипт
// без необходимости обращаться к unsafeWindow
var __ytfixDbg = (function () {
    'use strict';

    // ── Теги и палитра ────────────────────────────────────────────────────────
    const TAGS = {
        INIT:   { label: ' INIT   ', bg: '#6366f1' },
        LANG:   { label: ' LANG   ', bg: '#059669' },
        THEME:  { label: ' THEME  ', bg: '#d97706' },
        FIX:    { label: ' FIX    ', bg: '#0284c7' },
        CINEMA: { label: ' CINEMA ', bg: '#ec4899' },
        CONFIG: { label: ' CONFIG ', bg: '#7c3aed' },
        UI:     { label: '  UI    ', bg: '#0891b2' },
        ERR:    { label: ' ERROR  ', bg: '#dc2626' },
        WARN:   { label: ' WARN   ', bg: '#b45309', fg: '#fff' },
        PERF:   { label: ' PERF   ', bg: '#0f9b6a' },
        NAV:    { label: '  NAV   ', bg: '#8b5cf6' },
    };

    // ── Статусы: цвет точки + цвет текста ────────────────────────────────────
    // OK     = ● зелёный  — всё применено корректно
    // NOTICE = ● жёлтый   — некритическое замечание
    // FAIL   = ● красный  — ошибка, требует внимания
    // SKIP   = ○ серый    — параметр отключён / уже применён
    // INFO   = · тёмно-серый — нейтральная информация
    const STATUS = {
        OK:     { dot: '●', dotColor: '#22c55e', textColor: '#86efac' },
        NOTICE: { dot: '●', dotColor: '#eab308', textColor: '#fde047' },
        FAIL:   { dot: '●', dotColor: '#ef4444', textColor: '#fca5a5' },
        SKIP:   { dot: '○', dotColor: '#475569', textColor: '#94a3b8' },
        INFO:   { dot: '·', dotColor: '#64748b', textColor: '#cbd5e1' },
    };

    const _reset = 'color:inherit;background:inherit;font-weight:normal;font-size:12px';
    const _dim   = 'color:#555;font-size:11px;font-weight:normal';

    const _badgeStyle = ({ bg, fg = '#fff' }) =>
        `background:${bg};color:${fg};font-weight:700;padding:1px 6px;border-radius:3px;font-size:11px;font-family:monospace`;

    let _enabled = false;
    let _t0 = 0;
    const _timers = {};

    // ── Перехват console ──────────────────────────────────────────────────────
    // Сохраняем оригинальные методы сразу (до того, как YouTube успеет переопределить)
    const _origConsole = {
        log:            console.log.bind(console),
        warn:           console.warn.bind(console),
        error:          console.error.bind(console),
        info:           console.info.bind(console),
        group:          console.group.bind(console),
        groupCollapsed: console.groupCollapsed.bind(console),
        groupEnd:       console.groupEnd.bind(console),
        table:          console.table.bind(console),
        clear:          console.clear.bind(console),
    };

    /**
     * Заменяет console.* на пустышки, чтобы шум YouTube/расширений
     * не засорял консоль в режиме отладки.
     * Все вызовы самого дебаг-модуля идут через _origConsole напрямую.
     */
    function _silenceConsole() {
        const noop = () => {};
        ['log', 'warn', 'error', 'info', 'group', 'groupCollapsed', 'groupEnd', 'table', 'dir', 'assert'].forEach(m => {
            console[m] = noop;
        });
    }

    const _ms = () => {
        const v = (performance.now() - _t0).toFixed(1);
        return `+${v}ms`;
    };

    // ── Ядро ─────────────────────────────────────────────────────────────────
    function _out(method, tagKey, statusKey, ...args) {
        if (!_enabled) return;
        const tag = TAGS[tagKey] || TAGS.FIX;
        const st  = STATUS[statusKey] || STATUS.INFO;
        _origConsole[method](
            `%c${tag.label}%c ${st.dot} %c${_ms()}  %c`,
            _badgeStyle(tag),
            `color:${st.dotColor};font-size:14px;font-weight:900;line-height:1`,
            `color:#555;font-size:11px`,
            `color:${st.textColor};font-size:12px`,
            ...args
        );
    }

    // ── Баннер ────────────────────────────────────────────────────────────────
    function _banner(ver) {
        _origConsole.clear();

        _origConsole.log(
            '%c\n' +
            '  ╔══════════════════════════════════════════════════════════╗\n' +
            '  ║                                                          ║\n' +
            '  ║     🎬  YouTube Fix for Yandex  ·  v' + _pad(ver + '  ·  by Xanix', 22) + '║\n' +
            '  ║     🐛  DEBUG MODE  ACTIVE           devtools: F12      ║\n' +
            '  ║                                                          ║\n' +
            '  ║     Set  debugMode: false  in USER_DEFAULTS to silence  ║\n' +
            '  ║                                                          ║\n' +
            '  ╚══════════════════════════════════════════════════════════╝\n',
            'color:#ef4444;font-family:monospace;font-size:11.5px;font-weight:700;line-height:1.4'
        );

        // Легенда статусов + тегов (свёрнутая группа)
        _origConsole.groupCollapsed('%c📋 Легенда  (развернуть)', _dim);
        _origConsole.log(
            '%c  ●  OK      %c— всё выполнено корректно\n' +
            '%c  ●  NOTICE  %c— некритическое замечание\n' +
            '%c  ●  FAIL    %c— ошибка, требует внимания\n' +
            '%c  ○  SKIP    %c— параметр отключён / уже применён',
            `color:${STATUS.OK.dotColor};font-weight:700;font-size:12px`,     `color:${STATUS.OK.textColor};font-size:11px`,
            `color:${STATUS.NOTICE.dotColor};font-weight:700;font-size:12px`, `color:${STATUS.NOTICE.textColor};font-size:11px`,
            `color:${STATUS.FAIL.dotColor};font-weight:700;font-size:12px`,   `color:${STATUS.FAIL.textColor};font-size:11px`,
            `color:${STATUS.SKIP.dotColor};font-weight:700;font-size:12px`,   `color:${STATUS.SKIP.textColor};font-size:11px`
        );
        _origConsole.log('%c ', _dim);
        Object.entries(TAGS).forEach(([k, v]) => {
            _origConsole.log(`%c${v.label}%c  ← ${k}`, _badgeStyle(v), _reset + ';font-size:11px');
        });
        _origConsole.groupEnd();
        _origConsole.log('%c─────────────────────────────────────────────────────────', _dim);
    }

    function _pad(str, width) {
        return str.length >= width ? str : str + ' '.repeat(width - str.length);
    }

    // ── Публичный API ─────────────────────────────────────────────────────────
    const api = {
        get enabled() { return _enabled; },

        /** Вызвать в начале init() после загрузки config */
        init(active, version) {
            _enabled = !!active;
            if (!_enabled) return;
            _t0 = performance.now();
            _silenceConsole();  // подавляем весь чужой шум в консоли
            _banner(version);
            _out('log', 'INIT', 'INFO', 'debug module ready — waiting for page...');
        },

        /** · Нейтральная информация */
        log(tag, ...a)    { _out('log',   tag, 'INFO',   ...a); },

        /** ● Зелёный — всё применено, всё хорошо */
        ok(tag, ...a)     { _out('log',   tag, 'OK',     ...a); },

        /** ● Жёлтый — некритическое замечание */
        notice(tag, ...a) { _out('warn',  tag, 'NOTICE', ...a); },

        /** ● Красный — ошибка, требует внимания */
        fail(tag, ...a)   { _out('error', tag, 'FAIL',   ...a); },

        /** ○ Серый — пропуск (отключено / уже применено) */
        skip(tag, ...a)   { _out('log',   tag, 'SKIP',   ...a); },

        /** Алиасы для обратной совместимости */
        warn(tag, ...a)   { _out('warn',  tag, 'NOTICE', ...a); },
        error(tag, ...a)  { _out('error', tag, 'FAIL',   ...a); },

        /** Открыть/закрыть группу */
        group(label, collapsed = true) {
            if (!_enabled) return;
            const style = 'font-weight:600;font-size:12px';
            collapsed
                ? _origConsole.groupCollapsed(`%c${label}`, style)
                : _origConsole.group(`%c${label}`, style);
        },
        groupEnd() { if (_enabled) _origConsole.groupEnd(); },

        /** Таймеры — цвет по порогу: <5ms=зелёный, 5–20ms=жёлтый, >20ms=красный */
        timeStart(id) {
            if (_enabled) _timers[id] = performance.now();
        },
        timeEnd(id, tag = 'PERF') {
            if (!_enabled || !_timers[id]) return;
            const ms = (performance.now() - _timers[id]).toFixed(2);
            const numMs = parseFloat(ms);
            const st = numMs < 5 ? 'OK' : numMs < 20 ? 'NOTICE' : 'FAIL';
            _out('log', tag, st, `${id}  ⟶  ${ms} ms`);
            delete _timers[id];
        },

        /** Дамп конфига в console.table (свёрнутая группа) */
        dumpConfig(cfg) {
            if (!_enabled) return;
            const rows = Object.entries(cfg).map(([k, v]) => ({ key: k, value: v }));
            _origConsole.groupCollapsed('%c⚙  Active config  (click to expand)', _dim);
            _origConsole.table(rows);
            _origConsole.groupEnd();
        },

        /**
         * Оборачивает функцию: логирует вызов, время выполнения и ошибки.
         * Если debug выключен — возвращает оригинальную функцию без overhead.
         *   const myFn = dbg.fn('myFn', function(...) { ... });
         */
        fn(name, fn) {
            if (!_enabled) return fn;
            const self = this;
            return function (...args) {
                self.timeStart(name);
                try {
                    const r = fn.apply(this, args);
                    if (r && typeof r.then === 'function') {
                        return r
                            .then(v => { self.timeEnd(name); return v; })
                            .catch(e => { self.fail('ERR', `${name} rejected:`, e); throw e; });
                    }
                    self.timeEnd(name);
                    return r;
                } catch (e) {
                    self.fail('ERR', `${name} threw:`, e);
                    throw e;
                }
            };
        },

        /** Разделитель в консоли */
        separator(label = '') {
            if (!_enabled) return;
            if (label) {
                const t = _ms();
                const line = '─'.repeat(Math.max(0, 36 - label.length));
                _origConsole.log(
                    `%c── %c${label}%c ${line} ${t} ──`,
                    _dim,
                    'color:#e2e8f0;font-weight:700;font-size:12px',
                    _dim
                );
            } else {
                _origConsole.log(`%c${'─'.repeat(57)}`, _dim);
            }
        },
    };

    return api;
})();
