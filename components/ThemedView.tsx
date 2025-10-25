
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

type Props = ViewProps & {
  children?: React.ReactNode;
};

export function ThemedView({ children, style, ...rest }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

  return (
    <View style={[{ backgroundColor }, styles.container, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemedView;
