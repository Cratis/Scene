// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useMemo, useState } from 'react';
import { applyNavigationEdits as applyNavigation, type NavigationEdit } from '@cratis/scene.engine';
import { changeDocumentInSession, type ScreenEditSession } from '../Session/EditSession';
import type { SessionCell } from '../Session/SessionCell';
import { navigationOf, withNavigation } from '../DesignMode/Navigation/navigationDocument';
import type { ScreenEditorEnvironment } from './ScreenEditorHost';

const emptyStructure = { modules: [] };

export const useNavigationEditing = (document: ScreenEditSession['document'], cell: SessionCell, commit: (change: (current: ScreenEditSession) => ScreenEditSession) => ScreenEditSession, environment: ScreenEditorEnvironment) => {
    const [navigationModule, setNavigationModule] = useState<string | undefined>(environment.navigation?.module);
    const navigation = useMemo(() => navigationOf(document), [document]);
    const structure = environment.navigation?.structure ?? emptyStructure;

    const applyNavigationEdits = useCallback((edits: NavigationEdit[], label: string) => {
        const outcome = applyNavigation(navigationOf(cell.current.document), edits);
        if (!outcome.applied) return { applied: false, rejected: outcome.rejected };
        commit(current => changeDocumentInSession(current, withNavigation(current.document, outcome.model), label));
        return { applied: true };
    }, [cell, commit]);

    return { navigation, structure, navigationModule, setNavigationModule, applyNavigationEdits };
};
