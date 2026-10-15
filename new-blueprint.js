#!/usr/bin/env node
/* eslint-disable header/header */

// Scaffolds a domain blueprint package: `Source/JavaScript/blueprint.<domain>` with the layout every domain blueprint shares
// (templates, screens, sampleData, thumbnails), a manifest that already satisfies the blueprint definition of done, one template, one
// screen, one sample-data pack and one thumbnail to replace, and the specification that verifies the package.
//
//     node ./new-blueprint.js <domain> ["Display name"] ["One sentence description"]
//     yarn new-blueprint crm "CRM" "Leads, accounts and deals for a sales team."
//
// The domain is a lower-case slug (`crm`, `project-tracker`). The generated package is a workspace like any other: run `yarn` to link it,
// `yarn build` and `yarn test` in it, then `node ./verify-blueprints.js --write` to add it to the root catalog. See
// Documentation/blueprints/ship-your-own-blueprint.md for what to replace and the definition of done.

const fs = require('fs');
const path = require('path');

const [domain, displayNameArgument, descriptionArgument] = process.argv.slice(2);

if (!domain || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(domain)) {
    console.error('Usage: node ./new-blueprint.js <domain> ["Display name"] ["One sentence description"]\n  <domain> is a lower-case slug such as crm or project-tracker');
    process.exit(1);
}

const pascal = domain.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join('');
const camel = pascal[0].toLowerCase() + pascal.slice(1);
const displayName = displayNameArgument ?? pascal.replace(/([a-z])([A-Z])/g, '$1 $2');
const description = descriptionArgument ?? `Ready-to-use ${displayName} screens, templates and sample data.`;
const packageName = `@cratis/scene.blueprint.${domain}`;
const blueprintName = `Cratis.Blueprint.${pascal}`;
const root = path.join('Source', 'JavaScript', `blueprint.${domain}`);
const header = '// Copyright (c) Cratis. All rights reserved.\n// Licensed under the MIT license. See LICENSE file in the project root for full license information.\n';

if (fs.existsSync(root)) {
    console.error(`'${root}' already exists`);
    process.exit(1);
}

const files = {};
const defaultPackage = JSON.parse(fs.readFileSync(path.join('Source', 'JavaScript', 'blueprint.components', 'package.json'), 'utf8'));
const dependencies = { '@cratis/scene.blueprint.default': '1.0.0', '@cratis/scene.engine': '1.0.0', '@cratis/scene.model': '1.0.0', '@cratis/scene.react': '1.0.0' };

files['package.json'] = `${JSON.stringify({
    name: packageName,
    version: '1.0.0',
    description,
    keywords: ['cratis', 'scene', 'react', 'ui', 'blueprint', domain],
    author: 'Cratis',
    license: 'MIT',
    repository: defaultPackage.repository,
    publishConfig: defaultPackage.publishConfig,
    files: ['dist', 'sampleData', 'thumbnails', 'blueprintCatalog.json', '**/*.ts', '**/*.tsx', '!**/for_*/**'],
    main: 'dist/cjs/index.js',
    module: 'dist/esm/index.js',
    types: 'dist/esm/index.d.ts',
    exports: defaultPackage.exports,
    scripts: {
        prepare: 'yarn g:build', clean: 'yarn g:clean', build: 'yarn g:build', lint: 'yarn g:lint', 'lint:ci': 'yarn g:lint:ci', test: 'yarn g:test', ci: 'yarn g:ci', up: 'yarn g:up',
    },
    dependencies,
    devDependencies: { ...dependencies, '@primereact/core': '11.2.0', '@primereact/headless': '11.2.0', primeicons: '8.0.2', primereact: '11.2.0', react: '^19.3.0', 'react-dom': '^19.3.0' },
    peerDependencies: defaultPackage.peerDependencies,
}, null, 4)}\n`;

for (const name of ['rollup.config.mjs', 'vite.config.mts']) {
    files[name] = fs.readFileSync(path.join('Source', 'JavaScript', 'blueprint.components', name), 'utf8');
}

const tsconfig = JSON.parse(fs.readFileSync(path.join('Source', 'JavaScript', 'blueprint.components', 'tsconfig.json'), 'utf8'));
delete tsconfig.compilerOptions.paths['@cratis/scene.components/*'];
tsconfig.references = tsconfig.references.filter(reference => reference.path !== '../components');
files['tsconfig.json'] = `${JSON.stringify(tsconfig, null, 4)}\n`;

files['packageName.ts'] = `${header}
/** The name this blueprint is known by inside a \`ui profile\`; every component registry key is built from it. */
export const ${camel}BlueprintName = '${blueprintName}';
`;

files['templateProvenance.ts'] = `${header}
import { TemplateMetadata } from '@cratis/scene.model';

/** The compatibility, attribution and license metadata every template this blueprint ships carries. */
export const ${camel}TemplateProvenance: Pick<TemplateMetadata, 'compatibility' | 'attribution' | 'license' | 'licenseUrl'> = {
    compatibility: {
        scene: '^4.13.0',
        packages: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    },
    attribution: { author: 'Cratis', url: 'https://github.com/Cratis/Scene/tree/main/Source/JavaScript/blueprint.${domain}' },
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
};
`;

files[path.join('templates', `${camel}ListTemplate.ts`)] = `${header}
import { ScreenTemplate } from '@cratis/scene.model';
import { ${camel}TemplateProvenance } from '../templateProvenance';

/**
 * The list screen of the ${displayName} blueprint. Replace its content with the real composition: every template declares the shape of
 * the data it shows (bound to a query), never values - the values live in the sample-data pack.
 *
 * It fits the foundation shell's \`content\` slot. Name the slots other templates can fit into, and fill them from the foundation's
 * components (\`@cratis/scene.blueprint.default\`: stat card, chart, filter builder, empty state...) rather than writing new ones.
 */
export const ${camel}ListTemplate: ScreenTemplate = {
    name: '${pascal}List',
    fitsSlot: 'content',
    slots: [{ name: 'body' }],
    content: {},
    displayName: '${displayName} list',
    description: 'The main list of the ${displayName} blueprint.',
    metadata: { ...${camel}TemplateProvenance, type: 'List', category: 'Business / ${domain}', thumbnail: 'thumbnails/${domain}-list.svg' },
};
`;
files[path.join('templates', 'index.ts')] = `${header}
import { ${camel}ListTemplate } from './${camel}ListTemplate';

export * from './${camel}ListTemplate';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const ${camel}ScreenTemplates = [${camel}ListTemplate];
`;

files[path.join('screens', 'index.ts')] = `${header}
import { Screen } from '@cratis/scene.model';

/**
 * The ready-to-use screens: real \`Screen\` instances, one for each entry of the manifest's \`blueprint.screenSet\`. A new application
 * that adopts the blueprint gets these, wired into its navigation.
 */
export const ${camel}Screens: Screen[] = [
    {
        name: '${pascal}List',
        displayName: '${displayName}',
        layout: 'AppShell',
        slotContent: {},
        forms: [],
        contributions: [],
    } as unknown as Screen,
];
`;

files['manifest.ts'] = `${header}
import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ${camel}BlueprintName } from './packageName';
import { ${camel}ScreenTemplates } from './templates';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (\`Cratis.Blueprint.Default\`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package \`version\` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const ${camel}BlueprintManifest: ScenePackage = {
    name: ${camel}BlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: ${camel}ScreenTemplates.map(template => template.name),
    dialogTemplates: [],
    themes: [],
    displayName: '${displayName}',
    description: '${description.replace(/'/g, "\\'")}',
    module: '${packageName}',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: '${domain}-en', title: '${displayName} · English', locale: 'en-GB', path: 'sampleData/${domain}-en.json' }],
    blueprint: {
        domain: '${domain}',
        description: '${description.replace(/'/g, "\\'")}',
        thumbnail: 'thumbnails/${domain}.svg',
        screenSet: [{ name: '${pascal}List', title: '${displayName}', template: '${pascal}List', order: 0 }],
        defaultSampleData: '${domain}-en',
    },
};
`;

files['blueprint.ts'] = `${header}
import { ScenePackageBundle } from '@cratis/scene.react';
import { ${camel}BlueprintManifest } from './manifest';
import { ${camel}Screens } from './screens';
import { ${camel}ScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. */
export const ${camel}Blueprint: ScenePackageBundle = {
    manifest: ${camel}BlueprintManifest,
    components: {},
    screenTemplates: ${camel}ScreenTemplates,
    screens: ${camel}Screens,
};
`;

files['index.ts'] = `${header}
export * from './packageName';
export * from './templateProvenance';
export * from './templates';
export * from './screens';
export * from './manifest';
export * from './blueprint';
`;

files[path.join('sampleData', `${domain}-en.json`)] = `${JSON.stringify({
    id: `${domain}-en`,
    title: `${displayName} · English`,
    locale: 'en-GB',
    owner: `blueprint:${domain}`,
    sets: [{ shape: pascal, rows: [{ id: '1', name: 'Northgate Ltd' }, { id: '2', name: 'Harbour & Sons' }] }],
}, null, 4)}\n`;

const thumbnail = label => `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200" role="img" aria-label="${label}">\n    <rect width="320" height="200" rx="8" fill="#f4f5f7"/>\n    <rect x="16" y="16" width="288" height="24" rx="4" fill="#4f46e5"/>\n    <rect x="16" y="56" width="90" height="128" rx="4" fill="#d5d9df"/>\n    <rect x="118" y="56" width="186" height="56" rx="4" fill="#ffffff" stroke="#d5d9df"/>\n    <rect x="118" y="128" width="186" height="56" rx="4" fill="#ffffff" stroke="#d5d9df"/>\n</svg>\n`;
files[path.join('thumbnails', `${domain}.svg`)] = thumbnail(`${displayName} blueprint`);
files[path.join('thumbnails', `${domain}-list.svg`)] = thumbnail(`${displayName} list screen`);

files[path.join('for_blueprint', 'when_verifying_the_blueprint.ts')] = `${header}
import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { BlueprintCatalogFile, BlueprintSource, TemplateSource, describeBlueprintCatalog, toBlueprintCatalogFile, verifyBlueprintPackage } from '@cratis/scene.engine';
import { PackageKind, SampleDataPack } from '@cratis/scene.model';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ${camel}Blueprint } from '../blueprint';

const root = join(import.meta.dirname, '..');
const filesUnder = (folder: string): string[] => {
    const absolute = join(root, folder);
    return !existsSync(absolute) ? [] : readdirSync(absolute).flatMap(entry => {
        const path = join(absolute, entry);
        return statSync(path).isDirectory() ? filesUnder(relative(root, path)) : [relative(root, path).split('\\\\').join('/')];
    });
};
const requiredPackage = (name: string, version: string): TemplateSource => ({
    manifest: { name, version, kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] },
});

// The definition of done for a domain blueprint (spec Part B 6): valid manifest and screen set, every template with complete metadata, a
// type, a Business / <domain> category and a thumbnail, every template placed by the slot resolver, sample data present and locale-tagged,
// and a dependency on the foundation set. The C# engine reports the same problems (BlueprintVerification.Verify).
describe('when verifying the ${displayName} blueprint', () => {
    const files = [...filesUnder('thumbnails'), ...filesUnder('sampleData')];
    const packs = (${camel}Blueprint.manifest.sampleData ?? []).map(reference => JSON.parse(readFileSync(join(root, reference.path), 'utf-8')) as SampleDataPack);
    const source = { ...${camel}Blueprint, packs, files } as BlueprintSource;
    const library = [requiredPackage('PrimeReact', '11.1.0'), requiredPackage('Cratis.Components', '3.0.0'), defaultBlueprint as TemplateSource];

    it('should be done', () => verifyBlueprintPackage(source, library, { requireBlueprintMetadata: true }).should.deep.equal([]));

    it('should keep its catalog current', () => {
        const described: BlueprintCatalogFile = toBlueprintCatalogFile(describeBlueprintCatalog([source]));
        const path = join(root, 'blueprintCatalog.json');
        if (process.env.UPDATE_BLUEPRINT_CATALOG === '1') writeFileSync(path, \`\${JSON.stringify(described, null, 2)}\\n\`);
        (existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : undefined).should.deep.equal(described);
    });
});
`;

for (const [name, content] of Object.entries(files)) {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
}

console.log(`Created ${root} with ${Object.keys(files).length} files.\n\nNext:\n  yarn\n  (cd ${root} && yarn build && UPDATE_BLUEPRINT_CATALOG=1 yarn test)\n  node ./verify-blueprints.js --write\n\nThen replace the template, the screen, the sample data and the thumbnails (Documentation/blueprints/ship-your-own-blueprint.md).`);
