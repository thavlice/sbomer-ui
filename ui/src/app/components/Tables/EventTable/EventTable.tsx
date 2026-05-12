import { useRequestEvents } from '@app/components/Tables/EventTable/useEvents';
import { useEventsFilters } from '@app/components/Tables/EventTable/useEventsFilters';
import {
  LinkCell,
  TableColumn,
  TablePage,
  TagCell,
  TimestampCell,
} from '@app/components/Tables/TablePage/TablePage';
import { eventStatusToColor } from '@app/utils/Utils';
import { SbomerEvent } from '@app/types';
import React from 'react';

const columns: TableColumn<SbomerEvent>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (event) => <LinkCell to={`/events/${event.id}`}>{event.id}</LinkCell>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (event) => <TagCell type={eventStatusToColor(event.status)}>{event.status}</TagCell>,
  },
  {
    key: 'created',
    header: 'Created',
    render: (event) => <TimestampCell date={event.created} />,
  },
];

export const EventTable = () => {
  const { query, pageIndex, pageSize, setFilters } = useEventsFilters();
  const [querySearchbarValue, setQuerySearchbarValue] = React.useState<string>(query || '');

  React.useEffect(() => {
    setQuerySearchbarValue(query || '');
  }, [query]);

  const [{ value, loading, total, error }, { retry }] = useRequestEvents();

  const onSetPage = (newPage: number) => {
    setFilters(query, newPage, pageSize);
  };

  const onPerPageSelect = (newPerPage: number) => {
    setFilters(query, 1, newPerPage);
  };

  const isQueryValidationError = (error: any) => {
    return (
      error?.message?.includes('The provided query is not valid') ||
      error?.status === 400 ||
      error?.code === 'INVALID_QUERY'
    );
  };

  const clearFilters = () => {
    setQuerySearchbarValue('');
    setFilters('', 1, 10);
  };

  const executeSearch = () => {
    setFilters(querySearchbarValue || '', 1, pageSize);
  };

  return (
    <TablePage
      title="Events"
      description="Latest events"
      columns={columns}
      data={value}
      loading={loading}
      error={error}
      total={total || 0}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={onSetPage}
      onPageSizeChange={onPerPageSelect}
      searchEnabled={false}
      searchValue={querySearchbarValue}
      searchPlaceholder="Enter query"
      searchLabel="Search events"
      onSearchChange={setQuerySearchbarValue}
      onSearchClear={clearFilters}
      onSearchExecute={executeSearch}
      onRefresh={retry}
      helpEnabled={false}
      helpPath="/help"
      noResultsTitle="No events found"
      noResultsMessage="Try adjusting your search query or clear the filters to see all events."
      noResultsActionText="Clear filters"
      onNoResultsAction={clearFilters}
      isQueryValidationError={isQueryValidationError}
      getRowKey={(event) => event.id}
    />
  );
};
