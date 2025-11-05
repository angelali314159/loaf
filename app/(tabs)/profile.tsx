import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { H1, H2, P, TextLineInput } from '../../components/typography';

interface ProfileData {
  username: string;
  streak: number;
  name: string;
}

export default function Profile() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  
  // TO-DO: Replace with actual user data from Firebase/API
  const mockProfileData: ProfileData = {
    username: 'joy_user',
    streak: 7,
    name: 'Joy'
  };

  const [profileData, setProfileData] = useState<ProfileData>(mockProfileData);
  const [goals, setGoals] = useState([
    'Exercise 5 days a week',
    'Increase flexibility',
    '30 minutes of cardio a day',
  ]);
  const [chartData, setChartData] = useState({ labels: [], values: [] });

  // TO-DO: Replace with actual API call
  const fetchChartData = async (username: string) => {
    try {
      // Mock data for now
      const mockData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [2, 1, 3, 2, 4, 1, 2]
      };
      return mockData;
      
      // TO-DO: Uncomment when API is ready
      // const response = await fetch(`http://localhost:5050/record/workouts/${username}`);
      // const data = await response.json();
      // 
      // if (!data || !Array.isArray(data.datapoints)) {
      //   return { labels: [], values: [] };
      // }
      // 
      // const abbreviate = (day: string) => day.slice(0, 3);
      // const labels = data.datapoints.map((point: any[]) => abbreviate(point[0]));
      // const values = data.datapoints.map((point: any[]) => point[1]);
      // 
      // return { labels, values };
    } catch (error) {
      console.error("Error fetching Chart Data:", error);
      return { labels: [], values: [] };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // TO-DO: Fetch user profile data from Firebase/API based on userId
      //const result = await fetchChartData(profileData.username);
      //setChartData(result);
    };
    loadData();
  }, [profileData.username, userId]);

  const handleAddGoal = () => {
    setGoals([...goals, 'New goal']);
  };

  const handleGoalChange = (text: string, index: number) => {
    const newGoals = [...goals];
    newGoals[index] = text;
    setGoals(newGoals);
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <LinearGradient 
      colors={['#f2f0ef', '#f2f0ef']} 
      className="flex-1"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Username */}
        <View className="items-center mt-12 mb-8">
          <H1 className="text-[#32393d] text-5xl font-bold">{profileData.name}</H1>
        </View>

        {/* Stats Container */}
        <View className="flex-row justify-center gap-16 mb-8">
          {/* Streak Section */}
          <View className="bg-[#FF7F7F] rounded-lg p-4 w-36 items-center justify-center relative">
            <P className="absolute -top-6 left-3 text-[#32393d] text-lg font-bold">Streak</P>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="fire" size={24} color="white" />
              <P className="text-white text-lg font-bold ml-2">{profileData.streak}</P>
            </View>
          </View>

          {/* League Section */}
          <View className="bg-[#FF7F7F] rounded-lg p-4 w-36 items-center justify-center relative">
            <P className="absolute -top-6 left-3 text-[#32393d] text-lg font-bold">League</P>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="paw" size={24} color="white" />
              <P className="text-white text-lg font-bold ml-2">Biscuits</P>
            </View>
          </View>
        </View>

        {/* Activity Section */}
        <View className="mb-6">
          <H2 className="text-[#32393d] text-xl font-bold ml-6 mb-4">Your Activity</H2>
          <LinearGradient
            colors={['#ffeded', '#FFD3D3']}
            className="h-64 rounded-lg mx-5 justify-center items-center overflow-hidden"
          >
            {chartData.labels.length > 0 && chartData.values.length > 0 ? (
              <LineChart
                data={{
                  labels: chartData.labels,
                  datasets: [{ data: chartData.values }],
                }}
                width={screenWidth - 40}
                height={220}
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={{
                  backgroundGradientFrom: '#ffeded',
                  backgroundGradientTo: '#FFD3D3',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: '6', strokeWidth: '2', stroke: '#A9A9A9' },
                  propsForLabels: { fontSize: 15 },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
              />
            ) : (
              <P className="text-[#32393d]">No chart data available</P>
            )}
          </LinearGradient>
        </View>

        {/* Goals Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mx-6 mb-4">
            <H2 className="text-[#32393d] text-xl font-bold">Goals</H2>
            <TouchableOpacity 
              onPress={handleAddGoal}
              className="p-2"
            >
              <MaterialCommunityIcons name="plus" size={24} color="#32393d" />
            </TouchableOpacity>
          </View>

          <View className="bg-[#FF7F7F] rounded-lg p-4 mx-5">
            {goals.map((goal, index) => (
              <TextLineInput
                key={index}
                className="text-white text-sm border-b border-white py-2 mb-2 bg-transparent"
                value={goal}
                onChangeText={(text) => handleGoalChange(text, index)}
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}