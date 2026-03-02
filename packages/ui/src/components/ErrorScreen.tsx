/**
 * Error screen component
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface ErrorScreenProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorScreen({
  message,
  actionLabel = 'Retry',
  onAction
}: ErrorScreenProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.sunAccent,
    borderRadius: 20
  },
  buttonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600'
  }
});
