# BERT English Reflex Trainer

A lightweight English learning app that helps build intuitive sentence-structure and grammar skills through passage-based exercises.

## Generating Exercises

Paste the following prompt into a VS Code Copilot chat, then fill in the topic and length you want to practice. Copilot will follow [data/GENERATION_PRD.md](data/GENERATION_PRD.md) to generate the exercise, create a JSON file, and validate its format and mask mappings.

```text
Follow data/GENERATION_PRD.md and generate an exercise directly as a JSON file.

Exercise: [Grammar or vocabulary topic; do not include a sequence number]
Length: [short / medium / long]
Level: [Optional; defaults to intermediate]
Context: [Optional; design one if not provided]

Generate one exercise by default. Treat Exercise as the main category name: first create its corresponding UpperCamelCase category folder, then use a kebab-case filename with a two-digit sequence number. For example, use data/MixedTenseFlow for “Mixed Tenses Flow”; if mixed-tense-flow-01.json already exists, create mixed-tense-flow-02.json next. Only create multiple sequential exercises when explicitly requested. After creating the file, validate the JSON and mask mappings, report its relative path, and do not overwrite existing files.
```

## Running the App

Run the following command in the project directory:

```bash
npm run dev
```

Then open http://127.0.0.1:4173/. The home page lists the main categories. Open a category and use the selector to switch between exercises, such as Exercise 01 and Exercise 02. To add an exercise, place it in the appropriate category folder according to [data/GENERATION_PRD.md](data/GENERATION_PRD.md); the app detects it automatically.

---

# BERT 語感反射訓練器

一款輕量化的英文語感訓練軟體，透過篇章練習培養句型與文法反應。

## 生成練習篇章

請在 VS Code Copilot 對話中貼上以下 prompt，填入想練習的主題與長度。我會依照 [data/GENERATION_PRD.md](data/GENERATION_PRD.md) 產生內容、建立 JSON 檔並檢查格式與 mask 對應。

```text
請遵循 data/GENERATION_PRD.md，直接生成並建立練習 JSON。

Exercise: [文法或詞彙主題，不要加序號]
Length: [short / medium / long]
Level: [可省略，預設 intermediate]
Context: [可省略，讓你自行設計]

篇數預設 1 篇。請把 Exercise 視為主分類名稱，先建立對應的 UpperCamelCase 分類資料夾，再使用 kebab-case 檔名與兩位數序號。例如 Mixed Tenses Flow 的資料夾為 data/MixedTenseFlow，已有 mixed-tense-flow-01.json 時，下一篇建立 mixed-tense-flow-02.json；只有我明確要求多篇時才連續建立多個序號。建立後請驗證 JSON 和 mask 對應，回報檔案相對路徑，不要覆寫現有檔案。
```

## 啟動應用程式

在專案資料夾執行：

```bash
npm run dev
node server.mjs
```

然後開啟 http://127.0.0.1:4173/。首頁會列出主分類；進入分類後，可用選單切換 Exercise 01、Exercise 02 等篇章。新增篇章時，依照 [data/GENERATION_PRD.md](data/GENERATION_PRD.md) 放入對應分類資料夾，應用程式會自動偵測。
