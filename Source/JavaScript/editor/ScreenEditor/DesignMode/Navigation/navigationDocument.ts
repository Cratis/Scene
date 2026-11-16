// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, type NavigationModel, type OutletNavigationItem, type SceneDocument } from '@cratis/scene.model';
import { ownOutletItems } from '@cratis/scene.engine';

// The navigation of the application, carried by the document being edited as its `navigation` member (spec 3.1): the outlets of navigation - the topbar and
// the sidebar - with their items and the logo, and how each module refines them (Scene 5). Scene edits it with navigation edits, and the editor holds it in the
// same session as everything else, so one undo reverses the last change whichever it was (DM8).
export type NavigationDocument = SceneDocument & { navigation?: NavigationModel };

// The application offers the standard outlets of navigation even when it declares none (Scene's `applicationNavigationOutlets`).
export const emptyNavigation = (): NavigationModel => ({ application: { outlets: [] }, modules: [] });

export const navigationOf = (document: SceneDocument): NavigationModel => (document as NavigationDocument).navigation ?? emptyNavigation();

export const withNavigation = (document: SceneDocument, navigation: NavigationModel): SceneDocument => ({ ...document, navigation } as NavigationDocument);

// The items a level defines itself in an outlet of navigation - the application's defaults, or a module's own items - which is what the author edits there;
// what is inherited is not in them.
export function ownItemsOf(navigation: NavigationModel, module: string | undefined, outlet: string): OutletNavigationItem[] {
    return ownOutletItems(navigation, module, outlet).filter((item): item is OutletNavigationItem => item.kind === OutletItemKind.Navigation);
}
