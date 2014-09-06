/** @jsx React.DOM */

var loginForm = React.createClass({displayName: 'loginForm',
	render: function(){
		return (
			React.DOM.form({id: "login-form", class: "logreg-form"}, 
				React.DOM.div({className: "logreg-input-wrap"}, 
					React.DOM.input({class: "logreg-input", type: "text", placeholder: "Username", name: "username"})
				), 
				React.DOM.div({className: "logreg-input-wrap"}, 
					React.DOM.input({class: "logreg-input", type: "password", placeholder: "Password", name: "password"})
				), 
				React.DOM.div({className: "logreg-input-wrap"}, 
					React.DOM.a({href: "", class: "logreg-link-left"}, "Forgot password?"), React.DOM.div({id: "logreg-submit"}, "Login")
				)
			)		
		)
	}
});

React.renderComponent(loginForm(null), document.getElementById('login-form-wrap'));