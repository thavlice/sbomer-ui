import * as React from 'react';
import { ComponentType } from 'react';
import {
  Add,
  Application,
  Dashboard as DashboardIcon,
  DataEnrichmentAdd,
  EventChange,
} from '@carbon/icons-react';
import { Dashboard } from './components/Pages/Dashboard/Dashboard';
import { EnhancementPage } from './components/Pages/Enhancements/EnhancementPage';
import { EnhancementRunPage } from './components/Pages/Enhancements/EnhancementRunPage';
import { EnhancementsPage } from './components/Pages/Enhancements/EnhancementsPage';
import { EventPage } from './components/Pages/Events/EventPage';
import { EventsPage } from './components/Pages/Events/EventsPage';
import { GenerationPage } from './components/Pages/Generations/GenerationPage';
import { GenerationRunPage } from './components/Pages/Generations/GenerationRunPage';
import { GenerationsPage } from './components/Pages/Generations/GenerationsPage';
import { NotFoundPage } from './components/Pages/NotFound/NotFoundPage';
import { RequestSubmissionPage } from './components/Pages/RequestSubmission/RequestSubmissionPage';

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  element: React.ReactNode;
  path: string;
  routes?: undefined;
  icon?: ComponentType; // Optional icon for navigation
  divider?: boolean; // Add a divider after this route in navigation
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
  icon?: ComponentType; // Optional icon for the group
  defaultExpanded?: boolean; // Whether the group should be expanded by default
  divider?: boolean; // Add a divider after this group in navigation
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    element: <Dashboard />,
    label: 'Dashboard',
    path: '/',
    icon: DashboardIcon,
    divider: true,
  },
  {
    element: <RequestSubmissionPage />,
    label: 'Submit Request',
    path: '/submit',
    icon: Add,
    divider: true,
  },
  {
    element: <EventsPage />,
    label: 'Events',
    path: '/events',
    icon: EventChange,
  },
  {
    element: <EventPage />,
    path: '/events/:id',
  },
  {
    element: <GenerationsPage />,
    label: 'Generations',
    path: '/generations',
    icon: Application,
  },
  {
    element: <GenerationPage />,
    path: '/generations/:id',
  },
  {
    element: <GenerationRunPage />,
    path: '/generations/:id/runs/:runId',
  },
  {
    element: <GenerationsPage />,
    path: '/requests',
  },
  {
    element: <GenerationPage />,
    path: '/requests/:id',
  },
  {
    element: <EnhancementsPage />,
    label: 'Enhancements',
    path: '/enhancements',
    icon: DataEnrichmentAdd,
    divider: true,
  },
  {
    element: <EnhancementPage />,
    path: '/enhancements/:id',
  },
  {
    element: <EnhancementRunPage />,
    path: '/enhancements/:id/runs/:runId',
  },
  {
    element: <NotFoundPage />,
    path: '*',
  },
];

export { routes };
