// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItem, OutletKind } from '@cratis/scene.model';
import { OutletDiagnostic } from './OutletDiagnostic';
import { OutletDiagnosticCode } from './OutletDiagnosticCode';
import { OutletDiagnosticSeverity } from './OutletDiagnosticSeverity';
import { describeOutletItemKinds, outletItemKindName } from './outletItemKinds';

const error = OutletDiagnosticSeverity.Error;
const warning = OutletDiagnosticSeverity.Warning;

/** The diagnostics the outlet engine raises, with the messages both engines share. */
export const outletDiagnostics = {
    unknownOutlet: (outlet: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.UnknownOutlet, severity: error, outlet,
        message: `No level declares the outlet '${outlet}'`,
    }),
    duplicateOutlet: (outlet: string, owner: string, declaredBy: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.DuplicateOutlet, severity: error, outlet, owner,
        message: `${owner} declares the outlet '${outlet}', which ${declaredBy} already declares`,
    }),
    refinementOfUnknownOutlet: (outlet: string, owner: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.RefinementOfUnknownOutlet, severity: error, outlet, owner,
        message: `${owner} refines the outlet '${outlet}', which no level above it declares`,
    }),
    contributionToUnknownOutlet: (outlet: string, owner: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.ContributionToUnknownOutlet, severity: error, outlet, owner,
        message: `${owner} contributes to the outlet '${outlet}', which no level declares`,
    }),
    hiddenItemMissing: (outlet: string, owner: string, item: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.HiddenItemMissing, severity: warning, outlet, owner, item,
        message: `${owner} hides '${item}', which the outlet '${outlet}' neither inherits nor receives as a contribution`,
    }),
    placementTargetMissing: (outlet: string, owner: string, item: string, placement: 'before' | 'after', target: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.PlacementTargetMissing, severity: warning, outlet, owner, item,
        message: `${owner} places '${item}' ${placement} '${target}', which the outlet '${outlet}' does not have, so it goes last`,
    }),
    placementAboveInherited: (outlet: string, owner: string, item: string, target: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.PlacementAboveInherited, severity: warning, outlet, owner, item,
        message: `${owner} places '${item}' before '${target}' in the outlet '${outlet}', but own items never go above inherited ones and contributions never above either, so it goes first after them`,
    }),
    itemKindMismatch: (outlet: string, kind: OutletKind, owner: string, item: OutletItem): OutletDiagnostic => ({
        code: OutletDiagnosticCode.ItemKindMismatch, severity: error, outlet, owner, item: item.id,
        message: `${owner} puts the ${outletItemKindName(item.kind)} '${item.id}' in the ${kind} outlet '${outlet}', which takes ${describeOutletItemKinds(kind)}`,
    }),
    groupItemKindMismatch: (outlet: string, owner: string, group: string, item: OutletItem): OutletDiagnostic => ({
        code: OutletDiagnosticCode.ItemKindMismatch, severity: error, outlet, owner, item: item.id,
        message: `${owner} puts the ${outletItemKindName(item.kind)} '${item.id}' in the group '${group}' of the outlet '${outlet}', which takes buttons, menu entries and separators`,
    }),
    duplicateItemId: (outlet: string, owner: string, item: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.DuplicateItemId, severity: error, outlet, owner, item,
        message: `${owner} adds '${item}' to the outlet '${outlet}', which already has an item with that id`,
    }),
    itemsIgnoredWhenInheriting: (outlet: string, owner: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.ItemsIgnoredWhenInheriting, severity: warning, outlet, owner,
        message: `${owner} inherits the outlet '${outlet}' unchanged, so its items and hides are ignored; extend or override it to use them`,
    }),
    tabsNeedSlot: (outlet: string, owner: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.TabsNeedSlot, severity: error, outlet, owner,
        message: `The tabs outlet '${outlet}' of ${owner} names no slot to show its screens in`,
    }),
    subjectOnlyForActions: (outlet: string, kind: OutletKind, owner: string): OutletDiagnostic => ({
        code: OutletDiagnosticCode.SubjectOnlyForActions, severity: warning, outlet, owner,
        message: `The ${kind} outlet '${outlet}' of ${owner} names a subject; only an outlet of actions has one`,
    }),
};
