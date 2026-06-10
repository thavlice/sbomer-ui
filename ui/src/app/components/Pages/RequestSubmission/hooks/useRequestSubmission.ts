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

import { DefaultSbomerApi } from '@app/api/DefaultSbomerApi';
import { useState, useCallback } from 'react';
import {
  RequestFormState,
  ValidationErrors,
  SubmissionResult,
  TargetType,
  GenerationRequestsDTO,
} from '../types';

const INITIAL_FORM_STATE: RequestFormState = {
  targetType: 'CONTAINER_IMAGE',
  targetIdentifier: '',
  handlerOptions: [],
  publishers: [],
};

// Validation regex patterns
const CONTAINER_IMAGE_REGEX = /^[a-z0-9.-]+\/[a-z0-9._/-]+:[a-z0-9._-]+$/i;
const RPM_REGEX = /^[a-zA-Z0-9._+-]+-[0-9][a-zA-Z0-9._]*-[a-zA-Z0-9._]+\.[a-zA-Z0-9_]+$/;
const SEMANTIC_VERSION_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;

export interface UseRequestSubmissionReturn {
  formState: RequestFormState;
  errors: ValidationErrors;
  isSubmitting: boolean;
  isSuccess: boolean;
  submissionResult: SubmissionResult | null;
  submissionError: string | null;
  updateTargetType: (type: TargetType) => void;
  updateTargetIdentifier: (identifier: string) => void;
  addHandlerOption: () => void;
  updateHandlerOption: (index: number, key: string, value: string) => void;
  removeHandlerOption: (index: number) => void;
  addPublisher: () => void;
  updatePublisher: (index: number, field: 'name' | 'version', value: string) => void;
  addPublisherOption: (publisherIndex: number) => void;
  updatePublisherOption: (publisherIndex: number, optionIndex: number, key: string, value: string) => void;
  removePublisherOption: (publisherIndex: number, optionIndex: number) => void;
  removePublisher: (index: number) => void;
  validateForm: () => boolean;
  submitRequest: () => Promise<void>;
  resetForm: () => void;
  clearError: () => void;
}

export const useRequestSubmission = (): UseRequestSubmissionReturn => {
  const [formState, setFormState] = useState<RequestFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const validateTargetIdentifier = useCallback((type: TargetType, identifier: string): string | undefined => {
    if (!identifier.trim()) {
      return 'Target identifier is required';
    }

    if (type === 'CONTAINER_IMAGE') {
      if (!CONTAINER_IMAGE_REGEX.test(identifier)) {
        return 'Invalid container image format. Expected: registry/namespace/image:tag';
      }
    } else if (type === 'RPM') {
      if (!RPM_REGEX.test(identifier)) {
        return 'Invalid RPM format. Expected: name-version-release.arch';
      }
    }

    return undefined;
  }, []);

  const validatePublisher = useCallback((publisher: { name: string; version: string }) => {
    const publisherErrors: { name?: string; version?: string } = {};

    if (!publisher.name.trim()) {
      publisherErrors.name = 'Publisher name is required';
    }

    if (!publisher.version.trim()) {
      publisherErrors.version = 'Publisher version is required';
    } else if (!SEMANTIC_VERSION_REGEX.test(publisher.version)) {
      publisherErrors.version = 'Invalid version format. Expected semantic version (e.g., 1.0.0)';
    }

    return Object.keys(publisherErrors).length > 0 ? publisherErrors : undefined;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate target identifier
    const targetError = validateTargetIdentifier(formState.targetType, formState.targetIdentifier);
    if (targetError) {
      newErrors.targetIdentifier = targetError;
    }

    // Validate publishers
    const publisherErrors: Record<number, { name?: string; version?: string }> = {};
    formState.publishers.forEach((publisher, index) => {
      const publisherError = validatePublisher(publisher);
      if (publisherError) {
        publisherErrors[index] = publisherError;
      }
    });

    if (Object.keys(publisherErrors).length > 0) {
      newErrors.publishers = publisherErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState, validateTargetIdentifier, validatePublisher]);

  const updateTargetType = useCallback((type: TargetType) => {
    setFormState((prev) => ({ ...prev, targetType: type }));
    setErrors((prev) => ({ ...prev, targetIdentifier: undefined }));
  }, []);

  const updateTargetIdentifier = useCallback((identifier: string) => {
    setFormState((prev) => ({ ...prev, targetIdentifier: identifier }));
    setErrors((prev) => ({ ...prev, targetIdentifier: undefined }));
  }, []);

  const addHandlerOption = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      handlerOptions: [...prev.handlerOptions, { key: '', value: '' }],
    }));
  }, []);

  const updateHandlerOption = useCallback((index: number, key: string, value: string) => {
    setFormState((prev) => {
      const newOptions = [...prev.handlerOptions];
      newOptions[index] = { key, value };
      return { ...prev, handlerOptions: newOptions };
    });
  }, []);

  const removeHandlerOption = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      handlerOptions: prev.handlerOptions.filter((_, i) => i !== index),
    }));
  }, []);

  const addPublisher = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      publishers: [...prev.publishers, { name: '', version: '', options: [] }],
    }));
  }, []);

  const updatePublisher = useCallback((index: number, field: 'name' | 'version', value: string) => {
    setFormState((prev) => {
      const newPublishers = [...prev.publishers];
      newPublishers[index] = { ...newPublishers[index]!, [field]: value };
      return { ...prev, publishers: newPublishers };
    });
    setErrors((prev) => {
      if (prev.publishers && prev.publishers[index]) {
        const newPublisherErrors = { ...prev.publishers };
        delete newPublisherErrors[index]![field];
        if (Object.keys(newPublisherErrors[index]!).length === 0) {
          delete newPublisherErrors[index];
        }
        return { ...prev, publishers: Object.keys(newPublisherErrors).length > 0 ? newPublisherErrors : undefined };
      }
      return prev;
    });
  }, []);

  const addPublisherOption = useCallback((publisherIndex: number) => {
    setFormState((prev) => {
      const newPublishers = [...prev.publishers];
      newPublishers[publisherIndex] = {
        ...newPublishers[publisherIndex]!,
        options: [...newPublishers[publisherIndex]!.options, { key: '', value: '' }],
      };
      return { ...prev, publishers: newPublishers };
    });
  }, []);

  const updatePublisherOption = useCallback(
    (publisherIndex: number, optionIndex: number, key: string, value: string) => {
      setFormState((prev) => {
        const newPublishers = [...prev.publishers];
        const newOptions = [...newPublishers[publisherIndex]!.options];
        newOptions[optionIndex] = { key, value };
        newPublishers[publisherIndex] = { ...newPublishers[publisherIndex]!, options: newOptions };
        return { ...prev, publishers: newPublishers };
      });
    },
    [],
  );

  const removePublisherOption = useCallback((publisherIndex: number, optionIndex: number) => {
    setFormState((prev) => {
      const newPublishers = [...prev.publishers];
      newPublishers[publisherIndex] = {
        ...newPublishers[publisherIndex]!,
        options: newPublishers[publisherIndex]!.options.filter((_, i) => i !== optionIndex),
      };
      return { ...prev, publishers: newPublishers };
    });
  }, []);

  const removePublisher = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      publishers: prev.publishers.filter((_, i) => i !== index),
    }));
    setErrors((prev) => {
      if (prev.publishers) {
        const newPublisherErrors = { ...prev.publishers };
        delete newPublisherErrors[index];
        return { ...prev, publishers: Object.keys(newPublisherErrors).length > 0 ? newPublisherErrors : undefined };
      }
      return prev;
    });
  }, []);

  const submitRequest = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setIsSuccess(false);

    try {
      const api = DefaultSbomerApi.getInstance();

      // Convert form state to API payload
      const handlerProvidedOptions: Record<string, unknown> = {};
      formState.handlerOptions.forEach((option) => {
        if (option.key.trim()) {
          handlerProvidedOptions[option.key] = option.value;
        }
      });

      const publishers = formState.publishers.map((publisher) => {
        const options: Record<string, unknown> = {};
        publisher.options.forEach((option) => {
          if (option.key.trim()) {
            options[option.key] = option.value;
          }
        });

        return {
          name: publisher.name,
          version: publisher.version,
          options: Object.keys(options).length > 0 ? options : undefined,
        };
      });

      const payload: GenerationRequestsDTO = {
        generationRequests: [
          {
            target: {
              type: formState.targetType,
              identifier: formState.targetIdentifier,
            },
            handlerProvidedOptions: Object.keys(handlerProvidedOptions).length > 0 ? handlerProvidedOptions : undefined,
          },
        ],
        publishers: publishers.length > 0 ? publishers : undefined,
      };

      const result = await api.submitGenerationRequest(payload);
      setSubmissionResult(result);
      setIsSuccess(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, validateForm]);

  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    setErrors({});
    setIsSuccess(false);
    setSubmissionResult(null);
    setSubmissionError(null);
  }, []);

  const clearError = useCallback(() => {
    setSubmissionError(null);
  }, []);

  return {
    formState,
    errors,
    isSubmitting,
    isSuccess,
    submissionResult,
    submissionError,
    updateTargetType,
    updateTargetIdentifier,
    addHandlerOption,
    updateHandlerOption,
    removeHandlerOption,
    addPublisher,
    updatePublisher,
    addPublisherOption,
    updatePublisherOption,
    removePublisherOption,
    removePublisher,
    validateForm,
    submitRequest,
    resetForm,
    clearError,
  };
};

