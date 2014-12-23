var React = require('react');

var RelatedSeries = React.createClass({
	getInitialState: function() {
		return {
			relatedSeries: []
		};
	},
	componentWillMount: function() {
		$.ajax({
			url: '/api/' + this.props.collection + '/related/' + this.props._id,
			success: function(res) {
				this.setState({
					relatedSeries: res
				});
			}.bind(this)
		});
	},
	render: function() {
		return (
			<div>
				{
					this.state.relatedSeries.map(function(series) {
						return (
							<div>{series.series_title_main}</div>
						)
					})
				}
			</div>
		);
	}
});

module.exports = RelatedSeries;