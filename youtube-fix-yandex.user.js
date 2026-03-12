// ==UserScript==
// @name         YouTube Fix for Yandex
// @namespace https://github.com/Xanixsl/test-123-123
// @version      4.4.8
// @description  РћРїС‚РёРјРёР·Р°С†РёСЏ Рё РёСЃРїСЂР°РІР»РµРЅРёСЏ YouTube РґР»СЏ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂР°: СЃРµС‚РєР°, РїСЂРѕРёР·РІРѕРґРёС‚РµР»СЊРЅРѕСЃС‚СЊ, РёРЅС‚РµСЂС„РµР№СЃ, С„РёРєСЃ РїСѓСЃС‚С‹С… Р±Р»РѕРєРѕРІ, РєРѕРґРµРєРѕРІ, Р°РІС‚Рѕ-РїР°СѓР·С‹, СЃРєСЂРѕР»Р»Р°, РЅР°С‚РёРІРЅС‹Р№ YouTube UI
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

    // --- Р”РѕСЃС‚СѓРї Рє СЂРµР°Р»СЊРЅРѕРјСѓ window (sandbox-safe) ---
    const _unsafeWin = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    // --- РљРѕРЅСЃС‚Р°РЅС‚С‹ РґР»СЏ СЂРµР¶РёРјР° РїР»РµР№Р»РёСЃС‚РѕРІ ---
    const PLAYLIST_MODE_CLASS = 'yt-enhancer-playlist-mode';
    const PLAYLIST_URL_REGEX = /^\/@[^/]+\/playlists\/?$/;
    let isPlaylistModeActive = false;
    let playlistModeNotification = null;
    let _isYandex = null;
    let _initDone = false;
    const _managedStyles = new Map();
    const _observers = [];

    // --- РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРёР№ СЂРµРґРёСЂРµРєС‚ РЅР° /featured РґР»СЏ РєР°РЅР°Р»РѕРІ (РѕС‚РєР»СЋС‡С‘РЅ: YouTube СѓР±СЂР°Р» /featured, РІС‹Р·С‹РІР°РµС‚ Р±РµСЃРєРѕРЅРµС‡РЅС‹Р№ С†РёРєР» СЂРµРґРёСЂРµРєС‚РѕРІ) ---
    // (function autoRedirectToFeatured() { ... })();

    // --- РњСѓР»СЊС‚РёСЏР·С‹С‡РЅРѕСЃС‚СЊ (РІСЃС‚СЂРѕРµРЅРЅС‹Рµ РґР°РЅРЅС‹Рµ + РѕРїС†РёРѕРЅР°Р»СЊРЅРѕРµ РѕР±РЅРѕРІР»РµРЅРёРµ РёР· @resource / GitHub API) ---
    const _BUILTIN_LANGS = {
        en: {
            title: "YouTube Fix for Yandex", version: "v4.4.8",
            tabs: ["General", "Yandex Fixes", "Settings"], tabsNoYandex: ["General", "Settings"],
            save: "Save settings", reset: "Reset settings",
            saved: "Settings saved! Page will reload...", reseted: "Settings reset! Page will reload...",
            confirmReset: "Are you sure you want to reset all settings to default?",
            mainSection: "Interface", mainDesc: "Display and navigation options for all browsers",
            hideChips: "Hide chips (filters)", hideChipsDesc: "Hides the filter bar on the home page and category sections (chips are always preserved on channel pages)",
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
            fixRussiaThrottle: "Bypass YouTube throttling in Russia", fixRussiaThrottleDesc: "Experimental: redirects video requests through alternative CDN to try bypassing artificial YouTube throttling by Russian ISPs (TSPU/DPI)",
            fixesSection: "Bug fixes", fixesDesc: "General fixes for YouTube issues in all browsers",
            langSection: "Interface language", langDesc: "Choose the extension interface language", langAuto: "Auto (browser)",
            yandexFixesSection: "Yandex Browser fixes", yandexFixesDesc: "Fixes for known issues specific to Yandex Browser",
            yandexFixNavigation: "Fix SPA navigation", yandexFixNavigationDesc: "Fixes back button and page navigation issues in Yandex Browser",
            yandexFixScrollbar: "Fix page overflow", yandexFixScrollbarDesc: "Fixes double scrollbar and content overflow caused by Yandex optimizations",
            yandexFixFullscreen: "Fix fullscreen mode", yandexFixFullscreenDesc: "Fixes toolbar artifacts and z-index issues in fullscreen video mode",
            yandexFixPlayerControls: "Fix player controls", yandexFixPlayerControlsDesc: "Fixes rendering issues with video player controls in Yandex Browser",
            yandexSection: "Yandex grid settings", yandexDesc: "Optimize video grid for Yandex Browser",
            yandexVideoCount: "Videos per row", yandexChipbarMargin: "Chipbar shift (px)", yandexVideoMargin: "Video block shift (px)",
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
            styleYoutube: "YouTube", styleImproved: "Improved (glass + dropdowns)", styleMidnight: "Midnight", styleSunset: "Sunset", styleCustom: "Custom",
            customColorsSection: "Fine-tune colors", customColorsDesc: "Manually adjust individual colors (overrides current scheme)",
            customColorEnabled: "Enable custom colors", customColorBg: "Background", customColorFg: "Text",
            customColorPrimary: "Accent color", customColorBorder: "Borders", customColorBtnBorder: "Button border",
            customColorBtnFg: "Button text", customColorBtnHoverBg: "Button hover", customColorBtnHoverFg: "Button hover text",
            customColorBadgeBg: "Badge background", customColorBadgeFg: "Badge text",
            customColorInputBg: "Input background", customColorInputFg: "Input text", customColorInputBorder: "Input border",
            customColorSelectBg: "Dropdown background", customColorSelectFg: "Dropdown text", customColorSelectBorder: "Dropdown border",
            customColorReset: "Reset custom colors",
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
            title: "YouTube Fix for Yandex", version: "v4.4.8",
            tabs: ["РћР±С‰РµРµ", "РЇРЅРґРµРєСЃ-Р¤РёРєСЃС‹", "РќР°СЃС‚СЂРѕР№РєРё"], tabsNoYandex: ["РћР±С‰РµРµ", "РќР°СЃС‚СЂРѕР№РєРё"],
            save: "РЎРѕС…СЂР°РЅРёС‚СЊ РЅР°СЃС‚СЂРѕР№РєРё", reset: "РЎР±СЂРѕСЃРёС‚СЊ РЅР°СЃС‚СЂРѕР№РєРё",
            saved: "РќР°СЃС‚СЂРѕР№РєРё СЃРѕС…СЂР°РЅРµРЅС‹! РЎС‚СЂР°РЅРёС†Р° Р±СѓРґРµС‚ РїРµСЂРµР·Р°РіСЂСѓР¶РµРЅР°...", reseted: "РќР°СЃС‚СЂРѕР№РєРё СЃР±СЂРѕС€РµРЅС‹! РЎС‚СЂР°РЅРёС†Р° Р±СѓРґРµС‚ РїРµСЂРµР·Р°РіСЂСѓР¶РµРЅР°...",
            confirmReset: "Р’С‹ СѓРІРµСЂРµРЅС‹, С‡С‚Рѕ С…РѕС‚РёС‚Рµ СЃР±СЂРѕСЃРёС‚СЊ РІСЃРµ РЅР°СЃС‚СЂРѕР№РєРё Рє Р·РЅР°С‡РµРЅРёСЏРј РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ?",
            mainSection: "РРЅС‚РµСЂС„РµР№СЃ", mainDesc: "РџР°СЂР°РјРµС‚СЂС‹ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ Рё РЅР°РІРёРіР°С†РёРё РґР»СЏ РІСЃРµС… Р±СЂР°СѓР·РµСЂРѕРІ",
            hideChips: "РЎРєСЂС‹С‚СЊ С‡РёРїСЃС‹ (С„РёР»СЊС‚СЂС‹)", hideChipsDesc: "РЎРєСЂС‹РІР°РµС‚ РїРѕР»РѕСЃСѓ СЃ С„РёР»СЊС‚СЂР°РјРё С‚РѕР»СЊРєРѕ РЅР° РіР»Р°РІРЅРѕР№ СЃС‚СЂР°РЅРёС†Рµ Рё СЂР°Р·РґРµР»Р°С… (РЅР° СЃС‚СЂР°РЅРёС†Р°С… РєР°РЅР°Р»РѕРІ С‡РёРїСЃС‹ РІСЃРµРіРґР° СЃРѕС…СЂР°РЅСЏСЋС‚СЃСЏ)",
            compactMode: "РљРѕРјРїР°РєС‚РЅС‹Р№ СЂРµР¶РёРј", compactModeDesc: "РЈРјРµРЅСЊС€Р°РµС‚ РѕС‚СЃС‚СѓРїС‹ РјРµР¶РґСѓ РІРёРґРµРѕ РґР»СЏ Р±РѕР»РµРµ РїР»РѕС‚РЅРѕРіРѕ СЂР°СЃРїРѕР»РѕР¶РµРЅРёСЏ",
            hideShorts: "РЎРєСЂС‹С‚СЊ Shorts", hideShortsDesc: "РЈР±РёСЂР°РµС‚ СЂР°Р·РґРµР» Shorts Рё СЂРµРєРѕРјРµРЅРґР°С†РёРё РєРѕСЂРѕС‚РєРёС… РІРёРґРµРѕ",
            hideTopicShelves: "РЎРєСЂС‹С‚СЊ \"Р•С‰С‘ С‚РµРјС‹\"", hideTopicShelvesDesc: "РЈР±РёСЂР°РµС‚ СЃРµРєС†РёРё СЃ С‚РµРјР°С‚РёС‡РµСЃРєРёРјРё РїРѕРґР±РѕСЂРєР°РјРё РІРёРґРµРѕ (\"Р•С‰С‘ С‚РµРјС‹\") РЅР° РіР»Р°РІРЅРѕР№ СЃС‚СЂР°РЅРёС†Рµ",
            hideRFSlowWarning: "РЎРєСЂС‹С‚СЊ РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёРµ Рѕ Р·Р°РјРµРґР»РµРЅРёРё", hideRFSlowWarningDesc: "РЈР±РёСЂР°РµС‚ СѓРІРµРґРѕРјР»РµРЅРёРµ Рѕ РІРѕР·РјРѕР¶РЅС‹С… Р·Р°РјРµРґР»РµРЅРёСЏС… СЂР°Р±РѕС‚С‹ YouTube РІ Р Р¤",
            fixChannelCard: "Р¤РёРєСЃ РєР°СЂС‚РѕС‡РєРё РєР°РЅР°Р»Р° РЅР° РІРєР»Р°РґРєР°С…", fixChannelCardDesc: "РСЃРїСЂР°РІР»СЏРµС‚ \"СЃСЉРµР·Р¶Р°СЋС‰СѓСЋ\" РєР°СЂС‚РѕС‡РєСѓ РєР°РЅР°Р»Р° РЅР° РІСЃРµС… РІРєР»Р°РґРєР°С… РєР°РЅР°Р»Р°",
            restoreChips: "Р’РѕСЃСЃС‚Р°РЅРѕРІРёС‚СЊ Р±С‹СЃС‚СЂС‹Рµ СЃРѕСЂС‚РёСЂРѕРІРєРё (С‡РёРїСЃС‹) РЅР° РІРєР»Р°РґРєРµ Videos", restoreChipsDesc: "Р“Р°СЂР°РЅС‚РёСЂСѓРµС‚ РѕС‚РѕР±СЂР°Р¶РµРЅРёРµ С‡РёРїСЃРѕРІ СЃРѕСЂС‚РёСЂРѕРІРєРё РІРёРґРµРѕ РЅР° СЃС‚СЂР°РЅРёС†Рµ РєР°РЅР°Р»Р°",
            playlistModeFeature: "РџР»РµР№Р»РёСЃС‚С‹ РЅР° РєР°РЅР°Р»Р°С…", playlistModeFeatureDesc: "Р’РѕР·РІСЂР°С‰Р°РµС‚ РїР»РµР№Р»РёСЃС‚С‹ РЅР° РєР°РЅР°Р»С‹ (РѕС‚РєР»СЋС‡Р°РµС‚ РѕРїС‚РёРјРёР·Р°С†РёСЋ СЏРЅРґРµРєСЃ Р±СЂР°СѓР·РµСЂР°)",
            playlistModeWarning: "Р’РЅРёРјР°РЅРёРµ: РЎС‚СЂР°РЅРёС†Р° РїР»РµР№Р»РёСЃС‚РѕРІ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊСЃСЏ РЅРµРєРѕСЂСЂРµРєС‚РЅРѕ. Р’РєР»СЋС‡РёС‚Рµ С„СѓРЅРєС†РёСЋ 'РџР»РµР№Р»РёСЃС‚С‹ РЅР° РєР°РЅР°Р»Р°С…' РІ РЅР°СЃС‚СЂРѕР№РєР°С…, С‡С‚РѕР±С‹ РёСЃРїСЂР°РІРёС‚СЊ.",
            forceH264: "РџСЂРёРЅСѓРґРёС‚РµР»СЊРЅС‹Р№ РєРѕРґРµРє H264", forceH264Desc: "РћС‚РєР»СЋС‡Р°РµС‚ VP9/AV1 РєРѕРґРµРєРё РґР»СЏ СѓСЃС‚СЂР°РЅРµРЅРёСЏ РїРѕРґС‚РѕСЂРјР°Р¶РёРІР°РЅРёР№ Рё Р·Р°РІРёСЃР°РЅРёР№ РІРёРґРµРѕ",
            fixAutoPause: "РђРІС‚Рѕ-Р·Р°РєСЂС‹С‚РёРµ 'Р’РёРґРµРѕ РїСЂРёРѕСЃС‚Р°РЅРѕРІР»РµРЅРѕ'", fixAutoPauseDesc: "РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРё РЅР°Р¶РёРјР°РµС‚ РїСЂРѕРґРѕР»Р¶РёС‚СЊ, РєРѕРіРґР° YouTube СЃС‚Р°РІРёС‚ РІРёРґРµРѕ РЅР° РїР°СѓР·Сѓ",
            fixDarkFlash: "Р¤РёРєСЃ РІСЃРїС‹С€РєРё С‚РµРјРЅРѕР№ С‚РµРјС‹", fixDarkFlashDesc: "РЈСЃС‚СЂР°РЅСЏРµС‚ Р±РµР»СѓСЋ РІСЃРїС‹С€РєСѓ РїСЂРё РЅР°РІРёРіР°С†РёРё РІ С‚РµРјРЅРѕР№ С‚РµРјРµ",
            fixSearchGrid: "Р¤РёРєСЃ СЃРµС‚РєРё РїРѕРёСЃРєР°", fixSearchGridDesc: "РСЃРїСЂР°РІР»СЏРµС‚ СЃРµС‚РєСѓ РІРёРґРµРѕ РЅР° СЃС‚СЂР°РЅРёС†Рµ СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ РїРѕРёСЃРєР°",
            fixMiniPlayer: "Р¤РёРєСЃ РјРёРЅРё-РїР»РµРµСЂР°", fixMiniPlayerDesc: "РСЃРїСЂР°РІР»СЏРµС‚ РїСЂРѕР±Р»РµРјС‹ РЅР°Р»РѕР¶РµРЅРёСЏ РјРёРЅРё-РїР»РµРµСЂР°",
            scrollOptimization: "РћРїС‚РёРјРёР·Р°С†РёСЏ СЃРєСЂРѕР»Р»Р°", scrollOptimizationDesc: "РЈРјРµРЅСЊС€Р°РµС‚ РїРѕРґС‚РѕСЂРјР°Р¶РёРІР°РЅРёСЏ РїСЂРё РїСЂРѕРєСЂСѓС‚РєРµ Р»РµРЅС‚С‹",
            fixSidebar: "Р¤РёРєСЃ Р±РѕРєРѕРІРѕР№ РїР°РЅРµР»Рё", fixSidebarDesc: "РЈСЃС‚СЂР°РЅСЏРµС‚ РіР»РёС‚С‡Рё Р±РѕРєРѕРІРѕР№ РїР°РЅРµР»Рё РїСЂРё РЅР°РІРёРіР°С†РёРё",
            hideEmptyBlocks: "РЎРєСЂС‹С‚СЊ РїСѓСЃС‚С‹Рµ Р±Р»РѕРєРё", hideEmptyBlocksDesc: "РЎРєСЂС‹РІР°РµС‚ РїСѓСЃС‚С‹Рµ РїР»РµР№СЃС…РѕР»РґРµСЂС‹ РІРёРґРµРѕ Рё СЃР»РѕРјР°РЅРЅС‹Рµ РїСЂРѕРјРѕ-Р±Р»РѕРєРё РІ Р»РµРЅС‚Рµ",
            fixRussiaThrottle: "РћР±С…РѕРґ Р·Р°РјРµРґР»РµРЅРёСЏ YouTube РІ Р Р¤", fixRussiaThrottleDesc: "Р­РєСЃРїРµСЂРёРјРµРЅС‚Р°Р»СЊРЅС‹Р№ С„РёРєСЃ: РїРµСЂРµРЅР°РїСЂР°РІР»СЏРµС‚ video-Р·Р°РїСЂРѕСЃС‹ С‡РµСЂРµР· Р°Р»СЊС‚РµСЂРЅР°С‚РёРІРЅС‹Р№ CDN РґР»СЏ РїРѕРїС‹С‚РєРё РѕР±С…РѕРґР° РёСЃРєСѓСЃСЃС‚РІРµРЅРЅРѕРіРѕ Р·Р°РјРµРґР»РµРЅРёСЏ YouTube СЂРѕСЃСЃРёР№СЃРєРёРјРё РїСЂРѕРІР°Р№РґРµСЂР°РјРё (РўРЎРџРЈ/DPI)",
            fixesSection: "РСЃРїСЂР°РІР»РµРЅРёСЏ Р±Р°РіРѕРІ", fixesDesc: "РћР±С‰РёРµ РёСЃРїСЂР°РІР»РµРЅРёСЏ РґР»СЏ YouTube РІРѕ РІСЃРµС… Р±СЂР°СѓР·РµСЂР°С…",
            langSection: "РЇР·С‹Рє РёРЅС‚РµСЂС„РµР№СЃР°", langDesc: "Р’С‹Р±РµСЂРёС‚Рµ СЏР·С‹Рє РёРЅС‚РµСЂС„РµР№СЃР° СЂР°СЃС€РёСЂРµРЅРёСЏ", langAuto: "РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРё (РїРѕ Р±СЂР°СѓР·РµСЂСѓ)",
            yandexFixesSection: "Р¤РёРєСЃС‹ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂР°", yandexFixesDesc: "РСЃРїСЂР°РІР»РµРЅРёСЏ РїСЂРѕР±Р»РµРј, СЃРїРµС†РёС„РёС‡РЅС‹С… РґР»СЏ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂР°",
            yandexFixNavigation: "Р¤РёРєСЃ SPA-РЅР°РІРёРіР°С†РёРё", yandexFixNavigationDesc: "РСЃРїСЂР°РІР»СЏРµС‚ РїСЂРѕР±Р»РµРјС‹ СЃ РєРЅРѕРїРєРѕР№ РќР°Р·Р°Рґ Рё РїРµСЂРµС…РѕРґР°РјРё РјРµР¶РґСѓ СЃС‚СЂР°РЅРёС†Р°РјРё РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ",
            yandexFixScrollbar: "Р¤РёРєСЃ РїРµСЂРµРїРѕР»РЅРµРЅРёСЏ СЃС‚СЂР°РЅРёС†С‹", yandexFixScrollbarDesc: "РЈСЃС‚СЂР°РЅСЏРµС‚ РґРІРѕР№РЅСѓСЋ РїСЂРѕРєСЂСѓС‚РєСѓ Рё РїРµСЂРµРїРѕР»РЅРµРЅРёРµ РєРѕРЅС‚РµРЅС‚Р°, РІС‹Р·РІР°РЅРЅС‹Рµ РѕРїС‚РёРјРёР·Р°С†РёСЏРјРё РЇРЅРґРµРєСЃР°",
            yandexFixFullscreen: "Р¤РёРєСЃ РїРѕР»РЅРѕСЌРєСЂР°РЅРЅРѕРіРѕ СЂРµР¶РёРјР°", yandexFixFullscreenDesc: "РЈСЃС‚СЂР°РЅСЏРµС‚ Р°СЂС‚РµС„Р°РєС‚С‹ РїР°РЅРµР»РµР№ Рё РїСЂРѕР±Р»РµРјС‹ РЅР°Р»РѕР¶РµРЅРёСЏ РІ РїРѕР»РЅРѕСЌРєСЂР°РЅРЅРѕРј СЂРµР¶РёРјРµ РІРёРґРµРѕ",
            yandexFixPlayerControls: "Р¤РёРєСЃ СѓРїСЂР°РІР»РµРЅРёСЏ РїР»РµРµСЂРѕРј", yandexFixPlayerControlsDesc: "РСЃРїСЂР°РІР»СЏРµС‚ СЂРµРЅРґРµСЂРёРЅРі СЌР»РµРјРµРЅС‚РѕРІ СѓРїСЂР°РІР»РµРЅРёСЏ РІРёРґРµРѕРїР»РµРµСЂР° РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ",
            yandexSection: "РќР°СЃС‚СЂРѕР№РєРё СЃРµС‚РєРё РІРёРґРµРѕ", yandexDesc: "РћРїС‚РёРјРёР·Р°С†РёСЏ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РІРёРґРµРѕ РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ",
            yandexVideoCount: "РљРѕР»РёС‡РµСЃС‚РІРѕ РІРёРґРµРѕ РІ СЃС‚СЂРѕРєРµ", yandexChipbarMargin: "РЎРґРІРёРі Chipbar (px)", yandexVideoMargin: "РЎРґРІРёРі Р±Р»РѕРєР° РІРёРґРµРѕ (px)",
            yandexExpSection: "Р­РєСЃРїРµСЂРёРјРµРЅС‚Р°Р»СЊРЅС‹Рµ С„СѓРЅРєС†РёРё", yandexExpDesc: "РСЃРїРѕР»СЊР·СѓР№С‚Рµ СЃ РѕСЃС‚РѕСЂРѕР¶РЅРѕСЃС‚СЊСЋ, РјРѕРіСѓС‚ Р±С‹С‚СЊ РЅРµСЃС‚Р°Р±РёР»СЊРЅС‹РјРё",
            yandexGridFix: "РСЃРїСЂР°РІРёС‚СЊ СЃРµС‚РєСѓ РІРёРґРµРѕ", yandexGridFixDesc: "Р¤РёРєСЃРёС‚ РїСЂРѕР±Р»РµРјСѓ СЃ РѕС‚РѕР±СЂР°Р¶РµРЅРёРµРј 3 РІРёРґРµРѕ РІ СЃС‚СЂРѕРєРµ",
            yandexPerf: "Р РµР¶РёРј РѕРїС‚РёРјРёР·Р°С†РёРё", yandexPerfDesc: "РЈР»СѓС‡С€Р°РµС‚ РїСЂРѕРёР·РІРѕРґРёС‚РµР»СЊРЅРѕСЃС‚СЊ РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ",
            yandexExpFix: "Р­РєСЃРїРµСЂРёРјРµРЅС‚Р°Р»СЊРЅС‹Р№ С„РёРєСЃ СЃРґРІРёРіР°", yandexExpFixDesc: "РђР»СЊС‚РµСЂРЅР°С‚РёРІРЅС‹Р№ РјРµС‚РѕРґ РёСЃРїСЂР°РІР»РµРЅРёСЏ РёРЅС‚РµСЂС„РµР№СЃР°", yandexSiteShift: "Р’РµР»РёС‡РёРЅР° СЃРґРІРёРіР° (px)",
            appearanceSection: "РўРµРјРЅС‹Р№ СЂРµР¶РёРј", appearanceDesc: "РќР°СЃС‚СЂРѕР№РєРё РІРЅРµС€РЅРµРіРѕ РІРёРґР° РёРЅС‚РµСЂС„РµР№СЃР°",
            darkModeSupport: "РџРѕРґРґРµСЂР¶РєР° С‚РµРјРЅРѕР№ С‚РµРјС‹", darkModeSupportDesc: "РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРµ РїРµСЂРµРєР»СЋС‡РµРЅРёРµ РјРµР¶РґСѓ СЃРІРµС‚Р»РѕР№ Рё С‚РµРјРЅРѕР№ С‚РµРјРѕР№",
            thumbSection: "Р Р°Р·РјРµСЂ РјРёРЅРёР°С‚СЋСЂ РІРёРґРµРѕ", thumbDesc: "РР·РјРµРЅРµРЅРёРµ СЂР°Р·РјРµСЂР° Рё РїСЂРѕРїРѕСЂС†РёР№ РїСЂРµРІСЊСЋ РІРёРґРµРѕ",
            thumbDefault: "РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ (16:9)", thumbSmall: "РњР°Р»РµРЅСЊРєРёРµ (16:9)", thumbMedium: "РЎСЂРµРґРЅРёРµ (4:3)", thumbLarge: "Р‘РѕР»СЊС€РёРµ (1:1)",
            themeSection: "РўРµРјР° РѕРєРЅР° РЅР°СЃС‚СЂРѕРµРє", themeDesc: "Р’РЅРµС€РЅРёР№ РІРёРґ СЌС‚РѕРіРѕ РѕРєРЅР° СЃ РЅР°СЃС‚СЂРѕР№РєР°РјРё",
            themeAuto: "РђРІС‚Рѕ (СЃРёСЃС‚РµРјР°)", themeLight: "РЎРІРµС‚Р»Р°СЏ", themeDark: "РўС‘РјРЅР°СЏ", fontSize: "Р Р°Р·РјРµСЂ С€СЂРёС„С‚Р°:",
            styleSection: "Р¦РІРµС‚РѕРІР°СЏ СЃС…РµРјР°", styleDesc: "РџР°Р»РёС‚СЂР° С†РІРµС‚РѕРІ Рё СЃС‚РёР»СЊ РѕРєРЅР° РЅР°СЃС‚СЂРѕРµРє",
            styleYoutube: "YouTube", styleImproved: "РЈР»СѓС‡С€РµРЅРЅР°СЏ (glass + РІС‹РїР°РґР°СЋС‰РёРµ)", styleMidnight: "РџРѕР»РЅРѕС‡СЊ", styleSunset: "Р—Р°РєР°С‚", styleCustom: "РЎРІРѕСЏ",
            customColorsSection: "РўРѕРЅРєР°СЏ РЅР°СЃС‚СЂРѕР№РєР° С†РІРµС‚РѕРІ", customColorsDesc: "Р СѓС‡РЅР°СЏ РЅР°СЃС‚СЂРѕР№РєР° РѕС‚РґРµР»СЊРЅС‹С… С†РІРµС‚РѕРІ (РїРµСЂРµРѕРїСЂРµРґРµР»СЏРµС‚ С‚РµРєСѓС‰СѓСЋ СЃС…РµРјСѓ)",
            customColorEnabled: "Р’РєР»СЋС‡РёС‚СЊ СЃРІРѕРё С†РІРµС‚Р°", customColorBg: "Р¤РѕРЅ", customColorFg: "РўРµРєСЃС‚",
            customColorPrimary: "РђРєС†РµРЅС‚РЅС‹Р№ С†РІРµС‚", customColorBorder: "Р Р°РјРєРё", customColorBtnBorder: "Р Р°РјРєР° РєРЅРѕРїРєРё",
            customColorBtnFg: "РўРµРєСЃС‚ РєРЅРѕРїРєРё", customColorBtnHoverBg: "РљРЅРѕРїРєР° РїСЂРё РЅР°РІРµРґРµРЅРёРё", customColorBtnHoverFg: "РўРµРєСЃС‚ РєРЅРѕРїРєРё РїСЂРё РЅР°РІРµРґРµРЅРёРё",
            customColorBadgeBg: "Р¤РѕРЅ Р±РµР№РґР¶Р°", customColorBadgeFg: "РўРµРєСЃС‚ Р±РµР№РґР¶Р°",
            customColorInputBg: "Р¤РѕРЅ РІРІРѕРґР°", customColorInputFg: "РўРµРєСЃС‚ РІРІРѕРґР°", customColorInputBorder: "Р Р°РјРєР° РІРІРѕРґР°",
            customColorSelectBg: "Р¤РѕРЅ СЃРїРёСЃРєР°", customColorSelectFg: "РўРµРєСЃС‚ СЃРїРёСЃРєР°", customColorSelectBorder: "Р Р°РјРєР° СЃРїРёСЃРєР°",
            customColorReset: "РЎР±СЂРѕСЃРёС‚СЊ СЃРІРѕРё С†РІРµС‚Р°",
            styleEditorBtn: "РћС‚РєСЂС‹С‚СЊ СЂРµРґР°РєС‚РѕСЂ СЃС‚РёР»РµР№", styleEditorTitle: "Р РµРґР°РєС‚РѕСЂ СЃС‚РёР»РµР№",
            styleEditorPresets: "РџСЂРµСЃРµС‚С‹", styleEditorColors: "Р¦РІРµС‚Р°", styleEditorBackground: "Р¤РѕРЅ", styleEditorCSS: "РЎРІРѕР№ CSS",
            presetSave: "РЎРѕС…СЂР°РЅРёС‚СЊ РїСЂРµСЃРµС‚", presetLoad: "Р—Р°РіСЂСѓР·РёС‚СЊ", presetDelete: "РЈРґР°Р»РёС‚СЊ", presetExport: "Р­РєСЃРїРѕСЂС‚", presetImport: "РРјРїРѕСЂС‚",
            presetName: "РРјСЏ РїСЂРµСЃРµС‚Р°", presetNamePlaceholder: "РњРѕСЏ С‚РµРјР°...", presetSaved: "РџСЂРµСЃРµС‚ СЃРѕС…СЂР°РЅС‘РЅ!",
            presetDeleted: "РџСЂРµСЃРµС‚ СѓРґР°Р»С‘РЅ", presetExported: "РџСЂРµСЃРµС‚ СЃРєРѕРїРёСЂРѕРІР°РЅ РІ Р±СѓС„РµСЂ РѕР±РјРµРЅР°!",
            presetImportPrompt: "Р’СЃС‚Р°РІСЊС‚Рµ JSON РїСЂРµСЃРµС‚Р°:", presetImported: "РџСЂРµСЃРµС‚ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅ!",
            builtinPresets: "Р’СЃС‚СЂРѕРµРЅРЅС‹Рµ С‚РµРјС‹", colorScheme: "Р¦РІРµС‚РѕРІР°СЏ СЃС…РµРјР°",
            presetImportError: "РќРµРІРµСЂРЅС‹Р№ С„РѕСЂРјР°С‚ РїСЂРµСЃРµС‚Р°", presetNoPresets: "РќРµС‚ СЃРѕС…СЂР°РЅС‘РЅРЅС‹С… РїСЂРµСЃРµС‚РѕРІ",
            bgSection: "Р¤РѕРЅРѕРІРѕРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ", bgDesc: "РЈСЃС‚Р°РЅРѕРІРёС‚СЊ С„РѕРЅРѕРІРѕРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ РґР»СЏ РѕРєРЅР° РЅР°СЃС‚СЂРѕРµРє РёР»Рё СЃС‚СЂР°РЅРёС†С‹ YouTube",
            bgUrl: "URL РёР·РѕР±СЂР°Р¶РµРЅРёСЏ", bgUrlPlaceholder: "https://example.com/image.jpg",
            bgApply: "РџСЂРёРјРµРЅРёС‚СЊ", bgClear: "РћС‡РёСЃС‚РёС‚СЊ", bgTarget: "РџСЂРёРјРµРЅРёС‚СЊ Рє",
            bgTargetSettings: "РћРєРЅРѕ РЅР°СЃС‚СЂРѕРµРє", bgTargetPage: "РЎС‚СЂР°РЅРёС†Р° YouTube",
            bgOpacity: "РџСЂРѕР·СЂР°С‡РЅРѕСЃС‚СЊ", bgBlur: "Р Р°Р·РјС‹С‚РёРµ (px)", bgSize: "Р Р°Р·РјРµСЂ",
            bgSizeCover: "Р—Р°РїРѕР»РЅРёС‚СЊ", bgSizeContain: "Р’РїРёСЃР°С‚СЊ", bgSizeAuto: "РђРІС‚Рѕ",
            cssSection: "РЎРІРѕР№ CSS РґР»СЏ YouTube", cssDesc: "РќР°РїРёС€РёС‚Рµ CSS РїСЂР°РІРёР»Р° РґР»СЏ СЃС‚РёР»РёР·Р°С†РёРё СЃС‚СЂР°РЅРёС†С‹ YouTube",
            cssPlaceholder: "/* РџСЂРёРјРµСЂ: СЃРєСЂС‹С‚СЊ Р±РѕРєРѕРІСѓСЋ РїР°РЅРµР»СЊ */\nytd-mini-guide-renderer {\n  display: none !important;\n}",
            cssApply: "РџСЂРёРјРµРЅРёС‚СЊ CSS", cssClear: "РћС‡РёСЃС‚РёС‚СЊ CSS", cssApplied: "РЎРІРѕР№ CSS РїСЂРёРјРµРЅС‘РЅ!",
            styleEditorClose: "Р—Р°РєСЂС‹С‚СЊ",
            warning: 'РџРѕР»РЅР°СЏ РІРµСЂСЃРёСЏ СЂР°СЃС€РёСЂРµРЅРёСЏ РґРѕСЃС‚СѓРїРЅР° С‚РѕР»СЊРєРѕ РІ <a href="https://browser.yandex.com/?lang=ru" target="_blank" style="color: var(--yt-spec-brand-button-background, #065fd4); text-decoration: none; font-weight: bold;">РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ</a>.',
            languageButton: "РЇР·С‹Рє", ru: "Р СѓСЃСЃРєРёР№", en: "РђРЅРіР»РёР№СЃРєРёР№", newMark: "РЅРѕРІРѕРµ", expMark: "СЌРєСЃРї",
            playlistModeNotification: "Р’РєР»СЋС‡РµРЅР° С„СѓРЅРєС†РёСЏ РџР»РµР№Р»РёСЃС‚С‹ РЅР° РєР°РЅР°Р»Р°С…, РѕРїС‚РёРјРёР·Р°С†РёСЏ Р±СЂР°СѓР·РµСЂР° РѕС‚РєР»СЋС‡РµРЅР°!",
            exitPlaylistModeNotification: "Р Р°СЃС€РёСЂРµРЅРёРµ РїРµСЂРµР·Р°РіСЂСѓР·РёС‚СЃСЏ С‡РµСЂРµР· {seconds} СЃРµРєСѓРЅРґС‹ РґР»СЏ РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ С„СѓРЅРєС†РёР№"
        }
    };

    // Р’СЃС‚СЂРѕРµРЅРЅС‹Рµ С‚РµРјС‹ (dark/light/common) вЂ” РёСЃРїРѕР»СЊР·СѓСЋС‚СЃСЏ РµСЃР»Рё @resource РЅРµ Р·Р°РіСЂСѓР·РёР»СЃСЏ
    const _BUILTIN_THEMES = {
        // --- РўРµРјР° YouTube (Р°РІС‚Рѕ) ---
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
}`,
        // --- РЈР»СѓС‡С€РµРЅРЅР°СЏ С‚РµРјР° (glass + СЃС‚РёР»РёР·РѕРІР°РЅРЅС‹Рµ YouTube-РІС‹РїР°РґР°СЋС‰РёРµ) ---
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
        // --- РўРµРјР° Midnight (С„РёРѕР»РµС‚РѕРІР°СЏ РЅРѕС‡СЊ) ---
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
}`,
        // --- РўРµРјР° Sunset (С‚С‘РїР»С‹Р№ Р·Р°РєР°С‚) ---
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
}`
    };
    const _BUILTIN_THEME_CSS = _BUILTIN_THEMES.youtube;

    // Р—Р°РіСЂСѓР·РєР°: @resource в†’ РІСЃС‚СЂРѕРµРЅРЅС‹Рµ РґР°РЅРЅС‹Рµ
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

    // РўРµРјР°: РІС‹Р±РѕСЂ РїРѕ settingsStyle, @resource в†’ РІСЃС‚СЂРѕРµРЅРЅР°СЏ
    function _getThemeRaw(styleName) {
        return _BUILTIN_THEMES[styleName] || _BUILTIN_THEMES.youtube;
    }

    // --- РЇР·С‹Рє РёРЅС‚РµСЂС„РµР№СЃР° ---

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

    // --- Р Р°СЃС€РёСЂРµРЅРЅРѕРµ РѕРїСЂРµРґРµР»РµРЅРёРµ РЇРЅРґРµРєСЃ.Р‘СЂР°СѓР·РµСЂР° (СЃ РєСЌС€РёСЂРѕРІР°РЅРёРµРј) ---

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

    // --- РџСЂРѕРІРµСЂРєР° РћРЎ ---

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

    // --- РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ ---
    const defaultConfig = {
        hideChips: false,
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
        fixRussiaThrottle: false,
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

    // --- Р‘РµР·РѕРїР°СЃРЅРѕРµ С…СЂР°РЅРёР»РёС‰Рµ РґР»СЏ РЅР°СЃС‚СЂРѕРµРє ---
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

    // --- Р—Р°РіСЂСѓР·РєР° РєРѕРЅС„РёРіСѓСЂР°С†РёРё ---
    let config = (function() {
        try {
            const saved = storage.get('ytEnhancerConfig');
            return saved ? {...defaultConfig, ...saved} : {...defaultConfig};
        } catch (e) {
            return {...defaultConfig};
        }
    })();

    // --- Р¤РёРєСЃС‹ РґР»СЏ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂР° ---

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

    // --- РЎРєСЂС‹С‚РёРµ СѓРІРµРґРѕРјР»РµРЅРёСЏ Рѕ Р·Р°РјРµРґР»РµРЅРёРё YouTube РІ Р Р¤ ---

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

    // --- РћСЃРЅРѕРІРЅС‹Рµ С„СѓРЅРєС†РёРё ---

    function applyMainFeatures() {
        if (isPlaylistModeActive && config.playlistModeFeature) {
            return;
        }
        let mainCSS = '';
        // РЎРєСЂС‹РІР°С‚СЊ С‡РёРїСЃС‹ С‚РѕР»СЊРєРѕ РЅР° РіР»Р°РІРЅРѕР№ СЃС‚СЂР°РЅРёС†Рµ Рё РІ СЂР°Р·РґРµР»Р°С…, РЅРѕ РЅРµ РЅР° РІРєР»Р°РґРєРµ Videos
        if (config.hideChips && /^\/$/.test(location.pathname)) {
            mainCSS += `
                ytd-feed-filter-chip-bar-renderer,
                yt-chip-cloud-renderer,
                yt-related-chip-cloud-renderer,
                #chips-wrapper.ytd-rich-grid-renderer {
                    display: none !important;
                }
            `;
        }
        // РџСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ РїРѕРєР°Р·С‹РІР°РµРј С‡РёРїСЃС‹ РЅР° РІРєР»Р°РґРєРµ Videos
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
                /* РЎРєСЂС‹РІР°РµРј СЃРµРєС†РёРё "Р•С‰С‘ С‚РµРјС‹" (topic shelves СЃ С‡РёРїСЃР°РјРё) */
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
                /* Р”РѕРї. СЃРµР»РµРєС‚РѕСЂС‹ РґР»СЏ РЅРѕРІС‹С… РІРµСЂСЃРёР№ YouTube */
                ytd-rich-section-renderer[is-shorts],
                [is-shorts].ytd-rich-section-renderer,
                ytd-reel-shelf-renderer.ytd-item-section-renderer {
                    display: none !important;
                }
            `;
        }
        addStyles(mainCSS, 'yt-enhancer-main-features');
        if (config.fixChannelCard) {
            fixChannelCardOnChannelTabs();
        }
        // Always restore chips on Videos tab so hiding chips on home never breaks channel sorting
        restoreChipsOnVideosTab();
    }

    // --- Р¤РёРєСЃ РєР°СЂС‚РѕС‡РєРё РєР°РЅР°Р»Р° РЅР° РІСЃРµС… РІРєР»Р°РґРєР°С… ---

    function fixChannelCardOnChannelTabs() {
        if ((isPlaylistModeActive && config.playlistModeFeature)) return;
        const channelUrlRegex = /^\/@[^\/]+(\/(videos|featured|shorts|playlists|community|about|streams))?\/?$/;
        const mainTabRegex = /^\/@[^\/]+\/?$/;
        if (!channelUrlRegex.test(location.pathname)) return;
        addStyles(`
            /* РЈРЅРёРІРµСЂСЃР°Р»СЊРЅС‹Р№ С„РёРєСЃ РґР»СЏ С€Р°РїРєРё РєР°РЅР°Р»Р° */
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
            /* Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ СЃС‚РёР»Рё РґР»СЏ РјРѕР±РёР»СЊРЅРѕР№ РІРµСЂСЃРёРё */
            ytd-page-manager[page-subtype="channels"] #header.ytd-rich-grid-renderer {
                position: sticky !important;
                top: 48px !important;
                z-index: 1002 !important;
            }
            /* РЈСЃРёР»РµРЅРЅС‹Р№ С„РёРєСЃ РґР»СЏ РіР»Р°РІРЅРѕР№ РІРєР»Р°РґРєРё РєР°РЅР°Р»Р° */
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

    // --- РџСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµРј С‡РёРїСЃС‹ РЅР° videos ---

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

    // --- Р”РѕР±Р°РІР»РµРЅРёРµ СЃС‚РёР»РµР№ РІ DOM (РѕРїС‚РёРјРёР·РёСЂРѕРІР°РЅРЅРѕРµ) ---

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

    // --- РЈС‚РёР»РёС‚Р° РґРµР±Р°СѓРЅСЃР° ---

    function debounce(fn, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // --- РЈРїСЂР°РІР»СЏРµРјС‹Р№ MutationObserver ---

    function createManagedObserver(target, callback, options) {
        const observer = new MutationObserver(callback);
        observer.observe(target, options);
        _observers.push(observer);
        return observer;
    }

    // --- РџСЂРёРјРµРЅРµРЅРёРµ СЃС‚РёР»РµР№ ---

    function applyGlobalStyles() {
        const styles = generateStyles();
        addStyles(styles, 'yt-enhancer-main');
        cleanupSpacing();
    }

    // --- РћС‡РёСЃС‚РєР° РїСЂРѕР±РµР»РѕРІ ---

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
            /* Р’РµСЂСЃРёСЏ СЃРІРµСЂС…Сѓ */
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
            /* РљРЅРѕРїРєР° Р·Р°РєСЂС‹С‚РёСЏ (РєСЂРµСЃС‚РёРє) вЂ” С‚РѕР»СЊРєРѕ РІСЂР°С‰РµРЅРёРµ, Р±РµР· СЃРјРµРЅС‹ С†РІРµС‚Р° Рё С„РѕРЅР° */
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
                color: inherit !important; /* РќР°СЃР»РµРґСѓРµС‚ С†РІРµС‚, РЅРµ РјРµРЅСЏРµС‚ РµРіРѕ */
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
            /* РЎС‚РёР»Рё РґР»СЏ СѓРІРµРґРѕРјР»РµРЅРёСЏ Рѕ РїР»РµР№Р»РёСЃС‚Р°С… */
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
        // --- THEME: Р·Р°РіСЂСѓР·РєР° РёР· РІРЅРµС€РЅРµРіРѕ CSS РёР»Рё РІСЃС‚СЂРѕРµРЅРЅС‹С… С‚РµРј ---
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
        const _themeCSS = _parseThemeCSS(themeRaw, extCSS ? themeStyle : null);
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

    // --- Р’СЃРїРѕРјРѕРіР°С‚РµР»СЊРЅС‹Рµ С„СѓРЅРєС†РёРё ---

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

    // --- UI РЅР°СЃС‚СЂРѕРµРє ---

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
        // --- Р’РµСЂСЃРёСЏ СЃРІРµСЂС…Сѓ ---
        const versionDiv = document.createElement('div');
        versionDiv.id = 'yt-enhancer-version';
        versionDiv.textContent = L.version;
        dialog.appendChild(versionDiv);
        // --- Р—Р°РіРѕР»РѕРІРѕРє Рё РєСЂРµСЃС‚РёРє ---
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
        // --- Р’РєР»Р°РґРєРё ---
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
        // --- РљРЅРѕРїРєРё СЃРѕС…СЂР°РЅРµРЅРёСЏ/СЃР±СЂРѕСЃР° ---
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
                    config[input.id] = parseInt(input.value) || 0;
                } else {
                    config[input.id] = input.value;
                }
            });
            // РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРµ СѓРїСЂР°РІР»РµРЅРёРµ СЂРµР¶РёРјРѕРј РѕРїС‚РёРјРёР·Р°С†РёРё
            const playlistModeCheckbox = dialog.querySelector('#playlistModeFeature');
            if (playlistModeCheckbox) {
                const perfModeCheckbox = dialog.querySelector('#yandexPerformanceMode');
                if (perfModeCheckbox) {
                    if (playlistModeCheckbox.checked) {
                        // Р•СЃР»Рё РІРєР»СЋС‡РµРЅ СЂРµР¶РёРј РїР»РµР№Р»РёСЃС‚РѕРІ, РѕС‚РєР»СЋС‡Р°РµРј СЂРµР¶РёРј РѕРїС‚РёРјРёР·Р°С†РёРё
                        perfModeCheckbox.checked = false;
                        perfModeCheckbox.disabled = true;
                        if (perfModeCheckbox.parentElement) {
                            perfModeCheckbox.parentElement.style.opacity = '0.5';
                        }
                        config.yandexPerformanceMode = false;
                    } else {
                        // Р•СЃР»Рё РІС‹РєР»СЋС‡РµРЅ СЂРµР¶РёРј РїР»РµР№Р»РёСЃС‚РѕРІ, РІРєР»СЋС‡Р°РµРј СЂРµР¶РёРј РѕРїС‚РёРјРёР·Р°С†РёРё
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

    // --- РћСЃРЅРѕРІРЅР°СЏ РІРєР»Р°РґРєР° ---

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
        fixesSection.appendChild(createCheckbox('fixRussiaThrottle', L.fixRussiaThrottle, config.fixRussiaThrottle, L.fixRussiaThrottleDesc, false, true));
        container.appendChild(fixesSection);
    }

    // --- РЇРЅРґРµРєСЃ РІРєР»Р°РґРєР° (РЇРЅРґРµРєСЃ-Р¤РёРєСЃС‹) ---

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

        // --- РЎРµРєС†РёСЏ: Р¤РёРєСЃС‹ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂР° ---
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

        // --- РЎРµРєС†РёСЏ: РќР°СЃС‚СЂРѕР№РєРё СЃРµС‚РєРё ---
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
            input.style.border = '1px solid var(--enhancer-input-border, #ddd)';
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
        // --- РЎРµРєС†РёСЏ: Р­РєСЃРїРµСЂРёРјРµРЅС‚Р°Р»СЊРЅС‹Рµ ---
        const expSection = section(L.yandexExpSection, L.yandexExpDesc);
        expSection.appendChild(createCheckbox(
            'yandexGridFix', L.yandexGridFix, config.yandexGridFix, L.yandexGridFixDesc
        ));
        const perfModeCheckbox = createCheckbox(
            'yandexPerformanceMode', L.yandexPerf, config.yandexPerformanceMode, L.yandexPerfDesc
        );
        // Р”РѕР±Р°РІР»СЏРµРј РѕР±СЂР°Р±РѕС‚С‡РёРє РёР·РјРµРЅРµРЅРёСЏ РґР»СЏ С‡РµРєР±РѕРєСЃР° РїР»РµР№Р»РёСЃС‚РѕРІ
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

    // --- Р’РЅРµС€РЅРёР№ РІРёРґ РІРєР»Р°РґРєР° ---

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
        // --- РЇР·С‹Рє РёРЅС‚РµСЂС„РµР№СЃР° РІС‹РїР°РґР°СЋС‰РёРј СЃРїРёСЃРєРѕРј ---
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
        // --- РЎРјРµРЅР° СЏР·С‹РєР° РїСЂРё РІС‹Р±РѕСЂРµ ---
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

    // --- Style Editor (РїРѕР»РЅС‹Р№ СЂРµРґР°РєС‚РѕСЂ СЃС‚РёР»РµР№) ---

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
        editorTabNames.forEach((name, i) => {
            const tab = document.createElement('button');
            tab.textContent = name;
            tab.style.cssText = `background:none!important;border:none!important;border-bottom:2px solid transparent;padding:10px 16px;cursor:pointer;font-weight:600;font-size:0.95em;color:var(--enhancer-tab-inactive,#888);transition:all 0.15s;`;
            if (i === 0) { tab.style.color = 'var(--enhancer-primary,#3ea6ff)'; tab.style.borderBottomColor = 'var(--enhancer-primary,#3ea6ff)'; }
            const content = document.createElement('div');
            content.style.cssText = `padding:18px 22px;display:${i === 0 ? 'block' : 'none'};`;
            tab.addEventListener('click', () => {
                editorTabs.forEach(t => { t.style.color = 'var(--enhancer-tab-inactive,#888)'; t.style.borderBottomColor = 'transparent'; });
                tab.style.color = 'var(--enhancer-primary,#3ea6ff)';
                tab.style.borderBottomColor = 'var(--enhancer-primary,#3ea6ff)';
                editorPanels.forEach((p, j) => { p.style.display = j === i ? 'block' : 'none'; });
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

        // Helper: parse any CSS color to hex (for color input)
        function colorToHex(str) {
            if (!str) return '#000000';
            if (/^#[0-9a-f]{6}$/i.test(str)) return str;
            const d = document.createElement('div');
            d.style.color = str;
            document.body.appendChild(d);
            const computed = getComputedStyle(d).color;
            d.remove();
            const m = computed.match(/(\d+)/g);
            if (m && m.length >= 3) return '#' + m.slice(0,3).map(c => (+c).toString(16).padStart(2,'0')).join('');
            return '#000000';
        }

        const colorInputs = {};

        colorFields.forEach(([key, label]) => {
            const cell = document.createElement('div');
            cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;border-radius:10px;background:var(--enhancer-input-bg,#1f1f1f);border:1px solid var(--enhancer-input-border,#333);transition:all 0.2s;';
            // Color + text input row
            const colorRow = document.createElement('div');
            colorRow.style.cssText = 'display:flex;align-items:center;gap:4px;width:100%;';
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = colorToHex(cc[key]);
            colorInput.dataset.colorKey = key;
            colorInput.style.cssText = 'width:32px;height:26px;border:none;border-radius:6px;cursor:pointer;padding:0;background:none;flex-shrink:0;';
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = cc[key] || '';
            textInput.placeholder = '#hex / rgba()';
            textInput.style.cssText = 'flex:1;min-width:0;padding:3px 5px;font-size:0.7em;border-radius:5px;border:1px solid var(--enhancer-input-border,#333);background:var(--enhancer-input-bg,#1a1a1a);color:var(--enhancer-input-fg,#ccc);font-family:monospace;';
            colorRow.appendChild(colorInput);
            colorRow.appendChild(textInput);
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
                cc[key] = '';
                config.customColors = cc;
                storage.set('ytEnhancerConfig', config);
                if (config.customColorsEnabled) applyGlobalStyles();
            });
            colorInput.addEventListener('input', () => {
                textInput.value = colorInput.value;
                cc[key] = colorInput.value;
                config.customColors = cc;
                storage.set('ytEnhancerConfig', config);
                if (config.customColorsEnabled) applyGlobalStyles();
            });
            textInput.addEventListener('change', () => {
                const v = textInput.value.trim();
                cc[key] = v;
                config.customColors = cc;
                if (/^#[0-9a-f]{6}$/i.test(v)) colorInput.value = v;
                storage.set('ytEnhancerConfig', config);
                if (config.customColorsEnabled) applyGlobalStyles();
            });
            colorInputs[key] = { colorInput, textInput };
            cell.appendChild(colorRow);
            cell.appendChild(lbl);
            cell.appendChild(clearBtn);
            grid.appendChild(cell);
        });
        controlsWrapper.appendChild(grid);

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = L.customColorReset;
        resetBtn.style.cssText = 'margin-top:14px;padding:8px 18px;font-size:0.9em;cursor:pointer;';
        resetBtn.addEventListener('click', () => {
            Object.keys(cc).forEach(k => { cc[k] = ''; });
            Object.values(colorInputs).forEach(({ colorInput, textInput }) => { colorInput.value = '#000000'; textInput.value = ''; });
            config.customColors = cc;
            config.customColorsEnabled = false;
            toggleCb.checked = false;
            updateControlsState(false);
            storage.set('ytEnhancerConfig', config);
            applyGlobalStyles();
        });
        controlsWrapper.appendChild(resetBtn);

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
        builtinGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;';

        const builtinThemes = [
            { key: 'youtube', label: L.styleYoutube },
            { key: 'improved', label: L.styleImproved },
            { key: 'midnight', label: L.styleMidnight },
            { key: 'sunset', label: L.styleSunset }
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

    // --- РџРѕРєР°Р·Р°С‚СЊ СѓРІРµРґРѕРјР»РµРЅРёРµ ---

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

    // --- РџРѕРєР°Р·Р°С‚СЊ РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёРµ Рѕ РїР»РµР№Р»РёСЃС‚Р°С… ---

    function showPlaylistWarning() {
        if (config.playlistModeFeature || !PLAYLIST_URL_REGEX.test(location.pathname)) return;
        const warning = document.createElement('div');
        warning.className = 'yt-enhancer-playlist-warning';
        setInnerHTML(warning, L.playlistModeWarning);
        document.body.appendChild(warning);
        setTimeout(() => warning.classList.add('show'), 1000);
        // Р”РѕР±Р°РІР»СЏРµРј РѕР±СЂР°Р±РѕС‚С‡РёРє РєР»РёРєР° РґР»СЏ РѕС‚РєСЂС‹С‚РёСЏ РЅР°СЃС‚СЂРѕРµРє
        warning.addEventListener('click', () => {
            createSettingsUI();
            const mainTab = document.querySelector('#yt-enhancer-settings .yt-enhancer-tab[data-tab="0"]');
            if (mainTab) mainTab.click();
        });
        // РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРµ СЃРєСЂС‹С‚РёРµ С‡РµСЂРµР· 10 СЃРµРєСѓРЅРґ
        setTimeout(() => {
            warning.classList.remove('show');
            setTimeout(() => warning.remove(), 300);
        }, 10000);
    }

    // --- Р”РѕР±Р°РІРёС‚СЊ РєРЅРѕРїРєСѓ РІ РёРЅС‚РµСЂС„РµР№СЃ YouTube ---

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

    // --- РџСЂРѕРІРµСЂРєР° Рё Р°РєС‚РёРІР°С†РёСЏ СЂРµР¶РёРјР° РїР»РµР№Р»РёСЃС‚РѕРІ ---

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

    // --- РђРєС‚РёРІР°С†РёСЏ СЂРµР¶РёРјР° РїР»РµР№Р»РёСЃС‚РѕРІ ---

    function activatePlaylistMode() {
        if (!config.playlistModeFeature) return;
        isPlaylistModeActive = true;
        document.documentElement.classList.add(PLAYLIST_MODE_CLASS);
        // РџРѕРєР°Р·С‹РІР°РµРј СѓРІРµРґРѕРјР»РµРЅРёРµ
        showNotification(L.playlistModeNotification, 5000);
        // Р”РѕР±Р°РІР»СЏРµРј СЃС‚РёР»Рё РґР»СЏ СЂРµР¶РёРјР° РїР»РµР№Р»РёСЃС‚РѕРІ
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

    // --- Р”РµР°РєС‚РёРІР°С†РёСЏ СЂРµР¶РёРјР° РїР»РµР№Р»РёСЃС‚РѕРІ ---

    function deactivatePlaylistMode() {
        if (!config.playlistModeFeature) return;
        isPlaylistModeActive = false;
        document.documentElement.classList.remove(PLAYLIST_MODE_CLASS);
        // РџРѕРєР°Р·С‹РІР°РµРј СѓРІРµРґРѕРјР»РµРЅРёРµ Рѕ РїРµСЂРµР·Р°РіСЂСѓР·РєРµ
        const notification = showNotification(
            L.exitPlaylistModeNotification.replace('{seconds}', '2'),
            2000
        );
        // Р”РѕР±Р°РІР»СЏРµРј РѕС‚СЃС‡РµС‚ РІСЂРµРјРµРЅРё РІ СѓРІРµРґРѕРјР»РµРЅРёРµ
        let secondsLeft = 2;
        const interval = setInterval(() => {
            secondsLeft--;
            if (notification && notification.textContent) {
                notification.textContent = L.exitPlaylistModeNotification.replace('{seconds}', secondsLeft);
            }
        }, 1000);
        // РџРµСЂРµР·Р°РіСЂСѓР¶Р°РµРј СЃС‚СЂР°РЅРёС†Сѓ С‡РµСЂРµР· 2 СЃРµРєСѓРЅРґС‹
        setTimeout(() => {
            clearInterval(interval);
            location.reload();
        }, 2000);
    }

    // --- РќРѕРІС‹Рµ С„РёРєСЃС‹ YouTube РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ ---
    // РџСЂРёРЅСѓРґРёС‚РµР»СЊРЅС‹Р№ H264 РєРѕРґРµРє (РѕС‚РєР»СЋС‡Р°РµС‚ VP9/AV1 РґР»СЏ СЃС‚Р°Р±РёР»СЊРЅРѕСЃС‚Рё)

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
    // РђРІС‚Рѕ-Р·Р°РєСЂС‹С‚РёРµ РїРѕРїР°РїР° "Р’РёРґРµРѕ РїСЂРёРѕСЃС‚Р°РЅРѕРІР»РµРЅРѕ"

    function applyFixAutoPause() {
        if (!config.fixAutoPause || (isPlaylistModeActive && config.playlistModeFeature)) return;
        if (_unsafeWin.__ytEnhancerAutoPauseApplied) return;
        _unsafeWin.__ytEnhancerAutoPauseApplied = true;
        const dismissPause = debounce(() => {
            // РљРЅРѕРїРєР° "Р”Р°" / "Yes" РІ РїРѕРїР°РїРµ "Р’РёРґРµРѕ РїСЂРёРѕСЃС‚Р°РЅРѕРІР»РµРЅРѕ. РџСЂРѕРґРѕР»Р¶РёС‚СЊ РїСЂРѕСЃРјРѕС‚СЂ?"
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
            // РЎРєСЂС‹С‚СЊ "Р’СЃРµ РµС‰Рµ СЃРјРѕС‚СЂРёС‚Рµ?" / "Still watching?"
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
    // Р¤РёРєСЃ Р±РµР»РѕР№ РІСЃРїС‹С€РєРё РїСЂРё РЅР°РІРёРіР°С†РёРё РІ С‚РµРјРЅРѕР№ С‚РµРјРµ

    function applyFixDarkFlash() {
        if (!config.fixDarkFlash || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Р¤РёРєСЃРёСЂСѓРµРј С„РѕРЅ СЃС‚СЂР°РЅРёС†С‹ вЂ” РїСЂРµРґРѕС‚РІСЂР°С‰Р°РµРј Р±РµР»СѓСЋ РІСЃРїС‹С€РєСѓ */
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
            /* РњР°СЃС‚С…РµРґ (РІРµСЂС…РЅСЏСЏ РїРѕР»РѕСЃР°: РїРѕРёСЃРє, Р»РѕРіРѕ, РєРЅРѕРїРєРё) вЂ” С„РёРєСЃРёСЂСѓРµРј С„РѕРЅ Рё СѓР±РёСЂР°РµРј РјРµСЂС†Р°РЅРёРµ РїСЂРё СЃРєСЂРѕР»Р»Рµ */
            html[dark] #masthead-container,
            html[dark] ytd-masthead,
            html[dark] #masthead {
                background-color: var(--yt-spec-base-background, #0f0f0f) !important;
                will-change: auto !important;
            }
            /* РџСЂРµРґРѕС‚РІСЂР°С‰Р°РµРј РјРµСЂС†Р°РЅРёРµ РїСЂРё SPA-РЅР°РІРёРіР°С†РёРё */
            html[dark] #content.ytd-app > :not(ytd-masthead):not(ytd-mini-guide-renderer) {
                transition: none !important;
            }
        `, 'yt-enhancer-dark-flash');
    }
    // Р¤РёРєСЃ СЃРµС‚РєРё РЅР° СЃС‚СЂР°РЅРёС†Рµ РїРѕРёСЃРєР°

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
    // Р¤РёРєСЃ РјРёРЅРё-РїР»РµРµСЂР°

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
            /* РџСЂР°РІРёР»СЊРЅРѕРµ РѕС‚РѕР±СЂР°Р¶РµРЅРёРµ РјРёРЅРё-РїР»РµРµСЂР° РїРѕРІРµСЂС… РєРѕРЅС‚РµРЅС‚Р° */
            ytd-miniplayer[active] .miniplayer {
                box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
            }
        `, 'yt-enhancer-miniplayer');
    }
    // РћРїС‚РёРјРёР·Р°С†РёСЏ СЃРєСЂРѕР»Р»Р°

    function applyScrollOptimization() {
        if (!config.scrollOptimization || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* РћРїС‚РёРјРёР·Р°С†РёСЏ СЂРµРЅРґРµСЂРёРЅРіР° РїСЂРё СЃРєСЂРѕР»Р»Рµ */
            ytd-rich-item-renderer,
            ytd-video-renderer,
            ytd-compact-video-renderer,
            ytd-grid-video-renderer {
                content-visibility: auto;
                contain-intrinsic-size: 0 500px;
            }
            /* РћРїС‚РёРјРёР·Р°С†РёСЏ РјРёРЅРёР°С‚СЋСЂ */
            ytd-thumbnail img,
            yt-image img {
                content-visibility: auto;
            }
            /* РСЃРїСЂР°РІР»РµРЅРёРµ РїРѕРґРµСЂРіРёРІР°РЅРёСЏ РїСЂРё РїСЂРѕРєСЂСѓС‚РєРµ */
            #page-manager {
                overflow-anchor: none;
            }
            /* GPU-СѓСЃРєРѕСЂРµРЅРёРµ РґР»СЏ РїР»Р°РІРЅРѕРіРѕ СЃРєСЂРѕР»Р»Р° */
            #contents.ytd-rich-grid-renderer {
                transform: translateZ(0);
                backface-visibility: hidden;
            }
        `, 'yt-enhancer-scroll');
    }
    // Р¤РёРєСЃ Р±РѕРєРѕРІРѕР№ РїР°РЅРµР»Рё

    function applyFixSidebar() {
        if (!config.fixSidebar || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Р¤РёРєСЃ РїСЂРѕРїР°РґР°РЅРёСЏ/РјРµСЂС†Р°РЅРёСЏ Р±РѕРєРѕРІРѕР№ РїР°РЅРµР»Рё */
            app-drawer#guide {
                transform: none !important;
                transition: visibility 0.2s, width 0.2s !important;
            }
            tp-yt-app-drawer#guide[opened] {
                visibility: visible !important;
            }
            /* Р¤РёРєСЃ РЅР°Р»РѕР¶РµРЅРёСЏ Р±РѕРєРѕРІРѕР№ РїР°РЅРµР»Рё РЅР° РєРѕРЅС‚РµРЅС‚ */
            ytd-mini-guide-renderer {
                z-index: 2000 !important;
            }
            /* РџСЂР°РІРёР»СЊРЅРѕРµ РѕС‚РѕР±СЂР°Р¶РµРЅРёРµ РїСЂРё СЃС…Р»РѕРїС‹РІР°РЅРёРё */
            ytd-guide-renderer {
                z-index: 2000 !important;
            }
            /* Р¤РёРєСЃ z-index РґР»СЏ РјР°СЃС‚С…РµРґР° */
            #masthead-container {
                z-index: 2050 !important;
            }
        `, 'yt-enhancer-sidebar');
    }

    // Р¤РёРєСЃ SPA-РЅР°РІРёРіР°С†РёРё РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ
    function applyYandexFixNavigation() {
        if (!config.yandexFixNavigation || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        if (_unsafeWin.__ytEnhancerNavFixApplied) return;
        _unsafeWin.__ytEnhancerNavFixApplied = true;

        // РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂ РёРЅРѕРіРґР° Р»РѕРјР°РµС‚ SPA-РЅР°РІРёРіР°С†РёСЋ YouTube, РІС‹Р·С‹РІР°СЏ РїСЂРѕРїСѓС‰РµРЅРЅС‹Рµ popstate.
        // РЎР»СѓС€Р°РµРј yt-navigate-finish Рё РїСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ URL РІ address bar СЃРѕРІРїР°РґР°РµС‚ СЃ YouTube state.
        document.addEventListener('yt-navigate-finish', () => {
            try {
                const ytApp = document.querySelector('ytd-app');
                if (!ytApp) return;
                // Р¤РѕСЂСЃРёСЂСѓРµРј РѕР±РЅРѕРІР»РµРЅРёРµ page-manager, РµСЃР»Рё РЅР°РІРёРіР°С†РёСЏ Р·Р°Р»РёРїР»Р°
                const pm = document.querySelector('ytd-page-manager');
                if (pm && pm.getCurrentPage && !pm.getCurrentPage()) {
                    // РџСЂРёРЅСѓРґРёС‚РµР»СЊРЅС‹Р№ re-render РїСЂРё Р·Р°СЃС‚СЂСЏРІС€РµР№ РЅР°РІРёРіР°С†РёРё
                    pm.style.display = 'none';
                    pm.offsetHeight; // force reflow
                    pm.style.display = '';
                }
            } catch (e) { /* safe fallback */ }
        });

        // Р¤РёРєСЃ РґР»СЏ РєРЅРѕРїРєРё В«РќР°Р·Р°РґВ» вЂ” СѓР±РµР¶РґР°РµРјСЃСЏ, С‡С‚Рѕ YouTube РєРѕСЂСЂРµРєС‚РЅРѕ РѕР±СЂР°Р±Р°С‚С‹РІР°РµС‚ popstate
        _unsafeWin.addEventListener('popstate', () => {
            setTimeout(() => {
                const ytApp = document.querySelector('ytd-app');
                if (ytApp && ytApp.data && ytApp.data.url !== location.pathname + location.search) {
                    // YouTube state СЂР°СЃСЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅ вЂ” РјСЏРіРєРёР№ РїРµСЂРµР·Р°РїСЂРѕСЃ
                    try {
                        const evt = document.createEvent('CustomEvent');
                        evt.initCustomEvent('yt-navigate', true, true, { href: location.href });
                        document.dispatchEvent(evt);
                    } catch (e) { /* fallback */ }
                }
            }, 100);
        });
    }

    // Р¤РёРєСЃ РґРІРѕР№РЅРѕР№ РїСЂРѕРєСЂСѓС‚РєРё / overflow РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ
    function applyYandexFixScrollbar() {
        if (!config.yandexFixScrollbar || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* РЈСЃС‚СЂР°РЅРµРЅРёРµ РґРІРѕР№РЅРѕРіРѕ СЃРєСЂРѕР»Р»Р±Р°СЂР° РѕС‚ РёРЅСЉРµРєС†РёР№ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂР° */
            html {
                overflow-y: auto !important;
                overflow-x: hidden !important;
            }
            ytd-app {
                overflow: visible !important;
                width: 100% !important;
                max-width: 100vw !important;
            }
            /* Р¤РёРєСЃ РіРѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅРѕРіРѕ overflow РЅР° СЃС‚СЂР°РЅРёС†Рµ РІРёРґРµРѕ */
            ytd-watch-flexy {
                overflow-x: hidden !important;
                max-width: 100vw !important;
            }
            /* Р¤РёРєСЃ overflow РІ page-manager */
            ytd-page-manager {
                overflow-x: hidden !important;
            }
        `, 'yt-enhancer-yandex-scrollbar');
    }

    // Р¤РёРєСЃ РїРѕР»РЅРѕСЌРєСЂР°РЅРЅРѕРіРѕ СЂРµР¶РёРјР° РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ
    function applyYandexFixFullscreen() {
        if (!config.yandexFixFullscreen || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* РњР°РєСЃРёРјР°Р»СЊРЅС‹Р№ z-index РґР»СЏ РїРѕР»РЅРѕСЌРєСЂР°РЅРЅРѕРіРѕ РїР»РµРµСЂР° */
            .html5-video-player.ytp-fullscreen {
                z-index: 2147483647 !important;
                position: fixed !important;
            }
            /* РЎРєСЂС‹РІР°РµРј РЅР°РІРёРіР°С†РёРѕРЅРЅС‹Рµ РїРѕРґСЃРєР°Р·РєРё РЇРЅРґРµРєСЃР° РІ fullscreen */
            .ytp-fullscreen-navbar-hint,
            .video-stream-host__fullscreen-hint {
                display: none !important;
            }
            /* Р¤РёРєСЃ: РЇРЅРґРµРєСЃ РёРЅРѕРіРґР° РѕСЃС‚Р°РІР»СЏРµС‚ masthead РїРѕРІРµСЂС… fullscreen */
            .html5-video-player.ytp-fullscreen ~ #masthead-container,
            ytd-app[masthead-hidden_] #masthead-container {
                z-index: -1 !important;
            }
            /* Р¤РёРєСЃ РјРµСЂС†Р°РЅРёСЏ РїСЂРё РІС…РѕРґРµ/РІС‹С…РѕРґРµ РёР· fullscreen */
            .html5-video-player {
                transition: none !important;
            }
        `, 'yt-enhancer-yandex-fullscreen');
    }

    // Р¤РёРєСЃ СЌР»РµРјРµРЅС‚РѕРІ СѓРїСЂР°РІР»РµРЅРёСЏ РїР»РµРµСЂР° РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ
    function applyYandexFixPlayerControls() {
        if (!config.yandexFixPlayerControls || !isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Р¤РёРєСЃ СЂРµРЅРґРµСЂРёРЅРіР° РЅРёР¶РЅРµР№ РїР°РЅРµР»Рё СѓРїСЂР°РІР»РµРЅРёСЏ РїР»РµРµСЂР° */
            .ytp-chrome-bottom {
                transform: translateZ(0) !important;
                backface-visibility: hidden !important;
            }
            .html5-video-player:not(.ytp-autohide) .ytp-chrome-bottom {
                opacity: 1 !important;
            }
            /* Р¤РёРєСЃ РїСЂРѕРіСЂРµСЃСЃ-Р±Р°СЂР° вЂ” РёРЅРѕРіРґР° РЅРµ СЂРµРЅРґРµСЂРёС‚СЃСЏ РІ РЇРЅРґРµРєСЃРµ */
            .ytp-progress-bar-container {
                transform: translateZ(0) !important;
                will-change: transform !important;
            }
            /* Р¤РёРєСЃ РєРЅРѕРїРєРё РіСЂРѕРјРєРѕСЃС‚Рё */
            .ytp-volume-panel {
                overflow: visible !important;
            }
            /* Р¤РёРєСЃ С‚Р°Р№РјРєРѕРґР° вЂ” РёРЅРѕРіРґР° РѕР±СЂРµР·Р°РµС‚СЃСЏ */
            .ytp-time-display {
                overflow: visible !important;
                white-space: nowrap !important;
            }
            /* Р¤РёРєСЃ РєРЅРѕРїРѕРє РЅР°СЃС‚СЂРѕРµРє Рё СЃСѓР±С‚РёС‚СЂРѕРІ */
            .ytp-settings-button,
            .ytp-subtitles-button,
            .ytp-size-button {
                transform: translateZ(0) !important;
            }
            /* Р¤РёРєСЃ hover-СЌС„С„РµРєС‚РѕРІ РЅР° РєРѕРЅС‚СЂРѕР»Р°С… */
            .ytp-button:hover {
                opacity: 1 !important;
            }
        `, 'yt-enhancer-yandex-controls');
    }

    // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ С„РёРєСЃС‹ РґР»СЏ YouTube РІ РЇРЅРґРµРєСЃ Р‘СЂР°СѓР·РµСЂРµ

    function applyExtraYandexFixes() {
        if (!isYandexBrowser() || (isPlaylistModeActive && config.playlistModeFeature)) return;
        addStyles(`
            /* Р¤РёРєСЃ РїРѕР»РѕРјР°РЅРЅРѕРіРѕ Polymer-СЂРµРЅРґРµСЂРёРЅРіР° */
            ytd-app {
                overflow: visible !important;
            }
            /* Р¤РёРєСЃ РЅРµРєРѕСЂСЂРµРєС‚РЅРѕРіРѕ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РєРѕРјРјРµРЅС‚Р°СЂРёРµРІ */
            ytd-comments#comments {
                display: block !important;
                visibility: visible !important;
            }
            ytd-comments ytd-item-section-renderer {
                display: block !important;
            }
            /* Р¤РёРєСЃ РїСЂРѕРјРѕ-Р±Р°РЅРЅРµСЂРѕРІ Рё РѕРІРµСЂР»РµРµРІ */
            ytd-banner-promo-renderer,
            ytd-statement-banner-renderer,
            ytd-mealbar-promo-renderer {
                display: none !important;
            }
            /* Р¤РёРєСЃ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РїР»РµРµСЂР° */
            .html5-video-player {
                overflow: visible !important;
            }
            .html5-video-player:not(.ytp-autohide) .ytp-chrome-bottom {
                opacity: 1 !important;
            }
            /* Р¤РёРєСЃ Р·Р°Р»РёРїР°РЅРёСЏ СЌР»РµРјРµРЅС‚РѕРІ СѓРїСЂР°РІР»РµРЅРёСЏ РїР»РµРµСЂР° */
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
            /* Р¤РёРєСЃ РєРЅРѕРїРєРё "Skip" РІ СЂРµРєР»Р°РјРµ */
            .ytp-ad-skip-button-container {
                z-index: 1000 !important;
                opacity: 1 !important;
            }
            /* Р¤РёРєСЃ РїСЂРѕР·СЂР°С‡РЅРѕСЃС‚Рё РїРѕРґСЃРєР°Р·РѕРє */
            ytd-engagement-panel-section-list-renderer {
                z-index: 1003 !important;
            }
            /* Р¤РёРєСЃ РїСЂРѕРєСЂСѓС‚РєРё РєРѕРјРјРµРЅС‚Р°СЂРёРµРІ РІ СЂРµР¶РёРјРµ С‚РµР°С‚СЂР° */
            ytd-watch-flexy[theater] #below {
                scroll-behavior: smooth;
            }
            /* Р¤РёРєСЃ РїРѕРІРµРґРµРЅРёСЏ hover preview */
            ytd-thumbnail #mouseover-overlay,
            ytd-thumbnail #hover-overlays {
                will-change: opacity;
            }
        `, 'yt-enhancer-extra-yandex');
    }

    // РЎРєСЂС‹С‚РёРµ РїСѓСЃС‚С‹С… Р±Р»РѕРєРѕРІ (РєРѕРЅС‚РµР№РЅРµСЂС‹, РѕРїСѓСЃС‚РѕС€С‘РЅРЅС‹Рµ uBlock Origin Рё РґСЂСѓРіРёРјРё Р°РґР±Р»РѕРєРµСЂР°РјРё)
    function applyHideEmptyBlocks() {
        if (!config.hideEmptyBlocks || (isPlaylistModeActive && config.playlistModeFeature)) return;
        // CSS: :has() вЂ” СЃРєСЂС‹РІР°РµРј РєРѕРЅС‚РµР№РЅРµСЂС‹, РІРЅСѓС‚СЂРё РєРѕС‚РѕСЂС‹С… СЂРµРєР»Р°РјР° Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅР° Р°РґР±Р»РѕРєРµСЂРѕРј
        addStyles(`
            /* РљРѕРЅС‚РµР№РЅРµСЂС‹ СЃ СЂРµРєР»Р°РјРЅС‹РјРё СЂРµРЅРґРµСЂРµСЂР°РјРё (РїСЂСЏРјС‹Рµ + Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅРЅС‹Рµ uBlock Origin С‡РµСЂРµР· [hidden] / display:none) */
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
            /* РљРѕРЅС‚РµР№РЅРµСЂС‹, РіРґРµ uBlock СЃРїСЂСЏС‚Р°Р» СЃРѕРґРµСЂР¶РёРјРѕРµ С‡РµСЂРµР· [hidden] */
            ytd-rich-item-renderer:has(> [hidden]:only-child),
            ytd-rich-section-renderer:has(> #content > [hidden]:only-child),
            ytd-item-section-renderer:has(> #contents > [hidden]:only-child) {
                display: none !important;
            }
            /* РџСЂСЏРјРѕРµ СЃРєСЂС‹С‚РёРµ СЂРµРєР»Р°РјРЅС‹С… СЌР»РµРјРµРЅС‚РѕРІ */
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
            /* РџРѕР»РЅРѕСЃС‚СЊСЋ РїСѓСЃС‚С‹Рµ СЌР»РµРјРµРЅС‚С‹ */
            ytd-rich-item-renderer:empty,
            ytd-rich-section-renderer:empty,
            ytd-item-section-renderer:empty,
            ytd-shelf-renderer:empty {
                display: none !important;
            }
        `, 'yt-enhancer-hide-empty');

        // JS-РѕС‡РёСЃС‚РєР° вЂ” СѓРґР°Р»СЏРµРј РєРѕРЅС‚РµР№РЅРµСЂС‹, РєРѕС‚РѕСЂС‹Рµ РЅРµ РїРѕР№РјР°Р» CSS
        if (_unsafeWin.__ytEnhancerEmptyBlocksApplied) return;
        _unsafeWin.__ytEnhancerEmptyBlocksApplied = true;

        const adSelectors = [
            'ytd-ad-slot-renderer', 'ytd-display-ad-renderer',
            'ytd-in-feed-ad-layout-renderer', 'ytd-promoted-sparkles-web-renderer',
            'ytd-promoted-video-renderer', 'ytd-banner-promo-renderer',
            'ytd-brand-video-singleton-renderer', 'ytd-statement-banner-renderer'
        ].join(',');

        // РџСЂРѕРІРµСЂРєР°: РєРѕРЅС‚РµР№РЅРµСЂ РІРёР·СѓР°Р»СЊРЅРѕ РїСѓСЃС‚ (uBlock СЃРєСЂС‹Р» РІСЃС‘ С‡РµСЂРµР· style/hidden/class)
        const isVisuallyEmpty = (el) => {
            const children = el.children;
            if (!children.length) return true;
            for (let i = 0; i < children.length; i++) {
                const ch = children[i];
                // Р РµР±С‘РЅРѕРє СЃРєСЂС‹С‚ uBlock С‡РµСЂРµР· hidden Р°С‚СЂРёР±СѓС‚ РёР»Рё display:none РІ style
                if (ch.hidden) continue;
                if (ch.style && ch.style.display === 'none') continue;
                // Р РµР±С‘РЅРѕРє РёРјРµРµС‚ РЅСѓР»РµРІСѓСЋ РІС‹СЃРѕС‚Сѓ (uBlock cosmetic filtering)
                if (ch.offsetHeight === 0 && ch.offsetWidth === 0) continue;
                // Р РµР±С‘РЅРѕРє вЂ” СЌС‚Рѕ РєРѕРЅС‚РµР№РЅРµСЂ #content/#contents, РїСЂРѕРІРµСЂСЏРµРј РµРіРѕ РґРµС‚РµР№
                if (ch.id === 'content' || ch.id === 'contents') {
                    if (isVisuallyEmpty(ch)) continue;
                }
                return false;
            }
            return true;
        };

        const cleanEmptyRenderers = debounce(() => {
            // 1) РЎРєСЂС‹РІР°РµРј РєРѕРЅС‚РµР№РЅРµСЂС‹ СЃ СЂРµРєР»Р°РјРЅС‹РјРё СЂРµРЅРґРµСЂРµСЂР°РјРё РІРЅСѓС‚СЂРё
            document.querySelectorAll('ytd-rich-item-renderer, ytd-rich-section-renderer, ytd-item-section-renderer').forEach(el => {
                if (el.querySelector(adSelectors)) {
                    el.style.display = 'none';
                    return;
                }
            });
            // 2) РЎРєСЂС‹РІР°РµРј rich-item Р±РµР· РІРёРґРµРѕРєРѕРЅС‚РµРЅС‚Р° (РїСѓСЃС‚С‹Рµ РїР»РµР№СЃС…РѕР»РґРµСЂС‹ / Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅРЅС‹Рµ uBlock)
            document.querySelectorAll('ytd-rich-item-renderer').forEach(el => {
                if (el.style.display === 'none') return;
                // Р•СЃС‚СЊ РІРёРґРµРѕ вЂ” РїСЂРѕРїСѓСЃРєР°РµРј (РІРєР»СЋС‡Р°СЏ РЅРѕРІС‹Р№ yt-lockup-view-model)
                if (el.querySelector('ytd-rich-grid-media, a#thumbnail, #video-title-link, ytd-rich-grid-slim-media, yt-lockup-view-model')) return;
                // РџСЂРѕРІРµСЂСЏРµРј РІРёР·СѓР°Р»СЊРЅСѓСЋ РїСѓСЃС‚РѕС‚Сѓ (uBlock СЃРїСЂСЏС‚Р°Р» РєРѕРЅС‚РµРЅС‚)
                if (isVisuallyEmpty(el)) {
                    el.style.display = 'none';
                    return;
                }
                // Р•СЃР»Рё СЌР»РµРјРµРЅС‚ С‚РѕР»СЊРєРѕ РїРѕСЏРІРёР»СЃСЏ вЂ” РґР°С‘Рј 3 СЃРµРє РЅР° Р·Р°РіСЂСѓР·РєСѓ
                if (!el.dataset.ytEnhancerTs) {
                    el.dataset.ytEnhancerTs = Date.now();
                    return;
                }
                if (Date.now() - parseInt(el.dataset.ytEnhancerTs) > 3000) {
                    el.style.display = 'none';
                }
            });
            // 3) РЎРєСЂС‹РІР°РµРј rich-section/item-section, РІРёР·СѓР°Р»СЊРЅРѕ РїСѓСЃС‚С‹Рµ РїРѕСЃР»Рµ uBlock
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

    // РћР±С…РѕРґ Р·Р°РјРµРґР»РµРЅРёСЏ YouTube РІ Р Р¤
    // РћСЃРЅРѕРІРЅРѕР№ РјРµС…Р°РЅРёР·Рј: n-parameter deobfuscation вЂ” YouTube СЃР°Рј Р·Р°РјРµРґР»СЏРµС‚ РІРёРґРµРѕ
    // РґРѕ ~50-100 РљР‘/СЃ РµСЃР»Рё РїР°СЂР°РјРµС‚СЂ 'n' РІ videoplayback URL РЅРµ С‚СЂР°РЅСЃС„РѕСЂРјРёСЂРѕРІР°РЅ.
    // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ: РїРµСЂРµС…РІР°С‚ /youtubei/v1/player РѕС‚РІРµС‚Р° РґР»СЏ РїР°С‚С‡Р° n РґРѕ РїР»РµРµСЂР°,
    // РѕС‡РёСЃС‚РєР° URL РѕС‚ РўРЎРџРЈ-РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂРѕРІ, preconnect Рє CDN.
    // РџСЂРёРјРµС‡Р°РЅРёРµ: РґР»СЏ РїРѕР»РЅРѕРіРѕ РѕР±С…РѕРґР° РўРЎРџРЈ (DPI Р РѕСЃРєРѕРјРЅР°РґР·РѕСЂР°) РЅРµРѕР±С…РѕРґРёРјС‹
    // СЃРёСЃС‚РµРјРЅС‹Рµ СѓС‚РёР»РёС‚С‹ (GoodbyeDPI, zapret) вЂ” userscript РЅРµ РјРѕР¶РµС‚ РІР»РёСЏС‚СЊ РЅР° TLS.
    function applyFixRussiaThrottle() {
        if (!config.fixRussiaThrottle || (isPlaylistModeActive && config.playlistModeFeature)) return;
        if (_unsafeWin.__ytEnhancerThrottleFixApplied) return;
        _unsafeWin.__ytEnhancerThrottleFixApplied = true;

        // --- 1. РџСЂРµРґРІР°СЂРёС‚РµР»СЊРЅРѕРµ РїРѕРґРєР»СЋС‡РµРЅРёРµ Рє CDN ---
        const preconnectHosts = [
            'www.youtube.com', 'i.ytimg.com', 'yt3.ggpht.com',
            'redirector.googlevideo.com', 'manifest.googlevideo.com'
        ];
        preconnectHosts.forEach(host => {
            const pc = document.createElement('link');
            pc.rel = 'preconnect';
            pc.href = 'https://' + host;
            pc.crossOrigin = '';
            const dns = document.createElement('link');
            dns.rel = 'dns-prefetch';
            dns.href = 'https://' + host;
            (document.head || document.documentElement).append(pc, dns);
        });

        // --- 2. РћС‚РєР»СЋС‡РµРЅРёРµ SABR С‡РµСЂРµР· ytcfg ---
        // SABR (Server ABR) вЂ” РїСЂРѕС‚РѕРєРѕР» YouTube 2024+, РіРґРµ РїР»РµРµСЂ РґРµР»Р°РµС‚ POST-Р·Р°РїСЂРѕСЃС‹
        // Рє CDN РЅРѕРґР°Рј РЅР°РїСЂСЏРјСѓСЋ. РўРЎРџРЈ Р±Р»РѕРєРёСЂСѓРµС‚ СЌС‚Рё Р·Р°РїСЂРѕСЃС‹ в†’ РІРёРґРµРѕ Р·Р°РІРёСЃР°РµС‚.
        // Р РµС€РµРЅРёРµ: СѓР±РёСЂР°РµРј SABR-С„Р»Р°РіРё РёР· EXPERIMENT_FLAGS С‡С‚РѕР±С‹ РїР»РµРµСЂ РЅРµ РІРєР»СЋС‡Р°Р» SABR,
        // Рё РїРµСЂРµС…РІР°С‚С‹РІР°РµРј ytcfg.set РґР»СЏ РїРѕРІС‚РѕСЂРЅРѕРіРѕ РїСЂРёРјРµРЅРµРЅРёСЏ РїСЂРё РєР°Р¶РґРѕРј РѕР±РЅРѕРІР»РµРЅРёРё РєРѕРЅС„РёРіР°.
        const _disableSabrInFlags = (flags) => {
            if (!flags || typeof flags !== 'object') return;
            Object.keys(flags).forEach(k => {
                if (/sabr/i.test(k)) flags[k] = false;
            });
        };
        const _applyYtcfgSabrPatch = () => {
            try {
                if (!_unsafeWin.ytcfg || !_unsafeWin.ytcfg.get) return;
                _disableSabrInFlags(_unsafeWin.ytcfg.get('EXPERIMENT_FLAGS'));
            } catch(e) {}
        };
        // РҐСѓРєР°РµРј ytcfg.set вЂ” РїСЂРёРјРµРЅСЏРµРј РїР°С‚С‡ РїСЂРё РєР°Р¶РґРѕРј РІС‹Р·РѕРІРµ
        try {
            if (_unsafeWin.ytcfg && _unsafeWin.ytcfg.set) {
                const _origYtcfgSet = _unsafeWin.ytcfg.set;
                _unsafeWin.ytcfg.set = function() {
                    const ret = _origYtcfgSet.apply(this, arguments);
                    _applyYtcfgSabrPatch();
                    return ret;
                };
            }
        } catch(e) {}
        _applyYtcfgSabrPatch(); // РїСЂРёРјРµРЅСЏРµРј РЅРµРјРµРґР»РµРЅРЅРѕ РµСЃР»Рё ytcfg СѓР¶Рµ РёРЅРёС†РёР°Р»РёР·РёСЂРѕРІР°РЅ

        // --- 3. РР·РІР»РµС‡РµРЅРёРµ n-transform С„СѓРЅРєС†РёРё РёР· player base.js ---
        // YouTube РёСЃРїРѕР»СЊР·СѓРµС‚ РїР°СЂР°РјРµС‚СЂ 'n' РІ videoplayback URLs РєР°Рє throttle-С‚РѕРєРµРЅ.
        // РџР»РµРµСЂ РґРѕР»Р¶РµРЅ С‚СЂР°РЅСЃС„РѕСЂРјРёСЂРѕРІР°С‚СЊ РµРіРѕ С‡РµСЂРµР· СЃРїРµС†РёР°Р»СЊРЅСѓСЋ С„СѓРЅРєС†РёСЋ РёР· base.js.
        // Р•СЃР»Рё С‚СЂР°РЅСЃС„РѕСЂРјР°С†РёСЏ РЅРµ РїСЂРѕРёР·РѕС€Р»Р° (Р±Р°Рі РїР»РµРµСЂР°, Yandex Browser JS engine) вЂ”
        // YouTube throttles РІРёРґРµРѕ. РњС‹ РёР·РІР»РµРєР°РµРј СЌС‚Сѓ С„СѓРЅРєС†РёСЋ Рё РїСЂРёРјРµРЅСЏРµРј СЃР°РјРё.
        let _nTransformFn = null;
        let _nExtractInProgress = false;
        let _nExtractAttempts = 0;
        const _nExtractMaxAttempts = 5;
        const _nCache = Object.create(null);

        const extractNTransform = async () => {
            if (_nTransformFn || _nExtractInProgress || _nExtractAttempts >= _nExtractMaxAttempts) return;
            _nExtractInProgress = true;
            _nExtractAttempts++;
            let success = false;
            try {
                // РќР°С…РѕРґРёРј URL player base.js
                let baseJsUrl = null;

                // РњРµС‚РѕРґ 1: РёР· ytcfg (СЃР°РјС‹Р№ РЅР°РґС‘Р¶РЅС‹Р№ вЂ” РїСЂРёРѕСЂРёС‚РµС‚)
                if (_unsafeWin.ytcfg && _unsafeWin.ytcfg.get) {
                    const jsPath = _unsafeWin.ytcfg.get('PLAYER_JS_URL');
                    if (jsPath) baseJsUrl = jsPath.charAt(0) === '/' ? location.origin + jsPath : jsPath;
                }

                // РњРµС‚РѕРґ 2: РёР· <script> С‚РµРіР°
                if (!baseJsUrl) {
                    const scriptEls = document.querySelectorAll('script[src*="/base.js"]');
                    for (let i = 0; i < scriptEls.length; i++) {
                        if (scriptEls[i].src && scriptEls[i].src.indexOf('player') !== -1) {
                            baseJsUrl = scriptEls[i].src;
                            break;
                        }
                    }
                }

                // РњРµС‚РѕРґ 3: РёР· HTML СЃС‚СЂР°РЅРёС†С‹
                if (!baseJsUrl) {
                    const htmlMatch = document.documentElement.innerHTML.match(/"(?:jsUrl|PLAYER_JS_URL)"\s*:\s*"([^"]*?base\.js[^"]*)"/);
                    if (htmlMatch) {
                        const p = htmlMatch[1];
                        baseJsUrl = p.charAt(0) === '/' ? location.origin + p : p;
                    }
                }

                if (!baseJsUrl) { _nExtractInProgress = false; scheduleRetry(); return; }

                const resp = await _unsafeWin.fetch(baseJsUrl);
                const playerCode = await resp.text();

                // РџР°С‚С‚РµСЂРЅС‹ РґР»СЏ РїРѕРёСЃРєР° С„СѓРЅРєС†РёРё n-С‚СЂР°РЅСЃС„РѕСЂРјР°С†РёРё (РѕР±РЅРѕРІР»РµРЅРѕ 2025).
                // YouTube СЂРµРіСѓР»СЏСЂРЅРѕ РјРµРЅСЏРµС‚ РёРјРµРЅР° РїРµСЂРµРјРµРЅРЅС‹С…, РїРѕСЌС‚РѕРјСѓ РїСЂРѕР±СѓРµРј РЅРµСЃРєРѕР»СЊРєРѕ.
                const namePatterns = [
                    // 2024-2025: РѕСЃРЅРѕРІРЅРѕР№ С„РѕСЂРјР°С‚
                    /\.get\("n"\)\)&&\(b=([a-zA-Z0-9$]{2,4})(?:\[(\d+)\])?\(b\)/,
                    // Р’Р°СЂРёР°РЅС‚ СЃ РѕРґРёРЅРѕС‡РЅС‹РјРё Р±СѓРєРІР°РјРё РїРµСЂРµРјРµРЅРЅС‹С…
                    /\.get\("n"\)\)&&\([a-z]=([a-zA-Z0-9$]{2,4})(?:\[(\d+)\])?\([a-z]\)/,
                    // РЎ СЏРІРЅС‹Рј encodeURIComponent
                    /[a-z]&&[a-z]\.set\("n",\s*encodeURIComponent\(([a-zA-Z0-9$]{2,4})(?:\[(\d+)\])?\([a-z]\)\)\)/,
                    /\.set\([^,]+,\s*encodeURIComponent\(([a-zA-Z0-9$]{2,4})(?:\[(\d+)\])?\([a-z]\)\)\)/,
                    // Р‘РѕР»РµРµ С€РёСЂРѕРєРёРµ РїР°С‚С‚РµСЂРЅС‹ (СѓСЃС‚Р°СЂРµРІС€РёРµ РІРµСЂСЃРёРё РїР»РµРµСЂР°)
                    /\bc\s*&&\s*d\.set\([^,]+\s*,\s*encodeURIComponent\(([a-zA-Z0-9$]+)\(/,
                    /\bc\s*&&\s*[a-z]\.set\([^,]+\s*,\s*encodeURIComponent\(([a-zA-Z0-9$]+)\(/,
                    /\b[cs]\s*&&\s*[adf]\.set\([^,]+\s*,\s*encodeURIComponent\(([a-zA-Z0-9$]+)\(/,
                    // РљРѕРЅРµС† 2024 вЂ” РЅР°С‡Р°Р»Рѕ 2025
                    /\([a-z]\)=[a-z]&&[a-z]\.get\("n"\)\)&&\([a-z]=([a-zA-Z0-9$]{2,4})(?:\[(\d+)\])?\(/,
                    /;[a-z]=([a-zA-Z0-9$]{2,4})(?:\[(\d+)\])?\([a-z]\);[a-z]\.set\("n"/
                ];

                let funcName = null;
                let arrayIdx = null;
                for (let pi = 0; pi < namePatterns.length; pi++) {
                    const m = playerCode.match(namePatterns[pi]);
                    if (m) {
                        funcName = m[1];
                        arrayIdx = m[2] !== undefined ? parseInt(m[2], 10) : null;
                        break;
                    }
                }
                if (!funcName) { _nExtractInProgress = false; scheduleRetry(); return; }

                // РР·РІР»РµРєР°РµРј С‚РµР»Рѕ С„СѓРЅРєС†РёРё РёР· player code
                const escName = funcName.replace(/[$^.*+?{}()|[\]\\]/g, '\\$&');
                let funcBody = null;
                let funcStartIdx = -1;

                // РџР°С‚С‚РµСЂРЅ: var FUNC=[function(a){...}];
                if (arrayIdx !== null) {
                    const arrRe = new RegExp('var\\s+' + escName + '\\s*=\\s*\\[');
                    const arrMatch = arrRe.exec(playerCode);
                    if (arrMatch) funcStartIdx = arrMatch.index;
                }

                // РџР°С‚С‚РµСЂРЅ: var FUNC=function(a){...}  РёР»Рё  FUNC=function(a){...}
                if (funcStartIdx === -1) {
                    const varRe = new RegExp('(?:var\\s+)?' + escName + '\\s*=\\s*function\\s*\\(');
                    const varMatch = varRe.exec(playerCode);
                    if (varMatch) funcStartIdx = varMatch.index;
                }

                // РџР°С‚С‚РµСЂРЅ: function FUNC(a){...}
                if (funcStartIdx === -1) {
                    const fnRe = new RegExp('function\\s+' + escName + '\\s*\\(');
                    const fnMatch = fnRe.exec(playerCode);
                    if (fnMatch) funcStartIdx = fnMatch.index;
                }

                if (funcStartIdx === -1) { _nExtractInProgress = false; scheduleRetry(); return; }

                // РќР°С…РѕРґРёРј Р·Р°РєСЂС‹РІР°СЋС‰СѓСЋ СЃРєРѕР±РєСѓ
                let ci = funcStartIdx;
                while (ci < playerCode.length && playerCode.charAt(ci) !== '{' && playerCode.charAt(ci) !== '[') ci++;
                const openCh = playerCode.charAt(ci);
                const closeCh = openCh === '{' ? '}' : ']';
                let depth = 0;
                for (; ci < playerCode.length; ci++) {
                    if (playerCode.charAt(ci) === openCh) depth++;
                    else if (playerCode.charAt(ci) === closeCh) { depth--; if (depth === 0) break; }
                }
                funcBody = playerCode.substring(funcStartIdx, ci + 1) + ';';

                // РР·РІР»РµРєР°РµРј РІСЃРїРѕРјРѕРіР°С‚РµР»СЊРЅС‹Рµ РѕР±СЉРµРєС‚С‹, РЅР° РєРѕС‚РѕСЂС‹Рµ СЃСЃС‹Р»Р°РµС‚СЃСЏ С„СѓРЅРєС†РёСЏ
                // РС‰РµРј РїР°С‚С‚РµСЂРЅС‹ РІРёРґР° OBJNAME.method( РІРЅСѓС‚СЂРё С‚РµР»Р° С„СѓРЅРєС†РёРё
                const helperRe = /\b([a-zA-Z_$][a-zA-Z0-9_$]{1,6})\.[a-zA-Z_$]\w*\s*\(/g;
                const knownGlobals = ['window','document','console','Math','String','Array','Object',
                    'Number','parseInt','parseFloat','RegExp','JSON','Date','Error','undefined',
                    'encodeURIComponent','decodeURIComponent','NaN','Infinity','isNaN','isFinite'];
                const helpers = new Set();
                let hm;
                while ((hm = helperRe.exec(funcBody)) !== null) {
                    if (knownGlobals.indexOf(hm[1]) === -1 && hm[1] !== funcName) {
                        helpers.add(hm[1]);
                    }
                }

                let helperCode = '';
                helpers.forEach(function(objName) {
                    const escObj = objName.replace(/[$^.*+?{}()|[\]\\]/g, '\\$&');
                    const objRe = new RegExp('var\\s+' + escObj + '\\s*=\\s*\\{');
                    const objMatch = objRe.exec(playerCode);
                    if (objMatch) {
                        let oi = objMatch.index;
                        while (oi < playerCode.length && playerCode.charAt(oi) !== '{') oi++;
                        let od = 0;
                        for (; oi < playerCode.length; oi++) {
                            if (playerCode.charAt(oi) === '{') od++;
                            else if (playerCode.charAt(oi) === '}') { od--; if (od === 0) break; }
                        }
                        helperCode += playerCode.substring(objMatch.index, oi + 1) + ';\n';
                    }
                });

                // РЎРѕР±РёСЂР°РµРј Рё РІС‹РїРѕР»РЅСЏРµРј С„СѓРЅРєС†РёСЋ
                const returnExpr = arrayIdx !== null ? funcName + '[' + arrayIdx + ']' : funcName;
                const fn = new Function(helperCode + funcBody + '\nreturn ' + returnExpr + ';')();

                // Р’Р°Р»РёРґР°С†РёСЏ: С„СѓРЅРєС†РёСЏ РґРѕР»Р¶РЅР° РІРѕР·РІСЂР°С‰Р°С‚СЊ СЃС‚СЂРѕРєСѓ, РѕС‚Р»РёС‡РЅСѓСЋ РѕС‚ РІС…РѕРґРЅРѕР№
                if (typeof fn !== 'function') { _nExtractInProgress = false; scheduleRetry(); return; }
                const testResult = fn('tQ6oLS-i_e8');
                if (typeof testResult !== 'string' || testResult === 'tQ6oLS-i_e8') { _nExtractInProgress = false; scheduleRetry(); return; }

                _nTransformFn = fn;
                success = true;
            } catch (e) {
                // РР·РІР»РµС‡РµРЅРёРµ РЅРµ СѓРґР°Р»РѕСЃСЊ вЂ” РїРѕРІС‚РѕСЂРёРј РїРѕР·Р¶Рµ
            }
            _nExtractInProgress = false;
            if (!success) scheduleRetry();
        };

        const scheduleRetry = () => {
            if (_nTransformFn || _nExtractAttempts >= _nExtractMaxAttempts) return;
            setTimeout(extractNTransform, 1500 * _nExtractAttempts);
        };

        // РџСЂРёРјРµРЅРµРЅРёРµ n-С‚СЂР°РЅСЃС„РѕСЂРјР°С†РёРё Рє URL
        const applyNTransform = (url) => {
            if (!_nTransformFn) return url;
            try {
                const u = new URL(url);
                const n = u.searchParams.get('n');
                if (!n) return url;
                if (_nCache[n]) {
                    u.searchParams.set('n', _nCache[n]);
                    return u.toString();
                }
                const transformed = _nTransformFn(n);
                if (transformed && typeof transformed === 'string' && transformed !== n) {
                    _nCache[n] = transformed;
                    u.searchParams.set('n', transformed);
                }
                return u.toString();
            } catch (e) { return url; }
        };

        // --- 3. РњРѕРґРёС„РёРєР°С†РёСЏ videoplayback URL ---
        const isVideoPlayback = (url) => {
            return typeof url === 'string' && url.indexOf('googlevideo.com/videoplayback') !== -1;
        };

        const patchVideoUrl = (url) => {
            try {
                if (!url || !isVideoPlayback(url)) return url;
                let patched = applyNTransform(url);
                const u = new URL(patched);
                // РЈРґР°Р»РµРЅРёРµ РїР°СЂР°РјРµС‚СЂРѕРІ, РёСЃРїРѕР»СЊР·СѓРµРјС‹С… РўРЎРџРЈ РґР»СЏ РёРґРµРЅС‚РёС„РёРєР°С†РёРё РїРѕС‚РѕРєР°
                u.searchParams.delete('rbuf');
                return u.toString();
            } catch (e) {
                return url;
            }
        };

        // РџР°С‚С‡ streamingData РёР· РѕС‚РІРµС‚Р° /youtubei/v1/player.
        // РџР°С‚С‡РёРј n-РїР°СЂР°РјРµС‚СЂС‹ РІ formats/adaptiveFormats РµСЃР»Рё n-transform РіРѕС‚РѕРІ.
        // serverAbrStreamingUrl РќР• СѓРґР°Р»СЏРµРј вЂ” Р±РµР· РЅРµРіРѕ РїР»РµРµСЂ РїР°РґР°РµС‚ СЃ missabrurl.1.
        // SABR POST Р·Р°РїСЂРѕСЃС‹ РѕР±СЂР°Р±Р°С‚С‹РІР°СЋС‚СЃСЏ РЅРёР¶Рµ РІ fetch-С…СѓРєРµ (bypass preflight).
        const patchStreamingData = (streamingData) => {
            if (!streamingData) return;
            // РџР°С‚С‡РёРј n-РїР°СЂР°РјРµС‚СЂС‹ РІРѕ РІСЃРµС… С„РѕСЂРјР°С‚Р°С…
            if (_nTransformFn) {
                ['formats', 'adaptiveFormats'].forEach(key => {
                    if (!Array.isArray(streamingData[key])) return;
                    streamingData[key].forEach(fmt => {
                        if (fmt.url) fmt.url = patchVideoUrl(fmt.url);
                        if (fmt.dashManifestUrl) fmt.dashManifestUrl = patchVideoUrl(fmt.dashManifestUrl);
                    });
                });
            }
        };

        // --- 4. РџРµСЂРµС…РІР°С‚ fetch: videoplayback URLs + /youtubei/v1/player РѕС‚РІРµС‚ ---
        // РСЃРїРѕР»СЊР·СѓРµРј СЃРёРЅС…СЂРѕРЅРЅС‹Р№ wrapper СЃ .then() вЂ” РЅРµ async, С‡С‚РѕР±С‹ РЅРµ РјРµРЅСЏС‚СЊ
        // РїРѕРІРµРґРµРЅРёРµ РїР»РµРµСЂР° Рё РЅРµ РґРѕР±Р°РІР»СЏС‚СЊ Р»РёС€РЅРёРµ Promise-РјРёРєСЂРѕР·Р°РґР°С‡Рё.
        const _origFetch = _unsafeWin.fetch;
        _unsafeWin.fetch = function(input, init) {
            var patchedInput = input;
            try {
                var rawUrl = typeof input === 'string' ? input : (input && input.url ? input.url : '');
                if (isVideoPlayback(rawUrl)) {
                    var p = patchVideoUrl(rawUrl);
                    if (p !== rawUrl) {
                        patchedInput = typeof input === 'string' ? p : new Request(p, input);
                    }
                }
            } catch (e) {}
            var reqUrl = typeof patchedInput === 'string'
                ? patchedInput
                : (patchedInput && patchedInput.url ? patchedInput.url : '');
            // SABR POST Рє CDN: СѓР±РёСЂР°РµРј РЅРµСЃС‚Р°РЅРґР°СЂС‚РЅС‹Рµ Р·Р°РіРѕР»РѕРІРєРё в†’ simple request в†’ РЅРµС‚ CORS preflight.
            // РўРЎРџРЈ Р±Р»РѕРєРёСЂСѓРµС‚ OPTIONS preflight, РЅРѕ РЅРµ СЃР°Рј POST. text/plain = simple Content-Type.
            // CDN googlevelideo.com РѕР±СЂР°Р±Р°С‚С‹РІР°РµС‚ protobuf-body РїРѕ СЃРѕРґРµСЂР¶РёРјРѕРјСѓ, РёРіРЅРѕСЂРёСЂСѓСЏ Content-Type.
            if (isVideoPlayback(reqUrl) && init && init.method && init.method.toUpperCase() === 'POST') {
                return _origFetch.call(_unsafeWin, patchedInput, {
                    method: 'POST',
                    body: init.body,
                    headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
                });
            }
            // РџРµСЂРµС…РІР°С‚С‹РІР°РµРј РѕС‚РІРµС‚ player API вЂ” РїР°С‚С‡РёРј n-РїР°СЂР°РјРµС‚СЂС‹ РІ streamingData
            if (reqUrl.indexOf('/youtubei/v1/player') !== -1) {
                return _origFetch.call(_unsafeWin, patchedInput, init).then(function(response) {
                    return response.clone().json().then(function(json) {
                        if (json && json.streamingData) {
                            patchStreamingData(json.streamingData);
                            return new Response(JSON.stringify(json), {
                                status: response.status,
                                statusText: response.statusText,
                                headers: { 'content-type': 'application/json; charset=utf-8' }
                            });
                        }
                        return response;
                    }).catch(function() { return response; });
                });
            }
            return _origFetch.call(_unsafeWin, patchedInput, init);
        };

        // --- 5. РџРµСЂРµС…РІР°С‚ XHR.open (С‚РѕР»СЊРєРѕ videoplayback, Р±РµР· send/setRequestHeader) ---
        const _origXhrOpen = _unsafeWin.XMLHttpRequest.prototype.open;
        _unsafeWin.XMLHttpRequest.prototype.open = function(method, url) {
            if (typeof url === 'string' && isVideoPlayback(url)) {
                url = patchVideoUrl(url);
            }
            return _origXhrOpen.apply(this, [method, url].concat(Array.prototype.slice.call(arguments, 2)));
        };

        // --- 6. Р—Р°РїСѓСЃРє РёР·РІР»РµС‡РµРЅРёСЏ n-С„СѓРЅРєС†РёРё ---
        if (_unsafeWin.ytcfg && _unsafeWin.ytcfg.get && _unsafeWin.ytcfg.get('PLAYER_JS_URL')) {
            // ytcfg СѓР¶Рµ РґРѕСЃС‚СѓРїРµРЅ вЂ” РЅР°С‡РёРЅР°РµРј РЅРµРјРµРґР»РµРЅРЅРѕ
            setTimeout(extractNTransform, 0);
        } else if (document.readyState === 'complete') {
            setTimeout(extractNTransform, 500);
        } else {
            _unsafeWin.addEventListener('load', () => setTimeout(extractNTransform, 500));
        }
        // РџСЂРё SPA-РЅР°РІРёРіР°С†РёРё вЂ” СЃР±СЂР°СЃС‹РІР°РµРј СЃС‡С‘С‚С‡РёРє РїРѕРїС‹С‚РѕРє Рё РїСЂРѕР±СѓРµРј СЃРЅРѕРІР°
        document.addEventListener('yt-navigate-finish', () => {
            if (!_nTransformFn) {
                _nExtractAttempts = 0;
                setTimeout(extractNTransform, 400);
            }
        });
        // Р Р°РЅРЅРµРµ СЃРѕР±С‹С‚РёРµ РїСЂРё СЃРјРµРЅРµ РІРёРґРµРѕ (СЃСЂР°Р±Р°С‚С‹РІР°РµС‚ СЂР°РЅСЊС€Рµ yt-navigate-finish)
        document.addEventListener('yt-page-data-updated', () => {
            if (!_nTransformFn) {
                _nExtractAttempts = 0;
                setTimeout(extractNTransform, 300);
            }
        });
    }

    // РџСЂРёРјРµРЅРµРЅРёРµ РІСЃРµС… РЅРѕРІС‹С… С„РёРєСЃРѕРІ

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
        applyFixRussiaThrottle();
    }

    // --- РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ ---

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
        // РћРїС‚РёРјРёР·РёСЂРѕРІР°РЅРЅС‹Р№ РЅР°Р±Р»СЋРґР°С‚РµР»СЊ РґР»СЏ SPA-РЅР°РІРёРіР°С†РёРё
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
        // РџРµСЂРёРѕРґРёС‡РµСЃРєР°СЏ РїСЂРѕРІРµСЂРєР° С‚РѕР»СЊРєРѕ РґР»СЏ РЇРЅРґРµРєСЃ СЃРµС‚РєРё
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
