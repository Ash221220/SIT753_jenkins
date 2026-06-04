import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
};

export default function CustomButton({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        secondary && styles.secondaryButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "900",
  },
  secondaryText: {
    color: colors.textPrimary,
  },
});