/** @jsx React.DOM */

var registerForm = React.createClass({displayName: 'registerForm',
	getInitialState: function(){
		return {
			usernameVal: null,
			passwordVal: null,
			emailVal: null,
			emailValid: null
		}
	},
	usernameChange: function(e){
		this.setState({
			usernameVal: e.target.value.replace(/\W+/g, '')
		});
	},
	passwordChange: function(e){
		this.setState({
			passwordVal: e.target.value
		});
	},
	emailChange: function(e){
		e.persist();
		this.setState({
			emailVal: e.target.value
		});
		this.validateEmail(e);
	},
	validateEmail: _.debounce(function(e){
		$.ajax({
			type: 'get',
			url: 'https://api.mailgun.net/v2/address/validate',
			data: {
				address: e.target.value,
				api_key: 'pubkey-809b78e9259959060a4c93bae86b290a'
			},
			success: function(res){
				this.setState({
					emailValid: res.is_valid === true
				});
			}.bind(this),
			error: function(err){
				console.log(err);
			}
		});
	}, 1000),
	render: function(){
		return (
			React.DOM.form({id: "register-form", className: "logreg-form"}, 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-form-hd"}, 
						"Let's get this started."
					), 
					React.DOM.div({id: "logreg-form-desc"}, 
						"Most of Herro's features don't require that you have an email. However, if you forget your login credentials you will be shit out of luck."
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Username ", React.DOM.div({className: "logreg-legend-desc"}, "At least ", React.DOM.b(null, "3"), " chars. Only letters/numbers.")), 
					React.DOM.input({className: "logreg-input", type: "text", name: "username", value: this.state.usernameVal, onChange: this.usernameChange})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Password ", React.DOM.div({className: "logreg-legend-desc"}, "At least ", React.DOM.b(null, "6"), " characters. Keep this secure.")), 
					React.DOM.input({className: "logreg-input", type: "password", name: "password", value: this.state.passwordVal, onChange: this.passwordChange})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Email ", React.DOM.div({className: "logreg-legend-desc"}, React.DOM.b(null, "Optional"), ". You can add/remove it later.")), 
					React.DOM.input({className: "logreg-input", type: "text", name: "email", value: this.state.emailVal, onChange: this.emailChange})
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