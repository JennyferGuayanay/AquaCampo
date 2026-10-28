# ADR-008: Identidad visual y diseño de la interfaz de AquaCampo

- **Estado:** Propuesto
- **Fecha:** 2026-10-28
- **Requisitos relacionados:** R1 a R10

## Contexto
AquaCampo es una aplicación móvil para técnicos que registran lecturas de medidores de agua en campo. La interfaz debe facilitar el trabajo, identificar claramente los estados de las lecturas y mantener una identidad visual propia.

Se necesita mejorar la presentación sin modificar la lógica funcional existente.

## Alternativas consideradas

### Alternativa A: Diseño personalizado con componentes existentes
- Ventajas: identidad visual propia, control sobre colores y componentes, sin dependencias adicionales.
- Desventajas: requiere tiempo para ajustar pantallas, estilos y consistencia visual.

### Alternativa B: Interfaz genérica con estilos predeterminados
- Ventajas: implementación rápida y menor esfuerzo inicial.
- Desventajas: menor identidad visual y menor adaptación al contexto de trabajo de campo.

## Decisión propuesta
Adoptar un diseño personalizado inspirado en el servicio de agua potable y el trabajo de campo.

Se utilizarán los componentes existentes de React Native y la estructura visual actual de AquaCampo como punto de partida.

Se priorizarán:
- Paleta de colores coherente con agua y tecnología.
- Jerarquía visual clara.
- Tarjetas e indicadores de estado reconocibles.
- Formularios legibles y botones accesibles.
- Mensajes claros para conexión, errores y sincronización.
- Consistencia entre las pantallas.

No se añadirán dependencias únicamente para modificar la apariencia.

## Consecuencias esperadas
- Mayor identidad visual y claridad de uso.
- Menor riesgo de una presentación genérica.
- Necesidad de revisar las pantallas en un dispositivo real.
- Riesgo de introducir errores visuales durante los ajustes.

## Verificación
- Revisar las pantallas principales en Android.
- Confirmar que los formularios siguen funcionando.
- Comprobar la visibilidad de los estados de conexión y sincronización.
- Ejecutar las pruebas y la comprobación de TypeScript.
- Verificar que los requisitos R1 a R10 no se vean afectados.

## Uso de IA
Se utilizará inteligencia artificial como herramienta de apoyo para revisar propuestas visuales y organizar cambios de interfaz. Las modificaciones deberán revisarse y comprobarse en el proyecto antes de aceptarlas.
