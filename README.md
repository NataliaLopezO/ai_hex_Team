# ai-hex

Primero se deben instalar las dependencias con 

```bash
npm install
```

Este es el proyecto para correr el torneo de Hex. Se debe compilar su agente usando la librería 'browserify'. Para esto pueden instalar la librería desde npm y luego ejecutar la instrucción desde la consola de linux, desde el directorio de su proyecto

```bash
npm install -g browserify
npm install -g uglify-js
```

Es importante que su agente esté dentro de la carpeta ./src y tenga por nombre HexAgent.js. Esto evitará que se tengan que hacer cambios manuales al archivo compilado. El archivo de salida debe ser 'build/HexAgentZZZ.js', donde ZZZ es el nombre de su equipo. No usar caracteres especiales para este nombre. Por ejemplo nuestro equipo se llama Team, la instrucción debería ser:

``` bash
browserify  -r ./src/HexAgent.js -o build/HexAgentTeam.js
```

Enviar por correo electrónico a andres.m.castillo@correounivalle.edu.co el archivo compilado. No se debe enviar nada mas, ya que el archivo tiene incluidas todas las librerías dentro del mismo archivo.

Si tiene más de un agente en la carpeta build, puede hacer una prueba ejecutando el script tournament.js

``` bash
node src/external/tournament.js
```
Para correr el proyecto sin necesidad del tornero se puede hacer con el comando

``` bash
node src/local/example.js
```
