import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCatalog } from './catalog.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.join(root, 'dist');

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of ['index.html', 'main.css', 'main.js']) {
  await cp(path.join(root, file), path.join(outputDirectory, file));
}
for (const directory of ['assets', 'data']) {
  await cp(path.join(root, directory), path.join(outputDirectory, directory), { recursive: true });
}
const animationSource = path.join(root, 'node_modules', 'rand-alph-animation', 'src');
const animationOutput = path.join(outputDirectory, 'node_modules', 'rand-alph-animation', 'src');
await mkdir(animationOutput, { recursive: true });
await cp(animationSource, animationOutput, { recursive: true });

const catalog = await createCatalog(path.join(root, 'data'));
if (catalog.categories.length === 0) {
  throw new Error('The exercise catalog is empty.');
}
await writeFile(path.join(outputDirectory, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);

console.log(`Built ${catalog.categories.length} exercise categories in dist/.`);
