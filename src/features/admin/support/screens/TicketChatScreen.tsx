import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppEmptyState } from '../../../../core/components/common/AppEmptyState';
import { AppErrorState } from '../../../../core/components/common/AppErrorState';
import { AppHeader } from '../../../../core/components/common/AppHeader';
import { SkeletonList } from '../../../../core/components/common/AppSkeleton';
import { useAuth } from '../../../../core/auth/AuthContext';
import { can } from '../../../../core/permissions/permissions';
import { colors, radius, spacing, typography } from '../../../../core/theme/theme';
import { formatDateTime } from '../../../../core/utils/format';
import type { AdminStackParamList } from '../../../../core/navigation/types';
import { useTicketDetails } from '../hooks/useTicketDetails';
import { useTicketMessages } from '../hooks/useTicketMessages';
import { useTicketReply } from '../hooks/useTicketReply';
import type { SupportTicketMessage } from '../types/support.types';

type ScreenProps = NativeStackScreenProps<AdminStackParamList, 'TicketChat'>;

interface BubbleMeta {
  mine: boolean;
  senderLabel: string | null;
}

function ChatBubble({ message, meta }: { message: SupportTicketMessage; meta: BubbleMeta }) {
  return (
    <View style={[styles.bubbleRow, meta.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
      {meta.senderLabel ? (
        <Text style={styles.senderLabel}>{meta.senderLabel}</Text>
      ) : null}
      <View style={[styles.bubble, meta.mine ? styles.bubbleMineBg : styles.bubbleTheirsBg]}>
        <Text style={[styles.bubbleText, meta.mine ? styles.bubbleTextMine : null]}>
          {message.body}
        </Text>
        <Text style={[styles.bubbleTime, meta.mine ? styles.bubbleTimeMine : null]}>
          {formatDateTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

export function TicketChatScreen({ route }: ScreenProps) {
  const { ticketId, subject } = route.params;
  const { user } = useAuth();
  const { ticket } = useTicketDetails(ticketId);
  const {
    messages,
    initialLoading,
    refreshing,
    error,
    fetchMessages,
    appendMessage,
    retry,
  } = useTicketMessages(ticketId);
  const { body, setBody, sending, error: replyError, send, clearError } = useTicketReply(
    ticketId,
    {
      onSent: message => appendMessage(message),
    },
  );
  const [inputFocused, setInputFocused] = useState(false);

  // The API returns messages oldest-first; an inverted FlatList renders
  // newest-first so the conversation stays anchored to the bottom.
  const reversed = useMemo(() => [...messages].reverse(), [messages]);

  const senderMeta = (message: SupportTicketMessage): BubbleMeta => {
    const mine = !!user && message.author_id === user.id;
    if (mine) {
      return { mine: true, senderLabel: null };
    }
    const isRequester = !!ticket && message.author_id === ticket.user_id;
    return {
      mine: false,
      senderLabel: isRequester
        ? (message.author?.full_name ?? 'Requester')
        : `${message.author?.full_name ?? 'Admin'} · Admin`,
    };
  };

  if (!can(user, 'support.manage')) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader title="Ticket Chat" showBack />
        <View style={styles.center}>
          <AppEmptyState
            title="Access Restricted"
            message="You do not have permission to view this conversation."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title={subject || 'Ticket Chat'} showBack />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        {initialLoading ? (
          <View style={styles.flex}>
            <SkeletonList count={4} />
          </View>
        ) : error && messages.length === 0 ? (
          <AppErrorState title="Unable to load the conversation" message={error} onRetry={retry} />
        ) : (
          <FlatList
            data={reversed}
            inverted
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ChatBubble message={item} meta={senderMeta(item)} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchMessages('refresh')}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyFlip}>
                <AppEmptyState
                  title="No Messages Yet"
                  message="This conversation has no messages yet. Replies will appear here."
                />
              </View>
            }
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.emptyList,
            ]}
          />
        )}

        <View style={styles.replyArea}>
          {replyError ? (
            <View style={styles.replyErrorBox} accessibilityRole="alert">
              <Text style={styles.replyErrorText}>{replyError}</Text>
            </View>
          ) : null}
          <View style={styles.replyRow}>
            <TextInput
              style={[styles.replyInput, inputFocused && styles.replyInputFocused]}
              placeholder="Write a reply…"
              placeholderTextColor={colors.textMuted}
              value={body}
              onChangeText={text => {
                setBody(text);
                if (replyError) {
                  clearError();
                }
              }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              editable={!sending}
              multiline
              accessibilityLabel="Reply"
            />
            <AppButton
              title="Send"
              onPress={send}
              loading={sending}
              disabled={sending || body.trim().length === 0}
              accessibilityLabel="Send reply"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  // inverted flips the whole content container - flip the empty state back.
  emptyFlip: {
    transform: [{ scaleY: -1 }],
  },
  bubbleRow: {
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  bubbleMine: {
    alignSelf: 'flex-end',
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
  },
  senderLabel: {
    ...typography.badge,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMineBg: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.sm,
  },
  bubbleTheirsBg: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  bubbleTextMine: {
    color: colors.white,
  },
  bubbleTime: {
    ...typography.badge,
    color: colors.textMuted,
    marginTop: 4,
  },
  bubbleTimeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  replyArea: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  replyErrorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  replyErrorText: {
    color: '#B91C1C',
    fontSize: 13,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  replyInput: {
    ...typography.body,
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    textAlignVertical: 'center',
  },
  replyInputFocused: {
    borderColor: colors.primary,
  },
});

export default TicketChatScreen;
