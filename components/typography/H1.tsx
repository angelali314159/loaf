import React from 'react';
import { Text, TextProps } from 'react-native';

interface H1Props extends TextProps {
  children: React.ReactNode;
}

export default function H1({ children, className = '', ...props }: H1Props) {
  return (
    <Text 
      className={`text-[#F9F6EE] text-6xl font-Montserrat_700Bold ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}
