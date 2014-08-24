#README 0.1

###Setting up Herro

1. Make sure you have the following things up installed and running:
	* [Node.js and NPM](http://nodejs.org/) (NPM comes bundled with Node).
	* [Mongo DB](http://www.mongodb.org/).
2. Install [`node-dev`](https://github.com/fgnass/node-dev) with `npm install node-dev -g`. This is a tool that will restart the application, automatically, on file changes.
3. Install [`gulp`](http://gulpjs.com/) with `npm install gulp -g`. This is a build tool used to: compile [SASS](http://sass-lang.com/) into CSS; concatenate JS files; minify resources.
4. Navigate to `/Web` and use `npm install` to install all dependencies.
5. Navigate to `/API` and use `npm install` to install all dependencies.
6. Run `node-dev api.js` in `/API` to start the API.
7. Run `node-dev app.js` in `/Web` to start the application.
8. Run `gulp` in `/Web` to start the build tool.
9. Go to [`localhost:1337`](http://localhost:1337) and start hacking!

###Application structure

All application layers run independently. Under `/API` you will find the API, and under `/Web` all front-end related code that make up most of the website. 

###Working on `/Web`
1. All compiled/built files can be found under `/public/[js/css]`.
2. If you want to change something in the CSS or JS, go to `/src/[css/js]`. All external libraries are located under `/src/[css/js]/external`, and all internally written code should be placed under `/src/[css/js]/includes`.
3. The React.js components are located under `/src/js/components`. The JSX files are automatically compiled to JS files with the build tool.

###Working on `/API`
1. All Schemas, together with their validation and filtering methods, should be in `db.js`.
2. All API routes should be in `./routes/*.js`.
3. Keep the routes as clean as possible and let Mongoose, together with its plugins, handle the validation.