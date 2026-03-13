// ==UserScript==
// @name         YouTube Fix for Yandex
// @namespace https://github.com/Xanixsl/test-123-123
// @version      4.4.5
// @description  Оптимизация и исправления YouTube для Яндекс Браузера: сетка, производительность, интерфейс, фикс пустых блоков, кодеков, авто-паузы, скролла, нативный YouTube UI
// @author       Xanix
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         https://i.postimg.cc/CxVhyKXz/You-Tube-Fix.png
// @icon64       https://i.postimg.cc/CxVhyKXz/You-Tube-Fix.png
// @resource     langEN https://raw.githubusercontent.com/Xanixsl/test-123-123/main/lang/EN_en.json
// @resource     langRU https://raw.githubusercontent.com/Xanixsl/test-123-123/main/lang/RU_ru.json
// @resource     themeCSS https://raw.githubusercontent.com/Xanixsl/test-123-123/main/css/style.css
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      www.youtube.com
// @connect      googlevideo.com
// @homepage     https://github.com/Xanixsl/test-123-123
// @supportURL   https://github.com/Xanixsl/test-123-123/issues
// @updateURL    https://raw.githubusercontent.com/Xanixsl/test-123-123/main/youtube-fix-yandex.user.js
// @downloadURL  https://raw.githubusercontent.com/Xanixsl/test-123-123/main/youtube-fix-yandex.user.js
// @run-at       document-start
// @license      MIT
// @licenseURL   https://opensource.org/licenses/MIT
// @contributionURL https://github.com/Xanixsl/test-123-123/discussions
// ==/UserScript==

(function() {
    'use strict';

    // --- Доступ к реальному window (sandbox-safe) ---
    const _unsafeWin = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    // --- Константы для режима плейлистов ---
    const PLAYLIST_MODE_CLASS = 'yt-enhancer-playlist-mode';
    const PLAYLIST_URL_REGEX = /^\/@[^/]+\/playlists\/?$/;
    let isPlaylistModeActive = false;
    let playlistModeNotification = null;
    let _isYandex = null;
    let _initDone = false;
    const _managedStyles = new Map();
    const _observers = [];

    // --- Автоматический редирект на /featured для каналов (отключён: YouTube убрал /featured, вызывает бесконечный цикл редиректов) ---
    // (function autoRedirectToFeatured() { ... })();

    // --- Мультиязычность (встроенные данные + опциональное обновление из @resource / GitHub API) ---
    const _BUILTIN_LANGS = {
        en: {
            title: "YouTube Fix for Yandex", version: "v4.4.5",
            tabs: ["General", "Yandex Fixes", "Settings"], tabsNoYandex: ["General", "Settings"],
            save: "Save settings", reset: "Reset settings",
            saved: "Settings saved! Page will reload...", reseted: "Settings reset! Page will reload...",
            confirmReset: "Are you sure you want to reset all settings to default?",
            mainSection: "Interface", mainDesc: "Display and navigation options for all browsers",
            hideChips: "Hide chips (filters)", hideChipsDesc: "Hides the filter bar on the home page and category sections (chips are always preserved on channel pages)",
            chipbarBgHeight: "Chipbar background height (px)", chipbarBgHeightDesc: "Adjusts the height of the \"frosted-glass\" background strip below the top bar. Set to 0 to fully remove it.",
            hideChipbarBg: "Hide chipbar background", hideChipbarBgDesc: "Completely hides the masthead background strip (for non-Yandex browsers)",
            compactMode: "Compact mode", compactModeDesc: "Reduces spacing between videos for denser layout",
            hideShorts: "Hide Shorts", hideShortsDesc: "Removes Shorts section and recommendations",
            hideTopicShelves: "Hide \"More topics\"", hideTopicShelvesDesc: "Removes topic video shelves (\"More topics\") from the home page",
            hideRFSlowWarning: "Hide slowdown warning", hideRFSlowWarningDesc: "Removes notification about possible slowdowns in Russia",
            fixChannelCard: "Fix channel card on channel tabs", fixChannelCardDesc: "Fixes the channel card position on all channel tabs",
            restoreChips: "Restore quick filters (chips) on Videos tab", restoreChipsDesc: "Ensures chips are always visible on the channel's Videos tab",
            playlistModeFeature: "Playlists on channels", playlistModeFeatureDesc: "Returns playlists to channels (disables yandex browser optimization)",
            playlistModeWarning: "Warning: Playlist page may display incorrectly. Enable 'Playlists on channels' feature in settings to fix.",
            forceH264: "Force H264 codec", forceH264Desc: "Disables VP9/AV1 codecs to fix video stuttering and freezing",
            fixAutoPause: "Auto-dismiss 'Video paused' popup", fixAutoPauseDesc: "Automatically clicks continue when YouTube pauses video",
            fixDarkFlash: "Fix dark theme flash", fixDarkFlashDesc: "Prevents white flash during page navigation in dark theme",
            fixSearchGrid: "Fix search results grid", fixSearchGridDesc: "Corrects video grid layout on search results page",
            fixMiniPlayer: "Fix mini-player overlay", fixMiniPlayerDesc: "Fixes z-index issues with YouTube mini-player",
            scrollOptimization: "Smooth scroll optimization", scrollOptimizationDesc: "Reduces scroll stuttering on feed pages",
            fixSidebar: "Fix sidebar rendering", fixSidebarDesc: "Fixes sidebar display glitches during navigation",
            hideEmptyBlocks: "Hide empty blocks", hideEmptyBlocksDesc: "Hides empty video placeholders and broken promo blocks on the feed",
            fixesSection: "Bug fixes", fixesDesc: "General fixes for YouTube issues in all browsers",
            langSection: "Interface language", langDesc: "Choose the extension interface language", langAuto: "Auto (browser)",
            yandexFixesSection: "Yandex Browser fixes", yandexFixesDesc: "Fixes for known issues specific to Yandex Browser",
            yandexFixNavigation: "Fix SPA navigation", yandexFixNavigationDesc: "Fixes back button and page navigation issues in Yandex Browser",
            yandexFixScrollbar: "Fix page overflow", yandexFixScrollbarDesc: "Fixes double scrollbar and content overflow caused by Yandex optimizations",
            yandexFixFullscreen: "Fix fullscreen mode", yandexFixFullscreenDesc: "Fixes toolbar artifacts and z-index issues in fullscreen video mode",
            yandexFixPlayerControls: "Fix player controls", yandexFixPlayerControlsDesc: "Fixes rendering issues with video player controls in Yandex Browser",
            yandexSection: "Yandex grid settings", yandexDesc: "Optimize video grid for Yandex Browser",
            yandexVideoCount: "Videos per row", yandexVideoCountDesc: "Number of video cards displayed in one row on the home feed.",
            yandexChipbarMargin: "Chipbar shift (px)", yandexChipbarMarginDesc: "Vertical offset of the chip filter bar. Use negative values to move it up when it overlaps the video grid.",
            yandexVideoMargin: "Video block shift (px)", yandexVideoMarginDesc: "Vertical offset of the video grid block. Compensates for layout gaps caused by Yandex Browser optimizations.",
            yandexExpSection: "Experimental features", yandexExpDesc: "Use with caution, may be unstable",
            yandexGridFix: "Fix video grid", yandexGridFixDesc: "Fixes 3-videos-per-row bug",
            yandexPerf: "Performance mode", yandexPerfDesc: "Improves performance in Yandex Browser",
            yandexExpFix: "Experimental shift fix", yandexExpFixDesc: "Alternative UI fix method", yandexSiteShift: "Shift amount (px)",
            appearanceSection: "Dark mode", appearanceDesc: "Interface appearance settings",
            darkModeSupport: "Dark mode support", darkModeSupportDesc: "Auto switch between light and dark themes",
            thumbSection: "Video thumbnail size", thumbDesc: "Change video preview size and aspect",
            thumbDefault: "Default (16:9)", thumbSmall: "Small (16:9)", thumbMedium: "Medium (4:3)", thumbLarge: "Large (1:1)",
            themeSection: "Settings window theme", themeDesc: "Appearance of this settings window",
            themeAuto: "Auto (system)", themeLight: "Light", themeDark: "Dark", fontSize: "Font size:",
            styleSection: "Color scheme", styleDesc: "Color palette and style of the settings window",
            styleYoutube: "YouTube", styleImproved: "Improved (glass + dropdowns)", styleMidnight: "Midnight", styleSunset: "Sunset", styleOcean: "Ocean", styleEmerald: "Emerald", styleRose: "Rose", styleDarkPink: "Dark Pink", styleFrost: "Frost", styleSky: "Sky", styleClassic: "Classic", styleAurora: "Aurora", styleCustom: "Custom",
            customColorsSection: "Fine-tune colors", customColorsDesc: "Manually adjust individual colors (overrides current scheme)",
            customColorEnabled: "Enable custom colors", customColorBg: "Background", customColorFg: "Text",
            customColorPrimary: "Accent color", customColorBorder: "Borders", customColorBtnBorder: "Button border",
            customColorBtnFg: "Button text", customColorBtnHoverBg: "Button hover", customColorBtnHoverFg: "Button hover text",
            customColorBadgeBg: "Badge background", customColorBadgeFg: "Badge text",
            customColorInputBg: "Input background", customColorInputFg: "Input text", customColorInputBorder: "Input border",
            customColorSelectBg: "Dropdown background", customColorSelectFg: "Dropdown text", customColorSelectBorder: "Dropdown border",
            customColorReset: "Reset custom colors", customColorLoadFromTheme: "\u21ba Load from theme",
            styleEditorBtn: "Open Style Editor", styleEditorTitle: "Style Editor",
            styleEditorPresets: "Presets", styleEditorColors: "Colors", styleEditorBackground: "Background", styleEditorCSS: "Custom CSS",
            presetSave: "Save preset", presetLoad: "Load", presetDelete: "Delete", presetExport: "Export", presetImport: "Import",
            presetName: "Preset name", presetNamePlaceholder: "My theme...", presetSaved: "Preset saved!",
            presetDeleted: "Preset deleted", presetExported: "Preset exported to clipboard!",
            presetImportPrompt: "Paste preset JSON:", presetImported: "Preset imported!",
            builtinPresets: "Built-in themes", colorScheme: "Color scheme",
            presetImportError: "Invalid preset data", presetNoPresets: "No saved presets",
            bgSection: "Background image", bgDesc: "Set a background image for the settings window or YouTube page",
            bgUrl: "Image URL", bgUrlPlaceholder: "https://example.com/image.jpg",
            bgApply: "Apply", bgClear: "Clear", bgTarget: "Apply to",
            bgTargetSettings: "Settings window", bgTargetPage: "YouTube page",
            bgOpacity: "Opacity", bgBlur: "Blur (px)", bgSize: "Size",
            bgSizeCover: "Cover", bgSizeContain: "Contain", bgSizeAuto: "Auto",
            cssSection: "Custom CSS for YouTube", cssDesc: "Write custom CSS rules to style YouTube page",
            cssPlaceholder: "/* Example: hide sidebar */\nytd-mini-guide-renderer {\n  display: none !important;\n}",
            cssApply: "Apply CSS", cssClear: "Clear CSS", cssApplied: "Custom CSS applied!",
            styleEditorClose: "Close",
            warning: 'Full version available only in <a href="https://browser.yandex.com/?lang=en" target="_blank" style="color: var(--yt-spec-brand-button-background, #065fd4); text-decoration: none; font-weight: bold;">Yandex Browser</a>.',
            languageButton: "Language", ru: "Russian", en: "English", newMark: "new", expMark: "exp",
            playlistModeNotification: "Playlists on Channels feature is enabled, browser optimization is disabled!",
            exitPlaylistModeNotification: "Extension will reload in {seconds} seconds to restore functionality"
        },
        ru: {
            title: "YouTube Fix for Yandex", version: "v4.4.5",
            tabs: ["Общее", "Яндекс-Фиксы", "Настройки"], tabsNoYandex: ["Общее", "Настройки"],
            save: "Сохранить настройки", reset: "Сбросить настройки",
            saved: "Настройки сохранены! Страница будет перезагружена...", reseted: "Настройки сброшены! Страница будет перезагружена...",
            confirmReset: "Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?",
            mainSection: "Интерфейс", mainDesc: "Параметры отображения и навигации для всех браузеров",
            hideChips: "Скрыть чипсы (фильтры)", hideChipsDesc: "Скрывает полосу с фильтрами только на главной странице и разделах (на страницах каналов чипсы всегда сохраняются)",
            chipbarBgHeight: "Высота фона чипбара (px)", chipbarBgHeightDesc: "Регулирует высоту полосы фона \"frosted-glass\" под топ баром. Значение 0 — полностью убрать.",
            hideChipbarBg: "Скрыть фон чипбара", hideChipbarBgDesc: "Полностью скрывает полосу фона шапки (для других браузеров)",
            compactMode: "Компактный режим", compactModeDesc: "Уменьшает отступы между видео для более плотного расположения",
            hideShorts: "Скрыть Shorts", hideShortsDesc: "Убирает раздел Shorts и рекомендации коротких видео",
            hideTopicShelves: "Скрыть \"Ещё темы\"", hideTopicShelvesDesc: "Убирает секции с тематическими подборками видео (\"Ещё темы\") на главной странице",
            hideRFSlowWarning: "Скрыть предупреждение о замедлении", hideRFSlowWarningDesc: "Убирает уведомление о возможных замедлениях работы YouTube в РФ",
            fixChannelCard: "Фикс карточки канала на вкладках", fixChannelCardDesc: "Исправляет \"съезжающую\" карточку канала на всех вкладках канала",
            restoreChips: "Восстановить быстрые сортировки (чипсы) на вкладке Videos", restoreChipsDesc: "Гарантирует отображение чипсов сортировки видео на странице канала",
            playlistModeFeature: "Плейлисты на каналах", playlistModeFeatureDesc: "Возвращает плейлисты на каналы (отключает оптимизацию яндекс браузера)",
            playlistModeWarning: "Внимание: Страница плейлистов может отображаться некорректно. Включите функцию 'Плейлисты на каналах' в настройках, чтобы исправить.",
            forceH264: "Принудительный кодек H264", forceH264Desc: "Отключает VP9/AV1 кодеки для устранения подтормаживаний и зависаний видео",
            fixAutoPause: "Авто-закрытие 'Видео приостановлено'", fixAutoPauseDesc: "Автоматически нажимает продолжить, когда YouTube ставит видео на паузу",
            fixDarkFlash: "Фикс вспышки темной темы", fixDarkFlashDesc: "Устраняет белую вспышку при навигации в темной теме",
            fixSearchGrid: "Фикс сетки поиска", fixSearchGridDesc: "Исправляет сетку видео на странице результатов поиска",
            fixMiniPlayer: "Фикс мини-плеера", fixMiniPlayerDesc: "Исправляет проблемы наложения мини-плеера",
            scrollOptimization: "Оптимизация скролла", scrollOptimizationDesc: "Уменьшает подтормаживания при прокрутке ленты",
            fixSidebar: "Фикс боковой панели", fixSidebarDesc: "Устраняет глитчи боковой панели при навигации",
            hideEmptyBlocks: "Скрыть пустые блоки", hideEmptyBlocksDesc: "Скрывает пустые плейсхолдеры видео и сломанные промо-блоки в ленте",
            fixesSection: "Исправления багов", fixesDesc: "Общие исправления для YouTube во всех браузерах",
            langSection: "Язык интерфейса", langDesc: "Выберите язык интерфейса расширения", langAuto: "Автоматически (по браузеру)",
            yandexFixesSection: "Фиксы Яндекс Браузера", yandexFixesDesc: "Исправления проблем, специфичных для Яндекс Браузера",
            yandexFixNavigation: "Фикс SPA-навигации", yandexFixNavigationDesc: "Исправляет проблемы с кнопкой Назад и переходами между страницами в Яндекс Браузере",
            yandexFixScrollbar: "Фикс переполнения страницы", yandexFixScrollbarDesc: "Устраняет двойную прокрутку и переполнение контента, вызванные оптимизациями Яндекса",
            yandexFixFullscreen: "Фикс полноэкранного режима", yandexFixFullscreenDesc: "Устраняет артефакты панелей и проблемы наложения в полноэкранном режиме видео",
            yandexFixPlayerControls: "Фикс управления плеером", yandexFixPlayerControlsDesc: "Исправляет рендеринг элементов управления видеоплеера в Яндекс Браузере",
            yandexSection: "Настройки сетки видео", yandexDesc: "Оптимизация отображения видео в Яндекс Браузере",
            yandexVideoCount: "Количество видео в строке", yandexVideoCountDesc: "Сколько карточек видео отображается в одной строке на главной странице.",
            yandexChipbarMargin: "Сдвиг Chipbar (px)", yandexChipbarMarginDesc: "Вертикальный сдвиг полосы чипсов. Отрицательные значения поднимают её вверх, если она накладывается на сетку видео.",
            yandexVideoMargin: "Сдвиг блока видео (px)", yandexVideoMarginDesc: "Вертикальный сдвиг сетки видео. Компенсирует пробел в макете, вызванный оптимизациями Яндекс Браузера.",
            yandexExpSection: "Экспериментальные функции", yandexExpDesc: "Используйте с осторожностью, могут быть нестабильными",
            yandexGridFix: "Исправить сетку видео", yandexGridFixDesc: "Фиксит проблему с отображением 3 видео в строке",
            yandexPerf: "Режим оптимизации", yandexPerfDesc: "Улучшает производительность в Яндекс Браузере",
            yandexExpFix: "Экспериментальный фикс сдвига", yandexExpFixDesc: "Альтернативный метод исправления интерфейса", yandexSiteShift: "Величина сдвига (px)",
            appearanceSection: "Темный режим", appearanceDesc: "Настройки внешнего вида интерфейса",
            darkModeSupport: "Поддержка темной темы", darkModeSupportDesc: "Автоматическое переключение между светлой и темной темой",
            thumbSection: "Размер миниатюр видео", thumbDesc: "Изменение размера и пропорций превью видео",
            thumbDefault: "По умолчанию (16:9)", thumbSmall: "Маленькие (16:9)", thumbMedium: "Средние (4:3)", thumbLarge: "Большие (1:1)",
            themeSection: "Тема окна настроек", themeDesc: "Внешний вид этого окна с настройками",
            themeAuto: "Авто (система)", themeLight: "Светлая", themeDark: "Тёмная", fontSize: "Размер шрифта:",
            styleSection: "Цветовая схема", styleDesc: "Палитра цветов и стиль окна настроек",
            styleYoutube: "YouTube", styleImproved: "Улучшенная (glass + выпадающие)", styleMidnight: "Полночь", styleSunset: "Закат", styleOcean: "Океан", styleEmerald: "Изумруд", styleRose: "Роза", styleDarkPink: "Тёмно-розовая", styleFrost: "Мороз", styleSky: "Небо", styleClassic: "Классика", styleAurora: "Аврора", styleCustom: "Своя",
            customColorsSection: "Тонкая настройка цветов", customColorsDesc: "Ручная настройка отдельных цветов (переопределяет текущую схему)",
            customColorEnabled: "Включить свои цвета", customColorBg: "Фон", customColorFg: "Текст",
            customColorPrimary: "Акцентный цвет", customColorBorder: "Рамки", customColorBtnBorder: "Рамка кнопки",
            customColorBtnFg: "Текст кнопки", customColorBtnHoverBg: "Кнопка при наведении", customColorBtnHoverFg: "Текст кнопки при наведении",
            customColorBadgeBg: "Фон бейджа", customColorBadgeFg: "Текст бейджа",
            customColorInputBg: "Фон ввода", customColorInputFg: "Текст ввода", customColorInputBorder: "Рамка ввода",
            customColorSelectBg: "Фон списка", customColorSelectFg: "Текст списка", customColorSelectBorder: "Рамка списка",
            customColorReset: "Сбросить свои цвета", customColorLoadFromTheme: "\u21ba Загрузить из темы",
            styleEditorBtn: "Открыть редактор стилей", styleEditorTitle: "Редактор стилей",
            styleEditorPresets: "Пресеты", styleEditorColors: "Цвета", styleEditorBackground: "Фон", styleEditorCSS: "Свой CSS",
            presetSave: "Сохранить пресет", presetLoad: "Загрузить", presetDelete: "Удалить", presetExport: "Экспорт", presetImport: "Импорт",
            presetName: "Имя пресета", presetNamePlaceholder: "Моя тема...", presetSaved: "Пресет сохранён!",
            presetDeleted: "Пресет удалён", presetExported: "Пресет скопирован в буфер обмена!",
            presetImportPrompt: "Вставьте JSON пресета:", presetImported: "Пресет импортирован!",
            builtinPresets: "Встроенные темы", colorScheme: "Цветовая схема",
            presetImportError: "Неверный формат пресета", presetNoPresets: "Нет сохранённых пресетов",
            bgSection: "Фоновое изображение", bgDesc: "Установить фоновое изображение для окна настроек или страницы YouTube",
            bgUrl: "URL изображения", bgUrlPlaceholder: "https://example.com/image.jpg",
            bgApply: "Применить", bgClear: "Очистить", bgTarget: "Применить к",
            bgTargetSettings: "Окно настроек", bgTargetPage: "Страница YouTube",
            bgOpacity: "Прозрачность", bgBlur: "Размытие (px)", bgSize: "Размер",
            bgSizeCover: "Заполнить", bgSizeContain: "Вписать", bgSizeAuto: "Авто",
            cssSection: "Свой CSS для YouTube", cssDesc: "Напишите CSS правила для стилизации страницы YouTube",
            cssPlaceholder: "/* Пример: скрыть боковую панель */\nytd-mini-guide-renderer {\n  display: none !important;\n}",
            cssApply: "Применить CSS", cssClear: "Очистить CSS", cssApplied: "Свой CSS применён!",
            styleEditorClose: "Закрыть",
            warning: 'Полная версия расширения доступна только в <a href="https://browser.yandex.com/?lang=ru" target="_blank" style="color: var(--yt-spec-brand-button-background, #065fd4); text-decoration: none; font-weight: bold;">Яндекс Браузере</a>.',
            languageButton: "Язык", ru: "Русский", en: "Английский", newMark: "новое", expMark: "эксп",
            playlistModeNotification: "Включена функция Плейлисты на каналах, оптимизация браузера отключена!",
            exitPlaylistModeNotification: "Расширение перезагрузится через {seconds} секунды для восстановления функций"
        }
    };

    // Встроенные темы (dark/light/common) — используются если @resource не загрузился
    const _BUILTIN_THEMES = {
        // --- Тема YouTube (авто) ---
        youtube: `/* @base */
:root {
    --enhancer-radius: 12px !important;
    --enhancer-btn-radius: 20px !important;
    --enhancer-transition: all 0.2s ease !important;
}
/* @dark */
:root {
    --enhancer-bg: var(--yt-spec-base-background, #0f0f0f) !important;
    --enhancer-fg: var(--yt-spec-text-primary, #f1f1f1) !important;
    --enhancer-border: var(--yt-spec-10-percent-layer, #272727) !important;
    --enhancer-primary: #ff0000 !important;
    --enhancer-secondary: #ff0000 !important;
    --enhancer-accent: #ff0000 !important;
    --enhancer-btn-border: var(--yt-spec-10-percent-layer, #333) !important;
    --enhancer-btn-fg: var(--yt-spec-text-primary, #f1f1f1) !important;
    --enhancer-btn-hover-bg: var(--yt-spec-10-percent-layer, #272727) !important;
    --enhancer-btn-hover-fg: var(--yt-spec-text-primary, #f1f1f1) !important;
    --enhancer-badge-bg: rgba(255, 0, 0, 0.12) !important;
    --enhancer-badge-fg: #ff4444 !important;
    --enhancer-badge-exp-bg: rgba(255, 112, 67, 0.15) !important;
    --enhancer-badge-exp-fg: #ff7043 !important;
    --enhancer-input-bg: var(--yt-spec-badge-chip-background, #272727) !important;
    --enhancer-input-fg: var(--yt-spec-text-primary, #f1f1f1) !important;
    --enhancer-input-border: var(--yt-spec-10-percent-layer, #3f3f3f) !important;
    --enhancer-tab-active: var(--yt-spec-text-primary, #f1f1f1) !important;
    --enhancer-tab-inactive: var(--yt-spec-text-secondary, #aaa) !important;
    --enhancer-divider: var(--yt-spec-10-percent-layer, #272727) !important;
    --enhancer-select-bg: var(--yt-spec-badge-chip-background, #272727) !important;
    --enhancer-select-fg: var(--yt-spec-text-primary, #f1f1f1) !important;
    --enhancer-select-border: var(--yt-spec-10-percent-layer, #3f3f3f) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: none;
}
#yt-enhancer-settings h2 {
    font-weight: 600; font-size: 1.4em;
    color: var(--yt-spec-text-primary, #f1f1f1) !important;
    margin-bottom: 20px;
}
#yt-enhancer-settings select option {
    background: #272727 !important;
    color: #f1f1f1 !important;
}
/* @light */
:root {
    --enhancer-bg: var(--yt-spec-base-background, #ffffff) !important;
    --enhancer-fg: var(--yt-spec-text-primary, #0f0f0f) !important;
    --enhancer-border: var(--yt-spec-10-percent-layer, #e5e5e5) !important;
    --enhancer-primary: #cc0000 !important;
    --enhancer-secondary: #cc0000 !important;
    --enhancer-accent: #cc0000 !important;
    --enhancer-btn-border: var(--yt-spec-10-percent-layer, #d6d6d6) !important;
    --enhancer-btn-fg: var(--yt-spec-text-primary, #0f0f0f) !important;
    --enhancer-btn-hover-bg: var(--yt-spec-10-percent-layer, #f2f2f2) !important;
    --enhancer-btn-hover-fg: var(--yt-spec-text-primary, #0f0f0f) !important;
    --enhancer-badge-bg: rgba(204, 0, 0, 0.08) !important;
    --enhancer-badge-fg: #cc0000 !important;
    --enhancer-badge-exp-bg: rgba(255, 152, 0, 0.1) !important;
    --enhancer-badge-exp-fg: #e65100 !important;
    --enhancer-input-bg: var(--yt-spec-badge-chip-background, #f2f2f2) !important;
    --enhancer-input-fg: var(--yt-spec-text-primary, #0f0f0f) !important;
    --enhancer-input-border: var(--yt-spec-10-percent-layer, #d6d6d6) !important;
    --enhancer-tab-active: var(--yt-spec-text-primary, #0f0f0f) !important;
    --enhancer-tab-inactive: var(--yt-spec-text-secondary, #606060) !important;
    --enhancer-divider: var(--yt-spec-10-percent-layer, #e5e5e5) !important;
    --enhancer-select-bg: var(--yt-spec-badge-chip-background, #f2f2f2) !important;
    --enhancer-select-fg: var(--yt-spec-text-primary, #0f0f0f) !important;
    --enhancer-select-border: var(--yt-spec-10-percent-layer, #d6d6d6) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12) !important;
    backdrop-filter: none;
}
#yt-enhancer-settings h2 {
    font-weight: 600; font-size: 1.4em;
    color: var(--yt-spec-text-primary, #0f0f0f) !important;
    margin-bottom: 20px;
}
#yt-enhancer-settings select option {
    background: #f2f2f2 !important;
    color: #0f0f0f !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 20px 0 12px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 12px; margin-bottom: 20px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important;
}
#yt-enhancer-settings button:hover {
    background: var(--enhancer-btn-hover-bg) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Улучшенная тема (glass + стилизованные YouTube-выпадающие) ---
        improved: `/* @base */
:root {
    --enhancer-radius: 20px !important;
    --enhancer-btn-radius: 14px !important;
    --enhancer-transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
/* @dark */
:root {
    --enhancer-bg: rgba(15, 15, 15, 0.92) !important;
    --enhancer-fg: #f1f1f1 !important;
    --enhancer-border: rgba(62, 166, 255, 0.12) !important;
    --enhancer-primary: #3ea6ff !important;
    --enhancer-secondary: #5fb4ff !important;
    --enhancer-accent: #7fc1ff !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #000 !important;
    --enhancer-badge-bg: rgba(62, 166, 255, 0.15) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(255, 112, 67, 0.2) !important;
    --enhancer-badge-exp-fg: #ff7043 !important;
    --enhancer-input-bg: rgba(255, 255, 255, 0.06) !important;
    --enhancer-input-fg: #f1f1f1 !important;
    --enhancer-input-border: rgba(255, 255, 255, 0.1) !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: rgba(255, 255, 255, 0.5) !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(62, 166, 255, 0.4), transparent) !important;
    --enhancer-select-bg: rgba(255, 255, 255, 0.08) !important;
    --enhancer-select-fg: #f1f1f1 !important;
    --enhancer-select-border: rgba(255, 255, 255, 0.12) !important;
}
#yt-enhancer-settings {
    background: rgba(15, 15, 15, 0.92) !important;
    backdrop-filter: blur(20px) saturate(1.8) !important;
    border: 1px solid rgba(62, 166, 255, 0.15) !important;
    box-shadow: 0 0 0 1px rgba(62, 166, 255, 0.08), 0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(135deg, #3ea6ff, #5fb4ff, #7fc1ff);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
ytd-popup-container tp-yt-paper-listbox,
ytd-menu-popup-renderer,
tp-yt-paper-dialog.ytd-popup-container,
tp-yt-paper-dialog {
    background: rgba(15, 15, 15, 0.95) !important;
    color: #f1f1f1 !important;
    border: 1px solid rgba(62, 166, 255, 0.12) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(16px) !important;
    overflow: hidden !important;
}
ytd-multi-page-menu-renderer,
ytd-multi-page-menu-renderer #container {
    background: rgba(15, 15, 15, 0.95) !important;
    color: #f1f1f1 !important;
    border: 1px solid rgba(62, 166, 255, 0.12) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(16px) !important;
}
tp-yt-paper-item,
ytd-menu-service-item-renderer,
ytd-compact-link-renderer {
    color: #f1f1f1 !important;
}
tp-yt-paper-item:hover,
ytd-menu-service-item-renderer:hover,
ytd-compact-link-renderer:hover {
    background: rgba(62, 166, 255, 0.12) !important;
}
ytd-menu-popup-renderer #items ytd-menu-service-item-renderer {
    border-radius: 8px !important; margin: 2px 4px !important;
}
iron-dropdown .dropdown-content {
    background: rgba(15, 15, 15, 0.95) !important;
    border: 1px solid rgba(62, 166, 255, 0.12) !important;
    border-radius: 12px !important;
    overflow: hidden !important;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #1a1a1a !important;
    color: #f1f1f1 !important;
}
/* @light */
:root {
    --enhancer-bg: rgba(255, 255, 255, 0.92) !important;
    --enhancer-fg: #0f0f0f !important;
    --enhancer-border: rgba(6, 95, 212, 0.1) !important;
    --enhancer-primary: #065fd4 !important;
    --enhancer-secondary: #1a73e8 !important;
    --enhancer-accent: #4285f4 !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(6, 95, 212, 0.06) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(255, 152, 0, 0.1) !important;
    --enhancer-badge-exp-fg: #e65100 !important;
    --enhancer-input-bg: rgba(0, 0, 0, 0.03) !important;
    --enhancer-input-fg: #0f0f0f !important;
    --enhancer-input-border: rgba(0, 0, 0, 0.08) !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: rgba(0, 0, 0, 0.4) !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(6, 95, 212, 0.2), transparent) !important;
    --enhancer-select-bg: rgba(0, 0, 0, 0.04) !important;
    --enhancer-select-fg: #0f0f0f !important;
    --enhancer-select-border: rgba(0, 0, 0, 0.1) !important;
}
#yt-enhancer-settings {
    background: rgba(255, 255, 255, 0.92) !important;
    backdrop-filter: blur(20px) saturate(1.5) !important;
    border: 1px solid rgba(6, 95, 212, 0.1) !important;
    box-shadow: 0 0 0 1px rgba(6, 95, 212, 0.05), 0 20px 60px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.8) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-primary) !important; margin-bottom: 24px;
}
ytd-popup-container tp-yt-paper-listbox,
ytd-menu-popup-renderer,
tp-yt-paper-dialog.ytd-popup-container,
tp-yt-paper-dialog {
    background: rgba(255, 255, 255, 0.95) !important;
    color: #0f0f0f !important;
    border: 1px solid rgba(6, 95, 212, 0.1) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(16px) !important;
    overflow: hidden !important;
}
ytd-multi-page-menu-renderer,
ytd-multi-page-menu-renderer #container {
    background: rgba(255, 255, 255, 0.95) !important;
    color: #0f0f0f !important;
    border: 1px solid rgba(6, 95, 212, 0.1) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(16px) !important;
}
tp-yt-paper-item,
ytd-menu-service-item-renderer,
ytd-compact-link-renderer {
    color: #0f0f0f !important;
}
tp-yt-paper-item:hover,
ytd-menu-service-item-renderer:hover,
ytd-compact-link-renderer:hover {
    background: rgba(6, 95, 212, 0.08) !important;
}
ytd-menu-popup-renderer #items ytd-menu-service-item-renderer {
    border-radius: 8px !important; margin: 2px 4px !important;
}
iron-dropdown .dropdown-content {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(6, 95, 212, 0.1) !important;
    border-radius: 12px !important;
    overflow: hidden !important;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #f5f5f5 !important;
    color: #0f0f0f !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
    backdrop-filter: blur(8px);
}
#yt-enhancer-settings button.yt-enhancer-close-btn {
    backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }
ytd-popup-container *, ytd-menu-popup-renderer *, tp-yt-paper-listbox * {
    transition: background 0.2s ease, color 0.2s ease !important;
}`,
        // --- Тема Midnight (фиолетовая ночь) ---
        midnight: `/* @base */
:root {
    --enhancer-radius: 18px !important;
    --enhancer-btn-radius: 12px !important;
    --enhancer-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
/* @dark */
:root {
    --enhancer-bg: #0d1117 !important;
    --enhancer-fg: #e6edf3 !important;
    --enhancer-border: #21262d !important;
    --enhancer-primary: #a855f7 !important;
    --enhancer-secondary: #c084fc !important;
    --enhancer-accent: #d8b4fe !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #fff !important;
    --enhancer-badge-bg: rgba(168, 85, 247, 0.15) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(244, 114, 182, 0.2) !important;
    --enhancer-badge-exp-fg: #f472b6 !important;
    --enhancer-input-bg: #161b22 !important;
    --enhancer-input-fg: #e6edf3 !important;
    --enhancer-input-border: #30363d !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #8b949e !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3), transparent) !important;
    --enhancer-select-bg: #161b22 !important;
    --enhancer-select-fg: #e6edf3 !important;
    --enhancer-select-border: #30363d !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.2), 0 8px 32px rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(12px);
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(90deg, #a855f7, #c084fc, #d8b4fe);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option {
    background: #161b22 !important;
    color: #e6edf3 !important;
}
/* @light */
:root {
    --enhancer-bg: #f8f7ff !important;
    --enhancer-fg: #1e1b3a !important;
    --enhancer-border: #e0ddf5 !important;
    --enhancer-primary: #7c3aed !important;
    --enhancer-secondary: #8b5cf6 !important;
    --enhancer-accent: #a78bfa !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #fff !important;
    --enhancer-badge-bg: rgba(124, 58, 237, 0.08) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(236, 72, 153, 0.1) !important;
    --enhancer-badge-exp-fg: #db2777 !important;
    --enhancer-input-bg: #f0eefa !important;
    --enhancer-input-fg: #1e1b3a !important;
    --enhancer-input-border: #d6d3f0 !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #9895b5 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.15), transparent) !important;
    --enhancer-select-bg: #f8f7ff !important;
    --enhancer-select-fg: #1e1b3a !important;
    --enhancer-select-border: #d6d3f0 !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.08), 0 4px 24px rgba(0, 0, 0, 0.06) !important;
    backdrop-filter: blur(8px);
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-primary) !important; margin-bottom: 24px;
}
#yt-enhancer-settings select option {
    background: #f0eefa !important;
    color: #1e1b3a !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Тема Sunset (тёплый закат) ---
        sunset: `/* @base */
:root {
    --enhancer-radius: 16px !important;
    --enhancer-btn-radius: 12px !important;
    --enhancer-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
/* @dark */
:root {
    --enhancer-bg: #1a1412 !important;
    --enhancer-fg: #fef3c7 !important;
    --enhancer-border: #44332a !important;
    --enhancer-primary: #f59e0b !important;
    --enhancer-secondary: #fbbf24 !important;
    --enhancer-accent: #fcd34d !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #1a1412 !important;
    --enhancer-badge-bg: rgba(245, 158, 11, 0.15) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(239, 68, 68, 0.2) !important;
    --enhancer-badge-exp-fg: #ef4444 !important;
    --enhancer-input-bg: #241c17 !important;
    --enhancer-input-fg: #fef3c7 !important;
    --enhancer-input-border: #4a3628 !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #a08060 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent) !important;
    --enhancer-select-bg: #241c17 !important;
    --enhancer-select-fg: #fef3c7 !important;
    --enhancer-select-border: #4a3628 !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(12px);
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option {
    background: #241c17 !important;
    color: #fef3c7 !important;
}
/* @light */
:root {
    --enhancer-bg: #fffbeb !important;
    --enhancer-fg: #451a03 !important;
    --enhancer-border: #fed7aa !important;
    --enhancer-primary: #d97706 !important;
    --enhancer-secondary: #b45309 !important;
    --enhancer-accent: #92400e !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #fff !important;
    --enhancer-badge-bg: rgba(217, 119, 6, 0.08) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(220, 38, 38, 0.1) !important;
    --enhancer-badge-exp-fg: #dc2626 !important;
    --enhancer-input-bg: #fff8e1 !important;
    --enhancer-input-fg: #451a03 !important;
    --enhancer-input-border: #fde68a !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #b08050 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.15), transparent) !important;
    --enhancer-select-bg: #fffbeb !important;
    --enhancer-select-fg: #451a03 !important;
    --enhancer-select-border: #fde68a !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(217, 119, 6, 0.08), 0 4px 24px rgba(0, 0, 0, 0.06) !important;
    backdrop-filter: blur(8px);
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-primary) !important; margin-bottom: 24px;
}
#yt-enhancer-settings select option {
    background: #fff8e1 !important;
    color: #451a03 !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Тема Ocean (глубокий океан) ---
        ocean: `/* @base */
:root {
    --enhancer-radius: 18px !important;
    --enhancer-btn-radius: 14px !important;
    --enhancer-transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
/* @dark */
:root {
    --enhancer-bg: #0a1628 !important;
    --enhancer-fg: #cff4fc !important;
    --enhancer-border: #0e2a45 !important;
    --enhancer-primary: #06b6d4 !important;
    --enhancer-secondary: #22d3ee !important;
    --enhancer-accent: #67e8f9 !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #0a1628 !important;
    --enhancer-badge-bg: rgba(6, 182, 212, 0.15) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(34, 211, 238, 0.2) !important;
    --enhancer-badge-exp-fg: #22d3ee !important;
    --enhancer-input-bg: #0d1f38 !important;
    --enhancer-input-fg: #cff4fc !important;
    --enhancer-input-border: #1a3a55 !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #4a8fa8 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent) !important;
    --enhancer-select-bg: #0d1f38 !important;
    --enhancer-select-fg: #cff4fc !important;
    --enhancer-select-border: #1a3a55 !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.25), 0 8px 40px rgba(0, 0, 0, 0.7) !important;
    backdrop-filter: blur(16px) saturate(1.6) !important;
    border: 1px solid rgba(6, 182, 212, 0.18) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(135deg, #06b6d4, #22d3ee, #67e8f9);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #0d1f38 !important;
    color: #cff4fc !important;
}
/* @light */
:root {
    --enhancer-bg: #f0f9ff !important;
    --enhancer-fg: #0c4a6e !important;
    --enhancer-border: #bae6fd !important;
    --enhancer-primary: #0891b2 !important;
    --enhancer-secondary: #0ea5e9 !important;
    --enhancer-accent: #38bdf8 !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(8, 145, 178, 0.08) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(14, 165, 233, 0.12) !important;
    --enhancer-badge-exp-fg: #0369a1 !important;
    --enhancer-input-bg: #e0f2fe !important;
    --enhancer-input-fg: #0c4a6e !important;
    --enhancer-input-border: #7dd3fc !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #6098b8 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(8, 145, 178, 0.2), transparent) !important;
    --enhancer-select-bg: #f0f9ff !important;
    --enhancer-select-fg: #0c4a6e !important;
    --enhancer-select-border: #7dd3fc !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(8, 145, 178, 0.1), 0 4px 24px rgba(0, 0, 0, 0.08) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(8, 145, 178, 0.12) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-primary) !important; margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #e0f2fe !important;
    color: #0c4a6e !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 16px rgba(6, 182, 212, 0.25) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Тема Emerald (изумрудный лес) ---
        emerald: `/* @base */
:root {
    --enhancer-radius: 16px !important;
    --enhancer-btn-radius: 12px !important;
    --enhancer-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
/* @dark */
:root {
    --enhancer-bg: #0a1f0f !important;
    --enhancer-fg: #d1fae5 !important;
    --enhancer-border: #134e22 !important;
    --enhancer-primary: #10b981 !important;
    --enhancer-secondary: #34d399 !important;
    --enhancer-accent: #6ee7b7 !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #0a1f0f !important;
    --enhancer-badge-bg: rgba(16, 185, 129, 0.15) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(52, 211, 153, 0.2) !important;
    --enhancer-badge-exp-fg: #34d399 !important;
    --enhancer-input-bg: #0f2918 !important;
    --enhancer-input-fg: #d1fae5 !important;
    --enhancer-input-border: #1a4a28 !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #4a8a60 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.35), transparent) !important;
    --enhancer-select-bg: #0f2918 !important;
    --enhancer-select-fg: #d1fae5 !important;
    --enhancer-select-border: #1a4a28 !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2), 0 8px 32px rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(12px) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #0f2918 !important;
    color: #d1fae5 !important;
}
/* @light */
:root {
    --enhancer-bg: #f0fdf4 !important;
    --enhancer-fg: #14532d !important;
    --enhancer-border: #bbf7d0 !important;
    --enhancer-primary: #059669 !important;
    --enhancer-secondary: #10b981 !important;
    --enhancer-accent: #34d399 !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(5, 150, 105, 0.08) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(16, 185, 129, 0.12) !important;
    --enhancer-badge-exp-fg: #047857 !important;
    --enhancer-input-bg: #dcfce7 !important;
    --enhancer-input-fg: #14532d !important;
    --enhancer-input-border: #86efac !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #4a9060 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(5, 150, 105, 0.18), transparent) !important;
    --enhancer-select-bg: #f0fdf4 !important;
    --enhancer-select-fg: #14532d !important;
    --enhancer-select-border: #86efac !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(5, 150, 105, 0.08), 0 4px 24px rgba(0, 0, 0, 0.06) !important;
    backdrop-filter: blur(8px) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-primary) !important; margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #dcfce7 !important;
    color: #14532d !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Тема Rose (ночная роза) ---
        rose: `/* @base */
:root {
    --enhancer-radius: 18px !important;
    --enhancer-btn-radius: 14px !important;
    --enhancer-transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
/* @dark */
:root {
    --enhancer-bg: #1a0a0f !important;
    --enhancer-fg: #ffe4e6 !important;
    --enhancer-border: #3f1220 !important;
    --enhancer-primary: #f43f5e !important;
    --enhancer-secondary: #fb7185 !important;
    --enhancer-accent: #fda4af !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #1a0a0f !important;
    --enhancer-badge-bg: rgba(244, 63, 94, 0.15) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(251, 113, 133, 0.2) !important;
    --enhancer-badge-exp-fg: #fb7185 !important;
    --enhancer-input-bg: #27101a !important;
    --enhancer-input-fg: #ffe4e6 !important;
    --enhancer-input-border: #5a1a2a !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #8a4a5a !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(244, 63, 94, 0.35), transparent) !important;
    --enhancer-select-bg: #27101a !important;
    --enhancer-select-fg: #ffe4e6 !important;
    --enhancer-select-border: #5a1a2a !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(244, 63, 94, 0.25), 0 8px 40px rgba(0, 0, 0, 0.65) !important;
    backdrop-filter: blur(16px) saturate(1.5) !important;
    border: 1px solid rgba(244, 63, 94, 0.18) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(135deg, #f43f5e, #fb7185, #fda4af);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #27101a !important;
    color: #ffe4e6 !important;
}
/* @light */
:root {
    --enhancer-bg: #fff1f2 !important;
    --enhancer-fg: #4c0519 !important;
    --enhancer-border: #fecdd3 !important;
    --enhancer-primary: #e11d48 !important;
    --enhancer-secondary: #f43f5e !important;
    --enhancer-accent: #fb7185 !important;
    --enhancer-btn-border: var(--enhancer-primary) !important;
    --enhancer-btn-fg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-bg: var(--enhancer-primary) !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(225, 29, 72, 0.08) !important;
    --enhancer-badge-fg: var(--enhancer-primary) !important;
    --enhancer-badge-exp-bg: rgba(244, 63, 94, 0.12) !important;
    --enhancer-badge-exp-fg: #be123c !important;
    --enhancer-input-bg: #ffe4e6 !important;
    --enhancer-input-fg: #4c0519 !important;
    --enhancer-input-border: #fda4af !important;
    --enhancer-tab-active: var(--enhancer-primary) !important;
    --enhancer-tab-inactive: #a06070 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(225, 29, 72, 0.18), transparent) !important;
    --enhancer-select-bg: #fff1f2 !important;
    --enhancer-select-fg: #4c0519 !important;
    --enhancer-select-border: #fda4af !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(225, 29, 72, 0.1), 0 4px 24px rgba(0, 0, 0, 0.07) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(225, 29, 72, 0.1) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-primary) !important; margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #ffe4e6 !important;
    color: #4c0519 !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 16px rgba(244, 63, 94, 0.3) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Dark Pink ---
        darkpink: `/* @base */
:root {
    --enhancer-radius: 16px !important;
    --enhancer-btn-radius: 12px !important;
    --enhancer-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
/* @dark */
:root {
    --enhancer-bg: #000000 !important;
    --enhancer-fg: #ffffff !important;
    --enhancer-border: rgba(255, 105, 180, 0.2) !important;
    --enhancer-primary: #ff69b4 !important;
    --enhancer-secondary: #ff8ac2 !important;
    --enhancer-accent: #ffb6e6 !important;
    --enhancer-btn-border: #ff69b4 !important;
    --enhancer-btn-fg: #ff69b4 !important;
    --enhancer-btn-hover-bg: #ff69b4 !important;
    --enhancer-btn-hover-fg: #000000 !important;
    --enhancer-badge-bg: rgba(255, 105, 180, 0.2) !important;
    --enhancer-badge-fg: #ff69b4 !important;
    --enhancer-badge-exp-bg: rgba(255, 61, 142, 0.2) !important;
    --enhancer-badge-exp-fg: #ff3d8e !important;
    --enhancer-input-bg: #18121e !important;
    --enhancer-input-fg: #ffffff !important;
    --enhancer-input-border: rgba(255, 105, 180, 0.4) !important;
    --enhancer-tab-active: #ff69b4 !important;
    --enhancer-tab-inactive: #b0b8c9 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(255, 105, 180, 0.4), transparent) !important;
    --enhancer-select-bg: #18121e !important;
    --enhancer-select-fg: #ffffff !important;
    --enhancer-select-border: rgba(255, 105, 180, 0.4) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(255, 105, 180, 0.3), 0 8px 32px rgba(255, 105, 180, 0.15) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 105, 180, 0.25) !important;
    animation: darkpink-glow 6s infinite alternate;
}
@keyframes darkpink-glow {
    0% { box-shadow: 0 0 0 1px rgba(255,105,180,0.3), 0 8px 32px rgba(255,105,180,0.15); }
    100% { box-shadow: 0 0 0 1px rgba(255,105,180,0.5), 0 8px 40px rgba(255,105,180,0.28); }
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(90deg, #ff69b4, #ff8ac2, #ffb6e6);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #18121e !important;
    color: #ffffff !important;
}
/* @light */
:root {
    --enhancer-bg: #fff0f8 !important;
    --enhancer-fg: #6b0038 !important;
    --enhancer-border: rgba(255, 105, 180, 0.25) !important;
    --enhancer-primary: #d6006a !important;
    --enhancer-secondary: #e91e8c !important;
    --enhancer-accent: #ff69b4 !important;
    --enhancer-btn-border: #d6006a !important;
    --enhancer-btn-fg: #d6006a !important;
    --enhancer-btn-hover-bg: #d6006a !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(214, 0, 106, 0.08) !important;
    --enhancer-badge-fg: #d6006a !important;
    --enhancer-badge-exp-bg: rgba(233, 30, 140, 0.12) !important;
    --enhancer-badge-exp-fg: #920047 !important;
    --enhancer-input-bg: #ffe8f5 !important;
    --enhancer-input-fg: #6b0038 !important;
    --enhancer-input-border: rgba(255, 105, 180, 0.35) !important;
    --enhancer-tab-active: #d6006a !important;
    --enhancer-tab-inactive: #d080a8 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(214, 0, 106, 0.2), transparent) !important;
    --enhancer-select-bg: #fff0f8 !important;
    --enhancer-select-fg: #6b0038 !important;
    --enhancer-select-border: rgba(255, 105, 180, 0.3) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(214, 0, 106, 0.1), 0 4px 24px rgba(214, 0, 106, 0.08) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(214, 0, 106, 0.12) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-primary) !important; margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #ffe8f5 !important;
    color: #6b0038 !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 16px rgba(255, 105, 180, 0.3) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Frost ---
        frost: `/* @base */
:root {
    --enhancer-radius: 16px !important;
    --enhancer-btn-radius: 10px !important;
    --enhancer-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
/* @dark */
:root {
    --enhancer-bg: #0f1a2e !important;
    --enhancer-fg: #dce8ff !important;
    --enhancer-border: rgba(59, 130, 246, 0.2) !important;
    --enhancer-primary: #3b82f6 !important;
    --enhancer-secondary: #60a5fa !important;
    --enhancer-accent: #93c5fd !important;
    --enhancer-btn-border: #3b82f6 !important;
    --enhancer-btn-fg: #3b82f6 !important;
    --enhancer-btn-hover-bg: #3b82f6 !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(59, 130, 246, 0.15) !important;
    --enhancer-badge-fg: #3b82f6 !important;
    --enhancer-badge-exp-bg: rgba(249, 115, 22, 0.2) !important;
    --enhancer-badge-exp-fg: #f97316 !important;
    --enhancer-input-bg: #162240 !important;
    --enhancer-input-fg: #dce8ff !important;
    --enhancer-input-border: rgba(59, 130, 246, 0.3) !important;
    --enhancer-tab-active: #3b82f6 !important;
    --enhancer-tab-inactive: #5080a8 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent) !important;
    --enhancer-select-bg: #162240 !important;
    --enhancer-select-fg: #dce8ff !important;
    --enhancer-select-border: rgba(59, 130, 246, 0.3) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2), 0 8px 40px rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(59, 130, 246, 0.15) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #162240 !important;
    color: #dce8ff !important;
}
/* @light */
:root {
    --enhancer-bg: rgba(248, 250, 252, 0.96) !important;
    --enhancer-fg: #1e293b !important;
    --enhancer-border: rgba(203, 213, 225, 0.6) !important;
    --enhancer-primary: #2563eb !important;
    --enhancer-secondary: #3b82f6 !important;
    --enhancer-accent: #60a5fa !important;
    --enhancer-btn-border: #2563eb !important;
    --enhancer-btn-fg: #2563eb !important;
    --enhancer-btn-hover-bg: #2563eb !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(59, 130, 246, 0.1) !important;
    --enhancer-badge-fg: #2563eb !important;
    --enhancer-badge-exp-bg: rgba(249, 115, 22, 0.12) !important;
    --enhancer-badge-exp-fg: #ea580c !important;
    --enhancer-input-bg: rgba(255, 255, 255, 0.9) !important;
    --enhancer-input-fg: #1e293b !important;
    --enhancer-input-border: rgba(203, 213, 225, 0.8) !important;
    --enhancer-tab-active: #2563eb !important;
    --enhancer-tab-inactive: #94a3b8 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(203, 213, 225, 0.6), transparent) !important;
    --enhancer-select-bg: rgba(255, 255, 255, 0.9) !important;
    --enhancer-select-fg: #1e293b !important;
    --enhancer-select-border: rgba(203, 213, 225, 0.8) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(226, 232, 240, 0.8), 0 8px 32px rgba(148, 163, 184, 0.12) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(203, 213, 225, 0.5) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-primary) !important; margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: rgba(255, 255, 255, 0.95) !important;
    color: #1e293b !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Sky ---
        sky: `/* @base */
:root {
    --enhancer-radius: 16px !important;
    --enhancer-btn-radius: 12px !important;
    --enhancer-transition: all 0.3s ease !important;
}
/* @dark */
:root {
    --enhancer-bg: #051929 !important;
    --enhancer-fg: #e0f4ff !important;
    --enhancer-border: rgba(14, 165, 233, 0.2) !important;
    --enhancer-primary: #0ea5e9 !important;
    --enhancer-secondary: #38bdf8 !important;
    --enhancer-accent: #7dd3fc !important;
    --enhancer-btn-border: #0ea5e9 !important;
    --enhancer-btn-fg: #0ea5e9 !important;
    --enhancer-btn-hover-bg: #0ea5e9 !important;
    --enhancer-btn-hover-fg: #051929 !important;
    --enhancer-badge-bg: rgba(14, 165, 233, 0.15) !important;
    --enhancer-badge-fg: #0ea5e9 !important;
    --enhancer-badge-exp-bg: rgba(251, 146, 60, 0.2) !important;
    --enhancer-badge-exp-fg: #fb923c !important;
    --enhancer-input-bg: #081f36 !important;
    --enhancer-input-fg: #e0f4ff !important;
    --enhancer-input-border: rgba(14, 165, 233, 0.3) !important;
    --enhancer-tab-active: #0ea5e9 !important;
    --enhancer-tab-inactive: #4e90b0 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.35), transparent) !important;
    --enhancer-select-bg: #081f36 !important;
    --enhancer-select-fg: #e0f4ff !important;
    --enhancer-select-border: rgba(14, 165, 233, 0.3) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.2), 0 8px 40px rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(14, 165, 233, 0.15) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(90deg, #0284c7, #0ea5e9, #38bdf8);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #081f36 !important;
    color: #e0f4ff !important;
}
/* @light */
:root {
    --enhancer-bg: rgba(240, 249, 255, 0.98) !important;
    --enhancer-fg: #0369a1 !important;
    --enhancer-border: rgba(186, 230, 253, 0.6) !important;
    --enhancer-primary: #0284c7 !important;
    --enhancer-secondary: #0ea5e9 !important;
    --enhancer-accent: #38bdf8 !important;
    --enhancer-btn-border: #38bdf8 !important;
    --enhancer-btn-fg: #0284c7 !important;
    --enhancer-btn-hover-bg: #0284c7 !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(56, 189, 248, 0.2) !important;
    --enhancer-badge-fg: #0284c7 !important;
    --enhancer-badge-exp-bg: rgba(251, 146, 60, 0.15) !important;
    --enhancer-badge-exp-fg: #c2410c !important;
    --enhancer-input-bg: rgba(255, 255, 255, 0.9) !important;
    --enhancer-input-fg: #0369a1 !important;
    --enhancer-input-border: rgba(186, 230, 253, 0.8) !important;
    --enhancer-tab-active: #38bdf8 !important;
    --enhancer-tab-inactive: #7dd3fc !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.2), transparent) !important;
    --enhancer-select-bg: rgba(255, 255, 255, 0.9) !important;
    --enhancer-select-fg: #0369a1 !important;
    --enhancer-select-border: rgba(186, 230, 253, 0.8) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(186, 230, 253, 0.5), 0 8px 32px rgba(2, 132, 199, 0.1) !important;
    backdrop-filter: blur(6px) !important;
    border: 1px solid rgba(186, 230, 253, 0.4) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(90deg, #0284c7, #38bdf8);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #e0f2fe !important;
    color: #0369a1 !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 16px rgba(2, 132, 199, 0.25) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Classic ---
        classic: `/* @base */
:root {
    --enhancer-radius: 12px !important;
    --enhancer-btn-radius: 8px !important;
    --enhancer-transition: all 0.2s ease !important;
}
/* @dark */
:root {
    --enhancer-bg: #111111 !important;
    --enhancer-fg: #e5e7eb !important;
    --enhancer-border: rgba(209, 213, 219, 0.15) !important;
    --enhancer-primary: #6b7280 !important;
    --enhancer-secondary: #9ca3af !important;
    --enhancer-accent: #d1d5db !important;
    --enhancer-btn-border: #6b7280 !important;
    --enhancer-btn-fg: #d1d5db !important;
    --enhancer-btn-hover-bg: #374151 !important;
    --enhancer-btn-hover-fg: #f9fafb !important;
    --enhancer-badge-bg: rgba(156, 163, 175, 0.15) !important;
    --enhancer-badge-fg: #9ca3af !important;
    --enhancer-badge-exp-bg: rgba(245, 158, 11, 0.2) !important;
    --enhancer-badge-exp-fg: #fbbf24 !important;
    --enhancer-input-bg: #1f1f1f !important;
    --enhancer-input-fg: #e5e7eb !important;
    --enhancer-input-border: rgba(209, 213, 219, 0.2) !important;
    --enhancer-tab-active: #d1d5db !important;
    --enhancer-tab-inactive: #6b7280 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.3), transparent) !important;
    --enhancer-select-bg: #1f1f1f !important;
    --enhancer-select-fg: #e5e7eb !important;
    --enhancer-select-border: rgba(209, 213, 219, 0.2) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(75, 85, 99, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: none;
    border: 1px solid rgba(75, 85, 99, 0.3) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-accent) !important; margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #1f1f1f !important;
    color: #e5e7eb !important;
}
/* @light */
:root {
    --enhancer-bg: rgba(255, 255, 255, 0.98) !important;
    --enhancer-fg: #1f2937 !important;
    --enhancer-border: rgba(209, 213, 219, 0.6) !important;
    --enhancer-primary: #4b5563 !important;
    --enhancer-secondary: #6b7280 !important;
    --enhancer-accent: #9ca3af !important;
    --enhancer-btn-border: #9ca3af !important;
    --enhancer-btn-fg: #4b5563 !important;
    --enhancer-btn-hover-bg: #4b5563 !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(156, 163, 175, 0.1) !important;
    --enhancer-badge-fg: #4b5563 !important;
    --enhancer-badge-exp-bg: rgba(245, 158, 11, 0.1) !important;
    --enhancer-badge-exp-fg: #92400e !important;
    --enhancer-input-bg: rgba(249, 250, 251, 0.9) !important;
    --enhancer-input-fg: #1f2937 !important;
    --enhancer-input-border: rgba(209, 213, 219, 0.8) !important;
    --enhancer-tab-active: #4b5563 !important;
    --enhancer-tab-inactive: #9ca3af !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.4), transparent) !important;
    --enhancer-select-bg: rgba(249, 250, 251, 0.9) !important;
    --enhancer-select-fg: #1f2937 !important;
    --enhancer-select-border: rgba(209, 213, 219, 0.8) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(229, 231, 235, 0.9), 0 8px 32px rgba(0, 0, 0, 0.05) !important;
    backdrop-filter: blur(4px) !important;
    border: 1px solid rgba(209, 213, 219, 0.5) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    color: var(--enhancer-primary) !important; margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: rgba(249, 250, 251, 0.95) !important;
    color: #1f2937 !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`,
        // --- Aurora (Северное сияние) ---
        aurora: `/* @base */
:root {
    --enhancer-radius: 16px !important;
    --enhancer-btn-radius: 12px !important;
    --enhancer-transition: all 0.3s ease !important;
}
/* @dark */
:root {
    --enhancer-bg: #030d12 !important;
    --enhancer-fg: #d4f5ee !important;
    --enhancer-border: rgba(0, 229, 204, 0.15) !important;
    --enhancer-primary: #00e5cc !important;
    --enhancer-secondary: #a855f7 !important;
    --enhancer-accent: #4ade80 !important;
    --enhancer-btn-border: #00e5cc !important;
    --enhancer-btn-fg: #00e5cc !important;
    --enhancer-btn-hover-bg: #00e5cc !important;
    --enhancer-btn-hover-fg: #030d12 !important;
    --enhancer-badge-bg: rgba(0, 229, 204, 0.15) !important;
    --enhancer-badge-fg: #00e5cc !important;
    --enhancer-badge-exp-bg: rgba(168, 85, 247, 0.2) !important;
    --enhancer-badge-exp-fg: #d8b4fe !important;
    --enhancer-input-bg: #051820 !important;
    --enhancer-input-fg: #d4f5ee !important;
    --enhancer-input-border: rgba(0, 229, 204, 0.2) !important;
    --enhancer-tab-active: #00e5cc !important;
    --enhancer-tab-inactive: #2a8a80 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(0, 229, 204, 0.35), transparent) !important;
    --enhancer-select-bg: #051820 !important;
    --enhancer-select-fg: #d4f5ee !important;
    --enhancer-select-border: rgba(0, 229, 204, 0.22) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(0, 229, 204, 0.2), 0 8px 40px rgba(0, 0, 0, 0.7), 0 0 60px rgba(0, 229, 204, 0.08) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(0, 229, 204, 0.18) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(90deg, #00e5cc, #4ade80, #a855f7);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: #051820 !important;
    color: #d4f5ee !important;
}
/* @light */
:root {
    --enhancer-bg: rgba(240, 255, 254, 0.98) !important;
    --enhancer-fg: #043237 !important;
    --enhancer-border: rgba(6, 148, 162, 0.18) !important;
    --enhancer-primary: #0694a2 !important;
    --enhancer-secondary: #7c3aed !important;
    --enhancer-accent: #06b6d4 !important;
    --enhancer-btn-border: #0694a2 !important;
    --enhancer-btn-fg: #0694a2 !important;
    --enhancer-btn-hover-bg: #0694a2 !important;
    --enhancer-btn-hover-fg: #ffffff !important;
    --enhancer-badge-bg: rgba(6, 148, 162, 0.08) !important;
    --enhancer-badge-fg: #0694a2 !important;
    --enhancer-badge-exp-bg: rgba(124, 58, 237, 0.1) !important;
    --enhancer-badge-exp-fg: #7c3aed !important;
    --enhancer-input-bg: rgba(224, 255, 252, 0.9) !important;
    --enhancer-input-fg: #043237 !important;
    --enhancer-input-border: rgba(6, 148, 162, 0.2) !important;
    --enhancer-tab-active: #0694a2 !important;
    --enhancer-tab-inactive: #38bdf8 !important;
    --enhancer-divider: linear-gradient(90deg, transparent, rgba(6, 148, 162, 0.2), transparent) !important;
    --enhancer-select-bg: rgba(240, 255, 254, 0.95) !important;
    --enhancer-select-fg: #043237 !important;
    --enhancer-select-border: rgba(6, 148, 162, 0.22) !important;
}
#yt-enhancer-settings {
    box-shadow: 0 0 0 1px rgba(6, 148, 162, 0.2), 0 8px 32px rgba(6, 148, 162, 0.1) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(6, 148, 162, 0.18) !important;
}
#yt-enhancer-settings h2 {
    font-weight: 700; font-size: 1.5em;
    background: linear-gradient(90deg, #0694a2, #06b6d4, #38bdf8);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
    margin-bottom: 24px;
}
#yt-enhancer-settings select option,
#yt-style-editor select option {
    background: rgba(224, 255, 252, 0.95) !important;
    color: #043237 !important;
}
/* @common */
#yt-enhancer-settings h3 {
    font-weight: 600; color: var(--enhancer-fg) !important;
    margin: 24px 0 16px; padding-bottom: 8px;
    border-bottom: 1px solid var(--enhancer-border);
}
.yt-enhancer-section { position: relative; padding-bottom: 16px; margin-bottom: 24px; }
.yt-enhancer-section::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background: var(--enhancer-divider);
}
#yt-enhancer-settings button {
    transition: var(--enhancer-transition) !important; position: relative; overflow: hidden;
}
#yt-enhancer-settings button:hover {
    transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0, 229, 204, 0.3) !important;
}
#yt-enhancer-settings ::-webkit-scrollbar { width: 6px; }
#yt-enhancer-settings ::-webkit-scrollbar-track { background: transparent; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb { background: var(--enhancer-border); border-radius: 3px; }
#yt-enhancer-settings ::-webkit-scrollbar-thumb:hover { background: var(--enhancer-primary); }`
    };
    const _BUILTIN_THEME_CSS = _BUILTIN_THEMES.youtube;

    // Загрузка: @resource → встроенные данные
    function _loadResource(name) {
        try {
            if (typeof GM_getResourceText === 'function') {
                const txt = GM_getResourceText(name);
                if (txt && txt.length > 10) return txt;
            }
        } catch (e) { /* fallback */ }
        return null;
    }

    function _parseThemeCSS(raw, themeName) {
        if (!raw) return null;
        // Multi-theme file: extract the block for the requested theme
        let block = raw;
        if (raw.includes('/* @theme ') && themeName) {
            const marker = '/* @theme ' + themeName + ' */';
            const start = raw.indexOf(marker);
            if (start === -1) return null;
            const nextTheme = raw.indexOf('/* @theme ', start + marker.length);
            block = nextTheme === -1
                ? raw.substring(start + marker.length)
                : raw.substring(start + marker.length, nextTheme);
        }
        const di = block.indexOf('/* @dark */');
        const li = block.indexOf('/* @light */');
        const ci = block.indexOf('/* @common */');
        if (di === -1 || li === -1 || ci === -1) return null;
        const bi = block.indexOf('/* @base */');
        return {
            base: bi !== -1 ? block.substring(bi + 11, di).trim() : '',
            dark: block.substring(di + 11, li).trim(),
            light: block.substring(li + 12, ci).trim(),
            common: block.substring(ci + 13).trim()
        };
    }

    const LANGS = (function() {
        const extEN = _loadResource('langEN');
        const extRU = _loadResource('langRU');
        // These structural fields must always come from builtin to prevent stale cached JSON from overriding them
        const _structuralKeys = ['version','tabs','tabsNoYandex','mainSection','mainDesc','hideChipsDesc','fixesSection','fixesDesc'];
        const _protect = (builtin) => {
            const override = {};
            _structuralKeys.forEach(k => { override[k] = builtin[k]; });
            return override;
        };
        return {
            en: extEN ? (() => { try { const ext = JSON.parse(extEN); return {..._BUILTIN_LANGS.en, ...ext, ..._protect(_BUILTIN_LANGS.en)}; } catch(e) { return _BUILTIN_LANGS.en; } })() : _BUILTIN_LANGS.en,
            ru: extRU ? (() => { try { const ext = JSON.parse(extRU); return {..._BUILTIN_LANGS.ru, ...ext, ..._protect(_BUILTIN_LANGS.ru)}; } catch(e) { return _BUILTIN_LANGS.ru; } })() : _BUILTIN_LANGS.ru
        };
    })();

    // Тема: выбор по settingsStyle, @resource → встроенная
    function _getThemeRaw(styleName) {
        return _BUILTIN_THEMES[styleName] || _BUILTIN_THEMES.youtube;
    }

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
    _unsafeWin.ytEnhancerTrustedTypesPolicy = _unsafeWin.trustedTypes
        ? _unsafeWin.trustedTypes.createPolicy('yt-enhancer', {
            createHTML: (input) => input
        })
        : null;

    function setInnerHTML(element, htmlString) {
        element.innerHTML = _unsafeWin.ytEnhancerTrustedTypesPolicy
            ? _unsafeWin.ytEnhancerTrustedTypesPolicy.createHTML(htmlString)
            : htmlString;
    }

    // --- Расширенное определение Яндекс.Браузера (с кэшированием) ---

    function isYandexBrowser() {
        if (_isYandex !== null) return _isYandex;
        const ua = navigator.userAgent;
        if (/YaBrowser/i.test(ua)) { _isYandex = true; return true; }
        if (_unsafeWin.yandex) { _isYandex = true; return true; }
        if (navigator.vendor && navigator.vendor.toLowerCase().includes('yandex')) { _isYandex = true; return true; }
        if (_unsafeWin.chrome && _unsafeWin.chrome.runtime && _unsafeWin.chrome.runtime.id && _unsafeWin.chrome.runtime.id.startsWith('bhchdcejhohfmigjafbampogmaanbfkg')) { _isYandex = true; return true; }
        _isYandex = false;
        return false;
    }

    // --- Проверка ОС ---

    function getOS() {
        const userAgent = _unsafeWin.navigator.userAgent;
        const platform = _unsafeWin.navigator.platform;
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
        chipbarBgHeight: 10,
        hideChipbarBg: false,
        compactMode: false,
        hideShorts: true,
        hideTopicShelves: false,
        hideRFSlowWarning: true,
        fixChannelCard: true,
        restoreChips: true,
        playlistModeFeature: false,
        forceH264: false,
        fixAutoPause: true,
        fixDarkFlash: true,
        fixSearchGrid: true,
        fixMiniPlayer: true,
        scrollOptimization: true,
        fixSidebar: true,
        hideEmptyBlocks: true,
        yandexFixNavigation: true,
        yandexFixScrollbar: true,
        yandexFixFullscreen: true,
        yandexFixPlayerControls: true,
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
        enhancerTheme: 'auto',
        settingsStyle: 'youtube',
        enhancerFontSize: 14,
        customColorsEnabled: false,
        customColors: {
            bg: '', fg: '', primary: '', border: '',
            btnBorder: '', btnFg: '', btnHoverBg: '', btnHoverFg: '',
            badgeBg: '', badgeFg: '',
            inputBg: '', inputFg: '', inputBorder: '',
            selectBg: '', selectFg: '', selectBorder: ''
        },
        bgImage: '',
        bgTarget: 'settings',
        bgOpacity: 0.15,
        bgBlur: 0,
        bgSize: 'cover',
        userCSS: '',
        stylePresets: {}
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
            if (!_unsafeWin.__ytEnhancerYandexGridInterval) {
                _unsafeWin.__ytEnhancerYandexGridInterval = setInterval(fixGrid, 3000);
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
            `, 'yt-enhancer-yandex-perf');
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
                `, 'yt-enhancer-yandex-shift');
            } else {
                addStyles(`
                    ytd-page-manager, ytd-browse {
                        transform: none !important;
                    }
                `, 'yt-enhancer-yandex-shift');
            }
        }
    }

    // --- Скрытие уведомления о замедлении YouTube в РФ ---

    function hideRFSlowWarning() {
        if (!config.hideRFSlowWarning || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            .sf-notification-btn { display: none !important; }
            ytd-mealbar-promo-renderer { display: none !important; }
            #clarify-box { display: none !important; }
            tp-yt-paper-dialog.ytd-enforcement-message-view-model { display: none !important; }
            ytd-enforcement-message-view-model { display: none !important; }
        `, 'yt-enhancer-rf-warning');
    }

    // --- Основные функции ---

    function applyMainFeatures() {
        if (isPlaylistModeActive && config.playlistModeFeature) {
            return;
        }
        let mainCSS = '';
        // Скрывать чипсы только на главной странице и в разделах, но не на вкладке Videos
        if (config.hideChips && /^\/$/.test(location.pathname)) {
            mainCSS += `
                ytd-feed-filter-chip-bar-renderer,
                yt-chip-cloud-renderer,
                yt-related-chip-cloud-renderer,
                #chips-wrapper.ytd-rich-grid-renderer,
                #header.ytd-rich-grid-renderer {
                    display: none !important;
                    height: 0 !important;
                    min-height: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    overflow: hidden !important;
                }
            `;
        }
        // Принудительно показываем чипсы на вкладке Videos
        if (/\/@[^/]+\/videos/.test(location.pathname)) {
            mainCSS += `
                #chips,
                ytd-feed-filter-chip-bar-renderer,
                yt-chip-cloud-renderer,
                yt-related-chip-cloud-renderer,
                #chips-wrapper.ytd-rich-grid-renderer {
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
            `;
        }
        if (config.compactMode) {
            mainCSS += `
                ytd-rich-item-renderer {
                    margin-bottom: 8px !important;
                }
            `;
        }
        if (config.hideTopicShelves) {
            mainCSS += `
                /* Скрываем секции "Ещё темы" (topic shelves с чипсами) */
                ytd-rich-section-renderer:has(ytd-chips-shelf-with-video-shelf-renderer),
                ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-inner-shelf]) {
                    display: none !important;
                }
            `;
        }
        if (config.hideShorts) {
            mainCSS += `
                ytd-rich-section-renderer[section-identifier="shorts-shelf"],
                ytd-reel-shelf-renderer,
                ytd-guide-entry-renderer[title="Shorts"],
                a[title="Shorts"],
                ytd-mini-guide-entry-renderer[title="Shorts"],
                ytd-rich-shelf-renderer[is-shorts],
                ytd-rich-section-renderer[section-identifier="shorts-shelf"],
                /* Доп. селекторы для новых версий YouTube */
                ytd-rich-section-renderer[is-shorts],
                [is-shorts].ytd-rich-section-renderer,
                ytd-reel-shelf-renderer.ytd-item-section-renderer {
                    display: none !important;
                }
            `;
        }
        addStyles(mainCSS, 'yt-enhancer-main-features');
        applyChipbarBgFix();
        if (config.fixChannelCard) {
            fixChannelCardOnChannelTabs();
        }
        // Always restore chips on Videos tab so hiding chips on home never breaks channel sorting
        restoreChipsOnVideosTab();
    }

    // --- Управление #frosted-glass: скрыть полностью или задать высоту вручную ---

    function applyChipbarBgFix() {
        if (isYandexBrowser()) return;
        if (isPlaylistModeActive && config.playlistModeFeature) return;

        if (config.hideChipbarBg) {
            // Полное скрытие
            addStyles(`
                ytd-app #frosted-glass, #frosted-glass {
                    display: none !important;
                    height: 0 !important;
                    min-height: 0 !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                }
            `, 'yt-enhancer-chipbar-bg-hide');
            const fixHide = () => {
                document.querySelectorAll('#frosted-glass').forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('height', '0', 'important');
                    el.style.setProperty('min-height', '0', 'important');
                });
            };
            fixHide();
            if (!_unsafeWin.__ytEnhancerChipbarBgInterval) {
                _unsafeWin.__ytEnhancerChipbarBgInterval = setInterval(fixHide, 500);
            }
        } else {
            // Ручная высота
            const h = config.chipbarBgHeight;
            addStyles(`
                ytd-app #frosted-glass, #frosted-glass {
                    height: ${h}px !important;
                    min-height: unset !important;
                    overflow: hidden !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
            `, 'yt-enhancer-chipbar-bg-hide');
            const fixHeight = () => {
                document.querySelectorAll('#frosted-glass').forEach(el => {
                    el.style.setProperty('height', h + 'px', 'important');
                    el.style.setProperty('min-height', 'unset', 'important');
                    el.style.setProperty('overflow', 'hidden', 'important');
                });
            };
            fixHeight();
            if (!_unsafeWin.__ytEnhancerChipbarBgInterval) {
                _unsafeWin.__ytEnhancerChipbarBgInterval = setInterval(fixHeight, 500);
            }
        }

        // MutationObserver на ytd-app — мгновенная реакция на изменения YouTube
        const appEl = document.querySelector('ytd-app');
        if (appEl && !appEl._chipbarBgObserver) {
            const obs = new MutationObserver(() => {
                if (_unsafeWin.__ytEnhancerChipbarBgInterval) {
                    clearInterval(_unsafeWin.__ytEnhancerChipbarBgInterval);
                    _unsafeWin.__ytEnhancerChipbarBgInterval = null;
                }
                applyChipbarBgFix();
            });
            obs.observe(appEl, { attributes: true, attributeFilter: ['class'], childList: true, subtree: false });
            appEl._chipbarBgObserver = obs;
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
        `, 'yt-enhancer-channel-header');
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
        createManagedObserver(document.body, applyStyles, { childList: true, subtree: true });
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
        const chipsCallback = () => {
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
        };
        createManagedObserver(document.body, chipsCallback, {childList: true, subtree: true});
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
        `, 'yt-enhancer-chips-restore');
    }

    // --- Добавление стилей в DOM (оптимизированное) ---

    function addStyles(css, id) {
        if (id) {
            let existing = _managedStyles.get(id);
            if (existing && existing.parentNode) {
                existing.textContent = css;
                return;
            }
            const style = document.createElement('style');
            style.type = 'text/css';
            style.dataset.ytEnhancer = id;
            style.textContent = css;
            const target = document.head || document.documentElement;
            if (target) {
                target.appendChild(style);
                _managedStyles.set(id, style);
            } else {
                setTimeout(() => addStyles(css, id), 100);
            }
            return;
        }
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

    // --- Утилита дебаунса ---

    function debounce(fn, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // --- Управляемый MutationObserver ---

    function createManagedObserver(target, callback, options) {
        const observer = new MutationObserver(callback);
        observer.observe(target, options);
        _observers.push(observer);
        return observer;
    }

    // --- Применение стилей ---

    function applyGlobalStyles() {
        const styles = generateStyles();
        addStyles(styles, 'yt-enhancer-main');
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
            } catch (e) { /* ignore */ }
        });
        if (config.yandexGridFix) {
            try {
                const grid = document.querySelector('ytd-rich-grid-renderer');
                if (grid) {
                    grid.style.setProperty('--ytd-rich-grid-items-per-row', config.yandexVideoCount, 'important');
                }
            } catch (e) { /* ignore */ }
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
                --enhancer-primary: var(--yt-spec-brand-button-background, #065fd4);
                --enhancer-transition: all 0.2s ease;
                --enhancer-divider: var(--yt-spec-10-percent-layer, #e5e7eb);
                --enhancer-select-bg: var(--yt-spec-badge-chip-background, #f8fafc);
                --enhancer-select-fg: var(--yt-spec-text-primary, #030303);
                --enhancer-select-border: var(--yt-spec-10-percent-layer, #e5e7eb);
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
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
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
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                transform: rotate(90deg);
            }
            /* Badge */
            .yt-enhancer-badge {
                display: inline-block;
                margin-left: 6px;
                font-size: 0.7em;
                font-weight: 600;
                border-radius: 6px;
                padding: 2px 7px;
                vertical-align: middle;
                letter-spacing: 0.3px;
                background: var(--enhancer-badge-bg);
                color: var(--enhancer-badge-fg);
                border: none;
                text-transform: uppercase;
                transition: transform 0.2s ease, opacity 0.2s ease;
            }
            .yt-enhancer-badge-exp {
                background: var(--enhancer-badge-exp-bg);
                color: var(--enhancer-badge-exp-fg);
            }
            @keyframes pulse {
                0%   { transform: scale(1); }
                50%  { transform: scale(1.06); }
                100% { transform: scale(1); }
            }
            @keyframes pulseExp {
                0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 112, 67, 0.4); }
                70%  { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(255, 112, 67, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 112, 67, 0); }
            }
            .yt-enhancer-badge:hover {
                animation: pulse 0.6s ease;
            }
            .yt-enhancer-badge-exp:hover {
                animation: pulseExp 0.8s ease;
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
                max-width: calc(100vw - 32px) !important;
                max-height: calc(100vh - 40px) !important;
                overflow-y: auto !important;
                box-sizing: border-box !important;
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
            #yt-enhancer-settings input {
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
            #yt-enhancer-settings select {
                background: var(--enhancer-select-bg) !important;
                color: var(--enhancer-select-fg) !important;
                border: 1.5px solid var(--enhancer-select-border) !important;
                border-radius: 8px !important;
                padding: 6px 10px !important;
                font-size: 1em;
                font-family: var(--enhancer-font) !important;
                margin-top: 3px;
                margin-bottom: 6px;
                outline: none;
                transition: border-color 0.15s;
            }
            #yt-enhancer-settings select option {
                background: var(--enhancer-select-bg, #1f1f1f) !important;
                color: var(--enhancer-select-fg, #f1f1f1) !important;
                padding: 6px 10px !important;
            }
            #yt-enhancer-settings input:focus,
            #yt-enhancer-settings select:focus {
                border-color: var(--enhancer-btn-border) !important;
            }
            /* Style Editor selects (overlay is outside #yt-enhancer-settings) */
            #yt-style-editor select {
                background: var(--enhancer-select-bg, #1f1f1f) !important;
                color: var(--enhancer-select-fg, #f1f1f1) !important;
                border: 1.5px solid var(--enhancer-select-border, #333) !important;
                border-radius: 8px !important;
                padding: 6px 10px !important;
                font-size: 0.9em;
                outline: none;
                transition: border-color 0.15s;
                cursor: pointer;
            }
            #yt-style-editor select option {
                background: var(--enhancer-select-bg, #1f1f1f) !important;
                color: var(--enhancer-select-fg, #f1f1f1) !important;
                padding: 6px 10px !important;
            }
            #yt-style-editor select:focus {
                border-color: var(--enhancer-primary, #3ea6ff) !important;
            }
            #yt-style-editor button:not(.yt-enhancer-close-btn) {
                background: none !important;
                color: var(--enhancer-btn-fg) !important;
                border: 1.5px solid var(--enhancer-btn-border) !important;
                border-radius: 8px !important;
                font-weight: 600;
                padding: 8px 16px !important;
                font-size: 0.9em !important;
                cursor: pointer;
                transition: background 0.18s, color 0.18s, border-color 0.18s;
                box-shadow: none !important;
            }
            #yt-style-editor button:not(.yt-enhancer-close-btn):hover {
                background: var(--enhancer-btn-hover-bg) !important;
                color: var(--enhancer-btn-hover-fg) !important;
                border-color: var(--enhancer-btn-hover-bg) !important;
            }
            #yt-style-editor input[type="text"],
            #yt-style-editor input[type="number"],
            #yt-style-editor textarea {
                background: var(--enhancer-input-bg) !important;
                color: var(--enhancer-input-fg) !important;
                border: 1.5px solid var(--enhancer-input-border) !important;
                border-radius: 8px !important;
                font-family: var(--enhancer-font) !important;
                outline: none !important;
                transition: border-color 0.15s;
            }
            #yt-style-editor input[type="text"]:focus,
            #yt-style-editor input[type="number"]:focus,
            #yt-style-editor textarea:focus {
                border-color: var(--enhancer-primary, #3ea6ff) !important;
            }
            #yt-style-editor input[type="checkbox"] {
                accent-color: var(--enhancer-primary, #3ea6ff);
            }
            #yt-style-editor input[type="range"] {
                accent-color: var(--enhancer-primary, #3ea6ff);
            }
            #yt-style-editor h2, #yt-style-editor h3 {
                color: var(--enhancer-fg) !important;
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
            /* Tooltip для числовых полей */
            .yt-enhancer-num-row {
                position: relative;
            }
            .yt-enhancer-num-row .yt-enhancer-num-desc {
                display: none;
                position: absolute;
                left: 0;
                top: 100%;
                margin-top: 4px;
                z-index: 9999;
                background: var(--enhancer-bg, #fff);
                color: var(--enhancer-fg, #030303);
                border: 1px solid var(--enhancer-border, #e0e0e0);
                border-radius: 8px;
                padding: 7px 11px;
                font-size: 0.82em;
                line-height: 1.4;
                max-width: 260px;
                min-width: 160px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.13);
                pointer-events: none;
                white-space: normal;
            }
            .yt-enhancer-num-row:hover .yt-enhancer-num-desc {
                display: block;
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
            @media (max-height: 768px) {
                #yt-enhancer-settings {
                    max-height: calc(100vh - 16px) !important;
                    padding: 16px 14px 12px 14px !important;
                }
            }
            @media (max-height: 640px) {
                #yt-enhancer-settings {
                    max-height: calc(100vh - 8px) !important;
                    padding: 10px 10px 8px 10px !important;
                    border-radius: 10px !important;
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
        // --- THEME: загрузка из внешнего CSS или встроенных тем ---
        const themeMode = config.enhancerTheme || 'auto';
        const themeStyle = config.settingsStyle || 'youtube';
        const darkOpen = themeMode === 'auto' ? '@media (prefers-color-scheme: dark) {\n' : '';
        const darkClose = themeMode === 'auto' ? '\n}' : '';
        const lightOpen = themeMode === 'auto' ? '@media (prefers-color-scheme: light) {\n' : '';
        const lightClose = themeMode === 'auto' ? '\n}' : '';
        const showDark = themeMode === 'auto' || themeMode === 'dark';
        const showLight = themeMode === 'auto' || themeMode === 'light';
        // Try external CSS first (works for all themes if css/style.css contains all of them)
        const extCSS = _loadResource('themeCSS');
        const themeRaw = extCSS || _getThemeRaw(themeStyle);
        // Pass theme name so _parseThemeCSS can extract the right block from multi-theme file
        let _themeCSS = _parseThemeCSS(themeRaw, extCSS ? themeStyle : null);
        // Fallback: if external CSS is stale (missing this theme), use _BUILTIN_THEMES
        if (!_themeCSS) {
            _themeCSS = _parseThemeCSS(_getThemeRaw(themeStyle), null);
        }
        if (_themeCSS) {
            css += _themeCSS.base;
            if (showDark) css += darkOpen + _themeCSS.dark + darkClose;
            if (showLight) css += lightOpen + _themeCSS.light + lightClose;
            css += _themeCSS.common;
        }
        // --- Custom color overrides ---
        if (config.customColorsEnabled && config.customColors) {
            const cc = config.customColors;
            const overrides = [];
            if (cc.bg) overrides.push(`--enhancer-bg: ${cc.bg} !important`);
            if (cc.fg) overrides.push(`--enhancer-fg: ${cc.fg} !important`);
            if (cc.primary) overrides.push(`--enhancer-primary: ${cc.primary} !important`);
            if (cc.border) overrides.push(`--enhancer-border: ${cc.border} !important`);
            if (cc.btnBorder) overrides.push(`--enhancer-btn-border: ${cc.btnBorder} !important`);
            if (cc.btnFg) overrides.push(`--enhancer-btn-fg: ${cc.btnFg} !important`);
            if (cc.btnHoverBg) overrides.push(`--enhancer-btn-hover-bg: ${cc.btnHoverBg} !important`);
            if (cc.btnHoverFg) overrides.push(`--enhancer-btn-hover-fg: ${cc.btnHoverFg} !important`);
            if (cc.badgeBg) overrides.push(`--enhancer-badge-bg: ${cc.badgeBg} !important`);
            if (cc.badgeFg) overrides.push(`--enhancer-badge-fg: ${cc.badgeFg} !important`);
            if (cc.inputBg) overrides.push(`--enhancer-input-bg: ${cc.inputBg} !important`);
            if (cc.inputFg) overrides.push(`--enhancer-input-fg: ${cc.inputFg} !important`);
            if (cc.inputBorder) overrides.push(`--enhancer-input-border: ${cc.inputBorder} !important`);
            if (cc.selectBg) overrides.push(`--enhancer-select-bg: ${cc.selectBg} !important`);
            if (cc.selectFg) overrides.push(`--enhancer-select-fg: ${cc.selectFg} !important`);
            if (cc.selectBorder) overrides.push(`--enhancer-select-border: ${cc.selectBorder} !important`);
            if (overrides.length) {
                css += `\n:root { ${overrides.join('; ')}; }\n`;
                if (cc.bg) css += `#yt-enhancer-settings { background: ${cc.bg} !important; }\n`;
            }
        }
        // --- Background image ---
        if (config.bgImage) {
            const sanitizedUrl = config.bgImage.replace(/['"<>]/g, '');
            const opac = Math.max(0, Math.min(1, Number(config.bgOpacity) || 0.15));
            const blur = Math.max(0, Math.min(50, Number(config.bgBlur) || 0));
            const size = ['cover', 'contain', 'auto'].includes(config.bgSize) ? config.bgSize : 'cover';
            if (config.bgTarget === 'page') {
                css += `
                    body::before {
                        content: '';
                        position: fixed;
                        top: 0; left: 0; width: 100%; height: 100%;
                        background: url("${sanitizedUrl}") center/${size} no-repeat;
                        opacity: ${opac};
                        filter: blur(${blur}px);
                        z-index: -1;
                        pointer-events: none;
                    }
                `;
            } else {
                css += `
                    #yt-enhancer-settings { position: relative; overflow: hidden; }
                    #yt-enhancer-settings::before {
                        content: '';
                        position: absolute;
                        top: 0; left: 0; width: 100%; height: 100%;
                        background: url("${sanitizedUrl}") center/${size} no-repeat;
                        opacity: ${opac};
                        filter: blur(${blur}px);
                        z-index: 0;
                        pointer-events: none;
                        border-radius: inherit;
                    }
                    #yt-enhancer-settings > * { position: relative; z-index: 1; }
                `;
            }
        }
        // --- User custom CSS ---
        if (config.userCSS) {
            css += `\n/* User Custom CSS */\n${config.userCSS}\n`;
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
            max-width: min(98vw, ${isYandexBrowser() ? '540px' : '400px'});
            max-height: calc(100vh - 40px);
            overflow-y: auto;
            box-sizing: border-box;
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
        title.style.color = 'var(--enhancer-fg, #030303)';
        title.style.fontWeight = 'bold';
        // GitHub link icon
        const ghLink = document.createElement('a');
        ghLink.href = 'https://github.com/Xanixsl/YouTube-Fix-for-Yandex';
        ghLink.target = '_blank';
        ghLink.rel = 'noopener noreferrer';
        ghLink.title = 'GitHub';
        ghLink.style.cssText = 'display:inline-flex;align-items:center;margin-left:10px;vertical-align:middle;opacity:0.6;transition:opacity 0.2s;';
        ghLink.addEventListener('mouseenter', () => { ghLink.style.opacity = '1'; });
        ghLink.addEventListener('mouseleave', () => { ghLink.style.opacity = '0.6'; });
        const ghSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        ghSvg.setAttribute('width', '20');
        ghSvg.setAttribute('height', '20');
        ghSvg.setAttribute('viewBox', '0 0 16 16');
        ghSvg.setAttribute('fill', 'currentColor');
        ghSvg.style.color = 'var(--enhancer-fg, var(--yt-spec-text-primary, #606060))';
        const ghPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        ghPath.setAttribute('d', 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z');
        ghSvg.appendChild(ghPath);
        ghLink.appendChild(ghSvg);
        title.appendChild(ghLink);

        // DonationAlerts link — official header logo from donationalerts.com
        const daLink = document.createElement('a');
        daLink.href = 'https://www.donationalerts.com/r/saylont';
        daLink.target = '_blank';
        daLink.rel = 'noopener noreferrer';
        daLink.title = 'DonationAlerts';
        daLink.style.cssText = 'display:inline-flex;align-items:center;margin-left:10px;vertical-align:middle;opacity:0.6;transition:opacity 0.2s;';
        daLink.addEventListener('mouseenter', () => { daLink.style.opacity = '1'; });
        daLink.addEventListener('mouseleave', () => { daLink.style.opacity = '0.6'; });
        const daImg = document.createElement('img');
        daImg.src = 'https://www.donationalerts.com/img/header/logo.svg';
        daImg.alt = 'DonationAlerts';
        daImg.style.cssText = 'height:20px;width:auto;display:block;';
        daLink.appendChild(daImg);
        title.appendChild(daLink);

        // Boosty link — official favicon from boosty.to
        const bLink = document.createElement('a');
        bLink.href = 'https://boosty.to/saylontoff/donate';
        bLink.target = '_blank';
        bLink.rel = 'noopener noreferrer';
        bLink.title = 'Boosty';
        bLink.style.cssText = 'display:inline-flex;align-items:center;margin-left:10px;vertical-align:middle;opacity:0.6;transition:opacity 0.2s;';
        bLink.addEventListener('mouseenter', () => { bLink.style.opacity = '1'; });
        bLink.addEventListener('mouseleave', () => { bLink.style.opacity = '0.6'; });
        const bImg = document.createElement('img');
        bImg.src = 'https://boosty.to/favicon.png?v=14';
        bImg.alt = 'Boosty';
        bImg.style.cssText = 'width:20px;height:20px;display:block;border-radius:4px;';
        bLink.appendChild(bImg);
        title.appendChild(bLink);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'yt-enhancer-close-btn';
        setInnerHTML(closeBtn, '&times;');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            font-size: 2em;
            cursor: pointer;
            color: var(--enhancer-tab-inactive, #606060);
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
            warning.style.backgroundColor = 'var(--enhancer-badge-bg, #f3f6fa)';
            warning.style.borderRadius = '8px';
            warning.style.textAlign = 'center';
            setInnerHTML(warning, L.warning);
            dialog.appendChild(warning);
        }
        // --- Вкладки ---
        const tabs = document.createElement('div');
        tabs.style.display = 'flex';
        tabs.style.marginBottom = '20px';
        tabs.style.borderBottom = '1px solid var(--enhancer-border, #ddd)';
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
                color: var(--enhancer-tab-inactive, #606060);
                margin-right: 8px;
                font-size: 1em;
                transition: color 0.15s, border-bottom-color 0.15s;
                border-radius: 0;
            `;
            if (i === 0) {
                tab.style.color = 'var(--enhancer-fg, #030303)';
                tab.style.borderBottomColor = 'var(--enhancer-primary, #065fd4)';
            }
            tab.addEventListener('click', () => {
                tabs.querySelectorAll('button').forEach(t => {
                    t.style.color = 'var(--enhancer-tab-inactive, #606060)';
                    t.style.borderBottomColor = 'transparent';
                });
                tab.style.color = 'var(--enhancer-fg, #030303)';
                tab.style.borderBottomColor = 'var(--enhancer-primary, #065fd4)';
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
            createGeneralTab(tabContents[0]);
            createYandexTab(tabContents[1]);
            createAppearanceTab(tabContents[2]);
        } else {
            createGeneralTab(tabContents[0]);
            createAppearanceTab(tabContents[1]);
        }
        tabContents.forEach(content => dialog.appendChild(content));

        // --- Footer: attribution + license notice (DOM only — no innerHTML, Trusted Types safe) ---
        const footerNote = document.createElement('div');
        footerNote.style.cssText = 'margin-top:18px;padding:10px 14px;border-top:1px solid var(--enhancer-border,#e5e7eb);font-size:0.71em;line-height:1.6;color:var(--enhancer-fg,#606060);opacity:0.5;text-align:center;user-select:none;';

        const _isRu = uiLang === 'ru';

        // Line 1: trademark attribution (bilingual)
        const fnTm = document.createElement('span');
        fnTm.style.display = 'block';
        const fnDAbold = document.createElement('b'); fnDAbold.textContent = 'DonationAlerts\u00AE';
        const fnBBold  = document.createElement('b'); fnBBold.textContent  = 'Boosty\u00AE';
        const fnOwner  = document.createElement('b'); fnOwner.textContent  = 'Zaya Solutions Limited';
        if (_isRu) {
            fnTm.appendChild(document.createTextNode('\u0422\u043E\u0432\u0430\u0440\u043D\u044B\u0435 \u0437\u043D\u0430\u043A\u0438 '));
            fnTm.appendChild(fnDAbold);
            fnTm.appendChild(document.createTextNode(' \u0438 '));
            fnTm.appendChild(fnBBold);
            fnTm.appendChild(document.createTextNode(' \u044F\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0441\u0442\u044C\u044E '));
            fnTm.appendChild(fnOwner);
            fnTm.appendChild(document.createTextNode(' (\u0440\u0435\u0433. \u2116\u00A077667576, \u0413\u043E\u043D\u043A\u043E\u043D\u0433).'));
        } else {
            fnTm.appendChild(fnDAbold);
            fnTm.appendChild(document.createTextNode(' and '));
            fnTm.appendChild(fnBBold);
            fnTm.appendChild(document.createTextNode(' are trademarks of '));
            fnTm.appendChild(fnOwner);
            fnTm.appendChild(document.createTextNode(' (reg. \u2116\u00A077667576, Hong Kong).'));
        }

        // Line 2: license link only
        const fnLic = document.createElement('span');
        fnLic.style.cssText = 'display:block;margin-top:3px;';
        const fnLicLink = document.createElement('a');
        fnLicLink.href = 'https://creativecommons.org/licenses/by-nd/4.0/deed.en';
        fnLicLink.target = '_blank'; fnLicLink.rel = 'noopener noreferrer';
        fnLicLink.textContent = 'CC BY-ND 4.0';
        fnLicLink.style.cssText = 'color:inherit;text-decoration:underline;';
        fnLic.appendChild(document.createTextNode(_isRu ? '\u041B\u0438\u0446\u0435\u043D\u0437\u0438\u044F:\u00A0' : 'License:\u00A0'));
        fnLic.appendChild(fnLicLink);

        // Line 3: copyright + GitHub
        const fnCopy = document.createElement('span');
        fnCopy.style.cssText = 'display:block;margin-top:3px;';
        const fnAuthorB = document.createElement('b'); fnAuthorB.textContent = 'Xanix';
        const fnGhLink = document.createElement('a');
        fnGhLink.href = 'https://github.com/Xanixsl/YouTube-Fix-for-Yandex-main';
        fnGhLink.target = '_blank'; fnGhLink.rel = 'noopener noreferrer';
        fnGhLink.textContent = 'GitHub';
        fnGhLink.style.cssText = 'color:inherit;text-decoration:underline;';
        fnCopy.appendChild(document.createTextNode('\u00A9 ' + new Date().getFullYear() + '\u00A0'));
        fnCopy.appendChild(fnAuthorB);
        fnCopy.appendChild(document.createTextNode('\u00A0\u00B7\u00A0'));
        fnCopy.appendChild(fnGhLink);

        footerNote.appendChild(fnTm);
        footerNote.appendChild(fnLic);
        footerNote.appendChild(fnCopy);
        dialog.appendChild(footerNote);

        // --- Кнопки сохранения/сброса ---
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.justifyContent = 'space-between';
        buttons.style.marginTop = '20px';
        const saveBtn = document.createElement('button');
        saveBtn.textContent = L.save;
        saveBtn.style.cssText = `
            padding: 12px 24px;
            background: var(--enhancer-primary, #065fd4);
            color: var(--enhancer-btn-hover-fg, white);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            flex: 1;
            margin-right: 10px;
            transition: opacity 0.18s;
        `;
        const resetBtn = document.createElement('button');
        resetBtn.textContent = L.reset;
        resetBtn.style.cssText = `
            padding: 12px 24px;
            background: var(--enhancer-input-bg, #f1f1f1);
            color: var(--enhancer-fg, #030303);
            border: 1.5px solid var(--enhancer-border, #e5e7eb);
            border-radius: 12px;
            cursor: pointer;
            flex: 1;
            font-weight: 600;
            transition: background 0.18s, color 0.18s;
        `;
        buttons.appendChild(saveBtn);
        buttons.appendChild(resetBtn);
        dialog.appendChild(buttons);
        document.body.appendChild(dialog);
        closeBtn.addEventListener('click', () => dialog.remove());
        saveBtn.addEventListener('click', () => {
            const inputs = dialog.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (!input.id || input.dataset.colorKey) return;
                if (input.type === 'checkbox') {
                    config[input.id] = input.checked;
                } else if (input.type === 'number') {
                    let v = parseInt(input.value) || 0;
                    const mn = input.min !== '' ? parseInt(input.min) : -Infinity;
                    const mx = input.max !== '' ? parseInt(input.max) : Infinity;
                    if (v < mn) v = mn;
                    if (v > mx) v = mx;
                    config[input.id] = v;
                } else {
                    config[input.id] = input.value;
                }
            });
            // Автоматическое управление режимом оптимизации
            const playlistModeCheckbox = dialog.querySelector('#playlistModeFeature');
            if (playlistModeCheckbox) {
                const perfModeCheckbox = dialog.querySelector('#yandexPerformanceMode');
                if (perfModeCheckbox) {
                    if (playlistModeCheckbox.checked) {
                        // Если включен режим плейлистов, отключаем режим оптимизации
                        perfModeCheckbox.checked = false;
                        perfModeCheckbox.disabled = true;
                        if (perfModeCheckbox.parentElement) {
                            perfModeCheckbox.parentElement.style.opacity = '0.5';
                        }
                        config.yandexPerformanceMode = false;
                    } else {
                        // Если выключен режим плейлистов, включаем режим оптимизации
                        perfModeCheckbox.checked = true;
                        perfModeCheckbox.disabled = false;
                        if (perfModeCheckbox.parentElement) {
                            perfModeCheckbox.parentElement.style.opacity = '1';
                        }
                        config.yandexPerformanceMode = true;
                    }
                }
            }
            storage.set('ytEnhancerConfig', config);
            applyGlobalStyles();
            applyMainFeatures();
            applyYandexFixes();
            applyNewFixes();
            hideRFSlowWarning();
            dialog.remove();
            showNotification(L.saved);
            setTimeout(() => location.reload(), 1000);
        });
        resetBtn.addEventListener('click', () => {
            if (confirm(L.confirmReset)) {
                config = {...defaultConfig};
                storage.set('ytEnhancerConfig', config);
                applyGlobalStyles();
                applyMainFeatures();
                applyYandexFixes();
                applyNewFixes();
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

    function createGeneralTab(container) {
        const section = (title, description = '') => {
            const sectionDiv = document.createElement('div');
            sectionDiv.style.marginBottom = '16px';
            const h3 = document.createElement('h3');
            h3.textContent = title;
            h3.style.margin = '16px 0 8px 0';
            h3.style.fontSize = '1.1em';
            h3.style.color = 'var(--enhancer-fg, #030303)';
            h3.style.fontWeight = 'bold';
            sectionDiv.appendChild(h3);
            if (description) {
                const desc = document.createElement('p');
                desc.textContent = description;
                desc.style.margin = '4px 0 8px 0';
                desc.style.fontSize = '0.9em';
                desc.style.color = 'var(--enhancer-tab-inactive, #888)';
                sectionDiv.appendChild(desc);
            }
            return sectionDiv;
        };
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
                desc.style.color = 'var(--enhancer-tab-inactive, #888)';
                desc.style.marginTop = '4px';
                labelDiv.appendChild(desc);
            }
            div.appendChild(input);
            div.appendChild(labelDiv);
            return div;
        };

        // --- Section 1: Interface ---
        const mainSection = section(L.mainSection, L.mainDesc);
        mainSection.appendChild(createCheckbox('hideChips', L.hideChips, config.hideChips, L.hideChipsDesc));
        const createNumInput = (id, label, value, min, max, desc) => {
            const div = document.createElement('div');
            div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;margin-left:22px;position:relative;';
            div.classList.add('yt-enhancer-num-row');
            const labelEl = document.createElement('label');
            labelEl.htmlFor = id;
            labelEl.textContent = label;
            labelEl.style.fontWeight = '500';
            const input = document.createElement('input');
            input.type = 'number';
            input.id = id;
            input.value = value;
            input.min = min;
            input.max = max;
            input.style.cssText = 'width:70px;padding:4px 8px;border-radius:8px;border:1px solid var(--enhancer-input-border,#ddd);background:var(--enhancer-input-bg,#f2f2f2);color:var(--enhancer-fg,#030303);';
            div.appendChild(labelEl);
            div.appendChild(input);
            if (desc) {
                const descEl = document.createElement('div');
                descEl.className = 'yt-enhancer-num-desc';
                descEl.textContent = desc;
                div.appendChild(descEl);
            }
            return div;
        };
        // Настройки фона чипбара — только для не-Яндекс браузеров
        if (!isYandexBrowser()) {
            // Определяем реальную максимальную высоту #frosted-glass
            const _fgEl = document.querySelector('#frosted-glass');
            let _chipbarNaturalMax = 80;
            if (_fgEl) {
                const _savedH = _fgEl.style.height;
                _fgEl.style.height = '';
                _chipbarNaturalMax = _fgEl.scrollHeight || _fgEl.offsetHeight || 80;
                _fgEl.style.height = _savedH;
            }
            const chipbarBgHeightRow = createNumInput('chipbarBgHeight', L.chipbarBgHeight, Math.min(Math.max(config.chipbarBgHeight, 0), _chipbarNaturalMax), 0, _chipbarNaturalMax, L.chipbarBgHeightDesc);
            // Клamp: не даём ввести меньше 0 и больше max
            const _chipbarInp = chipbarBgHeightRow.querySelector('input');
            _chipbarInp.addEventListener('input', () => {
                let v = parseInt(_chipbarInp.value, 10);
                if (isNaN(v) || v < 0) { _chipbarInp.value = 0; }
                else if (v > _chipbarNaturalMax) { _chipbarInp.value = _chipbarNaturalMax; }
            });
            _chipbarInp.addEventListener('blur', () => {
                let v = parseInt(_chipbarInp.value, 10);
                if (isNaN(v) || v < 0) { _chipbarInp.value = 0; }
                else if (v > _chipbarNaturalMax) { _chipbarInp.value = _chipbarNaturalMax; }
            });
            const setChipbarBgHeightEnabled = (enabled) => {
                const inp = chipbarBgHeightRow.querySelector('input');
                const lbl = chipbarBgHeightRow.querySelector('label');
                inp.disabled = !enabled;
                chipbarBgHeightRow.style.opacity = enabled ? '1' : '0.4';
                chipbarBgHeightRow.style.pointerEvents = enabled ? '' : 'none';
                lbl.style.color = enabled ? '' : 'var(--enhancer-tab-inactive, #888)';
            };
            mainSection.appendChild(chipbarBgHeightRow);
            const hideChipbarBgCb = createCheckbox('hideChipbarBg', L.hideChipbarBg, config.hideChipbarBg, L.hideChipbarBgDesc);
            // Связь: при изменении чекбокса управляем доступностью поля высоты
            const hideChipbarBgInput = hideChipbarBgCb.querySelector('input[type=checkbox]');
            setChipbarBgHeightEnabled(!config.hideChipbarBg);
            hideChipbarBgInput.addEventListener('change', () => {
                setChipbarBgHeightEnabled(!hideChipbarBgInput.checked);
            });
            mainSection.appendChild(hideChipbarBgCb);
        }
        mainSection.appendChild(createCheckbox('compactMode', L.compactMode, config.compactMode, L.compactModeDesc));
        mainSection.appendChild(createCheckbox('hideShorts', L.hideShorts, config.hideShorts, L.hideShortsDesc));
        mainSection.appendChild(createCheckbox('hideTopicShelves', L.hideTopicShelves, config.hideTopicShelves, L.hideTopicShelvesDesc, true));
        mainSection.appendChild(createCheckbox('hideRFSlowWarning', L.hideRFSlowWarning, config.hideRFSlowWarning, L.hideRFSlowWarningDesc));
        mainSection.appendChild(createCheckbox('fixChannelCard', L.fixChannelCard, config.fixChannelCard, L.fixChannelCardDesc));
        mainSection.appendChild(createCheckbox('playlistModeFeature', L.playlistModeFeature, config.playlistModeFeature, L.playlistModeFeatureDesc));
        container.appendChild(mainSection);

        // --- Section 2: Bug Fixes (all browsers) ---
        const fixesSection = section(L.fixesSection, L.fixesDesc);
        fixesSection.appendChild(createCheckbox('forceH264', L.forceH264, config.forceH264, L.forceH264Desc, true));
        fixesSection.appendChild(createCheckbox('fixAutoPause', L.fixAutoPause, config.fixAutoPause, L.fixAutoPauseDesc, true));
        fixesSection.appendChild(createCheckbox('fixDarkFlash', L.fixDarkFlash, config.fixDarkFlash, L.fixDarkFlashDesc, true));
        fixesSection.appendChild(createCheckbox('fixMiniPlayer', L.fixMiniPlayer, config.fixMiniPlayer, L.fixMiniPlayerDesc, true));
        fixesSection.appendChild(createCheckbox('scrollOptimization', L.scrollOptimization, config.scrollOptimization, L.scrollOptimizationDesc, true));
        fixesSection.appendChild(createCheckbox('hideEmptyBlocks', L.hideEmptyBlocks, config.hideEmptyBlocks, L.hideEmptyBlocksDesc, true));
        container.appendChild(fixesSection);
    }

    // --- Яндекс вкладка (Яндекс-Фиксы) ---

    function createYandexTab(container) {
        const section = (title, description = '') => {
            const sectionDiv = document.createElement('div');
            sectionDiv.style.marginBottom = '16px';
            const h3 = document.createElement('h3');
            h3.textContent = title;
            h3.style.margin = '16px 0 8px 0';
            h3.style.fontSize = '1.1em';
            h3.style.color = 'var(--enhancer-fg, #030303)';
            h3.style.fontWeight = 'bold';
            sectionDiv.appendChild(h3);
            if (description) {
                const desc = document.createElement('p');
                desc.textContent = description;
                desc.style.margin = '4px 0 8px 0';
                desc.style.fontSize = '0.9em';
                desc.style.color = 'var(--enhancer-tab-inactive, #888)';
                sectionDiv.appendChild(desc);
            }
            return sectionDiv;
        };
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
                desc.style.color = 'var(--enhancer-tab-inactive, #888)';
                desc.style.marginTop = '4px';
                labelDiv.appendChild(desc);
            }
            div.appendChild(input);
            div.appendChild(labelDiv);
            return div;
        };

        // --- Секция: Фиксы Яндекс Браузера ---
        const fixesSection = section(L.yandexFixesSection, L.yandexFixesDesc);
        fixesSection.appendChild(createCheckbox(
            'fixSearchGrid', L.fixSearchGrid, config.fixSearchGrid, L.fixSearchGridDesc, true
        ));
        fixesSection.appendChild(createCheckbox(
            'fixSidebar', L.fixSidebar, config.fixSidebar, L.fixSidebarDesc, true
        ));
        fixesSection.appendChild(createCheckbox(
            'yandexFixNavigation', L.yandexFixNavigation, config.yandexFixNavigation, L.yandexFixNavigationDesc, true
        ));
        fixesSection.appendChild(createCheckbox(
            'yandexFixScrollbar', L.yandexFixScrollbar, config.yandexFixScrollbar, L.yandexFixScrollbarDesc, true
        ));
        fixesSection.appendChild(createCheckbox(
            'yandexFixFullscreen', L.yandexFixFullscreen, config.yandexFixFullscreen, L.yandexFixFullscreenDesc, true
        ));
        fixesSection.appendChild(createCheckbox(
            'yandexFixPlayerControls', L.yandexFixPlayerControls, config.yandexFixPlayerControls, L.yandexFixPlayerControlsDesc, true
        ));
        container.appendChild(fixesSection);

        // --- Секция: Настройки сетки ---
        const gridSection = section(L.yandexSection, L.yandexDesc);
        const createNumberInput = (id, label, value, min, max, description = '') => {
            const div = document.createElement('div');
            div.style.marginBottom = '16px';
            div.style.position = 'relative';
            div.classList.add('yt-enhancer-num-row');
            const labelDiv = document.createElement('div');
            labelDiv.style.display = 'flex';
            labelDiv.style.justifyContent = 'space-between';
            labelDiv.style.marginBottom = '8px';
            const labelEl = document.createElement('label');
            labelEl.htmlFor = id;
            labelEl.textContent = label;
            labelEl.style.fontWeight = '500';
            labelDiv.appendChild(labelEl);
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
            input.style.border = '1px solid var(--enhancer-input-border, #ddd)';
            div.appendChild(input);
            if (description) {
                const descEl = document.createElement('div');
                descEl.className = 'yt-enhancer-num-desc';
                descEl.textContent = description;
                div.appendChild(descEl);
            }
            return div;
        };
        gridSection.appendChild(createNumberInput(
            'yandexVideoCount', L.yandexVideoCount, config.yandexVideoCount, 1, 6, L.yandexVideoCountDesc
        ));
        gridSection.appendChild(createNumberInput(
            'yandexChipbarMargin', L.yandexChipbarMargin, config.yandexChipbarMargin, -100, 100, L.yandexChipbarMarginDesc
        ));
        const videoMarginInput = createNumberInput(
            'yandexVideoMargin', L.yandexVideoMargin, config.yandexVideoMargin, 0, 200, L.yandexVideoMarginDesc
        );
        if (config.yandexExperimentalFix) {
            videoMarginInput.querySelector('input').disabled = true;
            videoMarginInput.style.opacity = '0.6';
        }
        gridSection.appendChild(videoMarginInput);
        container.appendChild(gridSection);
        // --- Секция: Экспериментальные ---
        const expSection = section(L.yandexExpSection, L.yandexExpDesc);
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
            'yandexExperimentalFix', L.yandexExpFix, config.yandexExperimentalFix, L.yandexExpFixDesc, false, true
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
            h3.style.color = 'var(--enhancer-fg, #030303)';
            h3.style.fontWeight = 'bold';
            sectionDiv.appendChild(h3);
            if (description) {
                const desc = document.createElement('p');
                desc.textContent = description;
                desc.style.margin = '4px 0 8px 0';
                desc.style.fontSize = '0.9em';
                desc.style.color = 'var(--enhancer-tab-inactive, #888)';
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
                desc.style.color = 'var(--enhancer-tab-inactive, #888)';
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
        thumbSelect.style.border = '1px solid var(--enhancer-input-border, #ddd)';
        thumbSelect.style.background = 'var(--enhancer-select-bg, #f8fafc)';
        thumbSelect.style.color = 'var(--enhancer-select-fg, #030303)';
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
        langSelect.style.border = '1px solid var(--enhancer-input-border, #ddd)';
        langSelect.style.background = 'var(--enhancer-select-bg, #f8fafc)';
        langSelect.style.color = 'var(--enhancer-select-fg, #030303)';
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
        themeSelect.style.border = '1px solid var(--enhancer-input-border, #ddd)';
        themeSelect.style.background = 'var(--enhancer-select-bg, #f8fafc)';
        themeSelect.style.color = 'var(--enhancer-select-fg, #030303)';
        [
            {value: 'auto', label: L.themeAuto},
            {value: 'light', label: L.themeLight},
            {value: 'dark', label: L.themeDark}
        ].forEach(option => {
            const optEl = document.createElement('option');
            optEl.value = option.value;
            optEl.textContent = option.label;
            if (option.value === config.enhancerTheme) optEl.selected = true;
            themeSelect.appendChild(optEl);
        });
        themeSection.appendChild(themeSelect);
        // --- Live theme switch ---
        themeSelect.addEventListener('change', () => {
            config.enhancerTheme = themeSelect.value;
            storage.set('ytEnhancerConfig', config);
            applyGlobalStyles();
        });
        // --- Style Editor Button ---
        const styleEditorBtn = document.createElement('button');
        styleEditorBtn.textContent = '\u{1F3A8} ' + L.styleEditorBtn;
        styleEditorBtn.style.cssText = 'width:100%;padding:12px;margin-bottom:16px;font-size:1em;cursor:pointer;font-weight:600;';
        styleEditorBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            createStyleEditor();
        });
        container.appendChild(styleEditorBtn);
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
        // --- Live font size ---
        fontSizeInput.addEventListener('input', () => {
            const dialog = document.getElementById('yt-enhancer-settings');
            if (dialog) dialog.style.fontSize = fontSizeInput.value + 'px';
        });
    }

    // --- Style Editor (полный редактор стилей) ---

    function createStyleEditor() {
        if (document.getElementById('yt-style-editor')) {
            document.getElementById('yt-style-editor').remove();
            return;
        }
        const overlay = document.createElement('div');
        overlay.id = 'yt-style-editor';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 9999999;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Segoe UI','Roboto',Arial,sans-serif;
            animation: fadeIn 0.2s ease;
        `;
        const panel = document.createElement('div');
        panel.style.cssText = `
            background: var(--enhancer-bg, #0f0f0f);
            color: var(--enhancer-fg, #f1f1f1);
            border: 1.5px solid var(--enhancer-border, #272727);
            border-radius: 18px;
            width: 640px; max-width: 96vw; max-height: 90vh;
            overflow-y: auto; padding: 0;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        `;
        // Header
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:18px 22px 14px;border-bottom:1px solid var(--enhancer-border,#272727);position:sticky;top:0;background:inherit;z-index:2;border-radius:18px 18px 0 0;';
        const titleEl = document.createElement('h2');
        titleEl.textContent = L.styleEditorTitle;
        titleEl.style.cssText = 'margin:0;font-size:1.3em;font-weight:700;color:var(--enhancer-fg);';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'yt-enhancer-close-btn';
        closeBtn.textContent = '\u2715';
        closeBtn.style.cssText = 'background:none!important;border:none!important;backdrop-filter:none!important;font-size:1.4em;cursor:pointer;color:var(--enhancer-fg);padding:4px 8px;box-shadow:none!important;';
        // close handler assigned below after _closeStyleEditor is defined
        header.appendChild(titleEl);
        header.appendChild(closeBtn);
        panel.appendChild(header);
        // Tabs
        const tabBar = document.createElement('div');
        tabBar.style.cssText = 'display:flex;gap:0;border-bottom:1px solid var(--enhancer-border,#272727);padding:0 22px;background:inherit;';
        const editorTabNames = [L.styleEditorColors, L.styleEditorPresets, L.styleEditorBackground, L.styleEditorCSS];
        const editorTabs = [];
        const editorPanels = [];

        // Compute theme-aware tab colors once
        const _tKey = config.settingsStyle || 'youtube';
        const _tDark = config.enhancerTheme === 'dark' ||
            (config.enhancerTheme === 'auto' && window.matchMedia('(prefers-color-scheme:dark)').matches);
        const _tP = (_BUILTIN_PRESET_COLORS[_tKey] || _BUILTIN_PRESET_COLORS['youtube'])[_tDark ? 'dark' : 'light'] || {};
        const _tFg  = (_tP.fg      || (_tDark ? '#e8e8e8' : '#222222'));
        const _tPri = (_tP.primary || '#3ea6ff');
        function _c2a(hex, a) {
            if (!hex || hex[0] !== '#' || hex.length < 7) return `rgba(200,200,200,${a})`;
            const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            return `rgba(${r},${g},${b},${a})`;
        }
        const TAB_INACTIVE = _c2a(_tFg, 0.62);
        const TAB_ACTIVE   = _tFg;
        const TAB_SHADOW   = `0 0 10px ${_c2a(_tPri, 0.75)}, 0 0 3px ${_c2a(_tFg, 0.55)}`;
        const TAB_HOVER_SHADOW = `0 0 7px ${_c2a(_tFg, 0.5)}`;

        editorTabNames.forEach((name, i) => {
            const tab = document.createElement('button');
            tab.style.cssText = `background:none!important;border:none!important;border-bottom:3px solid transparent;padding:10px 18px;cursor:pointer;font-weight:600;font-size:1.05em;transition:color 0.15s,background 0.15s;display:flex;align-items:center;gap:6px;border-radius:8px 8px 0 0;`;

            // Active dot indicator
            const dot = document.createElement('span');
            dot.textContent = '●';
            dot.style.cssText = `font-size:0.5em;opacity:0;transition:opacity 0.15s;flex-shrink:0;margin-top:1px;`;
            const labelSpan = document.createElement('span');
            labelSpan.textContent = name;
            tab.appendChild(dot);
            tab.appendChild(labelSpan);

            // setProperty 'important' to always beat any stylesheet rule including YouTube's own CSS
            const INACTIVE_COLOR = TAB_INACTIVE;
            const ACTIVE_COLOR   = TAB_ACTIVE;
            const ACTIVE_SHADOW  = TAB_SHADOW;

            const setActive = () => {
                tab.dataset.tabActive = '1';
                tab.style.setProperty('color', ACTIVE_COLOR, 'important');
                tab.style.setProperty('border-bottom-color', ACTIVE_COLOR, 'important');
                tab.style.setProperty('background', 'none', 'important');
                tab.style.setProperty('text-shadow', ACTIVE_SHADOW, 'important');
                tab.style.fontWeight = '800';
                tab.style.fontSize = '1.1em';
                dot.style.opacity = '1';
            };
            const setInactive = () => {
                tab.dataset.tabActive = '';
                tab.style.setProperty('color', INACTIVE_COLOR, 'important');
                tab.style.setProperty('border-bottom-color', 'transparent', 'important');
                tab.style.setProperty('background', 'none', 'important');
                tab.style.setProperty('text-shadow', 'none', 'important');
                tab.style.fontWeight = '600';
                tab.style.fontSize = '1.05em';
                dot.style.opacity = '0';
            };

            if (i === 0) setActive(); else setInactive();

            const content = document.createElement('div');
            content.style.cssText = `padding:18px 22px;display:${i === 0 ? 'block' : 'none'};`;
            tab.addEventListener('click', () => {
                editorTabs.forEach(t => { if (t !== tab) { t.dataset.tabActive = ''; t.style.setProperty('color', INACTIVE_COLOR, 'important'); t.style.setProperty('border-bottom-color', 'transparent', 'important'); t.style.setProperty('background', 'none', 'important'); t.style.setProperty('text-shadow', 'none', 'important'); t.style.fontWeight = '600'; t.style.fontSize = '1.05em'; t.children[0].style.opacity = '0'; } });
                setActive();
                editorPanels.forEach((p, j) => { p.style.display = j === i ? 'block' : 'none'; });
            });
            tab.addEventListener('mouseenter', () => {
                if (tab.dataset.tabActive) return;
                tab.style.setProperty('color', TAB_ACTIVE, 'important');
                tab.style.setProperty('text-shadow', TAB_HOVER_SHADOW, 'important');
            });
            tab.addEventListener('mouseleave', () => {
                if (tab.dataset.tabActive) return;
                tab.style.setProperty('color', INACTIVE_COLOR, 'important');
                tab.style.setProperty('text-shadow', 'none', 'important');
            });
            editorTabs.push(tab);
            editorPanels.push(content);
            tabBar.appendChild(tab);
        });
        panel.appendChild(tabBar);
        editorPanels.forEach(p => panel.appendChild(p));

        // === TAB 1: Colors ===
        buildColorEditorPanel(editorPanels[0]);

        // === TAB 2: Presets ===
        buildPresetsPanel(editorPanels[1]);

        // === TAB 3: Background ===
        buildBackgroundPanel(editorPanels[2]);

        // === TAB 4: Custom CSS ===
        buildCSSPanel(editorPanels[3]);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Hide main settings when style editor is open; restore on close
        const _mainSettings = document.getElementById('yt-enhancer-settings');
        if (_mainSettings) _mainSettings.style.display = 'none';

        const _closeStyleEditor = () => {
            overlay.remove();
            const ms = document.getElementById('yt-enhancer-settings');
            if (ms) ms.style.display = '';
            else createSettingsUI();
        };

        closeBtn.addEventListener('click', _closeStyleEditor);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) _closeStyleEditor(); });
    }

    // --- Color Editor Panel ---
    function buildColorEditorPanel(container) {
        const cc = config.customColors || {};

        const desc = document.createElement('p');
        desc.textContent = L.customColorsDesc;
        desc.style.cssText = 'font-size:0.9em;color:var(--enhancer-tab-inactive,#888);margin:0 0 14px;';
        container.appendChild(desc);

        // Enable toggle
        const toggleRow = document.createElement('div');
        toggleRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px;';
        const toggleCb = document.createElement('input');
        toggleCb.type = 'checkbox';
        toggleCb.checked = !!config.customColorsEnabled;
        toggleCb.style.cssText = 'width:18px;height:18px;accent-color:var(--enhancer-primary,#3ea6ff);';
        const toggleLabel = document.createElement('span');
        toggleLabel.textContent = L.customColorEnabled;
        toggleLabel.style.cssText = 'font-weight:600;font-size:0.95em;';
        toggleRow.appendChild(toggleCb);
        toggleRow.appendChild(toggleLabel);
        container.appendChild(toggleRow);

        // Wrapper for all color controls (disabled when toggle is off)
        const controlsWrapper = document.createElement('div');
        function updateControlsState(enabled) {
            controlsWrapper.style.opacity = enabled ? '1' : '0.35';
            controlsWrapper.style.pointerEvents = enabled ? 'auto' : 'none';
            controlsWrapper.style.filter = enabled ? 'none' : 'grayscale(0.6)';
        }
        controlsWrapper.style.cssText = 'transition:opacity 0.25s,filter 0.25s;';
        updateControlsState(!!config.customColorsEnabled);

        // Pre-populate from current theme preset as defaults
        const themeKey = config.settingsStyle || 'youtube';
        const isDarkMode = config.enhancerTheme === 'dark' ||
            (config.enhancerTheme === 'auto' && window.matchMedia('(prefers-color-scheme:dark)').matches);
        const themePreset = (_BUILTIN_PRESET_COLORS[themeKey] || _BUILTIN_PRESET_COLORS['youtube'])[isDarkMode ? 'dark' : 'light'] || {};

        // Color grid (4 columns)
        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;';

        const colorFields = [
            ['bg', L.customColorBg], ['fg', L.customColorFg], ['primary', L.customColorPrimary], ['border', L.customColorBorder],
            ['btnBorder', L.customColorBtnBorder], ['btnFg', L.customColorBtnFg], ['btnHoverBg', L.customColorBtnHoverBg], ['btnHoverFg', L.customColorBtnHoverFg],
            ['badgeBg', L.customColorBadgeBg], ['badgeFg', L.customColorBadgeFg],
            ['inputBg', L.customColorInputBg], ['inputFg', L.customColorInputFg], ['inputBorder', L.customColorInputBorder],
            ['selectBg', L.customColorSelectBg], ['selectFg', L.customColorSelectFg], ['selectBorder', L.customColorSelectBorder]
        ];

        // Helper: parse any CSS color string → { hex, alpha }
        function parseColorForPicker(str) {
            if (!str) return { hex: '#000000', alpha: 1 };
            const rgbaM = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
            if (rgbaM) {
                const r = +rgbaM[1], g = +rgbaM[2], b = +rgbaM[3];
                const a = rgbaM[4] !== undefined ? parseFloat(rgbaM[4]) : 1;
                return { hex: '#' + [r,g,b].map(v => Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join(''), alpha: a };
            }
            if (/^#[0-9a-f]{8}$/i.test(str)) {
                return { hex: str.slice(0,7), alpha: parseInt(str.slice(7,9),16)/255 };
            }
            if (/^#[0-9a-f]{6}$/i.test(str)) return { hex: str, alpha: 1 };
            const d = document.createElement('div');
            d.style.color = str;
            document.body.appendChild(d);
            const computed = getComputedStyle(d).color;
            d.remove();
            const m = computed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
            if (m) {
                const r = +m[1], g = +m[2], b = +m[3];
                const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
                return { hex: '#' + [r,g,b].map(v => Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join(''), alpha: a };
            }
            return { hex: '#000000', alpha: 1 };
        }

        function buildColorValue(hex, alpha) {
            if (alpha >= 0.999) return hex;
            const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + parseFloat(alpha.toFixed(3)) + ')';
        }

        const colorInputs = {};
        colorFields.forEach(([key, label]) => {
            const rawVal = cc[key] || themePreset[key] || '';
            const { hex: initHex, alpha: initAlpha } = parseColorForPicker(rawVal);
            const cell = document.createElement('div');
            cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;border-radius:10px;background:var(--enhancer-input-bg,#1f1f1f);border:1px solid var(--enhancer-input-border,#333);transition:all 0.2s;';
            // Color + text input row
            const colorRow = document.createElement('div');
            colorRow.style.cssText = 'display:flex;align-items:center;gap:4px;width:100%;';
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = initHex;
            colorInput.dataset.colorKey = key;
            colorInput.style.cssText = 'width:32px;height:26px;border:none;border-radius:6px;cursor:pointer;padding:0;background:none;flex-shrink:0;';
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = rawVal;
            textInput.placeholder = '#hex / rgba()';
            textInput.style.cssText = 'flex:1;min-width:0;padding:3px 5px;font-size:0.7em;border-radius:5px;border:1px solid var(--enhancer-input-border,#333);background:var(--enhancer-input-bg,#1a1a1a);color:var(--enhancer-input-fg,#ccc);font-family:monospace;';
            colorRow.appendChild(colorInput);
            colorRow.appendChild(textInput);
            // Alpha slider row
            const alphaRow = document.createElement('div');
            alphaRow.style.cssText = 'display:flex;align-items:center;gap:4px;width:100%;';
            const alphaSlider = document.createElement('input');
            alphaSlider.type = 'range';
            alphaSlider.min = '0'; alphaSlider.max = '100'; alphaSlider.step = '1';
            alphaSlider.value = String(Math.round(initAlpha * 100));
            alphaSlider.style.cssText = 'flex:1;height:4px;cursor:pointer;accent-color:var(--enhancer-primary,#3ea6ff);';
            const alphaVal = document.createElement('span');
            alphaVal.textContent = Math.round(initAlpha * 100) + '%';
            alphaVal.style.cssText = 'font-size:0.65em;min-width:28px;text-align:right;opacity:0.7;font-family:monospace;';
            alphaRow.appendChild(alphaSlider);
            alphaRow.appendChild(alphaVal);
            const lbl = document.createElement('span');
            lbl.textContent = label;
            lbl.style.cssText = 'font-size:0.72em;text-align:center;opacity:0.8;line-height:1.2;';
            const clearBtn = document.createElement('span');
            clearBtn.textContent = '\u2715';
            clearBtn.style.cssText = 'cursor:pointer;font-size:0.6em;opacity:0.4;transition:opacity 0.15s;';
            clearBtn.addEventListener('mouseenter', () => { clearBtn.style.opacity = '1'; });
            clearBtn.addEventListener('mouseleave', () => { clearBtn.style.opacity = '0.4'; });
            clearBtn.addEventListener('click', () => {
                colorInput.value = '#000000';
                textInput.value = '';
                alphaSlider.value = '100';
                alphaVal.textContent = '100%';
                cc[key] = '';
                config.customColors = cc;
                storage.set('ytEnhancerConfig', config);
                if (config.customColorsEnabled) applyGlobalStyles();
            });
            const updateFromPicker = () => {
                const a = parseInt(alphaSlider.value) / 100;
                const val = buildColorValue(colorInput.value, a);
                textInput.value = val;
                cc[key] = val;
                config.customColors = cc;
                storage.set('ytEnhancerConfig', config);
                if (config.customColorsEnabled) applyGlobalStyles();
            };
            colorInput.addEventListener('input', updateFromPicker);
            alphaSlider.addEventListener('input', () => {
                alphaVal.textContent = alphaSlider.value + '%';
                updateFromPicker();
            });
            textInput.addEventListener('change', () => {
                const v = textInput.value.trim();
                cc[key] = v;
                config.customColors = cc;
                const { hex, alpha } = parseColorForPicker(v);
                colorInput.value = hex;
                alphaSlider.value = String(Math.round(alpha * 100));
                alphaVal.textContent = Math.round(alpha * 100) + '%';
                storage.set('ytEnhancerConfig', config);
                if (config.customColorsEnabled) applyGlobalStyles();
            });
            colorInputs[key] = { colorInput, textInput, alphaSlider, alphaVal };
            cell.appendChild(colorRow);
            cell.appendChild(alphaRow);
            cell.appendChild(lbl);
            cell.appendChild(clearBtn);
            grid.appendChild(cell);
        });
        controlsWrapper.appendChild(grid);

        // Action buttons row
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;';

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = L.customColorReset;
        resetBtn.style.cssText = 'padding:8px 18px;font-size:0.9em;cursor:pointer;';
        resetBtn.addEventListener('click', () => {
            Object.keys(cc).forEach(k => { cc[k] = ''; });
            Object.values(colorInputs).forEach(({ colorInput, textInput, alphaSlider, alphaVal }) => {
                colorInput.value = '#000000'; textInput.value = '';
                alphaSlider.value = '100'; alphaVal.textContent = '100%';
            });
            config.customColors = cc;
            config.customColorsEnabled = false;
            toggleCb.checked = false;
            updateControlsState(false);
            storage.set('ytEnhancerConfig', config);
            applyGlobalStyles();
        });
        btnRow.appendChild(resetBtn);

        // Load from current theme button
        const loadBtn = document.createElement('button');
        loadBtn.textContent = L.customColorLoadFromTheme || '\u21ba Load from theme';
        loadBtn.style.cssText = 'padding:8px 18px;font-size:0.9em;cursor:pointer;';
        loadBtn.addEventListener('click', () => {
            colorFields.forEach(([key]) => {
                const val = themePreset[key] || '';
                cc[key] = val;
                const { hex, alpha } = parseColorForPicker(val);
                colorInputs[key].colorInput.value = hex;
                colorInputs[key].textInput.value = val;
                colorInputs[key].alphaSlider.value = String(Math.round(alpha * 100));
                colorInputs[key].alphaVal.textContent = Math.round(alpha * 100) + '%';
            });
            config.customColors = cc;
            storage.set('ytEnhancerConfig', config);
            if (config.customColorsEnabled) applyGlobalStyles();
        });
        btnRow.appendChild(loadBtn);

        controlsWrapper.appendChild(btnRow);
        container.appendChild(controlsWrapper);

        toggleCb.addEventListener('change', () => {
            config.customColorsEnabled = toggleCb.checked;
            updateControlsState(toggleCb.checked);
            storage.set('ytEnhancerConfig', config);
            applyGlobalStyles();
        });
    }

    // --- Built-in theme color maps ---
    const _BUILTIN_PRESET_COLORS = {
        youtube: {
            dark: { bg:'#0f0f0f', fg:'#f1f1f1', border:'#272727', primary:'#ff0000', btnBorder:'#333', btnFg:'#f1f1f1', btnHoverBg:'#272727', btnHoverFg:'#f1f1f1', badgeBg:'rgba(255,0,0,0.12)', badgeFg:'#ff4444', inputBg:'#272727', inputFg:'#f1f1f1', inputBorder:'#3f3f3f', selectBg:'#272727', selectFg:'#f1f1f1', selectBorder:'#3f3f3f' },
            light: { bg:'#ffffff', fg:'#0f0f0f', border:'#e5e5e5', primary:'#cc0000', btnBorder:'#d6d6d6', btnFg:'#0f0f0f', btnHoverBg:'#f2f2f2', btnHoverFg:'#0f0f0f', badgeBg:'rgba(204,0,0,0.08)', badgeFg:'#cc0000', inputBg:'#f2f2f2', inputFg:'#0f0f0f', inputBorder:'#d6d6d6', selectBg:'#f2f2f2', selectFg:'#0f0f0f', selectBorder:'#d6d6d6' }
        },
        improved: {
            dark: { bg:'rgba(15,15,15,0.92)', fg:'#f1f1f1', border:'rgba(62,166,255,0.12)', primary:'#3ea6ff', btnBorder:'#3ea6ff', btnFg:'#3ea6ff', btnHoverBg:'#3ea6ff', btnHoverFg:'#000000', badgeBg:'rgba(62,166,255,0.15)', badgeFg:'#3ea6ff', inputBg:'rgba(255,255,255,0.06)', inputFg:'#f1f1f1', inputBorder:'rgba(255,255,255,0.1)', selectBg:'rgba(255,255,255,0.08)', selectFg:'#f1f1f1', selectBorder:'rgba(255,255,255,0.12)' },
            light: { bg:'rgba(255,255,255,0.92)', fg:'#0f0f0f', border:'rgba(6,95,212,0.1)', primary:'#065fd4', btnBorder:'#065fd4', btnFg:'#065fd4', btnHoverBg:'#065fd4', btnHoverFg:'#ffffff', badgeBg:'rgba(6,95,212,0.06)', badgeFg:'#065fd4', inputBg:'rgba(0,0,0,0.03)', inputFg:'#0f0f0f', inputBorder:'rgba(0,0,0,0.08)', selectBg:'rgba(0,0,0,0.04)', selectFg:'#0f0f0f', selectBorder:'rgba(0,0,0,0.1)' }
        },
        midnight: {
            dark: { bg:'#0d1117', fg:'#e6edf3', border:'#21262d', primary:'#a855f7', btnBorder:'#a855f7', btnFg:'#a855f7', btnHoverBg:'#a855f7', btnHoverFg:'#ffffff', badgeBg:'rgba(168,85,247,0.15)', badgeFg:'#a855f7', inputBg:'#161b22', inputFg:'#e6edf3', inputBorder:'#30363d', selectBg:'#161b22', selectFg:'#e6edf3', selectBorder:'#30363d' },
            light: { bg:'#f8f7ff', fg:'#1e1b3a', border:'#e0ddf5', primary:'#7c3aed', btnBorder:'#7c3aed', btnFg:'#7c3aed', btnHoverBg:'#7c3aed', btnHoverFg:'#ffffff', badgeBg:'rgba(124,58,237,0.08)', badgeFg:'#7c3aed', inputBg:'#f0eefa', inputFg:'#1e1b3a', inputBorder:'#d6d3f0', selectBg:'#f8f7ff', selectFg:'#1e1b3a', selectBorder:'#d6d3f0' }
        },
        sunset: {
            dark: { bg:'#1a1412', fg:'#fef3c7', border:'#44332a', primary:'#f59e0b', btnBorder:'#f59e0b', btnFg:'#f59e0b', btnHoverBg:'#f59e0b', btnHoverFg:'#1a1412', badgeBg:'rgba(245,158,11,0.15)', badgeFg:'#f59e0b', inputBg:'#241c17', inputFg:'#fef3c7', inputBorder:'#4a3628', selectBg:'#241c17', selectFg:'#fef3c7', selectBorder:'#4a3628' },
            light: { bg:'#fffbeb', fg:'#451a03', border:'#fed7aa', primary:'#d97706', btnBorder:'#d97706', btnFg:'#d97706', btnHoverBg:'#d97706', btnHoverFg:'#ffffff', badgeBg:'rgba(217,119,6,0.08)', badgeFg:'#d97706', inputBg:'#fff8e1', inputFg:'#451a03', inputBorder:'#fde68a', selectBg:'#fffbeb', selectFg:'#451a03', selectBorder:'#fde68a' }
        },
        ocean: {
            dark: { bg:'#0a1628', fg:'#cff4fc', border:'#0e2a45', primary:'#06b6d4', btnBorder:'#06b6d4', btnFg:'#06b6d4', btnHoverBg:'#06b6d4', btnHoverFg:'#0a1628', badgeBg:'rgba(6,182,212,0.15)', badgeFg:'#06b6d4', inputBg:'#0d1f38', inputFg:'#cff4fc', inputBorder:'#1a3a55', selectBg:'#0d1f38', selectFg:'#cff4fc', selectBorder:'#1a3a55' },
            light: { bg:'#f0f9ff', fg:'#0c4a6e', border:'#bae6fd', primary:'#0891b2', btnBorder:'#0891b2', btnFg:'#0891b2', btnHoverBg:'#0891b2', btnHoverFg:'#ffffff', badgeBg:'rgba(8,145,178,0.08)', badgeFg:'#0891b2', inputBg:'#e0f2fe', inputFg:'#0c4a6e', inputBorder:'#7dd3fc', selectBg:'#f0f9ff', selectFg:'#0c4a6e', selectBorder:'#7dd3fc' }
        },
        emerald: {
            dark: { bg:'#0a1f0f', fg:'#d1fae5', border:'#134e22', primary:'#10b981', btnBorder:'#10b981', btnFg:'#10b981', btnHoverBg:'#10b981', btnHoverFg:'#0a1f0f', badgeBg:'rgba(16,185,129,0.15)', badgeFg:'#10b981', inputBg:'#0f2918', inputFg:'#d1fae5', inputBorder:'#1a4a28', selectBg:'#0f2918', selectFg:'#d1fae5', selectBorder:'#1a4a28' },
            light: { bg:'#f0fdf4', fg:'#14532d', border:'#bbf7d0', primary:'#059669', btnBorder:'#059669', btnFg:'#059669', btnHoverBg:'#059669', btnHoverFg:'#ffffff', badgeBg:'rgba(5,150,105,0.08)', badgeFg:'#059669', inputBg:'#dcfce7', inputFg:'#14532d', inputBorder:'#86efac', selectBg:'#f0fdf4', selectFg:'#14532d', selectBorder:'#86efac' }
        },
        rose: {
            dark: { bg:'#1a0a0f', fg:'#ffe4e6', border:'#3f1220', primary:'#f43f5e', btnBorder:'#f43f5e', btnFg:'#f43f5e', btnHoverBg:'#f43f5e', btnHoverFg:'#1a0a0f', badgeBg:'rgba(244,63,94,0.15)', badgeFg:'#f43f5e', inputBg:'#27101a', inputFg:'#ffe4e6', inputBorder:'#5a1a2a', selectBg:'#27101a', selectFg:'#ffe4e6', selectBorder:'#5a1a2a' },
            light: { bg:'#fff1f2', fg:'#4c0519', border:'#fecdd3', primary:'#e11d48', btnBorder:'#e11d48', btnFg:'#e11d48', btnHoverBg:'#e11d48', btnHoverFg:'#ffffff', badgeBg:'rgba(225,29,72,0.08)', badgeFg:'#e11d48', inputBg:'#ffe4e6', inputFg:'#4c0519', inputBorder:'#fda4af', selectBg:'#fff1f2', selectFg:'#4c0519', selectBorder:'#fda4af' }
        },
        darkpink: {
            dark: { bg:'#000000', fg:'#ffffff', border:'rgba(255,105,180,0.2)', primary:'#ff69b4', btnBorder:'#ff69b4', btnFg:'#ff69b4', btnHoverBg:'#ff69b4', btnHoverFg:'#000000', badgeBg:'rgba(255,105,180,0.2)', badgeFg:'#ff69b4', inputBg:'#18121e', inputFg:'#ffffff', inputBorder:'rgba(255,105,180,0.4)', selectBg:'#18121e', selectFg:'#ffffff', selectBorder:'rgba(255,105,180,0.4)' },
            light: { bg:'#fff0f8', fg:'#6b0038', border:'rgba(255,105,180,0.25)', primary:'#d6006a', btnBorder:'#d6006a', btnFg:'#d6006a', btnHoverBg:'#d6006a', btnHoverFg:'#ffffff', badgeBg:'rgba(214,0,106,0.08)', badgeFg:'#d6006a', inputBg:'#ffe8f5', inputFg:'#6b0038', inputBorder:'rgba(255,105,180,0.35)', selectBg:'#fff0f8', selectFg:'#6b0038', selectBorder:'rgba(255,105,180,0.3)' }
        },
        frost: {
            dark: { bg:'#0f1a2e', fg:'#dce8ff', border:'rgba(59,130,246,0.2)', primary:'#3b82f6', btnBorder:'#3b82f6', btnFg:'#3b82f6', btnHoverBg:'#3b82f6', btnHoverFg:'#ffffff', badgeBg:'rgba(59,130,246,0.15)', badgeFg:'#3b82f6', inputBg:'#162240', inputFg:'#dce8ff', inputBorder:'rgba(59,130,246,0.3)', selectBg:'#162240', selectFg:'#dce8ff', selectBorder:'rgba(59,130,246,0.3)' },
            light: { bg:'#f8fafc', fg:'#1e293b', border:'rgba(203,213,225,0.6)', primary:'#2563eb', btnBorder:'#2563eb', btnFg:'#2563eb', btnHoverBg:'#2563eb', btnHoverFg:'#ffffff', badgeBg:'rgba(59,130,246,0.1)', badgeFg:'#2563eb', inputBg:'#ffffff', inputFg:'#1e293b', inputBorder:'rgba(203,213,225,0.8)', selectBg:'#ffffff', selectFg:'#1e293b', selectBorder:'rgba(203,213,225,0.8)' }
        },
        sky: {
            dark: { bg:'#051929', fg:'#e0f4ff', border:'rgba(14,165,233,0.2)', primary:'#0ea5e9', btnBorder:'#0ea5e9', btnFg:'#0ea5e9', btnHoverBg:'#0ea5e9', btnHoverFg:'#051929', badgeBg:'rgba(14,165,233,0.15)', badgeFg:'#0ea5e9', inputBg:'#081f36', inputFg:'#e0f4ff', inputBorder:'rgba(14,165,233,0.3)', selectBg:'#081f36', selectFg:'#e0f4ff', selectBorder:'rgba(14,165,233,0.3)' },
            light: { bg:'#f0f9ff', fg:'#0369a1', border:'rgba(186,230,253,0.6)', primary:'#0284c7', btnBorder:'#38bdf8', btnFg:'#0284c7', btnHoverBg:'#0284c7', btnHoverFg:'#ffffff', badgeBg:'rgba(56,189,248,0.2)', badgeFg:'#0284c7', inputBg:'#ffffff', inputFg:'#0369a1', inputBorder:'rgba(186,230,253,0.8)', selectBg:'#ffffff', selectFg:'#0369a1', selectBorder:'rgba(186,230,253,0.8)' }
        },
        classic: {
            dark: { bg:'#111111', fg:'#e5e7eb', border:'rgba(209,213,219,0.15)', primary:'#6b7280', btnBorder:'#6b7280', btnFg:'#d1d5db', btnHoverBg:'#374151', btnHoverFg:'#f9fafb', badgeBg:'rgba(156,163,175,0.15)', badgeFg:'#9ca3af', inputBg:'#1f1f1f', inputFg:'#e5e7eb', inputBorder:'rgba(209,213,219,0.2)', selectBg:'#1f1f1f', selectFg:'#e5e7eb', selectBorder:'rgba(209,213,219,0.2)' },
            light: { bg:'#ffffff', fg:'#1f2937', border:'rgba(209,213,219,0.6)', primary:'#4b5563', btnBorder:'#9ca3af', btnFg:'#4b5563', btnHoverBg:'#4b5563', btnHoverFg:'#ffffff', badgeBg:'rgba(156,163,175,0.1)', badgeFg:'#4b5563', inputBg:'#f9fafb', inputFg:'#1f2937', inputBorder:'rgba(209,213,219,0.8)', selectBg:'#f9fafb', selectFg:'#1f2937', selectBorder:'rgba(209,213,219,0.8)' }
        },
        aurora: {
            dark: { bg:'#030d12', fg:'#d4f5ee', border:'rgba(0,229,204,0.15)', primary:'#00e5cc', btnBorder:'#00e5cc', btnFg:'#00e5cc', btnHoverBg:'#00e5cc', btnHoverFg:'#030d12', badgeBg:'rgba(0,229,204,0.15)', badgeFg:'#00e5cc', inputBg:'#051820', inputFg:'#d4f5ee', inputBorder:'rgba(0,229,204,0.2)', selectBg:'#051820', selectFg:'#d4f5ee', selectBorder:'rgba(0,229,204,0.22)' },
            light: { bg:'rgba(240,255,254,0.98)', fg:'#043237', border:'rgba(6,148,162,0.18)', primary:'#0694a2', btnBorder:'#0694a2', btnFg:'#0694a2', btnHoverBg:'#0694a2', btnHoverFg:'#ffffff', badgeBg:'rgba(6,148,162,0.08)', badgeFg:'#0694a2', inputBg:'rgba(224,255,252,0.9)', inputFg:'#043237', inputBorder:'rgba(6,148,162,0.2)', selectBg:'rgba(240,255,254,0.95)', selectFg:'#043237', selectBorder:'rgba(6,148,162,0.22)' }
        }
    };

    // --- Presets Panel ---
    function buildPresetsPanel(container) {
        const presets = config.stylePresets || {};

        // === Built-in themes ===
        const builtinHeader = document.createElement('h3');
        builtinHeader.textContent = L.builtinPresets;
        builtinHeader.style.cssText = 'margin:0 0 12px;font-size:1em;font-weight:700;';
        container.appendChild(builtinHeader);

        const builtinGrid = document.createElement('div');
        builtinGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin-bottom:20px;';

        const builtinThemes = [
            { key: 'youtube', label: L.styleYoutube },
            { key: 'improved', label: L.styleImproved },
            { key: 'midnight', label: L.styleMidnight },
            { key: 'sunset', label: L.styleSunset },
            { key: 'ocean', label: L.styleOcean },
            { key: 'emerald', label: L.styleEmerald },
            { key: 'rose', label: L.styleRose },
            { key: 'darkpink', label: L.styleDarkPink },
            { key: 'frost', label: L.styleFrost },
            { key: 'sky', label: L.styleSky },
            { key: 'classic', label: L.styleClassic },
            { key: 'aurora', label: L.styleAurora }
        ];

        const builtinCards = [];

        builtinThemes.forEach(({ key, label }) => {
            const colors = _BUILTIN_PRESET_COLORS[key]?.dark || {};
            const card = document.createElement('div');
            card.dataset.themeKey = key;
            card.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;border-radius:12px;border:1.5px solid var(--enhancer-input-border,#333);background:var(--enhancer-input-bg,#1f1f1f);cursor:pointer;transition:all 0.2s;`;
            if (config.settingsStyle === key) card.style.borderColor = 'var(--enhancer-primary,#3ea6ff)';
            const dots = document.createElement('div');
            dots.style.cssText = 'display:flex;gap:4px;';
            ['bg', 'primary', 'fg', 'border'].forEach(ck => {
                const d = document.createElement('span');
                const c = colors[ck] || '#888';
                d.style.cssText = `width:14px;height:14px;border-radius:50%;background:${c};border:1px solid rgba(255,255,255,0.15);`;
                dots.appendChild(d);
            });
            const lbl = document.createElement('span');
            lbl.textContent = label;
            lbl.style.cssText = 'font-size:0.85em;font-weight:600;';
            card.appendChild(dots);
            card.appendChild(lbl);
            card.addEventListener('click', () => {
                config.settingsStyle = key;
                config.customColorsEnabled = false;
                storage.set('ytEnhancerConfig', config);
                applyGlobalStyles();
                // Update active card highlight
                builtinCards.forEach(c => {
                    c.style.borderColor = c.dataset.themeKey === key ? 'var(--enhancer-primary,#3ea6ff)' : 'var(--enhancer-input-border,#333)';
                });
                showNotification(L.presetSaved);
            });
            card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-2px)'; });
            card.addEventListener('mouseleave', () => { card.style.transform = 'none'; });
            builtinCards.push(card);
            builtinGrid.appendChild(card);
        });
        container.appendChild(builtinGrid);

        // === User presets ===
        // Save preset
        const saveRow = document.createElement('div');
        saveRow.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;align-items:center;';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = L.presetNamePlaceholder;
        nameInput.style.cssText = 'flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--enhancer-input-border,#333);background:var(--enhancer-input-bg,#1f1f1f);color:var(--enhancer-input-fg,#f1f1f1);font-size:0.95em;';
        const saveBtn = document.createElement('button');
        saveBtn.textContent = L.presetSave;
        saveBtn.style.cssText = 'padding:8px 16px;font-size:0.9em;cursor:pointer;white-space:nowrap;';
        saveRow.appendChild(nameInput);
        saveRow.appendChild(saveBtn);
        container.appendChild(saveRow);

        // List of presets
        const listContainer = document.createElement('div');
        listContainer.style.cssText = 'margin-bottom:16px;';

        const renderPresetList = () => {
            while (listContainer.firstChild) listContainer.removeChild(listContainer.firstChild);
            const names = Object.keys(config.stylePresets || {});
            if (!names.length) {
                const empty = document.createElement('p');
                empty.textContent = L.presetNoPresets;
                empty.style.cssText = 'font-size:0.9em;color:var(--enhancer-tab-inactive,#888);text-align:center;padding:20px;';
                listContainer.appendChild(empty);
                return;
            }
            names.forEach(name => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--enhancer-input-border,#333);border-radius:10px;margin-bottom:6px;background:var(--enhancer-input-bg,#1f1f1f);';
                const nameLbl = document.createElement('span');
                nameLbl.textContent = name;
                nameLbl.style.cssText = 'flex:1;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
                // Preview dots
                const preset = config.stylePresets[name];
                if (preset && preset.customColors) {
                    const dots = document.createElement('span');
                    dots.style.cssText = 'display:flex;gap:3px;';
                    ['bg', 'primary', 'fg'].forEach(k => {
                        if (preset.customColors[k]) {
                            const dot = document.createElement('span');
                            dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${preset.customColors[k]};border:1px solid rgba(255,255,255,0.1);`;
                            dots.appendChild(dot);
                        }
                    });
                    nameLbl.appendChild(dots);
                }
                const loadBtn = document.createElement('button');
                loadBtn.textContent = L.presetLoad;
                loadBtn.style.cssText = 'padding:4px 10px;font-size:0.8em;cursor:pointer;';
                loadBtn.addEventListener('click', () => {
                    const p = config.stylePresets[name];
                    if (p) {
                        if (p.customColors) { config.customColors = {...p.customColors}; }
                        if (p.customColorsEnabled !== undefined) config.customColorsEnabled = p.customColorsEnabled;
                        if (p.settingsStyle) config.settingsStyle = p.settingsStyle;
                        if (p.enhancerTheme) config.enhancerTheme = p.enhancerTheme;
                        if (p.bgImage !== undefined) config.bgImage = p.bgImage;
                        if (p.bgTarget) config.bgTarget = p.bgTarget;
                        if (p.bgOpacity !== undefined) config.bgOpacity = p.bgOpacity;
                        if (p.bgBlur !== undefined) config.bgBlur = p.bgBlur;
                        if (p.bgSize) config.bgSize = p.bgSize;
                        if (p.userCSS !== undefined) config.userCSS = p.userCSS;
                        storage.set('ytEnhancerConfig', config);
                        applyGlobalStyles();
                        showNotification(L.presetSaved);
                        document.getElementById('yt-style-editor')?.remove();
                    }
                });
                const exportBtn = document.createElement('button');
                exportBtn.textContent = L.presetExport;
                exportBtn.style.cssText = 'padding:4px 10px;font-size:0.8em;cursor:pointer;';
                exportBtn.addEventListener('click', () => {
                    const p = config.stylePresets[name];
                    if (p) {
                        navigator.clipboard.writeText(JSON.stringify({name, ...p})).then(() => {
                            showNotification(L.presetExported);
                        });
                    }
                });
                const delBtn = document.createElement('button');
                delBtn.textContent = L.presetDelete;
                delBtn.style.cssText = 'padding:4px 10px;font-size:0.8em;cursor:pointer;color:#ff4444;';
                delBtn.addEventListener('click', () => {
                    delete config.stylePresets[name];
                    storage.set('ytEnhancerConfig', config);
                    renderPresetList();
                    showNotification(L.presetDeleted);
                });
                row.appendChild(nameLbl);
                row.appendChild(loadBtn);
                row.appendChild(exportBtn);
                row.appendChild(delBtn);
                listContainer.appendChild(row);
            });
        };
        renderPresetList();
        container.appendChild(listContainer);

        saveBtn.addEventListener('click', () => {
            const pName = nameInput.value.trim();
            if (!pName) return;
            if (!config.stylePresets) config.stylePresets = {};
            config.stylePresets[pName] = {
                customColors: {...(config.customColors || {})},
                customColorsEnabled: !!config.customColorsEnabled,
                settingsStyle: config.settingsStyle || 'youtube',
                enhancerTheme: config.enhancerTheme || 'auto',
                bgImage: config.bgImage || '',
                bgTarget: config.bgTarget || 'settings',
                bgOpacity: config.bgOpacity ?? 0.15,
                bgBlur: config.bgBlur ?? 0,
                bgSize: config.bgSize || 'cover',
                userCSS: config.userCSS || ''
            };
            storage.set('ytEnhancerConfig', config);
            nameInput.value = '';
            renderPresetList();
            showNotification(L.presetSaved);
        });

        // Import button
        const importBtn = document.createElement('button');
        importBtn.textContent = L.presetImport;
        importBtn.style.cssText = 'padding:8px 16px;font-size:0.9em;cursor:pointer;margin-top:8px;';
        importBtn.addEventListener('click', () => {
            const jsonStr = prompt(L.presetImportPrompt);
            if (!jsonStr) return;
            try {
                const data = JSON.parse(jsonStr);
                if (!data || typeof data !== 'object') throw new Error('invalid');
                const pName = data.name || 'Imported ' + Date.now();
                delete data.name;
                if (!config.stylePresets) config.stylePresets = {};
                config.stylePresets[pName] = data;
                storage.set('ytEnhancerConfig', config);
                renderPresetList();
                showNotification(L.presetImported);
            } catch (e) {
                showNotification(L.presetImportError);
            }
        });
        container.appendChild(importBtn);
    }

    // --- Background Panel ---
    function buildBackgroundPanel(container) {
        const desc = document.createElement('p');
        desc.textContent = L.bgDesc;
        desc.style.cssText = 'font-size:0.9em;color:var(--enhancer-tab-inactive,#888);margin:0 0 14px;';
        container.appendChild(desc);

        // URL input
        const urlRow = document.createElement('div');
        urlRow.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;';
        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = L.bgUrlPlaceholder;
        urlInput.value = config.bgImage || '';
        urlInput.style.cssText = 'flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--enhancer-input-border,#333);background:var(--enhancer-input-bg,#1f1f1f);color:var(--enhancer-input-fg,#f1f1f1);font-size:0.9em;';
        urlRow.appendChild(urlInput);
        container.appendChild(urlRow);

        // Target selector
        const targetRow = document.createElement('div');
        targetRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';
        const targetLabel = document.createElement('span');
        targetLabel.textContent = L.bgTarget + ':';
        targetLabel.style.cssText = 'font-weight:500;font-size:0.9em;';
        const targetSelect = document.createElement('select');
        targetSelect.style.cssText = 'padding:6px 10px;border-radius:8px;border:1px solid var(--enhancer-select-border,#333);background:var(--enhancer-select-bg,#1f1f1f);color:var(--enhancer-select-fg,#f1f1f1);font-size:0.9em;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'%23888\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px;';
        [{v:'settings',l:L.bgTargetSettings},{v:'page',l:L.bgTargetPage}].forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.v; opt.textContent = o.l;
            if ((config.bgTarget || 'settings') === o.v) opt.selected = true;
            targetSelect.appendChild(opt);
        });
        targetRow.appendChild(targetLabel);
        targetRow.appendChild(targetSelect);
        container.appendChild(targetRow);

        // Opacity slider
        const opacRow = document.createElement('div');
        opacRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';
        const opacLabel = document.createElement('span');
        opacLabel.textContent = L.bgOpacity + ':';
        opacLabel.style.cssText = 'font-weight:500;font-size:0.9em;min-width:100px;';
        const opacSlider = document.createElement('input');
        opacSlider.type = 'range';
        opacSlider.min = '0'; opacSlider.max = '1'; opacSlider.step = '0.05';
        opacSlider.value = config.bgOpacity ?? 0.15;
        opacSlider.style.cssText = 'flex:1;accent-color:var(--enhancer-primary,#3ea6ff);';
        const opacVal = document.createElement('span');
        opacVal.textContent = opacSlider.value;
        opacVal.style.cssText = 'font-size:0.85em;min-width:32px;';
        opacSlider.addEventListener('input', () => { opacVal.textContent = opacSlider.value; });
        opacRow.appendChild(opacLabel);
        opacRow.appendChild(opacSlider);
        opacRow.appendChild(opacVal);
        container.appendChild(opacRow);

        // Blur slider
        const blurRow = document.createElement('div');
        blurRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';
        const blurLabel = document.createElement('span');
        blurLabel.textContent = L.bgBlur + ':';
        blurLabel.style.cssText = 'font-weight:500;font-size:0.9em;min-width:100px;';
        const blurSlider = document.createElement('input');
        blurSlider.type = 'range';
        blurSlider.min = '0'; blurSlider.max = '50'; blurSlider.step = '1';
        blurSlider.value = config.bgBlur ?? 0;
        blurSlider.style.cssText = 'flex:1;accent-color:var(--enhancer-primary,#3ea6ff);';
        const blurVal = document.createElement('span');
        blurVal.textContent = blurSlider.value + 'px';
        blurVal.style.cssText = 'font-size:0.85em;min-width:40px;';
        blurSlider.addEventListener('input', () => { blurVal.textContent = blurSlider.value + 'px'; });
        blurRow.appendChild(blurLabel);
        blurRow.appendChild(blurSlider);
        blurRow.appendChild(blurVal);
        container.appendChild(blurRow);

        // Size selector
        const sizeRow = document.createElement('div');
        sizeRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px;';
        const sizeLabel = document.createElement('span');
        sizeLabel.textContent = L.bgSize + ':';
        sizeLabel.style.cssText = 'font-weight:500;font-size:0.9em;';
        const sizeSelect = document.createElement('select');
        sizeSelect.style.cssText = 'padding:6px 10px;border-radius:8px;border:1px solid var(--enhancer-select-border,#333);background:var(--enhancer-select-bg,#1f1f1f);color:var(--enhancer-select-fg,#f1f1f1);font-size:0.9em;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'%23888\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px;';
        [{v:'cover',l:L.bgSizeCover},{v:'contain',l:L.bgSizeContain},{v:'auto',l:L.bgSizeAuto}].forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.v; opt.textContent = o.l;
            if ((config.bgSize || 'cover') === o.v) opt.selected = true;
            sizeSelect.appendChild(opt);
        });
        sizeRow.appendChild(sizeLabel);
        sizeRow.appendChild(sizeSelect);
        container.appendChild(sizeRow);

        // Preview
        const preview = document.createElement('div');
        preview.style.cssText = 'width:100%;height:120px;border-radius:12px;border:1px solid var(--enhancer-border,#333);margin-bottom:16px;overflow:hidden;position:relative;';
        const updatePreview = () => {
            const url = urlInput.value.trim();
            if (url) {
                const sanitized = url.replace(/['"<>]/g, '');
                preview.style.background = `url("${sanitized}") center/${sizeSelect.value} no-repeat`;
                preview.style.opacity = opacSlider.value;
                preview.style.filter = `blur(${blurSlider.value}px)`;
            } else {
                preview.style.background = 'var(--enhancer-input-bg,#1f1f1f)';
                preview.style.opacity = '1';
                preview.style.filter = 'none';
            }
        };
        updatePreview();
        [urlInput, opacSlider, blurSlider, sizeSelect].forEach(el => el.addEventListener('input', updatePreview));
        sizeSelect.addEventListener('change', updatePreview);
        container.appendChild(preview);

        // Buttons
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;';
        const applyBtn = document.createElement('button');
        applyBtn.textContent = L.bgApply;
        applyBtn.style.cssText = 'padding:8px 18px;font-size:0.9em;cursor:pointer;flex:1;';
        applyBtn.addEventListener('click', () => {
            config.bgImage = urlInput.value.trim().replace(/['"<>]/g, '');
            config.bgTarget = targetSelect.value;
            config.bgOpacity = parseFloat(opacSlider.value) || 0.15;
            config.bgBlur = parseInt(blurSlider.value) || 0;
            config.bgSize = sizeSelect.value;
            storage.set('ytEnhancerConfig', config);
            applyGlobalStyles();
        });
        const clearBtn = document.createElement('button');
        clearBtn.textContent = L.bgClear;
        clearBtn.style.cssText = 'padding:8px 18px;font-size:0.9em;cursor:pointer;';
        clearBtn.addEventListener('click', () => {
            urlInput.value = '';
            config.bgImage = '';
            storage.set('ytEnhancerConfig', config);
            applyGlobalStyles();
            updatePreview();
        });
        btnRow.appendChild(applyBtn);
        btnRow.appendChild(clearBtn);
        container.appendChild(btnRow);
    }

    // --- Custom CSS Panel ---
    function buildCSSPanel(container) {
        const desc = document.createElement('p');
        desc.textContent = L.cssDesc;
        desc.style.cssText = 'font-size:0.9em;color:var(--enhancer-tab-inactive,#888);margin:0 0 14px;';
        container.appendChild(desc);

        const textarea = document.createElement('textarea');
        textarea.placeholder = L.cssPlaceholder;
        textarea.value = config.userCSS || '';
        textarea.style.cssText = `
            width:100%;max-width:100%;box-sizing:border-box;height:260px;padding:12px;border-radius:10px;
            border:1px solid var(--enhancer-input-border,#333);
            background:var(--enhancer-input-bg,#1f1f1f);
            color:var(--enhancer-input-fg,#f1f1f1);
            font-family:'JetBrains Mono','Fira Code','Consolas',monospace;
            font-size:0.85em;line-height:1.5;
            resize:vertical;tab-size:2;
        `;
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 2;
            }
        });
        container.appendChild(textarea);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px;';
        const applyBtn = document.createElement('button');
        applyBtn.textContent = L.cssApply;
        applyBtn.style.cssText = 'padding:8px 18px;font-size:0.9em;cursor:pointer;flex:1;';
        applyBtn.addEventListener('click', () => {
            config.userCSS = textarea.value;
            storage.set('ytEnhancerConfig', config);
            applyGlobalStyles();
            showNotification(L.cssApplied);
        });
        const clearCSSBtn = document.createElement('button');
        clearCSSBtn.textContent = L.cssClear;
        clearCSSBtn.style.cssText = 'padding:8px 18px;font-size:0.9em;cursor:pointer;';
        clearCSSBtn.addEventListener('click', () => {
            textarea.value = '';
            config.userCSS = '';
            storage.set('ytEnhancerConfig', config);
            applyGlobalStyles();
        });
        btnRow.appendChild(applyBtn);
        btnRow.appendChild(clearCSSBtn);
        container.appendChild(btnRow);
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
            background: var(--enhancer-primary, #065fd4);
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
        setInnerHTML(warning, L.playlistModeWarning);
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

    function createEnhancerButton() {
        const header = document.querySelector('ytd-masthead #end');
        if (!header || document.getElementById('yt-enhancer-btn')) return;
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

    function addYouTubeButton() {
        const debouncedCreate = debounce(createEnhancerButton, 200);
        createManagedObserver(document.body, debouncedCreate, { childList: true, subtree: true });
        setTimeout(createEnhancerButton, 1000);
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

    // --- Новые фиксы YouTube в Яндекс Браузере ---
    // Принудительный H264 кодек (отключает VP9/AV1 для стабильности)

    function applyForceH264() {
        if (!config.forceH264 || (isPlaylistModeActive && config.playlistModeFeature)) return;
        if (_unsafeWin.__ytEnhancerH264Applied) return;
        _unsafeWin.__ytEnhancerH264Applied = true;
        const origCanPlayType = _unsafeWin.HTMLMediaElement.prototype.canPlayType;
        _unsafeWin.HTMLMediaElement.prototype.canPlayType = function(type) {
            if (typeof type === 'string') {
                if (/vp9|vp09|av01/i.test(type)) return '';
            }
            return origCanPlayType.call(this, type);
        };
        if (_unsafeWin.MediaSource) {
            const origIsTypeSupported = _unsafeWin.MediaSource.isTypeSupported;
            _unsafeWin.MediaSource.isTypeSupported = function(type) {
                if (typeof type === 'string') {
                    if (/vp9|vp09|av01/i.test(type)) return false;
                }
                return origIsTypeSupported.call(this, type);
            };
        }
    }
    // Авто-закрытие попапа "Видео приостановлено"

    function applyFixAutoPause() {
        if (!config.fixAutoPause || (isPlaylistModeActive && config.playlistModeFeature)) return;
        if (_unsafeWin.__ytEnhancerAutoPauseApplied) return;
        _unsafeWin.__ytEnhancerAutoPauseApplied = true;
        const dismissPause = debounce(() => {
            // Кнопка "Да" / "Yes" в попапе "Видео приостановлено. Продолжить просмотр?"
            const confirmBtns = document.querySelectorAll(
                'yt-confirm-dialog-renderer #confirm-button, ' +
                '.yt-confirm-dialog-renderer #confirm-button, ' +
                'tp-yt-paper-dialog yt-confirm-dialog-renderer .buttons #confirm-button, ' +
                'ytd-popup-container yt-confirm-dialog-renderer #confirm-button'
            );
            confirmBtns.forEach(btn => {
                if (btn && btn.offsetParent !== null) {
                    btn.click();
                }
            });
            // Скрыть "Все еще смотрите?" / "Still watching?"
            const overlays = document.querySelectorAll(
                'ytd-enforcement-message-view-model, ' +
                '.ytp-pause-overlay, ' +
                '.html5-video-player .ytp-pause-overlay-container'
            );
            overlays.forEach(el => {
                if (el && el.offsetParent !== null) {
                    const btn = el.querySelector('button, .ytp-pause-overlay-controls-hidden a');
                    if (btn) btn.click();
                }
            });
        }, 500);
        createManagedObserver(document.body, dismissPause, { childList: true, subtree: true });
    }
    // Фикс белой вспышки при навигации в темной теме

    function applyFixDarkFlash() {
        if (!config.fixDarkFlash || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Фиксируем фон страницы — предотвращаем белую вспышку */
            html[dark], html[dark] body,
            ytd-app[is-dark-theme], [dark] ytd-app {
                background-color: var(--yt-spec-base-background, #0f0f0f) !important;
            }
            html[dark] ytd-page-manager,
            html[dark] ytd-browse,
            html[dark] ytd-search,
            html[dark] ytd-watch-flexy {
                background-color: var(--yt-spec-base-background, #0f0f0f) !important;
            }
            html[dark] #content.ytd-app,
            html[dark] #page-manager.ytd-app {
                background-color: var(--yt-spec-base-background, #0f0f0f) !important;
            }
            /* Мастхед (верхняя полоса: поиск, лого, кнопки) — фиксируем фон и убираем мерцание при скролле */
            html[dark] #masthead-container,
            html[dark] ytd-masthead,
            html[dark] #masthead {
                background-color: var(--yt-spec-base-background, #0f0f0f) !important;
                will-change: auto !important;
            }
            /* Предотвращаем мерцание при SPA-навигации */
            html[dark] #content.ytd-app > :not(ytd-masthead):not(ytd-mini-guide-renderer) {
                transition: none !important;
            }
        `, 'yt-enhancer-dark-flash');
    }
    // Фикс сетки на странице поиска

    function applyFixSearchGrid() {
        if (!config.fixSearchGrid || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        if (!/\/results/.test(location.pathname)) return;
        addStyles(`
            ytd-search ytd-item-section-renderer #contents {
                max-width: 100% !important;
            }
            ytd-search ytd-video-renderer,
            ytd-search ytd-channel-renderer,
            ytd-search ytd-playlist-renderer {
                max-width: 100% !important;
                width: 100% !important;
            }
            ytd-search #page-manager {
                margin-left: 0 !important;
                padding-left: 0 !important;
            }
            ytd-search #container.ytd-search {
                max-width: 100% !important;
                padding: 0 24px !important;
            }
            ytd-two-column-search-results-renderer #primary {
                max-width: 100% !important;
                min-width: 0 !important;
            }
        `, 'yt-enhancer-search-grid');
    }
    // Фикс мини-плеера

    function applyFixMiniPlayer() {
        if (!config.fixMiniPlayer || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            ytd-miniplayer {
                z-index: 2020 !important;
            }
            ytd-miniplayer[active] {
                z-index: 2020 !important;
            }
            .ytd-miniplayer .ytp-miniplayer-controls {
                z-index: 2021 !important;
            }
            /* Правильное отображение мини-плеера поверх контента */
            ytd-miniplayer[active] .miniplayer {
                box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
            }
        `, 'yt-enhancer-miniplayer');
    }
    // Оптимизация скролла

    function applyScrollOptimization() {
        if (!config.scrollOptimization || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Оптимизация рендеринга при скролле */
            ytd-rich-item-renderer,
            ytd-video-renderer,
            ytd-compact-video-renderer,
            ytd-grid-video-renderer {
                content-visibility: auto;
                contain-intrinsic-size: 0 500px;
            }
            /* Оптимизация миниатюр */
            ytd-thumbnail img,
            yt-image img {
                content-visibility: auto;
            }
            /* Исправление подергивания при прокрутке */
            #page-manager {
                overflow-anchor: none;
            }
            /* GPU-ускорение для плавного скролла */
            #contents.ytd-rich-grid-renderer {
                transform: translateZ(0);
                backface-visibility: hidden;
            }
        `, 'yt-enhancer-scroll');
    }
    // Фикс боковой панели

    function applyFixSidebar() {
        if (!config.fixSidebar || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Фикс пропадания/мерцания боковой панели */
            app-drawer#guide {
                transform: none !important;
                transition: visibility 0.2s, width 0.2s !important;
            }
            tp-yt-app-drawer#guide[opened] {
                visibility: visible !important;
            }
            /* Фикс наложения боковой панели на контент */
            ytd-mini-guide-renderer {
                z-index: 2000 !important;
            }
            /* Правильное отображение при схлопывании */
            ytd-guide-renderer {
                z-index: 2000 !important;
            }
            /* Фикс z-index для мастхеда */
            #masthead-container {
                z-index: 2050 !important;
            }
        `, 'yt-enhancer-sidebar');
    }

    // Фикс SPA-навигации в Яндекс Браузере
    function applyYandexFixNavigation() {
        if (!config.yandexFixNavigation || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        if (_unsafeWin.__ytEnhancerNavFixApplied) return;
        _unsafeWin.__ytEnhancerNavFixApplied = true;

        // Яндекс Браузер иногда ломает SPA-навигацию YouTube, вызывая пропущенные popstate.
        // Слушаем yt-navigate-finish и проверяем, что URL в address bar совпадает с YouTube state.
        document.addEventListener('yt-navigate-finish', () => {
            try {
                const ytApp = document.querySelector('ytd-app');
                if (!ytApp) return;
                // Форсируем обновление page-manager, если навигация залипла
                const pm = document.querySelector('ytd-page-manager');
                if (pm && pm.getCurrentPage && !pm.getCurrentPage()) {
                    // Принудительный re-render при застрявшей навигации
                    pm.style.display = 'none';
                    pm.offsetHeight; // force reflow
                    pm.style.display = '';
                }
            } catch (e) { /* safe fallback */ }
        });

        // Фикс для кнопки «Назад» — убеждаемся, что YouTube корректно обрабатывает popstate
        _unsafeWin.addEventListener('popstate', () => {
            setTimeout(() => {
                const ytApp = document.querySelector('ytd-app');
                if (ytApp && ytApp.data && ytApp.data.url !== location.pathname + location.search) {
                    // YouTube state рассинхронизирован — мягкий перезапрос
                    try {
                        const evt = document.createEvent('CustomEvent');
                        evt.initCustomEvent('yt-navigate', true, true, { href: location.href });
                        document.dispatchEvent(evt);
                    } catch (e) { /* fallback */ }
                }
            }, 100);
        });
    }

    // Фикс двойной прокрутки / overflow в Яндекс Браузере
    function applyYandexFixScrollbar() {
        if (!config.yandexFixScrollbar || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Устранение двойного скроллбара от инъекций Яндекс Браузера */
            html {
                overflow-y: auto !important;
                overflow-x: hidden !important;
            }
            ytd-app {
                overflow: visible !important;
                width: 100% !important;
                max-width: 100vw !important;
            }
            /* Фикс горизонтального overflow на странице видео */
            ytd-watch-flexy {
                overflow-x: hidden !important;
                max-width: 100vw !important;
            }
            /* Фикс overflow в page-manager */
            ytd-page-manager {
                overflow-x: hidden !important;
            }
        `, 'yt-enhancer-yandex-scrollbar');
    }

    // Фикс полноэкранного режима в Яндекс Браузере
    function applyYandexFixFullscreen() {
        if (!config.yandexFixFullscreen || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Максимальный z-index для полноэкранного плеера */
            .html5-video-player.ytp-fullscreen {
                z-index: 2147483647 !important;
                position: fixed !important;
            }
            /* Скрываем навигационные подсказки Яндекса в fullscreen */
            .ytp-fullscreen-navbar-hint,
            .video-stream-host__fullscreen-hint {
                display: none !important;
            }
            /* Фикс: Яндекс иногда оставляет masthead поверх fullscreen */
            .html5-video-player.ytp-fullscreen ~ #masthead-container,
            ytd-app[masthead-hidden_] #masthead-container {
                z-index: -1 !important;
            }
            /* Фикс мерцания при входе/выходе из fullscreen */
            .html5-video-player {
                transition: none !important;
            }
        `, 'yt-enhancer-yandex-fullscreen');
    }

    // Фикс элементов управления плеера в Яндекс Браузере
    function applyYandexFixPlayerControls() {
        if (!config.yandexFixPlayerControls || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Фикс рендеринга нижней панели управления плеера */
            .ytp-chrome-bottom {
                transform: translateZ(0) !important;
                backface-visibility: hidden !important;
            }
            .html5-video-player:not(.ytp-autohide) .ytp-chrome-bottom {
                opacity: 1 !important;
            }
            /* Фикс прогресс-бара — иногда не рендерится в Яндексе */
            .ytp-progress-bar-container {
                transform: translateZ(0) !important;
                will-change: transform !important;
            }
            /* Фикс кнопки громкости */
            .ytp-volume-panel {
                overflow: visible !important;
            }
            /* Фикс таймкода — иногда обрезается */
            .ytp-time-display {
                overflow: visible !important;
                white-space: nowrap !important;
            }
            /* Фикс кнопок настроек и субтитров */
            .ytp-settings-button,
            .ytp-subtitles-button,
            .ytp-size-button {
                transform: translateZ(0) !important;
            }
            /* Фикс hover-эффектов на контролах */
            .ytp-button:hover {
                opacity: 1 !important;
            }
        `, 'yt-enhancer-yandex-controls');
    }

    // Дополнительные фиксы для YouTube в Яндекс Браузере

    function applyExtraYandexFixes() {
        if (!isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Фикс поломанного Polymer-рендеринга */
            ytd-app {
                overflow: visible !important;
            }
            /* Фикс некорректного отображения комментариев */
            ytd-comments#comments {
                display: block !important;
                visibility: visible !important;
            }
            ytd-comments ytd-item-section-renderer {
                display: block !important;
            }
            /* Фикс промо-баннеров и оверлеев */
            ytd-banner-promo-renderer,
            ytd-statement-banner-renderer,
            ytd-mealbar-promo-renderer {
                display: none !important;
            }
            /* Фикс отображения плеера */
            .html5-video-player {
                overflow: visible !important;
            }
            .html5-video-player:not(.ytp-autohide) .ytp-chrome-bottom {
                opacity: 1 !important;
            }
            /* Фикс залипания элементов управления плеера */
            .html5-video-player.ytp-autohide .ytp-chrome-bottom,
            .html5-video-player.ytp-autohide .ytp-chrome-top,
            .html5-video-player.ytp-autohide .ytp-gradient-top,
            .html5-video-player.ytp-autohide .ytp-gradient-bottom {
                opacity: 0 !important;
                transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1) !important;
            }
            .html5-video-player.ytp-autohide {
                cursor: none !important;
            }
            /* Фикс кнопки "Skip" в рекламе */
            .ytp-ad-skip-button-container {
                z-index: 1000 !important;
                opacity: 1 !important;
            }
            /* Фикс прозрачности подсказок */
            ytd-engagement-panel-section-list-renderer {
                z-index: 1003 !important;
            }
            /* Фикс прокрутки комментариев в режиме театра */
            ytd-watch-flexy[theater] #below {
                scroll-behavior: smooth;
            }
            /* Фикс поведения hover preview */
            ytd-thumbnail #mouseover-overlay,
            ytd-thumbnail #hover-overlays {
                will-change: opacity;
            }
        `, 'yt-enhancer-extra-yandex');
    }

    // Скрытие пустых блоков (контейнеры, опустошённые uBlock Origin и другими адблокерами)
    function applyHideEmptyBlocks() {
        if (!config.hideEmptyBlocks || (isPlaylistModeActive && config.playlistModeFeature)) return;
        // CSS: :has() — скрываем контейнеры, внутри которых реклама заблокирована адблокером
        addStyles(`
            /* Контейнеры с рекламными рендерерами (прямые + заблокированные uBlock Origin через [hidden] / display:none) */
            ytd-rich-item-renderer:has(> ytd-ad-slot-renderer),
            ytd-rich-item-renderer:has(> ytd-display-ad-renderer),
            ytd-rich-item-renderer:has(> ytd-in-feed-ad-layout-renderer),
            ytd-rich-item-renderer:has(> ytd-promoted-sparkles-web-renderer),
            ytd-rich-item-renderer:has(> ytd-promoted-video-renderer),
            ytd-rich-section-renderer:has(> #content > ytd-ad-slot-renderer),
            ytd-rich-section-renderer:has(> #content > ytd-statement-banner-renderer),
            ytd-rich-section-renderer:has(> #content > ytd-brand-video-singleton-renderer),
            ytd-rich-section-renderer:has(> #content > ytd-banner-promo-renderer),
            ytd-item-section-renderer:has(> #contents > ytd-ad-slot-renderer),
            ytd-item-section-renderer:has(> #contents > ytd-promoted-sparkles-web-renderer) {
                display: none !important;
            }
            /* Контейнеры, где uBlock спрятал содержимое через [hidden] */
            ytd-rich-item-renderer:has(> [hidden]:only-child),
            ytd-rich-section-renderer:has(> #content > [hidden]:only-child),
            ytd-item-section-renderer:has(> #contents > [hidden]:only-child) {
                display: none !important;
            }
            /* Прямое скрытие рекламных элементов */
            ytd-ad-slot-renderer,
            ytd-promoted-sparkles-web-renderer,
            ytd-display-ad-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-promoted-video-renderer,
            ytd-banner-promo-renderer,
            ytd-brand-video-singleton-renderer,
            ytd-statement-banner-renderer {
                display: none !important;
            }
            /* Полностью пустые элементы */
            ytd-rich-item-renderer:empty,
            ytd-rich-section-renderer:empty,
            ytd-item-section-renderer:empty,
            ytd-shelf-renderer:empty {
                display: none !important;
            }
        `, 'yt-enhancer-hide-empty');

        // JS-очистка — удаляем контейнеры, которые не поймал CSS
        if (_unsafeWin.__ytEnhancerEmptyBlocksApplied) return;
        _unsafeWin.__ytEnhancerEmptyBlocksApplied = true;

        const adSelectors = [
            'ytd-ad-slot-renderer', 'ytd-display-ad-renderer',
            'ytd-in-feed-ad-layout-renderer', 'ytd-promoted-sparkles-web-renderer',
            'ytd-promoted-video-renderer', 'ytd-banner-promo-renderer',
            'ytd-brand-video-singleton-renderer', 'ytd-statement-banner-renderer'
        ].join(',');

        // Проверка: контейнер визуально пуст (uBlock скрыл всё через style/hidden/class)
        const isVisuallyEmpty = (el) => {
            const children = el.children;
            if (!children.length) return true;
            for (let i = 0; i < children.length; i++) {
                const ch = children[i];
                // Ребёнок скрыт uBlock через hidden атрибут или display:none в style
                if (ch.hidden) continue;
                if (ch.style && ch.style.display === 'none') continue;
                // Ребёнок имеет нулевую высоту (uBlock cosmetic filtering)
                if (ch.offsetHeight === 0 && ch.offsetWidth === 0) continue;
                // Ребёнок — это контейнер #content/#contents, проверяем его детей
                if (ch.id === 'content' || ch.id === 'contents') {
                    if (isVisuallyEmpty(ch)) continue;
                }
                return false;
            }
            return true;
        };

        const cleanEmptyRenderers = debounce(() => {
            // 1) Скрываем контейнеры с рекламными рендерерами внутри
            document.querySelectorAll('ytd-rich-item-renderer, ytd-rich-section-renderer, ytd-item-section-renderer').forEach(el => {
                if (el.querySelector(adSelectors)) {
                    el.style.display = 'none';
                    return;
                }
            });
            // 2) Скрываем rich-item без видеоконтента (пустые плейсхолдеры / заблокированные uBlock)
            document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
                if (el.style.display === 'none') return;
                // Есть видео — пропускаем (включая новый yt-lockup-view-model)
                if (el.querySelector('ytd-rich-grid-media, a#thumbnail, #video-title-link, ytd-rich-grid-slim-media, yt-lockup-view-model')) return;
                // Проверяем визуальную пустоту (uBlock спрятал контент)
                if (isVisuallyEmpty(el)) {
                    el.style.display = 'none';
                    return;
                }
                // Если элемент только появился — даём 3 сек на загрузку
                if (!el.dataset.ytEnhancerTs) {
                    el.dataset.ytEnhancerTs = Date.now();
                    return;
                }
                if (Date.now() - parseInt(el.dataset.ytEnhancerTs) > 3000) {
                    el.style.display = 'none';
                }
            });
            // 3) Скрываем rich-section/item-section, визуально пустые после uBlock
            document.querySelectorAll('ytd-rich-section-renderer, ytd-item-section-renderer').forEach(el => {
                if (el.style.display === 'none') return;
                if (isVisuallyEmpty(el)) {
                    el.style.display = 'none';
                }
            });
        }, 1500);

        setTimeout(cleanEmptyRenderers, 2000);
        createManagedObserver(document.body, cleanEmptyRenderers, { childList: true, subtree: true });
    }


    // Применение всех новых фиксов

    function applyNewFixes() {
        applyForceH264();
        applyFixAutoPause();
        applyFixDarkFlash();
        applyFixSearchGrid();
        applyFixMiniPlayer();
        applyScrollOptimization();
        applyFixSidebar();
        applyYandexFixNavigation();
        applyYandexFixScrollbar();
        applyYandexFixFullscreen();
        applyYandexFixPlayerControls();
        applyExtraYandexFixes();
        applyHideEmptyBlocks();
    }

    // --- Инициализация ---

    function init() {
        if (_initDone) return;
        _initDone = true;
        applyGlobalStyles();
        applyMainFeatures();
        applyYandexFixes();
        applyNewFixes();
        hideRFSlowWarning();
        addYouTubeButton();
        checkPlaylistMode();
        // Оптимизированный наблюдатель для SPA-навигации
        let lastUrl = location.href;
        const debouncedSpaHandler = debounce(() => {
            checkPlaylistMode();
            applyGlobalStyles();
            applyMainFeatures();
            applyYandexFixes();
            applyNewFixes();
            hideRFSlowWarning();
        }, 300);
        createManagedObserver(document, () => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                requestAnimationFrame(debouncedSpaHandler);
            }
        }, {
            subtree: true,
            childList: true,
            attributes: false,
            characterData: false
        });
        // Периодическая проверка только для Яндекс сетки
        if (isYandexBrowser() && config.yandexGridFix) {
            setInterval(cleanupSpacing, 30000);
        }
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 100);
    } else {
        document.addEventListener('DOMContentLoaded', init);
        window.addEventListener('load', init);
    }
})();
