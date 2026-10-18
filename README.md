# BERT 語感反射訓練器

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
