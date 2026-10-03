// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SafeElement } from './SafeElement';

/** Authored HTML after the allowlist: text, or an element that is safe to render. */
export type SafeNode = string | SafeElement;
