import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../services/apiConfig";

interface DynamicLegalPageProps {
  slug: string;
  defaultTitle?: string;
  defaultContent: React.ReactNode;
}

/**
 * Helper de rendu Markdown avec la Grille Originale 2x2 :
 * Reproduit le design riche du site Amani Finance :
 * - Ignore l'en-tête # H1 répétitif du Hero.
 * - Chaque section ## Titre devient une carte blanche épurée avec ombre douce.
 * - Les éléments de liste (ex: 4 catégories) s'affichent automatiquement sous forme de Grille 2x2
 *   avec sous-cartes (#FDFBF9), titres en majuscules et texte explicatif.
 */
export function renderMarkdownContent(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  const sections: { title?: string; paragraphs: React.ReactNode[]; listItems: string[] }[] = [];
  let currentSection: { title?: string; paragraphs: React.ReactNode[]; listItems: string[] } = {
    paragraphs: [],
    listItems: [],
  };

  const parseInline = (str: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const raw = match[0];
      if (raw.startsWith("**") && raw.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-bold text-[#373B3A]">
            {raw.slice(2, -2)}
          </strong>
        );
      } else if (raw.startsWith("[")) {
        const linkMatch = /\[(.*?)\]\((.*?)\)/.exec(raw);
        if (linkMatch) {
          parts.push(
            <a
              key={match.index}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9C8464] underline font-semibold hover:text-[#373B3A]"
            >
              {linkMatch[1]}
            </a>
          );
        }
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Ignorer le titre H1 (# ) qui fait doublon avec le Hero Banner
    if (trimmed.startsWith("# ")) {
      if (currentSection.paragraphs.length > 0 || currentSection.listItems.length > 0) {
        sections.push(currentSection);
        currentSection = { paragraphs: [], listItems: [] };
      }
      return;
    }

    // Nouvelle section de carte pour chaque Titre H2 (## ) ou H3 (### )
    if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      if (currentSection.title || currentSection.paragraphs.length > 0 || currentSection.listItems.length > 0) {
        sections.push(currentSection);
      }
      const titleText = trimmed.replace(/^#+\s+/, "");
      currentSection = { title: titleText, paragraphs: [], listItems: [] };
      return;
    }

    // Élément de Liste / Puce
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.replace(/^[-*]\s+/, "");
      currentSection.listItems.push(content);
      return;
    }

    // Paragraphe standard
    currentSection.paragraphs.push(
      <p key={`p-${index}`} className="text-sm text-gray-600 leading-relaxed font-normal">
        {parseInline(trimmed)}
      </p>
    );
  });

  if (currentSection.title || currentSection.paragraphs.length > 0 || currentSection.listItems.length > 0) {
    sections.push(currentSection);
  }

  return (
    <div className="space-y-6">
      {sections.map((sec, i) => (
        <section key={i} className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          {sec.title && (
            <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
              {sec.title}
            </h2>
          )}
          
          {sec.paragraphs.length > 0 && (
            <div className="space-y-2">
              {sec.paragraphs}
            </div>
          )}

          {/* Rendu des sous-éléments sous forme de Grille Responsive (Style d'origine) */}
          {sec.listItems.length > 0 && (
            <div className={`grid grid-cols-1 ${sec.listItems.length > 1 ? "sm:grid-cols-2" : ""} gap-4 pt-2`}>
              {sec.listItems.map((itemStr, idx) => {
                // Si l'élément commence par **Titre** : Description
                const boldMatch = /^\*\*(.*?)\*\*\s*[:\-]?\s*(.*)/.exec(itemStr);
                if (boldMatch) {
                  const cardTitle = boldMatch[1];
                  const cardDesc = boldMatch[2];
                  return (
                    <div key={idx} className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 space-y-1">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#373B3A]">
                        {cardTitle}
                      </h4>
                      {cardDesc && (
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {parseInline(cardDesc)}
                        </p>
                      )}
                    </div>
                  );
                }

                // Sinon, sous-carte standard
                return (
                  <div key={idx} className="bg-[#FDFBF9] p-3.5 sm:p-4 rounded-xl border border-[#E5DDD5]/80 text-xs sm:text-sm text-gray-700">
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9C8464] mt-2 shrink-0" />
                      <span className="leading-relaxed font-normal">{parseInline(itemStr)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

export const DynamicLegalPage: React.FC<DynamicLegalPageProps> = ({
  slug,
  defaultContent,
}) => {
  const [pageData, setPageData] = useState<{ title: string; content: string; updated_by?: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/legal-pages/${slug}?t=${Date.now()}`)
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success && json.data && json.data.content) {
          setPageData({
            title: json.data.title,
            content: json.data.content,
            updated_by: json.data.updated_by,
          });
        }
      })
      .catch((err) => {
        console.warn(`[DynamicLegalPage] Fallback pour ${slug}:`, err);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  // Si la page a été explicitement modifiée par un administrateur dans le dashboard
  if (pageData && pageData.updated_by && pageData.content) {
    return (
      <div className="space-y-6">
        {renderMarkdownContent(pageData.content)}
      </div>
    );
  }

  // Par défaut : Rendu original avec le design React riche d'origine (icônes, grilles, callouts)
  return <>{defaultContent}</>;
};
