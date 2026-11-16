// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellSlotAction } from '@cratis/scene.engine';
import { TemplateReferenceSource } from '@cratis/scene.model';
import { applyShellSwitchToDocuments } from '../applyShellSwitchToDocuments';
import { planSwitchTo } from '../shellSwitch';
import { contextWith, defaultBlueprint, screenPlacing, settings } from '../given/aShellContext';

const fullPage = { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'FullPage' };

describe('when applying a switch whose slot content moves to the primary slot', () => {
    const screens = [screenPlacing('Orders', 'sidebar')];
    const outcome = planSwitchTo(settings, fullPage, contextWith(screens), { sidebar: { action: ShellSlotAction.MoveToPrimary } });
    const rewritten = applyShellSwitchToDocuments([
        { key: 'orders', document: JSON.stringify({ screens, screenTemplates: [] }) },
        { key: 'other', document: JSON.stringify({ screens: [{ name: 'Elsewhere', layout: 'AppShell' }], screenTemplates: [] }) },
        { key: 'broken', document: 'not json' },
        { key: 'missing', document: undefined },
        { key: 'not a document', document: JSON.stringify({ screens: [] }) },
    ], { plan: outcome.plan, templates: outcome.templates });

    it('should rewrite only the document that holds the screen', () => rewritten.map(document => document.key).should.deep.equal(['orders']));
    it('should take the content out of the slot the new shell lacks', () => (JSON.parse(rewritten[0].document).screens[0].slotContent.sidebar === undefined).should.be.true);
    it('should put it in the primary slot', () => JSON.parse(rewritten[0].document).screens[0].slotContent.content.length.should.equal(1));
    it('should say what changed', () => rewritten[0].changes.length.should.be.greaterThan(0));
});

describe('when applying a plan that cannot be made', () => {
    const screens = [screenPlacing('Orders', 'sidebar')];
    const outcome = planSwitchTo(settings, fullPage, contextWith(screens));
    const rewritten = applyShellSwitchToDocuments([{ key: 'orders', document: JSON.stringify({ screens, screenTemplates: [] }) }], { plan: outcome.plan, templates: outcome.templates });

    it('should change nothing', () => rewritten.should.be.empty);
});
