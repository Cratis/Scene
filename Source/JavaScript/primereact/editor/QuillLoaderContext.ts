// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext } from 'react';
import { QuillLoader } from './QuillLoader';

/** Without a provider there is no loader, and the editor shows its content read-only. */
export const QuillLoaderContext = createContext<QuillLoader | undefined>(undefined);
