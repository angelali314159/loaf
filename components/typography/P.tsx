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
      className={`${className}`}
      style={{fontFamily: 'Inter_Regular',
        color: "#2D3541",
      }}
      {...props}
    >
      {children}
    </Text>
  );
}
