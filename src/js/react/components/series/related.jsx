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
						var seriesRelatedStyle = {
							backgroundImage: 'url(' + series.series_image_reference + ')'
						}
						return (
							<div className="series-related-item">
								<div className="series-related-left">
									<a className="series-related-image" style={seriesRelatedStyle} href={'/' + series.relation.relation_collection + '/' + series.series_slug}>
									</a>
								</div>
								<div className="series-related-right">
									<div className="series-related-relation">
										<span className="series-related-type">{series.series_type}</span> / {series.relation.relation}
									</div>
									<a href={'/' + series.relation.relation_collection + '/' + series.series_slug} className="series-related-title">
										{series.series_title_main}
									</a>
									<div className="series-related-alt-titles">
										{series.series_title_english} {(series.series_title_english) ? '|' : ''} {series.series_title_japanese}
									</div>
								</div>
							</div>
						)
					})
				}
			</div>
		);
	}
});

module.exports = RelatedSeries;