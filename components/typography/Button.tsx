//HOW TO USE:
/*
In your code, declare the Button component like this:
<Button
  title="Button Title"
  onPress={handlePressFunction}
  disabled={false} // optional
  color="blue" // optional, default is 'yellow'
  fontColor="white" // optional, default is 'blue'
  borderColor="white" // optional
  style={{ custom styles for the button container }} // optional
  textStyle={{ custom styles for the button text }} // optional
  width="100%" // optional, default is '100%' (can also use a number like 300)
/>
*/


import React from 'react';

import { DimensionValue, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  /** background color key: 'blue' -> #2D3541, 'yellow' -> #fcde8c */
  color?: 'blue' | 'yellow';
  /** font color key: 'blue' | 'yellow' | 'white' */
  fontColor?: 'blue' | 'yellow' | 'white';
  /** border color key: 'blue' | 'yellow' | 'white' */
  borderColor?: 'blue' | 'yellow' | 'white';
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
  width?: DimensionValue;
}

const BG_MAP: Record<string, string> = {
  blue: '#2D3541',
  yellow: '#fcde8c',
};

const FONT_MAP: Record<string, string> = {
  blue: '#2D3541',
  yellow: '#fcde8c',
  white: '#FFFFFF',
};

const BORDER_MAP: Record<string, string> = {
  blue: '#2D3541',
  yellow: '#fcde8c',
  white: '#FFFFFF',
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  color = 'yellow',
  fontColor = 'blue',
  borderColor,
  style,
  textStyle,
  className,
  width = '100%' as DimensionValue
}) => {
  const backgroundColor = BG_MAP[color] ?? BG_MAP.yellow;
  const colorValue = FONT_MAP[fontColor] ?? FONT_MAP.blue;
  const borderColorValue = borderColor ? BORDER_MAP[borderColor] : undefined;

  return (
    <TouchableOpacity
      className={`${className}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
          alignSelf: 'center',
          width,
          maxWidth: 420,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 999,
          backgroundColor,
          borderWidth: borderColorValue ? 2 : 0,
          borderColor: borderColorValue,
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: 10,
          elevation: 3,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: colorValue,
            fontSize: 16,
            fontWeight: '600',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
