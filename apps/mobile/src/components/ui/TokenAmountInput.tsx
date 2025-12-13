import { View, Text, TextInput, Pressable } from "react-native";
import { useState, forwardRef, useImperativeHandle, useRef, ReactNode } from "react";
import { StakingIcon } from "../icons";

type InputState = "default" | "focused" | "filled" | "error";

interface TokenAmountInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  balance: string;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  editable?: boolean;
  /** Label shown in top left (default: "Amount") */
  label?: string;
  /** Token name shown next to icon (default: "Tokens") */
  tokenName?: string;
  /** Custom icon to display (default: StakingIcon) */
  icon?: ReactNode;
  /** Show Max button - useful for convert page */
  showMaxButton?: boolean;
  /** Called when Max button is pressed */
  onMaxPress?: () => void;
}

export interface TokenAmountInputRef {
  focus: () => void;
  blur: () => void;
}

export const TokenAmountInput = forwardRef<TokenAmountInputRef, TokenAmountInputProps>(
  function TokenAmountInput(
    {
      value,
      onChangeValue,
      balance,
      error,
      onFocus,
      onBlur,
      editable = true,
      label = "Amount",
      tokenName = "Tokens",
      icon,
      showMaxButton = false,
      onMaxPress,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    // Determine input state
    const getState = (): InputState => {
      if (error) return "error";
      if (value && parseFloat(value) > 0) return "filled";
      if (isFocused) return "focused";
      return "default";
    };

    const state = getState();

    // Border color based on state
    const getBorderColor = () => {
      switch (state) {
        case "error":
          return "#EF4444"; // red-500
        case "filled":
        case "focused":
          return "#AD42FF"; // primary purple
        default:
          return "#E2E8F0"; // slate-200
      }
    };

    // Text color for amount
    const getAmountColor = () => {
      switch (state) {
        case "error":
          return "#EF4444"; // red-500
        case "filled":
        case "focused":
          return "#8B5CF6"; // primary-500
        default:
          return "#CBD5E1"; // slate-300
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
    };

    const handlePress = () => {
      inputRef.current?.focus();
    };

    return (
      <View style={{ gap: 4 }}>
        <Pressable onPress={handlePress}>
          <View
            className="bg-slate-50 rounded-2xl p-4"
            style={{
              gap: 12,
              borderWidth: state === "default" ? 1 : 2,
              borderColor: getBorderColor(),
            }}
          >
            {/* Top Row - Label and balance */}
            <View className="flex-row items-center justify-between">
              <Text
                className="text-slate-500"
                style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
              >
                {label}
              </Text>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Text
                  className="text-slate-500"
                  style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
                >
                  Balance:
                </Text>
                <Text
                  className="font-medium text-slate-800"
                  style={{ fontSize: 11, lineHeight: 14 }}
                >
                  {balance}
                </Text>
                {showMaxButton && (
                  <Pressable onPress={onMaxPress} hitSlop={8}>
                    <Text
                      className="font-medium"
                      style={{ fontSize: 11, lineHeight: 14, color: "#AD42FF" }}
                    >
                      Max
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Bottom Row - Token selector and input */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center" style={{ gap: 4 }}>
                {icon ?? <StakingIcon size={24} color="#8B5CF6" />}
                <Text
                  className="font-medium text-slate-800"
                  style={{ fontSize: 13, lineHeight: 18 }}
                >
                  {tokenName}
                </Text>
              </View>
              {editable ? (
                <TextInput
                  ref={inputRef}
                  value={value}
                  onChangeText={onChangeValue}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="decimal-pad"
                  style={{
                    fontSize: 32,
                    fontWeight: "600",
                    color: getAmountColor(),
                    textAlign: "right",
                    minWidth: 80,
                    padding: 0,
                  }}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "600",
                    color: getAmountColor(),
                    textAlign: "right",
                    minWidth: 80,
                  }}
                >
                  {value || "0.00"}
                </Text>
              )}
            </View>
          </View>
        </Pressable>

        {/* Error message */}
        {error && (
          <Text
            className="text-center"
            style={{ fontSize: 13, color: "#EF4444" }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

export default TokenAmountInput;
