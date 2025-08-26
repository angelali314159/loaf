import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, disabled = false }) => {
  return (
    <TouchableOpacity 
      className="w-[200px] h-[30px] bg-[#F9F6EE] rounded-[10px] justify-center items-center my-2.5 shadow-lg shadow-gray-500"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text className="text-[15px] text-[#38434D] shadow-black">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
