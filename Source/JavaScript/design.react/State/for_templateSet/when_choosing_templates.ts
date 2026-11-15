// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createDesignContext, foldDesignSession } from '@cratis/scene.design';
import { aSession } from '../../given/aSession';
import { started } from '../../given/aStartedDesign';
import { createFakeDesignHost } from '../../Testing/createFakeDesignHost';
import { buildableTemplates, templateChoices, templateSetEvent, toggleTemplate } from '../templateSet';

const input = createFakeDesignHost().host.catalogue.input();

describe('when choosing the templates a design may use', () => {
    describe('and the design is not limited', () => {
        const choices = templateChoices(input, aSession([]));

        it('should offer the templates of the design system', () => choices.length.should.be.greaterThan(3));
        it('should allow every one of them', () => choices.every(choice => choice.allowed).should.equal(true));
        it('should not offer a root template a profile uses', () => choices.some(choice => /shell/i.test(choice.name)).should.equal(false));
    });

    describe('and the design is limited to two templates', () => {
        const names = templateChoices(input, aSession([])).slice(0, 2).map(choice => choice.name);
        const choices = templateChoices(input, aSession([], 'screens', names));

        it('should allow only those', () => choices.filter(choice => choice.allowed).map(choice => choice.name).should.deep.equal(names));
        it('should build screens only on those', () => buildableTemplates(choices).map(choice => choice.name).should.deep.equal(names));
        it('should still list the others, to be allowed again', () => choices.length.should.be.greaterThan(2));
    });

    describe('and the catalogue is built for a limited design', () => {
        const names = templateChoices(input, aSession([])).slice(0, 2).map(choice => choice.name);
        const context = createDesignContext({ ...input, templateSet: names });

        it('should list only the allowed templates to the AI', () => context.catalogue.templates.map(template => template.name).should.deep.equal(names));
    });
});

describe('when allowing and disallowing a template', () => {
    const choices = templateChoices(input, aSession([]));
    const first = choices[0]!.name;

    it('should limit the set to the others when one is taken away', () => toggleTemplate(choices, first)!.should.not.include(first));
    it('should keep every other template', () => toggleTemplate(choices, first)!.length.should.equal(choices.length - 1));

    describe('and the last allowed one is taken away', () => {
        const limited = templateChoices(input, aSession([], 'screens', [first]));

        it('should keep it, since an empty set would mean no limit', () => toggleTemplate(limited, first)!.should.deep.equal([first]));
    });

    describe('and the one allowed again completes the set', () => {
        const limited = templateChoices(input, aSession([], 'screens', choices.slice(1).map(choice => choice.name)));

        it('should lift the limit', () => (toggleTemplate(limited, first) === undefined).should.equal(true));
    });
});

describe('when recording the set', () => {
    it('should record the templates allowed', () => templateSetEvent(['A', 'B']).should.deep.equal({ type: 'DesignTemplateSetChanged', templateSet: ['A', 'B'] }));
    it('should record a lifted limit as no set', () => templateSetEvent(undefined).should.deep.equal({ type: 'DesignTemplateSetChanged' }));
    it('should leave the session unlimited once it is lifted', () => (foldDesignSession([started('screens', ['A']), templateSetEvent(undefined)])!.templateSet === undefined).should.equal(true));
});
