import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, useThemeColor } from "heroui-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface WorkoutDetailsCardProps {
  date: Date | undefined;
  notes: string;
  onDateChange: (date: Date | undefined) => void;
  onNotesChange: (notes: string) => void;
}

export default function WorkoutDetailsCard({
  date,
  notes,
  onDateChange,
  onNotesChange,
}: WorkoutDetailsCardProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const mutedColor = useThemeColor("muted");
  const foregroundColor = useThemeColor("foreground");
  const surfaceColor = useThemeColor("surface");
  const dividerColor = useThemeColor("divider");

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      onDateChange(selectedDate);
    }
    if (Platform.OS === "ios") {
      setShowDatePicker(false);
    }
  };

  return (
    <Card variant="secondary" className="w-full">
      <Card.Title className="text-lg mb-4">Workout Details</Card.Title>

      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between p-3 bg-surface border border-divider rounded-lg">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="calendar-outline"
                size={20}
                color={foregroundColor}
              />
              <Text className="text-foreground text-base">
                {date ? formatDate(date) : "Select date"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={mutedColor} />
          </Pressable>

          {showDatePicker && (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}>
              <View className="flex-1 justify-end bg-black/50">
                <View
                  className="bg-surface rounded-t-3xl p-4"
                  style={{ backgroundColor: surfaceColor }}>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-semibold text-foreground">
                      Select Date
                    </Text>
                    <Pressable onPress={() => setShowDatePicker(false)}>
                      <Ionicons
                        name="close"
                        size={24}
                        color={foregroundColor}
                      />
                    </Pressable>
                  </View>
                  <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                  {Platform.OS === "ios" && (
                    <Pressable
                      onPress={() => setShowDatePicker(false)}
                      className="mt-4 bg-accent p-3 rounded-lg">
                      <Text className="text-center text-accent-foreground font-semibold">
                        Done
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Modal>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">Notes</Text>
          <TextInput
            value={notes}
            onChangeText={onNotesChange}
            placeholder="Add notes about this workout..."
            placeholderTextColor={mutedColor}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="p-3 bg-surface border border-divider rounded-lg text-foreground"
            style={{
              minHeight: 80,
              color: foregroundColor,
              borderColor: dividerColor,
            }}
          />
        </View>
      </View>
    </Card>
  );
}
