"use client"

import { useEffect } from "react"

const VIEWPORT_CONTENT =
  "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"

export default function TelegramWebAppFix() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const setViewportMeta = () => {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
      if (!meta) return
      if (meta.getAttribute("content") !== VIEWPORT_CONTENT) {
        meta.setAttribute("content", VIEWPORT_CONTENT)
      }
    }

    // Telegram WebApp sometimes loads slightly later than React hydration.
    const initTelegram = () => {
      const tg = (window as any).Telegram?.WebApp
      if (!tg) return
      try {
        tg.ready?.()
        tg.expand?.()
      } catch {
        // ignore
      }
    }

    const setAppHeight = () => {
      const tg = (window as any).Telegram?.WebApp
      const h = tg?.viewportStableHeight ?? tg?.viewportHeight ?? window.innerHeight
      document.documentElement.style.setProperty("--app-height", `${Math.round(h)}px`)
    }

    // 1) Ensure viewport meta is correct (and keep it correct).
    setViewportMeta()

    // 2) Prevent iOS gesture zoom / double-tap zoom (common in Telegram WKWebView).
    const prevent = (e: Event) => {
      // @ts-expect-error - gesture events are Safari specific
      if (e.cancelable) e.preventDefault()
    }

    document.addEventListener("gesturestart", prevent as any, { passive: false } as any)
    document.addEventListener("gesturechange", prevent as any, { passive: false } as any)
    document.addEventListener("gestureend", prevent as any, { passive: false } as any)
    document.addEventListener("dblclick", prevent as any, { passive: false } as any)

    // 3) Keep layout stable when Telegram viewport changes.
    setAppHeight()
    window.addEventListener("resize", setAppHeight)
    ;(window as any).visualViewport?.addEventListener?.("resize", setAppHeight)

    // 4) Telegram init.
    initTelegram()

    // Re-apply meta on focus changes (helps against some iOS/WebView scale glitches).
    window.addEventListener("focus", setViewportMeta)
    document.addEventListener("focusin", setViewportMeta)
    document.addEventListener("visibilitychange", setViewportMeta)

    // Subscribe to Telegram viewport events if available.
    const tg = (window as any).Telegram?.WebApp
    if (tg?.onEvent) {
      try {
        tg.onEvent("viewportChanged", setAppHeight)
      } catch {
        // ignore
      }
    }

    // If script loads after hydration, try a few times quickly.
    let tries = 0
    const t = window.setInterval(() => {
      tries += 1
      setViewportMeta()
      setAppHeight()
      initTelegram()
      if ((window as any).Telegram?.WebApp || tries >= 20) window.clearInterval(t)
    }, 100)

    return () => {
      window.clearInterval(t)
      window.removeEventListener("resize", setAppHeight)
      ;(window as any).visualViewport?.removeEventListener?.("resize", setAppHeight)

      window.removeEventListener("focus", setViewportMeta)
      document.removeEventListener("focusin", setViewportMeta)
      document.removeEventListener("visibilitychange", setViewportMeta)

      document.removeEventListener("gesturestart", prevent as any)
      document.removeEventListener("gesturechange", prevent as any)
      document.removeEventListener("gestureend", prevent as any)
      document.removeEventListener("dblclick", prevent as any)

      const tg = (window as any).Telegram?.WebApp
      if (tg?.offEvent) {
        try {
          tg.offEvent("viewportChanged", setAppHeight)
        } catch {
          // ignore
        }
      }
    }
  }, [])

  return null
}
