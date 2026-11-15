// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemProposal } from '@cratis/scene.design';
import type { DesignStringKey } from '../Host/DesignCanvasHost';
import './ProposalList.css';

export interface ProposalListProps {
    proposals: readonly DesignSystemProposal[];
    strings: Record<DesignStringKey, string>;
    onPropose(index: number, proposal: DesignSystemProposal): void;
    onDismiss(index: number): void;
}

/**
 * What the design system lacks for what the designer tried - a token, a variant, a word, a component. The canvas edits screens only; each need
 * can be proposed into the design-system draft, where it follows the system's own review and activation.
 */
export const ProposalList = ({ proposals, strings, onPropose, onDismiss }: ProposalListProps) => proposals.length === 0 ? null : (
    <ul className='design-proposals' aria-label={strings.proposeToSystem}>
        {proposals.map((proposal, index) => (
            <li key={`${proposal.kind}-${proposal.summary}-${index}`} data-proposal={proposal.kind}>
                <span>{proposal.summary}</span>
                <span className='design-proposals__actions'>
                    <button type='button' onClick={() => onPropose(index, proposal)}>{strings.proposeToSystem}</button>
                    <button type='button' aria-label={`Dismiss: ${proposal.summary}`} onClick={() => onDismiss(index)}>×</button>
                </span>
            </li>
        ))}
    </ul>
);
