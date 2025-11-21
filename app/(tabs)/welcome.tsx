import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button } from '../../components/typography';

export default function Welcome() {

  return (
    
      <View>
        <Button
            title="Go to Login"
            onPress={() => router.push('/(tabs)/login')}
        />
        <Button
            title="Go to Sign Up"
            onPress={() => router.push('/(tabs)/signUp')}
        />
      </View>
  );
}