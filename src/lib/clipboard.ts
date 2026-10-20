/**
 * Safe clipboard copy with fallback for non-HTTPS contexts.
 * 
 * navigator.clipboard works only on:
 *   - HTTPS
 *   - localhost
 * 
 * Fallback 1: document.execCommand("copy") — works on HTTP
 * Fallback 2: window.prompt() — always works (user copies manually)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern API first (HTTPS / localhost only)
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard failed, using fallback:", err);
    }
  }

  // Fallback 1: legacy execCommand (works on HTTP)
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (success) return true;
    } catch (err) {
      console.warn("execCommand fallback failed:", err);
    }
  }

  // Fallback 2: manual prompt (always works)
  if (typeof window !== "undefined") {
    try {
      window.prompt("Copy this text:", text);
      return true;
    } catch (err) {
      console.warn("prompt fallback failed:", err);
    }
  }

  return false;
}
