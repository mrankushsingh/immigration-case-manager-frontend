// Base Skeleton component with shimmer animation
export function Skeleton({ className = '', width, height }: { className?: string; width?: string | number; height?: string | number }) {
  return (
    <div
      className={`rounded ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        background: 'linear-gradient(90deg, #e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// Skeleton for statistic cards
export function SkeletonStatCard() {
  return (
    <div className="glass-gold rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-amber-200/50 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32 bg-amber-200/50" />
        <Skeleton className="h-10 w-10 rounded-xl bg-amber-200/50" />
      </div>
      <Skeleton className="h-8 w-24 mb-2 bg-amber-200/50" />
      <Skeleton className="h-4 w-40 bg-amber-200/50" />
    </div>
  );
}

// Skeleton for client cards
export function SkeletonClientCard() {
  return (
    <div className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2 bg-amber-200/50" />
          <Skeleton className="h-4 w-24 bg-amber-200/50" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-lg bg-amber-200/50" />
          <Skeleton className="h-8 w-8 rounded-lg bg-amber-200/50" />
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-amber-200/50">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 bg-amber-200/50" />
          <Skeleton className="h-4 w-12 bg-amber-200/50" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 bg-amber-200/50" />
          <Skeleton className="h-4 w-16 bg-amber-200/50" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for user cards
export function SkeletonUserCard() {
  return (
    <div className="glass-gold rounded-xl sm:rounded-2xl p-5 sm:p-6 animate-pulse border-2 border-amber-200/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-xl bg-amber-200/50" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-amber-200/50" />
            <div className="flex space-x-2">
              <Skeleton className="h-5 w-16 rounded-full bg-amber-200/50" />
              <Skeleton className="h-5 w-16 rounded-full bg-amber-200/50" />
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg bg-amber-200/50" />
      </div>
      <div className="space-y-2 pt-4 border-t border-amber-200/50">
        <Skeleton className="h-4 w-full bg-amber-200/50" />
        <Skeleton className="h-4 w-3/4 bg-amber-200/50" />
      </div>
    </div>
  );
}

// Skeleton for template cards
export function SkeletonTemplateCard() {
  return (
    <div className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-40 mb-2 bg-amber-200/50" />
          <Skeleton className="h-4 w-full mb-1 bg-amber-200/50" />
          <Skeleton className="h-4 w-3/4 bg-amber-200/50" />
        </div>
        <div className="flex space-x-1 ml-2">
          <Skeleton className="h-8 w-8 rounded-lg bg-amber-200/50" />
          <Skeleton className="h-8 w-8 rounded-lg bg-amber-200/50" />
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-amber-200/50">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 bg-amber-200/50" />
          <Skeleton className="h-6 w-12 rounded-lg bg-amber-200/50" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32 bg-amber-200/50" />
          <Skeleton className="h-4 w-16 bg-amber-200/50" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28 bg-amber-200/50" />
          <Skeleton className="h-4 w-16 bg-amber-200/50" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for dashboard boxes
export function SkeletonDashboardBox() {
  return (
    <div className="glass-gold rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-amber-200/50 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="h-12 w-12 rounded-xl bg-amber-200/50" />
        <div className="flex-1">
          <Skeleton className="h-6 w-40 mb-2 bg-amber-200/50" />
          <Skeleton className="h-4 w-32 bg-amber-200/50" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-amber-200/50" />
        <Skeleton className="h-4 w-3/4 bg-amber-200/50" />
        <Skeleton className="h-4 w-1/2 bg-amber-200/50" />
      </div>
    </div>
  );
}

// Skeleton for list items
export function SkeletonListItem() {
  return (
    <div className="glass-gold rounded-xl p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-lg bg-amber-200/50" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48 bg-amber-200/50" />
          <Skeleton className="h-4 w-32 bg-amber-200/50" />
        </div>
        <Skeleton className="h-8 w-20 bg-amber-200/50" />
      </div>
    </div>
  );
}

// Skeleton for table rows
export function SkeletonTableRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><Skeleton className="h-4 w-24 bg-amber-200/50" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-32 bg-amber-200/50" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-40 bg-amber-200/50" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20 bg-amber-200/50" /></td>
    </tr>
  );
}

// Skeleton for chart containers
export function SkeletonChart() {
  return (
    <div className="glass-gold rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-amber-200/50 animate-pulse">
      <Skeleton className="h-6 w-48 mb-4 bg-amber-200/50" />
      <Skeleton className="h-64 w-full rounded-lg bg-amber-200/50" />
    </div>
  );
}

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
  if (!document.head.querySelector('style[data-skeleton]')) {
    style.setAttribute('data-skeleton', 'true');
    document.head.appendChild(style);
  }
}

