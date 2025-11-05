import React from "react";
import ReactDOM from "react-dom/client";
import AppV2 from "./appV2";


if (process.env.NODE_ENV !== "production") {
  const config = {
    rules: [
      {
        id: 'color-contrast',
        enabled: false
      }
    ]
  };
}

const root = ReactDOM.createRoot(document.getElementById("root") as Element);

root.render(
  <React.StrictMode>
    <AppV2 basename="/"/>
  </React.StrictMode>
);
