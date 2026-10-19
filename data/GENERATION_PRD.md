# Exercise JSON Generation Contract

This file is the source of truth for creating exercise JSON for the BERT Sentence Reflex Trainer. When the user asks to generate an exercise in this workspace, follow this contract and create the JSON file directly unless the user explicitly asks for JSON text only.

## User Parameters

The user may provide these fields in chat:

```text
Exercise: Mixed Tenses Flow
Length: short
Level: intermediate
Context: A busy morning routine
```

- `Exercise` is required and contains only the grammar or vocabulary module name, e.g. `Mixed Tenses Flow`, `Reported Speech`, `Irregular Verbs`, or `Articles and Prepositions`. Do not require the user to provide a filename sequence; add it automatically when naming the file.
- `Length` is `short`, `medium`, or `long`. Default: `short`.
- `Level` is optional. Default: `intermediate`. Use `beginner`, `intermediate`, or `advanced` and write this value to the JSON `difficulty` field.
- `Context` is optional. If omitted, invent one suitable, coherent context.
- All exercise content is written in English; language is not a per-request option.
- Generate exactly one exercise by default. Generate multiple files only when the user explicitly requests multiple exercises; the requested count can be stated naturally in chat and does not need a prompt field.

If `Exercise` is missing or unclear, ask one concise clarification before generating. Do not ask for optional fields; use their defaults.

## Workspace Workflow

1. Create one JSON file for each requested exercise under `data/{CategoryCamelCase}/`, where the folder is the main category name in UpperCamelCase with spaces removed. For this project, `Mixed Tenses Flow` maps to `MixedTenseFlow`.
2. Name each file `{category-kebab-case}-{NN}.json`, where the main category name is lowercase kebab-case and `NN` is a two-digit sequence, starting at `01`. For this project, `Mixed Tenses Flow` maps to `mixed-tense-flow-01.json`.
3. Before choosing a number, inspect the category folder for files with the exact same kebab-case prefix. Use the current highest suffix plus one; do not fill gaps in older numbering. For example, if `mixed-tense-flow-01.json` exists, create `mixed-tense-flow-02.json`; if `01` and `02` exist, create `03`. For multiple requested exercises, continue with consecutive numbers. Never overwrite an existing file. The sequence is generated automatically and is not part of the user's `Exercise` value.
4. The app discovers category subfolders and their `.json` files automatically. Do not edit a catalog or application code when adding an exercise.
5. After writing a file, parse/validate the JSON and check all schema and mask rules below. Report the created filename(s) and any validation caveat.
6. If the user explicitly asks for JSON in chat only, do not create a file; return only the JSON object without Markdown fences or commentary.

## Generation Rules

### 1. Coherent Context

`paragraphs` must form one complete, natural short story or continuous dialogue. Do not produce unrelated example sentences. Keep people, time, place, and events consistent from beginning to end.

### 2. Focused Learning Objective

Every blank must test the requested `Exercise` module. Do not add unrelated grammar targets. For mixed grammar topics, make each form necessary and inferable from the surrounding context, not randomly selected.

### 3. Unambiguous Answers

Each blank must have a clear, natural target answer supported by context. Avoid contexts where several different answers are equally correct unless each valid equivalent is included in `acceptable_variants`.

### 4. Smart Variants

Use `target` for the preferred full answer. Use `acceptable_variants` for genuinely equivalent common forms, including natural contractions where applicable, e.g. `have been` / `'ve been`, `would have` / `would've`, or `am` / `'m`. Do not list a form that changes meaning, tense, grammatical function, or naturalness. Use an empty array when there are no reasonable alternatives. The app ignores case and leading/trailing whitespace, so do not list those as variants.
`target` and `acceptable_variants` must contain exactly the text the learner is expected to type inside the blank. The placeholder boundary must match the grammatical material being tested exactly: do not put fixed sentence text inside an answer, and do not hide fixed words in the blank merely because they belong to a longer verb phrase. Keep every supplied word outside `{{mask_N}}`, including words directly adjacent to the blank and fixed auxiliaries or modal verbs. For example, write `the surcharge {{mask_1}} effect` with target `had taken`, not target `had taken effect`; write `they might {{mask_2}} a lower price` with target `have negotiated`, not target `might have negotiated`. A learner must never be asked to type a word that the sentence already supplies.

### 5. Masks and Hints

- Write blanks as `{{mask_1}}`, `{{mask_2}}`, etc. in `paragraphs`.
- When the user asks to visually distinguish modified or added supporting text (such as text immediately after an answer blank), wrap that text as `{{red:the revised text}}`. The app displays the wrapped text in red; do not use HTML tags.
- Number masks from 1 in order of first appearance, with no gaps.
- Each mask must appear exactly once in `paragraphs` and have exactly one matching key in `masks`.
- Each target and variant contains only the words inside its blank; words already supplied in the passage remain outside the placeholder and are never repeated in the expected answer.
- Set each placeholder boundary deliberately to isolate only the grammar being tested. Keep all fixed sentence words, including modal and auxiliary verbs, outside the blank; never expand a blank to include extra words from the surrounding phrase.
- `hint` should contain only the base verb or a single keyword. Do not add parentheses, grammar explanations, tense clues, or extra sentences; the learner should infer the form from context.

### 6. Length Targets

Use the exact blank count for the requested length. Keep the story natural and divide it into enough paragraphs for readability:

- `short`: exactly 10 blanks, usually 1-2 paragraphs.
- `medium`: exactly 15 blanks, usually 2-4 paragraphs.
- `long`: exactly 20 blanks, usually 4-6 paragraphs.

## Required JSON Schema

Output exactly these top-level fields: `topic`, `difficulty`, `story_title`, `paragraphs`, and `masks`.

- `topic`: the requested exercise/module name.
- `difficulty`: the requested `Level`, using `beginner`, `intermediate`, or `advanced`; default to `intermediate`.
- `story_title`: a concise English title that fits the story.
- `paragraphs`: a non-empty array of strings containing the complete passage/dialogue and mask placeholders.
- `masks`: an object keyed by every placeholder. Each value has exactly `target`, `acceptable_variants`, and `hint`.
- `target` and `hint` are strings. `acceptable_variants` is an array of strings, possibly empty.
- Do not use the legacy key `variants` in new files.

Example shape:

```json
{
  "topic": "Mixed Tenses Flow",
  "difficulty": "intermediate",
  "story_title": "A Busy Morning Routine",
  "paragraphs": [
    "A connected sentence with {{mask_1}} in context.",
    "The next sentence continues the same story and uses {{mask_2}}."
  ],
  "masks": {
    "mask_1": {
      "target": "have been waiting",
      "acceptable_variants": ["'ve been waiting"],
      "hint": "wait"
    },
    "mask_2": {
      "target": "had already left",
      "acceptable_variants": ["'d already left"],
      "hint": "leave"
    }
  }
}
```

This is a schema example only. Generate content for the user's requested exercise, level, context, and length.

## Validation Checklist

Before considering a file complete, verify:

- It parses as strict JSON; no comments, trailing commas, Markdown fences, or extra prose.
- Only the five required top-level keys are present.
- `difficulty` is `beginner`, `intermediate`, or `advanced` and matches the requested `Level` (default `intermediate`).
- The requested exercise name is used for `topic` and the filename prefix.
- The passage is coherent and has exactly 10, 15, or 20 blanks for `short`, `medium`, or `long`, respectively.
- Every placeholder matches exactly one mask key; mask numbering is sequential and each appears once.
- Every `target` is supported by context; variants are truly equivalent and stored in `acceptable_variants`.
- For every blank, verify that its target and variants contain no word already supplied immediately before or after the placeholder, including fixed modal or auxiliary verbs; check that the blank tests only the intended grammatical material.
- Every hint is only a base verb or single keyword, with no parentheses or grammar explanation.
- The file uses UTF-8 and does not overwrite another exercise.

## Copy-and-Paste Prompt

Use this prompt in a future Copilot chat and replace the values:

```text
Read and follow data/GENERATION_PRD.md as the source of truth.

Exercise: [grammar/vocabulary module]
Length: [short / medium / long]
Level: [optional; default intermediate]
Context: [optional; invent one if omitted]

Generate one exercise by default. Only generate multiple exercises if I explicitly request more than one. Convert the Exercise name to its configured UpperCamelCase category folder and lowercase kebab-case filename prefix. Inspect that category folder for the highest existing sequence number, then create the JSON file(s) there using the next consecutive number(s). For example, Mixed Tenses Flow uses data/MixedTenseFlow/mixed-tense-flow-01.json. Validate the JSON and mask mappings, report the relative path(s) created, and do not overwrite existing files.
```
