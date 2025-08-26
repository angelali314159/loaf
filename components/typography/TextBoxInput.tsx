import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

export default function TextBoxInput({ className = '', ...props }: TextInputProps) {
    return (
      <TextInput 
        className={`w-[300px] h-[25px] bg-white/10 rounded-[20px] px-4 my-2.5 text-[13px] text-[#333] text-center font-Montserrat_400Regular ${className}`}
        placeholderTextColor="#F9F6EE"
        {...props}
      />
    );
  }