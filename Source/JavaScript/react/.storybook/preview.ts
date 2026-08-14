// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    backgrounds: { default: 'light', values: [{ name: 'light', value: '#ffffff' }, { name: 'dark', value: '#1a1a1a' }] },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};
export default preview;
