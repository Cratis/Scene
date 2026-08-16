// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';

// The order matters and mirrors what an application does. PrimeReact's structural CSS and the initial
// compiled theme come first; `primeReactTheme.css` then bridges that theme's variables onto the Scene
// tokens every wrapper reads. The theme-switching story replaces the theme stylesheet at runtime through
// `usePrimeReactTheme`, exactly as an application would.
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import '../primeReactTheme.css';
import './preview.css';

const preview: Preview = {
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
