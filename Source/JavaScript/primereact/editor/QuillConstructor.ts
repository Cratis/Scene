// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QuillInstance } from './QuillInstance';
import { QuillOptions } from './QuillOptions';

/** Quill's constructor, as this package calls it. */
export type QuillConstructor = new (container: HTMLElement, options: QuillOptions) => QuillInstance;
