// ==UserScript==
// @name         YouTube Fix for Yandex
// @namespace    https://github.com/Xanixsl
// @version      4.4.2
// @description  Оптимизация и исправления YouTube: сетка, производительность, интерфейс, фикс карточки канала и чипсов, мультиязычность, современные темы
// @author       Xanix
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         https://i.postimg.cc/CxVhyKXz/You-Tube-Fix.png
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Xanixsl/YouTube-Fix-for-Yandex/main/youtube-fix-yandex.user.js
// @downloadURL  https://raw.githubusercontent.com/Xanixsl/YouTube-Fix-for-Yandex/main/youtube-fix-yandex.user.js
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- Константы для режима плейлистов ---
    const PLAYLIST_MODE_CLASS = 'yt-enhancer-playlist-mode';
    const PLAYLIST_URL_REGEX = /^\/@[^/]+\/playlists\/?$/;
    let isPlaylistModeActive = false;
    let playlistModeNotification = null;

    // --- Автоматический редирект на /featured для каналов ---
    (function autoRedirectToFeatured() {
        const channelRegex = /^\/@[^/]+\/?$/;
        if (channelRegex.test(location.pathname)) {
            if (!location.pathname.endsWith('/featured')) {
                const newUrl = location.pathname.endsWith('/') ?
                    location.pathname + 'featured' :
                    location.pathname + '/featured';
                location.replace(newUrl + location.search + location.hash);
            }
        }
    })();

    // --- Мультиязычность ---
    const LANGS = {
        en: {
            title: "YouTube Fix for Yandex",
            version: "v4.4.2",
            tabs: ["Main", "Yandex Fixes", "Appearance"],
            tabsNoYandex: ["Main", "Appearance"],
            save: "Save settings",
            reset: "Reset settings",
            saved: "Settings saved! Page will reload...",
            reseted: "Settings reset! Page will reload...",
            confirmReset: "Are you sure you want to reset all settings to default?",
            mainSection: "Main settings",
            mainDesc: "General options for all browsers",
            hideChips: "Hide chips (filters)",
            hideChipsDesc: "Hides the filter bar on the main page and in sections",
            compactMode: "Compact mode",
            compactModeDesc: "Reduces spacing between videos for denser layout",
            hideShorts: "Hide Shorts",
            hideShortsDesc: "Removes Shorts section and recommendations",
            hideRFSlowWarning: "Hide slowdown warning",
            hideRFSlowWarningDesc: "Removes notification about possible slowdowns in Russia",
            fixChannelCard: "Fix channel card on channel tabs",
            fixChannelCardDesc: "Fixes the channel card position on all channel tabs",
            restoreChips: "Restore quick filters (chips) on Videos tab",
            restoreChipsDesc: "Ensures chips are always visible on the channel's Videos tab",
            playlistModeFeature: "Playlists on channels",
            playlistModeFeatureDesc: "Returns playlists to channels (disables yandex browser optimization)",
            playlistModeWarning: "Warning: Playlist page may display incorrectly. Enable 'Playlists on channels' feature in settings to fix.",
            langSection: "Interface language",
            langDesc: "Choose the extension interface language",
            langAuto: "Auto (browser)",
            yandexSection: "Yandex grid settings",
            yandexDesc: "Optimize video grid for Yandex Browser",
            yandexVideoCount: "Videos per row",
            yandexChipbarMargin: "Chipbar shift (px)",
            yandexVideoMargin: "Video block shift (px)",
            yandexExpSection: "Experimental features",
            yandexExpDesc: "Use with caution, may be unstable",
            yandexGridFix: "Fix video grid",
            yandexGridFixDesc: "Fixes 3-videos-per-row bug",
            yandexPerf: "Performance mode",
            yandexPerfDesc: "Improves performance in Yandex Browser",
            yandexExpFix: "Experimental shift fix",
            yandexExpFixDesc: "Alternative UI fix method",
            yandexSiteShift: "Shift amount (px)",
            appearanceSection: "Dark mode",
            appearanceDesc: "Interface appearance settings",
            darkModeSupport: "Dark mode support",
            darkModeSupportDesc: "Auto switch between light and dark themes",
            thumbSection: "Video thumbnail size",
            thumbDesc: "Change video preview size and aspect",
            thumbDefault: "Default (16:9)",
            thumbSmall: "Small (16:9)",
            thumbMedium: "Medium (4:3)",
            thumbLarge: "Large (1:1)",
            themeSection: "Settings window theme",
            themeDesc: "Appearance of this settings window",
            fontSize: "Font size:",
            warning: `Full version available only in <a href="https://browser.yandex.com/?lang=en" target="_blank" style="color: var(--yt-spec-brand-button-background, #065fd4); text-decoration: none; font-weight: bold;">Yandex Browser</a>.`,
            languageButton: "Language",
            ru: "Russian",
            en: "English",
            newMark: "new",
            expMark: "exp",
            themeModernDarkPink: "Dark Pink",
            themeModernMidnight: "Midnight",
            themeModernFrost: "Frost",
            themeModernSky: "Sky",
            themeModernClassic: "Classic",
            themeModernDark: "YouTube Dark",
            playlistModeNotification: "Playlists on Channels feature is enabled, browser optimization is disabled!",
            exitPlaylistModeNotification: "Extension will reload in {seconds} seconds to restore functionality"
        },
        ru: {
            title: "YouTube Fix for Yandex",
            version: "v4.4.2",
            tabs: ["Основные", "Яндекс-фиксы", "Внешний вид"],
            tabsNoYandex: ["Основные", "Внешний вид"],
            save: "Сохранить настройки",
            reset: "Сбросить настройки",
            saved: "Настройки сохранены! Страница будет перезагружена...",
            reseted: "Настройки сброшены! Страница будет перезагружена...",
            confirmReset: "Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?",
            mainSection: "Основные настройки",
            mainDesc: "Общие параметры для всех браузеров",
            hideChips: "Скрыть чипсы (фильтры)",
            hideChipsDesc: "Скрывает полосу с фильтрами на главной странице и в разделах",
            compactMode: "Компактный режим",
            compactModeDesc: "Уменьшает отступы между видео для более плотного расположения",
            hideShorts: "Скрыть Shorts",
            hideShortsDesc: "Убирает раздел Shorts и рекомендации коротких видео",
            hideRFSlowWarning: "Скрыть предупреждение о замедлении",
            hideRFSlowWarningDesc: "Убирает уведомление о возможных замедлениях работы YouTube в РФ",
            fixChannelCard: "Фикс карточки канала на вкладках",
            fixChannelCardDesc: "Исправляет \"съезжающую\" карточку канала на всех вкладках канала",
            restoreChips: "Восстановить быстрые сортировки (чипсы) на вкладке Videos",
            restoreChipsDesc: "Гарантирует отображение чипсов сортировки видео на странице канала",
            playlistModeFeature: "Плейлисты на каналах",
            playlistModeFeatureDesc: "Возвращает плейлисты на каналы (отключает оптимизацию яндекс браузера)",
            playlistModeWarning: "Внимание: Страница плейлистов может отображаться некорректно. Включите функцию 'Плейлисты на каналах' в настройках, чтобы исправить.",
            langSection: "Язык интерфейса",
            langDesc: "Выберите язык интерфейса расширения",
            langAuto: "Автоматически (по браузеру)",
            yandexSection: "Настройки сетки видео",
            yandexDesc: "Оптимизация отображения видео в Яндекс Браузере",
            yandexVideoCount: "Количество видео в строке",
            yandexChipbarMargin: "Сдвиг Chipbar (px)",
            yandexVideoMargin: "Сдвиг блока видео (px)",
            yandexExpSection: "Экспериментальные функции",
            yandexExpDesc: "Используйте с осторожностью, могут быть нестабильными",
            yandexGridFix: "Исправить сетку видео",
            yandexGridFixDesc: "Фиксит проблему с отображением 3 видео в строке",
            yandexPerf: "Режим оптимизации",
            yandexPerfDesc: "Улучшает производительность в Яндекс Браузере",
            yandexExpFix: "Экспериментальный фикс сдвига",
            yandexExpFixDesc: "Альтернативный метод исправления интерфейса",
            yandexSiteShift: "Величина сдвига (px)",
            appearanceSection: "Темный режим",
            appearanceDesc: "Настройки внешнего вида интерфейса",
            darkModeSupport: "Поддержка темной темы",
            darkModeSupportDesc: "Автоматическое переключение между светлой и темной темой",
            thumbSection: "Размер миниатюр видео",
            thumbDesc: "Изменение размера и пропорций превью видео",
            thumbDefault: "По умолчанию (16:9)",
            thumbSmall: "Маленькие (16:9)",
            thumbMedium: "Средние (4:3)",
            thumbLarge: "Большие (1:1)",
            themeSection: "Тема окна настроек",
            themeDesc: "Внешний вид этого окна с настройками",
            fontSize: "Размер шрифта:",
            warning: `Полная версия расширения доступна только в <a href="https://browser.yandex.com/?lang=ru" target="_blank" style="color: var(--yt-spec-brand-button-background, #065fd4); text-decoration: none; font-weight: bold;">Яндекс Браузере</a>.`,
            languageButton: "Язык",
            ru: "Русский",
            en: "Английский",
            newMark: "новое",
            expMark: "эксп",
            themeModernDarkPink: "Тёмно-розовая",
            themeModernMidnight: "Полночь",
            themeModernFrost: "Мороз",
            themeModernSky: "Небо",
            themeModernClassic: "Классика",
            themeModernDark: "YouTube",
            playlistModeNotification: "Включена функция Плейлисты на каналах, оптимизация браузера отключена! ",
            exitPlaylistModeNotification: "Расширение перезагрузится через {seconds} секунды для восстановления функций"
        }
    };

    // --- Язык интерфейса ---
    function getBrowserLang() {
        const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (navLang.startsWith('ru')) return 'ru';
        return 'en';
    }
    function getSavedUILang() {
        try {
            if (typeof localStorage !== 'undefined') {
                const val = localStorage.getItem('ytEnhancer_uiLang');
                if (val && (val === 'ru' || val === 'en' || val === 'auto')) return val;
            }
        } catch {}
        return 'auto';
    }
    function setSavedUILang(lang) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('ytEnhancer_uiLang', lang);
            }
        } catch {}
    }
    function getCurrentUILang() {
        const saved = getSavedUILang();
        if (saved === 'auto') return getBrowserLang();
        return saved;
    }
    let uiLang = getCurrentUILang();
    let L = LANGS[uiLang];

    // --- Trusted Types Policy ---
    window.ytEnhancerTrustedTypesPolicy = window.trustedTypes
        ? window.trustedTypes.createPolicy('yt-enhancer', {
            createHTML: (input) => input
        })
        : null;

    function setInnerHTML(element, htmlString) {
        element.innerHTML = window.ytEnhancerTrustedTypesPolicy
            ? window.ytEnhancerTrustedTypesPolicy.createHTML(htmlString)
            : htmlString;
    }

    // --- Расширенное определение Яндекс.Браузера ---
    function isYandexBrowser() {
        const ua = navigator.userAgent;
        if (/YaBrowser/i.test(ua)) return true;
        if (window.yandex) return true;
        if (navigator.vendor && navigator.vendor.toLowerCase().includes('yandex')) return true;
        if (window.chrome && chrome.runtime && chrome.runtime.id && chrome.runtime.id.startsWith('bhchdcejhohfmigjafbampogmaanbfkg')) return true;
        return false;
    }

    // --- Проверка ОС ---
    function getOS() {
        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;
        if (/Windows/.test(userAgent)) return 'Windows';
        if (/Mac/.test(platform)) return 'MacOS';
        if (/Linux/.test(platform)) return 'Linux';
        if (/Android/.test(userAgent)) return 'Android';
        if (/iOS|iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
        return 'Unknown';
    }

    // --- Конфигурация по умолчанию ---
    const defaultConfig = {
        hideChips: false,
        compactMode: false,
        hideShorts: true,
        hideRFSlowWarning: true,
        fixChannelCard: true,
        restoreChips: true,
        playlistModeFeature: false,
        yandexBrowserFix: true,
        yandexGridFix: true,
        yandexVideoCount: 4,
        yandexChipbarMargin: -70,
        yandexVideoMargin: 100,
        yandexLanguage: 'auto',
        yandexPerformanceMode: true,
        yandexExperimentalFix: false,
        yandexSiteShift: 0,
        darkModeSupport: true,
        customThumbnailSize: 'default',
        enhancerTheme: 'darkpink',
        enhancerFontSize: 14
    };

    // --- Безопасное хранилище для настроек ---
    const storage = {
        get: (key) => {
            try {
                if (typeof localStorage !== 'undefined') {
                    const value = localStorage.getItem(`ytEnhancer_${key}`);
                    return value ? JSON.parse(value) : null;
                }
                return null;
            } catch (e) {
                return null;
            }
        },
        set: (key, value) => {
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(`ytEnhancer_${key}`, JSON.stringify(value));
                    return true;
                }
                return false;
            } catch (e) {
                return false;
            }
        }
    };

    // --- Загрузка конфигурации ---
    let config = (function() {
        try {
            const saved = storage.get('ytEnhancerConfig');
            return saved ? {...defaultConfig, ...saved} : {...defaultConfig};
        } catch (e) {
            return {...defaultConfig};
        }
    })();

    // --- Фиксы для Яндекс Браузера ---
    function applyYandexFixes() {
        if (!isYandexBrowser() || !config.yandexBrowserFix || (isPlaylistModeActive && config.playlistModeFeature)) return;

        if (config.yandexLanguage === 'en') {
            document.cookie = 'PREF=hl=en; domain=.youtube.com; path=/; secure';
            document.cookie = 'CONSENT=YES+; domain=.youtube.com; path=/; secure';
        } else if (config.yandexLanguage === 'ru') {
            document.cookie = 'PREF=hl=ru; domain=.youtube.com; path=/; secure';
            document.cookie = 'CONSENT=YES+; domain=.youtube.com; path=/; secure';
        }

        if (config.yandexGridFix) {
            const fixGrid = () => {
                const grids = document.querySelectorAll('ytd-rich-grid-renderer');
                grids.forEach(grid => {
                    grid.style.setProperty('--ytd-rich-grid-items-per-row', config.yandexVideoCount, 'important');
                    grid.style.setProperty('--ytd-rich-grid-posts-per-row', config.yandexVideoCount, 'important');
                });
            };
            fixGrid();

            if (!window.__ytEnhancerYandexGridInterval) {
                window.__ytEnhancerYandexGridInterval = setInterval(fixGrid, 3000);
            }
        }

        if (config.yandexPerformanceMode) {
            addStyles(`
                ytd-rich-grid-renderer, ytd-rich-item-renderer {
                    will-change: unset !important;
                    contain: unset !important;
                }
                #items.ytd-grid-renderer {
                    contain: strict !important;
                }
                ytd-video-renderer, ytd-grid-video-renderer {
                    transform: translateZ(0);
                }
            `);
        }

        if (config.yandexExperimentalFix) {
            const channelPageRegex = /^\/@[^/]+(\/(videos|featured|shorts|playlists|community|about|streams|search)?)?\/?$/;

            if (!channelPageRegex.test(location.pathname)) {
                addStyles(`
                    ytd-page-manager, ytd-browse {
                        transform: translateY(${config.yandexSiteShift}px) !important;
                    }
                    ytd-masthead, #header.ytd-rich-grid-renderer, ytd-feed-filter-chip-bar-renderer {
                        transform: none !important;
                    }
                `);
            } else {
                addStyles(`
                    ytd-page-manager, ytd-browse {
                        transform: none !important;
                    }
                `);
            }
        }
    }

    // --- Скрытие уведомления о замедлении YouTube в РФ ---
    function hideRFSlowWarning() {
        if (!config.hideRFSlowWarning || (isPlaylistModeActive && config.playlistModeFeature)) return;
        const style = document.createElement('style');
        style.textContent = `
            .sf-notification-btn { display: none !important; }
            ytd-mealbar-promo-renderer { display: none !important; }
            #clarify-box { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    // --- Основные функции ---
    function applyMainFeatures() {
        if (isPlaylistModeActive && config.playlistModeFeature) {
            // В режиме плейлистов отключаем все основные функции
            return;
        }

        // Скрывать чипсы только на главной странице и в разделах, но не на вкладке Videos
        if (config.hideChips && /^\/$/.test(location.pathname)) {
            addStyles(`
                ytd-feed-filter-chip-bar-renderer,
                yt-chip-cloud-renderer,
                yt-related-chip-cloud-renderer,
                #chips-wrapper.ytd-rich-grid-renderer {
                    display: none !important;
                }
            `);
        }

        // Принудительно показываем чипсы на вкладке Videos
        if (/\/@[^/]+\/videos/.test(location.pathname)) {
            addStyles(`
                #chips,
                ytd-feed-filter-chip-bar-renderer,
                yt-chip-cloud-renderer,
                yt-related-chip-cloud-renderer,
                #chips-wrapper.ytd-rich-grid-renderer {
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
            `);
        }

        if (config.compactMode) {
            addStyles(`
                ytd-rich-item-renderer {
                    margin-bottom: 8px !important;
                }
            `);
        }

        if (config.fixChannelCard) {
            fixChannelCardOnChannelTabs();
        }

        if (config.restoreChips) {
            restoreChipsOnVideosTab();
        }

        if (config.hideShorts) {
            addStyles(`
                ytd-rich-section-renderer[section-identifier="shorts-shelf"],
                ytd-reel-shelf-renderer,
                ytd-guide-entry-renderer[title="Shorts"],
                a[title="Shorts"],
                ytd-mini-guide-entry-renderer[title="Shorts"],
                ytd-rich-shelf-renderer[is-shorts],
                ytd-rich-section-renderer[section-identifier="shorts-shelf"] {
                    display: none !important;
                }
            `);
        }
    }

    // --- Фикс карточки канала на всех вкладках ---
    function fixChannelCardOnChannelTabs() {
        if ((isPlaylistModeActive && config.playlistModeFeature)) return;

        const channelUrlRegex = /^\/@[^\/]+(\/(videos|featured|shorts|playlists|community|about|streams))?\/?$/;
        const mainTabRegex = /^\/@[^\/]+\/?$/;
        if (!channelUrlRegex.test(location.pathname)) return;

        addStyles(`
            /* Универсальный фикс для шапки канала */
            ytd-c4-tabbed-header-renderer,
            ytd-channel-header-renderer,
            #channel-header-container {
                position: sticky !important;
                top: 56px !important;
                z-index: 1002 !important;
                background: var(--yt-spec-base-background, #fff) !important;
                margin-bottom: 0 !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
                transition: box-shadow 0.2s !important;
                border-radius: 18px !important;
            }
            @media (max-width: 900px) {
                ytd-c4-tabbed-header-renderer,
                ytd-channel-header-renderer,
                #channel-header-container {
                    top: 48px !important;
                }
            }
            #primary.ytd-two-column-browse-results-renderer {
                margin-top: 0 !important;
            }
            /* Дополнительные стили для мобильной версии */
            ytd-page-manager[page-subtype="channels"] #header.ytd-rich-grid-renderer {
                position: sticky !important;
                top: 48px !important;
                z-index: 1002 !important;
            }
            /* Усиленный фикс для главной вкладки канала */
            ytd-browse[page-subtype="channels"] #primary.ytd-two-column-browse-results-renderer {
                margin-top: 0 !important;
                padding-top: 0 !important;
            }
            ytd-browse[page-subtype="channels"] #header.ytd-c4-tabbed-header-renderer {
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
            }
        `);

        function findChannelHeader() {
            return (
                document.querySelector('ytd-c4-tabbed-header-renderer') ||
                document.querySelector('ytd-channel-header-renderer') ||
                document.querySelector('#channel-header-container') ||
                (document.querySelector('#header') && document.querySelector('#header').querySelector('ytd-c4-tabbed-header-renderer')) ||
                null
            );
        }

        function applyStyles() {
            const header = findChannelHeader();
            if (header) {
                header.style.position = 'sticky';
                header.style.top = window.innerWidth < 900 ? '48px' : '56px';
                header.style.zIndex = '1002';
                header.style.background = 'var(--yt-spec-base-background, #fff)';
                header.style.marginBottom = '0';
                header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                header.style.borderRadius = '18px';
                header.style.paddingBottom = '0';
            }
            const primary = document.querySelector('#primary.ytd-two-column-browse-results-renderer');
            if (primary) {
                primary.style.marginTop = '0';
                primary.style.paddingTop = '0';
            }
            if (mainTabRegex.test(location.pathname)) {
                const headerWrapper = document.querySelector('#header.ytd-c4-tabbed-header-renderer');
                if (headerWrapper) {
                    headerWrapper.style.marginBottom = '0';
                    headerWrapper.style.paddingBottom = '0';
                }
                const browse = document.querySelector('ytd-browse[page-subtype="channels"]');
                if (browse) {
                    browse.style.marginTop = '0';
                    browse.style.paddingTop = '0';
                }
            }
        }

        function waitForHeaderAndApply() {
            let tries = 0;
            function tryApply() {
                applyStyles();
                tries++;
                if (!findChannelHeader() && tries < 20) {
                    setTimeout(tryApply, 200);
                }
            }
            tryApply();
        }

        waitForHeaderAndApply();
        setTimeout(applyStyles, 1000);
        const observer = new MutationObserver(applyStyles);
        observer.observe(document.body, { childList: true, subtree: true });

        let lastPath = location.pathname;
        setInterval(() => {
            if (location.pathname !== lastPath) {
                lastPath = location.pathname;
                if (channelUrlRegex.test(location.pathname)) {
                    waitForHeaderAndApply();
                }
            }
        }, 500);
    }

    // --- Принудительно восстанавливаем чипсы на videos ---
    function restoreChipsOnVideosTab() {
        if ((isPlaylistModeActive && config.playlistModeFeature)) return;

        if (!/^\/@[^\/]+\/videos\/?$/.test(location.pathname)) return;

        let chipsRestored = false;
        const observer = new MutationObserver(() => {
            if (chipsRestored) return;

            const chips = document.querySelector('#chips');
            const chipBar = document.querySelector('ytd-feed-filter-chip-bar-renderer');

            if (!chips && chipBar) {
                const chipsClone = chipBar.cloneNode(true);
                chipsClone.id = 'chips';
                chipsClone.style.marginTop = '0';
                chipsClone.style.marginBottom = '16px';

                const grid = document.querySelector('ytd-rich-grid-renderer');
                if (grid && grid.parentNode) {
                    grid.parentNode.insertBefore(chipsClone, grid);
                    chipsRestored = true;
                }
            }

            document.querySelectorAll(
                '#chips, ytd-feed-filter-chip-bar-renderer, yt-chip-cloud-renderer, yt-related-chip-cloud-renderer, #chips-wrapper.ytd-rich-grid-renderer'
            ).forEach(el => {
                el.style.display = 'flex';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            });
        });

        observer.observe(document.body, {childList: true, subtree: true});
        addStyles(`
            #chips {
                display: flex !important;
                flex-wrap: wrap;
                align-items: center;
                margin-bottom: 16px;
                animation: chipsFadeIn 0.3s;
            }
            @keyframes chipsFadeIn {
                from { opacity: 0; transform: translateY(-10px);}
                to { opacity: 1; transform: translateY(0);}
            }
        `);
    }

    // --- Добавление стилей в DOM ---
    function addStyles(css) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = css;
        const target = document.head || document.documentElement;
        if (target) {
            target.appendChild(style);
        } else {
            setTimeout(() => addStyles(css), 100);
        }
    }

    // --- Применение стилей ---
    function applyStyles() {
        const styles = generateStyles();
        addStyles(styles);
        cleanupSpacing();
    }

    // --- Очистка пробелов ---
    function cleanupSpacing() {
        if (!isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;

        const selectors = [
            '#contents.ytd-rich-grid-renderer',
            'ytd-rich-grid-renderer',
            '#contentContainer.ytd-rich-grid-renderer'
        ];

        selectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    if (el && el.style) {
                        el.style.marginTop = '0';
                        el.style.paddingTop = '0';
                    }
                });
            } catch (e) {
                console.error(`Error cleaning up selector ${selector}:`, e);
            }
        });

        if (config.yandexGridFix) {
            try {
                const grid = document.querySelector('ytd-rich-grid-renderer');
                if (grid) {
                    grid.style.setProperty('--ytd-rich-grid-items-per-row', config.yandexVideoCount, 'important');
                }
            } catch (e) {
                console.error('Error fixing Yandex grid:', e);
            }
        }
    }

    function generateStyles() {
        let css = `
            :root {
                --chips-animation-duration: 0.3s;
                --ytd-rich-grid-items-per-row: ${isYandexBrowser() ? config.yandexVideoCount : 4};
                --enhancer-bg: var(--yt-spec-base-background, #fff);
                --enhancer-fg: var(--yt-spec-text-primary, #030303);
                --enhancer-border: var(--yt-spec-10-percent-layer, #e5e7eb);
                --enhancer-radius: 18px;
                --enhancer-btn-radius: 18px;
                --enhancer-btn-border: var(--yt-spec-brand-button-background, #065fd4);
                --enhancer-btn-fg: var(--yt-spec-brand-button-background, #065fd4);
                --enhancer-btn-hover-bg: var(--yt-spec-brand-button-background, #065fd4);
                --enhancer-btn-hover-fg: #fff;
                --enhancer-badge-bg: var(--yt-spec-badge-chip-background, #f3f6fa);
                --enhancer-badge-fg: var(--yt-spec-brand-button-background, #065fd4);
                --enhancer-badge-exp-bg: #ffe6e6;
                --enhancer-badge-exp-fg: #ff4f4f;
                --enhancer-input-bg: var(--yt-spec-badge-chip-background, #f8fafc);
                --enhancer-input-fg: var(--yt-spec-text-primary, #181a1b);
                --enhancer-input-border: var(--yt-spec-10-percent-layer, #e5e7eb);
                --enhancer-tab-active: var(--yt-spec-brand-button-background, #065fd4);
                --enhancer-tab-inactive: var(--yt-spec-text-secondary, #b0b8c9);
                --enhancer-font: 'Roboto', 'Segoe UI', Arial, sans-serif;
            }

            /* Версия сверху */
            #yt-enhancer-version {
                position: absolute;
                top: 5px;
                right: 15px;
                font-size: 0.85em;
                color: var(--enhancer-tab-inactive);
                opacity: 0.7;
                transition: opacity 0.3s;
            }
            #yt-enhancer-version:hover {
                opacity: 1;
            }

            /* Кнопка закрытия (крестик) — только вращение, без смены цвета и фона */
            #yt-enhancer-settings .yt-enhancer-close-btn {
                background: none !important;
                border: none !important;
                box-shadow: none !important;
                outline: none !important;
                font-size: 1.8em !important;
                cursor: pointer;
                padding: 0 8px !important;
                line-height: 1 !important;
                transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                transform-origin: center;
                color: inherit !important; /* Наследует цвет, не меняет его */
            }
            #yt-enhancer-settings .yt-enhancer-close-btn:hover,
            #yt-enhancer-settings .yt-enhancer-close-btn:focus {
                background: none !important;
                color: inherit !important;
                border: none !important;
                box-shadow: none !important;
                outline: none !important;
                transform: rotate(90deg);
            }

            /* Badge анимации */
            .yt-enhancer-badge {
                display: inline-block;
                margin-left: 6px;
                font-size: 0.75em;
                font-weight: 600;
                border-radius: 6px;
                padding: 2px 8px;
                vertical-align: middle;
                letter-spacing: 0.5px;
                background: var(--enhancer-badge-bg);
                color: var(--enhancer-badge-fg);
                border: none;
                opacity: 0.92;
                text-transform: uppercase;
                transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            .yt-enhancer-badge-exp {
                background: var(--enhancer-badge-exp-bg);
                color: var(--enhancer-badge-exp-fg);
            }
            .yt-enhancer-badge:hover {
                transform: scale(1.05);
                opacity: 1;
                animation: pulse 2s infinite;
            }
            .yt-enhancer-badge-exp:hover {
                animation: pulseExp 1.5s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            @keyframes pulseExp {
                0% { transform: scale(1); opacity: 0.9; }
                25% { transform: scale(1.2); opacity: 1; }
                50% { transform: scale(0.95); opacity: 0.95; }
                75% { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(1); opacity: 0.9; }
            }

            /* Стили для уведомления о плейлистах */
            .yt-enhancer-playlist-warning {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--yt-spec-brand-button-background, #065fd4);
                color: white;
                padding: 12px 24px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 999999;
                max-width: 400px;
                font-family: var(--enhancer-font);
                animation: fadeIn 0.3s ease;
                display: none;
            }
            .yt-enhancer-playlist-warning.show {
                display: block;
            }
            .yt-enhancer-playlist-warning a {
                color: white !important;
                text-decoration: underline !important;
                font-weight: bold;
            }

            #yt-enhancer-settings {
                font-size: ${config.enhancerFontSize}px !important;
                line-height: 1.7 !important;
                font-family: var(--enhancer-font) !important;
                background: var(--enhancer-bg) !important;
                color: var(--enhancer-fg) !important;
                border-radius: var(--enhancer-radius) !important;
                border: 1.5px solid var(--enhancer-border) !important;
                min-width: ${Math.min(540, Math.max(320, config.enhancerFontSize * 20))}px;
                padding: 24px 18px 18px 18px !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
                transition: background 0.2s, color 0.2s;
                position: fixed;
            }
            #yt-enhancer-settings button,
            .yt-enhancer-lang-btn {
                background: none !important;
                color: var(--enhancer-btn-fg) !important;
                border: 2px solid var(--enhancer-btn-border) !important;
                border-radius: var(--enhancer-btn-radius) !important;
                font-weight: 600;
                letter-spacing: 0.02em;
                padding: 10px 18px !important;
                font-size: 1em;
                cursor: pointer;
                transition: background 0.18s, color 0.18s, border-color 0.18s;
                margin-bottom: 0.3em;
                box-shadow: none !important;
            }
            #yt-enhancer-settings button:hover,
            .yt-enhancer-lang-btn:hover {
                background: var(--enhancer-btn-hover-bg) !important;
                color: var(--enhancer-btn-hover-fg) !important;
                border-color: var(--enhancer-btn-hover-bg) !important;
            }
            #yt-enhancer-settings input,
            #yt-enhancer-settings select {
                background: var(--enhancer-input-bg) !important;
                color: var(--enhancer-input-fg) !important;
                border: 1.5px solid var(--enhancer-input-border) !important;
                border-radius: 8px !important;
                padding: 6px 10px !important;
                font-size: 1em;
                font-family: var(--enhancer-font) !important;
                margin-top: 3px;
                margin-bottom: 6px;
                outline: none;
                transition: border-color 0.15s;
            }
            #yt-enhancer-settings input:focus,
            #yt-enhancer-settings select:focus {
                border-color: var(--enhancer-btn-border) !important;
            }
            #yt-enhancer-settings input[type="checkbox"] {
                width: 16px;
                height: 16px;
                accent-color: var(--enhancer-btn-border);
                margin-right: 10px;
                margin-top: 2px;
                vertical-align: middle;
            }
            #yt-enhancer-settings input[type="range"] {
                width: 140px;
                margin-right: 8px;
                accent-color: var(--enhancer-btn-border);
            }
            #yt-enhancer-settings .yt-enhancer-tab {
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                cursor: pointer;
                font-weight: 600;
                color: var(--enhancer-tab-inactive);
                margin-right: 6px;
                font-size: 1em;
                transition: color 0.15s, border-bottom-color 0.15s;
                border-radius: 0;
                padding: 8px 14px;
            }
            #yt-enhancer-settings .yt-enhancer-tab.active {
                color: var(--enhancer-tab-active);
                border-bottom-color: var(--enhancer-tab-active);
            }
            #yt-enhancer-settings .yt-enhancer-section {
                margin-bottom: 18px;
                padding-bottom: 4px;
            }
            #yt-enhancer-settings .yt-enhancer-section:last-child {
                margin-bottom: 0;
            }
            #yt-enhancer-settings .yt-enhancer-checkbox-row {
                display: flex;
                align-items: flex-start;
                margin-bottom: 10px;
                gap: 6px;
            }
            #yt-enhancer-settings .yt-enhancer-checkbox-row label {
                font-weight: 500;
                font-size: 1em;
            }
            #yt-enhancer-settings .yt-enhancer-checkbox-row .desc {
                font-size: 0.92em;
                color: #7a869a;
                margin-top: 2px;
            }
            #yt-enhancer-settings .yt-enhancer-number-input {
                width: 100%;
                max-width: 100px;
            }
            @media (max-width: 700px) {
                #yt-enhancer-settings {
                    min-width: 90vw !important;
                    padding: 14px 4vw 14px 4vw !important;
                }
                #yt-enhancer-version {
                    left: 6vw;
                }
            }
            @media (max-width: 480px) {
                #yt-enhancer-settings {
                    min-width: 98vw !important;
                    padding: 8px 1vw 8px 1vw !important;
                }
                #yt-enhancer-version {
                    left: 2vw;
                }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px);}
                to { opacity: 1; transform: translateY(0);}
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0);}
                to { opacity: 0; transform: translateY(10px);}
            }
        `;
        // --- THEME OVERRIDES ---

        // AUTO: полностью повторяет Material YouTube (цвета, скругления, кнопки)
        if (config.enhancerTheme === 'auto') {
            css += `
                :root {
                    --enhancer-radius: 16px !important;
                    --enhancer-btn-radius: 12px !important;
                    --enhancer-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                @media (prefers-color-scheme: dark) {
                    :root {
                        /* Основные цвета */
                        --enhancer-bg: var(--yt-spec-base-background, #0f0f0f) !important;
                        --enhancer-fg: var(--yt-spec-text-primary, #f1f1f1) !important;
                        --enhancer-border: var(--yt-spec-10-percent-layer, #272727) !important;

                        /* Акценты */
                        --enhancer-primary: var(--yt-spec-brand-button-background, #3ea6ff) !important;
                        --enhancer-secondary: #5fb4ff !important;
                        --enhancer-accent: #7fc1ff !important;

                        /* Элементы интерфейса */
                        --enhancer-btn-border: var(--enhancer-primary) !important;
                        --enhancer-btn-fg: var(--enhancer-primary) !important;
                        --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
                        --enhancer-btn-hover-fg: #000 !important;

                        --enhancer-badge-bg: rgba(62, 166, 255, 0.15) !important;
                        --enhancer-badge-fg: var(--enhancer-primary) !important;
                        --enhancer-badge-exp-bg: #ff7043 !important;
                        --enhancer-badge-exp-fg: #000 !important;

                        /* Формы */
                        --enhancer-input-bg: var(--yt-spec-badge-chip-background, #1f1f1f) !important;
                        --enhancer-input-fg: var(--yt-spec-text-primary, #f1f1f1) !important;
                        --enhancer-input-border: var(--yt-spec-10-percent-layer, #333) !important;

                        /* Вкладки */
                        --enhancer-tab-active: var(--enhancer-primary) !important;
                        --enhancer-tab-inactive: var(--yt-spec-text-secondary, #aaa) !important;

                        /* Разделители */
                        --enhancer-divider: linear-gradient(
                            90deg,
                            transparent,
                            rgba(62, 166, 255, 0.3),
                            transparent
                        ) !important;

                        /* Специальные цвета для select */
                        --enhancer-select-bg: #1f1f1f !important;
                        --enhancer-select-fg: #ffffff !important;
                        --enhancer-select-border: #333 !important;
                    }

                    /* Стили для темной темы */
                    #yt-enhancer-settings {
                        box-shadow:
                            0 0 0 1px rgba(62, 166, 255, 0.2),
                            0 8px 32px rgba(0, 0, 0, 0.5) !important;
                        backdrop-filter: blur(12px);
                    }

                    #yt-enhancer-settings h2 {
                        font-weight: 700;
                        font-size: 1.5em;
                        background: linear-gradient(90deg, #3ea6ff, #5fb4ff);
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent !important;
                        margin-bottom: 24px;
                        position: relative;
                    }

                    #yt-enhancer-settings h2::after {
                        content: '';
                        position: absolute;
                        bottom: -8px;
                        left: 0;
                        width: 100%;
                        height: 1px;
                        background: var(--enhancer-divider);
                    }
                }

                @media (prefers-color-scheme: light) {
                    :root {
                        /* Основные цвета */
                        --enhancer-bg: var(--yt-spec-base-background, #ffffff) !important;
                        --enhancer-fg: var(--yt-spec-text-primary, #030303) !important;
                        --enhancer-border: var(--yt-spec-10-percent-layer, #e5e7eb) !important;

                        /* Акценты */
                        --enhancer-primary: var(--yt-spec-brand-button-background, #065fd4) !important;
                        --enhancer-secondary: #1a73e8 !important;
                        --enhancer-accent: #4285f4 !important;

                        /* Элементы интерфейса */
                        --enhancer-btn-border: var(--enhancer-primary) !important;
                        --enhancer-btn-fg: var(--enhancer-primary) !important;
                        --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
                        --enhancer-btn-hover-fg: #ffffff !important;

                        --enhancer-badge-bg: rgba(6, 95, 212, 0.1) !important;
                        --enhancer-badge-fg: var(--enhancer-primary) !important;
                        --enhancer-badge-exp-bg: #ff9800 !important;
                        --enhancer-badge-exp-fg: #ffffff !important;

                        /* Формы */
                        --enhancer-input-bg: var(--yt-spec-badge-chip-background, #f8fafc) !important;
                        --enhancer-input-fg: var(--yt-spec-text-primary, #181a1b) !important;
                        --enhancer-input-border: var(--yt-spec-10-percent-layer, #e5e7eb) !important;

                        /* Вкладки */
                        --enhancer-tab-active: var(--enhancer-primary) !important;
                        --enhancer-tab-inactive: var(--yt-spec-text-secondary, #b0b8c9) !important;

                        /* Разделители */
                        --enhancer-divider: linear-gradient(
                            90deg,
                            transparent,
                            rgba(6, 95, 212, 0.2),
                            transparent
                        ) !important;

                        /* Специальные цвета для select */
                        --enhancer-select-bg: #ffffff !important;
                        --enhancer-select-fg: #030303 !important;
                        --enhancer-select-border: #e5e7eb !important;
                    }

                    /* Стили для светлой темы */
                    #yt-enhancer-settings {
                        box-shadow:
                            0 0 0 1px rgba(6, 95, 212, 0.1),
                            0 8px 32px rgba(0, 0, 0, 0.1) !important;
                        backdrop-filter: blur(8px);
                    }

                    #yt-enhancer-settings h2 {
                        font-weight: 700;
                        font-size: 1.5em;
                        color: var(--enhancer-primary) !important;
                        margin-bottom: 24px;
                        position: relative;
                    }

                    #yt-enhancer-settings h2::after {
                        content: '';
                        position: absolute;
                        bottom: -8px;
                        left: 0;
                        width: 100%;
                        height: 1px;
                        background: var(--enhancer-divider);
                    }
                }

                /* Общие стили для обеих тем */
                #yt-enhancer-settings h3 {
                    font-weight: 600;
                    color: var(--enhancer-fg) !important;
                    margin: 24px 0 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--enhancer-border);
                }

                .yt-enhancer-section {
                    position: relative;
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                }

                .yt-enhancer-section::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--enhancer-divider);
                }

                #yt-enhancer-settings button {
                    transition: var(--enhancer-transition) !important;
                    position: relative;
                    overflow: hidden;
                }

                #yt-enhancer-settings button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                }

                #yt-enhancer-settings input[type="checkbox"] {
                    accent-color: var(--enhancer-primary) !important;
                    transition: transform 0.2s ease !important;
                }

                #yt-enhancer-settings input[type="checkbox"]:hover {
                    transform: scale(1.1);
                }

                /* Исправленные стили для выпадающего списка */
                #yt-enhancer-settings select {
                    color: var(--enhancer-select-fg) !important;
                    background-color: var(--enhancer-select-bg) !important;
                    border: 1px solid var(--enhancer-select-border) !important;
                    padding: 8px 12px !important;
                    border-radius: 8px !important;
                    transition: var(--enhancer-transition) !important;
                }

                #yt-enhancer-settings select:hover {
                    border-color: var(--enhancer-primary) !important;
                }

                #yt-enhancer-settings select:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(6, 95, 212, 0.2) !important;
                    border-color: var(--enhancer-primary) !important;
                }

                @media (prefers-color-scheme: dark) {
                    #yt-enhancer-settings select:focus {
                        box-shadow: 0 0 0 2px rgba(62, 166, 255, 0.3) !important;
                    }
                }
            `;
        }

        // DARKPINK: черный фон, ярко-розовая обводка, бело-розовый текст, только обводка у кнопок
        if (config.enhancerTheme === 'darkpink') {
            css += `
                :root {
                    /* Цветовая схема */
                    --enhancer-bg: #000000 !important;
                    --enhancer-fg: #ffffff !important;
                    --enhancer-border: rgba(255, 105, 180, 0.2) !important;

                    /* Акценты */
                    --enhancer-primary: #ff69b4 !important;
                    --enhancer-secondary: #ff8ac2 !important;
                    --enhancer-accent: #ffb6e6 !important;

                    /* Элементы интерфейса */
                    --enhancer-btn-border: var(--enhancer-primary) !important;
                    --enhancer-btn-fg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-fg: #000 !important;

                    --enhancer-badge-bg: rgba(255, 105, 180, 0.2) !important;
                    --enhancer-badge-fg: var(--enhancer-primary) !important;
                    --enhancer-badge-exp-bg: #ff3d8e !important;
                    --enhancer-badge-exp-fg: #ffffff !important;

                    /* Формы */
                    --enhancer-input-bg: #18121e !important;
                    --enhancer-input-fg: #ffffff !important;
                    --enhancer-input-border: rgba(255, 105, 180, 0.4) !important;

                    /* Вкладки */
                    --enhancer-tab-active: var(--enhancer-primary) !important;
                    --enhancer-tab-inactive: #b0b8c9 !important;

                    /* Разделители */
                    --enhancer-divider: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 105, 180, 0.4),
                        transparent
                    ) !important;

                    /* Анимации и скругления */
                    --enhancer-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    --enhancer-radius: 16px !important;
                    --enhancer-btn-radius: 12px !important;
                    --enhancer-glow: 0 0 8px rgba(255, 105, 180, 0.6) !important;

                    /* Select */
                    --enhancer-select-bg: #18121e !important;
                    --enhancer-select-fg: #ffffff !important;
                    --enhancer-select-border: rgba(255, 105, 180, 0.4) !important;
                }

                #yt-enhancer-settings {
                    box-shadow:
                        0 0 0 1px rgba(255, 105, 180, 0.3),
                        0 8px 32px rgba(255, 105, 180, 0.15) !important;
                    backdrop-filter: blur(12px);
                    border-radius: var(--enhancer-radius);
                    animation: pulse-glow 6s infinite alternate;
                }

                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 1px rgba(255, 105, 180, 0.3), 0 8px 32px rgba(255, 105, 180, 0.15); }
                    50% { box-shadow: 0 0 0 1px rgba(255, 105, 180, 0.4), 0 8px 32px rgba(255, 105, 180, 0.25); }
                    100% { box-shadow: 0 0 0 1px rgba(255, 105, 180, 0.3), 0 8px 32px rgba(255, 105, 180, 0.15); }
                }

                #yt-enhancer-settings h2 {
                    font-weight: 700;
                    font-size: 1.5em;
                    background: linear-gradient(90deg, #ff69b4, #ff8ac2);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent !important;
                    margin-bottom: 24px;
                    position: relative;
                }

                #yt-enhancer-settings h2::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--enhancer-divider);
                }

                #yt-enhancer-settings h3 {
                    font-weight: 600;
                    color: var(--enhancer-fg) !important;
                    margin: 24px 0 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--enhancer-border);
                }

                .yt-enhancer-section {
                    position: relative;
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                }

                .yt-enhancer-section::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--enhancer-divider);
                }

                #yt-enhancer-settings button {
                    transition: var(--enhancer-transition) !important;
                    border-radius: var(--enhancer-btn-radius) !important;
                    position: relative;
                    overflow: hidden;
                }

                #yt-enhancer-settings button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                }

                #yt-enhancer-settings input[type="checkbox"] {
                    accent-color: var(--enhancer-primary) !important;
                    transition: transform 0.2s ease !important;
                }

                #yt-enhancer-settings input[type="checkbox"]:hover {
                    transform: scale(1.1);
                }

                #yt-enhancer-settings select {
                    color: var(--enhancer-select-fg) !important;
                    background-color: var(--enhancer-select-bg) !important;
                    border: 1px solid var(--enhancer-select-border) !important;
                    padding: 8px 12px !important;
                    border-radius: 8px !important;
                    transition: var(--enhancer-transition) !important;
                }

                #yt-enhancer-settings select:hover {
                    border-color: var(--enhancer-primary) !important;
                }

                #yt-enhancer-settings select:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(255, 105, 180, 0.2) !important;
                    border-color: var(--enhancer-primary) !important;
                }
            `;
        }

        // MIDNIGHT: темный фон, синий акцент, только обводка
        if (config.enhancerTheme === 'midnight') {
            css += `
                :root {
                    /* Цветовая схема */
                    --enhancer-bg: #0f111a !important;
                    --enhancer-fg: #e0e5ff !important;
                    --enhancer-border: rgba(58, 123, 213, 0.15) !important;

                    /* Акценты */
                    --enhancer-primary: #3a7bd5 !important;
                    --enhancer-secondary: #6c8bc7 !important;
                    --enhancer-accent: #00d2ff !important;

                    /* Элементы интерфейса */
                    --enhancer-btn-border: var(--enhancer-primary) !important;
                    --enhancer-btn-fg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-fg: #ffffff !important;

                    --enhancer-badge-bg: rgba(58, 123, 213, 0.2) !important;
                    --enhancer-badge-fg: var(--enhancer-primary) !important;
                    --enhancer-badge-exp-bg: #ff7043 !important;
                    --enhancer-badge-exp-fg: #0f111a !important;

                    /* Формы */
                    --enhancer-input-bg: #1a2138 !important;
                    --enhancer-input-fg: #e0e5ff !important;
                    --enhancer-input-border: rgba(58, 123, 213, 0.3) !important;

                    /* Вкладки */
                    --enhancer-tab-active: var(--enhancer-primary) !important;
                    --enhancer-tab-inactive: #4a5568 !important;

                    /* Разделители */
                    --enhancer-divider: linear-gradient(
                        90deg,
                        transparent,
                        rgba(58, 123, 213, 0.4),
                        transparent
                    ) !important;
                }

                /* Стили контейнера */
                #yt-enhancer-settings {
                    box-shadow:
                        0 0 0 1px rgba(58, 123, 213, 0.3),
                        0 8px 32px rgba(0, 0, 0, 0.5) !important;
                    backdrop-filter: blur(8px);
                    border-radius: 16px !important;
                }

                /* Заголовки */
                #yt-enhancer-settings h2 {
                    font-weight: 700;
                    font-size: 1.5em;
                    background: linear-gradient(90deg, #3a7bd5, #00d2ff);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent !important;
                    margin-bottom: 24px;
                    position: relative;
                }

                #yt-enhancer-settings h2::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--enhancer-divider);
                }

                #yt-enhancer-settings h3 {
                    font-weight: 600;
                    color: #a4b8e1 !important;
                    margin: 24px 0 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(58, 123, 213, 0.3);
                }

                /* Разделители секций */
                .yt-enhancer-section {
                    position: relative;
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                }

                .yt-enhancer-section::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--enhancer-divider);
                }

                /* Анимации */
                #yt-enhancer-settings button,
                .yt-enhancer-lang-btn {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    transform-origin: center;
                }

                #yt-enhancer-settings button:hover,
                .yt-enhancer-lang-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3) !important;
                }

                /* Чекбоксы с анимацией */
                #yt-enhancer-settings input[type="checkbox"] {
                    accent-color: var(--enhancer-primary) !important;
                    transition: transform 0.2s, box-shadow 0.2s !important;
                }

                #yt-enhancer-settings input[type="checkbox"]:hover {
                    transform: scale(1.1);
                }

                /* Выпадающие списки */
                #yt-enhancer-settings select {
                    transition: all 0.3s ease !important;
                    background-repeat: no-repeat !important;
                    background-position: right 10px center !important;
                }

                #yt-enhancer-settings select:hover {
                    border-color: var(--enhancer-primary) !important;
                    box-shadow: 0 0 0 1px var(--enhancer-primary) !important;
                }
            `;
        }

        // FROST: светлый фон, голубая обводка, только обводка
        if (config.enhancerTheme === 'frost') {
            css += `
                :root {
                    /* Цветовая схема */
                    --enhancer-bg: rgba(248, 250, 252, 0.96) !important;
                    --enhancer-fg: #1e293b !important;
                    --enhancer-border: rgba(203, 213, 225, 0.6) !important;

                    /* Акценты */
                    --enhancer-primary: #2563eb !important;
                    --enhancer-secondary: #3b82f6 !important;
                    --enhancer-accent: #60a5fa !important;

                    /* Элементы интерфейса */
                    --enhancer-btn-border: var(--enhancer-primary) !important;
                    --enhancer-btn-fg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-fg: #ffffff !important;

                    --enhancer-badge-bg: rgba(59, 130, 246, 0.1) !important;
                    --enhancer-badge-fg: var(--enhancer-primary) !important;
                    --enhancer-badge-exp-bg: #f97316 !important;
                    --enhancer-badge-exp-fg: #ffffff !important;

                    /* Формы */
                    --enhancer-input-bg: rgba(255, 255, 255, 0.9) !important;
                    --enhancer-input-fg: #1e293b !important;
                    --enhancer-input-border: rgba(203, 213, 225, 0.8) !important;

                    /* Вкладки */
                    --enhancer-tab-active: var(--enhancer-primary) !important;
                    --enhancer-tab-inactive: #94a3b8 !important;

                    /* Разделители */
                    --enhancer-divider: linear-gradient(
                        90deg,
                        transparent,
                        rgba(203, 213, 225, 0.6),
                        transparent
                    ) !important;
                }

                /* Стили контейнера */
                #yt-enhancer-settings {
                    box-shadow:
                        0 0 0 1px rgba(226, 232, 240, 0.8),
                        0 8px 32px rgba(148, 163, 184, 0.12) !important;
                    backdrop-filter: blur(12px);
                    border-radius: 16px !important;
                }

                /* Заголовки */
                #yt-enhancer-settings h2 {
                    font-weight: 700;
                    font-size: 1.5em;
                    color: var(--enhancer-primary) !important;
                    margin-bottom: 24px;
                    position: relative;
                    letter-spacing: -0.5px;
                }

                #yt-enhancer-settings h2::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--enhancer-divider);
                }

                #yt-enhancer-settings h3 {
                    font-weight: 600;
                    color: #475569 !important;
                    margin: 24px 0 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(203, 213, 225, 0.5);
                }

                /* Анимации кнопок */
                #yt-enhancer-settings button {
                    transition: all 0.3s ease !important;
                    position: relative;
                    overflow: hidden;
                }

                #yt-enhancer-settings button::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 5px;
                    height: 5px;
                    background: rgba(255, 255, 255, 0.5);
                    opacity: 0;
                    border-radius: 100%;
                    transform: scale(1, 1) translate(-50%, -50%);
                    transform-origin: 50% 50%;
                }

                #yt-enhancer-settings button:hover::after {
                    animation: ripple 1s ease-out;
                }

                @keyframes ripple {
                    0% {
                        transform: scale(0, 0);
                        opacity: 0.5;
                    }
                    100% {
                        transform: scale(20, 20);
                        opacity: 0;
                    }
                }

                /* Плавные переходы для инпутов */
                #yt-enhancer-settings input,
                #yt-enhancer-settings select {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                #yt-enhancer-settings input:focus,
                #yt-enhancer-settings select:focus {
                    border-color: var(--enhancer-primary) !important;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                }

                /* Стили для чекбоксов */
                #yt-enhancer-settings input[type="checkbox"] {
                    accent-color: var(--enhancer-primary) !important;
                    width: 18px !important;
                    height: 18px !important;
                    transition: transform 0.2s ease !important;
                }

                #yt-enhancer-settings input[type="checkbox"]:hover {
                    transform: scale(1.1);
                }
            `;
        }

        // SKY: светлый фон, голубой акцент, только обводка
        if (config.enhancerTheme === 'sky') {
            css += `
                :root {
                    /* Цветовая схема */
                    --enhancer-bg: rgba(240, 249, 255, 0.98) !important;
                    --enhancer-fg: #0369a1 !important;
                    --enhancer-border: rgba(186, 230, 253, 0.6) !important;

                    /* Акценты */
                    --enhancer-primary: #0284c7 !important;
                    --enhancer-secondary: #0ea5e9 !important;
                    --enhancer-accent: #38bdf8 !important;

                    /* Элементы интерфейса */
                    --enhancer-btn-border: var(--enhancer-accent) !important;
                    --enhancer-btn-fg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-fg: #ffffff !important;

                    --enhancer-badge-bg: rgba(56, 189, 248, 0.2) !important;
                    --enhancer-badge-fg: var(--enhancer-primary) !important;
                    --enhancer-badge-exp-bg: #fb923c !important;
                    --enhancer-badge-exp-fg: #ffffff !important;

                    /* Формы */
                    --enhancer-input-bg: rgba(255, 255, 255, 0.9) !important;
                    --enhancer-input-fg: #0369a1 !important;
                    --enhancer-input-border: rgba(186, 230, 253, 0.8) !important;

                    /* Вкладки */
                    --enhancer-tab-active: var(--enhancer-accent) !important;
                    --enhancer-tab-inactive: #7dd3fc !important;

                    /* Разделители */
                    --enhancer-divider: linear-gradient(
                        90deg,
                        transparent,
                        rgba(2, 132, 199, 0.2),
                        transparent
                    ) !important;
                }

                /* Стили контейнера */
                #yt-enhancer-settings {
                    box-shadow:
                        0 0 0 1px rgba(186, 230, 253, 0.5),
                        0 8px 32px rgba(2, 132, 199, 0.1) !important;
                    backdrop-filter: blur(6px);
                    border-radius: 16px !important;
                }

                /* Анимированные заголовки */
                #yt-enhancer-settings h2 {
                    font-weight: 700;
                    font-size: 1.5em;
                    background: linear-gradient(90deg, #0284c7, #38bdf8);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent !important;
                    margin-bottom: 24px;
                    position: relative;
                    display: inline-block;
                }

                #yt-enhancer-settings h2::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--enhancer-divider);
                }

                #yt-enhancer-settings h3 {
                    font-weight: 600;
                    color: #0c4a6e !important;
                    margin: 24px 0 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(2, 132, 199, 0.2);
                }

                /* Эффект волны для кнопок */
                #yt-enhancer-settings button {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s !important;
                }

                #yt-enhancer-settings button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(2, 132, 199, 0.2) !important;
                }

                #yt-enhancer-settings button::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 5px;
                    height: 5px;
                    background: rgba(255, 255, 255, 0.5);
                    opacity: 0;
                    border-radius: 100%;
                    transform: scale(1, 1) translate(-50%, -50%);
                    transform-origin: 50% 50%;
                }

                #yt-enhancer-settings button:hover::after {
                    animation: ripple 1s ease-out;
                }

                /* Плавное появление элементов */
                .yt-enhancer-section {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Стили для выпадающих списков */
                #yt-enhancer-settings select {
                    transition: all 0.3s ease !important;
                    background-repeat: no-repeat !important;
                    background-position: right 10px center !important;
                }

                #yt-enhancer-settings select:hover {
                    border-color: var(--enhancer-accent) !important;
                    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2) !important;
                }
            `;
        }

        // CLASSIC: светлый фон, серый акцент, только обводка
        if (config.enhancerTheme === 'classic') {
            css += `
                :root {
                    /* Цветовая схема */
                    --enhancer-bg: rgba(255, 255, 255, 0.98) !important;
                    --enhancer-fg: #1f2937 !important;
                    --enhancer-border: rgba(209, 213, 219, 0.6) !important;

                    /* Акценты */
                    --enhancer-primary: #4b5563 !important;
                    --enhancer-secondary: #6b7280 !important;
                    --enhancer-accent: #9ca3af !important;

                    /* Элементы интерфейса */
                    --enhancer-btn-border: var(--enhancer-accent) !important;
                    --enhancer-btn-fg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
                    --enhancer-btn-hover-fg: #ffffff !important;

                    --enhancer-badge-bg: rgba(156, 163, 175, 0.1) !important;
                    --enhancer-badge-fg: var(--enhancer-primary) !important;
                    --enhancer-badge-exp-bg: #f59e0b !important;
                    --enhancer-badge-exp-fg: #ffffff !important;

                    /* Формы */
                    --enhancer-input-bg: rgba(249, 250, 251, 0.9) !important;
                    --enhancer-input-fg: #1f2937 !important;
                    --enhancer-input-border: rgba(209, 213, 219, 0.8) !important;

                    /* Вкладки */
                    --enhancer-tab-active: var(--enhancer-primary) !important;
                    --enhancer-tab-inactive: var(--enhancer-accent) !important;

                    /* Разделители */
                    --enhancer-divider: linear-gradient(
                        90deg,
                        transparent,
                        rgba(156, 163, 175, 0.4),
                        transparent
                    ) !important;
                }

                /* Стили контейнера */
                #yt-enhancer-settings {
                    box-shadow:
                        0 0 0 1px rgba(229, 231, 235, 0.9),
                        0 8px 32px rgba(0, 0, 0, 0.05) !important;
                    backdrop-filter: blur(4px);
                    border-radius: 16px !important;
                }

                /* Заголовки с тонкими разделителями */
                #yt-enhancer-settings h2 {
                    font-weight: 700;
                    font-size: 1.5em;
                    color: var(--enhancer-primary) !important;
                    margin-bottom: 24px;
                    position: relative;
                    letter-spacing: -0.5px;
                }

                #yt-enhancer-settings h2::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--enhancer-divider);
                }

                #yt-enhancer-settings h3 {
                    font-weight: 600;
                    color: #374151 !important;
                    margin: 24px 0 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(209, 213, 219, 0.6);
                }

                /* Минималистичные анимации */
                #yt-enhancer-settings button {
                    transition: all 0.2s ease !important;
                }

                #yt-enhancer-settings button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
                }

                /* Плавное изменение инпутов */
                #yt-enhancer-settings input,
                #yt-enhancer-settings select {
                    transition: all 0.2s ease !important;
                }

                #yt-enhancer-settings input:focus,
                #yt-enhancer-settings select:focus {
                    border-color: var(--enhancer-accent) !important;
                    box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.1) !important;
                }

                /* Стили для чекбоксов */
                #yt-enhancer-settings input[type="checkbox"] {
                    accent-color: var(--enhancer-primary) !important;
                    transition: transform 0.2s ease !important;
                }

                #yt-enhancer-settings input[type="checkbox"]:hover {
                    transform: scale(1.05);
                }
            `;
        }

        // Thumbnail size
        if (config.customThumbnailSize !== 'default' && !isPlaylistModeActive) {
            css += `
                ytd-rich-grid-media {
                    aspect-ratio: ${getThumbnailAspectRatio()} !important;
                }
                ytd-rich-item-renderer {
                    width: ${getThumbnailWidth()} !important;
                }
            `;
        }

        // Yandex grid
        if (isYandexBrowser() && !isPlaylistModeActive) {
            css += `
                #frosted-glass.with-chipbar {
                    margin-top: ${config.yandexChipbarMargin}px !important;
                }
                ytd-rich-grid-renderer,
                #contents.ytd-rich-grid-renderer {
                    margin-top: ${config.yandexExperimentalFix ? 0 : config.yandexVideoMargin}px !important;
                }
                ytd-rich-grid-renderer {
                    --ytd-rich-grid-items-per-row: ${config.yandexVideoCount} !important;
                }
            `;
        } else if (!isPlaylistModeActive) {
            css += `
                ytd-rich-grid-renderer {
                    --ytd-rich-grid-items-per-row: 4 !important;
                }
            `;
        }

        // Playlist mode specific styles
        if (isPlaylistModeActive) {
            css += `
                .${PLAYLIST_MODE_CLASS} #yt-enhancer-settings:not(.playlist-mode-exception) {
                    opacity: 0.25 !important;
                    pointer-events: none !important;
                }

                .${PLAYLIST_MODE_CLASS} #yt-enhancer-btn {
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }

                .${PLAYLIST_MODE_CLASS} #yt-enhancer-settings button:not([disabled]) {
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }
            `;
        }

        return css;
    }

    // --- Вспомогательные функции ---
    function getThumbnailAspectRatio() {
        switch(config.customThumbnailSize) {
            case 'small': return '16/9';
            case 'medium': return '4/3';
            case 'large': return '1/1';
            default: return '16/9';
        }
    }

    function getThumbnailWidth() {
        switch(config.customThumbnailSize) {
            case 'small': return '240px';
            case 'medium': return '320px';
            case 'large': return '360px';
            default: return '100%';
        }
    }

    // --- UI настроек ---
    function createSettingsUI() {
        if (document.getElementById('yt-enhancer-settings')) return;

        const dialog = document.createElement('div');
        dialog.id = 'yt-enhancer-settings';
        if (isPlaylistModeActive) {
            dialog.classList.add('playlist-mode-exception');
        }

        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--yt-spec-base-background, #fff);
            color: var(--yt-spec-text-primary, #030303);
            padding: 24px;
            border-radius: 22px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 999999;
            width: ${isYandexBrowser() ? '540px' : '400px'};
            max-width: 98vw;
            max-height: 96vh;
            overflow-y: auto;
            font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
            border: 2px solid var(--yt-spec-10-percent-layer, #ddd);
        `;

        // --- Версия сверху ---
        const versionDiv = document.createElement('div');
        versionDiv.id = 'yt-enhancer-version';
        versionDiv.textContent = L.version;
        dialog.appendChild(versionDiv);

        // --- Заголовок и крестик ---
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '20px';

        const title = document.createElement('h2');
        title.textContent = L.title;
        title.style.margin = '0';
        title.style.fontSize = '1.5em';
        title.style.color = 'var(--yt-spec-text-primary, #030303)';
        title.style.fontWeight = 'bold';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'yt-enhancer-close-btn';
        setInnerHTML(closeBtn, '&times;');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 2em;
            cursor: pointer;
            color: var(--yt-spec-text-secondary, #606060);
            padding: 0 8px;
            line-height: 1;
        `;

        header.appendChild(title);
        header.appendChild(closeBtn);
        dialog.appendChild(header);

        if (!isYandexBrowser()) {
            const warning = document.createElement('div');
            warning.style.padding = '12px';
            warning.style.marginBottom = '20px';
            warning.style.backgroundColor = 'var(--yt-spec-badge-chip-background, #f8f9fa)';
            warning.style.borderRadius = '8px';
            warning.style.textAlign = 'center';
            setInnerHTML(warning, L.warning);
            dialog.appendChild(warning);
        }

        // --- Вкладки ---
        const tabs = document.createElement('div');
        tabs.style.display = 'flex';
        tabs.style.marginBottom = '20px';
        tabs.style.borderBottom = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

        const tabNames = isYandexBrowser() ? L.tabs : L.tabsNoYandex;
        const tabContents = [];

        tabNames.forEach((name, i) => {
            const tab = document.createElement('button');
            tab.textContent = name;
            tab.dataset.tab = i;
            tab.style.cssText = `
                padding: 10px 18px;
                background: none;
                border: none;
                border-bottom: 2.5px solid transparent;
                cursor: pointer;
                font-weight: 600;
                color: var(--yt-spec-text-secondary, #606060);
                margin-right: 8px;
                font-size: 1em;
                transition: color 0.15s, border-bottom-color 0.15s;
                border-radius: 0;
            `;

            if (i === 0) {
                tab.style.color = 'var(--yt-spec-text-primary, #030303)';
                tab.style.borderBottomColor = 'var(--yt-spec-brand-button-background, #065fd4)';
            }

            tab.addEventListener('click', () => {
                tabs.querySelectorAll('button').forEach(t => {
                    t.style.color = 'var(--yt-spec-text-secondary, #606060)';
                    t.style.borderBottomColor = 'transparent';
                });
                tab.style.color = 'var(--yt-spec-text-primary, #030303)';
                tab.style.borderBottomColor = 'var(--yt-spec-brand-button-background, #065fd4)';
                tabContents.forEach((content, j) => {
                    content.style.display = i === j ? 'block' : 'none';
                });
            });

            tabs.appendChild(tab);
            const content = document.createElement('div');
            content.style.display = i === 0 ? 'block' : 'none';
            content.style.marginBottom = '20px';
            tabContents.push(content);
        });

        dialog.appendChild(tabs);

        if (isYandexBrowser()) {
            createMainTab(tabContents[0]);
            createYandexTab(tabContents[1]);
            createAppearanceTab(tabContents[2]);
        } else {
            createMainTab(tabContents[0]);
            createAppearanceTab(tabContents[1]);
        }

        tabContents.forEach(content => dialog.appendChild(content));

        // --- Кнопки сохранения/сброса ---
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.justifyContent = 'space-between';
        buttons.style.marginTop = '20px';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = L.save;
        saveBtn.style.cssText = `
            padding: 12px 24px;
            background: var(--yt-spec-brand-button-background, #065fd4);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            flex: 1;
            margin-right: 10px;
        `;

        const resetBtn = document.createElement('button');
        resetBtn.textContent = L.reset;
        resetBtn.style.cssText = `
            padding: 12px 24px;
            background: var(--yt-spec-10-percent-layer, #f1f1f1);
            color: var(--yt-spec-text-primary, #030303);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            flex: 1;
            font-weight: 600;
        `;

        buttons.appendChild(saveBtn);
        buttons.appendChild(resetBtn);
        dialog.appendChild(buttons);

        document.body.appendChild(dialog);

        closeBtn.addEventListener('click', () => dialog.remove());

        saveBtn.addEventListener('click', () => {
            const inputs = dialog.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    config[input.id] = input.checked;
                } else if (input.type === 'number') {
                    config[input.id] = parseInt(input.value) || 0;
                } else {
                    config[input.id] = input.value;
                }
            });

            // Автоматическое управление режимом оптимизации
            const playlistModeCheckbox = dialog.querySelector('#playlistModeFeature');
            if (playlistModeCheckbox) {
                const perfModeCheckbox = dialog.querySelector('#yandexPerformanceMode');
                if (playlistModeCheckbox.checked) {
                    // Если включен режим плейлистов, отключаем режим оптимизации
                    perfModeCheckbox.checked = false;
                    perfModeCheckbox.disabled = true;
                    perfModeCheckbox.parentElement.style.opacity = '0.5';
                    config.yandexPerformanceMode = false;
                } else {
                    // Если выключен режим плейлистов, включаем режим оптимизации
                    perfModeCheckbox.checked = true;
                    perfModeCheckbox.disabled = false;
                    perfModeCheckbox.parentElement.style.opacity = '1';
                    config.yandexPerformanceMode = true;
                }
            }

            storage.set('ytEnhancerConfig', config);
            applyStyles();
            applyMainFeatures();
            applyYandexFixes();
            hideRFSlowWarning();
            dialog.remove();
            showNotification(L.saved);
            setTimeout(() => location.reload(), 1000);
        });

        resetBtn.addEventListener('click', () => {
            if (confirm(L.confirmReset)) {
                config = {...defaultConfig};
                storage.set('ytEnhancerConfig', config);
                applyStyles();
                applyMainFeatures();
                applyYandexFixes();
                hideRFSlowWarning();
                dialog.remove();
                showNotification(L.reseted);
                setTimeout(() => location.reload(), 1000);
            }
        });

        const handleOutsideClick = (e) => {
            if (!dialog.contains(e.target)) {
                dialog.remove();
                document.removeEventListener('click', handleOutsideClick);
            }
        };

        setTimeout(() => document.addEventListener('click', handleOutsideClick), 100);
        dialog.addEventListener('click', e => e.stopPropagation());
    }

    // --- Основная вкладка ---
    function createMainTab(container) {
        const section = (title, description = '') => {
            const sectionDiv = document.createElement('div');
            sectionDiv.style.marginBottom = '16px';

            const h3 = document.createElement('h3');
            h3.textContent = title;
            h3.style.margin = '16px 0 8px 0';
            h3.style.fontSize = '1.1em';
            h3.style.color = 'var(--yt-spec-text-primary, #030303)';
            h3.style.fontWeight = 'bold';

            if (description) {
                const desc = document.createElement('p');
                desc.textContent = description;
                desc.style.margin = '4px 0 8px 0';
                desc.style.fontSize = '0.9em';
                desc.style.color = 'var(--yt-spec-text-secondary, #606060)';
                sectionDiv.appendChild(desc);
            }

            sectionDiv.appendChild(h3);
            return sectionDiv;
        };

        const mainSection = section(L.mainSection, L.mainDesc);

        const createCheckbox = (id, label, checked, description = '', isNew = false, isExp = false) => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'flex-start';
            div.style.marginBottom = '12px';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = id;
            input.checked = checked;
            input.style.marginRight = '10px';
            input.style.marginTop = '3px';

            const labelDiv = document.createElement('div');
            const labelEl = document.createElement('label');
            labelEl.htmlFor = id;
            labelEl.textContent = label;
            labelEl.style.userSelect = 'none';
            labelEl.style.fontWeight = '500';
            labelDiv.appendChild(labelEl);

            if (isNew) {
                const newMark = document.createElement('span');
                newMark.textContent = L.newMark;
                newMark.className = 'yt-enhancer-badge';
                labelDiv.appendChild(newMark);
            }

            if (isExp) {
                const expMark = document.createElement('span');
                expMark.textContent = L.expMark;
                expMark.className = 'yt-enhancer-badge yt-enhancer-badge-exp';
                labelDiv.appendChild(expMark);
            }

            if (description) {
                const desc = document.createElement('div');
                desc.textContent = description;
                desc.style.fontSize = '0.85em';
                desc.style.color = 'var(--yt-spec-text-secondary, #606060)';
                desc.style.marginTop = '4px';
                labelDiv.appendChild(desc);
            }

            div.appendChild(input);
            div.appendChild(labelDiv);
            return div;
        };

        mainSection.appendChild(createCheckbox(
            'hideChips', L.hideChips, config.hideChips, L.hideChipsDesc
        ));
        mainSection.appendChild(createCheckbox(
            'compactMode', L.compactMode, config.compactMode, L.compactModeDesc
        ));
        mainSection.appendChild(createCheckbox(
            'hideShorts', L.hideShorts, config.hideShorts, L.hideShortsDesc
        ));
        mainSection.appendChild(createCheckbox(
            'hideRFSlowWarning', L.hideRFSlowWarning, config.hideRFSlowWarning, L.hideRFSlowWarningDesc
        ));
        mainSection.appendChild(createCheckbox(
            'fixChannelCard', L.fixChannelCard, config.fixChannelCard, L.fixChannelCardDesc, true
        ));
        mainSection.appendChild(createCheckbox(
            'restoreChips', L.restoreChips, config.restoreChips, L.restoreChipsDesc, true
        ));
        mainSection.appendChild(createCheckbox(
            'playlistModeFeature', L.playlistModeFeature, config.playlistModeFeature, L.playlistModeFeatureDesc, true, false
        ));

        container.appendChild(mainSection);
    }

    // --- Яндекс вкладка ---
    function createYandexTab(container) {
        const section = (title, description = '') => {
            const sectionDiv = document.createElement('div');
            sectionDiv.style.marginBottom = '16px';

            const h3 = document.createElement('h3');
            h3.textContent = title;
            h3.style.margin = '16px 0 8px 0';
            h3.style.fontSize = '1.1em';
            h3.style.color = 'var(--yt-spec-text-primary, #030303)';
            h3.style.fontWeight = 'bold';
            sectionDiv.appendChild(h3);

            if (description) {
                const desc = document.createElement('p');
                desc.textContent = description;
                desc.style.margin = '4px 0 8px 0';
                desc.style.fontSize = '0.9em';
                desc.style.color = 'var(--yt-spec-text-secondary, #606060)';
                sectionDiv.appendChild(desc);
            }

            return sectionDiv;
        };

        const gridSection = section(L.yandexSection, L.yandexDesc);

        const createNumberInput = (id, label, value, min, max, description = '') => {
            const div = document.createElement('div');
            div.style.marginBottom = '16px';

            const labelDiv = document.createElement('div');
            labelDiv.style.display = 'flex';
            labelDiv.style.justifyContent = 'space-between';
            labelDiv.style.marginBottom = '8px';

            const labelEl = document.createElement('label');
            labelEl.htmlFor = id;
            labelEl.textContent = label;
            labelEl.style.fontWeight = '500';
            labelDiv.appendChild(labelEl);

            if (description) {
                const desc = document.createElement('div');
                desc.textContent = description;
                desc.style.fontSize = '0.85em';
                desc.style.color = 'var(--yt-spec-text-secondary, #606060)';
                labelDiv.appendChild(desc);
            }

            div.appendChild(labelDiv);

            const input = document.createElement('input');
            input.type = 'number';
            input.id = id;
            input.value = value;
            input.min = min;
            input.max = max;
            input.style.width = '50%';
            input.style.padding = '8px';
            input.style.borderRadius = '10px';
            input.style.border = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

            div.appendChild(input);
            return div;
        };

        gridSection.appendChild(createNumberInput(
            'yandexVideoCount', L.yandexVideoCount, config.yandexVideoCount, 1, 6
        ));
        gridSection.appendChild(createNumberInput(
            'yandexChipbarMargin', L.yandexChipbarMargin, config.yandexChipbarMargin, -100, 100
        ));

        const videoMarginInput = createNumberInput(
            'yandexVideoMargin', L.yandexVideoMargin, config.yandexVideoMargin, 0, 200
        );

        if (config.yandexExperimentalFix) {
            videoMarginInput.querySelector('input').disabled = true;
            videoMarginInput.style.opacity = '0.6';
        }

        gridSection.appendChild(videoMarginInput);
        container.appendChild(gridSection);

        const expSection = section(L.yandexExpSection, L.yandexExpDesc);

        const createCheckbox = (id, label, checked, description = '', isExp = false) => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'flex-start';
            div.style.marginBottom = '12px';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = id;
            input.checked = checked;
            input.style.marginRight = '10px';
            input.style.marginTop = '3px';

            const labelDiv = document.createElement('div');
            const labelEl = document.createElement('label');
            labelEl.htmlFor = id;
            labelEl.textContent = label;
            labelEl.style.userSelect = 'none';
            labelEl.style.fontWeight = '500';
            labelDiv.appendChild(labelEl);

            if (isExp) {
                const expMark = document.createElement('span');
                expMark.textContent = L.expMark;
                expMark.className = 'yt-enhancer-badge yt-enhancer-badge-exp';
                labelDiv.appendChild(expMark);
            }

            if (description) {
                const desc = document.createElement('div');
                desc.textContent = description;
                desc.style.fontSize = '0.85em';
                desc.style.color = 'var(--yt-spec-text-secondary, #606060)';
                desc.style.marginTop = '4px';
                labelDiv.appendChild(desc);
            }

            div.appendChild(input);
            div.appendChild(labelDiv);
            return div;
        };

        expSection.appendChild(createCheckbox(
            'yandexGridFix', L.yandexGridFix, config.yandexGridFix, L.yandexGridFixDesc
        ));

        const perfModeCheckbox = createCheckbox(
            'yandexPerformanceMode', L.yandexPerf, config.yandexPerformanceMode, L.yandexPerfDesc
        );

        // Добавляем обработчик изменения для чекбокса плейлистов
        const playlistModeCheckbox = document.querySelector('#playlistModeFeature');
        if (playlistModeCheckbox) {
            if (playlistModeCheckbox.checked) {
                perfModeCheckbox.querySelector('input').disabled = true;
                perfModeCheckbox.style.opacity = '0.5';
            }

            playlistModeCheckbox.addEventListener('change', function() {
                const perfModeInput = perfModeCheckbox.querySelector('input');
                if (this.checked) {
                    perfModeInput.checked = false;
                    perfModeInput.disabled = true;
                    perfModeCheckbox.style.opacity = '0.5';
                } else {
                    perfModeInput.checked = true;
                    perfModeInput.disabled = false;
                    perfModeCheckbox.style.opacity = '1';
                }
            });
        }

        expSection.appendChild(perfModeCheckbox);

        expSection.appendChild(createCheckbox(
            'yandexExperimentalFix', L.yandexExpFix, config.yandexExperimentalFix, L.yandexExpFixDesc, true
        ));

        if (config.yandexExperimentalFix) {
            const shiftDiv = document.createElement('div');
            shiftDiv.style.marginBottom = '16px';
            shiftDiv.style.marginLeft = '28px';

            const shiftInput = createNumberInput(
                'yandexSiteShift', L.yandexSiteShift, config.yandexSiteShift, 0, 500
            );

            shiftDiv.appendChild(shiftInput);
            expSection.appendChild(shiftDiv);
        }

        container.appendChild(expSection);
    }

    // --- Внешний вид вкладка ---
    function createAppearanceTab(container) {
        const section = (title, description = '') => {
            const sectionDiv = document.createElement('div');
            sectionDiv.style.marginBottom = '16px';

            const h3 = document.createElement('h3');
            h3.textContent = title;
            h3.style.margin = '16px 0 8px 0';
            h3.style.fontSize = '1.1em';
            h3.style.color = 'var(--yt-spec-text-primary, #030303)';
            h3.style.fontWeight = 'bold';
            sectionDiv.appendChild(h3);

            if (description) {
                const desc = document.createElement('p');
                desc.textContent = description;
                desc.style.margin = '4px 0 8px 0';
                desc.style.fontSize = '0.9em';
                desc.style.color = 'var(--yt-spec-text-secondary, #606060)';
                sectionDiv.appendChild(desc);
            }

            return sectionDiv;
        };

        const darkModeSection = section(L.appearanceSection, L.appearanceDesc);

        const createCheckbox = (id, label, checked, description = '') => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'flex-start';
            div.style.marginBottom = '12px';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = id;
            input.checked = checked;
            input.style.marginRight = '10px';
            input.style.marginTop = '3px';

            const labelDiv = document.createElement('div');
            const labelEl = document.createElement('label');
            labelEl.htmlFor = id;
            labelEl.textContent = label;
            labelEl.style.userSelect = 'none';
            labelEl.style.fontWeight = '500';
            labelDiv.appendChild(labelEl);

            if (description) {
                const desc = document.createElement('div');
                desc.textContent = description;
                desc.style.fontSize = '0.85em';
                desc.style.color = 'var(--yt-spec-text-secondary, #606060)';
                desc.style.marginTop = '4px';
                labelDiv.appendChild(desc);
            }

            div.appendChild(input);
            div.appendChild(labelDiv);
            return div;
        };

        darkModeSection.appendChild(createCheckbox(
            'darkModeSupport', L.darkModeSupport, config.darkModeSupport, L.darkModeSupportDesc
        ));

        container.appendChild(darkModeSection);

        const thumbSection = section(L.thumbSection, L.thumbDesc);
        const thumbSelect = document.createElement('select');
        thumbSelect.id = 'customThumbnailSize';
        thumbSelect.style.width = '50%';
        thumbSelect.style.padding = '8px';
        thumbSelect.style.borderRadius = '10px';
        thumbSelect.style.marginBottom = '16px';
        thumbSelect.style.border = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

        [
            {value: 'default', label: L.thumbDefault},
            {value: 'small', label: L.thumbSmall},
            {value: 'medium', label: L.thumbMedium},
            {value: 'large', label: L.thumbLarge}
        ].forEach(option => {
            const optEl = document.createElement('option');
            optEl.value = option.value;
            optEl.textContent = option.label;
            if (option.value === config.customThumbnailSize) optEl.selected = true;
            thumbSelect.appendChild(optEl);
        });

        thumbSection.appendChild(thumbSelect);
        container.appendChild(thumbSection);

        // --- Язык интерфейса выпадающим списком ---
        const langSection = section(L.langSection, L.langDesc);
        const langSelect = document.createElement('select');
        langSelect.id = 'ytEnhancerUILang';
        langSelect.style.width = '50%';
        langSelect.style.padding = '8px';
        langSelect.style.borderRadius = '10px';
        langSelect.style.marginBottom = '16px';
        langSelect.style.border = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

        [
            {value: 'auto', label: L.langAuto},
            {value: 'ru', label: L.ru},
            {value: 'en', label: L.en}
        ].forEach(option => {
            const optEl = document.createElement('option');
            optEl.value = option.value;
            optEl.textContent = option.label;
            if (getSavedUILang() === option.value) optEl.selected = true;
            langSelect.appendChild(optEl);
        });

        langSection.appendChild(langSelect);
        container.appendChild(langSection);

        const themeSection = section(L.themeSection, L.themeDesc);
        const themeSelect = document.createElement('select');
        themeSelect.id = 'enhancerTheme';
        themeSelect.style.width = '50%';
        themeSelect.style.padding = '8px';
        themeSelect.style.borderRadius = '10px';
        themeSelect.style.marginBottom = '16px';
        themeSelect.style.border = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

        [
            {value: 'darkpink', label: L.themeModernDarkPink},
            {value: 'midnight', label: L.themeModernMidnight},
            {value: 'frost', label: L.themeModernFrost},
            {value: 'sky', label: L.themeModernSky},
            {value: 'classic', label: L.themeModernClassic},
            {value: 'dark', label: L.themeModernDark}
        ].forEach(option => {
            const optEl = document.createElement('option');
            optEl.value = option.value;
            optEl.textContent = option.label;
            if (option.value === config.enhancerTheme) optEl.selected = true;
            themeSelect.appendChild(optEl);
        });

        themeSection.appendChild(themeSelect);

        const fontSizeDiv = document.createElement('div');
        fontSizeDiv.style.marginBottom = '16px';

        const fontSizeLabel = document.createElement('label');
        fontSizeLabel.htmlFor = 'enhancerFontSize';
        fontSizeLabel.textContent = L.fontSize + ' ';
        fontSizeLabel.style.marginRight = '10px';
        fontSizeLabel.style.fontWeight = '500';

        const fontSizeInput = document.createElement('input');
        fontSizeInput.type = 'range';
        fontSizeInput.id = 'enhancerFontSize';
        fontSizeInput.value = config.enhancerFontSize || 14;
        fontSizeInput.min = '12';
        fontSizeInput.max = '20';
        fontSizeInput.style.width = '200px';
        fontSizeInput.style.marginRight = '10px';

        const fontSizeValue = document.createElement('span');
        fontSizeValue.textContent = `${config.enhancerFontSize || 14}px`;
        fontSizeValue.style.fontWeight = '500';

        fontSizeInput.addEventListener('input', () => {
            fontSizeValue.textContent = `${fontSizeInput.value}px`;
        });

        fontSizeDiv.appendChild(fontSizeLabel);
        fontSizeDiv.appendChild(fontSizeInput);
        fontSizeDiv.appendChild(fontSizeValue);

        themeSection.appendChild(fontSizeDiv);
        container.appendChild(themeSection);

        // --- Смена языка при выборе ---
        langSelect.addEventListener('change', () => {
            setSavedUILang(langSelect.value);
            uiLang = getCurrentUILang();
            L = LANGS[uiLang];
            document.getElementById('yt-enhancer-settings').remove();
            setTimeout(createSettingsUI, 50);
        });
    }

    // --- Показать уведомление ---
    function showNotification(message, duration = 3000) {
        const oldNotifications = document.querySelectorAll('.yt-enhancer-notification');
        oldNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'yt-enhancer-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--yt-spec-brand-button-background, #065fd4);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 999999;
            animation: fadeIn 0.3s ease;
            font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        if (!document.getElementById('yt-enhancer-notification-style')) {
            const style = document.createElement('style');
            style.id = 'yt-enhancer-notification-style';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(10px); }
                }
            `;
            document.head.appendChild(style);
        }

        return notification;
    }

    // --- Показать предупреждение о плейлистах ---
    function showPlaylistWarning() {
        if (config.playlistModeFeature || !PLAYLIST_URL_REGEX.test(location.pathname)) return;

        const warning = document.createElement('div');
        warning.className = 'yt-enhancer-playlist-warning';
        warning.innerHTML = L.playlistModeWarning;
        document.body.appendChild(warning);

        setTimeout(() => warning.classList.add('show'), 1000);

        // Добавляем обработчик клика для открытия настроек
        warning.addEventListener('click', () => {
            createSettingsUI();
            const mainTab = document.querySelector('#yt-enhancer-settings .yt-enhancer-tab[data-tab="0"]');
            if (mainTab) mainTab.click();
        });

        // Автоматическое скрытие через 10 секунд
        setTimeout(() => {
            warning.classList.remove('show');
            setTimeout(() => warning.remove(), 300);
        }, 10000);
    }

    // --- Добавить кнопку в интерфейс YouTube ---
    function addYouTubeButton() {
        const observer = new MutationObserver(() => {
            try {
                const header = document.querySelector('ytd-masthead #end');
                if (header && !document.getElementById('yt-enhancer-btn')) {
                    const button = document.createElement('button');
                    button.id = 'yt-enhancer-btn';
                    button.title = 'YouTube Fix for Yandex';
                    button.style.cssText = `
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        padding: 8px;
                        margin-left: 8px;
                        color: var(--yt-spec-text-primary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;

                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', '0 0 24 24');
                    svg.setAttribute('width', '24');
                    svg.setAttribute('height', '24');
                    svg.style.verticalAlign = 'middle';

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('fill', 'currentColor');
                    path.setAttribute('d', 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z');

                    svg.appendChild(path);
                    button.appendChild(svg);

                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        createSettingsUI();
                    });

                    header.insertBefore(button, header.firstChild);
                }
            } catch (e) {
                console.error('YouTube Fix for Yandex button error:', e);
            }
        });

        observer.observe(document.body, {childList: true, subtree: true});

        setTimeout(() => {
            const header = document.querySelector('ytd-masthead #end');
            if (header && !document.getElementById('yt-enhancer-btn')) {
                const button = document.createElement('button');
                button.id = 'yt-enhancer-btn';
                button.title = 'YouTube Fix for Yandex';
                button.style.cssText = `
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    margin-left: 8px;
                    color: var(--yt-spec-text-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;

                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('width', '24');
                svg.setAttribute('height', '24');
                svg.style.verticalAlign = 'middle';

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('fill', 'currentColor');
                path.setAttribute('d', 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z');

                svg.appendChild(path);
                button.appendChild(svg);

                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    createSettingsUI();
                });

                header.insertBefore(button, header.firstChild);
            }
        }, 1000);
    }

    // --- Проверка и активация режима плейлистов ---
    function checkPlaylistMode() {
        const isPlaylistPage = PLAYLIST_URL_REGEX.test(location.pathname);

        if (isPlaylistPage && !isPlaylistModeActive) {
            if (config.playlistModeFeature) {
                activatePlaylistMode();
            } else {
                showPlaylistWarning();
            }
        } else if (!isPlaylistPage && isPlaylistModeActive) {
            deactivatePlaylistMode();
        }
    }

    // --- Активация режима плейлистов ---
    function activatePlaylistMode() {
        if (!config.playlistModeFeature) return;

        isPlaylistModeActive = true;
        document.documentElement.classList.add(PLAYLIST_MODE_CLASS);

        // Показываем уведомление
        showNotification(L.playlistModeNotification, 5000);

        // Добавляем стили для режима плейлистов
        addStyles(`
            .${PLAYLIST_MODE_CLASS} #yt-enhancer-settings .yt-enhancer-section:not(.playlist-mode-exception),
            .${PLAYLIST_MODE_CLASS} #yt-enhancer-settings .yt-enhancer-tab:not(.playlist-mode-exception),
            .${PLAYLIST_MODE_CLASS} #yt-enhancer-settings button:not(.playlist-mode-exception) {
                opacity: 0.5 !important;
                pointer-events: none !important;
                filter: grayscale(100%) !important;
            }

            .${PLAYLIST_MODE_CLASS} #yt-enhancer-btn {
                opacity: 1 !important;
                pointer-events: auto !important;
            }
        `);
    }

    // --- Деактивация режима плейлистов ---
    function deactivatePlaylistMode() {
        if (!config.playlistModeFeature) return;

        isPlaylistModeActive = false;
        document.documentElement.classList.remove(PLAYLIST_MODE_CLASS);

        // Показываем уведомление о перезагрузке
        const notification = showNotification(
            L.exitPlaylistModeNotification.replace('{seconds}', '2'),
            2000
        );

        // Добавляем отсчет времени в уведомление
        let secondsLeft = 2;
        const interval = setInterval(() => {
            secondsLeft--;
            if (notification && notification.textContent) {
                notification.textContent = L.exitPlaylistModeNotification.replace('{seconds}', secondsLeft);
            }
        }, 1000);

        // Перезагружаем страницу через 2 секунды
        setTimeout(() => {
            clearInterval(interval);
            location.reload();
        }, 2000);
    }

    // --- Инициализация ---
    function init() {
        applyStyles();
        applyMainFeatures();
        applyYandexFixes();
        hideRFSlowWarning();
        addYouTubeButton();
        checkPlaylistMode();

        // Оптимизированный наблюдатель для SPA-навигации
        let lastUrl = location.href;
        const spaObserver = new MutationObserver(() => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                // Используем requestAnimationFrame для оптимизации
                requestAnimationFrame(() => {
                    checkPlaylistMode();
                    applyStyles();
                    applyMainFeatures();
                    applyYandexFixes();
                    hideRFSlowWarning();
                });
            }
        });

        // Более точное наблюдение за изменениями
        spaObserver.observe(document, {
            subtree: true,
            childList: true,
            attributes: false,
            characterData: false
        });

        // Уменьшим частоту проверки с 5 секунд до 10 секунд
        setInterval(() => {
            applyStyles();
            applyMainFeatures();
            applyYandexFixes();
            hideRFSlowWarning();
        }, 10000);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 100);
    } else {
        document.addEventListener('DOMContentLoaded', init);
        window.addEventListener('load', init);
    }
})();
