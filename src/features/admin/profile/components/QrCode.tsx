/**
 * QR-style code rendered with views from the same deterministic matrix
 * the PDF generator uses, so the preview and the downloadable card are
 * always identical for a member ID.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdminColors } from '../../../../core';
import { getQrMatrix } from '../utils/qrPattern';

interface QrCodeProps {
  size: number;
  data: string;
}

export const QrCode: React.FC<QrCodeProps> = ({ size, data }) => {
  const matrix = useMemo(() => getQrMatrix(data), [data]);

  const quietZone = size * 0.06;
  const gridArea = size - quietZone * 2;
  const module = gridArea / matrix.length;

  // Render each row as dark run-length segments separated by clear
  // spacers — far fewer views than one view per module.
  const rows = matrix.map((row, rowIndex) => {
    const segments: Array<{ dark: boolean; count: number }> = [];
    row.forEach(dark => {
      const last = segments[segments.length - 1];
      if (last && last.dark === dark) {
        last.count += 1;
      } else {
        segments.push({ dark, count: 1 });
      }
    });
    return { rowIndex, segments };
  });

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: size * 0.09,
          padding: quietZone,
        },
      ]}
    >
      {rows.map(({ rowIndex, segments }) => (
        <View key={rowIndex} style={styles.row}>
          {segments.map((segment, segmentIndex) => (
            <View
              key={segmentIndex}
              style={{
                width: segment.count * module,
                height: module,
                backgroundColor: segment.dark
                  ? AdminColors.textPrimary
                  : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
