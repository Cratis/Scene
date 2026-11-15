// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, DesignSystem, UiProfile } from '@cratis/scene.model';
import { DesignLinkDiagnosticCode, linkDesignSystem } from '../index';

const profile: UiProfile = { name: 'Web', targetPlatform: 'web', packages: ['Lib', 'Shell'] };
const catalog = { core: ['text'], Lib: ['button', 'statusChip', 'Menu_Item'], Shell: ['appShell'] };

const designSystem: DesignSystem = {
    name: 'Shop',
    modes: ['light'],
    tokens: [],
    themes: [],
    components: [
        {
            name: 'Button',
            parts: ['text', 'background', 'shadow'],
            variants: [
                { name: 'primary', parts: { text: 'a', background: 'b' }, states: { hover: { background: 'c' }, pressed: { background: 'd' } } },
                { name: 'danger', parts: { text: 'a', background: 'b' } },
            ],
        },
        { name: 'StatusChip', parts: ['text'], variants: [{ name: 'good', parts: { text: 'a' } }, { name: 'bad', parts: { text: 'a' } }], mapping: { variantValues: { good: 'success', bad: 'danger' } } },
        { name: 'Shell', parts: ['background'], variants: [{ name: 'default', parts: { background: 'a' } }], mapping: { mapsTo: 'Shell.appShell' } },
        { name: 'MenuItem', parts: ['text'], variants: [{ name: 'default', parts: { text: 'a' } }] },
        { name: 'Text', parts: ['text'], variants: [{ name: 'default', parts: { text: 'a' } }] },
        { name: 'Toast', parts: ['text'], variants: [{ name: 'default', parts: { text: 'a' } }] },
        { name: 'Banner', parts: ['text'], variants: [{ name: 'default', parts: { text: 'a' } }], mapping: { mapsTo: 'Lib.banner' } },
    ],
};

const descriptor = (component: string, anatomy?: ComponentDescriptor['anatomy'], properties: string[] = []): ComponentDescriptor =>
    ({ component, properties: properties.map(path => ({ path, label: path, group: 'g', valueType: 'string' as never })), ...(anatomy === undefined ? {} : { anatomy }) });

const descriptors = [
    descriptor('Lib:button', { parts: ['text', 'background'], variants: ['primary'], states: ['hover'] }, ['variant']),
    descriptor('Lib:statusChip', { parts: ['text'], variants: ['success', 'danger'], states: [], variantProperty: 'tone' }),
    descriptor('Shell:appShell', { parts: ['background'], variants: ['default'], states: [] }),
    descriptor('Lib:Menu_Item', { parts: ['text'], variants: ['default'], states: [] }),
    descriptor('core:text'),
];

describe('when linking a design system', () => {
    const linking = linkDesignSystem(designSystem, profile, catalog, descriptors);
    const codes = (component: string) => linking.diagnostics.filter(diagnostic => diagnostic.designComponent === component).map(diagnostic => [diagnostic.code, diagnostic.member]);
    const link = (component: string) => linking.links.find(candidate => candidate.designComponent === component);

    it('should link a component to the one of the same name', () => [link('Button')?.package, link('Button')?.component].should.deep.equal(['Lib', 'button']));
    it('should compare names without regard to case or separators', () => [link('MenuItem')?.package, link('MenuItem')?.component].should.deep.equal(['Lib', 'Menu_Item']));
    it('should link a component to the one it maps to', () => [link('Shell')?.package, link('Shell')?.component].should.deep.equal(['Shell', 'appShell']));
    it('should feed a variant through the well-known property', () => link('Button')?.variantProperty?.should.equal('variant'));
    it('should feed a variant through the property the component says', () => link('StatusChip')?.variantProperty?.should.equal('tone'));
    it('should map a variant to the value the design system states', () => link('StatusChip')?.variantValues.should.deep.equal({ good: 'success', bad: 'danger' }));
    it('should report a part the component does not draw', () => codes('Button').should.deep.include([DesignLinkDiagnosticCode.PartUnsupported, 'shadow']));
    it('should report a variant the component does not render', () => codes('Button').should.deep.include([DesignLinkDiagnosticCode.VariantUnsupported, 'danger']));
    it('should report a state the component does not react to', () => codes('Button').should.deep.include([DesignLinkDiagnosticCode.StateUnsupported, 'pressed']));
    it('should accept every variant a mapping translates into one the component renders', () => codes('StatusChip').should.deep.equal([]));
    it('should report a component no package declares', () => codes('Toast').should.deep.equal([[DesignLinkDiagnosticCode.ComponentUnbound, undefined]]));
    it('should report a mapping to a component no package declares', () => codes('Banner').should.deep.equal([[DesignLinkDiagnosticCode.ComponentUnbound, undefined]]));
    it('should report a component that declares no anatomy', () => codes('Text').should.deep.equal([[DesignLinkDiagnosticCode.ComponentWithoutAnatomy, undefined]]));
    it('should not link a component that is unbound or has no anatomy', () => [link('Toast'), link('Banner'), link('Text')].should.deep.equal([undefined, undefined, undefined]));

    describe('and the component has variants but nothing to choose one by', () => {
        const unchosen = linkDesignSystem(
            { ...designSystem, components: [{ name: 'Button', parts: ['text'], variants: [{ name: 'primary', parts: { text: 'a' } }, { name: 'secondary', parts: { text: 'a' } }] }] },
            profile, catalog, [descriptor('Lib:button', { parts: ['text'], variants: ['primary', 'secondary'], states: [] })]);

        it('should report the missing property', () => unchosen.diagnostics.map(diagnostic => diagnostic.code).should.deep.equal([DesignLinkDiagnosticCode.VariantPropertyMissing]));
    });

    describe('and two packages declare the name', () => {
        const both = linkDesignSystem(
            { ...designSystem, components: [{ name: 'Button', parts: ['text'], variants: [{ name: 'primary', parts: { text: 'a' } }] }] },
            profile, { ...catalog, Shell: ['button'] }, [...descriptors, descriptor('Shell:button', { parts: ['text'], variants: ['primary'], states: [] }, ['variant'])]);

        it('should link to the one the profile lists last', () => both.links[0].package.should.equal('Shell'));
    });
});
