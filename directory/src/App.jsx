import React from 'react';
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
} from "react-router-dom";
import Root from "@/routes/root";
import ErrorPage from "@/routes/error-page";
import routes from "@/routes";
import '@/App.css';
import 'reset-css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <Root
          title={import.meta.env.VITE_APP_TITLE}
        />
      }
      errorElement={<ErrorPage />}
    >
      {routes.map((route) => {
        return (
          <Route key={route.name}
            index={route.index}
            path={route.path}
            element={route.element}
            loader={route.loader}
          />
        )
      })}
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)