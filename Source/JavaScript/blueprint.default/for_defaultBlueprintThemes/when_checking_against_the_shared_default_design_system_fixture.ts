// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultBlueprintDesignSystem } from '../themes';

// The fixture the C# starter design system (Cratis.Scene.Design.DesignSystemStarter) is asserted against: a product that starts from the
// starter must have the roles, the anatomy and the palette of the default design system this blueprint ships.
const fixture = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../default-design-system-fixture.json'), 'utf-8')) as Record<string, unknown>;
const designSystem = defaultBlueprintDesignSystem;
const theme = designSystem.themes[0];

const asJson = (value: unknown) => JSON.parse(JSON.stringify(value));

describe('when checking against the shared default design system fixture', () => {
    it('should name the default design system', () => (fixture.name as string).should.equal(designSystem.name));
    it('should have the modes of the default design system', () => (fixture.modes as unknown[]).should.deep.equal(designSystem.modes));
    it('should have the token roles of the default design system', () =>
        (fixture.tokens as unknown[]).should.deep.equal(designSystem.tokens.map(role => ({ category: role.category, name: role.name }))));
    it('should have the components of the default design system', () =>
        (fixture.components as unknown[]).should.deep.equal(asJson(designSystem.components.map(component => ({ name: component.name, parts: component.parts, variants: component.variants })))));
    it('should have the contrast rules of the default design system', () => (fixture.contrastRules as unknown[]).should.deep.equal(asJson(designSystem.contrastRules)));
    it('should have the light and dark values of the default theme', () =>
        (fixture.theme as Record<string, unknown>).should.deep.equal(Object.fromEntries(theme.modes.map(mode => [mode.mode, mode.tokens]))));
});
