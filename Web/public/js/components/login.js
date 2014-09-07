/** @jsx React.DOM */

var loginForm = React.createClass({displayName: 'loginForm',
	render: function(){
		return (
			React.DOM.form({id: "login-form", className: "logreg-form"}, 
				React.DOM.div({id: "logreg-form-logo"}), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Username"), 
					React.DOM.input({className: "logreg-input", type: "text", name: "username"})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Password ", React.DOM.a({className: "logreg-legend-link", href: "/forgot"}, "Forgot your Password?")), 
					React.DOM.input({className: "logreg-input", type: "password", name: "password"})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-submit"}, "Log in")
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.a({className: "logreg-link", href: "/register"}, "or Register for Free")
				)
			)
		)
	}
});

React.renderComponent(loginForm(null), document.getElementById('login-form-wrap'));