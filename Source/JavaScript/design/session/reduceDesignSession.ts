// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignSession, Revision } from './DesignSession';
import { DesignSessionEvent, ScreenRevisionRecorded } from './DesignSessionEvents';

function withRevision(session: DesignSession, revision: Revision): DesignSession {
    if (session.revisions.some(existing => existing.id === revision.id)) return session;
    const known = session.screens.some(entry => entry.screen === revision.screen);
    return {
        ...session,
        revisions: [...session.revisions, revision],
        screens: known
            ? session.screens.map(entry => entry.screen === revision.screen ? { ...entry, currentRevision: revision.id } : entry)
            : [...session.screens, { screen: revision.screen, currentRevision: revision.id }],
    };
}

const currentIdOf = (session: DesignSession, screen: string): string | undefined => session.screens.find(entry => entry.screen === screen)?.currentRevision;

function recorded(session: DesignSession, event: ScreenRevisionRecorded): DesignSession {
    const revision: Revision = { id: event.revisionId, screen: event.screen, text: event.text, operations: event.operations, author: event.author };
    if (event.prompt !== undefined) revision.prompt = event.prompt;
    if (event.turnId !== undefined) revision.turnId = event.turnId;
    if (event.designSystemVersion !== undefined) revision.designSystemVersion = event.designSystemVersion;
    const basis = event.basisRevisionId ?? currentIdOf(session, event.screen);
    if (basis !== undefined) revision.basisRevision = basis;
    if (event.restoredFromRevisionId !== undefined) revision.restoredFrom = event.restoredFromRevisionId;
    if (event.originSessionId !== undefined && event.originRevisionId !== undefined) revision.origin = { sessionId: event.originSessionId, revisionId: event.originRevisionId };
    return withRevision(session, revision);
}

/**
 * Folds one event into a session. Pure and deterministic - ids come with the events - so a host's Chronicle reducer and a client replaying events
 * agree. An event that does not apply (a revision restored from one that is not there, a variation chosen twice) leaves the session as it is.
 */
export function reduceDesignSession(session: DesignSession | undefined, event: DesignSessionEvent): DesignSession | undefined {
    if (event.type === 'DesignSessionStarted') {
        if (session !== undefined) return session;
        const started: DesignSession = {
            id: event.sessionId, subject: event.subject, mode: event.mode, startedBy: event.startedBy,
            screens: [], revisions: [], variationGroups: [], tweaks: [], comments: [],
        };
        if (event.templateSet !== undefined && event.templateSet.length > 0) started.templateSet = [...event.templateSet];
        if (event.seededFromSessionId !== undefined) started.seededFrom = event.seededFromSessionId;
        return started;
    }
    if (session === undefined) return undefined;
    switch (event.type) {
        case 'DesignTemplateSetChanged': {
            const { templateSet: _previous, ...rest } = session;
            return event.templateSet === undefined || event.templateSet.length === 0 ? rest : { ...rest, templateSet: [...event.templateSet] };
        }
        case 'ScreenRevisionRecorded':
            return recorded(session, event);
        case 'ScreenRemovedFromDesign':
            return { ...session, screens: session.screens.filter(entry => entry.screen !== event.screen) };
        case 'ScreensReordered': {
            const known = [...new Set(event.screens)].filter(name => session.screens.some(entry => entry.screen === name));
            const order = [...known, ...session.screens.map(entry => entry.screen).filter(name => !known.includes(name))];
            return { ...session, screens: order.map(name => session.screens.find(entry => entry.screen === name)!) };
        }
        case 'ScreenReverted': {
            const target = session.revisions.find(revision => revision.id === event.toRevisionId && revision.screen === event.screen);
            if (target === undefined) return session;
            const revision: Revision = { id: event.revisionId, screen: event.screen, text: target.text, operations: [], author: event.author, restoredFrom: target.id };
            if (event.turnId !== undefined) revision.turnId = event.turnId;
            if (target.designSystemVersion !== undefined) revision.designSystemVersion = target.designSystemVersion;
            const basis = currentIdOf(session, event.screen);
            if (basis !== undefined) revision.basisRevision = basis;
            return withRevision(session, revision);
        }
        case 'VariationsProposed': {
            if (session.variationGroups.some(group => group.id === event.groupId)) return session;
            const group = { id: event.groupId, screen: event.screen, candidates: event.candidates.map(candidate => ({ id: candidate.id, text: candidate.text })), ...(event.prompt === undefined ? {} : { prompt: event.prompt }) };
            return { ...session, variationGroups: [...session.variationGroups, group] };
        }
        case 'VariationChosen': {
            const group = session.variationGroups.find(candidate => candidate.id === event.groupId);
            const chosen = group?.candidates.find(candidate => candidate.id === event.candidateId);
            if (group === undefined || chosen === undefined || group.chosen !== undefined) return session;
            const revision: Revision = { id: event.revisionId, screen: group.screen, text: chosen.text, operations: [], author: event.author };
            if (group.prompt !== undefined) revision.prompt = group.prompt;
            if (event.turnId !== undefined) revision.turnId = event.turnId;
            const basis = currentIdOf(session, group.screen);
            if (basis !== undefined) revision.basisRevision = basis;
            const marked = { ...session, variationGroups: session.variationGroups.map(candidate => candidate.id === group.id ? { ...candidate, chosen: chosen.id } : candidate) };
            return withRevision(marked, revision);
        }
        case 'TweaksProposed': {
            const added = event.tweaks.filter(tweak => !session.tweaks.some(existing => existing.id === tweak.id)).map(tweak => ({
                id: tweak.id, label: tweak.label, kind: tweak.kind, address: tweak.address, ...(tweak.options === undefined ? {} : { options: tweak.options }),
                ...(event.screen === undefined ? {} : { screen: event.screen }), dismissed: false,
            }));
            return { ...session, tweaks: [...session.tweaks, ...added] };
        }
        case 'TweakDismissed':
            return { ...session, tweaks: session.tweaks.map(tweak => tweak.id === event.tweakId ? { ...tweak, dismissed: true } : tweak) };
        case 'CommentAdded': {
            if (session.comments.some(comment => comment.id === event.commentId)) return session;
            const comment = {
                id: event.commentId, screen: event.screen, text: event.text, author: event.author, resolved: false,
                ...(event.elementId === undefined || event.elementId === '' ? {} : { elementId: event.elementId }),
            };
            return { ...session, comments: [...session.comments, comment] };
        }
        case 'CommentPinned':
            return { ...session, comments: session.comments.map(comment => comment.id === event.commentId ? { ...comment, position: { x: event.x, y: event.y } } : comment) };
        case 'CommentResolved':
            return { ...session, comments: session.comments.map(comment => comment.id === event.commentId ? { ...comment, resolved: true } : comment) };
        case 'CommentReopened':
            return { ...session, comments: session.comments.map(comment => comment.id === event.commentId ? { ...comment, resolved: false } : comment) };
    }
}

/** Folds events, in order, into the session they describe. */
export const foldDesignSession = (events: readonly DesignSessionEvent[]): DesignSession | undefined =>
    events.reduce<DesignSession | undefined>((session, event) => reduceDesignSession(session, event), undefined);
