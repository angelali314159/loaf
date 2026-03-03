import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface FadeProps {
  height?: number;
  style?: ViewStyle;
}

export const TopFade = ({ height = 40, style }: FadeProps) => {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
      style={[styles.fade, { height, top: 0 }, style]}
      pointerEvents="none"
    />
  );
};

export const BottomFade = ({ height = 40, style }: FadeProps) => {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
      style={[styles.fade, { height, bottom: 0 }, style]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
