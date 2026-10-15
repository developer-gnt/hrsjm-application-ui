import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import type { TimelineEvent } from '../types/membership.types';

interface ApplicationTimelineProps {
  events: TimelineEvent[];
}

export function ApplicationTimeline({ events }: ApplicationTimelineProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Application Timeline</Text>

      <View style={styles.timelineList}>
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          const isCompleted = event.status === 'completed';
          const isCurrent = event.status === 'current';
          const isUpcoming = event.status === 'upcoming';

          return (
            <View key={event.id} style={styles.timelineItem}>
              {/* Left Column: Node & Connector Line */}
              <View style={styles.nodeColumn}>
                <View
                  style={[
                    styles.nodeCircle,
                    isCompleted && styles.nodeCompleted,
                    isCurrent && styles.nodeCurrent,
                    isUpcoming && styles.nodeUpcoming,
                  ]}>
                  {isCompleted ? (
                    <Icon name="check" size={12} color={colors.white} strokeWidth={3} />
                  ) : (
                    <View
                      style={[
                        styles.innerDot,
                        isCurrent && styles.innerDotCurrent,
                        isUpcoming && styles.innerDotUpcoming,
                      ]}
                    />
                  )}
                </View>

                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted && styles.connectorLineCompleted,
                    ]}
                  />
                )}
              </View>

              {/* Right Column: Content */}
              <View style={styles.contentColumn}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.eventTitle,
                      isCurrent && styles.eventTitleCurrent,
                      isUpcoming && styles.eventTitleUpcoming,
                    ]}>
                    {event.title}
                  </Text>
                  {event.dateTime ? (
                    <Text style={styles.eventDateTime}>{event.dateTime}</Text>
                  ) : null}
                </View>

                {event.description ? (
                  <Text
                    style={[
                      styles.eventDesc,
                      isUpcoming && styles.eventDescUpcoming,
                    ]}>
                    {event.description}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16274B',
    marginBottom: spacing.md,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },
  nodeColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.md,
  },
  nodeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  nodeCompleted: {
    backgroundColor: '#1B3B8C',
    borderColor: '#1B3B8C',
  },
  nodeCurrent: {
    backgroundColor: '#EAF1FE',
    borderColor: '#1B3B8C',
  },
  nodeUpcoming: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  innerDotCurrent: {
    backgroundColor: '#1B3B8C',
  },
  innerDotUpcoming: {
    backgroundColor: '#CBD5E1',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  connectorLineCompleted: {
    backgroundColor: '#1B3B8C',
  },
  contentColumn: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eventTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16274B',
  },
  eventTitleCurrent: {
    color: '#1B3B8C',
  },
  eventTitleUpcoming: {
    color: '#64748B',
    fontWeight: '600',
  },
  eventDateTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  eventDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  eventDescUpcoming: {
    color: '#94A3B8',
  },
});

export default ApplicationTimeline;
