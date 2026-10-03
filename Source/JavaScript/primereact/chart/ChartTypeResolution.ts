// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ChartType } from './ChartType';

/**
 * What an authored chart `type` resolved to: a Chart.js type, or the reason it names none.
 *
 * A value that is not a known type is never replaced by a default. Drawing a bar chart for a document that
 * asked for something else hides a data problem behind a plausible picture.
 */
export type ChartTypeResolution =
    | { isValid: true; type: ChartType }
    | { isValid: false; value: unknown; message: string };
