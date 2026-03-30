import React from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, P } from "../typography";

interface PopupMessageProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
  confirmText?: string;
  secondaryAction?: {
    text: string;
    onPress: () => void;
  };
  textInput?: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
  };
}

export default function PopupMessage({
  visible,
  title,
  message,
  type = "info",
  onClose,
  confirmText = "OK",
  secondaryAction,
  textInput,
}: PopupMessageProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/50"
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View
              className={`bg-white rounded-[30px] mx-6 p-6 shadow-lg`}
              style={{
                minWidth: Dimensions.get("window").width * 0.7,
                maxWidth: Dimensions.get("window").width * 0.9,
              }}
            >
              {/*
              {title && (
                <H2
                  baseSize={16}
                  className={`black text-center mb-3 font-bold`}
                >
                  {title}
                </H2>
              )}
              The figma doesn't have titles so this is commented out*/}

              <P className={`black text-center my-4`}>{message}</P>

              {textInput && (
                <TextInput
                  value={textInput.value}
                  onChangeText={textInput.onChangeText}
                  placeholder={textInput.placeholder || "Enter text..."}
                  placeholderTextColor="#999"
                  className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
                  style={{ backgroundColor: "#fff" }}
                  autoFocus
                />
              )}

              <View className={secondaryAction ? "flex-row gap-3" : ""}>
                {secondaryAction && (
                  <View className="flex-1">
                    <Button
                      title={secondaryAction.text}
                      onPress={secondaryAction.onPress}
                      color={"black"}
                      fontColor={"white"}
                    />
                  </View>
                )}
                <View className={secondaryAction ? "flex-1" : ""}>
                  <Button
                    title={confirmText}
                    onPress={onClose}
                    color={"yellow"}
                    fontColor={"black"}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
