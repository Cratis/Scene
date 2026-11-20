// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { FormSyntax, ScreenSyntax } from './Syntax/ScreenplaySyntax';
import type { ConversionFinding } from './ConversionFinding';
import type { ImportedScreenDocument } from './ImportedScreenDocument';
import { carriedDocumentOf, isCarrierForm } from './sceneDocumentCarrier';
import { roleOf } from './sceneScreenNames';
import { screensToDocument } from './sceneScreens';

export interface SliceScreens {
    // The identity of the slice the screens belong to, as the host identifies it.
    readonly sliceId: string;

    // The screens the slice declares, in the order the document declares them.
    readonly screens: readonly ScreenSyntax[];

    // The forms the module declares, which a screen's actions reach.
    readonly forms?: readonly FormSyntax[];

    // The roles the application declares as personas. A screen named after one belongs to that role; every other
    // screen is a screen of its own and belongs to the slice. Left out, every screen is named after its role,
    // which is what a document that declares no persona always meant.
    readonly roles?: ReadonlySet<string>;
}

export interface SliceScreenDocuments {
    readonly documents: readonly ImportedScreenDocument[];
    readonly findings: readonly ConversionFinding[];
}

// The mirror of SceneDocumentScreenplayBridge.TryImport: the screens of a slice, read back as one Scene document
// per role. A screen exported from Studio carries its exact document, which is preferred over converting anything;
// otherwise the typed screens are converted, and whatever could not travel is reported rather than dropped.
export const screenDocumentsOfSlice = ({ sliceId, screens, forms = [], roles }: SliceScreens): SliceScreenDocuments => {
    const moduleForms = forms.filter(form => !isCarrierForm(form));
    const ownScreens = roles === undefined ? [] : screens.filter(screen => !roles.has(roleOf(screen.name)));
    const roleScreens = roles === undefined ? screens : screens.filter(screen => !ownScreens.includes(screen));

    const documents: ImportedScreenDocument[] = [];
    const findings: ConversionFinding[] = [];

    for (const [role, group] of groupByRole(roleScreens)) {
        add(role, group, false);
    }

    if (ownScreens.length > 0) {
        add(undefined, ownScreens, true);
    }

    return { documents, findings };

    function add(role: string | undefined, group: readonly ScreenSyntax[], verbatim: boolean): void {
        // A carried document is returned exactly as it was carried, the role it came under included - which is the
        // actor the carrier names, not the role the screen was grouped by.
        const preserved = group.map(screen => carriedDocumentOf(sliceId, screen, forms)).find(document => document !== undefined);
        if (preserved !== undefined) {
            documents.push(preserved);
            return;
        }

        const typed = group.filter(screen => screen.directives.length > 0);
        const empty = group.filter(screen => screen.directives.length === 0);
        for (const screen of empty) {
            // A screen written as `screen <Name> file "<path>"` is such a screen: Screenplay's TypeScript compiler
            // recognizes the reference but does not model it, so a document preserved on one cannot be read here.
            findings.push({ screen: screen.name, message: 'the screen states nothing this board can draw; a screen that keeps its design in a file is read only by the Studio backend' });
        }

        if (typed.length === 0) return;

        const converted = screensToDocument(role ?? '', typed, moduleForms, verbatim);
        findings.push(...converted.findings);
        documents.push({ sliceId, roleName: role, document: JSON.stringify(converted.document) });
    }
};

// Grouped the way the C# bridge groups them: by role, in the order the roles first appear.
const groupByRole = (screens: readonly ScreenSyntax[]): Map<string, ScreenSyntax[]> => {
    const groups = new Map<string, ScreenSyntax[]>();
    for (const screen of screens) {
        const role = roleOf(screen.name);
        const group = groups.get(role);
        if (group) group.push(screen);
        else groups.set(role, [screen]);
    }
    return groups;
};
