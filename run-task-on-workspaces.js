#!/usr/bin/env node
/* eslint-disable header/header */

if (process.argv.length < 3) {
    console.log('You have to specify what workspace task to run on all')
    console.log('\nUsage: run-task-on-workspaces [task] [arguments]');
    console.log('\nExamples of tasks: build|test|ci');
    process.exit(1);
    return;
}

const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawnSync;
const editJsonFile = require('edit-json-file');
const rootPackageJson = require('./package.json')
const glob = require('glob').sync;

const workspaces = {};

const workspaceIgnorePatterns = rootPackageJson.workspaces
    .filter(_ => _.startsWith('!'))
    .map(_ => _.substring(1));

const distFolder = `dist${path.sep}`
for (const workspaceDef of rootPackageJson.workspaces) {
    if (workspaceDef.startsWith('!')) {
        console.log(`Skipping negated workspace definition '${workspaceDef}' \n`);
        continue;
    }

    console.log(`Getting packages for workspace definition '${workspaceDef}' \n`);

    const pattern = path.join(workspaceDef, '**','package.json');

    const packages = glob(pattern, { 
        cwd: `${process.cwd()}`,
        ignore: [
            ...workspaceIgnorePatterns,
            `**${path.sep}${distFolder}**`,
            '**/node_modules/**'
        ]
    });

    if (packages.length === 0) {
        console.log(`  No packages found for workspace definition '${workspaceDef}' \n`);
        continue;
    }

    packages.forEach(_ => {
        const package = JSON.parse(fs.readFileSync(_).toString());
        workspaces[package.name] = path.dirname(_);

        console.log(`Including workspace '${package.name}' at '${workspaces[package.name]}'`);
    });
}

console.log('');

const task = process.argv[2];
args = process.argv.slice(3, process.argv.length);

console.log(`Performing '${task}' on workspaces`);

if (args.length > 0) {
    console.log(`  Using args : ${args}`);
}

console.log('');

const workspaceNames = Object.keys(workspaces);

function updateDependencyVersionsFromLocalWorkspaces(file, packageJson, version) {
    const dependencyFields = Object.keys(packageJson).filter(_ => _.endsWith('dependencies') || _.endsWith('Dependencies'));
    for (let field of dependencyFields) {
        const dependencies = packageJson[field] ?? {};
        const fileDependencies = file.get(field);

        for (let dependencyName of Object.keys(dependencies)) {
            if (workspaceNames.includes(dependencyName)) {
                console.log(`Updating workspace ${field} '${dependencyName}' to version ${version}`);
                fileDependencies[dependencyName] = version;
            }
        }

        file.set(field, fileDependencies);
    }
}

const publishFailures = [];
const publishBlocked = [];

// The workspaces a package needs at install time: a consumer installs dependencies, peer and optional dependencies, never devDependencies.
function localInstallDependenciesOf(workspaceName) {
    const packageJson = JSON.parse(fs.readFileSync(path.join(workspaces[workspaceName], 'package.json')).toString());
    return ['dependencies', 'peerDependencies', 'optionalDependencies']
        .flatMap(field => Object.keys(packageJson[field] ?? {}))
        .filter(dependencyName => dependencyName !== workspaceName && workspaceNames.includes(dependencyName));
}

// Publishing goes in dependency order, so a package is only published after every workspace it installs with.
// The order is otherwise the discovery order; a dependency cycle keeps the discovery order for the packages on it.
function inDependencyOrder(names) {
    const ordered = [];
    const state = {};
    const visit = name => {
        if (state[name] === 'done') return;
        if (state[name] === 'visiting') {
            console.log(`Workspace '${name}' is part of a dependency cycle - keeping the discovery order for it`);
            return;
        }
        state[name] = 'visiting';
        localInstallDependenciesOf(name).forEach(visit);
        state[name] = 'done';
        ordered.push(name);
    };
    names.forEach(visit);
    return ordered;
}

const workspaceOrder = task === 'publish-version' ? inDependencyOrder(workspaceNames) : workspaceNames;
const localInstallDependencies = Object.fromEntries(
    task === 'publish-version' ? workspaceNames.map(name => [name, localInstallDependenciesOf(name)]) : []);

// npm lists every file of the package it packs. Printing a few hundred lines of that in one write to the runner's pipe ended the release
// part way (the process exits with nothing printed after the biggest package), so only the end of the output - where the outcome is - is shown.
function tailOf(output, lines = 40) {
    const all = (output?.toString() ?? '').split('\n');
    return all.length <= lines ? all.join('\n') : `... ${all.length - lines} earlier line(s) of npm output not shown\n${all.slice(-lines).join('\n')}`;
}

for (const workspaceName of workspaceOrder) {
    const workspaceRelativeLocation = workspaces[workspaceName];
    const workspaceAbsoluteLocation = path.join(process.cwd(), workspaceRelativeLocation);
    const packageJsonFile = path.join(workspaceAbsoluteLocation, 'package.json');

    if (fs.existsSync(packageJsonFile)) {
        const file = editJsonFile(packageJsonFile, { stringify_width: 4 });
        const packageJson = file.toObject();
        // A private workspace is a fixture that is never published, but it is still built, linted and tested.
        if (packageJson.private === true && task === 'publish-version') {
            console.log(`Workspace private '${workspaceName}' at '${workspaceRelativeLocation}'`);
            continue;
        }

        if (task === 'publish-version') {
            // A package whose dependency did not reach the registry is not published: consumers could not install it.
            const unpublished = localInstallDependencies[workspaceName].filter(_ => publishFailures.includes(_) || publishBlocked.includes(_));
            if (unpublished.length > 0) {
                console.log(`Not publishing workspace '${workspaceName}' - it depends on unpublished ${unpublished.map(_ => `'${_}'`).join(', ')}`);
                publishBlocked.push(workspaceName);
                continue;
            }

            if (args.length === 1) {
                const version = args[0];
                file.set('version', version);
                updateDependencyVersionsFromLocalWorkspaces(file, packageJson, version);
                file.save();

                const targetReadMe = path.join(workspaceAbsoluteLocation, 'README.md');

                if (!fs.existsSync(targetReadMe)) {
                    fs.copyFileSync(path.join(process.cwd(), "README.md"), targetReadMe);
                }

                console.log(`Publishing workspace '${workspaceName}' at '${workspaceRelativeLocation}'`);
                const result = spawn('npm', ['publish', '--provenance'], { cwd: workspaceAbsoluteLocation });
                console.log(tailOf(result.stdout));
                console.log(tailOf(result.stderr));
                if (result.error) console.log(`Error running npm publish for workspace '${workspaceName}': ${result.error.message}`);
                if (result.status !== 0 && /cannot publish over the previously published versions/i.test(result.stderr?.toString() ?? '')) {
                    // A re-run of a release that stopped part way: what already reached the registry is not a failure.
                    console.log(`Workspace '${workspaceName}' is already published at ${version} - continuing with remaining workspaces`);
                } else if (result.status !== 0) {
                    // Don't abort the release: a single workspace failing (e.g. a brand-new
                    // package whose npm trusted publisher isn't configured yet) must not
                    // strand the packages that do not depend on it. The ones that do are
                    // skipped above. Collect and fail at the end instead.
                    console.log(`Error publishing workspace '${workspaceName}' - continuing with remaining workspaces`);
                    publishFailures.push(workspaceName);
                }
            }
        } else {

            if (!packageJson.scripts || !packageJson.scripts.hasOwnProperty(task)) {
                console.log(`Skipping workspace '${workspaceName}' - no script with name '${task}'`);
                continue;
            }

            console.log(`Workspace '${workspaceName}' at '${workspaceRelativeLocation}'`);

            const result = spawn('yarn', [task], { cwd: workspaceAbsoluteLocation });
            console.log(result.stdout.toString());
            if (result.status !== 0) {
                console.log(`Error running task '${task}' on workspace '${workspaceName}'`);
                console.log(result.stderr.toString());
                process.exit(1);
                return;
            }
        }
    }
}

if (publishFailures.length > 0) {
    console.log(`\n${publishFailures.length} workspace(s) failed to publish: ${publishFailures.join(', ')}`);
    if (publishBlocked.length > 0) {
        console.log(`${publishBlocked.length} workspace(s) not published because a dependency failed: ${publishBlocked.join(', ')}`);
    }
    process.exit(1);
}
