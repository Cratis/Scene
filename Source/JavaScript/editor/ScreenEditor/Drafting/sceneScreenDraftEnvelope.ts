// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isRecord, hasOnlyKeys } from './sceneScreenDraftValues';

export interface DraftEnvelope {
    reply: string;
    edits: unknown[];
}

const validReply = (reply: unknown): reply is string => typeof reply === 'string' && reply.length <= 10_000;
const withinLimits = (count: number) => count >= 1 && count <= 100;
const validEdits = (edits: unknown): edits is unknown[] => Array.isArray(edits) && withinLimits(edits.length);

// The wire shape only; each edit is validated one by one by the orchestrator.
export function readDraftEnvelope(envelope: unknown): DraftEnvelope {
    if (!isRecord(envelope) || !hasOnlyKeys(envelope, ['reply', 'edits'])) throw invalid();
    if (!validReply(envelope.reply) || !validEdits(envelope.edits)) throw invalid();
    return { reply: envelope.reply, edits: envelope.edits };
}

const invalid = () => new Error('The proposal must contain an explanation and between 1 and 100 supported edits.');
