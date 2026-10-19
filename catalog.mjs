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

      let title = entry.name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
      try {
        const firstExercise = JSON.parse(await readFile(path.join(categoryDirectory, files[0].name), 'utf8'));
        if (typeof firstExercise.topic === 'string' && firstExercise.topic.trim()) title = firstExercise.topic;
      } catch (error) {
        console.error(`Unable to read category title from ${entry.name}/${files[0].name}:`, error);
      }

      return {
        id: entry.name,
        title,
        exercises: files.map(file => {
          const stem = path.basename(file.name, path.extname(file.name));
          const sequence = stem.match(/-(\d+)$/);
          return {
            id: file.name,
            title: sequence ? `Exercise ${sequence[1]}` : stem,
            file: file.name
          };
        })
      };
    }));

  return { categories: categories.filter(Boolean) };
}
