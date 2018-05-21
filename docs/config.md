# Configuration Scheme
3 different methods are used to pass configuration information to this application.
* .env file _(using **dotenv** or **dotenv-safe** package)_
* config folder _(using **config** package)_
* pm2 enviorment variables _(using **pm2** package)_

## .env file
The **.env** file is used to pass environment dependent or sensitive/private information to the application. It should not be committed with git.
> Note that the **.env.example** file _(if using **dotenv-safe** package)_ SHOULD be committed with git.

Examples include database credentials/URIs and the server port number.

## config folder
The **config** folder should be used to store more general and verbose configuration information that is not sensitive. The **config** package looks for a **default.{js or json}** file int the **config** folder and uses that to pass on config information.
> Think of the **config/default.{js or json}** file as an entry point for general configuration

## pm2 config
I've not yet come up with a reason to use pm2 over .env or the config folder.
