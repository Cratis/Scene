// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';
import '../shell/layout.css';

// The shell and foundation render without a widget-library provider. Optional widget stories own theirs.
const preview: Preview = {
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
