# Readme for YouTube Analyser Application Source code

## Code divisions

The code is divided into two different folders acting as IntelliJ (or other development environment) - the back-end side is Java-coded, and uses Spring Boot to set up a server for future clients (that would be the front-end side of this project).

The front-end side is coded using React, JSX syntax, JavaScript, HTML, and CSS (in the form of SCSS). 

## Important Information Before Running the Code

The application is made to analyse YouTube accounts and videos within them. For that to be achieved, the user has to be granted an OAuth 2.0 token by Google, using their account. The application is currently registered as a "testing application" and is not yet published within Google's environment Google Cloud Platform. Main reason for this being the inclusions of the ability for local executions of this application.

If the application is published and those local execution backdoors remain, attackers could easily abuse this and access pieces of data they should not.

Since the application is still registered as a "testing application in development" with Google, just specified google accounts (up to 100) are allowed to be granted tokens for security purposes. Other accounts that are not registered will NOT allow the application to load! That is why there are 2 choices for the testing purpose:

1. Using a pre-made tester account.
There  is an account that is already pre-registered with Google systems and to use it, you can log into the system with the following details:
email: analysertester888@gmail.com
password: YouTubeAnalyserAppTester12

2. Using your own account.
This would be slightly more difficult, since you have to provide me with an email address that would be accepted by Google to authorise this application. I would then have to add that email to the test accounts of the application.

**Recommendation:** using the pre-made tester account would be simpler, even though the videos uploaded are just dummy videos and analysis may be irrelevant in this situation.

**Recommendation:** When logging in with this account, Google will ask for permissions for data access for the analysis performed by the application. Please, check all boxes, because if not all are checked, the app may not perform as intended.

## Running the code

There are two ways to execute the application - from the university's DEVWEB, OR locally.

### Execution From DEVWEB

All of the files presented have been deployed to the university's server. The back-end servlet is deployed to the Tomcat environment provided for students. The front-end client side is deployed to DEVWEB as well.

To access the application, one should visit the following link:
[THIS IS THE APPLICATION ON DEVWEB](https://devweb2023.cis.strath.ac.uk/~jwb20147/honsProject888)

**To be noted: When first accessing the application from devweb, the user may experience a slow response from the server. This happens because of the limited allocated computing power for students on the university's Apache Tomcat server. The application would be much faster if executed locally OR if the server was external and computing power allocated was larger.**

### Local Execution

Initially, all dependencies need to be instantiated with Maven using the pom.xml file for specific dependencies. Local startup of the back-end is done by compiling the BackendApplication.java (within the src/main/java/com/honours/backend folder) and running that class's main method.

The port where it operates is 8080, so access to that servlet would be done at the URL of http://localhost:8080, followed by specific mappings of the application.

To access a local servlet from the front-end, the .env file needs to be edited. The **REACT_APP_BACKEND_ROOT** variable's value needs to be exchanged with the value of **REACT_APP_BACKEND_ROOT_LOCALHOST**. Otherwise, the front-end would still be making requests to the servlet on the university's server.

Local startup of the front-end is done by executing a series of terminal commands. A nodejs version has to be installed on the machine as well as an npm command runner (this could be done with the help of nvm which can be found [HERE](https://github.com/coreybutler/nvm-windows/releases/tag/1.1.9) but there are other alternatives). Initially, with the help of the `cd` command, navigate to the folder `frontend` of this submission. Then, if a nodejs and an npm versions exists on the machine, 2 commands have to be executed:

`npm install react`

and 

`npm start package.json`

That would execute all react scripts described in package.json and start up the application's client side.

## Reccomendations

For easement and time-efficient purposes, the deployed version on DEVWEB could be used, since it is made up of the same code that is within this submission. The only drawback would be the longer times for HTTP handshakes between the client and the server, as mentioned above.