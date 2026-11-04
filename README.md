# BERT English Reflex Trainer

A lightweight English learning app that helps build intuitive sentence-structure and grammar skills through passage-based exercises.

## Generating Exercises

Paste the following prompt into a VS Code Copilot chat, then fill in the main category, child page, and length you want to practice. Copilot will follow [data/GENERATION_PRD.md](data/GENERATION_PRD.md) to generate the exercise, create a JSON file, and validate its format and mask mappings.

```text
Follow data/GENERATION_PRD.md and generate an exercise directly as a JSON file.

Category: [Main category, e.g. Mixed Tenses Flow]
Exercise: [Child page / grammar unit, e.g. Mix]
Length: [short / medium / long]
Level: [Optional; defaults to intermediate]
Context: [Optional; design one if not provided]

Generate one exercise by default. `Category` is the parent category shown on the home page, and `Exercise` is its child page; for example, `Category: Mixed Tenses Flow` with `Exercise: Mix` selects the Mix page inside Mixed Tenses Flow. Create the exercise with the next two-digit sequence in that child page (for example, `mix-01.json`, displayed as `Exercise 01`). Follow the category/child-page folder mapping in data/GENERATION_PRD.md, validate the JSON and mask mappings, report its relative path, and do not overwrite existing files.
```

## Running the App

Run the following command in the project directory:

```bash
npm run dev
```

Then open http://127.0.0.1:4173/. The home page lists the main categories in the default learning order and provides a selector to sort them by creation time or by name. Use the star beside a category to save it as a favorite; favorites are stored in browser local storage. On a category's child-page list, use the check mark to track completed units, and on an exercise list, use it to track practiced exercises; both statuses are stored in browser local storage. Open a child page to select an exercise. Planned child pages are visible even before they have exercises and show a count of zero; they appear automatically once an exercise is added. To add an exercise, place it in the appropriate category/child-page folder according to [data/GENERATION_PRD.md](data/GENERATION_PRD.md).

## Deploying to GitHub Pages

This project can also be published as a static site; no Node.js server is needed on GitHub Pages. Preview the static output locally with:

```bash
npm run build
npx serve dist
```

The build copies the app, exercise data, and the animation package runtime into `dist/`, then generates `catalog.json`. A GitHub Actions workflow builds and deploys the site whenever code is pushed to `master`. In the repository settings, open **Pages** and set **Build and deployment → Source** to **GitHub Actions**. The site URL will be `https://<username>.github.io/<repository>/`.

The app uses hash-based routes (for example, `/#/MixedTenseFlow/Mix/01`) so direct links work on GitHub Pages without server-side routing.

---

# BERT 語感反射訓練器

一款輕量化的英文語感訓練軟體，透過篇章練習培養句型與文法反應。

## 生成練習篇章

請在 VS Code Copilot 對話中貼上以下 prompt，填入想練習的主題與長度。我會依照 [data/GENERATION_PRD.md](data/GENERATION_PRD.md) 產生內容、建立 JSON 檔並檢查格式與 mask 對應。

```text
請遵循 data/GENERATION_PRD.md，直接生成並建立練習 JSON。

Category: [主分類，例如 Reported Speech]
Exercise: [具體文法練習主題或子分類，例如 Reported Yes/No Questions]
Length: [short / medium / long]
Level: [可省略，預設 intermediate]
Context: [可省略，讓你自行設計]

篇數預設 1 篇。`Category` 是首頁的母分類，`Exercise` 是母分類底下的子頁；例如 `Category: Mixed Tenses Flow` 搭配 `Exercise: Mix`，代表 Mixed Tenses Flow 分類中的 Mix 子頁。請在該子頁資料夾中使用下一個兩位數序號建立篇章（例如 `mix-01.json`，介面顯示為 `Exercise 01`）。請遵循 data/GENERATION_PRD.md 的資料夾對照，建立後驗證 JSON 和 mask 對應，回報檔案相對路徑，不要覆寫現有檔案。
```

## 啟動應用程式

在專案資料夾執行：

```bash
npm run dev
```

然後開啟 http://127.0.0.1:4173/。首頁會依預設學習順序列出主分類，也可選擇依建立時間或名稱排序。按分類前的星星可收藏分類，收藏會記錄在瀏覽器 localStorage；進入分類後，可按子頁前的勾勾記錄完成狀態，也可在篇章清單按勾勾記錄是否練習過，狀態皆儲存在瀏覽器 localStorage。再進入子頁選擇篇章。尚未生成練習的預設子頁也會顯示，並標示 0 篇；新增練習後會自動出現篇章。請依照 [data/GENERATION_PRD.md](data/GENERATION_PRD.md) 放入對應資料夾。

## 部署到 GitHub Pages

這個專案也可以輸出為靜態網站，GitHub Pages 不需要執行 Node.js 伺服器。可先在本機建置並預覽：

```bash
npm run build
npx serve dist
```

建置會把前端、練習資料與動畫套件執行時所需檔案輸出至 `dist/`，並產生 `catalog.json`。推送到 `master` 後，GitHub Actions 會自動建置及部署。請到儲存庫 **Settings → Pages**，將 **Build and deployment → Source** 設為 **GitHub Actions**。網站網址會是 `https://<你的帳號>.github.io/<儲存庫名稱>/`。

網站使用 hash 路由（例如 `/#/MixedTenseFlow/Mix/01`），因此在 GitHub Pages 上直接開啟練習連結也能正常運作。
