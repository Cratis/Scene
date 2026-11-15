// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { buildDesignCatalogue, queryDesignCatalogue } from '../index';
import { input } from '../given/aDesign';

describe('when building the catalogue', () => {
    const catalogue = buildDesignCatalogue(input());
    const button = catalogue.components.find(component => component.name === 'spec:button')!;

    it('should list the components of the descriptors in order', () => catalogue.components.map(component => component.name).should.deep.equal(['spec:button', 'spec:chart', 'spec:dialog']));
    it('should limit the variants of a component to those the design system declares', () => button.anatomy!.variants.should.deep.equal(['primary']));
    it('should limit the choices of the variant property to them', () => button.properties.find(property => property.name === 'variant')!.choices!.should.deep.equal(['primary']));
    it('should keep only the states the design system declares for the component', () => button.anatomy!.states.should.deep.equal([]));
    it('should say which design system component it is bound to', () => button.anatomy!.designSystemComponent!.should.equal('Button'));
    it('should place an overlay in no outlet', () => catalogue.components.find(component => component.name === 'spec:dialog')!.placement.should.equal('overlay'));
    it('should derive what an outlet takes from the template content', () => catalogue.templates[0].outlets[0].should.deep.equal({ name: 'actions', components: ['spec:button'], categories: ['Actions'], open: false }));
    it('should leave an outlet with nothing known open to any component that may be placed', () => catalogue.templates[0].outlets[1].open.should.be.true);
    it('should say where a component fits', () => button.fits.should.deep.equal(['Page.actions', 'Page.body', 'Other.main']));
    it('should list the token roles with their values per theme and mode', () => catalogue.tokens.should.deep.equal([{ address: 'color.primary', category: 'color', name: 'primary', values: [{ theme: 'Day', mode: 'light', value: '#112233' }] }]));
    it('should build the same catalogue every time', () => JSON.stringify(buildDesignCatalogue(input())).should.equal(JSON.stringify(catalogue)));

    describe('and the templates are limited to a set', () => {
        const limited = buildDesignCatalogue(input({ templateSet: ['Other'] }));

        it('should list only the templates of the set', () => limited.templates.map(template => template.name).should.deep.equal(['Other']));
        it('should say the outlets a component fits only in the set', () => limited.components.find(component => component.name === 'spec:button')!.fits.should.deep.equal(['Other.main']));
        it('should carry the set', () => limited.templateSet!.should.deep.equal(['Other']));
    });

    describe('and asked about something it does not have', () => {
        it('should answer that it was not found', () => queryDesignCatalogue(catalogue, { what: 'component', name: 'carousel' }).should.deep.equal({ found: false }));
    });
});
