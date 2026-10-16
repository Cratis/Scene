// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`hr.directory.record` is the `record` feature of `directory` in the `hr` module). */
export interface HrScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const hrScreenDefinitions: HrScreenDefinition[] = [
    { name: 'hr.directory', title: 'Directory', template: 'HrEmployeeDirectory', order: 0, description: 'Everyone in the company as cards with their photo, title, department and contact.' },
    { name: 'hr.directory.record', title: 'Employee', template: 'HrEmployeePage', parent: 'hr.directory', description: 'One employee: personal and job information, documents and time-off balance.' },
    { name: 'hr.org', title: 'Org chart', template: 'HrOrgChart', order: 1, description: 'Who reports to whom, as a tree.' },
    { name: 'hr.timeoff', title: 'Time off', template: 'HrTimeOffList', order: 2, description: 'Time-off requests to approve, with who is away and for how long.' },
    { name: 'hr.timeoff.balances', title: 'Balances', template: 'HrTimeOffBalanceList', parent: 'hr.timeoff', description: 'What each employee has taken and has left.' },
    { name: 'hr.timeoff.calendar', title: 'Team calendar', template: 'HrTeamCalendar', parent: 'hr.timeoff', description: 'Who is away and when, on a month, a week or as an agenda.' },
    { name: 'hr.onboarding', title: 'Onboarding', template: 'HrOnboardingList', order: 3, description: 'New hires and how far along their onboarding is.' },
    { name: 'hr.onboarding.record', title: 'Onboarding checklist', template: 'HrOnboardingChecklist', parent: 'hr.onboarding', description: 'One new hire\'s checklist: sections of tasks, each with an owner and a due date.' },
];
