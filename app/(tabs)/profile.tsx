import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';


interface ProfileProps {
 username: string;
 streak: number;
 name: string;
}


function formatChartData(rawData: any[]) {
 if (!Array.isArray(rawData) || rawData.length === 0) {
   return { labels: [], values: [] };
 }


 const datapoints = rawData[0].datapoints || [];
 const labels = datapoints.map((point: any[]) => point[0]);
 const values = datapoints.map((point: any[]) => point[1]);


 return { labels, values };
}






const fetchChartData = async (username: string) => {
 try {
   const response = await fetch(`http://localhost:5050/record/workouts/${username}`);
   const responseText = await response.text();
   console.log("Response Text:", responseText);


   const data = JSON.parse(responseText);


   if (!data || !Array.isArray(data.datapoints)) {
     console.log("Unexpected data format:", data);
     return { labels: [], values: [] };
   }


   // Converts full day names to 3-letter abbreviations
   const abbreviate = (day: string) => day.slice(0, 3);
   const labels = data.datapoints.map((point: any[]) => abbreviate(point[0]));
   const values = data.datapoints.map((point: any[]) => point[1]);


   return { labels, values };


 } catch (error) {
   console.error("Error fetching Chart Data:", error);
   return { labels: [], values: [] };
 }
};






const ProfilePage = ({ username, streak, name }: ProfileProps) => {
 const [goals, setGoals] = useState([
   'Exercise 5 days a week',
   'Increase flexibility',
   '30 minutes of cardio a day',
 ]);
 const [chartData, setChartData] = useState({ labels: [], values: [] });


 useEffect(() => {
   const loadData = async () => {
     const result = await fetchChartData(username);
     setChartData(result);
   };
    loadData();
 }, [username]);
  const screenWidth = Dimensions.get('window').width;


 return (
   <LinearGradient colors={['#f2f0ef', '#f2f0ef']} style={styles.container}>
     {/* Header with Username and Image */}
     <View style={styles.header}>
       <View style={styles.usernameContainer}>
         <Text style={styles.username}>{name}</Text>
       </View>
     </View>


     <View style={styles.statsContainer}>
 {/* Streak Section */}
 <View style={styles.statCard}>
   <Text style={[styles.statHeading]}>Streak</Text>
   <View >
   <MaterialCommunityIcons name="fire" size={24} color="white" />
   <Text style={styles.statNumber}>{streak}</Text>
   </View>
 </View>


 {/* League Section */}
 <View style={styles.statCard}>
   <Text style={[styles.statHeading]}>League</Text>
   <View >
   <MaterialCommunityIcons name="paw" size={24} color="white" />
   <Text style={styles.statNumber}>Biscuits</Text>
     </View>
   </View>
 </View>


     {/* Activity Section */}
     <Text style={styles.sectionTitle}>Your Activity</Text>
     <LinearGradient
       colors={['#ffeded', '#FFD3D3']}
       style={styles.activityChart}
     >
       {chartData.labels.length > 0 && chartData.values.length > 0 ? (
         <LineChart
           data={{
             labels: chartData.labels,
             datasets: [{ data: chartData.values }],
           }}
           width={screenWidth - 16}
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
             propsForLabels: {
               fontSize: 15,
              
             },
           }}
           bezier
           style={{ marginVertical: 8, borderRadius: 16 }}
         />
       ) : (
         <Text>No chart data available</Text>
       )}
     </LinearGradient>


     {/* Goals Section */}
     <View style={styles.goalsHeader}>
       <Text style={styles.sectionTitle}>Goals</Text>
       <TouchableOpacity style={styles.plusIcon}>
         <MaterialCommunityIcons name="plus" size={24} color="black" />
       </TouchableOpacity>
     </View>
     <View style={styles.goalCard}>
       {goals.map((goal, index) => (
         <TextInput
           key={index}
           style={styles.goalText}
           value={goal}
           onChangeText={(text) => {
             const newGoals = [...goals];
             newGoals[index] = text;
             setGoals(newGoals);
           }}
         />
       ))}
     </View>
   </LinearGradient>
 );
};


const styles = StyleSheet.create({
 container: {
   flex: 1,
 },
 header: {
   alignItems: 'center',
   marginTop: -40,
 },
 usernameContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   marginLeft: -60,
   paddingVertical: 50,
 },
 username: {
   fontSize: 55,
   fontWeight: 'bold',
 },
 statsContainer: {
   flexDirection: 'row',
   justifyContent: 'center',
   gap: 90,
   marginVertical: -10,
 },
 statCard: {
   backgroundColor: '#FF7F7F',
   borderRadius: 10,
   padding: 15,
   width: 140,
   alignItems: 'center',
   justifyContent: 'center',
   position: 'relative',
 },
 statHeading: {
   position: 'absolute',
   top: -23,
   left: 10,
   fontSize: 17,
   fontWeight: 'bold',
 },
 statNumber: {
   fontSize: 18,
   fontWeight: 'bold',
   color: 'white',
   marginLeft: 5,
 },
 sectionTitle: {
   fontSize: 18,
   fontWeight: 'bold',
   marginLeft: 25,
   marginVertical: 100,
   marginTop: 30,
 },
 activityChart: {
   height: 250,
   borderRadius: 10,
   marginHorizontal: 20,
   justifyContent: 'center',
   alignItems: 'center',
   overflow: 'hidden',
   marginTop: -90,
  },
 goalsHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginHorizontal: -5,
   marginTop: -30,
 },
 goalCard: {
   backgroundColor: '#FF7F7F',
   borderRadius: 10,
   padding: 15,
   marginHorizontal: 20,
   marginVertical: -90,
 },
 goalText: {
   fontSize: 14,
   color: 'white',
   borderBottomWidth: 1,
   borderBottomColor: 'white',
   paddingVertical: 5,
 },
 plusIcon: {
   marginTop: -50,
   marginRight: 30,
 },
});


export default ProfilePage;

















