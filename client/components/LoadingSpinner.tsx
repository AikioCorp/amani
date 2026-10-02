export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amani-primary"></div>
      <span className="ml-4 text-gray-600">Chargement en cours...</span>
    </div>
  );
}
