import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollBehavior(threshold = 4) {
  const scrolled = ref(false)

  function onScroll(e: Event) {
    const target = e.target as HTMLElement
    scrolled.value = target.scrollTop > threshold
  }

  return { scrolled, onScroll }
}

export function useBreakpoint() {
  const isTablet = ref(window.innerWidth >= 600)
  const isDesktop = ref(window.innerWidth >= 840)

  function update() {
    isTablet.value = window.innerWidth >= 600
    isDesktop.value = window.innerWidth >= 840
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { isTablet, isDesktop }
}

export function useSwipeBack(onBack: () => void, threshold = 80) {
  let startX = 0
  let startY = 0

  function onTouchStart(e: TouchEvent) {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  }

  function onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - startX
    const dy = Math.abs(e.changedTouches[0].clientY - startY)
    // 横向滑动且起点在左侧 60px 内
    if (dx > threshold && dy < 60 && startX < 60) {
      onBack()
    }
  }

  onMounted(() => {
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchend', onTouchEnd)
  })
}
