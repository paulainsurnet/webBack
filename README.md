# Insurceo (back)

Servicio que recoge las respuestas del API de Typeform, mantiene la DB del backoffice y cálcula mediante el Excel las pólizas.

## Instalación

```bash
git clone [url_de_clone] (e.g. git clone https://alvaro_easydevel@bitbucket.org/easydevel/insurceo-back.git])
cd insurceo-back
npm install 
```

Después, es necesario instalar paquetes de Babel a nivel global:

```bash
npm install -g @babel/cli @babel/core @babel/node
```

Después, es necesario que configuremos el archivo de entorno (.env):

```html
PORT=4000
MONGODB_URI=mongodb+srv://development:EasyDevel2020@cluster0.bzuoq.mongodb.net/insurceo?retryWrites=true&w=majority
TYPEFORM_API=https://api.typeform.com/forms
AUTH_TOKEN=Eh6nXjzd8mZkKDk14oLdYDbRzHry2LVbU7zKboKPHtjj
S3_BUCKET=insurceo
SALT_ROUNDS=12
SALT=$2b$10$VCnrJkc9yeuvqBjJKjlLeu
MASTER_KEY=easydevel2020
DB_NAME=insurceo
ASYNC_API_MAX_TRIES=5
ASYNC_WAIT_SECONDS=5
ASYNC_TIMESTAMP_MAX_DIFF_MINUTES=2
EMAIL=info@insurceo.com
EMAIL_PASS=Insur1971
EMAIL_RECEIVER=alvaro@easydevel.com
EMAIL_RECEIVER_CHART=alvaro@easydevel.com
TAX_VALUE=8.15
FIXIE_URL=http://fixie:mEfbvdShi33X0lK@olympic.usefixie.com:80
```

## Debug (Visual Studio Code)

Crear la carpeta `.vscode` y en ella el archivo `launch.json` con el siguiente contenido:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch via NPM",
      "request": "launch",
      "runtimeArgs": [
        "run-script",
        "start"
      ],
      "runtimeExecutable": "npm",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "type": "pwa-node"
    },
  ]
}
```

## Iniciar

```bash
npm start
```

o, teniendo el script en launch.json, usar el Play & Debug de VSCode.

## Test

El webservice se encuentra en Heroku. Podemos atacarlo directamente con Postman (tenemos que especificar el header 'Content-Type': 'application/json' ). 

Endpoint: \[POST\] [https://insurceo-back.herokuapp.com/](https://insurceo-back.herokuapp.com/)

Parámetros (body): 
```json
{
  "email": "test@test.com",
  "form": "ut7Cfj4w"
}
```

Estos parámetros los recibirá el front directamente cuando Typeform haga el redirect. Después, el front ya pasará los mismo parámetros al web service.
