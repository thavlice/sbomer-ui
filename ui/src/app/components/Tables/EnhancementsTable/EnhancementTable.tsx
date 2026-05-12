import { SbomerEnhancement } from '@app/types';
import { LinkCell, TableColumn, TablePage, TagCell, TimestampCell } from '../TablePage/TablePage';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParam } from 'react-use';
import { enhancementStatusToColor } from '@app/utils/Utils';
import { useEnhancements } from './useEnhancements';

interface EnhancementRow {
  id: string;
  created: Date | undefined;
  updated: Date | undefined;
  finished: Date | undefined;
  status: string;
  enhancerType: string | undefined;
  enhancerVersion: string | undefined;
  generationId: string | undefined;
  requestId: string | undefined;
}

const columns: TableColumn<EnhancementRow>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <LinkCell to={`/enhancements/${row.id}`}>{row.id}</LinkCell>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <TagCell type={enhancementStatusToColor(row.status)}>{row.status || 'N/A'}</TagCell>
    ),
  },
  { key: 'created', header: 'Created', render: (row) => <TimestampCell date={row.created} /> },
  { key: 'updated', header: 'Updated', render: (row) => <TimestampCell date={row.updated} /> },
  { key: 'finished', header: 'Finished', render: (row) => <TimestampCell date={row.finished} /> },
  { key: 'enhancerType', header: 'Enhancer Type', render: (row) => row.enhancerType || 'N/A' },
  {
    key: 'enhancerVersion',
    header: 'Enhancer Version',
    render: (row) => row.enhancerVersion || 'N/A',
  },
  {
    key: 'generationId',
    header: 'Generation ID',
    render: (row) => (
      <LinkCell to={`/generations/${row.generationId}`}>{row.generationId}</LinkCell>
    ),
  },
  {
    key: 'requestId',
    header: 'Request ID',
    render: (row) => <LinkCell to={`/requests/${row.requestId}`}>{row.requestId}</LinkCell>,
  },
];

export const EnhancementTable = () => {
  const navigate = useNavigate();
  const paramPage = useSearchParam('page') || 1;
  const paramPageSize = useSearchParam('pageSize') || 10;

  const [
    { pageIndex, pageSize, value, loading, total, error },
    { setPageIndex, setPageSize, retry },
  ] = useEnhancements(+paramPage - 1, +paramPageSize);

  const onSetPage = (newPage: number) => {
    setPageIndex(newPage - 1);
    navigate({ search: `?page=${newPage}&pageSize=${pageSize}` });
  };

  const onPerPageSelect = (newPerPage: number) => {
    setPageSize(newPerPage);
    setPageIndex(0);
    navigate({ search: `?page=1&pageSize=${newPerPage}` });
  };

  const rows: EnhancementRow[] =
    (value ?? []).map((enhancement: SbomerEnhancement) => ({
      id: enhancement.id,
      status: enhancement.status,
      created: enhancement.created,
      updated: enhancement.updated,
      finished: enhancement.finished,
      enhancerType: enhancement.enhancerName,
      enhancerVersion: enhancement.enhancerVersion,
      generationId: enhancement.generationId,
      requestId: enhancement.requestId,
    })) ?? [];

  return (
    <TablePage
      title="Enhancements"
      description="Latest enhancements"
      columns={columns}
      data={rows}
      loading={loading}
      error={error}
      total={total || 0}
      pageIndex={pageIndex + 1}
      pageSize={pageSize}
      onPageChange={onSetPage}
      onPageSizeChange={onPerPageSelect}
      onRefresh={retry}
      noResultsTitle="No enhancements found"
      noResultsMessage="No enhancements were made."
      noResultsActionText="Take me home"
      onNoResultsAction={() => navigate('/')}
      getRowKey={(row) => row.id}
    />
  );
};
