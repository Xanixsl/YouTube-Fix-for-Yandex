# 🤝 Contributing to YouTube Fix for Yandex

<div align="center">

[![← README](https://img.shields.io/badge/←_Back-README.md-0078D4?style=for-the-badge&logo=github&logoColor=white&labelColor=0d1117)](README.md)&nbsp;
[![CONTRIBUTING RU](https://img.shields.io/badge/-CONTRIBUTING__RU-CE3228?style=for-the-badge&logo=data:image/svg%2Bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5IDYiPjxyZWN0IGZpbGw9IiNmZmYiIHdpZHRoPSI5IiBoZWlnaHQ9IjIiLz48cmVjdCBmaWxsPSIjMDAzOUE2IiB5PSIyIiB3aWR0aD0iOSIgaGVpZ2h0PSIyIi8+PHJlY3QgZmlsbD0iI0Q1MkIxRSIgeT0iNCIgd2lkdGg9IjkiIGhlaWdodD0iMiIvPjwvc3ZnPg==&labelColor=0d1117)](doc/CONTRIBUTING_RU.md)

</div>

Thank you for your interest in contributing! This document explains how you can help improve the project.

---

## 📋 Table of Contents

- [🐛 Reporting Bugs](#-reporting-bugs)
- [💡 Suggesting Features](#-suggesting-features)
- [🔧 Contributing Code](#-contributing-code)
- [🌍 Translations](#-translations)
- [📐 Code Style](#-code-style)
- [⚖️ License](#️-license)

---

## 🐛 Reporting Bugs

Before reporting a bug, please check:

1. You are using the **latest version** of the script — [![Latest Release](https://img.shields.io/github/v/release/Xanixsl/YouTube-Fix-for-Yandex?style=flat-square&logo=github&logoColor=white&color=0078D4&labelColor=0d1117)](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/releases/latest)
2. The bug is **reproducible** — try disabling other extensions to isolate
3. The bug hasn't already been [reported in Issues](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues)

### How to submit a bug report

Go to [Issues → New Issue](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues/new) and include:

| Field | What to provide |
|-------|-----------------|
| **Browser** | Name + version (e.g. Yandex Browser 24.1) |
| **Script version** | Visible in the settings window header |
| **Userscript manager** | Violentmonkey / Tampermonkey + version |
| **What happened** | Clear description of the bug |
| **Steps to reproduce** | Numbered list: 1. Open YouTube → 2. Click... |
| **Expected behavior** | What should have happened |
| **Screenshot / video** | Attach if possible |
| **Console errors** | Open DevTools (F12) → Console tab, paste any red errors |

---

## 💡 Suggesting Features

Have an idea? Open a [Discussion](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/discussions) or [Issue](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues/new) with the label `enhancement`.

Please include:
- **What problem does the feature solve?**
- **Describe the solution** — how should it work?
- **Are there alternatives?** — other ways to solve the same problem
- **Screenshots or mockups** if applicable

> ⚠️ Features unrelated to YouTube or Yandex Browser are unlikely to be accepted.

---

## 🔧 Contributing Code

### Before you start

- Check [open issues](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues) — your idea might already be tracked
- For large changes, open an issue first to discuss before writing code
- The project is a **single-file userscript** — all logic is in `youtube-fix-yandex.user.js`

### Workflow

```
1. Fork the repository
2. Create a branch: git checkout -b fix/describe-your-change
3. Make your changes
4. Test in Yandex Browser and Chrome with Violentmonkey
5. Commit with a clear message: git commit -m "fix: describe what was fixed"
6. Push and open a Pull Request
```

### Pull Request checklist

- [ ] Tested in **Yandex Browser** (primary target)
- [ ] Tested in **Chrome** with Violentmonkey
- [ ] No new errors in the browser console
- [ ] Existing features are not broken
- [ ] Code is readable and follows existing style
- [ ] PR description explains what was changed and why

---

## 🌍 Translations

The script supports **English** and **Russian** via JSON language files:

| File | Language |
|------|----------|
| `lang/EN_en.json` | English |
| `lang/RU_ru.json` | Russian |

To add a new language:
1. Copy `lang/EN_en.json` → `lang/XX_xx.json` (e.g. `DE_de.json`)
2. Translate all values (keep all keys unchanged)
3. Open `youtube-fix-yandex.user.js` and find the `loadLang()` function
4. Add your language code to the supported languages list
5. Submit a Pull Request

---

## 📐 Code Style

The script is intentionally kept as a **single file** for easy userscript distribution.

- **Indentation:** 4 spaces
- **Semicolons:** yes
- **String quotes:** single `'` for JS, double `"` for HTML attributes
- **Comments:** use `//` for inline, block comments for sections
- **Functions:** prefer named functions over anonymous arrow functions for readability
- **No external dependencies** — pure vanilla JS only
- **No build tools** — the `.user.js` file is the final product

### Section markers in the script

```js
// === SECTION NAME ===
```

Keep this pattern when adding new sections so the file remains easy to navigate.

---

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the same license as the project:

**Custom All Rights Reserved license** — see [LICENSE](LICENSE)

This means:
- Others can freely use and redistribute the project in original form with attribution
- **Modifications, derivative works and rebranding are not permitted**
- Your contribution becomes part of the main project under this license

---

<div align="center">

🛠 Developed by [Xanixsl](https://github.com/Xanixsl) &nbsp;·&nbsp; [Issues](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues) &nbsp;·&nbsp; [Discussions](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/discussions)

</div>
