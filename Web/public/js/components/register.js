/** @jsx React.DOM */

var registerForm = React.createClass({displayName: 'registerForm',
	render: function(){
		return (
			React.DOM.form({id: "register-form", className: "logreg-form"}, 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-form-hd"}, 
						"Let's this get started."
					), 
					React.DOM.div({id: "logreg-form-desc"}, 
						"We don't need your e-mail. However, if you forget your credentials you will be shit out of luck."
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Username ", React.DOM.div({className: "logreg-legend-desc"}, "Required")), 
					React.DOM.input({className: "logreg-input", type: "text", name: "username"})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Password ", React.DOM.div({className: "logreg-legend-desc"}, "Required (at least 6 chars. long)")), 
					React.DOM.input({className: "logreg-input", type: "password", name: "password"})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "E-mail ", React.DOM.div({className: "logreg-legend-desc"}, "Optional")), 
					React.DOM.input({className: "logreg-input", type: "password", name: "password"})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-submit"}, "Create My Account")
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.a({className: "logreg-link", href: "/login"}, "Already registered?")
				)
			)
		)
	}
});

React.renderComponent(registerForm(null), document.getElementById('register-form-wrap'));