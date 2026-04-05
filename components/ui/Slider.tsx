import { Slider, Text } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

type SlidersComponentProps = {
  onValueChange?: (value: number) => void;
  value?: number;
};

const Sliders: React.FunctionComponent<SlidersComponentProps> = ({
  onValueChange,
  value: externalValue = 0,
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(externalValue);
  }, [externalValue]);

  const handleValueChange = (newValue: number) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const interpolate = (start: number, end: number) => {
    let k = (value - 0) / 10;
    return Math.ceil((1 - k) * start + k * end) % 256;
  };

  return (
    <>
      <View style={[styles.contentView]}>
        <Slider
          value={value}
          onValueChange={handleValueChange}
          maximumValue={120}
          minimumValue={0}
          step={5}
          allowTouchTrack
          minimumTrackTintColor="#FCDE8C"
          maximumTrackTintColor="#e0e0e0c8"
          trackStyle={{ height: 5 }}
          thumbStyle={{ height: 20, width: 20, backgroundColor: "transparent" }}
          thumbProps={{
            children: (
              <Image
                source={require("../../assets/images/paw-yellow.png")}
                style={{ width: 25, height: 25, paddingBottom: 5 }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Text style={{ textAlign: "right" }}>{value} mins</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  contentView: {
    width: "100%",
    alignItems: "stretch",
  },
  verticalContent: {
    flex: 1,
    flexDirection: "row",
    height: 500,
    justifyContent: "center",
    alignItems: "stretch",
  },
  subHeader: {
    backgroundColor: "#2089dc",
    color: "white",
    textAlign: "center",
    paddingVertical: 5,
    marginBottom: 10,
  },
});

export default Sliders;
