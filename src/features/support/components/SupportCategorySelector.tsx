import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { APPROVED_TICKET_CATEGORIES } from '../data/categories';
import { CategoryIcon, ChevronDownIcon, ChevronUpIcon } from './SupportIcons';

interface SupportCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  error?: string;
}

export const SupportCategorySelector: React.FC<SupportCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  error,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Find currently selected category metadata if any
  const currentCategoryObj = APPROVED_TICKET_CATEGORIES.find(
    c => c.name.toLowerCase() === selectedCategory?.toLowerCase()
  );

  const handleSelect = (categoryName: string) => {
    onSelectCategory(categoryName);
    setIsExpanded(false); // Collapses panel inline on selection per requirements
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>Ticket Category</Text>
        <Text style={styles.requiredAsterisk}> *</Text>
      </View>

      {/* Main Selector Button (Collapsed state) */}
      <TouchableOpacity
        style={[
          styles.selectorButton,
          isExpanded && styles.selectorButtonExpanded,
          !!error && !isExpanded && styles.selectorButtonError,
        ]}
        onPress={() => setIsExpanded(prev => !prev)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={
          selectedCategory
            ? `Selected category: ${selectedCategory}. Tap to change category.`
            : 'Select a ticket category'
        }
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.selectorLeft}>
          <View
            style={[
              styles.iconTile,
              { backgroundColor: currentCategoryObj?.bgColor || '#EFF6FF' },
            ]}
          >
            {currentCategoryObj ? (
              <CategoryIcon category={currentCategoryObj.name} size={20} />
            ) : (
              <Text style={styles.defaultIconText}>📄</Text>
            )}
          </View>
          <View style={styles.selectorTextColumn}>
            <Text
              style={[
                styles.selectorTitle,
                !selectedCategory && styles.selectorTitlePlaceholder,
              ]}
              numberOfLines={1}
            >
              {currentCategoryObj ? currentCategoryObj.name : 'Select a ticket category'}
            </Text>
            <Text style={styles.selectorSubtitle} numberOfLines={1}>
              {currentCategoryObj
                ? currentCategoryObj.helperText
                : 'Choose the most appropriate category'}
            </Text>
          </View>
        </View>

        <View style={styles.chevronContainer}>
          {isExpanded ? (
            <ChevronUpIcon size={16} color={AdminColors.primary} />
          ) : (
            <ChevronDownIcon size={16} color={AdminColors.primary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Validation Error Message */}
      {!!error && !isExpanded && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Inline Expanded Dropdown (Screen 3) */}
      {/* Pushes content below it downward, does not float or obscure */}
      {isExpanded && (
        <View style={styles.expandedPanel}>
          <ScrollView
            style={styles.categoryScrollList}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {APPROVED_TICKET_CATEGORIES.map(category => {
              const isSelected =
                selectedCategory.toLowerCase() === category.name.toLowerCase();

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                  ]}
                  onPress={() => handleSelect(category.name)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${category.name}: ${category.helperText}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  {/* Category Icon Tile */}
                  <View
                    style={[
                      styles.categoryIconTile,
                      { backgroundColor: category.bgColor },
                    ]}
                  >
                    <CategoryIcon category={category.name} size={20} />
                  </View>

                  {/* Title and Short Explanation */}
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {category.name}
                    </Text>
                    <Text style={styles.categoryHelperText} numberOfLines={2}>
                      {category.helperText}
                    </Text>
                  </View>

                  {/* Radio Control */}
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm + 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  requiredAsterisk: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  selectorButtonExpanded: {
    borderColor: AdminColors.primary,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  selectorButtonError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  defaultIconText: {
    fontSize: 18,
  },
  selectorTextColumn: {
    flex: 1,
  },
  selectorTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectorTitlePlaceholder: {
    color: '#1E3A8A',
  },
  selectorSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1.5,
  },
  chevronContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 11.5,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '600',
  },
  expandedPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: AdminColors.primary,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  // Viewport sized to display exactly four category cards at a time per requirement
  categoryScrollList: {
    maxHeight: 260,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  categoryIconTile: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryDetails: {
    flex: 1,
    paddingRight: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryHelperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 14,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: AdminColors.primary,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: AdminColors.primary,
  },
});
