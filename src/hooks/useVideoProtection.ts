import { useEffect } from "react";

export function useVideoProtection(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const blocked =
        key === "f12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        (e.ctrlKey && key === "u");
      if (blocked) e.preventDefault();
    };
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("keydown", blockKeys);
    containerRef.current?.addEventListener("contextmenu", blockContextMenu);
    return () => {
      document.removeEventListener("keydown", blockKeys);
      containerRef.current?.removeEventListener("contextmenu", blockContextMenu);
    };
  }, [containerRef]);
}
