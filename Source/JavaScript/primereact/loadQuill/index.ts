// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QuillLoader } from '../editor/QuillLoader';

/**
 * The ready-made Quill loader: `() => import('quill')`.
 *
 * This entry point is the only place the package names `quill`, and it is separate from the package root on
 * purpose. A host that renders editable rich text imports it, installs the `quill` peer dependency and
 * Quill's stylesheet, and passes it to `QuillLoaderProvider`; every other host never resolves `quill`.
 *
 * ```tsx
 * import 'quill/dist/quill.snow.css';
 * import { QuillLoaderProvider } from '@cratis/scene.primereact';
 * import { loadQuill } from '@cratis/scene.primereact/quill';
 *
 * <QuillLoaderProvider loader={loadQuill}>{screen}</QuillLoaderProvider>
 * ```
 */
export const loadQuill: QuillLoader = () => import('quill') as unknown as ReturnType<QuillLoader>;
