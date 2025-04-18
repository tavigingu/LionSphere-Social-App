import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
//import App from "./App";
import AuthPage from "./pages/AuthPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import LocationExplore from "./components/Explore/LoctationExplore.tsx";
import TagExplore from "./components/Explore/TagExplore.tsx";
import StatisticsPage from "./pages/StatisticsPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import PrivacyPolicyPage from "./pages/PirvacyPoliticsPage.tsx";
import TermsOfServicePage from "./pages/TermsOfServicePage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import AdminStatisticsPage from "./pages/StatisticsPage.tsx";
import AdminUsersPage from "./pages/AdminUsersPage.tsx";
import AdminReportsPage from "./pages/AdminReportsPage.tsx";
import AdminReportedPostsPage from "./pages/AdminReportedPosts.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/profile/:userId",
    element: <ProfilePage />,
  },
  {
    path: "/chat",
    element: <ChatPage />, // New chat route
  },
  {
    path: "/explore/location/:locationName",
    element: <LocationExplore />,
  },
  {
    path: "/explore/tag/:tagName",
    element: <TagExplore />,
  },
  {
    path: "/statistics",
    element: <StatisticsPage />, // Noua rută pentru pagina de statistici
  },
  {
    path: "/about",
    element: <AboutPage />, // Noua rută pentru pagina de statistici
  },
  {
    path: "/privacy",
    element: <PrivacyPolicyPage />, // Noua rută pentru pagina de statistici
  },
  {
    path: "/terms",
    element: <TermsOfServicePage />, // Noua rută pentru pagina de statistici
  },
  {
    path: "/contact",
    element: <ContactPage />, // Noua rută pentru pagina de statistici
  },
  {
    path: "/admin/statistics",
    element: <AdminStatisticsPage />, // New admin statistics route
  },
  {
    path: "/admin/users",
    element: <AdminUsersPage />, // New admin statistics route
  },
  {
    path: "/admin/reports",
    element: <AdminReportsPage />, // New admin statistics route
  },
  {
    path: "/admin/reported-posts",
    element: <AdminReportedPostsPage />, // New admin statistics route
  },
  {
    path: "/admin/profile/:userId",
    element: <ProfilePage />,
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
