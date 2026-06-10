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

import { AppLayout } from '@app/components/Pages/AppLayout/AppLayout';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import {
  Button,
  ButtonSet,
  CodeSnippet,
  Form,
  FormGroup,
  Heading,
  InlineLoading,
  InlineNotification,
  Layer,
  RadioButton,
  RadioButtonGroup,
  Stack,
  TextInput,
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequestSubmission } from './hooks/useRequestSubmission';
import { TARGET_TYPE_OPTIONS, TargetType } from './types';

export const RequestSubmissionPage: React.FunctionComponent = () => {
  useDocumentTitle('SBOMer | Submit Request');
  const navigate = useNavigate();

  const {
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
    submitRequest,
    resetForm,
    clearError,
  } = useRequestSubmission();

  const selectedTargetOption = TARGET_TYPE_OPTIONS.find((opt) => opt.value === formState.targetType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRequest();
  };

  return (
    <AppLayout>
      <Stack gap={7}>
        <Heading>Submit Generation Request</Heading>

        {isSuccess && submissionResult && (
          <InlineNotification
            kind="success"
            title="Request submitted successfully"
            onCloseButtonClick={resetForm}
            hideCloseButton={false}
          >
            <Stack gap={3}>
              <div>
                Request ID:{' '}
                <Link
                  to={`/events/${submissionResult.id}`}
                  style={{
                    color: 'var(--cds-link-primary)',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
                >
                  {submissionResult.id}
                </Link>
              </div>
            </Stack>
          </InlineNotification>
        )}

        {submissionError && (
          <InlineNotification
            kind="error"
            title="Submission failed"
            subtitle={submissionError}
            onCloseButtonClick={clearError}
            hideCloseButton={false}
          />
        )}

        <Form onSubmit={handleSubmit}>
          <Stack gap={7}>
            {/* Target Section */}
            <Stack gap={5}>
              <Heading>Target Configuration</Heading>
              <FormGroup legendText="Target Type">
                <RadioButtonGroup
                  name="targetType"
                  valueSelected={formState.targetType}
                  onChange={(value) => updateTargetType(value as TargetType)}
                  orientation="vertical"
                >
                  {TARGET_TYPE_OPTIONS.map((option) => (
                    <RadioButton
                      key={option.value}
                      labelText={option.label}
                      value={option.value}
                      id={`target-type-${option.value}`}
                    />
                  ))}
                </RadioButtonGroup>
              </FormGroup>

              <TextInput
                id="target-identifier"
                labelText="Target Identifier"
                placeholder={selectedTargetOption?.placeholder}
                helperText={`Example: ${selectedTargetOption?.example}`}
                value={formState.targetIdentifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateTargetIdentifier(e.target.value)
                }
                invalid={!!errors.targetIdentifier}
                invalidText={errors.targetIdentifier}
                required
                disabled={isSubmitting}
              />
            </Stack>

            {/* Handler Options Section */}
            <Stack gap={5}>
              <Heading>Handler Options (Optional)</Heading>

              {formState.handlerOptions.map((option, index) => (
                <Layer key={index}>
                  <Stack gap={3} orientation="horizontal">
                    <TextInput
                      id={`handler-option-key-${index}`}
                      labelText="Key"
                      placeholder="option-name"
                      value={option.key}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateHandlerOption(index, e.target.value, option.value)
                      }
                      disabled={isSubmitting}
                    />
                    <TextInput
                      id={`handler-option-value-${index}`}
                      labelText="Value"
                      placeholder="option-value"
                      value={option.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateHandlerOption(index, option.key, e.target.value)
                      }
                      disabled={isSubmitting}
                    />
                    <Button
                      kind="danger--ghost"
                      size="md"
                      renderIcon={TrashCan}
                      iconDescription="Remove option"
                      hasIconOnly
                      onClick={() => removeHandlerOption(index)}
                      disabled={isSubmitting}
                    />
                  </Stack>
                </Layer>
              ))}

              <Button
                kind="tertiary"
                size="md"
                renderIcon={Add}
                onClick={addHandlerOption}
                disabled={isSubmitting}
              >
                Add Handler Option
              </Button>
            </Stack>

            {/* Publishers Section */}
            <Stack gap={5}>
              <Heading>Publishers (Optional)</Heading>

              {formState.publishers.map((publisher, publisherIndex) => (
                <Layer key={publisherIndex}>
                  <Stack gap={4}>
                    <Stack gap={3} orientation="horizontal">
                      <Heading>Publisher {publisherIndex + 1}</Heading>
                      <Button
                        kind="danger--ghost"
                        size="sm"
                        renderIcon={TrashCan}
                        onClick={() => removePublisher(publisherIndex)}
                        disabled={isSubmitting}
                      >
                        Remove Publisher
                      </Button>
                    </Stack>

                    <TextInput
                      id={`publisher-name-${publisherIndex}`}
                      labelText="Publisher Name"
                      placeholder="dependency-check-publisher"
                      value={publisher.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updatePublisher(publisherIndex, 'name', e.target.value)
                      }
                      invalid={!!errors.publishers?.[publisherIndex]?.name}
                      invalidText={errors.publishers?.[publisherIndex]?.name}
                      required
                      disabled={isSubmitting}
                    />

                    <TextInput
                      id={`publisher-version-${publisherIndex}`}
                      labelText="Publisher Version"
                      placeholder="1.0.0"
                      value={publisher.version}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updatePublisher(publisherIndex, 'version', e.target.value)
                      }
                      invalid={!!errors.publishers?.[publisherIndex]?.version}
                      invalidText={errors.publishers?.[publisherIndex]?.version}
                      required
                      disabled={isSubmitting}
                    />

                    <Stack gap={3}>
                      <Heading>Publisher Options</Heading>
                      {publisher.options.map((option, optionIndex) => (
                        <Stack key={optionIndex} gap={3} orientation="horizontal">
                          <TextInput
                            id={`publisher-${publisherIndex}-option-key-${optionIndex}`}
                            labelText="Key"
                            hideLabel
                            placeholder="option-name"
                            value={option.key}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updatePublisherOption(publisherIndex, optionIndex, e.target.value, option.value)
                            }
                            disabled={isSubmitting}
                          />
                          <TextInput
                            id={`publisher-${publisherIndex}-option-value-${optionIndex}`}
                            labelText="Value"
                            hideLabel
                            placeholder="option-value"
                            value={option.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updatePublisherOption(publisherIndex, optionIndex, option.key, e.target.value)
                            }
                            disabled={isSubmitting}
                          />
                          <Button
                            kind="danger--ghost"
                            size="md"
                            renderIcon={TrashCan}
                            iconDescription="Remove option"
                            hasIconOnly
                            onClick={() => removePublisherOption(publisherIndex, optionIndex)}
                            disabled={isSubmitting}
                          />
                        </Stack>
                      ))}
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={Add}
                        onClick={() => addPublisherOption(publisherIndex)}
                        disabled={isSubmitting}
                      >
                        Add Option
                      </Button>
                    </Stack>
                  </Stack>
                </Layer>
              ))}

              <Button
                kind="tertiary"
                size="md"
                renderIcon={Add}
                onClick={addPublisher}
                disabled={isSubmitting}
              >
                Add Publisher
              </Button>
            </Stack>

            {/* Form Actions */}
            <ButtonSet>
              <Button
                kind="secondary"
                size="lg"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Reset Form
              </Button>
              <Button
                kind="primary"
                size="lg"
                type="submit"
                disabled={isSubmitting || isSuccess}
              >
                {isSubmitting ? (
                  <InlineLoading description="Submitting..." />
                ) : (
                  'Submit Request'
                )}
              </Button>
            </ButtonSet>
          </Stack>
        </Form>
      </Stack>
    </AppLayout>
  );
};

// Made with Bob
