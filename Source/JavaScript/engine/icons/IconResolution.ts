// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconEntry, IconReference } from '@cratis/scene.model';
import { IconDiagnostic } from './IconDiagnostic';
import { ResolvedIconLibrary } from './ResolvedIconLibrary';

/**
 * The outcome of looking one reference up in the effective catalog: either the icon it names, or the
 * precise reason there is none.
 */
export type IconResolution =
    | {
          /** The reference resolved. */
          isResolved: true;
          reference: IconReference;
          library: ResolvedIconLibrary;
          entry: IconEntry;
      }
    | {
          /** The reference did not resolve. */
          isResolved: false;
          reference: IconReference;
          diagnostic: IconDiagnostic;
      };
