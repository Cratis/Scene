// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';

// PrimeReact 10 ships its base styles and one theme per file, and the shell's own stylesheet layers on
// top of them. Loading them here rather than from a story keeps every story looking the same and matches
// what a host does once, at its entry point.
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primeicons/primeicons.css';
import '../shell/layout.css';

const preview: Preview = {
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
