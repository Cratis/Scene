// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PreviewProblemCode, PreviewProblemSeverity, type PreviewProblem } from '@cratis/scene.blueprint.default';
import { describeSampleDataCatalog } from '@cratis/scene.engine';
import { PreviewStrip } from '../PreviewStrip';
import { defaultPreviewStrings } from '../PreviewStrings';

const draw = (problems: PreviewProblem[] = []) => renderToStaticMarkup(createElement(PreviewStrip, {
    breadcrumb: ['Sales', 'Orders'],
    catalog: describeSampleDataCatalog([], [{ id: 'nordic', title: 'Nordic SMB', locale: 'nb-NO' }], 'nordic'),
    activePack: 'nordic', onChooseSampleData: () => undefined, problems, onShowNode: () => undefined, nameOfNode: id => id.slice(id.lastIndexOf('.') + 1),
    onExit: () => undefined, strings: defaultPreviewStrings,
}));

const drawWithPersonas = (persona?: string) => renderToStaticMarkup(createElement(PreviewStrip, {
    breadcrumb: ['Sales'], catalog: describeSampleDataCatalog([], [{ id: 'nordic', title: 'Nordic SMB', locale: 'nb-NO' }], 'nordic'),
    activePack: 'nordic', onChooseSampleData: () => undefined, problems: [], onShowNode: () => undefined, nameOfNode: id => id, onExit: () => undefined, strings: defaultPreviewStrings,
    lens: true, onToggleLens: () => undefined, personas: [{ name: 'Viewer', policies: [] }, { name: 'Admin', policies: ['Admin'] }], persona, onChoosePersona: () => undefined,
}));

describe('when drawing the preview strip with personas', () => {
    const none = drawWithPersonas();
    const viewer = drawWithPersonas('Viewer');
    it('should offer a selector of the personas', () => none.should.contain('data-preview-persona'));
    it('should list each persona', () => none.should.contain('>Admin</option>'));
    it('should start as nobody in particular', () => none.should.contain('Nobody in particular'));
    it('should say nothing of a persona while none is chosen', () => none.should.not.contain('data-lens-persona'));
    it('should say what the lens shows once one is chosen', () => viewer.should.contain('As Viewer: what its policies do not allow'));
});

describe('when drawing the preview strip', () => {
    const markup = draw();
    it('should open with what is being done, in bold', () => markup.should.contain('<strong class="studio-preview-strip__title">Previewing</strong>'));
    it('should name what is previewed with the breadcrumb', () => markup.should.contain('Sales › Orders'));
    it('should offer the sample data selector with its lead-in and the pack in effect', () => markup.should.contain('Sample data: Nordic SMB'));
    it('should offer the exit with its key', () => markup.should.contain('Exit preview · Esc'));
    it('should offer no persona selector without personas', () => markup.should.not.contain('data-preview-persona'));
    it('should show no problems when nothing stops the preview', () => markup.should.not.contain('data-preview-problems'));

    const broken = draw([{ code: PreviewProblemCode.ScreenMissing, severity: PreviewProblemSeverity.Error, message: 'The feature has no screen.', nodeId: 'Sales.Orders' }]);
    it('should say what stops the preview in the strip', () => broken.should.contain('The feature has no screen.'));
    it('should link to the node the problem is about', () => broken.should.contain('Show Orders'));
});
