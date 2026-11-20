// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenDirectiveSyntax } from './Syntax/ScreenplaySyntax';

// Screenplay's TypeScript compiler recognizes an 'on <trigger>' block and a 'uses <Behavior>' attachment but does
// not model what is in them - it keeps only that one is there, so a screen's directives stay in the order they were
// written. There is therefore nothing here to turn into a Scene behavior, and a screen that has one says so through
// a finding rather than quietly losing it.
export const isBehaviorDirective = (directive: ScreenDirectiveSyntax): boolean =>
    directive.kind === 'ScreenBehaviorSyntax' || directive.kind === 'ScreenUsesBehaviorSyntax';
