///
/// JBoss, Home of Professional Open Source.
/// Copyright 2023 Red Hat, Inc., and individual contributors
/// as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
/// http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

/** @public */
export type TargetType = 'CONTAINER_IMAGE' | 'RPM';

/** @public */
export interface Target {
  type: TargetType;
  identifier: string;
}

/** @public */
export interface GenerationRequest {
  target: Target;
  handlerProvidedOptions?: Record<string, unknown>;
}

/** @public */
export interface Publisher {
  name: string;
  version: string;
  options?: Record<string, unknown>;
}

/** @public */
export interface GenerationRequestsDTO {
  generationRequests: GenerationRequest[];
  publishers?: Publisher[];
}

/** @public */
export interface RequestFormState {
  targetType: TargetType;
  targetIdentifier: string;
  handlerOptions: Array<{ key: string; value: string }>;
  publishers: Array<{
    name: string;
    version: string;
    options: Array<{ key: string; value: string }>;
  }>;
}

/** @public */
export interface ValidationErrors {
  targetIdentifier?: string;
  publishers?: Record<
    number,
    {
      name?: string;
      version?: string;
    }
  >;
  handlerOptions?: Record<number, string>;
}

/** @public */
export interface SubmissionResult {
  id: string;
}

/** @public */
export const TARGET_TYPE_OPTIONS = [
  {
    value: 'CONTAINER_IMAGE' as TargetType,
    label: 'Container Image',
    description: 'Generate SBOM for a container image from a registry',
    placeholder: 'quay.io/namespace/image:tag',
    example: 'quay.io/pct-security/mequal:latest',
  },
  {
    value: 'RPM' as TargetType,
    label: 'RPM Package',
    description: 'Generate SBOM for an RPM package',
    placeholder: 'name-version-release.arch',
    example: 'bash-5.1.8-6.el9.x86_64',
  },
];

