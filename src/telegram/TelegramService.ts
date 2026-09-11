/**
 * Telegram WebApp SDK abstraction.
 * Provides mock/fallback when running outside Telegram.
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramTheme {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: { user?: TelegramUser; query_id?: string; auth_date?: number; hash?: string };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: TelegramTheme;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        BackButton: {
          isVisible: boolean;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        MainButton: {
          text: string;
          setText: (text: string) => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
      };
    };
  }
}

const MOCK_USER: TelegramUser = { id: 0, first_name: 'Developer', username: 'dev', language_code: 'en' };
const MOCK_THEME: TelegramTheme = {
  bg_color: '#0a0a0f', text_color: '#ffffff', hint_color: '#888888',
  link_color: '#64b5f6', button_color: '#4a3728', button_text_color: '#ffffff',
  secondary_bg_color: '#1a1a24',
};

export class TelegramService {
  private static webApp: typeof window.Telegram.WebApp | null = null;
  private static isTelegram = false;

  static init(): void {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.isTelegram = true;
      this.webApp.ready();
      this.webApp.expand();
      this.webApp.setHeaderColor('#0a0a0f');
      this.webApp.setBackgroundColor('#0a0a0f');
      console.log('[Telegram] Initialized, platform:', this.webApp.platform);
    } else {
      console.log('[Telegram] Running outside Telegram — using mock');
    }
  }

  static get isInTelegram(): boolean { return this.isTelegram; }

  static getUser(): TelegramUser {
    return this.webApp?.initDataUnsafe?.user ?? MOCK_USER;
  }

  static getTheme(): TelegramTheme {
    return this.webApp?.themeParams ? { ...MOCK_THEME, ...this.webApp.themeParams } : MOCK_THEME;
  }

  static getColorScheme(): 'light' | 'dark' {
    return this.webApp?.colorScheme ?? 'dark';
  }

  static getViewportHeight(): number {
    return this.webApp?.viewportStableHeight ?? window.innerHeight;
  }

  static showBackButton(callback: () => void): void {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.onClick(callback);
      this.webApp.BackButton.show();
    }
  }

  static hideBackButton(): void {
    this.webApp?.BackButton?.hide();
  }

  static showMainButton(text: string, callback: () => void): void {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.setText(text);
      this.webApp.MainButton.onClick(callback);
      this.webApp.MainButton.show();
      this.webApp.MainButton.enable();
    }
  }

  static hideMainButton(): void {
    this.webApp?.MainButton?.hide();
  }

  static haptic(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void {
    try { this.webApp?.HapticFeedback?.impactOccurred(style); } catch { /* unsupported */ }
  }

  static hapticSuccess(): void {
    try { this.webApp?.HapticFeedback?.notificationOccurred('success'); } catch { /* */ }
  }

  static hapticError(): void {
    try { this.webApp?.HapticFeedback?.notificationOccurred('error'); } catch { /* */ }
  }

  static hapticSelection(): void {
    try { this.webApp?.HapticFeedback?.selectionChanged(); } catch { /* */ }
  }

  static showAlert(message: string): void {
    if (this.webApp?.showAlert) this.webApp.showAlert(message);
    else alert(message);
  }

  static close(): void {
    this.webApp?.close();
  }
}
