// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ComponentDescriptor, EditingScope, EffectiveConfiguration, InstanceContribution, SceneDocument, ScreenTemplate } from '@cratis/scene.model';
import { createDescriptorCatalog, resolveEffectiveConfiguration, resolveTemplateChain } from '../../index';
import { component } from '../given/a_scene_document';

interface ExposureCase {
    name: string;
    scope: EditingScope;
    contributions: InstanceContribution[];
    expected: { values: Record<string, unknown>; diagnostics: string[] };
}

type CompactElement = { id: string; componentName: string; properties?: Record<string, unknown> };

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../../template-exposure-fixtures.json'), 'utf-8')) as {
    descriptors: ComponentDescriptor[];
    document: Omit<SceneDocument, 'dialogTemplates' | 'instanceContributions'>;
    cases: ExposureCase[];
};

/** The corpus states elements by id, component and properties; the rest of an element is the neutral default. */
function documentFrom(source: typeof corpus.document, contributions: InstanceContribution[]): SceneDocument {
    const expand = (content: Record<string, CompactElement[]> | undefined) =>
        Object.fromEntries(Object.entries(content ?? {}).map(([slot, elements]) => [slot, elements.map(element => component(element.id, element.componentName, element.properties ?? {}))]));
    return {
        ...structuredClone(source),
        screenTemplates: source.screenTemplates.map(template => ({ ...structuredClone(template), content: expand(template.content as never) }) as ScreenTemplate),
        dialogTemplates: [],
        instanceContributions: structuredClone(contributions),
    };
}

/** What a user sees: each exposed value by `component.path` - a scalar's value, a collection's item ids. */
function observed(configuration: EffectiveConfiguration) {
    const values = Object.fromEntries(configuration.components.flatMap(entry =>
        entry.values.map(value => [`${entry.component}.${value.path}`, value.items ? value.items.map(item => item.id) : value.value])));
    return { values, diagnostics: configuration.diagnostics.map(diagnostic => diagnostic.code) };
}

describe('when resolving the shared exposed configuration corpus', () => {
    const catalog = createDescriptorCatalog(corpus.descriptors);

    for (const fixture of corpus.cases) {
        it(`should resolve ${fixture.name}`, () => {
            const document = documentFrom(corpus.document, fixture.contributions);
            const configuration = resolveEffectiveConfiguration(resolveTemplateChain(document, fixture.scope), document.instanceContributions, catalog);
            observed(configuration).should.deep.equal(fixture.expected);
        });
    }
});
