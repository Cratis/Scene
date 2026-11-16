// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateCatalogKind } from '@cratis/scene.engine';
import { TemplateReferenceKind } from '../../ScreenTemplates/TemplateReferenceKind';
import { TemplateBrowserActionKind } from '../TemplateBrowserActionKind';
import type { TemplateBrowserActions } from '../TemplateBrowserActions';
import type { TemplateBrowserEntry } from '../TemplateBrowserEntry';
import { TemplateBrowserMode } from '../TemplateBrowserMode';
import { TemplateOrigin } from '../TemplateOrigin';
import { availableActions } from '../availableActions';

const nothing = (): void => undefined;
const everything: TemplateBrowserActions = { onChoose: nothing, onEdit: nothing, onRename: nothing, onDuplicate: nothing, onRemove: nothing, onCopyToMine: nothing, onAddBlueprint: nothing, onExport: nothing };
const entry = (overrides: Partial<TemplateBrowserEntry>): TemplateBrowserEntry => ({
    id: 'x', origin: TemplateOrigin.Own, reference: { kind: TemplateReferenceKind.Application, id: 'x' }, kind: TemplateCatalogKind.ScreenTemplate, name: 'x', displayName: 'X',
    scopes: [], sliceKinds: [], compatible: true, problems: [], installed: true, current: false, applicability: { applies: true, reasons: [] }, ...overrides,
});
const blueprint = (overrides: Partial<TemplateBrowserEntry> = {}) => entry({ origin: TemplateOrigin.Blueprint, reference: { kind: TemplateReferenceKind.Blueprint, id: 'x' }, package: 'P', ...overrides });

describe('when deciding what to offer on an own template', () => {
    it('should offer managing it on the page, and choosing it where a choice is asked for', () => {
        availableActions(entry({}), TemplateBrowserMode.Manage, everything).should.deep.equal([
            TemplateBrowserActionKind.Choose, TemplateBrowserActionKind.Edit, TemplateBrowserActionKind.Rename, TemplateBrowserActionKind.Duplicate, TemplateBrowserActionKind.Export, TemplateBrowserActionKind.Remove]);
    });

    it('should offer only choosing in a dialog', () => availableActions(entry({}), TemplateBrowserMode.Pick, everything).should.deep.equal([TemplateBrowserActionKind.Choose]));
    it('should not offer choosing what is chosen already', () => availableActions(entry({ current: true }), TemplateBrowserMode.Pick, everything).should.be.empty);
    it('should not offer choosing what does not fit', () => availableActions(entry({ applicability: { applies: false, reasons: ['no'] } }), TemplateBrowserMode.Pick, everything).should.be.empty);
    it('should not offer what the host does not handle', () => availableActions(entry({}), TemplateBrowserMode.Manage, { onEdit: nothing }).should.deep.equal([TemplateBrowserActionKind.Edit]));
});

describe('when deciding what to offer on a blueprint template', () => {
    it('should offer choosing it and copying it, and never changing it', () => {
        availableActions(blueprint(), TemplateBrowserMode.Manage, everything).should.deep.equal([TemplateBrowserActionKind.Choose, TemplateBrowserActionKind.CopyToMine]);
    });

    it('should offer adding the blueprint, not choosing, when it is not in the profile', () => {
        availableActions(blueprint({ installed: false }), TemplateBrowserMode.Manage, everything).should.deep.equal([TemplateBrowserActionKind.AddBlueprint, TemplateBrowserActionKind.CopyToMine]);
    });

    it('should not offer copying a shell or a dialog template, which are not screen templates', () => {
        availableActions(blueprint({ kind: TemplateCatalogKind.DialogTemplate }), TemplateBrowserMode.Manage, everything).should.deep.equal([TemplateBrowserActionKind.Choose]);
        availableActions(blueprint({ kind: TemplateCatalogKind.Layout }), TemplateBrowserMode.Manage, everything).should.deep.equal([TemplateBrowserActionKind.Choose]);
    });

    it('should not offer choosing or copying what the host cannot run', () => {
        availableActions(blueprint({ compatible: false, problems: ['needs scene 9'] }), TemplateBrowserMode.Manage, everything).should.be.empty;
    });
});
