import React from 'react';
import { Text, TextProps } from 'react-native';

interface PProps extends TextProps {
  children: React.ReactNode;
}

export default function P({ children, className = '', ...props }: PProps) {
  return (
    <Text 
      className={`text-[#F9F6EE] text-base font-Montserrat_400Regular ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}
