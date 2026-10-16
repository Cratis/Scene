// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReference } from '../screens/TemplateReference';

/**
 * Application-wide authoring defaults that belong to the profile rather than to a screen.
 */
export interface ProfileDefaults {
    /** The template a newly created screen starts from. Absent when new screens start without one. */
    newScreenTemplate?: TemplateReference;
}

export const ProfileDefaultsPropertyNames: (keyof ProfileDefaults)[] = ['newScreenTemplate'];
