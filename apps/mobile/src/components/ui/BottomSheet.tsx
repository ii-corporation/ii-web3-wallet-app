import {
  View,
  Modal,
  Pressable,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState, ReactNode } from "react";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = [0.9],
}: BottomSheetProps) {
  const [isShowing, setIsShowing] = useState(false);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);

  const maxHeight = SCREEN_HEIGHT * snapPoints[0];
  const closeThreshold = maxHeight * 0.25; // Close when dragged 25% of sheet height

  // Handle visibility changes
  useEffect(() => {
    if (visible && !isShowing) {
      // Opening: mount modal first, then animate in
      setIsShowing(true);
      isClosingRef.current = false;
      translateY.setValue(SCREEN_HEIGHT);
      overlayOpacity.setValue(0);

      // Small delay to ensure modal is mounted
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 25,
            stiffness: 300,
            mass: 0.8,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 0.8,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else if (!visible && isShowing && !isClosingRef.current) {
      // Closing: animate out first, then unmount
      isClosingRef.current = true;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsShowing(false);
        isClosingRef.current = false;
      });
    }
  }, [visible, isShowing]);

  const handleClose = () => {
    if (isClosingRef.current) return;
    Keyboard.dismiss();
    onClose();
  };

  const animateClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsShowing(false);
      isClosingRef.current = false;
      onClose();
    });
  };

  const animateSnapBack = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 300,
        mass: 0.8,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Respond to downward drags
        return gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 && !isClosingRef.current) {
          translateY.setValue(gestureState.dy);
          // Fade overlay as user drags
          const progress = Math.min(gestureState.dy / maxHeight, 1);
          overlayOpacity.setValue(0.8 * (1 - progress));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isClosingRef.current) return;

        // Close if dragged past threshold or with enough velocity
        if (gestureState.dy > closeThreshold || gestureState.vy > 0.5) {
          animateClose();
        } else {
          // Snap back to open position
          animateSnapBack();
        }
      },
    })
  ).current;

  if (!isShowing) return null;

  return (
    <Modal
      transparent
      visible={isShowing}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        {/* Overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            className="absolute inset-0 bg-slate-900"
            style={{ opacity: overlayOpacity }}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-slate-50 rounded-t-3xl"
          style={[
            {
              transform: [{ translateY }],
              maxHeight,
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.3,
              shadowRadius: 56,
              elevation: 20,
            },
          ]}
        >
          {/* Drag Handle Area */}
          <View
            {...panResponder.panHandlers}
            className="items-center justify-center"
            style={{ paddingTop: 12, paddingBottom: 8 }}
          >
            <View className="w-[36px] h-[5px] rounded-full bg-slate-400/50" />
          </View>
          <SafeAreaView edges={["bottom"]} className="flex-1">
            {children}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
