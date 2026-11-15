// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicationTemplate } from '../../ScreenTemplates/ApplicationTemplate';

// The template is listed when it is added, before its document is read; the shell cannot be planned (or drawn) until the document is known.
export const isShellDocumentRead = (applicationTemplates: readonly ApplicationTemplate[], id: string): boolean => {
    const template = applicationTemplates.find(candidate => candidate.id === id);
    return template !== undefined && (template.template !== undefined || template.slots !== undefined);
};
