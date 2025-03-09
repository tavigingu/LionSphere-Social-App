import { createBrowserRouter, RouterProvider } from "react-router-dom";
//import App from "./App";
import AuthPage from "./pages/AuthPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";

const router = createBrowserRouter([
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
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
