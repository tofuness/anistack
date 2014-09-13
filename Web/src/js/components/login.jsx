/** @jsx React.DOM */

var loginForm = React.createClass({
	render: function(){
		return (
			<form id="login-form" className="logreg-form">
				<div id="logreg-form-logo"></div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Username</div>
					<input className="logreg-input" type="text" name="username" /> 
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Password <a className="logreg-legend-link" href="/forgot">Forgot your Password?</a></div>
					<input id="logreg-password-input" className="logreg-input" type="password" name="password" /> 
				</div>
				<div className="logreg-section-wrap">
					<div id="logreg-submit">Log in</div>
				</div>
				<div className="logreg-section-wrap">
					<a className="logreg-link" href="/register">or Register for Free</a>
				</div>
			</form>
		)
	}
});

React.renderComponent(<loginForm />, document.getElementById('login-form-wrap'));