import { Link } from "react-router-dom";

export default function LegacyIndicesDisabled() {
  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-white/50">
        <h1 className="text-2xl font-bold text-amani-primary mb-2">Ancienne gestion des indices désactivée</h1>
        <p className="text-gray-600 mb-6">
          Cette page fait partie de l'ancien système de gestion des indices et a été désactivée suite à la migration vers le nouveau schéma BRVM.
        </p>
        <div className="space-y-3 text-sm text-gray-700">
          <p>Veuillez utiliser la nouvelle page de gestion des indices BRVM :</p>
          <Link
            to="/dashboard/indices-management"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-amani-primary text-white hover:bg-amani-primary/90"
          >
            Aller à la gestion des indices BRVM
          </Link>
        </div>
      </div>
    </div>
  );
}
