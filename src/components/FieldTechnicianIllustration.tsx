import { Text, View } from "react-native";

export function FieldTechnicianIllustration() {
  return (
    <View
      accessible
      accessibilityLabel="Técnico de AquaCampo revisando un medidor de agua"
      className="relative h-48 w-full max-w-[330px] self-center overflow-hidden"
    >
      <View className="absolute bottom-3 left-3 right-3 h-16 rounded-[50%] bg-cyan-100" />
      <View className="absolute left-8 top-8 h-20 w-24 rounded-2xl border-2 border-slate-900 bg-white">
        <View className="absolute -top-7 left-2 h-14 w-20 rotate-45 rounded-xl border-2 border-slate-900 bg-sky-500" />
        <View className="absolute bottom-3 left-3 h-8 w-8 border-2 border-teal-700 bg-cyan-50" />
      </View>
      <View className="absolute bottom-8 right-8 h-20 w-20 items-center justify-center rounded-full border-[6px] border-slate-900 bg-white shadow-sm">
        <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-sky-500">
          <View className="h-1 w-6 -rotate-[35deg] rounded-full bg-red-600" />
        </View>
      </View>
      <View className="absolute bottom-9 left-[43%] h-24 w-14 rounded-t-[28px] bg-teal-700">
        <View className="absolute -top-9 left-1.5 h-12 w-12 rounded-full border-4 border-cyan-200 bg-amber-200" />
        <View className="absolute -top-6 -left-1 h-5 w-14 rounded-t-full bg-slate-900" />
        <View className="absolute left-11 top-5 h-4 w-14 rotate-[25deg] rounded-full bg-teal-700" />
        <View className="absolute -left-5 top-10 h-12 w-9 rotate-[-8deg] rounded-lg border-2 border-slate-900 bg-white">
          <Text className="text-center text-lg font-black text-teal-700">✓</Text>
        </View>
      </View>
      <View className="absolute bottom-3 left-6 right-6 h-1 rounded-full bg-slate-900" />
    </View>
  );
}
