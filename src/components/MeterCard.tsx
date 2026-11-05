import { Text, View } from "react-native";

import type { Medidor } from "../types/models";

interface MeterCardProps {
  medidor: Medidor;
}

export function MeterCard({ medidor }: MeterCardProps) {
  return (
    <View className="gap-4 rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
      <View className="flex-row items-center gap-3 border-b border-cyan-100 pb-4">
        <View className="h-14 w-14 items-center justify-center rounded-full border-[5px] border-teal-500 bg-cyan-50">
          <View className="h-1 w-6 -rotate-[35deg] rounded-full bg-red-600" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[11px] font-black tracking-widest text-teal-700">
            MEDIDOR IDENTIFICADO
          </Text>
          <Text className="text-2xl font-black text-slate-900">{medidor.codigo}</Text>
        </View>
        <View className="max-w-24 rounded-xl bg-cyan-50 px-3 py-2">
          <Text className="text-center text-xs font-black capitalize text-teal-700">
            {medidor.estado}
          </Text>
        </View>
      </View>

      <View className="gap-1 rounded-2xl bg-slate-50 p-4">
        <Text className="text-[10px] font-black tracking-widest text-teal-700">
          UBICACIÓN DEL SERVICIO
        </Text>
        <Text className="text-base font-extrabold leading-6 text-slate-900">
          {medidor.direccion}
        </Text>
        <Text className="text-sm text-slate-500">Sector {medidor.sector}</Text>
      </View>

      <View className="flex-row items-stretch rounded-2xl bg-slate-900 py-4">
        <View className="flex-1 items-center gap-1 px-2">
          <Text className="text-center text-[11px] font-bold text-cyan-200">
            Lectura anterior
          </Text>
          <Text className="text-center text-lg font-black text-white">
            {medidor.ultimaLectura} m³
          </Text>
        </View>
        <View className="w-px bg-white/20" />
        <View className="flex-1 items-center gap-1 px-2">
          <Text className="text-center text-[11px] font-bold text-cyan-200">
            Promedio mensual
          </Text>
          <Text className="text-center text-lg font-black text-white">
            {medidor.promedioMensual} m³
          </Text>
        </View>
      </View>

      <View className="flex-row items-start justify-between gap-4">
        <Text className="text-sm text-slate-500">Cuenta</Text>
        <Text className="flex-1 shrink text-right font-bold text-slate-800">
          {medidor.numeroCuenta}
        </Text>
      </View>
      <View className="flex-row items-start justify-between gap-4">
        <Text className="text-sm text-slate-500">Última fecha</Text>
        <Text className="flex-1 shrink text-right font-bold text-slate-800">
          {medidor.fechaUltimaLectura}
        </Text>
      </View>
    </View>
  );
}
