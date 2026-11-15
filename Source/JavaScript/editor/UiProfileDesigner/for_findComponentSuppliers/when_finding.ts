// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import { aStandaloneLibrary, bundlesWith } from '../../UiProfile/given/aStandaloneLibrary';
import { findComponentSuppliers, SupplierAnswerKind } from '../PackageList/findComponentSuppliers';

const bundles = bundlesWith(aStandaloneLibrary('Leaf', ['card', 'leafWidget']), aStandaloneLibrary('Offered', ['offeredWidget']));
const settings = { ...defaultUiProfileSettings(bundles), packages: ['PrimeReact', 'Tailwind', 'Leaf'] };
const answers = (query: string) => findComponentSuppliers(query, resolveUiProfile(settings, bundles), bundles);

describe('when asking who supplies a component more than one package declares', () => {
    const answer = answers('card')[0];

    it('should answer for that name first', () => answer.name.should.equal('card'));
    it('should name the package that wins', () => answer.supplier!.should.equal(resolveUiProfile(settings, bundles).profile.packages.filter(name => ['PrimeReact', 'Leaf', 'core'].includes(name)).reverse()[0]));
    it('should name the packages it overrides', () => answer.shadows.should.include.members(['Leaf', 'core']));
    it('should say it is supplied', () => answer.kind.should.equal(SupplierAnswerKind.Supplied));
});

describe('when asking with part of a name', () => {
    const found = answers('leafwid');

    it('should match without regard to case', () => found.map(answer => answer.name).should.deep.equal(['leafWidget']));
});

describe('when asking for a package-qualified name', () => {
    const answer = answers('core.card')[0];

    it('should answer for exactly that package', () => answer.supplier!.should.equal('core'));
    it('should not name overridden packages', () => answer.shadows.should.be.empty);
});

describe('when asking for a component only a package outside the profile declares', () => {
    const answer = answers('offeredWidget')[0];

    it('should say the profile does not supply it', () => answer.kind.should.equal(SupplierAnswerKind.NotIncluded));
    it('should name the package that does', () => answer.offeredBy.should.deep.equal(['Offered']));
});

describe('when asking for a component nothing declares', () => {
    it('should say so', () => answers('nothingLikeThis')[0].kind.should.equal(SupplierAnswerKind.Unknown));
});

describe('when asking for nothing', () => {
    it('should answer nothing', () => answers('   ').should.be.empty);
});

describe('when the query matches many components', () => {
    const found = answers('a');

    it('should answer for at most eight', () => found.length.should.be.at.most(8));
    it('should put the exact and prefix matches before the rest', () => found.map(answer => answer.name.toLowerCase().startsWith('a')).should.deep.equal([...found.map(answer => answer.name.toLowerCase().startsWith('a'))].sort((left, right) => Number(right) - Number(left))));
});
