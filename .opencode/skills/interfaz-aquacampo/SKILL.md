---
name: interfaz-aquacampo
description: Mejora la interfaz visual de AquaCampo conservando los requisitos funcionales R1-R10, la arquitectura y las pruebas existentes.
---

# Skill: Interfaz AquaCampo

## Objetivo

Mejorar el diseño visual de AquaCampo, una aplicación móvil de registro de lecturas de medidores de agua para técnicos de campo.

La interfaz debe tener identidad propia, ser profesional, clara y fácil de utilizar en Android.

## Identidad visual

- Inspiración: agua potable, tecnología y trabajo de campo.
- Utilizar una paleta coherente de azules, turquesas y tonos neutros.
- Priorizar legibilidad, contraste y jerarquía visual.
- Utilizar tarjetas, indicadores y botones con estilos consistentes.
- Evitar diseños genéricos de demostración y decoraciones excesivas.
- Mantener textos claros en español.

## Reglas obligatorias

1. No modificar las reglas de negocio de AquaCampo.
2. No eliminar funcionalidades relacionadas con R1-R10.
3. No modificar el funcionamiento de AsyncStorage.
4. No alterar la sincronización, el manejo de conflictos ni los envíos HTTP.
5. No modificar las validaciones de lecturas.
6. No cambiar el comportamiento de la cámara ni la conservación de fotografías.
7. No instalar dependencias adicionales sin justificar primero la decisión.
8. Conservar Expo SDK 57 y las versiones compatibles.
9. Priorizar cambios en estilos, componentes visuales y presentación.
10. Revisar el ADR-008 antes de realizar cambios.

## Archivos de referencia

- docs/adr/ADR-008-identidad-visual.md
- src/constants/aquaTheme.ts
- src/components/
- src/app/

## Proceso

1. Inspeccionar las pantallas y los componentes existentes.
2. Proponer mejoras visuales concretas antes de modificar archivos.
3. Aplicar cambios pequeños y controlados.
4. Mantener intactos los comportamientos funcionales.
5. Ejecutar `npx tsc --noEmit`.
6. Ejecutar `npm test`.
7. Informar qué archivos se modificaron y qué mejoras se realizaron.

## Criterios de aceptación

- Diseño coherente en las pantallas principales.
- Indicadores de conexión y sincronización claramente visibles.
- Formularios legibles y cómodos en Android.
- Navegación funcional.
- Ningún requisito R1-R10 afectado.
- TypeScript sin errores y pruebas existentes aprobadas.
