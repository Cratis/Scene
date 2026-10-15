#!/usr/bin/env node
/* eslint-disable header/header */

// Holds every blueprint package to the blueprint definition of done (spec Part B 6), and keeps the machine-readable catalog the
// gallery and the CLI documentation read in step with the packages.
//
// The verification itself - `verifyBlueprintPackage` from `@cratis/scene.engine`, the same rules the C# engine reports as
// `BlueprintVerification.Verify` - runs inside each blueprint package as a specification (`for_blueprint/when_verifying_the_blueprint.ts`),
// because only the specification runner resolves a blueprint's dependencies the way a host's bundler does. This script is what makes that
// impossible to skip, and checks what a specification cannot see:
//
//   - every blueprint package (`Source/JavaScript/blueprint.*`, not private) has that specification;
//   - the real packed file list (`npm pack --dry-run`) keeps thumbnails under `thumbnails/` and carries every folder and file the
//     manifest relies on (`sampleData`, `thumbnails`, `blueprintCatalog.json` for a domain blueprint);
//   - `blueprintCatalog.json` at the repository root is the catalog of every domain blueprint, assembled from the catalog each package
//     writes next to itself (`UPDATE_BLUEPRINT_CATALOG=1 yarn test` in the package refreshes that one).
//
// Run it from the repository root, after `yarn build`:
//
//     node ./verify-blueprints.js            verify, and fail when the root blueprintCatalog.json is out of date
//     node ./verify-blueprints.js --write    verify, and rewrite the root blueprintCatalog.json

const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawnSync;
const glob = require('glob').sync;

/** The blueprints that provide foundation layouts and templates and no business domain, so they declare no blueprint metadata and ship no catalog. */
const foundationBlueprints = ['blueprint.default', 'blueprint.components'];
const specification = path.join('for_blueprint', 'when_verifying_the_blueprint.ts');
const rootCatalog = path.join(process.cwd(), 'blueprintCatalog.json');
const write = process.argv.includes('--write');

function packedFiles(packageDirectory) {
    const result = spawn('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: packageDirectory, encoding: 'utf8' });
    if (result.status !== 0) {
        throw new Error(`npm pack failed in '${packageDirectory}':\n${result.stderr}`);
    }

    const start = result.stdout.search(/^[[{]\s*$/m);
    const report = JSON.parse(result.stdout.slice(start));
    const entry = Array.isArray(report) ? report[0] : Object.values(report)[0];
    return entry.files.map(_ => _.path);
}

const packageFiles = glob('Source/JavaScript/blueprint.*/package.json', { cwd: process.cwd(), ignore: ['**/dist/**', '**/node_modules/**'] }).sort();
const problems = [];
const entries = [];
let blueprints = 0;

for (const packageFile of packageFiles) {
    const packageDirectory = path.dirname(packageFile);
    const directory = path.basename(packageDirectory);
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    if (packageJson.private === true) {
        continue;
    }

    blueprints++;
    const domain = !foundationBlueprints.includes(directory);

    if (!fs.existsSync(path.join(packageDirectory, specification))) {
        problems.push(`${packageJson.name}: has no '${specification.replace(/\\/g, '/')}'; every blueprint package verifies itself with verifyBlueprintPackage`);
    }

    const files = packedFiles(packageDirectory);
    if (!files.some(_ => _.startsWith('dist/'))) {
        problems.push(`${packageJson.name}: the archive has no 'dist/' output - run the build before verifying`);
        continue;
    }

    for (const file of files) {
        if (/(^|\/)thumbnails\//.test(file) && !file.startsWith('thumbnails/')) {
            problems.push(`${packageJson.name}: '${file}' is a thumbnail and may only be packed under 'thumbnails/', never in a runtime bundle`);
        }
    }

    if (domain) {
        const catalogPath = path.join(packageDirectory, 'blueprintCatalog.json');
        for (const [folder, expected] of [['thumbnails/', 'thumbnails'], ['sampleData/', 'sampleData'], ['blueprintCatalog.json', 'blueprintCatalog.json']]) {
            if (!files.some(_ => _.startsWith(folder))) {
                problems.push(`${packageJson.name}: the archive carries no '${expected}'; list it in the package's "files"`);
            }
        }

        if (!fs.existsSync(catalogPath)) {
            problems.push(`${packageJson.name}: has no blueprintCatalog.json; run 'UPDATE_BLUEPRINT_CATALOG=1 yarn test' in the package`);
        } else {
            entries.push(...JSON.parse(fs.readFileSync(catalogPath, 'utf8')).blueprints);
        }
    }

    console.log(`Checked blueprint '${packageJson.name}' (${domain ? 'domain' : 'foundation'}): ${files.length} packed files`);
}

const catalog = { schema: 1, blueprints: entries.sort((left, right) => (left.package < right.package ? -1 : left.package > right.package ? 1 : 0)) };
const serialized = `${JSON.stringify(catalog, null, 2)}\n`;

if (write) {
    fs.writeFileSync(rootCatalog, serialized);
    console.log(`Wrote ${path.basename(rootCatalog)}: ${catalog.blueprints.length} domain blueprint(s)`);
} else if (!fs.existsSync(rootCatalog) || fs.readFileSync(rootCatalog, 'utf8') !== serialized) {
    problems.push(`${path.basename(rootCatalog)} is out of date; run 'node ./verify-blueprints.js --write' and commit it`);
}

if (blueprints === 0) {
    console.log('No blueprint packages found under Source/JavaScript');
    process.exit(1);
}

if (problems.length > 0) {
    console.log(`\n${problems.length} blueprint problem(s):`);
    problems.forEach(_ => console.log(`  ${_}`));
    process.exit(1);
}

console.log(`\nAll ${blueprints} blueprint package(s) are in order`);
