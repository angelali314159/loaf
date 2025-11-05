//HOW TO USE:
/*
In your code, declare the TextLineInput component like this:
<TextLineInput
  className="" // optional, for any additional custom styles
  placeholder="Enter text" // optional
  placeholderColor="#BFBFBF" // optional, default is light gray
  style={{ custom styles for the TextInput }} // optional
  ...other TextInput props
/>
*/ 

import React from 'react';
import { StyleProp, TextInput, TextInputProps, TextStyle } from 'react-native';

interface TextLineInputProps extends TextInputProps {
  className?: string;
  /** placeholder text color override */
  placeholderColor?: string;
  style?: StyleProp<TextStyle> | undefined;
}

export default function TextLineInput({ className = '', placeholderColor = '#BFBFBF', style, ...props }: TextLineInputProps) {
  const inputStyle: StyleProp<TextStyle> = [
    {
      width: '86%',
      maxWidth: 420,
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#B1B0B0',
      backgroundColor: 'transparent',
      fontSize: 12,
      fontFamily: 'Inter_Regular',
      color: '#2D3541',
      textAlign: 'left',
    },
    style,
  ];

  return (
    <TextInput
      className={className}
      placeholderTextColor={(props.placeholderTextColor as string) ?? placeholderColor}
      underlineColorAndroid="transparent"
      style={inputStyle}
      {...props}
    />
  );
}