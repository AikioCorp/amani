import { Skeleton } from "./skeleton";

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
      <Skeleton className="w-full h-48 bg-gray-200" />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full bg-gray-200" />
          <Skeleton className="h-4 w-24 rounded bg-gray-200" />
        </div>
        <Skeleton className="h-6 w-full rounded bg-gray-200" />
        <Skeleton className="h-6 w-3/4 rounded bg-gray-200" />
        <Skeleton className="h-4 w-full rounded bg-gray-200 mt-2" />
        <Skeleton className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="mt-auto pt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-28 rounded bg-gray-200" />
          <Skeleton className="h-4 w-16 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedArticleSkeleton() {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white grid grid-cols-1 md:grid-cols-2 gap-6 items-center animate-pulse">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 rounded-full bg-slate-700" />
        <Skeleton className="h-9 w-full rounded bg-slate-700" />
        <Skeleton className="h-9 w-4/5 rounded bg-slate-700" />
        <Skeleton className="h-5 w-full rounded bg-slate-700" />
        <Skeleton className="h-5 w-3/4 rounded bg-slate-700" />
        <Skeleton className="h-10 w-40 rounded-lg bg-indigo-600/50 mt-4" />
      </div>
      <Skeleton className="w-full h-64 md:h-80 rounded-xl bg-slate-700" />
    </div>
  );
}

export function ArticleDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-pulse">
      <Skeleton className="w-full h-72 md:h-96 rounded-2xl bg-gray-200" />
      <div className="flex gap-4">
        <Skeleton className="h-6 w-24 rounded-full bg-gray-200" />
        <Skeleton className="h-6 w-32 rounded bg-gray-200" />
      </div>
      <Skeleton className="h-10 w-full rounded bg-gray-200" />
      <Skeleton className="h-10 w-4/5 rounded bg-gray-200" />
      <Skeleton className="h-24 w-full rounded-xl bg-gray-200" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-5 w-full rounded bg-gray-200" />
        <Skeleton className="h-5 w-full rounded bg-gray-200" />
        <Skeleton className="h-5 w-5/6 rounded bg-gray-200" />
        <Skeleton className="h-5 w-4/5 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <FeaturedArticleSkeleton />
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </div>
      </div>
    </div>
  );
}
