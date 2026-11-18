// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What a screen said that this bridge could not turn into a Scene document. A finding is never an error: the host
// logs it and draws whatever it draws without a screen, so a model is always openable.
export interface ConversionFinding {
    // The screen the finding is about, under the name the .play document wrote it.
    readonly screen: string;

    // What could not be converted, in the words of the document rather than of the converter.
    readonly message: string;
}

export const conversionFinding = (screen: string, message: string): ConversionFinding => ({ screen, message });
