// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QuillConstructor } from './QuillConstructor';

/**
 * Loads Quill when the first editor needs it.
 *
 * It resolves to Quill's constructor, or to the module that has it as its default export, so a dynamic
 * import of the quill package is a loader. The host provides it with `QuillLoaderProvider`; the package
 * never imports that package itself, so a host that renders no rich text needs no `quill` to build.
 */
export type QuillLoader = () => Promise<QuillConstructor | { default: QuillConstructor }>;
