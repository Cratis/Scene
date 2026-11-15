// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import type { SceneScreenDraftAgent } from './SceneScreenDraft';
import { SceneScreenDraftReview } from './SceneScreenDraftReview';

export interface SceneScreenDraftToolbarProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    agent?: SceneScreenDraftAgent;
    readOnly: boolean;
    authoringTemplate?: string;
    onPreview?: (document: SceneDocument, fitsDialog: boolean) => void;
    previewing?: boolean;
}

// Offered for ordinary writable screens only; a read-only screen or a template being authored shows nothing.
export const SceneScreenDraftToolbar = ({ controller, environment, strings, agent, readOnly, authoringTemplate, onPreview, previewing }: SceneScreenDraftToolbarProps) =>
    !readOnly && !authoringTemplate && agent
        ? <SceneScreenDraftReview controller={controller} environment={environment} agent={agent} onPreview={onPreview} strings={strings.draft} previewing={previewing} />
        : null;
