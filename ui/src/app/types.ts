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

// ============================================================================
// Payload Interfaces - Define the structure of data received from the API
// ============================================================================

export interface SbomerGenerationPayload {
  id: string;
  status: string;
  created: string;
  updated?: string;
  finished?: string;
  requestId: string;
  metadata?: Record<string, string>;
  generatorName: string;
  generatorVersion: string;
  generatorOptions?: Record<string, unknown>;
  targetType: string;
  targetIdentifier: string;
  generationSbomUrls?: string[];
  finalSbomUrls?: string[];
  enhancements?: SbomerEnhancementPayload[];
  childEnhancementsStatus?: string;
}

export interface SbomerEnhancementPayload {
  id: string;
  status: string;
  created: string;
  updated?: string;
  finished?: string;
  generationId?: string;
  requestId?: string;
  enhancerName?: string;
  enhancerVersion?: string;
  enhancementSbomUrls?: string[];
  finalSbomUrls?: string[];
}

export interface GenerationRunRecordPayload {
  id: string;
  generationId: string;
  attemptNumber: number;
  state: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  errorResult?:
    | 'SUCCESS'
    | 'ERR_GENERAL'
    | 'ERR_CONFIG_INVALID'
    | 'ERR_CONFIG_MISSING'
    | 'ERR_INDEX_INVALID'
    | 'ERR_GENERATION'
    | 'ERR_POST'
    | 'ERR_OOM'
    | 'ERR_SYSTEM'
    | 'ERR_MULTI';
  upstreamReason?: string;
  startTime: string;
  completionTime?: string;
}

export interface EnhancementRunRecordPayload {
  id: string;
  enhancementId: string;
  attemptNumber: number;
  state: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  errorResult?: 'SUCCESS' | 'ERR_GENERAL' | 'ERR_CONFIG_INVALID' | 'ERR_ENHANCEMENT';
  upstreamReason?: string;
  startTime: string;
  completionTime?: string;
}

export interface SbomerManifestPayload {
  id: string;
  created: string;
  metadata?: Record<string, string>;
}

export interface SbomerPublisherPayload {
  id: string;
  status: string;
  created: string;
  updated?: string;
  finished?: string;
  result?: string;
  reason?: string;
  requestId: string;
  publisherName?: string;
  publisherVersion?: string;
}

export interface SbomerEventPayload {
  id: string;
  creationDate: string;
  status: string;
  generationRecords?: SbomerGenerationPayload[];
  publisherRecords?: SbomerPublisherPayload[];
}

// ============================================================================
// Error Response Types
// ============================================================================

/** @public */
export type SbomerErrorResponse = {
  result?: string;
  reason?: string;
  status?: number;
  category?: string;
  correlationId?: string;
  timestamp?: string;
};

declare global {
  interface Window {
    _env_?: {
      API_URL?: string;
    };
  }
}

/** @public */
export type SbomerStats = {
  version: string;
  uptime: string;
  uptimeMillis: number;
  messaging: {
    pncConsumer: {
      received: number;
      processed: number;
      skipped: number;
    };
    errataConsumer: {
      received: number;
      processed: number;
      skipped: number;
    };
    producer: {
      nacked: number;
      acked: number;
    };
  };
  resources: {
    generations: {
      total: number;
      inProgress: number;
    };
    manifests: {
      total: number;
    };
  };
};

export class SbomerGeneration {
  public id: string;
  public generatorName: string;
  public generatorVersion: string;
  public generatorOptions: Record<string, unknown>;
  public created: Date;
  public updated?: Date;
  public finished?: Date;
  public status: string;
  public requestId: string;
  public targetType: string;
  public targetIdentifier: string;
  public generationSbomUrls?: string[];
  public finalSbomUrls?: string[];
  public enhancements: SbomerEnhancement[];
  public metadata?: Map<string, string>;
  public childEnhancementsStatus?: string;

  constructor(payload: SbomerGenerationPayload) {
    this.id = payload.id;
    this.status = payload.status;

    this.created = new Date(payload.created);
    this.updated = payload.updated ? new Date(payload.updated) : undefined;
    this.finished = payload.finished ? new Date(payload.finished) : undefined;

    this.requestId = payload.requestId;
    this.metadata = payload.metadata ? new Map(Object.entries(payload.metadata)) : undefined;
    this.generatorName = payload.generatorName;
    this.generatorVersion = payload.generatorVersion;
    this.generatorOptions = payload.generatorOptions || {};
    this.targetType = payload.targetType;
    this.targetIdentifier = payload.targetIdentifier;
    this.generationSbomUrls = payload.generationSbomUrls || [];
    this.finalSbomUrls = payload.finalSbomUrls || [];
    this.enhancements = payload.enhancements
      ? payload.enhancements.map((enhancement) => new SbomerEnhancement(enhancement))
      : [];
    this.childEnhancementsStatus = payload.childEnhancementsStatus;
  }
}

export class SbomerEnhancement {
  public id: string;
  public status: string;
  public created: Date;
  public updated?: Date;
  public finished?: Date;
  public generationId?: string;
  public requestId?: string;
  public enhancerName?: string;
  public enhancerVersion?: string;
  public enhancementSbomUrls?: string[];
  public finalSbomUrls?: string[];

  constructor(payload: SbomerEnhancementPayload) {
    this.id = payload.id;
    this.status = payload.status;

    this.created = new Date(payload.created);
    this.updated = payload.updated ? new Date(payload.updated) : undefined;
    this.finished = payload.finished ? new Date(payload.finished) : undefined;

    this.generationId = payload.generationId;
    this.requestId = payload.requestId;
    this.enhancerName = payload.enhancerName;
    this.enhancerVersion = payload.enhancerVersion;
    this.enhancementSbomUrls = payload.enhancementSbomUrls || [];
    this.finalSbomUrls = payload.finalSbomUrls || [];
  }
}

export class GenerationRunRecord {
  public id: string;
  public generationId: string;
  public attemptNumber: number;
  public state: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  public errorResult?:
    | 'SUCCESS'
    | 'ERR_GENERAL'
    | 'ERR_CONFIG_INVALID'
    | 'ERR_CONFIG_MISSING'
    | 'ERR_INDEX_INVALID'
    | 'ERR_GENERATION'
    | 'ERR_POST'
    | 'ERR_OOM'
    | 'ERR_SYSTEM'
    | 'ERR_MULTI';
  public upstreamReason?: string;
  public startTime: Date;
  public completionTime?: Date;

  constructor(payload: GenerationRunRecordPayload) {
    this.id = payload.id;
    this.generationId = payload.generationId;
    this.attemptNumber = payload.attemptNumber;
    this.state = payload.state;
    this.errorResult = payload.errorResult;
    this.upstreamReason = payload.upstreamReason;
    this.startTime = new Date(payload.startTime);
    this.completionTime = payload.completionTime ? new Date(payload.completionTime) : undefined;
  }
}

export class EnhancementRunRecord {
  public id: string;
  public enhancementId: string;
  public attemptNumber: number;
  public state: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  public errorResult?: 'SUCCESS' | 'ERR_GENERAL' | 'ERR_CONFIG_INVALID' | 'ERR_ENHANCEMENT';
  public upstreamReason?: string;
  public startTime: Date;
  public completionTime?: Date;

  constructor(payload: EnhancementRunRecordPayload) {
    this.id = payload.id;
    this.enhancementId = payload.enhancementId;
    this.attemptNumber = payload.attemptNumber;
    this.state = payload.state;
    this.errorResult = payload.errorResult;
    this.upstreamReason = payload.upstreamReason;
    this.startTime = new Date(payload.startTime);
    this.completionTime = payload.completionTime ? new Date(payload.completionTime) : undefined;
  }
}

export class SbomerManifest {
  public id: string;
  public created: Date;
  public metadata?: Map<string, string>;

  constructor(payload: SbomerManifestPayload) {
    this.id = payload.id;
    this.created = new Date(payload.created);
    this.metadata = payload.metadata ? new Map(Object.entries(payload.metadata)) : undefined;
  }
}

export class SbomerPublisher {
  public id: string;
  public status: string;
  public created: Date;
  public updated?: Date;
  public finished?: Date;
  public result?: string;
  public reason?: string;
  public requestId: string;
  public publisherName?: string;
  public publisherVersion?: string;

  constructor(payload: SbomerPublisherPayload) {
    this.id = payload.id;
    this.status = payload.status;
    this.created = new Date(payload.created);
    this.updated = payload.updated ? new Date(payload.updated) : undefined;
    this.finished = payload.finished ? new Date(payload.finished) : undefined;
    this.result = payload.result;
    this.reason = payload.reason;
    this.requestId = payload.requestId;
    this.publisherName = payload.publisherName;
    this.publisherVersion = payload.publisherVersion;
  }
}

export class SbomerEvent {
  public id: string;
  public created: Date;
  public status: string;
  public generationRecords: SbomerGeneration[];
  public publisherRecords: SbomerPublisher[];

  constructor(payload: SbomerEventPayload) {
    this.id = payload.id;
    this.created = new Date(payload.creationDate);
    this.status = payload.status;
    this.generationRecords = payload.generationRecords
      ? payload.generationRecords.map((record) => new SbomerGeneration(record))
      : [];
    this.publisherRecords = payload.publisherRecords
      ? payload.publisherRecords.map((record) => new SbomerPublisher(record))
      : [];
  }
}

export type GenerateParams = {
  config: string;
};

export interface GenerationRequestsDTO {
  generationRequests: Array<{
    target: {
      type: string;
      identifier: string;
    };
    handlerProvidedOptions?: Record<string, unknown>;
  }>;
  publishers?: Array<{
    name: string;
    version: string;
    options?: Record<string, unknown>;
  }>;
}

export interface TriggerResponse {
  id: string;
}

export type SbomerApi = {
  getBaseUrl(): string;
  stats(): Promise<SbomerStats>;
  getLogPaths(_generationId: string): Promise<Array<string>>;

  getGenerations(_pagination: {
    pageSize: number;
    pageIndex: number;
  }): Promise<{ data: SbomerGeneration[]; total: number }>;

  getGeneration(_id: string): Promise<SbomerGeneration>;

  getEvents(
    _pagination: {
      pageSize: number;
      pageIndex: number;
    },
    _query: string,
  ): Promise<{ data: SbomerEvent[]; total: number }>;

  getEvent(_id: string): Promise<SbomerEvent>;

  getAllGenerationsForEvent(_id: string): Promise<{ data: SbomerGeneration[]; total: number }>;

  // Generation Runs
  getGenerationRuns(_generationId: string): Promise<GenerationRunRecord[]>;
  getGenerationRun(_generationId: string, _runId: string): Promise<GenerationRunRecord>;

  // Enhancement Runs
  getEnhancementRuns(_enhancementId: string): Promise<EnhancementRunRecord[]>;
  getEnhancementRun(_enhancementId: string, _runId: string): Promise<EnhancementRunRecord>;

  // Submit Generation Request
  submitGenerationRequest(_payload: GenerationRequestsDTO): Promise<TriggerResponse>;
};
