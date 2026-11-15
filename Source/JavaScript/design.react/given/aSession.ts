// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { type DesignMode, type DesignSession, type DesignSessionEvent, foldDesignSession } from '@cratis/scene.design';
import { started } from './aStartedDesign';

export const revision = (revisionId: string, screen: string, text: string, extra: Partial<Extract<DesignSessionEvent, { type: 'ScreenRevisionRecorded' }>> = {}): DesignSessionEvent =>
    ({ type: 'ScreenRevisionRecorded', revisionId, screen, text, operations: [], author: 'ada', ...extra });

/** A session folded from the events after its start. */
export const aSession = (events: readonly DesignSessionEvent[], mode: DesignMode = 'screens', templateSet?: string[]): DesignSession =>
    foldDesignSession([started(mode, templateSet), ...events])!;
