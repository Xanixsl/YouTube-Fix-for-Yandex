# 🤝 Участие в разработке YouTube Fix for Yandex

<div align="center">

[![← README](https://img.shields.io/badge/←_Back-README.md-0078D4?style=for-the-badge&logo=github&logoColor=white&labelColor=0d1117)](../README.md)&nbsp;
[![CONTRIBUTING](https://img.shields.io/badge/-CONTRIBUTING-0078D4?style=for-the-badge&logo=data:image/svg%2Bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCAzMCI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDEyMTY5Ii8+PHBhdGggZD0iTTAsMCBMNjAsMzAgTTYwLDAgTDAsMzAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTAsMCBMNjAsMzAgTTYwLDAgTDAsMzAiIHN0cm9rZT0iI0M4MTAyRSIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHBhdGggZD0iTTMwLDAgVjMwIE0wLDE1IEg2MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEwIi8+PHBhdGggZD0iTTMwLDAgVjMwIE0wLDE1IEg2MCIgc3Ryb2tlPSIjQzgxMDJFIiBzdHJva2Utd2lkdGg9IjYiLz48L3N2Zz4=&labelColor=0d1117)](../CONTRIBUTING.md)

</div>

Спасибо за интерес к проекту! Здесь описано, как помочь его развитию.

---

## 📋 Содержание

- [🐛 Сообщить об ошибке](#-сообщить-об-ошибке)
- [💡 Предложить функцию](#-предложить-функцию)
- [🔧 Внести код](#-внести-код)
- [🌍 Переводы](#-переводы)
- [📐 Стиль кода](#-стиль-кода)
- [⚖️ Лицензия](#️-лицензия)

---

## 🐛 Сообщить об ошибке

Перед тем как сообщить об ошибке, проверьте:

1. Вы используете **последнюю версию** скрипта — [![Последняя версия](https://img.shields.io/github/v/release/Xanixsl/YouTube-Fix-for-Yandex?style=flat-square&logo=github&logoColor=white&color=0078D4&labelColor=0d1117)](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/releases/latest)
2. Ошибка **воспроизводится** — попробуйте отключить другие расширения
3. Ошибка ещё **не зарегистрирована** в [Issues](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues)

### Как оформить баг-репорт

Перейдите в [Issues → New Issue](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues/new) и укажите:

| Поле | Что указать |
|------|-------------|
| **Браузер** | Название + версия (например: Яндекс Браузер 24.1) |
| **Версия скрипта** | Видна в заголовке окна настроек |
| **Менеджер скриптов** | Violentmonkey / Tampermonkey + версия |
| **Что произошло** | Чёткое описание ошибки |
| **Шаги воспроизведения** | Нумерованный список: 1. Открыть YouTube → 2. Нажать... |
| **Ожидаемое поведение** | Что должно было произойти |
| **Скриншот / видео** | Прикрепите если возможно |
| **Ошибки в консоли** | F12 → вкладка Console, вставьте красные ошибки |

---

## 💡 Предложить функцию

Есть идея? Откройте [Discussion](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/discussions) или [Issue](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues/new) с меткой `enhancement`.

Укажите:
- **Какую проблему решает функция?**
- **Опишите решение** — как оно должно работать?
- **Есть ли альтернативы?**
- **Скриншоты или макеты**, если применимо

> ⚠️ Функции, не связанные с YouTube или Яндекс Браузером, скорее всего приняты не будут.

---

## 🔧 Внести код

### Перед началом

- Проверьте [открытые issues](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues) — ваша идея может уже отслеживаться
- Для крупных изменений сначала откройте issue для обсуждения
- Проект — **однофайловый userscript**: вся логика находится в `youtube-fix-yandex.user.js`

### Процесс работы

```
1. Сделайте Fork репозитория
2. Создайте ветку: git checkout -b fix/опишите-изменение
3. Внесите изменения
4. Протестируйте в Яндекс Браузере и Chrome с Violentmonkey
5. Зафиксируйте: git commit -m "fix: опишите что исправлено"
6. Отправьте и откройте Pull Request
```

### Чеклист Pull Request

- [ ] Протестировано в **Яндекс Браузере** (основная цель)
- [ ] Протестировано в **Chrome** с Violentmonkey
- [ ] Нет новых ошибок в консоли браузера
- [ ] Существующие функции работают
- [ ] Код читаем и соответствует стилю проекта
- [ ] В описании PR объяснено что изменено и зачем

---

## 🌍 Переводы

Скрипт поддерживает **английский** и **русский** через JSON-файлы языков:

| Файл | Язык |
|------|------|
| `lang/EN_en.json` | Английский |
| `lang/RU_ru.json` | Русский |

Чтобы добавить новый язык:
1. Скопируйте `lang/EN_en.json` → `lang/XX_xx.json` (например `DE_de.json`)
2. Переведите все значения (ключи не менять!)
3. Откройте `youtube-fix-yandex.user.js`, найдите функцию `loadLang()`
4. Добавьте код вашего языка в список поддерживаемых
5. Отправьте Pull Request

---

## 📐 Стиль кода

Скрипт намеренно хранится в **одном файле** для удобства распространения как userscript.

- **Отступы:** 4 пробела
- **Точки с запятой:** да
- **Кавычки:** одинарные `'` в JS, двойные `"` в HTML-атрибутах
- **Комментарии:** `//` для строк, блочные для разделов
- **Функции:** предпочтительны именованные функции
- **Без зависимостей** — только чистый vanilla JS
- **Без инструментов сборки** — файл `.user.js` и есть финальный продукт

### Маркеры разделов в скрипте

```js
// === НАЗВАНИЕ РАЗДЕЛА ===
```

Сохраняйте этот паттерн при добавлении новых разделов.

---

## ⚖️ Лицензия

Участвуя в разработке, вы соглашаетесь, что ваши вклады будут лицензированы под той же лицензией, что и проект:

**Пользовательская лицензия** (все права защищены) — см. [LICENSE](../LICENSE) / [LICENSE_RU.md](LICENSE_RU.md)

Это означает:
- Другие могут свободно использовать и распространять проект в исходном виде с указанием авторства
- **Модификации, производные работы и переименование запрещены**
- Ваш вклад становится частью основного проекта на условиях этой лицензии

---

<div align="center">

🛠 Разработчик: [Xanixsl](https://github.com/Xanixsl) &nbsp;·&nbsp; [Issues](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/issues) &nbsp;·&nbsp; [Discussions](https://github.com/Xanixsl/YouTube-Fix-for-Yandex/discussions)

</div>
