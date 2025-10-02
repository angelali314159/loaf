import { LinearGradient } from 'expo-linear-gradient';
import 'firebaseui/dist/firebaseui.css';
import React, { useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Button, H1, TextBoxInput } from '../../components/typography';

export default function Page() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <LinearGradient colors={['#F3B1AE', '#F5D8B9']} locations={[0.3,0.7]} start={{x: 0, y: 0}} end={{x: 0, y: 1}} style={{height: Dimensions.get('screen').height, width: Dimensions.get('screen').width}}>

    <View className="flex-1 justify-center items-center">
      <View className="flex-1 w-full h-full items-center justify-center">
        <H1 className="text-center my-5">LOAF</H1>
      
      <TextBoxInput
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
        autoCapitalize="none"
      />

      <TextBoxInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <Button
        title="Login"
        onPress={() => console.log('Login pressed')}
      />
      <Button
        title="Forgot Password"
        onPress={() => console.log('Forgot Password pressed')}
      />

      </View>
    </View>
    </LinearGradient>
  );
}
