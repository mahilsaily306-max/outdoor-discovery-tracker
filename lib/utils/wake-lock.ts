/**
 * Screen Wake Lock API helper to keep screen awake during glanceable timer mode.
 */

// WakeLockSentinel interface
interface WakeLockSentinelLike extends EventTarget {
  released: boolean;
  type: string;
  release(): Promise<void>;
  onrelease: ((this: WakeLockSentinelLike, ev: Event) => unknown) | null;
}

export function isWakeLockSupported(): boolean {
  return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

export class ScreenWakeLockManager {
  private sentinel: WakeLockSentinelLike | null = null;
  private isRequested = false;

  async request(): Promise<boolean> {
    if (!isWakeLockSupported()) return false;
    this.isRequested = true;

    try {
      const navWithWakeLock = navigator as unknown as {
        wakeLock: { request: (type: string) => Promise<WakeLockSentinelLike> };
      };
      this.sentinel = await navWithWakeLock.wakeLock.request("screen");
      this.sentinel.onrelease = () => {
        this.sentinel = null;
      };
      return true;
    } catch (err) {
      console.warn("Could not acquire screen wake lock:", err);
      this.sentinel = null;
      return false;
    }
  }

  async release(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {}
      this.sentinel = null;
    }
  }

  // Handle visibility change: re-acquire if returning to page and requested
  handleVisibilityChange(): void {
    if (document.visibilityState === "visible" && this.isRequested && !this.sentinel) {
      this.request().catch(() => {});
    }
  }
}
