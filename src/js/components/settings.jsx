/**
 * @jsx React.DOM
 */

var Settings = React.createClass({
	render: function() {
		return (
			<div>
				<div className="setting-section-hd">
				</div>
				<div className="setting-section">
					<div className="setting-left">
					</div>
					<div className="setting-right">
						
					</div>
				</div>
			</div>
		);
	}
});

var mountNode = document.getElementById('settings');
if(mountNode) React.renderComponent(<Settings />, mountNode);