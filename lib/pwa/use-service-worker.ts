"use client";

import { useEffect, useRef, useState } from "react";

export type ServiceWorkerLifecycleState =
  | "unsupported"
  | "idle"
  | "installing"
  | "waiting"
  | "activating"
  | "active"
  | "update_available"
  | "update_required";

interface UseServiceWorkerResult {
  state: ServiceWorkerLifecycleState;
  applyUpdate: () => void;
}

/**
 * Guards against infinite reload loops (app.md #20): we only ever reload in
 * response to a controllerchange event that WE triggered by posting
 * SKIP_WAITING, never on an unsolicited controllerchange.
 */
const RELOAD_GUARD_KEY = "bsa:sw-reload-pending";

export function useServiceWorker(): UseServiceWorkerResult {
  const [state, setState] = useState<ServiceWorkerLifecycleState>("idle");
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;
    let cancelled = false;

    async function register() {
      registration = await navigator.serviceWorker.register("/sw.js");
      if (cancelled) return;

      if (registration.waiting && navigator.serviceWorker.controller) {
        waitingWorkerRef.current = registration.waiting;
        setState("update_available");
      }

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration?.installing;
        if (!installingWorker) return;

        setState("installing");

        installingWorker.addEventListener("statechange", () => {
          switch (installingWorker.state) {
            case "installed":
              if (navigator.serviceWorker.controller) {
                waitingWorkerRef.current = installingWorker;
                setState("update_available");
              } else {
                setState("active");
              }
              break;
            case "activating":
              setState("activating");
              break;
            case "activated":
              setState("active");
              break;
          }
        });
      });
    }

    register().catch(() => setState("unsupported"));

    function handleControllerChange() {
      if (sessionStorage.getItem(RELOAD_GUARD_KEY) === "pending") {
        sessionStorage.removeItem(RELOAD_GUARD_KEY);
        window.location.reload();
      }
    }

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  function applyUpdate() {
    if (!waitingWorkerRef.current) return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, "pending");
    waitingWorkerRef.current.postMessage({ type: "SKIP_WAITING" });
  }

  return { state, applyUpdate };
}
