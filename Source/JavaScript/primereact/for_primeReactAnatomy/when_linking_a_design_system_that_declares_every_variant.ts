// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignComponent, DesignSystem, UiProfile } from '@cratis/scene.model';
import { DesignLinkDiagnosticCode, linkDesignSystem } from '@cratis/scene.engine';
import { buttonForms, buttonSeverities, labelSeverities, messageSeverities } from '../primeReactAnatomy';
import { primeReactDescriptors } from '../primeReactDescriptors';
import { primeReactPackageManifest } from '../primeReactPackage';

const profile: UiProfile = { name: 'Web', targetPlatform: 'web', packages: ['PrimeReact'] };
const catalog = { PrimeReact: primeReactPackageManifest.components };

const partsOf: Record<string, string[]> = {
    Button: ['background', 'text', 'border', 'radius', 'shadow'],
    Tag: ['background', 'text'],
    Badge: ['background', 'text'],
    Message: ['background', 'text', 'border'],
};

const component = (name: string, variants: readonly string[], states: string[] = []): DesignComponent => ({
    name,
    parts: partsOf[name],
    variants: variants.map(variant => ({ name: variant, parts: { background: 'color.a', text: 'color.b' }, ...(states.length === 0 ? {} : { states: Object.fromEntries(states.map(state => [state, { background: 'color.c' }])) }) })),
});

const designSystem = (...components: DesignComponent[]): DesignSystem => ({ name: 'Complete', modes: ['light'], tokens: [], themes: [], components });
const diagnostics = (system: DesignSystem) => linkDesignSystem(system, profile, catalog, primeReactDescriptors).diagnostics.map(diagnostic => [diagnostic.designComponent, diagnostic.code, diagnostic.member]);

describe('when linking a design system that declares every variant', () => {
    it('should render every severity and form of a Button', () => diagnostics(designSystem(component('Button', [...buttonSeverities, ...buttonForms], ['hover', 'focus', 'active']))).should.deep.equal([]));
    it('should render every severity of a Tag', () => diagnostics(designSystem(component('Tag', labelSeverities))).should.deep.equal([]));
    it('should render every severity of a Badge', () => diagnostics(designSystem(component('Badge', labelSeverities))).should.deep.equal([]));
    it('should render every severity of a Message', () => diagnostics(designSystem(component('Message', messageSeverities))).should.deep.equal([]));
    it('should feed a Button variant through its severity property', () =>
        linkDesignSystem(designSystem(component('Button', ['danger'])), profile, catalog, primeReactDescriptors).links[0].variantProperty!.should.equal('severity'));

    describe('and names a form another way', () => {
        it('should report the name, because the custom properties of a variant are called after it', () =>
            diagnostics(designSystem(component('Button', ['primary', 'outline']))).should.deep.equal([['Button', DesignLinkDiagnosticCode.VariantUnsupported, 'outline']]));
    });

    describe('and names a variant PrimeReact does not draw', () => {
        it('should report a Button variant it has no severity for', () =>
            diagnostics(designSystem(component('Button', ['primary', 'rainbow']))).should.deep.equal([['Button', DesignLinkDiagnosticCode.VariantUnsupported, 'rainbow']]));

        it('should report the help severity of a Tag, which PrimeReact does not give it', () =>
            diagnostics(designSystem(component('Tag', ['help']))).should.deep.equal([['Tag', DesignLinkDiagnosticCode.VariantUnsupported, 'help']]));
    });
});
