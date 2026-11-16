import { access, cp, rm } from 'node:fs/promises';

const source = new URL('../public/', import.meta.url);
const output = new URL('../dist/', import.meta.url);

await Promise.all(['index.html', 'admin/index.html'].map(
  (page) => access(new URL(page, source)),
));
await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true });
console.log('Interface pronta em dist/');
