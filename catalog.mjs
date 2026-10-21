import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function createCatalog(dataDirectory) {
  const entries = await readdir(dataDirectory, { withFileTypes: true });
  const categories = await Promise.all(entries
    .filter(entry => entry.isDirectory())
    .map(async entry => {
      const categoryDirectory = path.join(dataDirectory, entry.name);
      const files = (await readdir(categoryDirectory, { withFileTypes: true }))
        .filter(file => file.isFile() && file.name.toLowerCase().endsWith('.json'))
        .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' }));

      if (files.length === 0) return null;

      const exerciseData = await Promise.all(files.map(async file => {
        const exercisePath = path.join(categoryDirectory, file.name);
        try {
          const data = JSON.parse(await readFile(exercisePath, 'utf8'));
          if (typeof data.created_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(data.created_at) || Number.isNaN(Date.parse(data.created_at))) {
            throw new Error('Missing or invalid created_at timestamp.');
          }
          return data;
        } catch (error) {
          throw new Error(`Unable to read exercise data from ${entry.name}/${file.name}.`, { cause: error });
        }
      }));

      const createdAt = exerciseData
        .map(data => data.created_at)
        .sort((left, right) => Date.parse(left) - Date.parse(right))[0];
      const exercises = files.map((file, index) => {
        const stem = path.basename(file.name, path.extname(file.name));
        const sequence = stem.match(/-(\d+)$/);
        return {
          id: file.name,
          title: sequence ? `Exercise ${sequence[1]}` : stem,
          file: file.name,
          difficulty: exerciseData[index].difficulty || 'intermediate'
        };
      });
      const firstExercise = exerciseData[0];
      const title = typeof firstExercise.topic === 'string' && firstExercise.topic.trim()
        ? firstExercise.topic
        : entry.name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

      return {
        id: entry.name,
        title,
        created_at: createdAt,
        exercises
      };
    }));

  return { categories: categories.filter(Boolean) };
}
