"use client";

import { useEffect, useState } from "react";

import { BellIcon } from "@/components/icons";
import {
  disablePush,
  enablePush,
  getPushState,
  isPushSupported,
} from "@/lib/push-client";

export function PushToggle() {
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

  useEffect(() => {
    if (!isPushSupported()) {
      setSupported(false);
      return;
    }
    getPushState().then(setEnabled).catch(() => setEnabled(false));
  }, []);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      if (enabled) {
        await disablePush();
        setEnabled(false);
      } else {
        if (!vapidKey) {
          setMessage("Push key not configured.");
          return;
        }
        const ok = await enablePush(vapidKey);
        setEnabled(ok);
        if (!ok) setMessage("Permission denied.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-card border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <BellIcon size={20} className="text-text-secondary" />
        <div>
          <p className="text-[15px] font-semibold text-text-primary">
            Push notifications
          </p>
          <p className="text-[13px] text-text-secondary">
            {supported
              ? message ?? (enabled ? "On for this device" : "Off")
              : "Not supported on this browser"}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={!supported || busy}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          enabled ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
