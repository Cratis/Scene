// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Screen, Theme, UiProfile } from '@cratis/scene.model';
import { EffectiveShell, TemplateLibrary, resolveEffectiveShell } from '../index';

interface ExpectedShell {
    origin: string;
    kind: string;
    source: string;
    name: string;
    reference?: unknown;
    package?: string;
    packageVersion?: string;
    pinStatus?: string;
    pin?: string;
    outlets: string[];
    primaryOutlet: string;
    options: Record<string, unknown>;
    diagnostics: { code: string; subject: string | null; message: string }[];
}

interface ShellCase {
    name: string;
    library: string;
    profile: UiProfile;
    screens?: Screen[];
    themes?: Theme[];
    availablePackages?: string[];
    expected: ExpectedShell;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../effective-shell-fixtures.json'), 'utf-8')) as {
    libraries: Record<string, TemplateLibrary>;
    cases: ShellCase[];
};

function describeShell(shell: EffectiveShell): ExpectedShell {
    const described: ExpectedShell = { origin: shell.origin, kind: shell.kind, source: shell.source, name: shell.name } as ExpectedShell;
    if (shell.reference) described.reference = shell.reference;
    if (shell.package) {
        described.package = shell.package;
        described.packageVersion = shell.packageVersion;
    }
    if (shell.pin) {
        described.pinStatus = shell.pin.status;
        described.pin = shell.pin.pin;
    }
    described.outlets = shell.outlets;
    described.primaryOutlet = shell.primaryOutlet;
    described.options = shell.options;
    described.diagnostics = shell.diagnostics.map(diagnostic => ({ code: diagnostic.code, subject: diagnostic.subject ?? null, message: diagnostic.message }));
    return described;
}

describe('when checking against the shared fixture corpus', () => {
    it('should have cases covering every origin and every diagnostic code', () => {
        const origins = new Set(corpus.cases.map(fixture => fixture.expected.origin));
        const codes = new Set(corpus.cases.flatMap(fixture => fixture.expected.diagnostics.map(diagnostic => diagnostic.code)));
        [...origins].sort().should.deep.equal(['blueprintDefault', 'bare', 'legacyLayout', 'root'].sort());
        [...codes].sort().should.deep.equal([
            'profilePackageMissing', 'profileSlotUnplaced', 'profileThemeIncompatible', 'rootTemplateBlueprintNotInstalled', 'rootTemplateCycle',
            'rootTemplateMissingContentSlot', 'rootTemplateNotApplicable', 'rootTemplateUnknown', 'rootTemplateVersionNotSatisfied',
        ].sort());
    });

    for (const fixture of corpus.cases) {
        it(`should resolve "${fixture.name}" like the C# engine`, () => {
            const shell = resolveEffectiveShell(fixture.profile, {
                library: corpus.libraries[fixture.library],
                screens: fixture.screens,
                themes: fixture.themes,
                availablePackages: fixture.availablePackages,
            });
            describeShell(shell).should.deep.equal(fixture.expected);
        });
    }
});
