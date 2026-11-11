// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Slot } from '@cratis/scene.model';
import { SlotShapeDiagnosticCode, primarySlotOf, resolveSlotRole, slotShapeMigrationHint, upgradeSlotShape, validateSlotShape } from '../index';

interface Diagnostic { code: string; path: string; message: string }

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../slot-shape-fixtures.json'), 'utf-8')) as {
    hint: string;
    roles: { name: string; slot: Slot; expected: string }[];
    primary: { name: string; slots: Slot[]; expected: string | null }[];
    upgrades: { name: string; input: unknown; expected: { document: unknown; changed: boolean; diagnostics: Diagnostic[] } }[];
    upgradeRaw: { name: string; input: unknown; expected: string }[];
    validations: { name: string; document: unknown; expected: Diagnostic[] }[];
    characterization: { name: string; document: unknown; expected: string }[];
};

const describeDiagnostics = (diagnostics: Diagnostic[]) => diagnostics.map(diagnostic => `${diagnostic.code}|${diagnostic.path}|${diagnostic.message}`);

describe('when checking the slot shape against the shared fixture corpus', () => {
    it('should state the same migration hint', () => slotShapeMigrationHint.should.equal(corpus.hint));

    it('should cover every diagnostic code', () => {
        const covered = new Set([...corpus.upgrades.flatMap(fixture => fixture.expected.diagnostics), ...corpus.validations.flatMap(fixture => fixture.expected)].map(diagnostic => diagnostic.code));
        [...covered].sort().should.deep.equal(Object.values(SlotShapeDiagnosticCode).sort());
    });

    for (const fixture of corpus.roles) {
        it(`should resolve the role when ${fixture.name}`, () => resolveSlotRole(fixture.slot).should.equal(fixture.expected));
    }

    for (const fixture of corpus.primary) {
        it(`should find the primary slot when ${fixture.name}`, () => [primarySlotOf(fixture.slots) ?? null].should.deep.equal([fixture.expected]));
    }

    for (const fixture of corpus.upgradeRaw) {
        it(`should write the upgraded document in the order the upgrade builds it when ${fixture.name}`, () => {
            JSON.stringify(upgradeSlotShape(structuredClone(fixture.input)).document).should.equal(fixture.expected);
        });
    }

    for (const fixture of corpus.upgrades) {
        describe(`and upgrading ${fixture.name}`, () => {
            const input = structuredClone(fixture.input);
            const result = upgradeSlotShape(input);

            it('should produce the expected document', () => result.document!.should.deep.equal(fixture.expected.document));
            it('should report whether it changed', () => result.changed.should.equal(fixture.expected.changed));
            it('should report what it could not map', () => describeDiagnostics(result.diagnostics).should.deep.equal(describeDiagnostics(fixture.expected.diagnostics)));
            it('should leave the input as it was', () => input!.should.deep.equal(fixture.input));
            it('should be idempotent', () => {
                const again = upgradeSlotShape(result.document);
                [again.changed, again.document].should.deep.equal([false, result.document]);
            });
        });
    }

    for (const fixture of corpus.validations) {
        it(`should validate ${fixture.name}`, () => describeDiagnostics(validateSlotShape(fixture.document)).should.deep.equal(describeDiagnostics(fixture.expected)));
    }

    for (const fixture of corpus.characterization) {
        describe(`and validating ${fixture.name}`, () => {
            const written = JSON.stringify(fixture.document);
            const diagnostics = validateSlotShape(fixture.document);

            it('should report the diagnostics in order, as written', () => JSON.stringify(diagnostics).should.equal(fixture.expected));
            it('should leave the document as it was', () => JSON.stringify(fixture.document).should.equal(written));
        });
    }

    it('should find every upgraded document in the slot shape, unless something could not be mapped', () => {
        const unexpected = corpus.upgrades
            .filter(fixture => fixture.expected.diagnostics.length === 0)
            .filter(fixture => validateSlotShape(upgradeSlotShape(fixture.input).document).length > 0)
            .map(fixture => fixture.name);
        unexpected.should.deep.equal([]);
    });
});
