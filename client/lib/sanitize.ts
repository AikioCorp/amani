import DOMPurify from "dompurify";

// Nettoie du HTML provenant de contenus rédactionnels avant injection via
// dangerouslySetInnerHTML. Empêche l'exécution de scripts / handlers malveillants
// (XSS) tout en conservant le formatage riche légitime.
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
    FORBID_TAGS: ["style", "script", "iframe", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "style"],
  });
}
