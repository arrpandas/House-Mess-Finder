if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  const proto = window.MediaQueryList?.prototype;
  if (proto && !proto.addListener) {
    proto.addListener = function (
      this: MediaQueryList,
      cb: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null
    ) {
      if (cb) this.addEventListener("change", cb as EventListener);
    };
    proto.removeListener = function (
      this: MediaQueryList,
      cb: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null
    ) {
      if (cb) this.removeEventListener("change", cb as EventListener);
    };
  }
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
