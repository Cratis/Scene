// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { PropertyEditorRegistry, defaultEditorId } from '../PropertyEditorRegistry';

const property = (extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor => ({ path: 'p', label: 'P', group: 'G', valueType: PropertyValueType.String, ...extra });
const load = async () => () => null;

describe('when resolving an editor from an open registry', () => {
    const registry = new PropertyEditorRegistry().register('text', load).register('navigationTarget', load);

    it('should prefer the editor the property names', () => registry.resolve(property({ editorKind: 'navigationTarget' }))!.should.deep.equal({ id: 'navigationTarget', tier: 'kind' }));
    it('should fall back to the default for its value type', () => registry.resolve(property())!.should.deep.equal({ id: 'text', tier: 'default' }));
    it('should fall back to the default for an editor kind nobody registered', () => registry.resolve(property({ editorKind: 'unknown' }))!.tier.should.equal('default'));
    it('should resolve nothing when even the default is not registered', () => (registry.resolve(property({ valueType: PropertyValueType.Number })) === undefined).should.be.true);

    describe('and a package contributes an editor for a kind the registry does not know', () => {
        it('should resolve the package tier, ahead of the defaults', () => registry.resolve(property({ editorKind: 'checklistItems' }), { packageEditor: true })!.should.deep.equal({ id: 'checklistItems', tier: 'package' }));
        it('should still prefer a kind the registry knows', () => registry.resolve(property({ editorKind: 'navigationTarget' }), { packageEditor: true })!.tier.should.equal('kind'));
    });

    describe('and a blueprint registers an editor of its own', () => {
        const extended = new PropertyEditorRegistry().register('text', load).register('gauge', load);

        it('should resolve it', () => extended.resolve(property({ editorKind: 'gauge' }))!.id.should.equal('gauge'));
        it('should list it', () => extended.ids.should.deep.equal(['text', 'gauge']));
    });

    describe('and an editor is replaced', () => {
        const replaced = new PropertyEditorRegistry().register('text', async () => () => 'old');

        it('should load the new one, not the old', async () => {
            await replaced.load('text');
            replaced.register('text', async () => () => 'new');
            (replaced.loadedOf('text') === undefined).should.be.true;
            ((await replaced.load('text')) as unknown as () => string)().should.equal('new');
        });
    });
});

describe('when asking for the same editor twice', () => {
    let calls = 0;
    const registry = new PropertyEditorRegistry().register('text', async () => { calls++; return () => null; });

    it('should have nothing before it is asked for', () => (registry.loadedOf('text') === undefined).should.be.true);
    it('should load it once however many ask', async () => {
        const [first, second] = await Promise.all([registry.load('text'), registry.load('text')]);
        (first === second).should.be.true;
        calls.should.equal(1);
    });
    it('should hand it out as loaded afterwards, without loading again', async () => {
        (registry.loadedOf('text') !== undefined).should.be.true;
        await registry.load('text');
        calls.should.equal(1);
    });
    it('should refuse an id nobody registered', async () => {
        let refused = false;
        await registry.load('missing').catch(() => { refused = true; });
        refused.should.be.true;
    });
    it('should try again after a loader that failed', async () => {
        let attempts = 0;
        const flaky = new PropertyEditorRegistry().register('x', async () => { if (attempts++ === 0) throw new Error('offline'); return () => null; });
        await flaky.load('x').catch(() => undefined);
        (await flaky.load('x') !== undefined).should.be.true;
        attempts.should.equal(2);
    });
});

describe('when choosing the default editor of an enumeration', () => {
    const choices = (count: number) => Array.from({ length: count }, (_, index) => ({ value: index, label: `${index}` }));

    it('should use chips up to four choices', () => defaultEditorId(property({ valueType: PropertyValueType.Enum, choices: choices(4) }))!.should.equal('enum'));
    it('should use chips for none at all', () => defaultEditorId(property({ valueType: PropertyValueType.Enum }))!.should.equal('enum'));
    it('should use a dropdown beyond four', () => defaultEditorId(property({ valueType: PropertyValueType.Enum, choices: choices(5) }))!.should.equal('select'));
});
