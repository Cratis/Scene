// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Command, CommandValidator } from '@cratis/arc/commands';
import { PropertyDescriptor } from '@cratis/arc/reflection';

class NoteValidator extends CommandValidator<{ subject: string }> {
    constructor() {
        super();
        this.ruleFor(command => command.subject).notEmpty().withMessage('Subject is required');
    }
}

/** Synthetic proxy: execution, serialization and validation are all native Arc. */
export class RecordNote extends Command {
    readonly route: string = '/synthetic/notes';
    readonly propertyDescriptors = [
        new PropertyDescriptor('subject', String),
        new PropertyDescriptor('internalValue', String, true),
    ];
    readonly requestParameters = [];
    readonly validation = new NoteValidator();
    subject = '';
    internalValue = 'proxy default';
    constructor() { super(Object, false); }
}

export class RestrictedNote extends RecordNote {
    readonly roles = ['note-writer'];
}

export function successfulResponse() {
    return { status: 200, json: async () => ({
        isSuccess: true, isAuthorized: true, isValid: true, hasExceptions: false,
        validationResults: [], exceptionMessages: [], exceptionStackTrace: '', response: {},
    }) } as Response;
}
