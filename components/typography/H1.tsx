//HOW TO USE:
/*
In your code, declare the H1 component like this:
<H1 baseSize={30} style={{ custom styles }}>{Your Text}</H1>

- baseSize is optional, default is 30 (design size in px, RFValue will scale it)
- style is optional, for any additional custom styles
*/

import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface H1Props extends TextProps {
  children: React.ReactNode;
  /** baseSize is the design size in px, RFValue will scale it */
  baseSize?: number; //default is 30
  style?: TextStyle;
}

export default function H1({ children, baseSize = 30, className = '', style, ...props }: H1Props) {
  const fontSize = RFValue(baseSize);
  return (
    <Text
      className={`text-[#2D3541] ${className}`}
      style={[{ fontSize , fontFamily: 'Montserrat_900Bold'}, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
