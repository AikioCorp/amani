// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("retourne une chaîne vide pour une entrée nulle/vide", () => {
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
    expect(sanitizeHtml("")).toBe("");
  });

  it("conserve le HTML rédactionnel légitime", () => {
    const input = "<p>Bonjour <strong>monde</strong> <a href=\"https://x.com\">lien</a></p>";
    const output = sanitizeHtml(input);
    expect(output).toContain("<strong>");
    expect(output).toContain("<a");
    expect(output).toContain("Bonjour");
  });

  it("supprime les balises <script>", () => {
    const output = sanitizeHtml('<p>ok</p><script>alert("xss")</script>');
    expect(output).not.toContain("<script");
    expect(output).not.toContain("alert");
  });

  it("supprime les gestionnaires d'événements inline (onerror, onclick)", () => {
    const output = sanitizeHtml('<img src="x" onerror="alert(1)"><div onclick="steal()">x</div>');
    expect(output.toLowerCase()).not.toContain("onerror");
    expect(output.toLowerCase()).not.toContain("onclick");
  });

  it("neutralise les iframes injectées", () => {
    const output = sanitizeHtml('<iframe src="https://evil.com"></iframe>');
    expect(output.toLowerCase()).not.toContain("<iframe");
  });
});
