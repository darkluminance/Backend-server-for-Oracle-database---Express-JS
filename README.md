1. Create a folder and put the files there

2. Open cmd in the folder by typing **cmd** from the location bar on the top of the file explorer

3. Type the following commands in order :

   - npm init -y (Will create a package.json file inside the folder indicating it's a node js app)
   - npm install (Will install the required packages of this project for node js)
   - code . (Will open up visual studio code in the folder)

Now you can write your codes in the **index.js** file

4. Open up terminal from the vscode screen and type:

- node index.js (Will run index.js as a node js app. All the javascript codes will be executed now)

----OPTIONAL----

If you change anything from the file and save it, you'll have to stop the current run from the terminal (Hitting Ctrl+C)
and then again run using the **node index.js** command.
In order to avoid that you can do the following :

- npm install nodemon (Will install the nodemon package)
- npx nodemon (Will start a live backend node js server from that folder)

Now if you do any changes to the index.js file and save it, the server will automatically reload everytime.
The main point to remember is everytime you reopen vscode, you'll have to restart the server using **npx nodemon** again.
