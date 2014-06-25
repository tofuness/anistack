##Quickstart Guide

1. Start off by installing the latest stable version of Node.js.
2. Install the latest stable version of Mongo DB.
3. Install `node-dev` with `npm install node-dev -g`. This is a simple daemon, which can be useful for development.
4. Install `gulp` with `npm install gulp -g`.
5. Clone this repository and run `npm install`, in the application directory, to install all the necessary modules.
6. Run `gulp` in the application directory to start building/watching assets.
7. Run `node-dev app.js` to start the application. The application will automatically restart when changes are made to the files.

##Important

* All CSS (SASS) changes should be done in `/private/css`.
* Create a new SASS file if needed (new feature or function), in order to improve code clarity.
* All code should be as DRY as possible
* "External" directories are for 3rd-party plugins and extensions.
