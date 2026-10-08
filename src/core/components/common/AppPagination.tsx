import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { AdminColors, BorderRadius, Shadows, Spacing } from '../../theme';
import { Check, ChevronDown, ChevronLeft, ChevronRight } from '../icons';

export interface AppPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
  style?: StyleProp<ViewStyle>;
}

interface AnimatedPaginationBtnProps {
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated button with smooth ease-in / ease-out micro-interactions.
 */
const AnimatedPaginationBtn: React.FC<AnimatedPaginationBtnProps> = ({
  onPress,
  disabled = false,
  active = false,
  children,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={[
          styles.btnBase,
          active && styles.btnActive,
          disabled && styles.btnDisabled,
          style,
        ]}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const AppPagination: React.FC<AppPaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'records',
  style,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Transition animation for page container
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Modal slide & fade animations
  const modalFade = useRef(new Animated.Value(0)).current;
  const modalSlide = useRef(new Animated.Value(20)).current;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Trigger smooth transition animation on page change
  const triggerPageTransition = (newPage: number) => {
    if (newPage === safePage) return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 90,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: newPage > safePage ? -6 : 6,
          duration: 90,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onPageChange(newPage);
  };

  // Animate Modal Open/Close
  useEffect(() => {
    if (dropdownOpen) {
      Animated.parallel([
        Animated.timing(modalFade, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(modalSlide, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      modalFade.setValue(0);
      modalSlide.setValue(20);
    }
  }, [dropdownOpen, modalFade, modalSlide]);

  // Generate page numbers with smart ellipsis
  const getPageItems = (): (number | string)[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safePage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }

    if (safePage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', safePage, '...', totalPages];
  };

  const pageItems = getPageItems();

  return (
    <View style={[styles.card, style]}>
      {/* 1. Header Bar: Showing Range + Rows Per Page Pill */}
      <View style={styles.topInfoRow}>
        <View style={styles.showingContainer}>
          <View style={styles.dotIndicator} />
          <Text style={styles.showingText}>
            Showing <Text style={styles.showingBold}>{startItem}–{endItem}</Text> of{' '}
            <Text style={styles.showingBold}>{totalItems}</Text> {itemLabel}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.rowsPill}
          onPress={() => setDropdownOpen(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.rowsPillLabel}>Rows</Text>
          <View style={styles.rowsPillValueBadge}>
            <Text style={styles.rowsPillValueText}>{pageSize}</Text>
            <ChevronDown size={12} color="#0F2860" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 2. Bottom Bar: Animated Page Control Buttons */}
      <Animated.View
        style={[
          styles.controlsRow,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Previous Button */}
        <AnimatedPaginationBtn
          onPress={() => {
            if (safePage > 1) triggerPageTransition(safePage - 1);
          }}
          disabled={safePage <= 1}
          style={styles.navBtn}
        >
          <ChevronLeft
            size={14}
            color={safePage <= 1 ? '#94A3B8' : '#0F2860'}
            strokeWidth={2.5}
          />
          <Text
            style={[
              styles.navBtnText,
              safePage <= 1 && styles.navBtnTextDisabled,
            ]}
          >
            Prev
          </Text>
        </AnimatedPaginationBtn>

        {/* Numbered Page Buttons with Smooth Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pagesScrollContent}
        >
          {pageItems.map((item, idx) => {
            if (typeof item === 'string') {
              return (
                <View key={`ellipsis-${idx}`} style={styles.ellipsisWrap}>
                  <Text style={styles.ellipsisText}>•••</Text>
                </View>
              );
            }

            const isActive = item === safePage;
            return (
              <AnimatedPaginationBtn
                key={`page-${item}`}
                active={isActive}
                onPress={() => triggerPageTransition(item)}
                style={styles.pageBtn}
              >
                <Text
                  style={[
                    styles.pageBtnText,
                    isActive && styles.pageBtnTextActive,
                  ]}
                >
                  {item}
                </Text>
              </AnimatedPaginationBtn>
            );
          })}
        </ScrollView>

        {/* Next Button */}
        <AnimatedPaginationBtn
          onPress={() => {
            if (safePage < totalPages) triggerPageTransition(safePage + 1);
          }}
          disabled={safePage >= totalPages}
          style={styles.navBtn}
        >
          <Text
            style={[
              styles.navBtnText,
              safePage >= totalPages && styles.navBtnTextDisabled,
            ]}
          >
            Next
          </Text>
          <ChevronRight
            size={14}
            color={safePage >= totalPages ? '#94A3B8' : '#0F2860'}
            strokeWidth={2.5}
          />
        </AnimatedPaginationBtn>
      </Animated.View>

      {/* Rows Per Page Dropdown Modal with Ease-In-Out Backdrop */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="none"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
          <Animated.View
            style={[
              styles.modalBackdrop,
              { opacity: modalFade },
            ]}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalSheet,
                  {
                    transform: [{ translateY: modalSlide }],
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTop}>
                    <View style={styles.modalDragHandle} />
                  </View>
                  <Text style={styles.modalTitle}>Select Rows Per Page</Text>
                  <Text style={styles.modalSubtitle}>
                    Choose how many items to display per page
                  </Text>
                </View>

                <View style={styles.optionsList}>
                  {pageSizeOptions.map((opt) => {
                    const isSelected = opt === pageSize;
                    return (
                      <TouchableOpacity
                        key={`opt-${opt}`}
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemSelected,
                        ]}
                        onPress={() => {
                          if (onPageSizeChange) {
                            onPageSizeChange(opt);
                          }
                          onPageChange(1);
                          setDropdownOpen(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.radioOuter,
                              isSelected && styles.radioOuterSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                            ]}
                          >
                            {opt} items per page
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Check size={13} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  showingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981', // Emerald active dot
  },
  showingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  showingBold: {
    fontWeight: '700',
    color: '#0F2860',
  },
  rowsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 3,
    gap: 5,
  },
  rowsPillLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  rowsPillValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  rowsPillValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2860',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  pagesScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  btnBase: {
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: '#0F2860', // Executive Navy
    borderColor: '#0F2860',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    gap: 3,
    backgroundColor: '#F8FAFC',
  },
  navBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F2860',
  },
  navBtnTextDisabled: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  pageBtn: {
    minWidth: 32,
    paddingHorizontal: 8,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  pageBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  ellipsisWrap: {
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipsisText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderTop: {
    alignItems: 'center',
    paddingVertical: 6,
    width: '100%',
  },
  modalDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    marginTop: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionItemSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderColor: '#0F2860',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F2860',
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#0F2860',
    fontWeight: '800',
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
