import { View } from "react-native";

interface AquaIllustrationProps {
  compacta?: boolean;
}

export function AquaIllustration({ compacta = false }: AquaIllustrationProps) {
  return (
    <View
      accessible
      accessibilityLabel="Vivienda conectada a una red de agua y a un medidor"
      className={`relative w-full max-w-[330px] self-center ${
        compacta ? "-my-2.5 h-[165px] scale-[0.88]" : "h-[190px]"
      }`}
    >
      <View className="absolute right-[22px] top-3 h-[38px] w-[38px] rounded-full bg-cyan-200" />
      <View className="absolute left-[18px] top-6 h-[15px] w-[46px] rounded-xl border border-cyan-100 bg-white" />
      <View className="absolute left-[47px] top-[15px] h-[22px] w-[34px] rounded-2xl border border-cyan-100 bg-white" />

      <View className="absolute bottom-10 left-[38px] h-[91px] w-[132px] rounded-lg border-2 border-slate-900 bg-white shadow-sm">
        <View className="absolute -top-[37px] left-4 h-[74px] w-[98px] rotate-45 rounded-lg border-2 border-slate-900 bg-sky-500" />
        <View className="absolute -top-[42px] right-5 h-[31px] w-[15px] rounded bg-slate-900" />
        <View className="absolute bottom-[21px] left-[17px] h-9 w-9 border-2 border-teal-700 bg-cyan-50">
          <View className="absolute left-[15px] h-full w-0.5 bg-teal-700" />
          <View className="absolute top-[15px] h-0.5 w-full bg-teal-700" />
        </View>
        <View className="absolute bottom-0 right-[18px] h-[58px] w-[38px] rounded-t-[18px] bg-slate-900">
          <View className="absolute right-[7px] top-[31px] h-[5px] w-[5px] rounded-full bg-cyan-200" />
        </View>
      </View>

      <View className="absolute bottom-[55px] left-[161px] h-3 w-20 border-y-2 border-slate-900 bg-teal-500" />
      <View className="absolute bottom-[55px] right-[78px] h-[35px] w-3 border-x-2 border-slate-900 bg-teal-500" />
      <View className="absolute bottom-[52px] right-[72px] h-[18px] w-6 rounded-lg bg-teal-700" />

      <View className="absolute bottom-[62px] right-[34px] h-[92px] w-[92px] items-center justify-center rounded-full border-[7px] border-slate-900 bg-white shadow-sm">
        <View className="h-[62px] w-[62px] items-center justify-center rounded-full border-[3px] border-sky-500">
          <View className="absolute top-1.5 h-[9px] w-[3px] rounded bg-teal-700" />
          <View className="absolute right-2 h-[3px] w-[9px] rounded bg-teal-700" />
          <View className="h-[3px] w-7 -rotate-[35deg] translate-x-2.5 rounded bg-red-600" />
          <View className="absolute h-[9px] w-[9px] rounded-full bg-slate-900" />
        </View>
        <View className="absolute -bottom-[17px] h-[14px] w-[51px] rounded-md bg-slate-900" />
      </View>

      <View className="absolute bottom-[35px] left-6 right-5 h-[3px] rounded bg-slate-900" />
      <View className="absolute bottom-5 left-[45px] right-[45px] h-2.5 rounded-[50px] border-t-[3px] border-sky-500" />
      <View className="absolute bottom-[7px] left-[83px] right-4 h-2.5 rounded-[50px] border-t-[3px] border-cyan-200" />
    </View>
  );
}
