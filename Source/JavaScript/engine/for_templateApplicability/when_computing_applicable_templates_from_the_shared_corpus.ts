// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TemplateReferenceSource } from '@cratis/scene.model';
import { ApplicableTemplateGroup, ApplicableTemplateSet, TemplateLibrary, TemplateTarget, applicableTemplates } from '../index';

interface ExpectedGroup {
    category: string | null;
    templates: string[];
}

interface ExpectedBlueprint {
    blueprint: string;
    version: string;
    pin: string;
    categories: ExpectedGroup[];
}

interface ApplicableCase {
    name: string;
    target: TemplateTarget;
    expected: { own: ExpectedGroup[]; blueprints: ExpectedBlueprint[] };
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../template-applicability-fixtures.json'), 'utf-8')) as {
    library: TemplateLibrary;
    applicable: ApplicableCase[];
};

const describeGroups = (groups: (ApplicableTemplateGroup | ExpectedGroup)[]) =>
    groups.map(group => `${group.category ?? '(none)'}=${group.templates.map(template => (typeof template === 'string' ? template : template.name)).join(',')}`).join('|');

const describeSet = (set: ApplicableTemplateSet | ApplicableCase['expected']) =>
    `own[${describeGroups(set.own)}] blueprints[${set.blueprints.map(blueprint => `${blueprint.blueprint}@${blueprint.version}:${describeGroups(blueprint.categories)}`).join(';')}]`;

for (const fixture of corpus.applicable) {
    describe(`when computing applicable templates for ${fixture.name}`, () => {
        let result: ApplicableTemplateSet;
        let original: string;
        beforeEach(() => {
            original = JSON.stringify(corpus.library);
            result = applicableTemplates(corpus.library, fixture.target);
        });

        it('should offer the same templates as the C# engine', () => describeSet(result).should.equal(describeSet(fixture.expected)));
        it('should never list a blueprint without applicable templates', () => result.blueprints.every(blueprint => blueprint.categories.length > 0).should.be.true);
        it('should reference own templates by name', () =>
            result.own.flatMap(group => group.templates).every(template =>
                template.reference.source === TemplateReferenceSource.Own && template.reference.id === template.name &&
                template.reference.blueprint === undefined && template.reference.version === undefined).should.be.true);
        it('should pin blueprint references to the caret range of the installed version', () => {
            for (const blueprint of result.blueprints) {
                const pin = fixture.expected.blueprints.find(expected => expected.blueprint === blueprint.blueprint)!.pin;
                blueprint.categories.flatMap(group => group.templates).every(template =>
                    template.reference.source === TemplateReferenceSource.Blueprint && template.reference.blueprint === blueprint.blueprint &&
                    template.reference.id === template.name && template.reference.version === pin).should.be.true;
            }
        });
        it('should not modify the library', () => JSON.stringify(corpus.library).should.equal(original));
    });
}
