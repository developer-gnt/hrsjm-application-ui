import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import { AppBottomSheet } from '../../../core/components/common/AppBottomSheet';

interface InfoSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function MembershipBenefitsSheet({ visible, onClose }: InfoSheetProps) {
  const benefits = [
    {
      icon: 'award',
      title: 'Official Membership ID Card',
      desc: 'Receive an official physical & digital membership badge recognizing your civic contribution.',
    },
    {
      icon: 'shield-check',
      title: 'Legal Aid & Human Rights Support',
      desc: 'Priority assistance from HRSJM state legal panels for civil and human rights grievances.',
    },
    {
      icon: 'users',
      title: 'State & National Conventions',
      desc: 'Invitation to annual general meetings, social development summits, and grassroots conventions.',
    },
    {
      icon: 'file-text',
      title: 'Social Impact Reports',
      desc: 'Quarterly newsletter and impact reports on grassroots initiatives and community drives.',
    },
  ];

  return (
    <AppBottomSheet visible={visible} title="Membership Benefits" onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
        <View style={styles.list}>
          {benefits.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.iconBox}>
                <Icon name={item.icon as any} size={20} color={colors.primary} strokeWidth={2.2} />
              </View>
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppBottomSheet>
  );
}

export function MembershipTypesSheet({ visible, onClose }: InfoSheetProps) {
  const types = [
    {
      title: 'Individual Membership',
      tag: 'Most Popular',
      fee: '₹1,000 / year',
      desc: 'For individual citizens passionate about protecting human rights and supporting local communities.',
    },
    {
      title: 'Lifetime Membership',
      tag: 'Permanent Patron',
      fee: '₹10,000 one-time',
      desc: 'Permanent patron membership with honorary status at national assemblies and decision forums.',
    },
    {
      title: 'Student Membership',
      tag: 'Youth Wing',
      fee: '₹500 / year',
      desc: 'Special subsidized membership for students and youth leaders under 25 years of age.',
    },
  ];

  return (
    <AppBottomSheet visible={visible} title="Membership Categories" onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
        <View style={styles.list}>
          {types.map((item, index) => (
            <View key={index} style={styles.typeCard}>
              <View style={styles.typeHeader}>
                <Text style={styles.typeTitle}>{item.title}</Text>
                <View style={styles.typeTag}>
                  <Text style={styles.typeTagText}>{item.tag}</Text>
                </View>
              </View>
              <Text style={styles.typeFee}>{item.fee}</Text>
              <Text style={styles.typeDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppBottomSheet>
  );
}

export function NeedHelpSheet({ visible, onClose }: InfoSheetProps) {
  return (
    <AppBottomSheet visible={visible} title="Need Help?" onClose={onClose}>
      <View style={styles.helpWrap}>
        <Text style={styles.helpIntro}>
          Our support desk is available to assist you with any questions regarding membership registration or application status.
        </Text>

        <View style={styles.contactItem}>
          <Icon name="phone" size={18} color={colors.primary} strokeWidth={2.2} />
          <View>
            <Text style={styles.contactLabel}>Helpline Support</Text>
            <Text style={styles.contactVal}>+91 1800 200 4775 (10 AM - 6 PM)</Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <Icon name="mail" size={18} color={colors.primary} strokeWidth={2.2} />
          <View>
            <Text style={styles.contactLabel}>Email Inquiries</Text>
            <Text style={styles.contactVal}>membership@hrsjm.org</Text>
          </View>
        </View>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetScroll: {
    maxHeight: 400,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E9F0FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16274B',
  },
  itemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  typeCard: {
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16274B',
  },
  typeTag: {
    backgroundColor: 'rgba(27, 59, 140, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  typeFee: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F2860',
    marginTop: 4,
  },
  typeDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 17,
  },
  helpWrap: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  helpIntro: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#F8FAFD',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contactVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16274B',
    marginTop: 2,
  },
});
