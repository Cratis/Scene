// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignSubjectKind } from './DesignSubjectKind';

/**
 * The thing a design session is keyed to. A session knows nothing about what a story, an issue or an application is; the host
 * names the subject, so the same session serves every host and several subjects in one host.
 */
export interface DesignSubject {
    kind: `${DesignSubjectKind}`;
    id: string;
}

export const DesignSubjectPropertyNames: (keyof DesignSubject)[] = ['kind', 'id'];

/** The subject's stable key: kind and id, such as `story:7f2`. */
export const designSubjectKey = (subject: DesignSubject): string => `${subject.kind}:${subject.id}`;
