// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApplicationStructure, Toolbar, ToolbarButton } from '@cratis/scene.model';
import { ApplicationStructureIndex, ResolvedToolbarButton, ToolbarDiagnostic, ToolbarDiagnosticCode, resolveToolbarButton, toolbarButtonFromItem, validateToolbarButtons } from '../index';

interface FixtureCase {
    name: string;
    toolbar: Toolbar;
    defaultDialogTemplate?: string;
    resolved: string[];
    expectedDiagnostics: ToolbarDiagnostic[];
}

interface ItemCase {
    name: string;
    id: string;
    properties: Record<string, unknown>;
    expected: ToolbarButton | null;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../toolbar-slice-fixtures.json'), 'utf-8')) as { structure: ApplicationStructure; cases: FixtureCase[]; itemCases: ItemCase[] };
const index = new ApplicationStructureIndex(corpus.structure);

function describe_(button: ResolvedToolbarButton): string {
    return `${button.id}|${button.slice ?? '-'}|${button.command ?? '-'}|${button.dialog?.template ?? '-'}:${button.dialog?.source ?? '-'}|${button.emphasis}|${button.converted ? 'converted' : 'direct'}`;
}

describe('when validating the shared toolbar slice corpus', () => {
    it('should carry a vector for every diagnostic code', () => {
        const codes = new Set(corpus.cases.flatMap(fixture => fixture.expectedDiagnostics.map(diagnostic => diagnostic.code)));
        [...codes].should.have.members(Object.values(ToolbarDiagnosticCode));
    });
});

for (const fixture of corpus.cases) {
    describe(`when validating the toolbar for ${fixture.name}`, () => {
        let original: string;
        beforeEach(() => { original = JSON.stringify(fixture.toolbar); });

        it('should report the same diagnostics as the C# engine', () => validateToolbarButtons(index, fixture.toolbar).should.deep.equal(fixture.expectedDiagnostics));
        it('should resolve the same buttons as the C# engine', () =>
            fixture.toolbar.buttons.map(button => describe_(resolveToolbarButton(index, button, fixture.defaultDialogTemplate))).should.deep.equal(fixture.resolved));
        it('should not rewrite the authored toolbar', () => {
            validateToolbarButtons(index, fixture.toolbar);
            fixture.toolbar.buttons.forEach(button => resolveToolbarButton(index, button));
            JSON.stringify(fixture.toolbar).should.equal(original);
        });
    });
}

for (const fixture of corpus.itemCases) {
    describe(`when reading a toolbar button from an item: ${fixture.name}`, () => {
        it('should read the same button as the C# engine', () => {
            const button = toolbarButtonFromItem(fixture.id, fixture.properties);
            if (fixture.expected === null) {
                (button === undefined).should.be.true;
            } else {
                button!.should.deep.equal(fixture.expected);
            }
        });
    });
}
