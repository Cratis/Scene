// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

function readReport(path) {
    // Python's XML parser is also required by the existing specification runner.
    const parser = `import json, sys, xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
names = ('testsuite', 'Counters', 'UnitTestResult', 'Times')
print(json.dumps({name: [e.attrib for e in root.iter() if e.tag.split('}')[-1] == name] for name in names}))`;
    const result = spawnSync('python3', ['-c', parser, path], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (result.error || result.status !== 0) throw new Error(`Cannot parse ${path}: ${result.error?.message ?? result.stderr.trim()}`);
    return JSON.parse(result.stdout);
}

function seconds(duration = '0') {
    return duration.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

function count(value, attribute, name) {
    const number = Number(value ?? 0);
    if (!Number.isInteger(number) || number < 0) throw new Error(`Invalid ${attribute} "${value}" in ${name}`);
    return number;
}

function validated(report) {
    const durations = [report.duration, ...report.slow.map(item => item.duration)];
    if (durations.some(duration => !Number.isFinite(duration) || duration < 0)) throw new Error(`Invalid duration in ${report.name}`);
    if (report.tests === 0) throw new Error(`No tests recorded in ${report.name}`);
    return report;
}

function cell(value) {
    return String(value).replace(/\|/g, '\\|').replace(/[\r\n]/g, ' ');
}

function junit(document, name) {
    const suites = document.testsuite;
    if (!suites.length) throw new Error(`No test suites found in ${name}`);
    const totals = suites.reduce((sum, suite) => ({
        tests: sum.tests + count(suite.tests, 'tests', name),
        failed: sum.failed + count(suite.failures, 'failures', name) + count(suite.errors, 'errors', name),
        skipped: sum.skipped + count(suite.skipped, 'skipped', name),
        duration: sum.duration + seconds(suite.time)
    }), { tests: 0, failed: 0, skipped: 0, duration: 0 });
    return { name, ...totals, slow: suites.map(suite => ({ name: suite.name ?? name, duration: seconds(suite.time) })) };
}

function trx(document, name) {
    if (document.Counters.length !== 1) throw new Error(`Expected one TRX counter in ${name}`);
    const counters = document.Counters[0];
    const results = document.UnitTestResult;
    const times = document.Times[0] ?? {};
    const slow = results.map(result => ({ name: result.testName ?? name, duration: seconds(result.duration) }));
    return {
        name,
        tests: count(counters.total ?? results.length, 'total', name),
        failed: count(counters.failed, 'failed', name) + count(counters.error, 'error', name) + count(counters.timeout, 'timeout', name) + count(counters.aborted, 'aborted', name),
        skipped: count(counters.notExecuted, 'notExecuted', name),
        duration: times.start && times.finish ? (Date.parse(times.finish) - Date.parse(times.start)) / 1000 : slow.reduce((sum, test) => sum + test.duration, 0),
        slow
    };
}

const directory = process.argv[2];
const files = directory && existsSync(directory)
    ? readdirSync(directory, { recursive: true }).filter(file => /(?:\.junit\.xml|\.trx)$/.test(file)).sort()
    : [];

if (!files.length) {
    console.error(`No specification reports found in ${directory ?? '<missing directory>'}`);
    process.exitCode = 2;
} else try {
    const reports = files.map(file => {
        const path = join(directory, file);
        const document = readReport(path);
        return validated(file.endsWith('.trx') ? trx(document, relative(directory, path)) : junit(document, basename(file, '.junit.xml')));
    });
    console.log('## Specification results\n\n| Workspace / project | Tests | Failed | Skipped | Seconds |\n| --- | ---: | ---: | ---: | ---: |');
    for (const report of reports) {
        console.log(`| ${cell(report.name)} | ${report.tests} | ${report.failed} | ${report.skipped} | ${report.duration.toFixed(3)} |`);
    }
    console.log('\n### Slowest 10 files / tests\n\n| Report | File / test | Seconds |\n| --- | --- | ---: |');
    const slowest = reports.flatMap(report => report.slow.map(item => ({ ...item, report: report.name })))
        .sort((left, right) => right.duration - left.duration).slice(0, 10);
    for (const item of slowest) console.log(`| ${cell(item.report)} | ${cell(item.name)} | ${item.duration.toFixed(3)} |`);
} catch (error) {
    console.error(error.message);
    process.exitCode = 2;
}
