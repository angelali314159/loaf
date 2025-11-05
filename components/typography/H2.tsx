//HOW TO USE:
/*
In your code, declare the H2 component like this:
<H2 baseSize={16} style={{ custom styles }}>{Your Text}</H2>

- baseSize is optional, default is 16 (design size in px, RFValue will scale it)
- style is optional, for any additional custom styles
*/


import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface H2Props extends TextProps {
  children: React.ReactNode;
    /** baseSize is the design size in px, RFValue will scale it */
    //default is 16
  baseSize?: number;
  style?: TextStyle;
}

export default function H2({ children, baseSize = 16, className = '', style, ...props }: H2Props) {
  const fontSize = RFValue(baseSize);

  return (
    <Text
      className={`text-[#2D3541] ${className}`}
      style={[{ fontSize, fontFamily: 'Montserrat_400Regular'}, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
