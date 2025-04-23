// ==UserScript==
// @name         YouTube Fix for Yandex
// @namespace    https://github.com/Xanixsl
// @version      4.2.1
// @description  Оптимизация YouTube специально для Яндекс Браузера: исправление сетки видео, производительности и интерфейса
// @author       Xanix
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

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
        // Основные функции
        hideChips: false,
        compactMode: false,
        hideShorts: true,
        hideRFSlowWarning: true,

        // Яндекс-специфичные настройки
        yandexBrowserFix: true,
        yandexGridFix: true,
        yandexVideoCount: 4,
        yandexChipbarMargin: -70,
        yandexVideoMargin: 100,
        yandexLanguage: 'auto',
        yandexPerformanceMode: true,
        yandexExperimentalFix: false,
        yandexSiteShift: 0,

        // Внешний вид
        darkModeSupport: true,
        customThumbnailSize: 'default',
        enhancerTheme: 'auto',
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
        if (!isYandexBrowser() || !config.yandexBrowserFix) return;

        // Настройки языка интерфейса
        if (config.yandexLanguage === 'en') {
            document.cookie = 'PREF=hl=en; domain=.youtube.com; path=/; secure';
            document.cookie = 'CONSENT=YES+; domain=.youtube.com; path=/; secure';
        } else if (config.yandexLanguage === 'ru') {
            document.cookie = 'PREF=hl=ru; domain=.youtube.com; path=/; secure';
            document.cookie = 'CONSENT=YES+; domain=.youtube.com; path=/; secure';
        }

        // Исправление сетки видео
        if (config.yandexGridFix) {
            const fixGrid = () => {
                const grids = document.querySelectorAll('ytd-rich-grid-renderer');
                grids.forEach(grid => {
                    grid.style.setProperty('--ytd-rich-grid-items-per-row', config.yandexVideoCount, 'important');
                    grid.style.setProperty('--ytd-rich-grid-posts-per-row', config.yandexVideoCount, 'important');
                });
            };

            fixGrid();
            setInterval(fixGrid, 3000);
        }

        // Оптимизация производительности
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

        // Экспериментальный фикс - сдвиг сайта
        if (config.yandexExperimentalFix) {
            addStyles(`
                ytd-page-manager, ytd-browse {
                    transform: translateY(${config.yandexSiteShift}px) !important;
                }

                ytd-masthead, #header.ytd-rich-grid-renderer, ytd-feed-filter-chip-bar-renderer {
                    transform: none !important;
                }
            `);
        }
    }

    // --- Скрытие уведомления о замедлении YouTube в РФ ---
    function hideRFSlowWarning() {
        if (!config.hideRFSlowWarning) return;

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
        // Скрытие Shorts
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

        // Скрытие чипсов
        if (config.hideChips) {
            addStyles(`
                ytd-feed-filter-chip-bar-renderer,
                yt-chip-cloud-renderer,
                yt-related-chip-cloud-renderer,
                #chips-wrapper.ytd-rich-grid-renderer {
                    display: none !important;
                }
            `);
        }

        // Компактный режим
        if (config.compactMode) {
            addStyles(`
                ytd-rich-item-renderer {
                    margin-bottom: 8px !important;
                }
            `);
        }
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
        if (!isYandexBrowser()) return;

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

        // Исправление количества видео для Яндекс Браузера
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

    // --- Генерация CSS ---
    function generateStyles() {
        let css = `
            :root {
                --chips-animation-duration: 0.3s;
                --ytd-rich-grid-items-per-row: ${isYandexBrowser() ? config.yandexVideoCount : 4};
            }
        `;

        if (isYandexBrowser()) {
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
        } else {
            // Минимальные стили для других браузеров
            css += `
                ytd-rich-grid-renderer {
                    --ytd-rich-grid-items-per-row: 4 !important;
                }
            `;
        }

        // Размеры миниатюр
        if (config.customThumbnailSize !== 'default') {
            css += `
                ytd-rich-grid-media {
                    aspect-ratio: ${getThumbnailAspectRatio()} !important;
                }
                ytd-rich-item-renderer {
                    width: ${getThumbnailWidth()} !important;
                }
            `;
        }

        // Темы окна
        css += `
            #yt-enhancer-settings {
                font-size: ${config.enhancerFontSize}px !important;
                line-height: 1.6 !important;
                font-family: 'Segoe UI', 'Roboto', Arial, sans-serif !important;
                box-shadow: 0 8px 32px rgba(0,0,0,0.25) !important;
                transition: background 0.2s, color 0.2s;
                min-width: ${Math.min(540, Math.max(320, config.enhancerFontSize * 20))}px;
            }
        `;

        if (config.enhancerTheme === 'dark') {
            css += `
                #yt-enhancer-settings {
                    background: #181a1b !important;
                    color: #fff !important;
                    border-color: #222 !important;
                }
                #yt-enhancer-settings input, #yt-enhancer-settings select {
                    background: #23272a !important;
                    color: #fff !important;
                    border-color: #333 !important;
                }
            `;
        } else if (config.enhancerTheme === 'blue') {
            css += `
                #yt-enhancer-settings {
                    background: #eaf3fb !important;
                    color: #065fd4 !important;
                    border-color: #065fd4 !important;
                }
                #yt-enhancer-settings input, #yt-enhancer-settings select {
                    background: #f5faff !important;
                    color: #065fd4 !important;
                    border-color: #b3d4fc !important;
                }
            `;
        } else if (config.enhancerTheme === 'glass') {
            css += `
                #yt-enhancer-settings {
                    background: rgba(255,255,255,0.92) !important;
                    backdrop-filter: blur(16px) !important;
                    color: #222 !important;
                    border-color: #e0e0e0 !important;
                }
                #yt-enhancer-settings input, #yt-enhancer-settings select {
                    background: rgba(255,255,255,0.7) !important;
                    color: #222 !important;
                    border-color: #ccc !important;
                }
            `;
        } else if (config.enhancerTheme === 'auto') {
            css += `
                @media (prefers-color-scheme: dark) {
                    #yt-enhancer-settings {
                        background: #181a1b !important;
                        color: #fff !important;
                        border-color: #222 !important;
                    }
                    #yt-enhancer-settings input, #yt-enhancer-settings select {
                        background: #23272a !important;
                        color: #fff !important;
                        border-color: #333 !important;
                    }
                }
            `;
        }

        // Темный режим YouTube
        if (config.darkModeSupport) {
            css += `
                @media (prefers-color-scheme: dark) {
                    :root {
                        --yt-spec-base-background: #0f0f0f !important;
                    }
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
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--yt-spec-base-background, #fff);
            color: var(--yt-spec-text-primary, #030303);
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 999999;
            width: ${isYandexBrowser() ? '540px' : '400px'};
            max-width: 98vw;
            max-height: 96vh;
            overflow-y: auto;
            font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
            border: 1.5px solid var(--yt-spec-10-percent-layer, #ddd);
        `;

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '20px';

        const title = document.createElement('h2');
        title.textContent = isYandexBrowser() ? 'YouTube Yandex Optimizer' : 'YouTube Basic Enhancer';
        title.style.margin = '0';
        title.style.fontSize = '1.5em';
        title.style.color = 'var(--yt-spec-text-primary, #030303)';
        title.style.fontWeight = 'bold';

        const closeBtn = document.createElement('button');
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
            setInnerHTML(warning, `Полная версия расширения доступна только в <a href="https://browser.yandex.com/?lang=ru" target="_blank" style="color: var(--yt-spec-brand-button-background, #065fd4); text-decoration: none; font-weight: bold;">Яндекс Браузере</a>.`);
            dialog.appendChild(warning);
        }

        // Создание вкладок
        const tabs = document.createElement('div');
        tabs.style.display = 'flex';
        tabs.style.marginBottom = '20px';
        tabs.style.borderBottom = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

        const tabNames = isYandexBrowser()
            ? ['Основные', 'Яндекс-фиксы', 'Внешний вид']
            : ['Основные', 'Внешний вид'];

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

            // Содержимое вкладки
            const content = document.createElement('div');
            content.style.display = i === 0 ? 'block' : 'none';
            content.style.marginBottom = '20px';
            tabContents.push(content);
        });

        dialog.appendChild(tabs);

        // Содержимое вкладок
        if (isYandexBrowser()) {
            createMainTab(tabContents[0]);
            createYandexTab(tabContents[1]);
            createAppearanceTab(tabContents[2]);
        } else {
            createMainTab(tabContents[0]);
            createAppearanceTab(tabContents[1]);
        }

        tabContents.forEach(content => dialog.appendChild(content));

        // Кнопки сохранения/сброса
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.justifyContent = 'space-between';
        buttons.style.marginTop = '20px';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Сохранить настройки';
        saveBtn.style.cssText = `
            padding: 12px 24px;
            background: var(--yt-spec-brand-button-background, #065fd4);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            flex: 1;
            margin-right: 10px;
        `;

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Сбросить настройки';
        resetBtn.style.cssText = `
            padding: 12px 24px;
            background: var(--yt-spec-10-percent-layer, #f1f1f1);
            color: var(--yt-spec-text-primary, #030303);
            border: none;
            border-radius: 5px;
            cursor: pointer;
            flex: 1;
            font-weight: 600;
        `;

        buttons.appendChild(saveBtn);
        buttons.appendChild(resetBtn);
        dialog.appendChild(buttons);

        document.body.appendChild(dialog);

        // Обработчики событий
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

            storage.set('ytEnhancerConfig', config);
            applyStyles();
            applyMainFeatures();
            applyYandexFixes();
            hideRFSlowWarning();
            dialog.remove();
            showNotification('Настройки сохранены! Страница будет перезагружена...');
            setTimeout(() => location.reload(), 1000);
        });

        resetBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
                config = {...defaultConfig};
                storage.set('ytEnhancerConfig', config);
                applyStyles();
                applyMainFeatures();
                applyYandexFixes();
                hideRFSlowWarning();
                dialog.remove();
                showNotification('Настройки сброшены! Страница будет перезагружена...');
                setTimeout(() => location.reload(), 1000);
            }
        });

        // Закрытие при клике вне диалога
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

        // Настройки языка (только для Яндекс)
        if (isYandexBrowser()) {
            const langSection = section('Язык интерфейса', 'Выберите предпочитаемый язык интерфейса YouTube');

            const langDiv = document.createElement('div');
            langDiv.style.marginBottom = '16px';

            const langSelect = document.createElement('select');
            langSelect.id = 'yandexLanguage';
            langSelect.style.width = '100%';
            langSelect.style.padding = '8px';
            langSelect.style.borderRadius = '4px';
            langSelect.style.border = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

            [
                {value: 'auto', label: 'Автоматически (по браузеру)'},
                {value: 'ru', label: 'Русский'},
                {value: 'en', label: 'Английский'}
            ].forEach(option => {
                const optEl = document.createElement('option');
                optEl.value = option.value;
                optEl.textContent = option.label;
                if (option.value === config.yandexLanguage) optEl.selected = true;
                langSelect.appendChild(optEl);
            });

            langDiv.appendChild(langSelect);
            langSection.appendChild(langDiv);
            container.appendChild(langSection);
        }

        // Основные настройки
        const mainSection = section('Основные настройки', 'Общие параметры для всех браузеров');

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

        mainSection.appendChild(createCheckbox(
            'hideChips',
            'Скрыть чипсы (фильтры)',
            config.hideChips,
            'Скрывает полосу с фильтрами на главной странице и в разделах'
        ));

        mainSection.appendChild(createCheckbox(
            'compactMode',
            'Компактный режим',
            config.compactMode,
            'Уменьшает отступы между видео для более плотного расположения'
        ));

        mainSection.appendChild(createCheckbox(
            'hideShorts',
            'Скрыть Shorts',
            config.hideShorts,
            'Убирает раздел Shorts и рекомендации коротких видео'
        ));

        mainSection.appendChild(createCheckbox(
            'hideRFSlowWarning',
            'Скрыть предупреждение о замедлении',
            config.hideRFSlowWarning,
            'Убирает уведомление о возможных замедлениях работы YouTube в РФ'
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

        // Настройки сетки
        const gridSection = section('Настройки сетки видео', 'Оптимизация отображения видео в Яндекс Браузере');

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
            input.style.width = '100%';
            input.style.padding = '8px';
            input.style.borderRadius = '4px';
            input.style.border = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

            div.appendChild(input);
            return div;
        };

        gridSection.appendChild(createNumberInput(
            'yandexVideoCount',
            'Количество видео в строке',
            config.yandexVideoCount,
            1, 6,
            'Рекомендуется 4 для широких экранов'
        ));

        gridSection.appendChild(createNumberInput(
            'yandexChipbarMargin',
            'Сдвиг Chipbar (px)',
            config.yandexChipbarMargin,
            -100, 100,
            'Отрицательное значение сдвигает вверх'
        ));

        const videoMarginInput = createNumberInput(
            'yandexVideoMargin',
            'Сдвиг блока видео (px)',
            config.yandexVideoMargin,
            0, 200
        );

        // Блокировка поля при экспериментальном фиксе
        if (config.yandexExperimentalFix) {
            videoMarginInput.querySelector('input').disabled = true;
            videoMarginInput.style.opacity = '0.6';
        }

        gridSection.appendChild(videoMarginInput);
        container.appendChild(gridSection);

        // Экспериментальные настройки
        const expSection = section('Экспериментальные функции', 'Используйте с осторожностью, могут быть нестабильными');

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

        expSection.appendChild(createCheckbox(
            'yandexGridFix',
            'Исправить сетку видео',
            config.yandexGridFix,
            'Фиксит проблему с отображением 3 видео в строке'
        ));

        expSection.appendChild(createCheckbox(
            'yandexPerformanceMode',
            'Режим оптимизации',
            config.yandexPerformanceMode,
            'Улучшает производительность в Яндекс Браузере'
        ));

        const expFixCheckbox = createCheckbox(
            'yandexExperimentalFix',
            'Экспериментальный фикс сдвига',
            config.yandexExperimentalFix,
            'Альтернативный метод исправления интерфейса'
        );

        expSection.appendChild(expFixCheckbox);

        // Поле для сдвига сайта
        if (config.yandexExperimentalFix) {
            const shiftDiv = document.createElement('div');
            shiftDiv.style.marginBottom = '16px';
            shiftDiv.style.marginLeft = '28px';

            const shiftInput = createNumberInput(
                'yandexSiteShift',
                'Величина сдвига (px)',
                config.yandexSiteShift,
                0, 500
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

        // Темный режим
        const darkModeSection = section('Темный режим', 'Настройки внешнего вида интерфейса');

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
            'darkModeSupport',
            'Поддержка темной темы',
            config.darkModeSupport,
            'Автоматическое переключение между светлой и темной темой'
        ));

        container.appendChild(darkModeSection);

        // Размер миниатюр
        const thumbSection = section('Размер миниатюр видео', 'Изменение размера и пропорций превью видео');

        const thumbSelect = document.createElement('select');
        thumbSelect.id = 'customThumbnailSize';
        thumbSelect.style.width = '100%';
        thumbSelect.style.padding = '8px';
        thumbSelect.style.borderRadius = '4px';
        thumbSelect.style.marginBottom = '16px';
        thumbSelect.style.border = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

        [
            {value: 'default', label: 'По умолчанию (16:9)'},
            {value: 'small', label: 'Маленькие (16:9)'},
            {value: 'medium', label: 'Средние (4:3)'},
            {value: 'large', label: 'Большие (1:1)'}
        ].forEach(option => {
            const optEl = document.createElement('option');
            optEl.value = option.value;
            optEl.textContent = option.label;
            if (option.value === config.customThumbnailSize) optEl.selected = true;
            thumbSelect.appendChild(optEl);
        });

        thumbSection.appendChild(thumbSelect);
        container.appendChild(thumbSection);

        // Тема окна
        const themeSection = section('Тема окна настроек', 'Внешний вид этого окна с настройками');

        const themeSelect = document.createElement('select');
        themeSelect.id = 'enhancerTheme';
        themeSelect.style.width = '100%';
        themeSelect.style.padding = '8px';
        themeSelect.style.borderRadius = '4px';
        themeSelect.style.marginBottom = '16px';
        themeSelect.style.border = '1px solid var(--yt-spec-10-percent-layer, #ddd)';

        [
            {value: 'auto', label: 'Автоматически (по системе)'},
            {value: 'light', label: 'Светлая'},
            {value: 'dark', label: 'Темная'},
            {value: 'blue', label: 'Голубая'},
            {value: 'glass', label: 'Стеклянная'}
        ].forEach(option => {
            const optEl = document.createElement('option');
            optEl.value = option.value;
            optEl.textContent = option.label;
            if (option.value === config.enhancerTheme) optEl.selected = true;
            themeSelect.appendChild(optEl);
        });

        themeSection.appendChild(themeSelect);

        // Размер шрифта
        const fontSizeDiv = document.createElement('div');
        fontSizeDiv.style.marginBottom = '16px';

        const fontSizeLabel = document.createElement('label');
        fontSizeLabel.htmlFor = 'enhancerFontSize';
        fontSizeLabel.textContent = 'Размер шрифта: ';
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
            border-radius: 4px;
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

        // Добавление стилей анимации
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
    }

    // --- Добавить кнопку в интерфейс YouTube ---
    function addYouTubeButton() {
        const observer = new MutationObserver(() => {
            try {
                const header = document.querySelector('ytd-masthead #end');
                if (header && !document.getElementById('yt-enhancer-btn')) {
                    const button = document.createElement('button');
                    button.id = 'yt-enhancer-btn';
                    button.title = 'YouTube Yandex Optimizer';
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
                console.error('YouTube Enhancer button error:', e);
            }
        });

        observer.observe(document.body, {childList: true, subtree: true});

        // Попытка добавить кнопку сразу
        setTimeout(() => {
            const header = document.querySelector('ytd-masthead #end');
            if (header && !document.getElementById('yt-enhancer-btn')) {
                const button = document.createElement('button');
                button.id = 'yt-enhancer-btn';
                button.title = isYandexBrowser() ? 'YouTube Yandex Optimizer' : 'YouTube Basic Enhancer';
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

    // --- Инициализация ---
    function init() {
        applyStyles();
        applyMainFeatures();
        applyYandexFixes();
        hideRFSlowWarning();
        addYouTubeButton();

        // Отслеживание изменений SPA
        let lastUrl = location.href;
        const spaObserver = new MutationObserver(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                setTimeout(() => {
                    applyStyles();
                    applyMainFeatures();
                    applyYandexFixes();
                    hideRFSlowWarning();
                }, 300);
            }
        });

        spaObserver.observe(document, {subtree: true, childList: true});

        // Периодическая проверка
        setInterval(() => {
            applyStyles();
            applyMainFeatures();
            applyYandexFixes();
            hideRFSlowWarning();
        }, 5000);
    }

    // --- Безопасный запуск ---
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 100);
    } else {
        document.addEventListener('DOMContentLoaded', init);
        window.addEventListener('load', init);
    }
})();
