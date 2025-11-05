//HOW TO USE:
/*
In your code, declare the P component like this:
<P style={{ custom styles }}>{Your Text}</P>
*/

import React from 'react';
import { Text, TextProps } from 'react-native';

interface PProps extends TextProps {
  children: React.ReactNode;
}

export default function P({ children, className = '', ...props }: PProps) {
  return (
    <Text 
      className={`text-[#F9F6EE] text-base ${className}`}
      style={{fontFamily: 'Montserrat_400Regular'}}
      {...props}
    >
      {children}
    </Text>
  );
}
