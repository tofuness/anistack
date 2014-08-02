var ReactClassSet = React.addons.classSet;

var searchComp = React.createClass({
	getInitialState: function(){
		var app = {
			searchText: '',
			searchResults: []
		}
		return app;
	},
	render: function(){
		return (
			<div className="search-wrap">
				<div className="search-input-wrap">
					<input typd="text" maxLength="20"
				</div>
				<div className="search-results-wrap">
					<div className="search-results">
					</div>
				</div>
			</div>
		)
	}
});