// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Regenerates catalog.json: one entry per icon `lucide-react` ships, with the tags `lucide-static` publishes
// and the categories lucide.dev lists. Run it after bumping the lucide dependencies:
//
//     node Source/Editor/IconLibraries/Lucide/generate-catalog.mjs
//
// The categories come from https://lucide.dev/api/categories, which is the only place Lucide publishes them;
// an icon it does not list keeps an empty category list and lands in the picker's "Other" group.

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

const dynamic = readFileSync(join(dirname(require.resolve('lucide-react/package.json')), 'dist', 'esm', 'dynamicIconImports.mjs'), 'utf8');
const staticDirectory = dirname(require.resolve('lucide-static/package.json'));
const tags = JSON.parse(readFileSync(join(staticDirectory, 'tags.json'), 'utf8'));

// lucide-react maps every former or alternative name of an icon to the module of the real one. Those names are
// searchable aliases of the icon, not icons of their own, so the picker never lists the same glyph twice.
const modules = [...dynamic.matchAll(/^\s*"([a-z0-9-]+)":\s*\(\)\s*=>\s*import\('\.\/icons\/([a-z0-9-]+)\.mjs'\)/gm)].map(match => ({ key: match[1], module: match[2] }));
const canonical = modules.filter(({ key }) => key in tags).map(({ key }) => key);
const aliases = new Map();
for (const { key, module } of modules.filter(({ key }) => !(key in tags))) {
    if (module in tags) aliases.set(module, [...(aliases.get(module) ?? []), key]);
}
const categories = await (await fetch('https://lucide.dev/api/categories')).json();

const sentence = text => text.charAt(0).toUpperCase() + text.slice(1);
const catalog = canonical.map(key => ({
    key,
    name: sentence(key.replaceAll('-', ' ')),
    categories: (categories[key] ?? []).map(sentence),
    tags: tags[key] ?? [],
    aliases: aliases.get(key) ?? [],
}));

if (catalog.length === 0) throw new Error('No Lucide icons were found; refusing to write an empty catalog.');

writeFileSync(join(here, 'catalog.json'), `${JSON.stringify(catalog)}\n`);
console.log(`Wrote ${catalog.length} icons, ${catalog.filter(icon => icon.categories.length > 0).length} with categories.`);
