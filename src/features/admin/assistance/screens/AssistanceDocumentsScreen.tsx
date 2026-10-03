import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import type { AppStackParamList } from '../../../../core/navigation/types';
import { AssistanceDocuments } from '../components/AssistanceDocuments';

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'AssistanceDocuments'>;

export function AssistanceDocumentsScreen({ route, navigation }: ScreenProps) {
  const { requestId, seekerName } = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader title="Documents" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Supporting documents from {seekerName}</Text>
        <AssistanceDocuments requestId={requestId} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});

export default AssistanceDocumentsScreen;
