// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Fragment, useEffect, useMemo, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { isGranted, MatrixGrant, readGrants, readPermissions, readRoles, sectionsOf, setGrant } from './permissionModel';
import { readPermissionRule } from './PermissionRule';
import { FoundationFrame } from './StateFrame';

/**
 * The `permissionMatrix` component: roles across, permissions down, a checkbox where they meet.
 *
 * `roles` and `permissions` (optionally grouped) give the axes and `grants` - rows of `role` and `permission` - what is held; a grant of a role
 * or permission that does not exist is ignored. Each box is named in words ("Grant Edit deals to Sales") and every header is a real header
 * cell, so a screen reader announces the row and column of the box it is on. Changes are published as the `value` output - the grants,
 * in the same shape - for the screen to save. With `editPermission` not enabled the matrix is read-only and each cell says "Allowed" or
 * "Not allowed" in words and by icon. `focusRole` names a role to show alone - a roles list's chosen row, bound in - and the matrix shows every role while none is named. Wide matrices scroll sideways inside a keyboard-focusable region, keeping the permission column in view.
 */
export function PermissionMatrix({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const allRoles = useMemo(() => readRoles(element.properties.roles), [element.properties.roles]);
    const focusRole = typeof element.properties.focusRole === 'string' ? element.properties.focusRole : '';
    // A role that is asked for and exists is the only column shown; one that is not asked for, or that does not exist, shows every role rather than nothing.
    const roles = useMemo(() => (allRoles.some(role => role.id === focusRole) ? allRoles.filter(role => role.id === focusRole) : allRoles), [allRoles, focusRole]);
    const permissions = useMemo(() => readPermissions(element.properties.permissions), [element.properties.permissions]);
    const supplied = useMemo(() => readGrants(element.properties.grants, allRoles, permissions), [element.properties.grants, allRoles, permissions]);
    const suppliedKey = JSON.stringify(supplied);
    const [grants, setGrants] = useState<MatrixGrant[]>(supplied);
    const strings = readFoundationStrings(element);
    const state = readComponentState(element, roles.length > 0 && permissions.length > 0);
    const readOnly = readPermissionRule(element, 'editPermission') !== 'enabled';
    const sections = useMemo(() => sectionsOf(permissions), [permissions]);

    useEffect(() => setGrants(supplied), [suppliedKey]);
    useValueOutput(bindingOutputs, grants);

    return (
        <FoundationFrame element={element} interactions={interactions} name='permission-matrix' state={state} skeleton={[100, 100, 100, 100]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && (
                <div className='foundation-matrix-scroll' role='region' tabIndex={0} aria-label={strings.matrixScroll}>
                    <table className='foundation-matrix'>
                        <thead>
                            <tr>
                                <th scope='col'>{strings.matrixPermission}</th>
                                {roles.map(role => <th key={role.id} scope='col'>{role.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map((section, index) => (
                                <Fragment key={section.group ?? `ungrouped-${index}`}>
                                    {section.group && (
                                        <tr className='foundation-matrix-group'><th scope='colgroup' colSpan={roles.length + 1}>{section.group}</th></tr>
                                    )}
                                    {section.permissions.map(permission => (
                                        <tr key={permission.id}>
                                            <th scope='row'>{permission.label}</th>
                                            {roles.map(role => {
                                                const granted = isGranted(grants, role.id, permission.id);
                                                return (
                                                    <td key={role.id} data-granted={granted}>
                                                        {readOnly ? (
                                                            <span className='foundation-matrix-state'>
                                                                <FoundationIcon name={granted ? 'check' : 'minus'} />
                                                                <span className='foundation-visually-hidden'>{granted ? strings.matrixAllowed : strings.matrixDenied}</span>
                                                            </span>
                                                        ) : (
                                                            <input type='checkbox' checked={granted} aria-label={formatText(strings.matrixGrant, { permission: permission.label, role: role.label })}
                                                                onChange={event => { setGrants(setGrant(grants, role.id, permission.id, event.target.checked)); interactions?.onChange?.(); }} />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </FoundationFrame>
    );
}
