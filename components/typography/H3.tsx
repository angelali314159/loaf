//HOW TO USE:
/*
In your code, declare the H3 component like this:
<H3 baseSize={16} style={{ custom styles }}>{Your Text}</H3>

- baseSize is optional, default is 16 (design size in px, RFValue will scale it)
- style is optional, for any additional custom styles
*/


import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface H3Props extends TextProps {
  children: React.ReactNode;
    /** baseSize is the design size in px, RFValue will scale it */
    //default is 16
  baseSize?: number;
  style?: TextStyle;
}

export default function H3({ children, baseSize = 16, className = '', style, ...props }: H3Props) {
  const fontSize = RFValue(baseSize);

  return (
    <Text
      className={`text-[#2D3541] ${className}`}
      style={[{ fontSize, fontFamily: 'Inter_SemiBold'}, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
