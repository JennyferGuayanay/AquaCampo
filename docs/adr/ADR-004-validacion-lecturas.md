# ADR-004: Centralizar las reglas de validación de lecturas

- **Estado:** Documentación retrospectiva
- **Fecha:** 2026-10-28
- **Requisitos relacionados:** R2, R4, R5, R6 y R10

## Contexto
Las lecturas de agua requieren comprobar el formato del código, los campos obligatorios según el estado del medidor, el consumo y las anomalías. Las reglas deben poder revisarse sin depender de los componentes visuales.

## Alternativas consideradas

### Alternativa A: Funciones de validación independientes
- Ventajas: permiten reutilizar reglas, realizar pruebas unitarias y separar la lógica de la interfaz.
- Desventajas: requieren coordinar su utilización desde los formularios y los servicios.

### Alternativa B: Validaciones dentro de cada pantalla
- Ventajas: implementación inicial directa.
- Desventajas: facilita la duplicación de reglas y dificulta las pruebas aisladas.

## Decisión
Centralizar las reglas principales en `src/utils/rules.ts`.

Se valida el formato `MED-######`, se calcula el consumo mediante la diferencia entre lecturas y se considera anómalo un consumo superior a tres veces el promedio mensual.

El formulario también verifica que la lectura sea un entero válido, que no sea menor que la anterior, que se confirmen las anomalías y que exista una fotografía cuando corresponda.

La prevención de registros duplicados por medidor y mes se complementa en `src/storage/repository.ts`.

## Consecuencias
- Las reglas principales son independientes de la presentación visual.
- Es más sencillo probar cálculos y validaciones.
- Algunas validaciones dependen del contexto del formulario o del repositorio.
- Los datos provenientes del servidor también deben tratarse cuidadosamente.

## Verificación
- Introducir códigos de medidor válidos e inválidos.
- Probar campos obligatorios para estados normal, inaccesible y dañado.
- Comprobar lecturas no numéricas y menores que la anterior.
- Verificar la advertencia de consumo superior al triple del promedio.
- Intentar guardar dos lecturas del mismo medidor y mes.

## Uso de IA
Se utilizó inteligencia artificial como apoyo para organizar la documentación técnica y revisar la claridad de la redacción. El contenido se contrastó con la implementación existente.
