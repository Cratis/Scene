// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`approvals.requests.new` is the `new` feature of `requests` in the `approvals` module). */
export interface ApprovalsScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const approvalsScreenDefinitions: ApprovalsScreenDefinition[] = [
    { name: 'approvals.inbox', title: 'Inbox', template: 'ApprovalInbox', order: 0, description: 'The requests waiting for my decision, with Approve, Reject and Request changes on each.' },
    { name: 'approvals.requests', title: 'My requests', template: 'MyRequests', order: 1, description: 'The requests I made, with draft, submitted, approved and rejected as chips.' },
    { name: 'approvals.requests.new', title: 'New request', template: 'NewRequestWizard', parent: 'approvals.requests', description: 'Request type, details, attachments, then review and submit.' },
    { name: 'approvals.requests.page', title: 'Request', template: 'RequestPage', parent: 'approvals.requests', description: 'One request: its summary, its approval chain, its attachments and the comments.' },
    { name: 'approvals.all', title: 'All requests', template: 'AllRequests', order: 2, description: 'Every request in the organisation.' },
    { name: 'approvals.templates', title: 'Templates', template: 'RequestTypes', order: 3, description: 'The request types an organisation offers, for administrators.' },
    { name: 'approvals.templates.edit', title: 'Edit request type', template: 'RequestTypeEditForm', parent: 'approvals.templates', description: 'Edits what a request type asks for and who approves it.' },
];
