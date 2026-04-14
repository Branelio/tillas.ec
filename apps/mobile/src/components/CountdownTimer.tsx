import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes } from '../constants/theme';

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
}

export default function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setRemaining(diff);
      if (diff <= 0) {
        clearInterval(intervalRef.current);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [expiresAt]);

  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isUrgent = totalSeconds <= 60;
  const progress = Math.min(1, remaining / (15 * 60 * 1000));

  return (
    <View style={styles.container}>
      <Text style={[styles.timer, isUrgent && styles.urgent]}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
      {/* Progress bar */}
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }, isUrgent && styles.barUrgent]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  timer: { fontSize: FontSizes.hero, fontWeight: '900', color: Colors.primary, letterSpacing: 4 },
  urgent: { color: Colors.error },
  barBg: { width: '100%', height: 6, backgroundColor: Colors.surfaceElevated, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  barUrgent: { backgroundColor: Colors.error },
});
