import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Slider, Text, Icon } from '@rneui/themed';

type SlidersComponentProps = {};

const Sliders: React.FunctionComponent<SlidersComponentProps> = () => {
const [value, setValue] = useState(0);
const [vertValue, setVertValue] = useState(0);

const interpolate = (start: number, end: number) => {
  let k = (value - 0) / 10; // 0 =>min  && 10 => MAX
  return Math.ceil((1 - k) * start + k * end) % 256;
};

const color = () => {
  let r = interpolate(255, 0);
  let g = interpolate(0, 255);
  let b = interpolate(0, 0);
  return `rgb(${r},${g},${b})`;
};

return (
  <>
    <View style={[styles.contentView]}>
      <Slider
        value={value}
        onValueChange={setValue}
        maximumValue={120}
        minimumValue={0}
        step={1}
        allowTouchTrack
        minimumTrackTintColor="#FCDE8C"
        maximumTrackTintColor="#e0e0e0c8"
        trackStyle={{ height: 5 }}
        thumbStyle={{ height: 20, width: 20, backgroundColor: 'transparent' }}
        thumbProps={{
          children: (
            <Image
              className=""
              source={require("../../assets/images/paw_yellow.svg")}
            />
          ),
        }}
      />
      <Text style={{ textAlign: "right"}}>{value} mins</Text>
    </View>
  </>
);
};

const styles = StyleSheet.create({
contentView: {
  width: '100%',
  // justifyContent: 'center',
  alignItems: 'stretch',
},
verticalContent: {
  // padding: 20,
  flex: 1,
  flexDirection: 'row',
  height: 500,
  justifyContent: 'center',
  alignItems: 'stretch',
},
subHeader: {
  backgroundColor : "#2089dc",
  color : "white",
  textAlign : "center",
  paddingVertical : 5,
  marginBottom : 10
}
});

export default Sliders;