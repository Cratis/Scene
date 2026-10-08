// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect } from 'react';
import { render } from '@testing-library/react';
import { BindingOutputProvider, useBindingOutputs } from '../renderer';

function PublishingComponent() {
    const outputs = useBindingOutputs('table');
    useEffect(() => {
        outputs.setOutput('selectedItem', { id: 'invoice-1' });
        return () => outputs.clearAll();
    }, [outputs]);
    return null;
}

describe('when component lifecycle changes', () => {
    it('should publish and clear component outputs', () => {
        const seen: Record<string, Record<string, unknown>>[] = [];
        const rendered = render(<BindingOutputProvider onOutputsChanged={outputs => seen.push(outputs)}><PublishingComponent /></BindingOutputProvider>);

        if (!seen.some(outputs => (outputs.table?.selectedItem as { id?: string } | undefined)?.id === 'invoice-1')) throw new Error('The selected item output was not published.');
        rendered.rerender(<BindingOutputProvider onOutputsChanged={outputs => { seen.push(outputs); }}><></></BindingOutputProvider>);
        if (seen.at(-1)!.table !== undefined) throw new Error('The selected item output was not cleared.');
    });
});
