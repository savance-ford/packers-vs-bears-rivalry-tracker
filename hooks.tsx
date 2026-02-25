import { useEffect, useState, useCallback } from "react";
import { RivalryData } from "./data-types";
// 1. Manages fetching the rivalry data
export const useRivalryData = () => {
  const [data, setData] = useState<RivalryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/rivalry.json`);
        if (!res.ok) {
          throw new Error("Failed to load rivalry data");
        }
        setData(await res.json());
      } catch (err) {
        console.error(err);
        setError("Unable to load the stats. Please refresh the page.");
      }
    };

    fetchData();
  }, []);

  return { data, error };
};

// 2. Reusable hook for excuse state and URL syncing
export const useExcuseManager = (
  items: string[] | undefined,
  urlKey: string
) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items?.length) return;
    const params = new URLSearchParams(window.location.search);
    const idxRaw = params.get(urlKey);

    if (idxRaw !== null) {
      const idx = Number(idxRaw);
      if (Number.isFinite(idx) && idx >= 0 && idx < items.length) {
        setIndex(idx);
        return;
      }
    }

    // Sync default to URL if not present
    params.set(urlKey, "0");
    window.history.replaceState({}, "", `?${params.toString()}`);
  }, [items, urlKey]);

  const generate = useCallback(() => {
    if (!items?.length) return;
    const next = Math.floor(Math.random() * items.length);
    setIndex(next);

    const params = new URLSearchParams(window.location.search);
    params.set(urlKey, String(next));
    window.history.replaceState({}, "", `?${params.toString()}`);
  }, [items, urlKey]);

  return { excuse: items?.[index] ?? "", index, generate };
};

// 3. Reusable clipboard hook
export const useClipboard = (resetDuration = 1500) => {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    // 1. The classic fallback for non-secure contexts or older browsers
    const fallbackCopy = (textToCopy: string) => {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        setCopied(true);
        setTimeout(() => setCopied(false), resetDuration);
      } catch {
        setCopied(false);
        alert("Copy failed—try manually copying.");
      }
    };

    // 2. Try the modern Clipboard API first, checking for secure context
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDuration);
      } catch {
        // If the modern API fails (e.g., permissions issue), try the fallback
        fallbackCopy(text);
      }
    } else {
      // 3. Directly use fallback if modern API isn't available
      fallbackCopy(text);
    }
  };

  return { copied, copy };
};
