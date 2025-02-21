import { createBrowserRouter, RouterProvider } from "react-router-dom";
//import App from "./App";
import AuthPage from "./pages/AuthPage.tsx";
import HomePage from "./pages/HomePage.tsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
