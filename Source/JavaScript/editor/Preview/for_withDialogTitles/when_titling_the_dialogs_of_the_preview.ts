// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen } from '@cratis/scene.model';
import { withDialogTitles } from '../previewApplication';

const screen = (name: string, screenTemplate: string | undefined, slotContent: Record<string, unknown[]> = {}) => ({
    name, layout: 'Shell', slotContent, contributions: [], forms: [{ name: 'Form', forCommand: 'DescribeProduct', fields: [] }], ...(screenTemplate ? { screenTemplate } : {}),
}) as unknown as Screen;
const templates = [{ name: 'QuickCreateDialog', slots: [{ name: 'header' }, { name: 'body' }] }];
const titleOf = (titled: Screen) => ((titled.slotContent.header ?? [])[0] as { properties?: { title?: string } } | undefined)?.properties?.title;

describe('when titling the dialogs of the preview', () => {
    const [dialog, page, headed] = withDialogTitles([screen('Describe', 'QuickCreateDialog'), screen('Products', undefined), screen('Headed', 'QuickCreateDialog', { header: [{ id: 'own' }] })], templates);

    it('should head a dialog with what its form does', () => titleOf(dialog)!.should.equal('Describe product'));
    it('should leave a page alone', () => (page.slotContent.header === undefined).should.be.true);
    it('should keep a header the screen fills itself', () => (headed.slotContent.header![0] as { id: string }).id.should.equal('own'));
});
