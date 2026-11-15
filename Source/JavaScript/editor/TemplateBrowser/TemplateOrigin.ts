// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Whose a template is. */
export enum TemplateOrigin {
    /** Built for the application: it can be renamed, copied, edited and deleted. */
    Own = 'own',

    /** Provided by a blueprint package: it is read-only, and can be copied to the application's own. */
    Blueprint = 'blueprint',
}
