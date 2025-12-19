import { useEffect, useState, useRef, type ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  disabled?: boolean; // フルスクリーン時などに無効化するフラグ
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 80; // ピクセル: この距離を超えたらリフレッシュ
  const MAX_PULL = 120; // 最大プル距離

  useEffect(() => {
    // disabled時はイベントリスナーを登録しない
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // スクロール位置が最上部付近のときのみ有効化（より寛容に）
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop <= 5) {  // 5px以内なら許容
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;

      // 下方向のみ（プル）かつスクロール位置が最上部
      if (distance > 0 && scrollTop <= 5) {
        // 引っ張りすぎないように制限
        const boundedDistance = Math.min(distance * 0.5, MAX_PULL);
        setPullDistance(boundedDistance);

        // スクロールを防ぐ（プル中）
        if (boundedDistance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      // 閾値を超えていたらリフレッシュ
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);

        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        }

        // アニメーション後にリセット
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      } else {
        // 閾値未満なら元に戻る
        setPullDistance(0);
      }
    };

    // capture: true でイベントを早期にキャプチャ（PWA対応）
    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });

    return () => {
      // Must match the capture option used in addEventListener
      document.removeEventListener('touchstart', handleTouchStart, true);
      document.removeEventListener('touchmove', handleTouchMove, true);
      document.removeEventListener('touchend', handleTouchEnd, true);
    };
  }, [pullDistance, isRefreshing, onRefresh, disabled]);

  return (
    <>
      {/* Pull Indicator - with safe area support for PWA - hidden when disabled */}
      {!disabled && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: pullDistance,
            paddingTop: 'env(safe-area-inset-top)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.9), transparent)',
            transition: isRefreshing ? 'height 0.3s ease' : 'none',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
        {pullDistance > 10 && (
          <div
            style={{
              color: 'white',
              fontSize: '14px',
              opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isRefreshing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Refreshing...
              </>
            ) : pullDistance >= PULL_THRESHOLD ? (
              <>
                <span>↻</span>
                Release to refresh
              </>
            ) : (
              <>
                <span>↓</span>
                Pull to refresh
              </>
            )}
          </div>
        )}
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling.current ? 'none' : 'transform 0.3s ease',
        }}
      >
        {children}
      </div>
    </>
  );
}
