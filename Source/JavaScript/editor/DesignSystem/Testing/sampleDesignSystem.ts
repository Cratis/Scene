// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystem, DesignTheme } from '@cratis/scene.model';
import { defaultDesignSystem } from '@cratis/scene.engine';

const light: Record<string, string> = {
    'color.primary': '#1d4ed8',
    'color.on-primary': '#ffffff',
    'color.background': '#f8fafc',
    'color.surface': '#ffffff',
    'color.border': '#cbd5e1',
    'color.hover': '#eff6ff',
    'color.overlay': '#ffffff',
    'color.text': '#0f172a',
    'color.text-muted': '#475569',
    'color.highlight': '#dbeafe',
    'color.on-highlight': '#1e3a8a',
    'color.success': '#166534',
    'color.success-surface': '#dcfce7',
    'color.warning': '#854d0e',
    'color.warning-surface': '#fef9c3',
    'color.danger': '#991b1b',
    'color.danger-surface': '#fee2e2',
    'color.info': '#1e40af',
    'color.info-surface': '#dbeafe',
    'radius.content': '6px',
    'shadow.focus-ring': '0 0 0 3px rgba(29, 78, 216, 0.35)',
    'font.sans': 'Inter, system-ui, sans-serif',
};

const dark: Record<string, string> = {
    ...light,
    'color.primary': '#60a5fa',
    'color.on-primary': '#0b1220',
    'color.background': '#0b1220',
    'color.surface': '#111a2e',
    'color.border': '#334155',
    'color.hover': '#1e293b',
    'color.overlay': '#16213a',
    'color.text': '#f1f5f9',
    'color.text-muted': '#94a3b8',
    'color.highlight': '#1e3a8a',
    'color.on-highlight': '#dbeafe',
    'color.success': '#86efac',
    'color.success-surface': '#14532d',
    'color.warning': '#fde68a',
    'color.warning-surface': '#713f12',
    'color.danger': '#fca5a5',
    'color.danger-surface': '#7f1d1d',
    'color.info': '#93c5fd',
    'color.info-surface': '#1e3a8a',
    'shadow.focus-ring': '0 0 0 3px rgba(96, 165, 250, 0.45)',
};

const theme = (name: string, isDefault: boolean, description: string, overrides: Record<string, string> = {}, darkOverrides: Record<string, string> = {}): DesignTheme => ({
    name,
    isDefault,
    description,
    modes: [
        { mode: 'light', tokens: { ...light, ...overrides } },
        { mode: 'dark', tokens: { ...dark, ...darkOverrides } },
    ],
});

/**
 * A design system to show the editor with: Scene's default roles and components, a default theme and a brand theme, each in a light
 * and a dark mode, a voice and naming, and a contrast rule. One component part is deliberately hard to read in the brand theme, so
 * the editor has something to flag.
 */
export const sampleDesignSystem = (): DesignSystem => ({
    ...defaultDesignSystem,
    name: 'Acme',
    themes: [
        theme('Acme', true, 'The product\'s own look.'),
        theme('Brand', false, 'A lighter variant for partner sites.', { 'color.text': '#94a3b8', 'color.primary': '#38bdf8' }, { 'color.text': '#475569' }),
    ],
    words: {
        voice: { tone: 'Plain and direct. Say what happened, then what to do.', address: 'Second person - "you".' },
        naming: { customer: 'Client', order: 'Booking' },
    },
});
