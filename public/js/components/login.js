/** @jsx React.DOM */

var loginForm = React.createClass({displayName: 'loginForm',
	logIn: function(){
		$(this.refs.loginForm.getDOMNode()).submit();
	},
	render: function(){
		return (
			React.DOM.form({id: "login-form", className: "logreg-form", ref: "loginForm", method: "post", action: "/login"}, 
				React.DOM.div({id: "logreg-form-logo"}), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Username"), 
					React.DOM.input({className: "logreg-input", type: "text", name: "username", tabIndex: "1"})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Password ", React.DOM.a({className: "logreg-legend-link", href: "/forgot"}, "Forgot your Password?")), 
					React.DOM.input({id: "logreg-password-input", className: "logreg-input", type: "password", name: "password", tabIndex: "2"})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-submit", onClick: this.logIn}, "Log in")
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.a({className: "logreg-link", href: "/register"}, "or Register for Free")
				)
			)
		)
	}
});

React.renderComponent(loginForm(null), document.getElementById('login-form-wrap'));