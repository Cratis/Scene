import fs from 'node:fs';
import { diagnosePreview } from '../diagnosePreview';
import { effectiveShellOf, templatePoolFor } from '../composeApplication';
import { previewProfile } from '../previewProfile';
import { resolveScreenTemplates } from '@cratis/scene.engine';

describe('replay', () => {
    const raw = JSON.parse(fs.readFileSync('/tmp/demo-assembler/cap-1.json', 'utf8')).response;
    const scene = JSON.parse(raw.scene);
    const profile = previewProfile(scene.uiProfiles, ['PrimeReact']);
    const document: any = { layouts: scene.layouts, screenTemplates: scene.screenTemplates, dialogTemplates: scene.dialogTemplates, screens: scene.screens, exposures: [], instanceContributions: [], uiProfiles: [profile], themes: scene.themes ?? [] };
    const screen = scene.screens.find((s: any) => s.screenTemplate === 'SideSummary');
    const shell = effectiveShellOf(document, screen, { profile });
    it('prints', () => {
        console.log('SCREEN', screen.name, screen.layout);
        console.log('SHELL', shell.name, shell.origin, JSON.stringify(shell.diagnostics));
        const pool = templatePoolFor(document, screen, { profile });
        console.log('POOL', pool.map(t => t.name).join(','));
    });
});
