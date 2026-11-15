// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { type DesignSession, currentRevisionOf } from '@cratis/scene.design';
import type { TemplateDraftProposal } from '../Host/DesignCanvasHost';

/** The proposal that puts a template designed in template mode into the design-system draft: its current revision, as Screenplay text. */
export function templateDraftProposal(session: DesignSession, template: string): TemplateDraftProposal | undefined {
    if (session.mode !== 'templates') return undefined;
    const revision = currentRevisionOf(session, template);
    return revision === undefined ? undefined : { template, text: revision.text, sessionId: session.id, revisionId: revision.id };
}

/** One proposal for every template of the session: what "propose all to the design system" sends. */
export function templateDraftProposals(session: DesignSession): TemplateDraftProposal[] {
    return session.screens
        .map(entry => templateDraftProposal(session, entry.screen))
        .filter((proposal): proposal is TemplateDraftProposal => proposal !== undefined);
}
