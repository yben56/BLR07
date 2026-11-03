import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const categoryTitles = {
  Conditionals: 'Conditionals',
  MixedTenseFlow: 'Mixed Tenses Flow',
  MixedTensePassive: 'Mixed Tense Passive',
  NegativeQuestions: 'Negative Questions',
  RelativeClauses: 'Relative Clauses',
  RelativePronouns: 'Relative Pronouns',
  ReportedSpeech: 'Reported Speech'
};

const subcategoryTitles = {
  Forms: 'Forms',
  Mix: 'Mix',
  NegativeQuestions: 'Negative Questions',
  ActiveVsPassive: 'Active vs Passive',
  BeDoHave: 'Be / Do / Have',
  CompoundRelativePronouns: 'Compound Relative Pronouns',
  DroppingTheRelativePronoun: 'Dropping the Relative Pronoun',
  FirstConditional: 'First Conditional',
  FirstSecondThirdConditionals: 'First, Second and Third Conditionals',
  FutureForms: 'Future Forms',
  GeneralRelativeClauses: 'General Relative Clauses',
  MeaningAndAnswers: 'Meaning and Answers',
  MixedConditionals: 'Mixed Conditionals',
  ModalAndFuturePassive: 'Modal and Future Passive',
  ModalVerbs: 'Modal Verbs',
  PastPerfectAndSequence: 'Past Perfect and Sequence',
  PastSimpleVsPastContinuous: 'Past Simple vs Past Continuous',
  PastSimpleVsPresentPerfect: 'Past Simple vs Present Perfect',
  MixedTenseReportedStatements: 'Mixed Tense Reported Statements',
  PassiveInSubordinateClauses: 'Passive in Subordinate Clauses',
  PassiveWithMixedTenses: 'Passive with Mixed Tenses',
  PassiveWithTwoObjects: 'Passive with Verbs with Two Objects',
  RelativePronounOrInterrogative: 'Relative Pronoun or Interrogative?',
  ReportedRequestsAndOrders: 'Reported Requests and Orders',
  ReportedWhQuestions: 'Reported Wh Questions',
  ReportedYesNoQuestions: 'Reported Yes/No Questions',
  SayAndTell: 'Say and Tell',
  SecondConditional: 'Second Conditional',
  TenseAndTimeChanges: 'Tense and Time Changes',
  ThirdConditional: 'Third Conditional',
  UnlessOrAsLongAs: 'Unless / As Long As',
  WhereOrThat: 'Where or That',
  WhichOrThat: 'Which or That',
  WhoOrWhom: 'Who or Whom',
  ZeroConditional: 'Zero Conditional'
};

const plannedSubcategories = {
  MixedTenseFlow: ['PastSimpleVsPresentPerfect', 'PastSimpleVsPastContinuous', 'PastPerfectAndSequence', 'FutureForms', 'Mix'],
  NegativeQuestions: ['BeDoHave', 'ModalVerbs', 'MeaningAndAnswers', 'NegativeQuestions'],
  Conditionals: ['ZeroConditional', 'FirstConditional', 'SecondConditional', 'ThirdConditional', 'FirstSecondThirdConditionals', 'MixedConditionals', 'UnlessOrAsLongAs', 'Forms'],
  ReportedSpeech: ['ReportedYesNoQuestions', 'ReportedWhQuestions', 'ReportedRequestsAndOrders', 'SayAndTell', 'TenseAndTimeChanges', 'MixedTenseReportedStatements'],
  MixedTensePassive: ['PassiveWithTwoObjects', 'PassiveInSubordinateClauses', 'ModalAndFuturePassive', 'ActiveVsPassive', 'PassiveWithMixedTenses'],
  RelativeClauses: ['GeneralRelativeClauses', 'WhereOrThat', 'DroppingTheRelativePronoun'],
  RelativePronouns: ['WhichOrThat', 'WhoOrWhom', 'RelativePronounOrInterrogative', 'CompoundRelativePronouns']
};

function formatDirectoryName(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

async function readExercises(directory, categoryId) {
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter(file => file.isFile() && file.name.toLowerCase().endsWith('.json'))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' }));

  const data = await Promise.all(files.map(async file => {
    const exercisePath = path.join(directory, file.name);
    try {
      const exercise = JSON.parse(await readFile(exercisePath, 'utf8'));
      if (typeof exercise.created_at !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(exercise.created_at) ||
          Number.isNaN(Date.parse(exercise.created_at))) {
        throw new Error('Missing or invalid created_at timestamp.');
      }
      return exercise;
    } catch (error) {
      throw new Error(`Unable to read exercise data from ${categoryId}/${file.name}.`, { cause: error });
    }
  }));

  return {
    data,
    exercises: files.map((file, index) => {
      const stem = path.basename(file.name, path.extname(file.name));
      const sequence = stem.match(/-(\d+)$/);
      return {
        id: file.name,
        title: sequence ? `Exercise ${sequence[1]}` : stem,
        file: file.name,
        difficulty: data[index].difficulty || 'intermediate'
      };
    })
  };
}

function earliestCreatedAt(exercises) {
  return exercises
    .map(exercise => exercise.created_at)
    .sort((left, right) => Date.parse(left) - Date.parse(right))[0];
}

export async function createCatalog(dataDirectory) {
  const entries = await readdir(dataDirectory, { withFileTypes: true });
  const categories = await Promise.all(entries
    .filter(entry => entry.isDirectory())
    .map(async entry => {
      const categoryDirectory = path.join(dataDirectory, entry.name);
      const direct = await readExercises(categoryDirectory, entry.name);
      const directorySubcategories = (await readdir(categoryDirectory, { withFileTypes: true }))
        .filter(child => child.isDirectory());
      const subcategoryIds = new Set([
        ...(plannedSubcategories[entry.name] || []),
        ...directorySubcategories.map(subcategory => subcategory.name)
      ]);
      const subcategories = await Promise.all([...subcategoryIds].map(async subcategoryId => {
        const subcategoryDirectory = path.join(categoryDirectory, subcategoryId);
        const exists = directorySubcategories.some(subcategory => subcategory.name === subcategoryId);
        const result = exists
          ? await readExercises(subcategoryDirectory, `${entry.name}/${subcategoryId}`)
          : { data: [], exercises: [] };

        return {
          id: subcategoryId,
          title: subcategoryTitles[subcategoryId] || result.data[0]?.topic || formatDirectoryName(subcategoryId),
          created_at: result.data.length ? earliestCreatedAt(result.data) : null,
          exercises: result.exercises,
          data: result.data
        };
      }));
      const allExerciseData = [
        ...direct.data,
        ...subcategories.flatMap(subcategory => subcategory.data)
      ];

      if (direct.exercises.length === 0 && subcategories.length === 0) return null;

      return {
        id: entry.name,
        title: categoryTitles[entry.name] || direct.data[0]?.topic || formatDirectoryName(entry.name),
        created_at: earliestCreatedAt(allExerciseData),
        exercises: direct.exercises,
        subcategories: subcategories.map(({ data, ...subcategory }) => subcategory)
      };
    }));

  return { categories: categories.filter(Boolean) };
}
