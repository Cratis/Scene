// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Theme } from '@cratis/scene.model';

// The classes a profile's theme puts on the root its screen is drawn in so that Cratis Components' controls - which key their light and dark
// tokens to these classes, not to `color-scheme` - agree with the theme: `cratis-theme` makes the root a scope of its own, and the scheme
// class says which set it takes, whatever the page around it is. A theme that says nothing about its scheme adds nothing.
export function profileColorSchemeClasses(theme: Pick<Theme, 'isDark'> | undefined): string {
    if (theme === undefined) return '';
    return theme.isDark ? 'cratis-theme cratis-dark' : 'cratis-theme cratis-light';
}
