// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Who authored a template and what must accompany it when it is reused.
 */
export interface TemplateAttribution {
    /** The person or organization that authored the template. */
    author: string;

    /** An absolute `https` URL where the template's source or documentation lives. */
    url?: string;

    /** An attribution notice a license requires to travel with the template, shown by a template browser. */
    notice?: string;
}

export const TemplateAttributionPropertyNames: (keyof TemplateAttribution)[] = ['author', 'url', 'notice'];
