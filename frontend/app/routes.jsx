import { createBrowserRouter } from 'react-router';
import { RootLayout } from './components/layout/RootLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import AuthPage from './pages/AuthPage';
import AdminAuthPage from './pages/AdminAuthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import SinglePostPage from './pages/SinglePostPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import UserProfilePage from './pages/UserProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AuthPage,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/auth',
    Component: AuthPage,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/admin/auth',
    Component: AdminAuthPage,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, Component: AdminDashboardPage },
    ],
  },
  {
    path: '/app',
    Component: RootLayout,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, Component: FeedPage },
      { path: 'create-post', Component: CreatePostPage },
      { path: 'post/:id', Component: SinglePostPage },
      { path: 'communities', Component: CommunitiesPage },
      { path: 'communities/:id', Component: CommunityDetailPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'u/:username', Component: UserProfilePage },
      { path: 'reports', Component: ReportsPage },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);
