 
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![made-with-nodejs](https://img.shields.io/badge/Made%20with-NodeJS-brightgreen.svg)](https://nodejs.org/es/) ![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103) ![GitHub forks](https://img.shields.io/github/forks/geekquad/AlgoBook?style=social) ![GitHub Repo stars](https://img.shields.io/github/stars/geekquad/AlgoBook?style=social) 

# Sitema de monitoreo - Dashboard

Dashboard para uso de hospitales o entidades que deseen hacer seguimiento a pacientes con COVID19.

Este dashboard permite realizar cargas de masivas de pacientes de algun hospital y posteriormente utiliza un concepto de bandejas para una mejor gestion de recursos mediante la priorización de casos.


### Tipos de perfiles 
Este sistema brinda un esquema de niveles de acceso de 2 tipos de perfiles:

- **Administradores**, se encargan de la carga de pacientes.
- **Medicos voluntarios**, tienen acceso a las bandejas de pacientes para realizar un seguimiento.

### Vista carga

Los administradores solo tienen acceso a la vista de carga y reportes. 

Los formatos de docuementos los encontraras en estre mismo repositorio.

[Test Admision](/admision_test.xlsx)

[Test Tamizaje](/tamizaje_test.xlsx)

![](/source/admin.PNG)

### Tipos de bandejas
Se manejan 3 tipos de bandejas:
- **Bandeja chatbot** para pacientes con sintomas leves y sin confirmación de covid.
- **Bandeja normal** para pacientes con sistomas leves o moderadas que tienen factor de riesgo (Personas con obesidad, tercera edad, etc).
- **Bandeja urgente** para personas con sintomas graves o confirmadas.

El proceso de seguimiento se realiza  automaticamente y diariamente creando un caso por cada paciente registrado apartir de la fecha en la que este fue subido al sistema. Si un paciente durante 14 dias no presenta mas sintomas y al contrario presenta mejoras, es liberado por el sistema hasta proximo aviso.

### Vista de bandejas
La atención de casos se hace mediante un vista web la cual contiene 2 tabla para que un medico pueda tomar el caso que desee.

![](/source/medico.PNG)

Como se muestra en la imagen el medico tiene la posibilidad de acceder y tomar casos de la bandeja normal y urgente.

Igualmente podra visualizar estadisticas del sistema de casos atendidos por otros medidos, promedios de atenciones y los casos estendidos por el o ella.

### Formulario de seguimiento

Cuando un medico toma un caso podra visualizar una vista web que mustra los datos de del paciente.

![](/source/atencion01.png)
![](/source/atencion02.PNG)
![](/source/atencion03.PNG)
![](/source/atencion04.PNG)

Mediante este formulario el medico podra podra realizar una llamada con cualquier servicio externo realizando un Click al icono "Phone" de color verde. Es con la finalidad que el medico pueda realizar por llamada las preguntas de rutina y monitoreo a ese paciente y pueda modificar su registro deacuerdo al estado reportado del paciente.

Los registros posibles a modificar son :

- Si es Factor de riesgo (Persona de tercera edad, tiene obesidad, etc).
- Forzar la deribación a una bandeja en especifica.
- Registrar fecha de inicio de sintomas.
- Registro de sintomas que siente por dia.
- Algun tratamiento que le recomendara de parte del medico.
- Un mini seguimiento a familiares o conocidos que conviven con el y puedan ser monitoridos indirectamente mediante el paciente.
- Dejar comentarios diariamente

Toda esta información perdurara y sera independiente por dia, de esa manera se asegura que proximos medicos que a los dias siguientes monitoreen al mismo paciente puedan tener un historial de este.

### Bandeja Chatbot

La bandeja Chatbot es una bandeja especial ya que esta no se podra acceder mediante las vistas webs y no seran atendidos por un medico.

La bandeja de chatbot es expuesto mediante un API REST FULL que tiene que ser consumida por el proyecto "Sistema de monitoreo - Chatbot".

Para ubicar la bandeja chatbot es necesario ubicarnos en el HOST del sistema y añadirle "/api/v1/survey01", "/api/v1/survey02" o "/api/v1/survey03".

![](/source/survey.PNG)

#### Tipo de "Survey"

- Survey 01 - pacientes que tendran interacción con el sistema del bot por primera vez.
- Survey 02 - pacientes que ya han tenido interacción con el sistema del bot.
- Survey 03 - pacientes que ya estan por su dia 14 y seran liberados por el sistema.

#### ¿Como responden los pacientes en la bandeja ChatBot?

Para tener a mas detalle el flujo se recomienda revisar el repositorio del proyecto **"Sistema de monitoreo - Chatbot"**. 

Este sistema no cuenta unicamente con API REST FULL para la bandeja chatbot, si no que cuenta con algunas mas API REST FULL que le permite recibir las respuesta obtenidas por el Chatbot. Cuando esas respuesta son recibidad son validadas por este sistema y validadas para saber si es necesario mover pacientes de la bandeja chatbot a alguna de las otras 2.




Unicamente las bandejas que se podran gestionar por el dashboard son las bandejas normal y riego.

(Para que esta bandeja funcione es necesario complementar esta solución con el "Sistema de monitoreo - chatbot")

Este sistema busca gestionar el seguimiento de pacientes con riesgo a contraer COVID19 y para esto ofrece un 


## MultiSedes

Una de las caracteristicas agregadas recientemente es el soporte de multisedes.

Con esta actualización puedes unificar el uso de esta plataforma en diferentes hospitales sin que la información se cruse y sea independiente por cada hospital.


## Motivación
Este sistema fue realizado con el fin de aportar ayuda ante la pandemia del COVID-19. Analizando la situación y detectando las principales causas de la gran cantidad de desesos de personas, identificamos que la toma de acciónes ante los primeros sintomas era un factor crusial para que un paciente pueda sobrevivir al virus. Es asi que para disminuir estos desesos se planifico esta solución, que mediante un monitoreo diario con encuestas sobre el estado de salud de un paciente se podia anticipar la detección de posibles personas infectadas y alertar un hospital para tomar acciones inmediatas.

## Caracteristicas
Este sitema cuenta con las siguientes caracteristicas:
- Es un sistema validado por medicos expertos.
- Los documentos de carga son documentos estandars de uso de hospitales.
- La bandeja chatbot ayuda a evitar la cobre carga de casos, ya que al iniciar todos los pacientes subidos por el administrador son agregados a esta bandeja.
- El servicio para llamadas es libre, para terminos de prueba se utilizo la plataforma [Wildix]().
- Un sistema intuitivo para usos puntuales.

## Guia de uso

### Requerimientos
- NodeJS
- Handlebars
- Bootstrap
- PostgreSQL

### Base de datos
Para el sistema se uso una base de datos relacional, para la creación ejecute el script [SistemaMonitoreo.sql](/SistemaMonitoreo.sql)

### Configuraciones de variables de entorno

Previo a iniciar el proyecto asegur que estas variables de entorno esten configuradas.

``` shell
KEY_SECRET=[SECRETO DEL BACKEND]
PGUSER=[Usuario postgresql]
PGHOST=[Host postgresql]
PGPASSWORD=[Password postgresql]
PGDATABASE=[Nombre de base de datos postgresql]
PGPORT=[Puerto postgresql]
PGSCHEMA=[esquema de postgresql]
TIME_OUT_ROUTINE =  [cron syntax para saber cuando se ejecutara la tarea de creación de casos diario]
PORT=[Puerto]
```

### Instalar librerias

Para poder descargar todas la librerias ejecute :
``` js
npm install
```

Si se completo configuro todo correctamente ejecute:

``` js
node server.js
```

## Contribuir

### Paso 1. Crear una copia de este repositorio
Para trabajar en el proyecto de código abierto, primero tendrá que hacer su propia copia del repositorio. Para hacer esto, deberías bifurcar el repositorio y luego clonarlo para tener una copia de trabajo local.

> **Bifurcación :fork_and_knife: este repositorio. Pulsa el botón Fork en la esquina superior derecha.**

Con el repositorio bifurcado, estás listo para clonarlo para que tengas una copia de trabajo local del código base.

> **Clonar el repositorio**

Para hacer su propia copia local del repositorio en el que le gustaría contribuir, abramos primero una ventana terminal.

Usaremos el comando git clone junto con la URL que apunta a tu bifurcación del repositorio.

* Abrir el símbolo del comando
* Escriba este comando:

```
git clone https://github.com/your_username/AlgoBook
```
  ![License: MIT](https://raw.githubusercontent.com/geekquad/AlgoBook/master/project/Readme_Images/clone_cmd.JPG)

### Paso 2: Creando una nueva rama
Es importante ramificar el repositorio para poder gestionar el flujo de trabajo, aislar el código y controlar qué características vuelven a la rama principal del repositorio del proyecto.

Al crear una rama, es muy importante que crees tu nueva rama a partir de la rama principal. 
**Para crear una nueva rama, desde la ventana de tu terminal, ejecuta:**


```
git branch new-branch
git checkout new-branch
```
Una vez que ingreses el comando de salida del git, recibirás la siguiente salida:

```
Switched to branch 'new-branch'
```


### Paso 3: Contribuir
No te olvides de seguir los pasos anteriores de **Configuraciones de variables de entorno** y **Instalar librerias** para que pueda utilizar el proyecto de manera local.

Por favor leer nuestro [CONTRIBUTING.md](/CONTRIBUTING.md) donde estan las pautas necesarias a consigerar si quieres aportar.

Haga los cambios pertinentes. Añadir nuevos algoritmos. Añadir archivos README. Contribuye de la manera que quieras :)

### Paso 4: Comprometiéndose y empujando:
Una vez que hayas modificado un archivo existente o añadido un nuevo archivo al proyecto, puedes añadirlo a tu repositorio local, lo cual podemos hacer con el comando git add.

`` git add filename`` o ``` git add .``` 

Puedes escribir el comando ```git add -A``` o alternativamente ```git add -all`` para que todos los nuevos archivos sean puestos en escena.


**Con nuestro archivo preparado, queremos registrar los cambios que hicimos en el repositorio con el comando ``git commit``.**

El mensaje de confirmación es un aspecto importante de tu contribución al código; ayuda a los otros colaboradores a entender completamente el cambio que has hecho, por qué lo hiciste, y cuán significativo es. 
 
 ```
 git commit -m "commit message"
 ```

> **Nota :**
>
> Utilice el siguiente dormato para los mensajes de commits.
> **[TYPE]:[DESCRIPCIÓN]**.
> Donde TYPE puede ser FIX (Si se soluciono algun Bug) o FEAT > (Si se agrego una nueva funcionalidad).
>
> Mas información sobre el formato [Aquí](https://codigofacilito.com/articulos/buenas-practicas-en-commits-de-git).

 
 
 En este punto puedes usar el comando ``git push`` para empujar los cambios a la rama actual de tu repositorio bifurcado:
 ```
 git push --set-upstream origin new-branch
 ```
 
### Paso 5: Crear Pull Request
En este momento, está listo para hacer una solicitud de extracción al depósito original.

Debe navegar a su repositorio **bifurcado**, y presionar el botón "Comparar y solicitar" en la página. 
![Compare & pull request](https://raw.githubusercontent.com/geekquad/AlgoBook/master/project/Readme_Images/pr.JPG)

GitHub te avisará que puedes fusionar las dos ramas porque no hay un código que compita. Deberías añadir un **título**, un **comentario**, y luego presionar el botón **"Crear solicitud de extracción "**.

![Title and comment](https://raw.githubusercontent.com/geekquad/AlgoBook/master/project/Readme_Images/create%20pr.JPG)

### Paso 6: FELICIDADES !! :boom: :clap:
Lo has hecho hasta el final. ¡¡Felicidades!!

#### Para cualquier otro asunto o consulta, por favor únase a nuestro [Canal Slack]().
Siéntase libre de contactarnos. Recuerde, la colaboración es la clave del código abierto. 
