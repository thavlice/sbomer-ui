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

import { renderHook, act } from '@testing-library/react';
import { useRequestSubmission } from '../hooks/useRequestSubmission';

describe('useRequestSubmission', () => {
  describe('Target Identifier Validation', () => {
    it('should validate container image format correctly', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetType('CONTAINER_IMAGE');
        result.current.updateTargetIdentifier('quay.io/namespace/image:tag');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.targetIdentifier).toBeUndefined();
    });

    it('should reject invalid container image format', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetType('CONTAINER_IMAGE');
        result.current.updateTargetIdentifier('invalid-format');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.targetIdentifier).toBeDefined();
      expect(result.current.errors.targetIdentifier).toContain('Invalid container image format');
    });

    it('should validate RPM format correctly', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetType('RPM');
        result.current.updateTargetIdentifier('bash-5.1.8-6.el9.x86_64');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.targetIdentifier).toBeUndefined();
    });

    it('should reject invalid RPM format', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetType('RPM');
        result.current.updateTargetIdentifier('invalid-rpm');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.targetIdentifier).toBeDefined();
      expect(result.current.errors.targetIdentifier).toContain('Invalid RPM format');
    });

    it('should require target identifier', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.targetIdentifier).toBeDefined();
      expect(result.current.errors.targetIdentifier).toContain('required');
    });
  });

  describe('Publisher Validation', () => {
    it('should validate publisher with valid name and version', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetIdentifier('quay.io/test/image:latest');
        result.current.addPublisher();
        result.current.updatePublisher(0, 'name', 'test-publisher');
        result.current.updatePublisher(0, 'version', '1.0.0');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.publishers).toBeUndefined();
    });

    it('should reject publisher with empty name', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetIdentifier('quay.io/test/image:latest');
        result.current.addPublisher();
        result.current.updatePublisher(0, 'version', '1.0.0');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.publishers?.[0]?.name).toBeDefined();
    });

    it('should reject publisher with invalid version format', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetIdentifier('quay.io/test/image:latest');
        result.current.addPublisher();
        result.current.updatePublisher(0, 'name', 'test-publisher');
        result.current.updatePublisher(0, 'version', 'invalid-version');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.publishers?.[0]?.version).toBeDefined();
      expect(result.current.errors.publishers?.[0]?.version).toContain('semantic version');
    });

    it('should accept semantic version with pre-release', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetIdentifier('quay.io/test/image:latest');
        result.current.addPublisher();
        result.current.updatePublisher(0, 'name', 'test-publisher');
        result.current.updatePublisher(0, 'version', '1.0.0-alpha.1');
      });

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.publishers).toBeUndefined();
    });
  });

  describe('Form State Management', () => {
    it('should add and remove handler options', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.addHandlerOption();
      });

      expect(result.current.formState.handlerOptions).toHaveLength(1);

      act(() => {
        result.current.updateHandlerOption(0, 'key1', 'value1');
      });

      expect(result.current.formState.handlerOptions[0]).toEqual({ key: 'key1', value: 'value1' });

      act(() => {
        result.current.removeHandlerOption(0);
      });

      expect(result.current.formState.handlerOptions).toHaveLength(0);
    });

    it('should add and remove publishers', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.addPublisher();
      });

      expect(result.current.formState.publishers).toHaveLength(1);

      act(() => {
        result.current.removePublisher(0);
      });

      expect(result.current.formState.publishers).toHaveLength(0);
    });

    it('should add and remove publisher options', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.addPublisher();
        result.current.addPublisherOption(0);
      });

      expect(result.current.formState.publishers[0]!.options).toHaveLength(1);

      act(() => {
        result.current.updatePublisherOption(0, 0, 'optKey', 'optValue');
      });

      expect(result.current.formState.publishers[0]!.options[0]).toEqual({
        key: 'optKey',
        value: 'optValue',
      });

      act(() => {
        result.current.removePublisherOption(0, 0);
      });

      expect(result.current.formState.publishers[0]!.options).toHaveLength(0);
    });

    it('should reset form to initial state', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetIdentifier('test-identifier');
        result.current.addHandlerOption();
        result.current.addPublisher();
      });

      expect(result.current.formState.targetIdentifier).toBe('test-identifier');
      expect(result.current.formState.handlerOptions).toHaveLength(1);
      expect(result.current.formState.publishers).toHaveLength(1);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formState.targetIdentifier).toBe('');
      expect(result.current.formState.handlerOptions).toHaveLength(0);
      expect(result.current.formState.publishers).toHaveLength(0);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.submissionResult).toBeNull();
    });
  });

  describe('Target Type Switching', () => {
    it('should clear validation errors when switching target type', () => {
      const { result } = renderHook(() => useRequestSubmission());

      act(() => {
        result.current.updateTargetType('CONTAINER_IMAGE');
        result.current.updateTargetIdentifier('invalid');
        result.current.validateForm();
      });

      expect(result.current.errors.targetIdentifier).toBeDefined();

      act(() => {
        result.current.updateTargetType('RPM');
      });

      expect(result.current.errors.targetIdentifier).toBeUndefined();
    });
  });
});
