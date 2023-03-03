import React from "react";
import {
  useNavigate,
  useRouteError
} from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  console.log(error)
  return (
    <section>
      error
      <button onClick={() => navigate(-1, { replace: true })}>Go Home</button>
    </section>
  );
}