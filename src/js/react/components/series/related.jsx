var React = require('react');

var cx = React.addons.classSet;
var RelatedSeries = React.createClass({
	getInitialState: function() {
		return {
			relatedSeries: [],
			expanded: false
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
	toggleViewMore: function() {
		this.setState({
			expanded: !this.state.expanded
		});
	},
	render: function() {
		return (
			<div>
				{
					this.state.relatedSeries.map(function(series, index) {
						var seriesRelatedStyle = {
							backgroundImage: 'url(' + series.series_image_reference + ')'
						}

						if (!this.state.expanded && index > 2) return null;

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
					}.bind(this))
				}
				<div className={
					cx({
						'series-viewmore': true,
						'visible': (this.state.relatedSeries.length > 3)
					})
				} onClick={this.toggleViewMore}>
					 <span className={
					 	cx({
					 		'icon-down-open': !this.state.expanded,
					 		'icon-up-open': this.state.expanded
					 	})
					 }></span> {this.state.expanded ? 'Show less' : 'View ' + (this.state.relatedSeries.length - 3) + ' more'}
				</div>
			</div>
		);
	}
});

module.exports = RelatedSeries;