# Documentación del Frontend

El frontend está desarrollado en **React**, utilizando **Vite** para el bundling y la gestión del estado. La lógica del juego incluye el manejo de eventos en tiempo real mediante **WebSocket** para actualizar el estado del juego en todos los usuarios conectados. 

El proyecto utiliza **React Testing Library (RTL)** y **Vitest** para realizar pruebas unitarias de los componentes y la lógica del frontend. Estas herramientas aseguran que el comportamiento de la interfaz y la lógica asociada funcionen correctamente.

## Instrucciones para ejecutar el frontend

### Requisitos previos
- **Node.js** versión 20.17.0
- **npm** versión 10.8.3

### Instalación y ejecución
1. Clona el repositorio del proyecto, `switcher_ui`, si aún no lo has hecho.
2. Entra en la carpeta del proyecto:
    ```bash
    cd switcher
    ```
3. Instala las dependencias necesarias:
    ```bash
    npm install
    ```
4. Para iniciar el servidor de desarrollo, ejecuta:
    ```bash
    npm run dev
    ```

### Configuración
En la carpeta `switcher/`, es necesario crear un archivo `.env` con el siguiente contenido:

```env
VITE_URL_ENDPOINT=http://<url>
VITE_URL_WS=ws://<url>/ws
```

### Tests
1. Asegúrate de estar en la carpeta principal del proyecto: `/switcher`
2. Ejecuta el siguiente comando para correr los tests:
    ```bash
    npm run test
    ```
Esto ejecutará todos los tests disponibles y mostrará los resultados en la consola.

3. Si quieres ver la cobertura ejecuta el siguiente comando:
    ```bash
    npm run test -- --coverage
    ```

### Documentación de la API (endpoints) y WebSocket
[Click en este enlace](https://docs.google.com/spreadsheets/d/19sXUdj81GLNWPH86Uja328Gk27BWLL2Hj1xli5Ad8ss/edit?usp=sharing)

