import { Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

interface UserAvatarProps {
  uri: string | null;
  iniciales: string;
  tamano?: "compacto" | "tarjeta" | "grande";
}

const tamanos = {
  compacto: "h-12 w-12",
  tarjeta: "h-16 w-16",
  grande: "h-28 w-28",
};

const textos = {
  compacto: "text-lg",
  tarjeta: "text-2xl",
  grande: "text-4xl",
};

export function UserAvatar({ uri, iniciales, tamano = "compacto" }: UserAvatarProps) {
  return (
    <View
      className={`${tamanos[tamano]} overflow-hidden rounded-full border-4 border-cyan-100 bg-teal-700 shadow-lg`}
    >
      {uri ? (
        <Animated.Image
          key={uri}
          entering={ZoomIn.duration(260).springify().damping(14)}
          source={{ uri }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <Animated.View
          entering={ZoomIn.duration(260).springify().damping(14)}
          className="flex-1 items-center justify-center"
        >
          <Text className={`${textos[tamano]} font-black text-white`}>
            {iniciales || "AC"}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
