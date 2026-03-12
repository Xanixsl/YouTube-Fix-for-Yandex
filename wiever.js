// ==UserScript==
// @name        Предпросмотр картинок v2.5 — Intuitive Glass UI
// @namespace   Violentmonkey Scripts
// @match       https://telegra.ph/*
// @grant       GM_setValue
// @grant       GM_getValue
// @version     2.5
// @author      -
// @description Modern glass-morphism preview with intuitive controls, wheel zoom, and improved UI
// @icon        https://telegra.ph/favicon.ico
// ==/UserScript==

(() => {
  'use strict';
  
  const STORAGE_KEY = 'tgph_v2_5_state';
  const DEFAULTS = {
  enabled: true,
    maxZoom: 500,
    minZoom: 5,
    defaultZoom: 100,
    autoFit: true,
    theme: 'dark',
    searchEngine: 'yandex',
    downloadFormat: 'png',
  jpegQuality: 85,
  blockScroll: false,
  zoomStep: 10
  };
  
  // Загрузка настроек
  const state = JSON.parse(GM_getValue(STORAGE_KEY, JSON.stringify(DEFAULTS)));
  
  function saveState() {
    GM_setValue(STORAGE_KEY, JSON.stringify(state));
  }

  // SVG иконки для кнопок (добавлены иконки настроек и сохранения)
  const icons = {
    toggleOn: `<svg viewBox="0 0 24 24"><path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
    toggleOff: `<svg viewBox="0 0 24 24"><path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
    expand: `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
    search: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
    download: `<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`,
    zoomIn: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2V7z"/></svg>`,
    zoomOut: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/></svg>`,
    reset: `<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
    settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
    save: `<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>`
  };

  // CSS стили с улучшенным дизайном
  const CSS = `
    :root {
      --tgph-control-color: ${state.theme === 'dark' ? '#eee' : '#1a1a1a'};
      --tgph-control-bg: ${state.theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
    }
    #tgph-toggle {
      position: fixed;
      top: 20px;
      left: 20px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: ${state.enabled ? 'rgba(94, 234, 212, 0.8)' : 'rgba(200, 200, 200, 0.4)'};
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    #tgph-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
    }
    
    #tgph-toggle svg {
      width: 24px;
      height: 24px;
      fill: #1a1a1a;
    }
    
    #tgph-preview-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${state.theme === 'dark' ? 'rgba(10, 10, 12, 0.92)' : 'rgba(255, 255, 255, 0.95)'};
      backdrop-filter: blur(15px);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    #tgph-preview-overlay.active {
      opacity: 1;
    }
    
    .glass-card {
      background: ${state.theme === 'dark' ? 'rgba(30, 30, 35, 0.75)' : 'rgba(255, 255, 255, 0.85)'};
      backdrop-filter: blur(25px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 18px;
      box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3);
      color: ${state.theme === 'dark' ? '#eee' : '#333'};
      overflow: hidden;
      transition: all 0.3s ease;
      max-width: 96vw;
      max-height: 96vh;
      display: flex;
      flex-direction: column;
    }
    
    #tgph-image-container {
      position: relative;
      flex: 1;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 25px;
      min-width: 200px;
      min-height: 200px;
    }
    
    #tgph-img {
      max-width: none;
      max-height: none;
      cursor: grab;
      transition: transform 0.15s ease-out;
      box-shadow: 0 5px 25px rgba(0, 0, 0, 0.25);
      border-radius: 6px;
  transform-origin: 0 0;
    }
    
    #tgph-img.grabbing {
      cursor: grabbing;
    }
    
    #tgph-controls {
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1000;
    }
    
    .tgph-btn {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${state.theme === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.1)'};
      border: 1px solid rgba(255, 255, 255, 0.12);
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(8px);
    }
    
    .tgph-btn:hover {
      background: ${state.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
      .tgph-btn {
      color: var(--tgph-control-color);
      background: var(--tgph-control-bg);
    }
    .tgph-btn svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }
    /* Статичные кнопки, которые не должны менять цвет */
    .tgph-static {
      color: #fff !important;
    }
    #tgph-toggle svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    
    #tgph-bottom-controls {
      display: flex;
      padding: 15px 20px;
      background: ${state.theme === 'dark' ? 'rgba(20, 20, 25, 0.65)' : 'rgba(245, 245, 245, 0.75)'};
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      gap: 12px;
      align-items: center;
      justify-content: center;
    }
    
    .tgph-control-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .tgph-zoom-info {
      min-width: 70px;
      text-align: center;
      font-weight: 600;
      font-size: 15px;
      color: ${state.theme === 'dark' ? '#eee' : '#333'};
      background: ${state.theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'};
      padding: 6px 12px;
      border-radius: 8px;
    }
    
    .tgph-range {
      width: 120px;
      height: 7px;
      border-radius: 4px;
      background: ${state.theme === 'dark' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.22)'};
      outline: none;
      opacity: 0.85;
      transition: opacity 0.2s;
      -webkit-appearance: none;
    }
    
    .tgph-range:hover {
      opacity: 1;
    }
    
    .tgph-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${state.enabled ? '#5eead4' : '#aaa'};
      cursor: pointer;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
      border: 2px solid ${state.theme === 'dark' ? '#1a1a1a' : '#fff'};
    }
    
    .tgph-range::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${state.enabled ? '#5eead4' : '#aaa'};
      cursor: pointer;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
      border: 2px solid ${state.theme === 'dark' ? '#1a1a1a' : '#fff'};
    }
    
  /* Tooltip removed; percent displayed on the right */
    
    /* Стили для окна настроек */
    #tgph-settings-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 10002;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    #tgph-settings-overlay.active {
      opacity: 1;
      pointer-events: all;
    }
    
    #tgph-settings {
      background: ${state.theme === 'dark' ? 'rgba(35, 35, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 25px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    
    .tgph-settings-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      color: ${state.theme === 'dark' ? '#eee' : '#333'};
      text-align: center;
    }
    
    .tgph-settings-group {
      margin-bottom: 20px;
    }
    
    .tgph-settings-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: ${state.theme === 'dark' ? '#eee' : '#333'};
    }
    
    .tgph-settings-input {
      width: 60%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid ${state.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
      background: ${state.theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.7)'};
      color: ${state.theme === 'dark' ? '#eee' : '#333'};
      font-size: 15px;
    }
    
    .tgph-settings-select {
      width: 60%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid ${state.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
      background: ${state.theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.7)'};
      color: ${state.theme === 'dark' ? '#eee' : '#333'};
      font-size: 15px;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${state.theme === 'dark' ? 'eee' : '333'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
    }
    
    .tgph-quality-slider {
      width: 100%;
      margin-top: 15px;
      display: block;
    }
    
    .tgph-settings-buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 25px;
    }
    
    .tgph-settings-btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    
    .tgph-settings-btn-primary {
      background: #5eead4;
      color: #1a1a1a;
    }
    
    .tgph-settings-btn-primary:hover {
      background: #4dd8c3;
      transform: translateY(-2px);
    }
    
    .tgph-settings-btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      color: ${state.theme === 'dark' ? '#eee' : '#333'};
    }
    
    .tgph-settings-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }
    
    @media (max-width: 600px) {
      .glass-card {
        max-width: 100vw;
        max-height: 100vh;
        border-radius: 0;
      }
      
      #tgph-controls {
        top: 10px;
        right: 10px;
      }
      
      .tgph-btn {
        width: 40px;
        height: 40px;
      }
      
      #tgph-bottom-controls {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .tgph-range {
        width: 160px;
      }
      
      #tgph-settings {
        width: 95%;
        padding: 20px 15px;
      }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  let overlay = null;
  let settingsOverlay = null;
  let currentZoom = state.defaultZoom;
  let startPos = { x: 0, y: 0 };
  let isDragging = false;

  function createToggle() {
    const btn = document.createElement('button');
    btn.id = 'tgph-toggle';
    btn.innerHTML = state.enabled ? icons.toggleOn : icons.toggleOff;
    btn.title = 'Включить/выключить предпросмотр';
    
    btn.onclick = () => {
      state.enabled = !state.enabled;
      saveState();
      btn.innerHTML = state.enabled ? icons.toggleOn : icons.toggleOff;
      btn.style.background = state.enabled ? 'rgba(94, 234, 212, 0.8)' : 'rgba(200, 200, 200, 0.4)';
      if (state.enabled) {
        // повторно добавляем обработчики для всех необработанных изображений
        document.querySelectorAll('img[data-tgph-processed]').forEach(i => {
          if (i._tgphClickHandler && !i.hasAttribute('data-tgph-listener')) {
            i.addEventListener('click', i._tgphClickHandler);
            i.setAttribute('data-tgph-listener', 'true');
            i.style.cursor = 'zoom-in';
          }
        });
      } else {
        // удаляем обработчики
        document.querySelectorAll('img[data-tgph-processed]').forEach(i => {
          if (i._tgphClickHandler) {
            i.removeEventListener('click', i._tgphClickHandler);
          }
          i.removeAttribute('data-tgph-listener');
          i.style.cursor = 'default';
        });
      }
    };
    
    document.body.appendChild(btn);
  }

  function createSettingsOverlay() {
    if (settingsOverlay) return settingsOverlay;

    settingsOverlay = document.createElement('div');
    settingsOverlay.id = 'tgph-settings-overlay';

    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'tgph-settings';
    
    const title = document.createElement('div');
    title.className = 'tgph-settings-title';
    title.textContent = 'Настройки предпросмотра';
    settingsContainer.appendChild(title);
  // Чекбокс блокировки скролла
  const blockScrollGroup = document.createElement('div');
  blockScrollGroup.className = 'tgph-settings-group';
  const blockScrollLabel = document.createElement('label');
  blockScrollLabel.className = 'tgph-settings-label';
  blockScrollLabel.style.display = 'flex';
  blockScrollLabel.style.alignItems = 'center';
  const blockScrollCheckbox = document.createElement('input');
  blockScrollCheckbox.type = 'checkbox';
  blockScrollCheckbox.id = 'tgph-block-scroll';
  blockScrollCheckbox.checked = state.blockScroll;
  blockScrollCheckbox.style.marginRight = '10px';
  blockScrollLabel.appendChild(blockScrollCheckbox);
  blockScrollLabel.appendChild(document.createTextNode('Блокировать скролл страницы при предпросмотре'));
  blockScrollGroup.appendChild(blockScrollLabel);
  settingsContainer.appendChild(blockScrollGroup);
    
    // Максимальный процент увеличения
    const maxZoomGroup = document.createElement('div');
    maxZoomGroup.className = 'tgph-settings-group';
    
    const maxZoomLabel = document.createElement('label');
    maxZoomLabel.className = 'tgph-settings-label';
    maxZoomLabel.textContent = 'Максимальный процент увеличения:';
    maxZoomLabel.htmlFor = 'tgph-max-zoom';
    maxZoomGroup.appendChild(maxZoomLabel);
    
    const maxZoomInput = document.createElement('input');
    maxZoomInput.type = 'number';
    maxZoomInput.id = 'tgph-max-zoom';
    maxZoomInput.className = 'tgph-settings-input';
    maxZoomInput.min = '100';
    maxZoomInput.max = '1000';
    maxZoomInput.step = '10';
    maxZoomInput.value = state.maxZoom;
    maxZoomGroup.appendChild(maxZoomInput);
    
    settingsContainer.appendChild(maxZoomGroup);
  // Шаг увеличения/уменьшения
  const stepGroup = document.createElement('div');
  stepGroup.className = 'tgph-settings-group';
  const stepLabel = document.createElement('label');
  stepLabel.className = 'tgph-settings-label';
  stepLabel.textContent = 'Шаг увеличения/уменьшения (%):';
  stepLabel.htmlFor = 'tgph-zoom-step';
  stepGroup.appendChild(stepLabel);
  const stepInput = document.createElement('input');
  stepInput.type = 'number';
  stepInput.id = 'tgph-zoom-step';
  stepInput.className = 'tgph-settings-input';
  stepInput.min = '1';
  stepInput.max = '100';
  stepInput.step = '1';
  stepInput.value = state.zoomStep || 10;
  stepGroup.appendChild(stepInput);
  settingsContainer.appendChild(stepGroup);
    
    // Минимальный процент уменьшения
    const minZoomGroup = document.createElement('div');
    minZoomGroup.className = 'tgph-settings-group';
    
    const minZoomLabel = document.createElement('label');
    minZoomLabel.className = 'tgph-settings-label';
    minZoomLabel.textContent = 'Минимальный процент уменьшения:';
    minZoomLabel.htmlFor = 'tgph-min-zoom';
    minZoomGroup.appendChild(minZoomLabel);
    
    const minZoomInput = document.createElement('input');
    minZoomInput.type = 'number';
    minZoomInput.id = 'tgph-min-zoom';
    minZoomInput.className = 'tgph-settings-input';
    minZoomInput.min = '1';
    minZoomInput.max = '100';
    minZoomInput.step = '5';
    minZoomInput.value = state.minZoom;
    minZoomGroup.appendChild(minZoomInput);
    
    settingsContainer.appendChild(minZoomGroup);
    
    // Поисковая система
    const searchEngineGroup = document.createElement('div');
    searchEngineGroup.className = 'tgph-settings-group';
    
    const searchEngineLabel = document.createElement('label');
    searchEngineLabel.className = 'tgph-settings-label';
    searchEngineLabel.textContent = 'Поисковая система:';
    searchEngineLabel.htmlFor = 'tgph-search-engine';
    searchEngineGroup.appendChild(searchEngineLabel);
    
    const searchEngineSelect = document.createElement('select');
    searchEngineSelect.id = 'tgph-search-engine';
    searchEngineSelect.className = 'tgph-settings-select';
    
    const searchEngines = [
      { value: 'yandex', name: 'Яндекс' },
      { value: 'google', name: 'Google' },
      { value: 'bing', name: 'Bing' }
    ];
    
    searchEngines.forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.value;
      option.textContent = engine.name;
      option.selected = state.searchEngine === engine.value;
      searchEngineSelect.appendChild(option);
    });
    
    searchEngineGroup.appendChild(searchEngineSelect);
    settingsContainer.appendChild(searchEngineGroup);
    
    // Формат скачивания
    const formatGroup = document.createElement('div');
    formatGroup.className = 'tgph-settings-group';
    
    const formatLabel = document.createElement('label');
    formatLabel.className = 'tgph-settings-label';
    formatLabel.textContent = 'Формат скачиваемого изображения:';
    formatLabel.htmlFor = 'tgph-download-format';
    formatGroup.appendChild(formatLabel);
    
    const formatSelect = document.createElement('select');
    formatSelect.id = 'tgph-download-format';
    formatSelect.className = 'tgph-settings-select';
    
    const formats = [
  { value: 'png', name: 'PNG' },
  { value: 'jpg', name: 'JPG' },
  { value: 'jpeg', name: 'JPEG' },
  { value: 'webp', name: 'WEBP' }
    ];
    
    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format.value;
      option.textContent = format.name;
      option.selected = state.downloadFormat === format.value;
      formatSelect.appendChild(option);
    });
    
    formatGroup.appendChild(formatSelect);
    settingsContainer.appendChild(formatGroup);
    
    // Ползунок качества для JPG/JPEG
    const qualityGroup = document.createElement('div');
    qualityGroup.className = 'tgph-settings-group';
    qualityGroup.id = 'tgph-quality-group';
    
    const qualityLabel = document.createElement('label');
    qualityLabel.className = 'tgph-settings-label';
    qualityLabel.textContent = 'Качество изображения:';
    qualityLabel.htmlFor = 'tgph-jpeg-quality';
    qualityGroup.appendChild(qualityLabel);
    
    const qualityValue = document.createElement('div');
    qualityValue.className = 'tgph-zoom-info';
    qualityValue.textContent = state.jpegQuality + '%';
    qualityValue.style.marginBottom = '10px';
    qualityGroup.appendChild(qualityValue);
    
    const qualitySlider = document.createElement('input');
    qualitySlider.type = 'range';
    qualitySlider.id = 'tgph-jpeg-quality';
    qualitySlider.className = 'tgph-quality-slider';
    qualitySlider.min = '10';
    qualitySlider.max = '100';
    qualitySlider.step = '5';
    qualitySlider.value = state.jpegQuality;
    qualityGroup.appendChild(qualitySlider);
    
    // Показываем ползунок качества только для JPG/JPEG
  qualityGroup.style.display = (formatSelect.value === 'jpg' || formatSelect.value === 'jpeg') ? 'block' : 'none';
    settingsContainer.appendChild(qualityGroup);
    
    // Обработчик изменения формата
    formatSelect.addEventListener('change', () => {
      const showQuality = formatSelect.value === 'jpg' || formatSelect.value === 'jpeg';
      qualityGroup.style.display = showQuality ? 'block' : 'none';
      if (showQuality) {
        if (!qualitySlider.value) qualitySlider.value = 90;
        qualityValue.textContent = qualitySlider.value + '%';
      }
    });
    
    // Обновление значения качества
    qualitySlider.addEventListener('input', () => {
      qualityValue.textContent = qualitySlider.value + '%';
    });
    
    // Кнопки сохранения и закрытия
    const buttonsGroup = document.createElement('div');
    buttonsGroup.className = 'tgph-settings-buttons';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'tgph-settings-btn tgph-settings-btn-primary';
    saveBtn.innerHTML = `${icons.save} Сохранить`;
    saveBtn.onclick = () => {
      // Сохраняем настройки
  state.maxZoom = parseInt(maxZoomInput.value) || 500;
  state.minZoom = parseInt(minZoomInput.value) || 5;
  state.searchEngine = searchEngineSelect.value;
  state.downloadFormat = formatSelect.value;
  state.jpegQuality = parseInt(qualitySlider.value) || 90;
  state.blockScroll = blockScrollCheckbox.checked;
  state.zoomStep = parseInt(stepInput.value) || 10;
      
      saveState();
      settingsOverlay.classList.remove('active');
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tgph-settings-btn tgph-settings-btn-secondary';
    closeBtn.innerHTML = `${icons.close} Закрыть`;
    closeBtn.onclick = () => {
      settingsOverlay.classList.remove('active');
    };
    
    buttonsGroup.appendChild(saveBtn);
    buttonsGroup.appendChild(closeBtn);
    settingsContainer.appendChild(buttonsGroup);
    
    settingsOverlay.appendChild(settingsContainer);
    document.body.appendChild(settingsOverlay);
    
    // Закрытие по клику вне окна
    settingsOverlay.addEventListener('click', (e) => {
      if (e.target === settingsOverlay) {
        settingsOverlay.classList.remove('active');
      }
    });
    
    return settingsOverlay;
  }

  function showSettings() {
    const settings = createSettingsOverlay();
    settings.classList.add('active');
  }

  function createOverlay() {
    if (overlay) return overlay;
    
    overlay = document.createElement('div');
    // Блокируем скролл если включено в настройках
    if (state.blockScroll) {
      document.body.style.overflow = 'hidden';
    }
    overlay.id = 'tgph-preview-overlay';
    
    const container = document.createElement('div');
    container.className = 'glass-card';
    
    const imageContainer = document.createElement('div');
    imageContainer.id = 'tgph-image-container';
    
    const img = document.createElement('img');
    img.id = 'tgph-img';
    img.draggable = false;
    
  imageContainer.appendChild(img);
    container.appendChild(imageContainer);
    
    const controls = document.createElement('div');
    controls.id = 'tgph-controls';
    
    // Создаем кнопки управления
    const buttons = [
      { icon: icons.expand, title: 'Автоподгонка (F)', action: 'autoFit' },
      { icon: icons.search, title: 'Поиск в сети (S)', action: 'reverseSearch' },
      { icon: icons.reset, title: 'Сбросить (R)', action: 'reset' },
      { icon: icons.download, title: 'Скачать (D)', action: 'download' },
      { icon: icons.settings, title: 'Настройки', action: 'settings' },
      { icon: icons.close, title: 'Закрыть (Esc)', action: 'close' }
    ];
    
    buttons.forEach(btnConfig => {
      const btn = document.createElement('div');
      btn.className = 'tgph-btn';
      btn.innerHTML = btnConfig.icon;
      btn.title = btnConfig.title;
      
      switch(btnConfig.action) {
        case 'autoFit':
          btn.onclick = () => autoFit();
          break;
        case 'reverseSearch':
          btn.onclick = () => reverseSearch(img.src);
          break;
        case 'reset':
          btn.onclick = () => reset();
          break;
        case 'download':
          btn.onclick = () => downloadImage(img);
          break;
        case 'settings':
          btn.onclick = () => showSettings();
          break;
        case 'close':
          btn.onclick = () => closeOverlay();
          break;
      }
      
      controls.appendChild(btn);
    });
    
    container.appendChild(controls);
    
    const bottomControls = document.createElement('div');
    bottomControls.id = 'tgph-bottom-controls';
    
    const zoomOutBtn = document.createElement('div');
    zoomOutBtn.className = 'tgph-btn';
  zoomOutBtn.classList.add('tgph-static');
    zoomOutBtn.innerHTML = icons.zoomOut;
    zoomOutBtn.title = 'Уменьшить (-)';
    zoomOutBtn.onclick = () => zoomOut();
    
    const zoomInfo = document.createElement('div');
    zoomInfo.className = 'tgph-zoom-info';
    zoomInfo.textContent = `${currentZoom}%`;
    
    const zoomInBtn = document.createElement('div');
    zoomInBtn.className = 'tgph-btn';
  zoomInBtn.classList.add('tgph-static');
    zoomInBtn.innerHTML = icons.zoomIn;
    zoomInBtn.title = 'Увеличить (+)';
    zoomInBtn.onclick = () => zoomIn();
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = state.minZoom;
    slider.max = state.maxZoom;
    slider.value = currentZoom;
    slider.className = 'tgph-range';
    slider.title = 'Масштаб изображения';
    
    bottomControls.appendChild(zoomOutBtn);
    bottomControls.appendChild(slider);
    bottomControls.appendChild(zoomInBtn);
    bottomControls.appendChild(zoomInfo);
    
    container.appendChild(bottomControls);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
  // тултип убран — отображаем только правые проценты
    
    // Функции управления
    function updateZoom(value) {
      currentZoom = Math.max(state.minZoom, Math.min(state.maxZoom, value));
      slider.value = currentZoom;
      zoomInfo.textContent = `${currentZoom}%`;
  applyTransform();
  // Тултип отключён — проценты показываются справа
  // Обновляем цвет контролов после трансформации/масштабирования
  try { if (typeof adjustControlsColor === 'function') adjustControlsColor(); } catch (e) {}
    }
    
    function applyTransform() {
  // Apply scale first, then translate so startPos is in screen pixels (not scaled).
  // This makes drag math and wheel-anchor math consistent: screen = s * imgCoord + startPos
  img.style.transform = `scale(${currentZoom / 100}) translate(${startPos.x}px, ${startPos.y}px)`;
  try { scheduleAdjustControlsColor(); } catch (e) {}
    }
    
    function autoFit() {
      const containerWidth = imageContainer.clientWidth - 50;
      const containerHeight = imageContainer.clientHeight - 50;
      
      if (img.naturalWidth && img.naturalHeight) {
        const scaleX = containerWidth / img.naturalWidth;
        const scaleY = containerHeight / img.naturalHeight;
        const scale = Math.min(scaleX, scaleY, 1) * 100;
        
        updateZoom(Math.round(scale));
        startPos = { x: 0, y: 0 };
        applyTransform();
      }
    }
    
    function reset() {
      currentZoom = state.defaultZoom;
      startPos = { x: 0, y: 0 };
      updateZoom(currentZoom);
    }
    
  function zoomIn() { zoomToCenter(currentZoom + (state.zoomStep || 10)); }
    
  function zoomOut() { zoomToCenter(currentZoom - (state.zoomStep || 10)); }
    
    function reverseSearch(imageSrc) {
      let searchUrl;
      
      switch(state.searchEngine) {
        case 'google':
          searchUrl = `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imageSrc)}`;
          break;
        case 'bing':
          searchUrl = `https://www.bing.com/images/search?q=imgurl:${encodeURIComponent(imageSrc)}&view=detailv2`;
          break;
        case 'yandex':
        default:
          searchUrl = `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageSrc)}`;
      }
      
      window.open(searchUrl, '_blank');
    }
    
    async function downloadImage(imageElement) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageElement, 0, 0);
        
        let mimeType = 'image/png';
        let quality = 1.0;
        let fileExtension = 'png';
        
        switch(state.downloadFormat) {
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            quality = state.jpegQuality / 100;
            fileExtension = 'jpg';
            break;
          case 'webp':
            mimeType = 'image/webp';
            fileExtension = 'webp';
            break;
          default:
            mimeType = 'image/png';
            fileExtension = 'png';
        }
        
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `image.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.error('Ошибка при загрузке изображения:', error);
      }
    }
    
    function closeOverlay() {
      overlay.remove();
      overlay = null;
      // Возвращаем скролл если был заблокирован
      document.body.style.overflow = '';
      // Удаляем обработчики событий
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    }
    
    // Обработчики событий для изображения
    let startX, startY;
    let colorRaf = null;

    // helper: compute delta startPos so that point at screenX/screenY remains same image coord after scale
    function computeDeltaForScreenPoint(screenX, screenY, prevScale, nextScale, imgRectBefore) {
      // rel coords to displayed image
      const relToImgX = screenX - imgRectBefore.left;
      const relToImgY = screenY - imgRectBefore.top;
      const imgX = relToImgX / prevScale;
      const imgY = relToImgY / prevScale;
      const newImgLeft = screenX - nextScale * imgX;
      const newImgTop = screenY - nextScale * imgY;
      const deltaX = newImgLeft - imgRectBefore.left;
      const deltaY = newImgTop - imgRectBefore.top;
      return { deltaX, deltaY, newImgLeft, newImgTop, imgX, imgY };
    }

    // Zoom using cursor as anchor (wheel behaviour)
    function zoomToCursor(targetZoom, clientX, clientY) {
      const clamped = Math.max(state.minZoom, Math.min(state.maxZoom, targetZoom));
      const prevScale = currentZoom / 100;
      const nextScale = clamped / 100;
      const imgRectBefore = img.getBoundingClientRect();

      const { deltaX, deltaY } = computeDeltaForScreenPoint(clientX, clientY, prevScale, nextScale, imgRectBefore);
      startPos.x += deltaX;
      startPos.y += deltaY;
      updateZoom(Math.round(clamped));
    }

    // Zoom using center of preview as anchor (buttons and slider behaviour)
    function zoomToCenter(targetZoom) {
      const clamped = Math.max(state.minZoom, Math.min(state.maxZoom, targetZoom));
      const prevScale = currentZoom / 100;
      const nextScale = clamped / 100;
      const rectContainer = imageContainer.getBoundingClientRect();
      const centerX = rectContainer.left + rectContainer.width / 2;
      const centerY = rectContainer.top + rectContainer.height / 2;
      const imgRectBefore = img.getBoundingClientRect();
      const { deltaX, deltaY } = computeDeltaForScreenPoint(centerX, centerY, prevScale, nextScale, imgRectBefore);
      startPos.x += deltaX;
      startPos.y += deltaY;
      updateZoom(Math.round(clamped));
    }

    function scheduleAdjustControlsColor() {
      if (colorRaf) cancelAnimationFrame(colorRaf);
      colorRaf = requestAnimationFrame(() => {
        try { adjustControlsColor(); } catch (e) {}
        colorRaf = null;
      });
    }
    
    img.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        isDragging = true;
        img.style.cursor = 'grabbing';
        img.classList.add('grabbing');
        
        startX = e.clientX - startPos.x;
        startY = e.clientY - startPos.y;
      } else if (e.button === 2) {
        e.preventDefault();
        reset();
      }
    });
    
    const mouseMoveHandler = (e) => {
      if (isDragging) {
        startPos.x = e.clientX - startX;
        startPos.y = e.clientY - startY;
        applyTransform();
  // адаптивно пересчитываем цвета контролов во время перетаскивания
  scheduleAdjustControlsColor();
      }
    };
    
    const mouseUpHandler = () => {
      isDragging = false;
      img.style.cursor = 'grab';
      img.classList.remove('grabbing');
  try { if (typeof adjustControlsColor === 'function') adjustControlsColor(); } catch (e) {}
    };
    
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    
    // Контекстное меню ПКМ отключаем для изображения
    img.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Масштабирование колёсиком мыши — поведение: ZOOM TO CURSOR
    img.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      const step = state.zoomStep || 10;
      const target = currentZoom + delta * step;
      try {
        zoomToCursor(target, e.clientX, e.clientY);
      } catch (err) {
        // fallback to center zoom if something fails
        try { zoomToCenter(target); } catch (e2) { updateZoom(target); }
      }
    }, { passive: false });

    // Функция адаптивного цвета контролов: пробуем взять пиксели под каждой кнопкой
    function adjustControlsColor() {
      try {
        if (!img || !img.naturalWidth) return;
        const sampleSize = 6;
        const canvas = document.createElement('canvas');
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        const ctx = canvas.getContext('2d');

        // Помощник: возвращает среднюю яркость в точке clientX,clientY
        function sampleLuminanceAt(clientX, clientY) {
          const imgRect = img.getBoundingClientRect();
          // если точка за пределами изображения — используем центр
          if (clientX < imgRect.left || clientX > imgRect.right || clientY < imgRect.top || clientY > imgRect.bottom) {
            clientX = imgRect.left + imgRect.width / 2;
            clientY = imgRect.top + imgRect.height / 2;
          }
          const relX = (clientX - imgRect.left) / imgRect.width;
          const relY = (clientY - imgRect.top) / imgRect.height;
          const sx = Math.floor(relX * img.naturalWidth - sampleSize/2);
          const sy = Math.floor(relY * img.naturalHeight - sampleSize/2);
          // clamp
          const sxClamped = Math.max(0, Math.min(img.naturalWidth - sampleSize, sx));
          const syClamped = Math.max(0, Math.min(img.naturalHeight - sampleSize, sy));
          ctx.clearRect(0,0,sampleSize,sampleSize);
          ctx.drawImage(img, sxClamped, syClamped, sampleSize, sampleSize, 0, 0, sampleSize, sampleSize);
          const data = ctx.getImageData(0,0,sampleSize,sampleSize).data;
          let total = 0;
          for (let i=0;i<data.length;i+=4) {
            total += (0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2]);
          }
          return total / (sampleSize*sampleSize);
        }

        // Обрабатываем кнопки сверху
        const topButtons = controls.querySelectorAll('.tgph-btn');
        topButtons.forEach(btn => {
          if (btn.classList.contains('tgph-static')) return; // skip static buttons
          const r = btn.getBoundingClientRect();
          const luminance = sampleLuminanceAt(r.left + r.width/2, r.top + r.height/2);
          if (luminance < 120) {
            btn.style.color = '#fff';
            btn.style.background = 'rgba(0,0,0,0.45)';
          } else {
            btn.style.color = '#111';
            btn.style.background = 'rgba(255,255,255,0.12)';
          }
        });

        // Обрабатываем нижние контролы (если есть)
        if (typeof bottomControls !== 'undefined' && bottomControls) {
          const bottomButtons = bottomControls.querySelectorAll('.tgph-btn');
          bottomButtons.forEach(btn => {
            if (btn.classList.contains('tgph-static')) return; // keep static bottom buttons unchanged
            const r = btn.getBoundingClientRect();
            const luminance = sampleLuminanceAt(r.left + r.width/2, r.top + r.height/2);
            if (luminance < 120) {
              btn.style.color = '#fff';
              btn.style.background = 'rgba(0,0,0,0.45)';
            } else {
              btn.style.color = '#111';
              btn.style.background = 'rgba(255,255,255,0.12)';
            }
          });
        }

      } catch (err) {
        // CORS или другая ошибка — ничего не делаем
      }
    }
    
    // Обработчик для ползунка масштаба
    slider.addEventListener('input', () => {
      zoomToCenter(parseInt(slider.value));
    });
    
    // Глобальные обработчики клавиш
    const keyHandler = (e) => {
      if (!overlay) return;
      
      switch(e.key) {
        case 'Escape':
          closeOverlay();
          break;
        case 'f':
        case 'F':
        case 'а': // Russian layout for F
        case 'А':
          autoFit();
          break;
        case 'r':
        case 'R':
        case 'к': // Russian layout for R
        case 'К':
          reset();
          break;
        case 's':
        case 'S':
        case 'ы': // Russian layout for S
        case 'Ы':
          reverseSearch(img.src);
          break;
        case 'd':
        case 'D':
        case 'в': // Russian layout for D
        case 'В':
          downloadImage(img);
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
      }
    };
    
    window.addEventListener('keydown', keyHandler);
    
    // Очистка при закрытии
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay();
      }
    });
    
    // Возвращаем объект с методами управления
    return {
      setImage: (src) => {
        img.src = src;
        img.onload = () => {
          setTimeout(() => {
            overlay.classList.add('active');
            if (state.autoFit) {
              autoFit();
            } else {
              updateZoom(state.defaultZoom);
            }
            try { scheduleAdjustControlsColor(); } catch (e) {}
          }, 50);
        };
      },
      close: closeOverlay
    };
  }

  function attachAll() {
    document.querySelectorAll('article img, img').forEach(img => {
      // Если ещё не обработан — помечаем и добавляем обработчик в зависимости от state.enabled
      if (!img.hasAttribute('data-tgph-processed')) {
        img.setAttribute('data-tgph-processed', 'true');
        const handler = () => {
          const overlay = createOverlay();
          overlay.setImage(img.src);
        };
        img._tgphClickHandler = handler;
      }
      // Снимаем или добавляем слушатель в зависимости от состояния
      if (state.enabled) {
        if (!img.hasAttribute('data-tgph-listener')) {
          img.addEventListener('click', img._tgphClickHandler);
          img.setAttribute('data-tgph-listener', 'true');
        }
        img.style.cursor = 'zoom-in';
      } else {
        if (img.hasAttribute('data-tgph-listener')) {
          img.removeEventListener('click', img._tgphClickHandler);
          img.removeAttribute('data-tgph-listener');
        }
        img.style.cursor = 'default';
      }
    });
  }

  // Инициализация
  createToggle();
  attachAll();
  
  // Наблюдатель за изменениями DOM
  new MutationObserver(attachAll).observe(document.body, {
    childList: true,
    subtree: true
  });
})();