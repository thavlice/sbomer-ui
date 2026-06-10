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

import axios, { Axios, AxiosError } from 'axios';
import {
  EnhancementRunRecord,
  EnhancementRunRecordPayload,
  GenerationRequestsDTO,
  GenerationRunRecord,
  GenerationRunRecordPayload,
  SbomerApi,
  SbomerErrorResponse,
  SbomerEvent,
  SbomerEventPayload,
  SbomerGeneration,
  SbomerGenerationPayload,
  SbomerStats,
  TriggerResponse,
} from '../types';
import { ApiPaginatedResponse } from './types';

type Options = {
  baseUrl: string;
};

function isSbomerErrorResponse(payload: unknown): payload is SbomerErrorResponse {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    'result' in candidate ||
    'reason' in candidate ||
    'status' in candidate ||
    'category' in candidate ||
    'correlationId' in candidate ||
    'timestamp' in candidate
  );
}

function formatSbomerErrorMessage(
  context: string,
  status?: number,
  payload?: SbomerErrorResponse,
  fallbackBody?: string,
): string {
  const details = [
    payload?.result,
    payload?.reason,
    payload?.category,
    payload?.correlationId ? `correlationId=${payload.correlationId}` : undefined,
    payload?.timestamp ? `timestamp=${payload.timestamp}` : undefined,
  ].filter(Boolean);

  if (details.length > 0) {
    return `${context}${status ? ` (${status})` : ''}: ${details.join(' | ')}`;
  }

  if (fallbackBody && fallbackBody.trim().length > 0) {
    return `${context}${status ? ` (${status})` : ''}: ${fallbackBody}`;
  }

  return `${context}${status ? ` (${status})` : ''}`;
}

async function parseFetchError(response: Response, context: string): Promise<Error> {
  const rawBody = await response.text();

  if (rawBody) {
    try {
      const parsed = JSON.parse(rawBody);
      if (isSbomerErrorResponse(parsed)) {
        return new Error(
          formatSbomerErrorMessage(context, response.status, {
            ...parsed,
            status: parsed.status ?? response.status,
          }),
        );
      }
    } catch {
      // Fall back to raw text.
    }
  }

  return new Error(formatSbomerErrorMessage(context, response.status, undefined, rawBody));
}

function parseAxiosError(error: AxiosError, context: string): Error {
  const responseStatus = error.response?.status;
  const responseData = error.response?.data;

  if (isSbomerErrorResponse(responseData)) {
    return new Error(
      formatSbomerErrorMessage(context, responseStatus, {
        ...responseData,
        status: responseData.status ?? responseStatus,
      }),
    );
  }

  if (typeof responseData === 'string') {
    return new Error(formatSbomerErrorMessage(context, responseStatus, undefined, responseData));
  }

  if (error.message) {
    return new Error(`${context}${responseStatus ? ` (${responseStatus})` : ''}: ${error.message}`);
  }

  return new Error(formatSbomerErrorMessage(context, responseStatus));
}

export class DefaultSbomerApi implements SbomerApi {
  private readonly baseUrl: string;

  private client: Axios;
  private static _instance: DefaultSbomerApi;

  public static getInstance(): SbomerApi {
    if (!DefaultSbomerApi._instance) {
      const sbomerUrl: string = window._env_?.API_URL || 'http://localhost:3000';

      DefaultSbomerApi._instance = new DefaultSbomerApi({ baseUrl: sbomerUrl });
    }

    return DefaultSbomerApi._instance;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  constructor(options: Options) {
    this.baseUrl = options.baseUrl;
    this.client = axios.create({
      baseURL: options.baseUrl,
    });
  }

  async getLogPaths(generationId: string): Promise<Array<string>> {
    try {
      const response = await this.client.get(`/api/v1/generations/${generationId}/logs`);
      return response.data as Array<string>;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw parseAxiosError(error, `Failed to retrieve log paths for generation ${generationId}`);
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async stats(): Promise<SbomerStats> {
    const response = await fetch(`${this.baseUrl}/api/v1/stats`);

    if (response.status !== 200) {
      throw await parseFetchError(response, 'Failed fetching SBOMer statistics');
    }

    return (await response.json()) as SbomerStats;
  }

  async getGenerations(pagination: {
    pageSize: number;
    pageIndex: number;
  }): Promise<{ data: SbomerGeneration[]; total: number }> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/generations?pageSize=${pagination.pageSize}&pageIndex=${pagination.pageIndex}`,
    );

    if (response.status !== 200) {
      throw await parseFetchError(response, 'Failed fetching generations from SBOMer');
    }

    const data: ApiPaginatedResponse<SbomerGenerationPayload> = await response.json();

    const requests = data.content?.map((request) => new SbomerGeneration(request)) ?? [];

    return { data: requests, total: data.totalHits };
  }

  async getGeneration(id: string): Promise<SbomerGeneration> {
    try {
      const response = await this.client.get(`/api/v1/generations/${id}`);
      return new SbomerGeneration(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw parseAxiosError(error, `Failed fetching generation ${id}`);
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async getEvents(
    pagination: {
      pageSize: number;
      pageIndex: number;
    },
    query: string,
  ): Promise<{ data: SbomerEvent[]; total: number }> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/requests/?pageSize=${pagination.pageSize}&pageIndex=${pagination.pageIndex}&query=${encodeURIComponent(query)}`,
    );

    if (response.status !== 200) {
      throw await parseFetchError(response, 'Failed fetching events from SBOMer');
    }

    const data: ApiPaginatedResponse<SbomerEventPayload> = await response.json();

    const requests = data.content?.map((request) => new SbomerEvent(request)) ?? [];

    return { data: requests, total: data.totalHits || 0 };
  }

  async getEvent(id: string): Promise<SbomerEvent> {
    try {
      const response = await this.client.get(`/api/v1/requests/${id}`);
      return new SbomerEvent(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw parseAxiosError(error, `Failed fetching event ${id}`);
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async getAllGenerationsForEvent(
    id: string,
  ): Promise<{ data: SbomerGeneration[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/api/v1/requests/${id}/generations/all`);

    if (response.status !== 200) {
      throw await parseFetchError(response, 'Failed fetching generations from SBOMer');
    }

    const data: SbomerGenerationPayload[] = await response.json();

    const requests = data?.map((request) => new SbomerGeneration(request)) ?? [];

    return { data: requests, total: requests.length };
  }

  async getGenerationRuns(generationId: string): Promise<GenerationRunRecord[]> {
    try {
      const response = await this.client.get<GenerationRunRecordPayload[]>(
        `/api/v1/generations/${generationId}/runs`,
      );

      return Array.isArray(response.data)
        ? response.data.map((run) => new GenerationRunRecord(run))
        : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw parseAxiosError(error, `Failed to retrieve runs for generation ${generationId}`);
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async getGenerationRun(generationId: string, runId: string): Promise<GenerationRunRecord> {
    try {
      const response = await this.client.get(`/api/v1/generations/${generationId}/runs/${runId}`);
      return new GenerationRunRecord(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw parseAxiosError(
          error,
          `Failed to retrieve run ${runId} for generation ${generationId}`,
        );
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async getEnhancementRuns(enhancementId: string): Promise<EnhancementRunRecord[]> {
    try {
      const response = await this.client.get<EnhancementRunRecordPayload[]>(
        `/api/v1/enhancements/${enhancementId}/runs`,
      );

      return Array.isArray(response.data)
        ? response.data.map((run) => new EnhancementRunRecord(run))
        : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw parseAxiosError(error, `Failed to retrieve runs for enhancement ${enhancementId}`);
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async getEnhancementRun(enhancementId: string, runId: string): Promise<EnhancementRunRecord> {
    try {
      const response = await this.client.get(`/api/v1/enhancements/${enhancementId}/runs/${runId}`);
      return new EnhancementRunRecord(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw parseAxiosError(
          error,
          `Failed to retrieve run ${runId} for enhancement ${enhancementId}`,
        );
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async submitGenerationRequest(payload: GenerationRequestsDTO): Promise<TriggerResponse> {
    try {
      const response = await this.client.post('/api/v1/generations', payload);
      return response.data as TriggerResponse;
    } catch (error) {
      throw parseAxiosError(error as AxiosError, 'Failed to submit generation request');
    }
  }
}
