// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { interactive, provideBrowserApis } from './given';

const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const topbar = () => screen.getByRole('navigation', { name: 'Modules' });
const labels = (nav: HTMLElement) => Array.from(nav.querySelectorAll('a')).map(item => item.textContent?.trim());
const page = () => document.querySelector('[data-scene-outlet="primary"]')!;
const onPage = () => page().getAttribute('data-scene-screen');
const headings = () => Array.from(page().querySelectorAll('h1')).map(heading => heading.textContent);
const columnOf = (label: string) => Array.from(document.querySelectorAll('.foundation-board-column')).find(column => column.querySelector('h3')!.textContent === label)!;
const cardsIn = (label: string) => Array.from(columnOf(label).querySelectorAll('.foundation-board-card strong')).map(title => title.textContent);

// Spec Part B 3.6 as an application: the navigation, the screens a user moves between, what the buttons, rows and cards do, and what the data looks like.
describe('when using the Project and Task Tracker application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on the projects', () => {
        beforeEach(() => { render(interactive('projects.list')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Projects']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Projects');
        });

        it('should list the places of a team in the sidebar', () => labels(sidebar()).should.deep.equal(['Projects', 'My tasks', 'Board']));

        it('should put the two ways of seeing the board beneath it once it is opened', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Expand Board' }));
            labels(sidebar()).should.deep.equal(['Projects', 'My tasks', 'Board', 'By status', 'By person']);
        });

        it('should show each project as a card with its owner, a progress bar, its due date and its status', () => {
            const cards = page().querySelectorAll('.foundation-card-row');
            cards.length.should.equal(8);
            page().querySelectorAll('progress').length.should.equal(8);
            cards[0].textContent!.should.contain('Website relaunch').and.contain('Amelia Hart').and.contain('72%').and.contain('On track');
        });

        it('should open the new project dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New project' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('ProjectQuickCreateProject');
        });
    });

    describe('and the user chooses a project', () => {
        beforeEach(() => {
            render(interactive('projects.list'));
            fireEvent.click(page().querySelector('.foundation-card-row input[type="radio"]')!);
        });

        it('should open the project page with its key facts, its task list and its members', () => {
            onPage()!.should.equal('projects.record');
            headings().should.deep.equal(['Website relaunch']);
            page().textContent!.should.contain('Open tasks').and.contain('Days left').and.contain('Members').and.contain('Fix the checkout bug').and.contain('Project lead');
        });

        it('should open a task from the list in a side sheet and close it again', () => {
            fireEvent.click(within(page() as HTMLElement).getAllByRole('radio', { name: /Select Fix the checkout bug/ })[0]);
            const sheet = screen.getByRole('dialog');
            sheet.getAttribute('data-scene-dialog')!.should.equal('ProjectTaskSheet');
            sheet.textContent!.should.contain('Fix the checkout bug').and.contain('Subtasks').and.contain('Found it: the discount is rounded after tax.');
            fireEvent.click(within(sheet).getByRole('button', { name: 'Close' }));
            (screen.queryByRole('dialog') === null).should.equal(true);
        });
    });

    describe('and the user goes to my tasks', () => {
        beforeEach(() => { render(interactive('projects.mytasks')); });

        it('should group the tasks by when they are due, soonest first', () => {
            Array.from(page().querySelectorAll('.foundation-list-group h3 button')).map(button => button.textContent).should.deep.equal(['Overdue', 'Today', 'This week', 'Later']);
        });

        it('should open the task that is chosen in a side sheet', () => {
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('ProjectTaskSheet');
        });

        it('should open the new task dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New task' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('ProjectQuickCreateTask');
        });
    });

    describe('and the user goes to the board', () => {
        beforeEach(() => { render(interactive('projects.board')); });

        it('should show a column for each status', () => {
            Array.from(document.querySelectorAll('.foundation-board-column h3')).map(heading => heading.textContent).should.deep.equal(['To do', 'In progress', 'Review', 'Done']);
        });

        it('should show each task as a card with its assignee, project, due date and priority', () => {
            const card = columnOf('In progress').querySelector('.foundation-board-card')!;
            card.textContent!.should.contain('Fix the checkout bug').and.contain('Amelia Hart').and.contain('Website relaunch').and.contain('14 Oct').and.contain('High');
        });

        it('should move a task to the status it is moved to, announcing it', () => {
            cardsIn('Review').should.not.include('Fix the checkout bug');
            fireEvent.change(screen.getByLabelText('Move Fix the checkout bug'), { target: { value: 'review' } });
            cardsIn('Review').should.include('Fix the checkout bug');
            cardsIn('In progress').should.not.include('Fix the checkout bug');
            document.querySelector('[role="status"]')!.textContent!.should.contain('Fix the checkout bug');
        });
    });

    describe('and the user goes to the board by person', () => {
        beforeEach(() => { render(interactive('projects.board.lanes')); });

        it('should make a lane for each person across the same four columns', () => {
            const lanes = Array.from(document.querySelectorAll('.foundation-board-lane-title')).map(title => title.firstChild!.textContent);
            lanes.should.deep.equal(['Amelia Hart', 'Oliver Reed', 'Priya Nair', 'Daniel Cho', 'Leah Morgan']);
            document.querySelectorAll('.foundation-board-lane')[0].querySelectorAll('.foundation-board-column').length.should.equal(4);
        });

        it('should move a task between statuses within its lane', () => {
            fireEvent.change(screen.getByLabelText('Move Fix the checkout bug'), { target: { value: 'review' } });
            const lane = document.querySelectorAll('.foundation-board-lane')[0];
            Array.from(lane.querySelectorAll('.foundation-board-column')).find(column => column.querySelector('h4')!.textContent === 'Review')!.textContent!.should.contain('Fix the checkout bug');
        });
    });
});
