import React from 'react';
import { Dimensions, Modal, TouchableOpacity, View } from 'react-native';
import { Button, H2, P } from './typography';

interface PopupMessageProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
  confirmText?: string;
}

export default function PopupMessage({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  confirmText = 'OK'
}: PopupMessageProps) {
  const getTypeColors = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          titleColor: 'text-red-800',
          messageColor: 'text-red-600'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          titleColor: 'text-green-800',
          messageColor: 'text-green-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-600'
        };
    }
  };

  const colors = getTypeColors();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 justify-center items-center bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => {}} // Prevent closing when touching the popup content
        >
          <View 
            className={`${colors.bg} ${colors.border} border-2 rounded-2xl mx-6 p-6 shadow-lg`}
            style={{ 
              minWidth: Dimensions.get('window').width * 0.7,
              maxWidth: Dimensions.get('window').width * 0.9
            }}
          >
            {title && (
              <H2 baseSize={16} className={`${colors.titleColor} text-center mb-3 font-semibold`}>
                {title}
              </H2>
            )}
            
            <P className={`${colors.messageColor} text-center mb-6`}>
              {message}
            </P>
            
            <Button
              title={confirmText}
              onPress={onClose}
              color={type === 'error' ? 'yellow' : 'blue'}
              fontColor={type === 'error' ? 'blue' : 'white'}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}