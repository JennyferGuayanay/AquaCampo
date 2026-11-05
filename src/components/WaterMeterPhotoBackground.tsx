import { Image, View } from "react-native";

interface WaterMeterPhotoBackgroundProps {
  intenso?: boolean;
}

export function WaterMeterPhotoBackground({ intenso = false }: WaterMeterPhotoBackgroundProps) {
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <Image
        source={require("../../assets/images/water-meters-background.jpg")}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      />
      <View className={`absolute inset-0 ${intenso ? "bg-slate-950/70" : "bg-sky-50/80"}`} />
      {!intenso && <View className="absolute inset-0 bg-cyan-100/15" />}
    </View>
  );
}
