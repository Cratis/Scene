// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// One thing wrong with the wiring of what is previewed: a Screenplay diagnostic about it, or the check for text that is bound to nothing.
export interface LensProblem {
    code: string;
    message: string;
}

// The code the lens gives the text bound to nothing; it is Studio's check, so it has no PLAY code.
export const unboundTextCode = 'STUDIO-UNBOUND-TEXT';
