// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, useContext } from 'react';
import type { CrashReportRequest } from './crashReport';

// Files a crash: the host opens its own report dialog, prefilled with the request.
export type CrashReporter = (request: CrashReportRequest) => void;

const CrashReporterContext = createContext<CrashReporter | undefined>(undefined);

// Hands every crash panel below it the host's way of reporting. With a reporter the panel does not take over the page: it
// stays inside the box it guards, and the host's report dialog opens by itself with the technical detail already in it.
// Without one the panel falls back to covering the page and opening a prefilled issue form in a new tab.
export const CrashReporterProvider = CrashReporterContext.Provider;

// The host's crash reporter, or undefined where nothing below a provider is reporting.
export const useCrashReporter = (): CrashReporter | undefined => useContext(CrashReporterContext);
