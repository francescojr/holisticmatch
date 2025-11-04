/**
 * Loading skeleton component for dashboard
 * Shows placeholder content while data is loading
 */
import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* Left Sidebar Skeleton */}
      <aside className="lg:col-span-3">
        <div className="sticky top-28 flex flex-col gap-6">
          {/* Profile Photo Skeleton */}
          <div className="flex flex-col items-center text-center gap-4 p-4">
            <LoadingSkeleton className="size-28 rounded-full" />
            <div className="flex flex-col gap-2">
              <LoadingSkeleton className="h-6 w-32" />
              <LoadingSkeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Navigation Buttons Skeleton */}
          <div className="flex flex-col gap-2">
            <LoadingSkeleton className="h-12 w-full rounded-lg" />
            <LoadingSkeleton className="h-12 w-full rounded-lg" />
            <LoadingSkeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="lg:col-span-9">
        <div className="bg-white dark:bg-[#1a2e22] rounded-xl border border-[#dbe6e0] dark:border-[#2a3f34] p-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <LoadingSkeleton className="h-8 w-48 mb-2" />
              <LoadingSkeleton className="h-4 w-64" />
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <LoadingSkeleton className="h-4 w-24 mb-2" />
                <LoadingSkeleton className="h-12 w-full rounded-md" />
              </div>
              <div>
                <LoadingSkeleton className="h-4 w-20 mb-2" />
                <LoadingSkeleton className="h-12 w-full rounded-md" />
              </div>
            </div>

            <div>
              <LoadingSkeleton className="h-4 w-16 mb-2" />
              <LoadingSkeleton className="h-32 w-full rounded-md" />
            </div>

            {/* Services Skeleton */}
            <div>
              <LoadingSkeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <LoadingSkeleton className="h-16 w-full rounded-lg" />
                <LoadingSkeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  )
}