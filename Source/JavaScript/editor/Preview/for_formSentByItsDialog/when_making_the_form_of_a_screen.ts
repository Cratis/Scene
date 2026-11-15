// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Form, Screen } from '@cratis/scene.model';
import { formSentByItsDialog } from '../previewApplication';

const screen = (name: string, screenTemplate?: string) => ({ name, layout: 'Shell', slotContent: {}, forms: [], contributions: [], ...(screenTemplate ? { screenTemplate } : {}) }) as unknown as Screen;
const form = { name: 'DescribeProductForm', forCommand: 'DescribeProduct', fields: [] } as unknown as Form;
const make = formSentByItsDialog([screen('Describe', 'QuickCreateDialog'), screen('Products')], [{ name: 'QuickCreateDialog' }]);
const propertiesOf = (element: unknown) => (element as { properties: Record<string, unknown> }).properties;

describe('when making the form of a screen for the preview', () => {
    it('should mark a form in a dialog as sent by the dialog', () => propertiesOf(make('Describe', form)).sentByTheDialog!.should.equal(true));
    it('should not mark a form on a page', () => (propertiesOf(make('Products', form)).sentByTheDialog === undefined).should.be.true);
    it('should keep the command the form sends', () => propertiesOf(make('Describe', form)).command!.should.equal('DescribeProduct'));
});
