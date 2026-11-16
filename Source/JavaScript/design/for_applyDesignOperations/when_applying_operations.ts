// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InsertNodeEdit } from '@cratis/scene.model';
import { DesignOperation, applyDesignOperations } from '../index';
import { contextOf, emptyWorkspace } from '../given/aDesign';

const context = contextOf();
const operations: DesignOperation[] = [
    { op: 'addScreen', name: 'Home', template: 'Page' },
    { op: 'insert', screen: 'Home', outlet: 'body', component: 'spec:chart', props: { title: 'Sales' } },
];
const designed = applyDesignOperations(emptyWorkspace(), operations, context);

describe('when applying design operations', () => {
    it('should lower an insert to a Scene edit applied through the engine', () => {
        const [, insert] = designed.outcomes;
        (insert.sceneEdits[0].edit as InsertNodeEdit).target.should.equal('screen:Home#slot:body');
    });
    it('should put the new element in the screen', () => designed.workspace.document.screens[0].slotContent.body.map(element => element.id).should.deep.equal(['chart-1']));
    it('should declare the template the screen is built on', () => designed.workspace.document.screenTemplates.map(template => template.name).should.deep.equal(['Page']));
    it('should keep the default storyline in screen order', () => designed.workspace.screenSet.storylines[0].steps.should.deep.equal(['Home']));
    it('should make the same ids every time', () => JSON.stringify(applyDesignOperations(emptyWorkspace(), operations, context)).should.equal(JSON.stringify(applyDesignOperations(emptyWorkspace(), operations, context))));
    it('should report that something changed', () => designed.changed.should.be.true);

    describe('and an operation is free styling', () => {
        const refused = applyDesignOperations(designed.workspace, [{ op: 'set', screen: 'Home', element: 'chart-1', prop: 'backgroundColor', value: 'red' }], context);
        const [outcome] = refused.outcomes;

        it('should refuse it', () => outcome.code!.should.equal('freeStylingNotAllowed'));
        it('should change nothing', () => refused.workspace.should.equal(designed.workspace));
        it('should offer to propose it to the design system', () => outcome.alternatives!.some(alternative => alternative.proposal?.kind === 'token').should.be.true);
        it('should carry the refusal as a diagnostic', () => outcome.diagnostics[0].severity.should.equal('error'));
    });

    describe('and an operation asks for a variant the design system does not declare', () => {
        const [outcome] = applyDesignOperations(designed.workspace, [{ op: 'insert', screen: 'Home', outlet: 'actions', component: 'spec:button', props: { variant: 'danger' } }], context).outcomes;

        it('should refuse it', () => outcome.code!.should.equal('variantNotInDesignSystem'));
        it('should name the variants the system has', () => outcome.reason!.should.contain('primary'));
    });

    describe('and a template is outside the set the design may use', () => {
        const limited = contextOf({ templateSet: ['Other'] });
        const [outcome] = applyDesignOperations(emptyWorkspace(), [{ op: 'addScreen', name: 'Home', template: 'Page' }], limited).outcomes;

        it('should refuse the screen', () => outcome.code!.should.equal('templateNotInSet'));
        it('should offer the templates of the set', () => (outcome.alternatives![0].operations![0] as { template: string }).template.should.equal('Other'));
    });

    describe('and a refused operation is followed by one that is accepted', () => {
        const result = applyDesignOperations(designed.workspace, [{ op: 'insert', screen: 'Home', outlet: 'body', component: 'spec:dialog' }, { op: 'set', screen: 'Home', element: 'chart-1', prop: 'title', value: 'Revenue' }], context);

        it('should refuse the first', () => result.outcomes[0].applied.should.be.false);
        it('should apply the second', () => (result.workspace.document.screens[0].slotContent.body[0].properties as { title: string }).title.should.equal('Revenue'));
    });

    describe('and a template is designed in template mode', () => {
        const result = applyDesignOperations(emptyWorkspace(), [
            { op: 'addTemplate', name: 'Wizard', slots: [{ name: 'steps' }, { name: 'footer' }] },
            { op: 'insert', template: 'Wizard', outlet: 'footer', component: 'spec:button', props: { label: 'Next' } },
        ], context);

        it('should add the template with its slots', () => result.workspace.document.screenTemplates[0].slots.map(slot => slot.name).should.deep.equal(['steps', 'footer']));
        it('should put the content in the template', () => result.workspace.document.screenTemplates[0].content!.footer.map(element => element.id).should.deep.equal(['button-1']));
        it('should apply the edit in the scope of the template', () => result.outcomes[1].sceneEdits[0].scope.should.deep.equal({ kind: 'screenTemplate', name: 'Wizard' }));
    });
});
