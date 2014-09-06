/** @jsx React.DOM */

var loginForm = React.createClass({
	render: function(){
		return (
			<form id="login-form" class="logreg-form">
				<div className="logreg-input-wrap">
					<input class="logreg-input" type="text" placeholder="Username" name="username" /> 
				</div>
				<div className="logreg-input-wrap">
					<input class="logreg-input" type="password" placeholder="Password" name="password" /> 
				</div>
				<div className="logreg-input-wrap">
					<a href="" class="logreg-link-left">Forgot password?</a><div id="logreg-submit">Login</div>
				</div>
			</form>		
		)
	}
});

React.renderComponent(<loginForm />, document.getElementById('login-form-wrap'));