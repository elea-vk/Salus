import React, { useState } from "react";
import { View, Text } from "react-native";
import { DateTimeSpinner } from "react-native-date-time-spinner";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";

export default function Example() {
    const [value, setValue] = useState(new Date(2025, 5, 15));

    return (
        <View style={{ padding: 16 }}>
            <Text>{value.toDateString()}</Text>

            <DateTimeSpinner
                mode="datetime"
                dateTimeOrder={["date", "hour", "minute"]}
                dateTimeSpacing={16}
                formatDateLabel={(date) => format(date, "eee, MMM d")}
                initialValue={new Date(2024, 7, 19, 7, 40)}
                minDate={new Date(2020, 0, 1)}
                maxDate={new Date(2030, 11, 31)}
                padHourWithZero
                padMinuteWithZero
                LinearGradient={LinearGradient}
                pickerGradientOverlayProps={{ locations: [0, 0.5, 0.5, 1] }}
                timeSeparator="·"
                onDateChange={({ date }) => setValue(date)}
            />
        </View>
    );
}