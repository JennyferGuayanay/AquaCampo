# ADR-006: Conservar fotografías en el almacenamiento persistente del dispositivo

- **Estado:** Documentación retrospectiva
- **Fecha:** 2026-10-28
- **Requisitos relacionados:** R7 y R8

## Contexto
Los técnicos necesitan fotografiar medidores dañados o con consumos anómalos. Las imágenes deben conservarse después de cerrar la aplicación y durante el trabajo sin conexión.

## Alternativas consideradas

### Alternativa A: expo-camera y expo-file-system
- Ventajas: permite capturar fotografías y copiarlas a un directorio persistente de la aplicación.
- Desventajas: requiere administrar permisos, archivos y rutas locales.

### Alternativa B: Conservar únicamente la URI temporal de la cámara
- Ventajas: implementación más sencilla y sin una operación adicional de copia.
- Desventajas: el archivo temporal puede dejar de estar disponible y perderse la fotografía.

## Decisión
Utilizar `expo-camera` para capturar fotografías y `expo-file-system/legacy` para copiarlas al directorio de documentos de la aplicación.

En `src/components/ReadingForm.tsx` se solicitan permisos y se captura la imagen mediante `CameraView`.

En `src/storage/photoStorage.ts` se crea la carpeta `fotos`, si no existe, y se copia la imagen con un nombre único. La URI persistente se conserva como parte del registro.

## Consecuencias
- Las fotografías permanecen disponibles después de cerrar y abrir la aplicación.
- La captura puede realizarse sin conexión.
- La aplicación debe manejar permisos denegados y errores de captura.
- Los archivos ocupan espacio local.
- La URI local identifica un archivo del dispositivo; no equivale a subir la imagen a un servidor.

## Verificación
- Registrar una lectura con fotografía sin internet.
- Cerrar y volver a abrir AquaCampo.
- Comprobar que la lectura y su fotografía permanecen.
- Denegar el permiso de cámara.
- Verificar que se muestre un mensaje y se conserven los valores del formulario.

## Uso de IA
Se utilizó inteligencia artificial como herramienta de apoyo para organizar la documentación técnica y revisar la claridad de la redacción. El contenido se contrastó con la implementación existente.
