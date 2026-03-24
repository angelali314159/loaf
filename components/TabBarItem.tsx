//this file defines the oval tab button used in the tab bar

import React, { ReactNode } from "react";
import { AccessibilityState, GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface OvalTabButtonProps {
  accessibilityState?: AccessibilityState;
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  'aria-selected'?: boolean;
}

export default function OvalTabButton({ accessibilityState, children, onPress, ...rest }: OvalTabButtonProps & any) {
  const focused = rest['aria-selected'] ?? accessibilityState?.selected ?? false;
    
  // When focused: yellow background. When not focused: black background
  const backgroundColor = focused ? '#FCDE8C' : '#18202A';
  // When focused: black text/icon. When not focused: yellow text/icon
  const contentColor = focused ? '#18202A' : '#FCDE8C';
  
  
  const overrideChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      if (child.type === React.Fragment) {
        const fragmentProps = child.props as { children?: ReactNode };
        return React.Children.map(fragmentProps.children, fragmentChild => {
          if (React.isValidElement(fragmentChild)) {
            const fragmentChildProps = fragmentChild.props as any;
            const isTextLabel =
              (typeof fragmentChild.type === 'string' && fragmentChild.type === 'span') ||
              (fragmentChild.type === Text) ||
              (fragmentChildProps && typeof fragmentChildProps.children === 'string');
            
            if (isTextLabel) {
              return (
                <Text style={{ color: contentColor, fontSize: 12, fontWeight: '400' }}>
                  {fragmentChildProps.children}
                </Text>
              );
            }
            return React.cloneElement(fragmentChild, { color: contentColor } as any);
          }
          return fragmentChild;
        });
      }
      
      const childProps = child.props as any;
      const isTextLabel =
        (typeof child.type === 'string' && child.type === 'span') ||
        (child.type === Text) ||
        (childProps && typeof childProps.children === 'string');
      
      if (isTextLabel) {
        return (
          <Text style={{ color: contentColor, fontSize: 12, fontWeight: '400' }}>
            {childProps.children}
          </Text>
        );
      }
      // If it's an icon, override color prop
      return React.cloneElement(child, { color: contentColor } as any);
    }
    return child;
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <View style={[styles.inner, { backgroundColor }]}> 
        {overrideChildren}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderRadius: 999,
    minHeight: 32,
    minWidth: 64,
    margin: 5,
  },
});