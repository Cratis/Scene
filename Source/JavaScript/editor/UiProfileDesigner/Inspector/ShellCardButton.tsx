// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { navigationModes, type ShellCard } from '@cratis/scene.engine';
import { formatMessage } from '../../UiProfile/formatMessage';

export interface ShellCardButtonProps {
    card: ShellCard;
    selected: boolean;
    startsText: string;
    onChoose: (card: ShellCard) => void;
}

export const ShellCardButton = ({ card, selected, startsText, onChoose }: ShellCardButtonProps) => (
    <button type='button' role='radio' aria-checked={selected} data-selected={selected} onClick={() => onChoose(card)}>
        <span className='studio-inspector-card__title'>{card.title}</span>
        <span className='studio-inspector-card__meta'>{card.description}</span>
        <span className='studio-inspector-card__note'>{formatMessage(startsText, { mode: navigationModes.find(info => info.id === card.defaultMenuMode)!.label })}</span>
    </button>
);
