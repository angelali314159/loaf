import React from 'react';
import { Text, TextProps } from 'react-native';

interface H2Props extends TextProps {
  children: React.ReactNode;
}

export default function H2({ children, className = '', ...props }: H2Props) {
  return (
    <Text 
      className={`text-[#000000] text-4xl font-Montserrat_700Bold ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}
