import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ALL_PERMISSIONS } from "../lib/demoAccounts";
import {
  Shield,
  Users,
  Search,
  Filter,
  Save,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Settings,
} from "lucide-react";

export default function PermissionsManager() {
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  // Check permissions
  if (!user || !hasPermission("manage_permissions")) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-amani-primary mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour gérer les
            permissions.
          </p>
        </div>
      </>
    );
  }

  // Mock roles data - in real app would come from API
  const roles = [
    {
      id: "admin",
      name: "Administrateur",
      description: "Accès complet à toutes les fonctionnalités",
      permissions: Object.keys(ALL_PERMISSIONS),
      userCount: 2,
      color: "bg-red-100 text-red-800",
    },
    {
      id: "editeur",
      name: "Éditeur",
      description: "Création et gestion de contenu",
      permissions: [
        "create_articles",
        "edit_articles",
        "publish_articles",
        "create_podcasts",
        "edit_podcasts",
        "publish_podcasts",
        "manage_categories",
        "view_analytics",
      ],
      userCount: 12,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "analyste",
      name: "Analyste",
      description: "Gestion des données économiques",
      permissions: [
        "create_indices",
        "edit_indices",
        "publish_indices",
        "view_indices",
        "export_indices",
        "create_economic_reports",
        "view_analytics",
        "view_detailed_analytics",
      ],
      userCount: 8,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "moderateur",
      name: "Modérateur",
      description: "Modération de contenu et utilisateurs",
      permissions: [
        "moderate_comments",
        "review_content",
        "manage_user_reports",
        "view_content_stats",
        "ban_users",
        "view_user_activity",
      ],
      userCount: 5,
      color: "bg-yellow-100 text-yellow-800",
    },
  ];

  const permissionCategories = {
    content: {
      name: "Contenu",
      permissions: [
        "create_articles",
        "edit_articles",
        "delete_articles",
        "publish_articles",
        "create_podcasts",
        "edit_podcasts",
        "delete_podcasts",
        "publish_podcasts",
        "manage_categories",
      ],
    },
    analytics: {
      name: "Analytics",
      permissions: [
        "view_analytics",
        "view_detailed_analytics",
        "export_data",
        "create_economic_reports",
        "access_admin_reports",
      ],
    },
    indices: {
      name: "Indices économiques",
      permissions: [
        "create_indices",
        "edit_indices",
        "delete_indices",
        "view_indices",
        "export_indices",
        "publish_indices",
      ],
    },
    moderation: {
      name: "Modération",
      permissions: [
        "moderate_comments",
        "review_content",
        "manage_user_reports",
        "view_content_stats",
        "ban_users",
      ],
    },
    users: {
      name: "Gestion utilisateurs",
      permissions: [
        "manage_users",
        "create_users",
        "edit_user_profiles",
        "delete_users",
        "view_user_activity",
        "manage_user_roles",
      ],
    },
    system: {
      name: "Système",
      permissions: [
        "system_settings",
        "manage_permissions",
        "access_logs",
        "backup_system",
        "manage_integrations",
      ],
    },
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      error("Erreur", "Le nom du rôle est requis");
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    success("Rôle créé", `Le rôle "${newRoleName}" a été créé avec succès`);
    setIsCreatingRole(false);
    setNewRoleName("");
    setNewRolePermissions([]);
  };

  const handlePermissionToggle = (permission: string) => {
    setNewRolePermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      {/* Actions bar previously in DashboardLayout */}
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={() => setIsCreatingRole(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau rôle
        </button>
      </div>
      <div className="space-y-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un rôle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
              >
                <option value="all">Toutes les catégories</option>
                {Object.entries(permissionCategories).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl shadow-lg border border-white/50 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amani-primary rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amani-primary">
                        {role.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${role.color}`}
                      >
                        {role.userCount} utilisateur
                        {role.userCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-amani-primary">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-amani-primary">
                      <Edit className="w-4 h-4" />
                    </button>
                    {role.id !== "admin" && (
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{role.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Permissions
                    </span>
                    <span className="text-sm text-gray-500">
                      {role.permissions.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(permissionCategories).map(
                      ([key, category]) => {
                        const categoryPermissions = category.permissions.filter(
                          (p) => role.permissions.includes(p),
                        );
                        if (categoryPermissions.length === 0) return null;

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="text-xs text-gray-600">
                              {category.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">
                                {categoryPermissions.length}/
                                {category.permissions.length}
                              </span>
                              {categoryPermissions.length ===
                              category.permissions.length ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : categoryPermissions.length > 0 ? (
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                              ) : (
                                <XCircle className="w-3 h-3 text-red-600" />
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t">
                <button className="w-full text-sm text-amani-primary hover:text-amani-primary/80 font-medium">
                  Voir les détails
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Permission Categories Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-white/50">
          <h3 className="text-xl font-semibold text-amani-primary mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Catégories de permissions
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(permissionCategories).map(([key, category]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  {category.name}
                </h4>
                <div className="space-y-2">
                  {category.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {
                          ALL_PERMISSIONS[
                            permission as keyof typeof ALL_PERMISSIONS
                          ]
                        }
                      </span>
                      <span className="text-xs text-gray-500">
                        {permission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Role Modal */}
        {isCreatingRole && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-amani-primary">
                  Créer un nouveau rôle
                </h3>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du rôle *
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Ex: Éditeur Senior"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Permissions
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(permissionCategories).map(
                      ([key, category]) => (
                        <div
                          key={key}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h5 className="font-medium text-gray-800 mb-3">
                            {category.name}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {category.permissions.map((permission) => (
                              <label
                                key={permission}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={newRolePermissions.includes(
                                    permission,
                                  )}
                                  onChange={() =>
                                    handlePermissionToggle(permission)
                                  }
                                  className="h-4 w-4 text-amani-primary focus:ring-amani-primary border-gray-300 rounded"
                                />
                                <span className="text-gray-700">
                                  {
                                    ALL_PERMISSIONS[
                                      permission as keyof typeof ALL_PERMISSIONS
                                    ]
                                  }
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-4">
                <button
                  onClick={() => setIsCreatingRole(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateRole}
                  className="flex items-center gap-2 px-6 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Créer le rôle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
