// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`contracts.list.record` would be the `record` feature of `list`). */
export interface ContractsScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const contractsScreenDefinitions: ContractsScreenDefinition[] = [
    { name: 'contracts.list', title: 'Contracts', template: 'ContractsList', order: 0, description: 'Every contract with who it is with, when it ends and what it is worth.' },
    { name: 'contracts.record', title: 'Contract', template: 'ContractPage', parent: 'contracts.list', description: 'One contract: key facts, parties, obligations, amendments and activity.' },
    { name: 'contracts.timeline', title: 'Timeline', template: 'ContractsTimeline', order: 1, description: 'Every live contract on a schedule, in a lane for each counterparty, with its notice dates.' },
    { name: 'contracts.review', title: 'Needs attention', template: 'ContractsReview', order: 2, description: 'What needs your review, your signature or a renewal decision.' },
];
