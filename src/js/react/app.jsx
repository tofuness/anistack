var React = require('react/addons');
window.React = React;

var ListApp = require('./components/list.jsx');
var Settings = require('./components/settings.jsx');
var LoginForm = require('./components/login.jsx');
var RegisterForm = require('./components/register.jsx');
var SearchApp = require('./components/search.jsx');

var listNode = document.getElementById('list-left');
if(listNode){
	React.renderComponent(<ListApp />, listNode);
}

var settingsNode = document.getElementById('settings');
if(settingsNode){
	React.renderComponent(<Settings />, settingsNode);
}

var registerNode = document.getElementById('register-form-wrap');
if(registerNode){
	React.renderComponent(<RegisterForm />, registerNode);
}

var loginNode = document.getElementById('login-form-wrap');
if(loginNode){
	React.renderComponent(<LoginForm />, loginNode);
}

var searchNode = document.getElementById('search-page-wrap');
if(searchNode){
	React.renderComponent(<SearchApp />, searchNode);
}