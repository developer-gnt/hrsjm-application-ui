import { useState, useEffect, useCallback, useRef } from 'react';
import { Keyboard, Platform, EmitterSubscription } from 'react-native';

interface UseKeyboardSpacingOptions {
  basePadding?: number;
  extraPadding?: number;
  minKeyboardHeight?: number;
}

export function useKeyboardSpacing(options: UseKeyboardSpacingOptions = {}) {
  const {
    basePadding = 60,
    extraPadding = 40,
    minKeyboardHeight = 320,
  } = options;

  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const activeInputRef = useRef<any>(null);

  useEffect(() => {
    // 1. Native Keyboard listeners
    let showSub: EmitterSubscription | null = null;
    let hideSub: EmitterSubscription | null = null;

    if (Platform.OS !== 'web') {
      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      showSub = Keyboard.addListener(showEvent, e => {
        const height = e?.endCoordinates?.height || minKeyboardHeight;
        setKeyboardHeight(height);
        setIsKeyboardVisible(true);
      });

      hideSub = Keyboard.addListener(hideEvent, () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      });
    }

    // 2. Web VisualViewport & Focus listeners
    let onVisualViewportResize: (() => void) | null = null;
    let onFocusIn: ((e: any) => void) | null = null;
    let onFocusOut: ((e: any) => void) | null = null;

    if (typeof window !== 'undefined') {
      const vv = window.visualViewport;

      if (vv) {
        onVisualViewportResize = () => {
          const vh = vv.height;
          const wh = window.innerHeight;
          const diff = wh - vh;
          if (diff > 100) {
            setKeyboardHeight(diff);
            setIsKeyboardVisible(true);
          } else if (!activeInputRef.current) {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);
          }
        };
        vv.addEventListener('resize', onVisualViewportResize);
      }

      onFocusIn = (e: any) => {
        const target = e.target;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.getAttribute?.('contenteditable') === 'true')
        ) {
          activeInputRef.current = target;
          setIsKeyboardVisible(true);
          setKeyboardHeight(prev => (prev > 100 ? prev : minKeyboardHeight));

          // Smoothly scroll the focused element into view
          setTimeout(() => {
            try {
              target.scrollIntoView?.({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
              });
            } catch {}
          }, 250);
        }
      };

      onFocusOut = () => {
        activeInputRef.current = null;
        setTimeout(() => {
          if (!activeInputRef.current) {
            if (window.visualViewport) {
              const diff = window.innerHeight - (window.visualViewport.height || window.innerHeight);
              if (diff <= 100) {
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
              }
            } else {
              setKeyboardHeight(0);
              setIsKeyboardVisible(false);
            }
          }
        }, 150);
      };

      window.addEventListener('focusin', onFocusIn);
      window.addEventListener('focusout', onFocusOut);
    }

    return () => {
      showSub?.remove();
      hideSub?.remove();
      if (typeof window !== 'undefined') {
        if (window.visualViewport && onVisualViewportResize) {
          window.visualViewport.removeEventListener('resize', onVisualViewportResize);
        }
        if (onFocusIn) window.removeEventListener('focusin', onFocusIn);
        if (onFocusOut) window.removeEventListener('focusout', onFocusOut);
      }
    };
  }, [minKeyboardHeight]);

  const handleInputFocus = useCallback((e?: any) => {
    setIsKeyboardVisible(true);
    setKeyboardHeight(prev => (prev > 100 ? prev : minKeyboardHeight));

    const target = e?.target || e?.currentTarget;
    if (target?.scrollIntoView) {
      setTimeout(() => {
        try {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        } catch {}
      }, 200);
    }
  }, [minKeyboardHeight]);

  const keyboardPadding = isKeyboardVisible
    ? Math.max(keyboardHeight + extraPadding, minKeyboardHeight + extraPadding)
    : basePadding;

  return {
    keyboardHeight,
    isKeyboardVisible,
    keyboardPadding,
    handleInputFocus,
    dismissKeyboard: Keyboard.dismiss,
  };
}

