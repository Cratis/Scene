// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Generates screenplay-scene-document-fixtures.json, the corpus that holds Cratis.Scene.Screenplay and its
// TypeScript mirror (@cratis/scene.screenplay) together.
//
// The C# bridge is the reference. It compiles each case's .play source, imports every slice's screens, and records
// both the syntax a host hands the mirror and the documents the bridge produced. The TypeScript specification
// reads the same file and asserts its mirror draws the same screens, and the C# specification asserts the file
// still matches what the bridge produces - so neither side can change without the other's specification saying so.
//
// The cases themselves live in C#, beside the generator:
//   Source/DotNET/Screenplay.Specs/Reverse/for_ScreenDocumentCorpus/ScreenDocumentCorpusCases.cs
//
// Run it from the repository root. Never edit the corpus by hand.
//
//     node generate-screenplay-scene-document-fixtures.mjs

import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const output = join(import.meta.dirname, 'screenplay-scene-document-fixtures.json');
const result = spawnSync(
    'dotnet',
    ['test', 'Source/DotNET/Screenplay.Specs/Screenplay.Specs.csproj', '--filter', 'FullyQualifiedName~for_ScreenDocumentCorpus'],
    { cwd: import.meta.dirname, stdio: 'inherit', env: { ...process.env, SCENE_SCREENPLAY_CORPUS_OUTPUT: output } });

if (result.status !== 0) {
    console.error('\nThe corpus was not written: the generator did not run cleanly.');
    process.exit(result.status ?? 1);
}

console.log(`\nWrote ${output}`);
