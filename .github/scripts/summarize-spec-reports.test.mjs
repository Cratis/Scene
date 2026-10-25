// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const scripts = dirname(fileURLToPath(import.meta.url));
const root = resolve(scripts, '../..');

function fixture(t) {
    mkdirSync(join(root, '.ai-work/262'), { recursive: true });
    const directory = mkdtempSync(join(root, '.ai-work/262/summary-'));
    t.after(() => rmSync(directory, { recursive: true }));
    return directory;
}

function summarize(directory) {
    const result = spawnSync(process.execPath, [join(scripts, 'summarize-spec-reports.mjs'), directory], { encoding: 'utf8' });
    assert.ifError(result.error);
    return result;
}

test('summarizes nested JUnit reports without counting the root twice, even on test failure', t => {
    const directory = fixture(t);
    mkdirSync(join(directory, 'nested'));
    writeFileSync(join(directory, 'nested/model.junit.xml'), '<testsuites tests="3"><testsuite name="slow&amp;file|name" tests="2" failures="1" errors="0" skipped="1" time="2.5"></testsuite><testsuite name="fast" tests="1" time="0.5"></testsuite></testsuites>');
    const result = summarize(directory);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /\| model \| 3 \| 1 \| 1 \| 3\.000 \|/);
    assert.match(result.stdout, /slow&file\\\|name \| 2\.500/);
    assert.ok(result.stdout.indexOf('slow&file') < result.stdout.indexOf('| fast |'));
});

test('summarizes TRX counters, elapsed time and per-test duration', t => {
    const directory = fixture(t);
    writeFileSync(join(directory, 'Engine.Specs.trx'), '<TestRun><Times start="2026-10-24T12:00:00Z" finish="2026-10-24T12:01:03Z"/><Results><UnitTestResult testName="slow" duration="00:01:02.500" outcome="Failed"/><UnitTestResult testName="fast" duration="00:00:00.500" outcome="Passed"/></Results><ResultSummary><Counters total="3" failed="1" notExecuted="1"/></ResultSummary></TestRun>');
    const result = summarize(directory);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Engine.Specs.trx \| 3 \| 1 \| 1 \| 63\.000/);
    assert.match(result.stdout, /slow \| 62\.500/);
});

test('keeps the slowest ten entries across reports', t => {
    const directory = fixture(t);
    const suites = Array.from({ length: 12 }, (_, index) => `<testsuite name="file-${index}" tests="1" time="${index}"/>`).join('');
    writeFileSync(join(directory, 'many.junit.xml'), `<testsuites>${suites}</testsuites>`);
    const result = summarize(directory);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /file-11 \| 11\.000/);
    assert.doesNotMatch(result.stdout, /\| file-[01] \|/);
});

test('parses XML quoting and namespace prefixes rather than extracting attributes by regex', t => {
    const directory = fixture(t);
    writeFileSync(join(directory, 'quoted.junit.xml'), "<j:testsuites xmlns:j='urn:junit'><j:testsuite name='one &gt; zero' tests='1' time='0.5'/></j:testsuites>");
    const result = summarize(directory);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /quoted \| 1 \| 0 \| 0 \| 0\.500/);
    assert.match(result.stdout, /one > zero/);
});

test('refuses incomplete or malformed XML instead of reporting partial results', t => {
    const directory = fixture(t);
    for (const xml of ['<testsuites><testsuite tests="1" time="1"/>', '<testsuites><testsuite></testsuites>', '<testsuites name="&invalid;"><testsuite/></testsuites>']) {
        writeFileSync(join(directory, 'broken.junit.xml'), xml);
        const result = summarize(directory);
        assert.equal(result.status, 2);
        assert.match(result.stderr, /Cannot parse/);
        assert.equal(result.stdout, '');
    }
});

test('refuses XML without the expected report structure', t => {
    const directory = fixture(t);
    for (const file of ['empty.junit.xml', 'empty.trx']) {
        const report = join(directory, file);
        writeFileSync(report, '<empty/>');
        assert.equal(summarize(directory).status, 2);
        rmSync(report);
    }
});

test('refuses an empty report directory', t => {
    const result = summarize(fixture(t));
    assert.equal(result.status, 2);
    assert.match(result.stderr, /No specification reports found/);
});
