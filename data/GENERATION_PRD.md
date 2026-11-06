# Exercise JSON Generation Contract

This file is the source of truth for creating exercise JSON for the BERT Sentence Reflex Trainer. When the user asks to generate an exercise in this workspace, follow this contract and create the JSON file directly unless the user explicitly asks for JSON text only.

## User Parameters

The user may provide these fields in chat:

```text
Category: Mixed Tenses Flow
Exercise: Mix
Extra Info:
Length: short
Level: intermediate
Context: A busy morning routine
```

- `Category` is required and selects the main category shown on the home page, such as `Mixed Tenses Flow`.
- `Exercise` is required and selects a child page under that category, such as `Mix`. The child page represents the exercise unit or grammar focus; each generated exercise is numbered within that page and appears as `Exercise 01`, `Exercise 02`, and so on. Do not ask the user to provide the sequence number.
- `Extra Info` is optional and provides a concise supplementary explanation to show in a separate green callout above the passage. If the user omits it or leaves it blank, set the JSON `extra_info` field to `""`.
- Use these main categories: `Mixed Tenses Flow`, `Negative Questions`, `Conditionals`, `Reported Speech`, `Mixed Tense Passive`, `Relative Clauses`, and `Relative Pronouns`. Every main category must contain at least one child page; do not put exercise JSON files directly in a main-category folder.
- Use these child-page names and folder IDs so related exercises stay grouped consistently:

| Category | Exercise (child page) | Folder |
|---|---|---|
| `Mixed Tenses Flow` | Irregular Past Simple | `IrregularPastSimple` |
| `Mixed Tenses Flow` | Irregular Past Participle | `IrregularPastParticiple` |
| `Mixed Tenses Flow` | Mix | `Mix` |
| `Mixed Tenses Flow` | Past Simple vs Present Perfect | `PastSimpleVsPresentPerfect` |
| `Mixed Tenses Flow` | Past Simple vs Past Continuous | `PastSimpleVsPastContinuous` |
| `Mixed Tenses Flow` | Past Perfect and Sequence | `PastPerfectAndSequence` |
| `Mixed Tenses Flow` | Future Forms | `FutureForms` |
| `Negative Questions` | Negative Questions | `NegativeQuestions` |
| `Negative Questions` | Be / Do / Have | `BeDoHave` |
| `Negative Questions` | Modal Verbs | `ModalVerbs` |
| `Negative Questions` | Meaning and Answers | `MeaningAndAnswers` |
| `Conditionals` | Forms | `Forms` |
| `Conditionals` | Zero Conditional | `ZeroConditional` |
| `Conditionals` | First Conditional | `FirstConditional` |
| `Conditionals` | Second Conditional | `SecondConditional` |
| `Conditionals` | Third Conditional | `ThirdConditional` |
| `Conditionals` | First, Second and Third Conditionals | `FirstSecondThirdConditionals` |
| `Conditionals` | Mixed Conditionals | `MixedConditionals` |
| `Conditionals` | Unless / As Long As | `UnlessOrAsLongAs` |
| `Reported Speech` | Mixed Tense Reported Statements | `MixedTenseReportedStatements` |
| `Reported Speech` | Reported Yes/No Questions | `ReportedYesNoQuestions` |
| `Reported Speech` | Reported Wh Questions | `ReportedWhQuestions` |
| `Reported Speech` | Reported Requests and Orders | `ReportedRequestsAndOrders` |
| `Reported Speech` | Say and Tell | `SayAndTell` |
| `Reported Speech` | Tense and Time Changes | `TenseAndTimeChanges` |
| `Mixed Tense Passive` | Passive with Mixed Tenses | `PassiveWithMixedTenses` |
| `Mixed Tense Passive` | Passive with Verbs with Two Objects | `PassiveWithTwoObjects` |
| `Mixed Tense Passive` | Passive in Subordinate Clauses | `PassiveInSubordinateClauses` |
| `Mixed Tense Passive` | Modal and Future Passive | `ModalAndFuturePassive` |
| `Mixed Tense Passive` | Active vs Passive | `ActiveVsPassive` |
| `Relative Clauses` | General Relative Clauses | `GeneralRelativeClauses` |
| `Relative Clauses` | Where or That | `WhereOrThat` |
| `Relative Clauses` | Dropping the Relative Pronoun | `DroppingTheRelativePronoun` |
| `Relative Pronouns` | Which or That | `WhichOrThat` |
| `Relative Pronouns` | Who or Whom | `WhoOrWhom` |
| `Relative Pronouns` | Relative Pronoun or Interrogative? | `RelativePronounOrInterrogative` |
| `Relative Pronouns` | Compound Relative Pronouns | `CompoundRelativePronouns` |

- If an exercise is a broad mixed practice, use its matching child page (`Forms` for Conditionals or `Mixed Tense Reported Statements` for Reported Speech) instead of mislabeling its content.
- In the child-page list, place broad mixed or general practice pages last, after focused units: `Mix`, `Negative Questions`, `Forms`, `Mixed Tense Reported Statements`, and `Passive with Mixed Tenses`.
- Every planned child page is listed before its first exercise is generated. Empty child pages show `0 exercises`; do not create placeholder JSON files. Save the first real exercise in its mapped folder, and the app will discover it automatically.
- `Length` is `short`, `medium`, or `long`. Default: `short`.
- `Level` is optional. Default: `intermediate`. Use `beginner`, `intermediate`, or `advanced` and write this value to the JSON `difficulty` field.
- `Context` is optional. If omitted, invent one suitable, coherent context.
- All exercise content is written in English; language is not a per-request option.
- Generate exactly one exercise by default. Generate multiple files only when the user explicitly requests multiple exercises; the requested count can be stated naturally in chat and does not need a prompt field.

If `Category` or `Exercise` is missing or unclear, ask one concise clarification before generating. Do not ask for optional fields; use their defaults.

## Workspace Workflow

1. Use `Category` as the main-category folder and `Exercise` as the child-page folder, following the table above. For example, `Category: Mixed Tenses Flow` with `Exercise: Mix` maps to `data/MixedTenseFlow/Mix/`. If the requested pair is not listed, ask one concise clarification rather than inventing a new category or child page.
2. Name each file `{child-folder-kebab-case}-{NN}.json`, where the prefix is derived from the child page. Use a two-digit sequence starting at `01`. For example, `Category: Relative Pronouns`, `Exercise: Which or That` uses `data/RelativePronouns/WhichOrThat/which-or-that-01.json`; `Category: Conditionals`, `Exercise: Forms` uses `data/Conditionals/Forms/forms-01.json`; and `Category: Mixed Tenses Flow`, `Exercise: Mix` uses `data/MixedTenseFlow/Mix/mix-01.json`. The app displays those files inside the selected child page as `Exercise 01`, `Exercise 02`, and so on.
3. Before choosing a number, inspect the destination folder for files with the exact same prefix. Use the current highest suffix plus one; do not fill gaps in older numbering. Never overwrite an existing file. For multiple requested exercises, continue with consecutive numbers.
4. The app discovers category folders, child-page folders, and their `.json` files automatically. Planned empty child pages are configured in the app catalog; do not create placeholder JSON files or edit application code when adding an exercise.
5. Before drafting, inspect existing exercises in the destination child-page folder, prioritizing the five most recent files (or all files if fewer than five). Use them to avoid repeating the same story template, voice, and sequence of grammar targets.
6. After writing a file, parse/validate the JSON and check all schema, mask, and variety rules below. Report the created filename(s) and any validation caveat.
7. If the user explicitly asks for JSON in chat only, do not create a file; return only the JSON object without Markdown fences or commentary.

Each exercise JSON must include a `created_at` field in ISO 8601 format with a timezone offset, recording when that exercise is created. The catalog uses the earliest exercise timestamp among all exercises in each main category as its creation time. The home page defaults to this stable main-category order: Mixed Tenses Flow, Negative Questions, Conditionals, Reported Speech, Mixed Tense Passive, Relative Clauses, and Relative Pronouns; other categories follow in creation-time order. Learners can switch to creation-time or name sorting.

Use the required `extra_info` string for a short supplementary explanation that helps learners understand a concept or context before starting the passage. The app displays non-empty `extra_info` in its own green callout above the exercise passage. Keep it separate from `paragraphs` and do not put blanks, prompts, or story sentences in it. Set it to `""` when no supplementary explanation is needed.

Each exercise must also include a `tags` array containing 2-4 concise English hashtags that describe the story's subject matter (for example, `["#medical", "#sport"]`). Choose tags from the actual story context, not merely its grammar unit. Use lowercase, single-token hashtags beginning with `#`; do not include links or duplicate tags. These tags appear in the expandable information area and are intended to support future search.

## Generation Rules

### 1. Coherent Context

`paragraphs` must form one complete, natural short story or continuous dialogue. Do not produce unrelated example sentences. Keep people, time, place, and events consistent from beginning to end.

### 2. Broad, Useful Context and Vocabulary

Use the context the user requests instead of automatically replacing it because the subject is sensitive, controversial, political, or involves conflict or violence. English practice should expose learners to a broad range of real-world topics and useful vocabulary. Handle factual topics accurately and with appropriate nuance, but do not force an artificial neutral framing when it weakens the requested context. Keep the requested grammar objective primary; introduce topic vocabulary naturally in context at a level appropriate to the learner. Avoid gratuitous detail that does not support the passage or language-learning goal.

### 3. Natural Voice and Variety

Write passages that feel like plausible, naturally written English rather than generic textbook examples. Match the voice to the requested context: casual scenes may use conversational wording and natural dialogue; news or public-affairs scenes may use a concise headline or lead, clear attribution, and the measured, information-first tone of mainstream broadcast journalism. If the user names a news outlet as a reference, use broad genre traits rather than copying its distinctive phrasing or any specific article.

Choose character names afresh for each exercise. When characters are from a specific country or cultural setting, use names that are natural and appropriate to that culture (for example, Yui for a Japanese woman); do not assign generic English names to local characters by default. When characters' backgrounds are unspecified, choose names randomly from a broad range of English names. Do not default to Maya, repeatedly reuse recent characters, or rely on a small fixed name list. When a character's name is not needed, it is fine to leave them unnamed. Vary the kind of scene and point of view where appropriate, while keeping the story easy to follow.

Treat each passage as a realistic simulation by default. Do not add meta labels or disclaimers such as "fictional" or "fictional scenario" unless the user asks for them or they are needed to prevent invented details from being mistaken for specific real-world facts. For sensitive or current-affairs contexts, avoid fabricating real quotes, statistics, official actions, or event details; use verified, supportable context or keep illustrative details general.

#### Distinct Formats and Originality

Every exercise must feel independently conceived, not like an existing passage with its topic words, names, or setting swapped. Before drafting, compare the planned passage with the sibling exercises inspected in the workflow. Change the underlying scenario and story progression, not just its vocabulary. For each new passage, make at least three substantial choices different from its closest sibling, such as:

- format and voice;
- opening approach, point of view, and who carries the information;
- event sequence, paragraph purpose, and how the passage reaches its ending;
- sentence patterns, transitions, and distribution of dialogue versus narration.

Choose the format and voice afresh for each exercise, guided by the specific context, scenario, and people involved. The format should feel like a natural fit, not a random wrapper applied to the topic. Use broad creative freedom: possibilities include conversations, interviews, presentations, reports, messages, personal accounts, reviews, meeting exchanges, narratives, and many others; this list is illustrative, not a required menu or limit. A political context might suit a news briefing, a debate, a conversation, or a first-person account; a music context might suit entertainment coverage, an interview, a rehearsal-room exchange, a review, or friends talking. Do not make the topic mechanically determine one format, and do not repeatedly default to news reporting. When the user leaves format open, vary it unpredictably but plausibly across exercises instead of following a fixed rotation or template. When the user specifies a format, honor it while still varying the scenario and structure where possible. Never imitate a named outlet's distinctive style or copy its articles.

### 4. Focused Learning Objective

Every blank must test the requested `Exercise` module. Do not add unrelated grammar targets. For mixed grammar topics, make each form necessary and inferable from the surrounding context, not randomly selected.

For exercises with multiple grammar targets, plan the target sequence before writing and compare it with recent sibling exercises. Do not reuse the same target-to-mask-position sequence or place the same target types in the same paragraph pattern by default. Vary which target types appear near the beginning, middle, and end, while maintaining balanced and pedagogically appropriate coverage of the requested grammar. Do not randomize blindly: each target's position must still fit naturally into the scenario and have a clear contextual cue. For a single-focus exercise, vary the surrounding grammatical cues and task placement rather than introducing unrelated targets.

### 5. Unambiguous Answers

Each blank must have a clear, natural target answer supported by context. Avoid contexts where several different answers are equally correct unless each valid equivalent is included in `acceptable_variants`.

### 6. Reported Statements Format

Reported Statements exercises practise transforming a complete direct statement into a complete reported statement. Include `task_instruction` and show each original statement in red parentheses, then provide one answer blank for the entire reported sentence. Do not split the answer into partial verb-form blanks. Store only the instruction text and red source text in JSON; the app adds the parentheses.

Use this pattern:

```text
({{red:He works in a bank.}}) {{mask_1}}
```

The mask target is the complete sentence, including the reporting clause:

```json
{
  "task_instruction": "Rewrite each direct statement as reported speech.",
  "masks": {
    "mask_1": {
      "target": "She said that he worked in a bank.",
      "acceptable_variants": ["She said he worked in a bank."],
      "hint": ""
    }
  }
}
```

Use the red marker for every original/direct statement that the learner must transform. The complete target answer is revealed in red when the learner submits an incorrect answer. Count one complete transformation as one blank for the requested exercise length.

### 7. Passive Voice Transformation Format

Passive Voice exercises practise changing a complete active sentence into a complete passive sentence. Include `task_instruction` and show each active source sentence in red parentheses, then provide one answer blank for the entire passive sentence. Do not provide only a verb-phrase blank inside a story. Store only the instruction text and red source text in JSON; the app adds the parentheses.

Use this pattern:

```text
({{red:Somebody sends emails.}}) {{mask_1}}
```

The mask target is the complete passive sentence:

```json
{
  "task_instruction": "Rewrite each active sentence in the passive voice.",
  "masks": {
    "mask_1": {
      "target": "Emails are sent.",
      "acceptable_variants": [],
      "hint": ""
    }
  }
}
```

Use the red marker for every active sentence that the learner must transform. Preserve the tense and meaning when changing voice; include the agent with `by` only when it is important or specified. The complete target answer is revealed in red when the learner submits an incorrect answer. Count one complete active-to-passive transformation as one blank for the requested exercise length. This applies to all Passive Voice exercises, including Mixed Tense Passive.

For an exercise named `Mixed Tense Passive`, include active sentences in several different tenses and transform each into the corresponding passive tense. Do not keep all questions in one tense; choose tense variety appropriate to the requested level.

Passive exercises may focus on specific structures such as verbs with two objects or passive forms inside subordinate clauses. For two-object verbs, accept both natural passive patterns when applicable (for example, `Mia was given a book` / `A book was given to Mia`). For subordinate clauses, keep the main clause intact and change the relevant embedded clause to passive (for example, `They expect the staff to clean the room` → `They expect the room to be cleaned`). In mixed exercises, label or group the examples clearly in the passage context while preserving the full-sentence active prompt and full-sentence passive answer format.

### 8. Negative Questions Transformation Format

When an exercise asks learners to rewrite or transform a sentence, show every source sentence in red and provide one answer blank for the rewritten form. Set the optional top-level `task_instruction` field to explain the transformation. The app displays this instruction in parentheses above the passage and encloses each red source sentence in parentheses; store only the instruction and source sentence text in JSON, without adding display parentheses. Do not put a colon immediately before a parenthesized source sentence. For Negative Questions, keep the question mark outside the blank when the target omits punctuation.

Use this pattern:

```text
({{red:Leo was usually at the gate by eight.}}) {{mask_1}}?
```

```json
{
  "task_instruction": "Rewrite each affirmative statement as a negative question.",
  "masks": {
    "mask_1": {
      "target": "Wasn't Leo usually at the gate by eight",
      "acceptable_variants": ["Was Leo not usually at the gate by eight"],
      "hint": "be"
    }
  }
}
```

Preserve the source statement's tense, subject, and meaning in the negative question. Mark every source sentence consistently; do not leave only some transformation prompts in red. The app renders the source in parentheses when `task_instruction` is present, so do not type literal parentheses in the JSON passage.

### 9. Smart Variants

Use `target` for the preferred full answer. Use `acceptable_variants` for genuinely equivalent common forms, including natural contractions where applicable, e.g. `have been` / `'ve been`, `would have` / `would've`, or `am` / `'m`. Do not list a form that changes meaning, tense, grammatical function, or naturalness. Use an empty array when there are no reasonable alternatives. The app ignores case and leading/trailing whitespace, as well as one optional final period, during answer checking. Do not add punctuation-only variants for a final period.
`target` and `acceptable_variants` must contain exactly the text the learner is expected to type inside the blank. The placeholder boundary must match the grammatical material being tested exactly: do not put fixed sentence text inside an answer, and do not hide fixed words in the blank merely because they belong to a longer verb phrase. Keep every supplied word outside `{{mask_N}}`, including words directly adjacent to the blank and fixed auxiliaries or modal verbs. For example, write `the surcharge {{mask_1}} effect` with target `had taken`, not target `had taken effect`; write `they might {{mask_2}} a lower price` with target `have negotiated`, not target `might have negotiated`. A learner must never be asked to type a word that the sentence already supplies.

### 10. Masks and Hints

- Write blanks as `{{mask_1}}`, `{{mask_2}}`, etc. in `paragraphs`.
- Wrap source statements and any other prompt text that should appear in red as `{{red:the text}}`. The app displays the wrapped text in red; do not use HTML tags.
- When a specific adverb or other lexical item is required but is not clear from context, include it with the base verb in the mask's `hint`, e.g. `"hint": "already arrive"` or `"hint": "never work"`. The hint appears inside the answer input's placeholder, so do not add a parenthetical `(use ...)` cue or a `{{cue:...}}` marker in the passage. Do not include tense auxiliaries or the complete target; learners should still determine the required tense and form from context.
- Number masks from 1 in order of first appearance, with no gaps.
- Each mask must appear exactly once in `paragraphs` and have exactly one matching key in `masks`.
- Each target and variant contains only the words inside its blank; words already supplied in the passage remain outside the placeholder and are never repeated in the expected answer.
- Set each placeholder boundary deliberately to isolate only the grammar being tested. Keep all fixed sentence words, including modal and auxiliary verbs, outside the blank; never expand a blank to include extra words from the surrounding phrase.
- `hint` should normally contain the base verb or a single keyword. When a specific adverb or other lexical item must be used, include it with the base verb, e.g. `already arrive` or `never see`; do not use `(use ...)` parenthetical cues. Never include tense auxiliaries or the complete target in a hint. Do not add other grammar explanations, tense clues, alternative forms, or extra sentences; the learner should infer the tense from context. In Conditional exercises, when a modal hint is useful, use only `will` rather than `will / would` or `would / would have`; learners must decide from context whether the answer needs `will`, `would`, or `would have`. For full-sentence Reported Statements and Passive Voice transformations, leave `hint` empty so the complete answer is not given away.
- For Relative Clauses exercises, leave every `hint` empty; a hint such as `person`, `place`, `thing`, or `possession` gives away which relative word to use.

### 11. Length Targets

Use the exact blank count for the requested length. Keep the story natural and divide it into enough paragraphs for readability:

- `short`: exactly 10 blanks, usually 1-2 paragraphs.
- `medium`: exactly 15 blanks, usually 2-4 paragraphs.
- `long`: exactly 20 blanks, usually 4-6 paragraphs.

## Required JSON Schema

Include the required top-level fields `topic`, `difficulty`, `created_at`, `story_title`, `extra_info`, `tags`, `paragraphs`, and `masks`. Set `extra_info` to a concise supplementary explanation or to an empty string when none is needed. `tags` is an array of 2-4 topical English hashtags. `task_instruction` is optional and should be included when learners need an explicit instruction to transform or otherwise modify the source sentences.

- `topic`: the child page name.
- `difficulty`: the requested `Level`, using `beginner`, `intermediate`, or `advanced`; default to `intermediate`.
- `tags`: 2-4 concise, lowercase English hashtags describing the story topic, each beginning with `#`; do not add links.
- `created_at`: the exercise creation time as an ISO 8601 timestamp with a timezone offset, for example `2026-10-22T01:35:00+08:00`.
- `story_title`: a concise English title that fits the story.
- `extra_info`: a concise English explanation shown in a separate green callout above the passage; use `""` if there is no extra information.
- `task_instruction` (optional): a concise English instruction shown in parentheses above the passage, e.g. `Rewrite each affirmative statement as a negative question.` Store only the instruction text, without parentheses. For exercises that transform sentences, each red source sentence is also displayed in parentheses; store only the source text inside the `red` marker, without literal parentheses. Do not place a colon immediately before the source sentence. Use this for any exercise type that asks learners to rewrite or transform a sentence.
- `paragraphs`: a non-empty array of strings containing the complete passage/dialogue and mask placeholders.
- `masks`: an object keyed by every placeholder. Each value has exactly `target`, `acceptable_variants`, and `hint`.
- `target` and `hint` are strings. `acceptable_variants` is an array of strings, possibly empty.
- Do not use the legacy key `variants` in new files.
- When `task_instruction` is present, the app displays its text in parentheses; do not include the parentheses in the JSON value. For sentence-rewriting exercises, each sentence to be transformed must be marked in red and is displayed in parentheses; do not add literal parentheses or a colon before the source sentence. The instruction must clearly name the source and target form.

Example shape:

```json
{
  "topic": "Mix",
  "difficulty": "intermediate",
  "created_at": "2026-10-22T01:35:00+08:00",
  "story_title": "A Busy Morning Routine",
  "extra_info": "",
  "tags": ["#dailylife", "#family"],
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
- Required top-level fields, including `extra_info`, are present; `extra_info` is either a concise supplementary explanation or an empty string.
- `tags` contains 2-4 unique, lowercase English topical hashtags, each beginning with `#`.
- Include only the optional `task_instruction` field in addition to the required fields when an explicit transformation instruction is needed.
- `difficulty` is `beginner`, `intermediate`, or `advanced` and matches the requested `Level` (default `intermediate`).
- `created_at` is a valid ISO 8601 timestamp with an explicit timezone offset.
- `topic` matches the child page name; the filename prefix is derived from that child page folder.
- The passage is coherent and has exactly 10, 15, or 20 blanks for `short`, `medium`, or `long`, respectively.
- The passage has a distinct scenario, format/voice, and progression from recent sibling exercises; it is not merely a topic-swapped rewrite. Confirm at least three substantial differences from its closest sibling.
- For multi-target exercises, the target-to-mask-position sequence and paragraph distribution differ meaningfully from recent siblings, while retaining the requested grammar coverage and clear contextual cues.
- Every placeholder matches exactly one mask key; mask numbering is sequential and each appears once.
- Every `target` is supported by context; variants are truly equivalent and stored in `acceptable_variants`.
- If a blank requires a specific adverb or other lexical item that is not clear from context, include it with the base verb in the hint, e.g. `"hint": "already arrive"`; do not add a parenthetical cue after the blank or use a `(use ...)` hint.
- Answers are checked case-insensitively and ignore surrounding whitespace; a single final period is optional, so learners are not marked wrong for omitting or adding it.
- For grammar-focused blanks, keep targets limited to the grammatical form being tested; place fixed complements and other non-target words (for example, `ready` after `would be`) outside the placeholder. Include a particle or preposition only when it is part of the verb being tested (for example, the phrasal verb `turn on`).
- For every blank, verify that its target and variants contain no word already supplied immediately before or after the placeholder, including fixed modal or auxiliary verbs; check that the blank tests only the intended grammatical material.
- Every hint is a base verb or single keyword, optionally combined with a required adverb or lexical cue (e.g. `already arrive`); do not include tense auxiliaries, full targets, parenthetical cues, or other grammar explanations.
- The file uses UTF-8 and does not overwrite another exercise.

## Copy-and-Paste Prompt

Use this prompt in a future Copilot chat and replace the values:

```text
Read and follow data/GENERATION_PRD.md as the source of truth.

Category: [main category, e.g. Mixed Tenses Flow]
Exercise: [child page / grammar unit, e.g. Mix]
Length: [short / medium / long]
Level: [optional; default intermediate]
Context: [optional; invent one if omitted]

Generate one exercise by default. `Category` is the parent category and `Exercise` is its child page; for example, `Category: Mixed Tenses Flow` and `Exercise: Mix` means the Mix child page under Mixed Tenses Flow. Create the exercise in that child page using the next two-digit sequence number, so its filename is `mix-01.json` and the app labels it `Exercise 01`. Follow the category/child-page folder mapping in data/GENERATION_PRD.md. Inspect the destination child folder for the highest matching sequence number and compare recent exercises for originality and target-position variety; then create the JSON file(s) there using the next consecutive number(s). Set `topic` to the child page name. Validate the JSON, mask mappings, and variety rules, report the relative path(s) created, and do not overwrite existing files.
```
