import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "../components/common/loading/Loading";
const Home = lazy(() => import("../pages/Home"));
const Main = lazy(() => import("../layouts/Main"));
const Admin = lazy(() => import("../pages/Admin"));

const repoName = import.meta.env.VITE_REPO_NAME || "";
const basename = import.meta.env.PROD && repoName ? `/${repoName}` : "";

export const router = createBrowserRouter(
  [
    {
      path: "/admin",
      element: (
        <Suspense fallback={<Loading />}>
          <Admin />
        </Suspense>
      ),
    },
    {
      path: `/`,
      element: (
        <Suspense fallback={<Loading />}>
          <Main />
        </Suspense>
      ),
      children: [
        {
          index: true,
          element: <Home></Home>,
        },
      ],
    },
  ],
  { basename },
);
