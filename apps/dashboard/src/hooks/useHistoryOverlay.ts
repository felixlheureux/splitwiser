import { useEffect, useRef } from 'react';

/**
 * Synchronizes an overlay (sheet, modal, drawer) with the browser history.
 * - Pushes a history entry when opened.
 * - Calls `onClose` when the user does a back gesture / presses back.
 * - Calls `history.back()` if the overlay is closed via UI to keep history clean.
 */
export function useHistoryOverlay(open: boolean, onClose: () => void, name: string) {
  const isPushedRef = useRef(false);
  const closingFromPopRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      if (!isPushedRef.current) {
        window.history.pushState({ overlay: name }, '');
        isPushedRef.current = true;
      }

      function handlePopState() {
        if (isPushedRef.current) {
          isPushedRef.current = false;
          closingFromPopRef.current = true;
          onCloseRef.current();
        }
      }

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    } else {
      if (isPushedRef.current) {
        isPushedRef.current = false;
        if (!closingFromPopRef.current) {
          window.history.back();
        }
      }
      closingFromPopRef.current = false;
    }
  }, [open, name]);
}
