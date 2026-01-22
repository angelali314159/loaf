import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button } from '../../components/typography';

export default function WorkoutComplete() {

  return (
    
      <View>
        <h1>Workout Complete</h1>
        <Button
            title="Go to Home"
            onPress={() => router.push('/(tabs)/landingMain')}
        />
        
      </View>
  );
}