import React from "react"
import ReactDOM from "react-dom/client"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Home } from "./Home.tsx"
import { SignIn } from "./SignIn.tsx";
import { Callback } from "./Callback.tsx";
import "./index.css"


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Home />
    ),
  },
  {
    path: "sign-in",
    element: (
      <SignIn />
    ),
  },
  {
    path: "callback",
    element: (
      <Callback />
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)



