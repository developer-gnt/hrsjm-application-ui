import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { AccountTreeNode } from '../types/accounting.types';
import { AccountNodeRow } from './AccountNodeRow';

interface AccountTreeProps {
  nodes: AccountTreeNode[];
  onSelectNode: (node: AccountTreeNode) => void;
}

export const AccountTree: React.FC<AccountTreeProps> = ({
  nodes,
  onSelectNode,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    // Top-level root categories are expanded by default
    const initial: Record<string, boolean> = {};
    nodes.forEach(node => {
      initial[node.id] = true;
    });
    return initial;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderBranch = (branchNodes: AccountTreeNode[]) => {
    return branchNodes.map(node => {
      const isExpanded = !!expandedIds[node.id];
      const hasChildren = node.children && node.children.length > 0;

      return (
        <View key={node.id}>
          <AccountNodeRow
            node={node}
            isExpanded={isExpanded}
            onToggleExpand={toggleExpand}
            onPress={onSelectNode}
          />
          {hasChildren && isExpanded && (
            <View style={styles.branchContainer}>
              {renderBranch(node.children)}
            </View>
          )}
        </View>
      );
    });
  };

  return <View style={styles.treeContainer}>{renderBranch(nodes)}</View>;
};

const styles = StyleSheet.create({
  treeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  branchContainer: {
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },
});
