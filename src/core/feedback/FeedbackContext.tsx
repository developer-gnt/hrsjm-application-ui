import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  AppFeedbackModal,
  FeedbackAction,
  FeedbackTone,
} from '../components/common/AppFeedbackModal';

export interface FeedbackConfig {
  tone?: FeedbackTone;
  title: string;
  message: string;
  badgeText?: string;
  primaryAction?: FeedbackAction;
  secondaryAction?: FeedbackAction;
  onClose?: () => void;
}

interface FeedbackContextType {
  showFeedback: (config: FeedbackConfig) => void;
  showSuccess: (title: string, message: string, options?: Partial<FeedbackConfig>) => void;
  showError: (title: string, message: string, options?: Partial<FeedbackConfig>) => void;
  showWarning: (title: string, message: string, options?: Partial<FeedbackConfig>) => void;
  showInfo: (title: string, message: string, options?: Partial<FeedbackConfig>) => void;
  showConfirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => void;
  hideFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

let globalShowFeedback: ((config: FeedbackConfig) => void) | null = null;
let globalHideFeedback: (() => void) | null = null;

/**
 * Global imperative helper that can be called from anywhere (even outside React components)
 */
export const feedback = {
  show: (config: FeedbackConfig) => globalShowFeedback?.(config),
  success: (title: string, message: string, options?: Partial<FeedbackConfig>) => {
    globalShowFeedback?.({
      tone: 'success',
      title,
      message,
      badgeText: options?.badgeText || 'SUCCESS',
      primaryAction: options?.primaryAction || { text: options?.primaryAction?.text || 'Great, Done' },
      ...options,
    });
  },
  error: (title: string, message: string, options?: Partial<FeedbackConfig>) => {
    globalShowFeedback?.({
      tone: 'error',
      title,
      message,
      badgeText: options?.badgeText || 'ERROR',
      primaryAction: options?.primaryAction || { text: options?.primaryAction?.text || 'Dismiss' },
      ...options,
    });
  },
  warning: (title: string, message: string, options?: Partial<FeedbackConfig>) => {
    globalShowFeedback?.({
      tone: 'warning',
      title,
      message,
      badgeText: options?.badgeText || 'ATTENTION',
      primaryAction: options?.primaryAction || { text: options?.primaryAction?.text || 'Proceed' },
      ...options,
    });
  },
  info: (title: string, message: string, options?: Partial<FeedbackConfig>) => {
    globalShowFeedback?.({
      tone: 'info',
      title,
      message,
      badgeText: options?.badgeText || 'NOTICE',
      primaryAction: options?.primaryAction || { text: options?.primaryAction?.text || 'Got It' },
      ...options,
    });
  },
  confirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => {
    globalShowFeedback?.({
      tone: options.destructive ? 'warning' : 'info',
      title: options.title,
      message: options.message,
      badgeText: options.destructive ? 'CONFIRM' : 'ACTION REQUIRED',
      primaryAction: {
        text: options.confirmText || 'Confirm',
        variant: options.destructive ? 'destructive' : 'primary',
        onPress: options.onConfirm,
      },
      secondaryAction: {
        text: options.cancelText || 'Cancel',
        onPress: options.onCancel,
      },
    });
  },
  hide: () => globalHideFeedback?.(),
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<FeedbackConfig | null>(null);

  const hideFeedback = useCallback(() => {
    if (config?.onClose) {
      config.onClose();
    }
    setConfig(null);
  }, [config]);

  const showFeedback = useCallback((newConfig: FeedbackConfig) => {
    setConfig(newConfig);
  }, []);

  globalShowFeedback = showFeedback;
  globalHideFeedback = hideFeedback;

  const showSuccess = useCallback(
    (title: string, message: string, options?: Partial<FeedbackConfig>) => {
      showFeedback({
        tone: 'success',
        title,
        message,
        badgeText: options?.badgeText || 'SUCCESS',
        primaryAction: options?.primaryAction || { text: options?.primaryAction?.text || 'Great, Done' },
        ...options,
      });
    },
    [showFeedback],
  );

  const showError = useCallback(
    (title: string, message: string, options?: Partial<FeedbackConfig>) => {
      showFeedback({
        tone: 'error',
        title,
        message,
        badgeText: options?.badgeText || 'FAILED',
        primaryAction: options?.primaryAction || { text: options?.primaryAction?.text || 'Dismiss' },
        ...options,
      });
    },
    [showFeedback],
  );

  const showWarning = useCallback(
    (title: string, message: string, options?: Partial<FeedbackConfig>) => {
      showFeedback({
        tone: 'warning',
        title,
        message,
        badgeText: options?.badgeText || 'ATTENTION',
        primaryAction: options?.primaryAction || { text: options?.primaryAction?.text || 'Proceed' },
        ...options,
      });
    },
    [showFeedback],
  );

  const showInfo = useCallback(
    (title: string, message: string, options?: Partial<FeedbackConfig>) => {
      showFeedback({
        tone: 'info',
        title,
        message,
        badgeText: options?.badgeText || 'NOTICE',
        primaryAction: options?.primaryAction || { text: options?.primaryAction?.text || 'Got It' },
        ...options,
      });
    },
    [showFeedback],
  );

  const showConfirm = useCallback(
    (options: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      destructive?: boolean;
      onConfirm: () => void | Promise<void>;
      onCancel?: () => void;
    }) => {
      showFeedback({
        tone: options.destructive ? 'warning' : 'info',
        title: options.title,
        message: options.message,
        badgeText: options.destructive ? 'CONFIRM' : 'ACTION REQUIRED',
        primaryAction: {
          text: options.confirmText || 'Confirm',
          variant: options.destructive ? 'destructive' : 'primary',
          onPress: options.onConfirm,
        },
        secondaryAction: {
          text: options.cancelText || 'Cancel',
          onPress: options.onCancel,
        },
      });
    },
    [showFeedback],
  );

  return (
    <FeedbackContext.Provider
      value={{
        showFeedback,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        hideFeedback,
      }}
    >
      {children}
      {config ? (
        <AppFeedbackModal
          visible={Boolean(config)}
          tone={config.tone || 'success'}
          title={config.title}
          message={config.message}
          badgeText={config.badgeText}
          primaryAction={config.primaryAction}
          secondaryAction={config.secondaryAction}
          onClose={hideFeedback}
        />
      ) : null}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextType => {
  const context = useContext(FeedbackContext);
  if (!context) {
    return {
      showFeedback: feedback.show,
      showSuccess: feedback.success,
      showError: feedback.error,
      showWarning: feedback.warning,
      showInfo: feedback.info,
      showConfirm: feedback.confirm,
      hideFeedback: feedback.hide,
    };
  }
  return context;
};
