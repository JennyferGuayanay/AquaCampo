# ADR-005: Gestionar el formulario mediante componentes controlados de React

- **Estado:** Documentación retrospectiva
- **Fecha:** 2026-10-28
- **Requisitos relacionados:** R4, R5, R6, R7 y R8

## Contexto
El registro de lecturas cambia según el estado del medidor. Una lectura normal necesita un valor numérico; un medidor inaccesible necesita un motivo; un medidor dañado necesita una descripción. También pueden exigirse confirmaciones y fotografías.

## Alternativas consideradas

### Alternativa A: Formulario controlado con React
- Ventajas: permite controlar directamente los valores, mostrar campos condicionales y aplicar reglas propias.
- Desventajas: requiere administrar explícitamente los cambios y las validaciones.

### Alternativa B: Biblioteca externa de formularios
- Ventajas: puede simplificar formularios extensos y ofrecer herramientas de validación.
- Desventajas: incorpora una dependencia adicional y requiere adaptar las reglas particulares del proyecto.

## Decisión
Utilizar `ReadingForm` como componente controlado.

El componente recibe los valores del borrador mediante la propiedad `valor` y comunica los cambios mediante `onChange`. Presenta campos condicionales para los estados normal, inaccesible y dañado.

Antes de guardar, ejecuta las validaciones, calcula el consumo cuando existe una lectura anterior, comprueba las anomalías y exige fotografía en los casos correspondientes.

El almacenamiento y la recuperación del borrador se gestionan mediante las funciones del repositorio local, fuera del componente visual.

## Consecuencias
- La interfaz responde a los cambios del formulario.
- Las reglas pueden adaptarse a cada estado del medidor.
- El formulario no necesita una biblioteca externa especializada.
- Es necesario mantener coordinados los valores del borrador, la validación y el guardado.

## Verificación
- Cambiar entre los tres estados del medidor.
- Comprobar los campos obligatorios de cada estado.
- Introducir una lectura inválida.
- Comprobar la confirmación de anomalías.
- Verificar que el formulario conserve sus valores cuando se rechaza el permiso de cámara.
- Recuperar un borrador después de cerrar y abrir la aplicación.

## Uso de IA
Se utilizó inteligencia artificial como apoyo para organizar la documentación técnica y revisar la claridad de la redacción. El contenido se contrastó con la implementación existente.
