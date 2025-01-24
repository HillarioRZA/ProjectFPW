import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Category from './pages/Category';
import TopicDetail from './pages/TopicDetail';
import CreateTopic from './pages/CreateTopic';
import EditTopic from './pages/EditTopic';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ManageTopics from './pages/admin/ManageTopics';
import ManageUsers from './pages/admin/ManageUsers';
import ManageComments from './pages/admin/ManageComments';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/category/:slug',
    element: <Category />,
  },
  {
    path: '/topic/:id',
    element: <TopicDetail />,
  },
  {
    path: '/create-topic',
    element: <CreateTopic />,
  },
  {
    path: '/edit-topic/:id',
    element: <EditTopic />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/categories',
    element: <ManageCategories />,
  },
  {
    path: '/admin/topics',
    element: <ManageTopics />,
  },
  {
    path: '/admin/users',
    element: <ManageUsers />,
  },
  {
    path: '/admin/comments',
    element: <ManageComments />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
