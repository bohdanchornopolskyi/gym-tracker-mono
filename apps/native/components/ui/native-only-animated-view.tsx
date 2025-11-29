import * as React from "react";
import { Platform, View, type ViewProps } from "react-native";
import Animated, {
  type AnimatedProps,
  type BaseAnimationBuilder,
  type EntryExitAnimationFunction,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

type NativeOnlyAnimatedViewProps = AnimatedProps<ViewProps> & {
  entering?:
    | BaseAnimationBuilder
    | typeof BaseAnimationBuilder
    | EntryExitAnimationFunction;
  exiting?:
    | BaseAnimationBuilder
    | typeof BaseAnimationBuilder
    | EntryExitAnimationFunction;
};

export function NativeOnlyAnimatedView({
  children,
  entering,
  exiting,
  ...props
}: NativeOnlyAnimatedViewProps) {
  if (Platform.OS === "web") {
    return <View {...(props as ViewProps)}>{children as React.ReactNode}</View>;
  }
  return (
    <AnimatedView entering={entering} exiting={exiting} {...props}>
      {children}
    </AnimatedView>
  );
}
