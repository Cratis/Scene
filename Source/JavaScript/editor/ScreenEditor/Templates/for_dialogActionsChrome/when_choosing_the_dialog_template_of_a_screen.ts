// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DialogTemplate, SceneDocument } from '@cratis/scene.model';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { dialogTemplateOf } from '../dialogActionsChrome';

const template = (name: string): DialogTemplate => ({ name, slots: [{ name: 'actions' }] });
const screen = (named?: string, declared: DialogTemplate[] = []): SceneDocument => ({ ...createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'), named), dialogTemplates: declared });

describe('when choosing the dialog template of a screen', () => {
    it('should use the blueprint template the screen names', () => dialogTemplateOf(screen('QuickCreateDialog'), [template('FormDialog'), template('QuickCreateDialog')]).name.should.equal('QuickCreateDialog'));
    it('should use the template of the document the screen names, before a blueprint\'s of the same name', () => dialogTemplateOf(screen('Own', [template('Own'), template('FormDialog')]), [{ ...template('Own'), displayName: 'Theirs' }]).name.should.equal('Own'));
    it('should prefer the document\'s own over a blueprint\'s of the same name', () => (dialogTemplateOf(screen('Own', [{ ...template('Own'), displayName: 'Mine' }]), [{ ...template('Own'), displayName: 'Theirs' }]).displayName === 'Mine').should.be.true);
    it('should fall back to the form dialog of the document when the screen names none', () => dialogTemplateOf(screen(undefined, [template('Other'), template('FormDialog')])).name.should.equal('FormDialog'));
    it('should fall back to the standard form dialog when nothing is named or declared', () => dialogTemplateOf(screen()).name.should.equal('FormDialog'));
    it('should fall back to the form dialog when the name is not a dialog template anyone knows', () => dialogTemplateOf(screen('Unknown')).name.should.equal('FormDialog'));
});
