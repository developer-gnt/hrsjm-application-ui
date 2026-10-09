import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { SupportTicket, TicketAttachment } from '../types/ticket.types';
import { APPROVED_TICKET_CATEGORIES } from '../data/categories';
import { CategoryIcon } from './SupportIcons';

interface SupportTicketDetailsModalProps {
  visible: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
}

const STATUS_BADGE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    bg: '#FEF3C7',
    text: '#B45309',
    border: '#FDE68A',
    dot: '#D97706',
  },
  open: {
    label: 'Open',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
    dot: '#2563EB',
  },
  in_progress: {
    label: 'In Progress',
    bg: '#FFFBEB',
    text: '#D97706',
    border: '#FDE68A',
    dot: '#F59E0B',
  },
  resolved: {
    label: 'Resolved',
    bg: '#F0FDF4',
    text: '#16A34A',
    border: '#BBF7D0',
    dot: '#10B981',
  },
  closed: {
    label: 'Closed',
    bg: '#FEF2F2',
    text: '#DC2626',
    border: '#FECACA',
    dot: '#EF4444',
  },
};

const getFileIcon = (ext: string): { icon: string; bg: string } => {
  const norm = ext.toLowerCase();
  if (norm === 'pdf') return { icon: '📄', bg: '#FEE2E2' };
  if (norm === 'doc' || norm === 'docx') return { icon: '📝', bg: '#DBEAFE' };
  if (['jpg', 'jpeg', 'png', 'webp'].includes(norm)) return { icon: '🖼️', bg: '#DCFCE7' };
  return { icon: '📎', bg: '#F1F5F9' };
};

export const SupportTicketDetailsModal: React.FC<SupportTicketDetailsModalProps> = ({
  visible,
  ticket,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [previewFile, setPreviewFile] = useState<TicketAttachment | null>(null);

  if (!ticket) return null;

  const categoryObj = APPROVED_TICKET_CATEGORIES.find(
    c => c.name.toLowerCase() === ticket.category.toLowerCase()
  );

  const statusCfg =
    STATUS_BADGE_CONFIG[ticket.status] || STATUS_BADGE_CONFIG.pending;

  const handleCopyId = () => {
    const textToCopy = ticket.ticketNumber.replace(/^#/, '');
    const nav = typeof globalThis !== 'undefined' ? (globalThis as any).navigator : undefined;
    if (nav && nav.clipboard && nav.clipboard.writeText) {
      nav.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewFile = (file: TicketAttachment) => {
    setPreviewFile(file);
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    if (file.uri && win && win.open && (file.uri.startsWith('blob:') || file.uri.startsWith('http'))) {
      try {
        win.open(file.uri, '_blank');
      } catch (e) {
        // Fallback
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusCfg.bg, borderColor: statusCfg.border },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: statusCfg.dot }]} />
                <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
                  {statusCfg.label}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close ticket details"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Body */}
          <ScrollView
            style={styles.bodyScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Actions Row: Copy Ticket ID & Date */}
            <View style={styles.metaRow}>
              <TouchableOpacity
                style={[styles.copyChip, copied && styles.copyChipActive]}
                onPress={handleCopyId}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Copy ticket number"
              >
                <Text style={styles.copyChipIcon}>{copied ? '✓' : '📋'}</Text>
                <Text style={[styles.copyChipText, copied && styles.copyChipTextActive]}>
                  {copied ? 'Copied' : 'Copy ID'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.dateText}>
                📅 {ticket.formattedDate}
              </Text>
            </View>

            {/* Category Box */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CATEGORY</Text>
              <View style={styles.categoryCard}>
                <View
                  style={[
                    styles.categoryIconTile,
                    { backgroundColor: categoryObj?.bgColor || '#EFF6FF' },
                  ]}
                >
                  <CategoryIcon category={ticket.category} size={20} />
                </View>
                <View style={styles.categoryTextWrap}>
                  <Text style={styles.categoryTitle}>{ticket.category}</Text>
                  <Text style={styles.categorySubtitle}>
                    {categoryObj?.helperText || 'Support request category'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Subject */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SUBJECT</Text>
              <View style={styles.textBox}>
                <Text style={styles.subjectText}>{ticket.subject}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DESCRIPTION</Text>
              <View style={styles.descBox}>
                <Text style={styles.descText}>{ticket.description}</Text>
              </View>
            </View>

            {/* Attached Files */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {`ATTACHMENTS (${ticket.attachments?.length || 0})`}
              </Text>

              {ticket.attachments && ticket.attachments.length > 0 ? (
                <View style={styles.filesGrid}>
                  {ticket.attachments.map(file => {
                    const iconCfg = getFileIcon(file.type);
                    return (
                      <View key={file.id} style={styles.fileItem}>
                        <View
                          style={[
                            styles.fileIconTile,
                            { backgroundColor: iconCfg.bg },
                          ]}
                        >
                          <Text style={styles.fileEmoji}>{iconCfg.icon}</Text>
                        </View>
                        <View style={styles.fileDetails}>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {file.name}
                          </Text>
                          <Text style={styles.fileSize}>
                            {file.formattedSize}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.viewFileButton}
                          onPress={() => handleViewFile(file)}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={`View document ${file.name}`}
                        >
                          <Text style={styles.viewFileText}>View 👁️</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noFilesBox}>
                  <Text style={styles.noFilesText}>No files attached to this ticket</Text>
                </View>
              )}
            </View>

            {/* Timeline / SLA Note */}
            <View style={styles.slaBox}>
              <Text style={styles.slaIcon}>ℹ️</Text>
              <Text style={styles.slaText}>
                Support staff are reviewing this ticket. Status updates are reflected here in real time.
              </Text>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeFooterBtn}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Close ticket details"
            >
              <Text style={styles.closeFooterBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Nested Document Preview Modal */}
      {previewFile && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewFile(null)}
        >
          <View style={styles.nestedOverlay}>
            <View style={styles.nestedCard}>
              <View style={styles.nestedHeader}>
                <Text style={styles.nestedTitle} numberOfLines={1}>
                  {previewFile.name}
                </Text>
                <TouchableOpacity
                  style={styles.nestedClose}
                  onPress={() => setPreviewFile(null)}
                >
                  <Text style={styles.nestedCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.nestedBody}>
                {['jpg', 'jpeg', 'png', 'webp'].includes(previewFile.type.toLowerCase()) && previewFile.uri ? (
                  <Image
                    source={{ uri: previewFile.uri }}
                    style={styles.nestedImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.nestedPlaceholder}>
                    <Text style={styles.nestedEmoji}>{getFileIcon(previewFile.type).icon}</Text>
                    <Text style={styles.nestedFileName}>{previewFile.name}</Text>
                    <Text style={styles.nestedMeta}>
                      {previewFile.type.toUpperCase()} • {previewFile.formattedSize}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.nestedFooter}>
                {previewFile.uri && (
                  <TouchableOpacity
                    style={styles.nestedOpenBtn}
                    onPress={() => {
                      const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
                      if (win && win.open) win.open(previewFile.uri, '_blank');
                    }}
                  >
                    <Text style={styles.nestedOpenText}>Open in New Window ↗</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.nestedCloseBtn}
                  onPress={() => setPreviewFile(null)}
                >
                  <Text style={styles.nestedCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    maxWidth: 560,
    width: '100%',
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  bodyScroll: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  copyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  copyChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  copyChipIcon: {
    fontSize: 11,
  },
  copyChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  copyChipTextActive: {
    color: '#16A34A',
  },
  dateText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.sm + 4,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 9,
  },
  categoryIconTile: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryTextWrap: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  categorySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  textBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subjectText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 18,
  },
  descBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 65,
  },
  descText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  filesGrid: {
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  fileIconTile: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  fileEmoji: {
    fontSize: 15,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  fileSize: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  viewFileButton: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginLeft: 6,
  },
  viewFileText: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  noFilesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  noFilesText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  slaBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: BorderRadius.md,
    padding: 9,
    gap: 8,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  slaIcon: {
    fontSize: 14,
  },
  slaText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  closeFooterBtn: {
    backgroundColor: AdminColors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeFooterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nestedOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  nestedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    maxWidth: 480,
    width: '100%',
    overflow: 'hidden',
  },
  nestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  nestedTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F2860',
    flex: 1,
  },
  nestedClose: {
    padding: 4,
  },
  nestedCloseText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  nestedBody: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nestedImage: {
    width: '100%',
    height: 240,
  },
  nestedPlaceholder: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  nestedEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  nestedFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  nestedMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  nestedFooter: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  nestedOpenBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  nestedOpenText: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  nestedCloseBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  nestedCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
});
