var React = require('react');

var cx = React.addons.classSet;
var SimilarSeries = React.createClass({
	componentWillMount: function() {
		$.ajax({
			url: '/api/' + this.props.collection + '/similar/' + this.props._id,
			success: function(res) {
				this.setState({
					similarSeries: res
				});
			}.bind(this)
		});
	},
	getInitialState: function() {
		return {
			similarSeries: [],
			expanded: false
		};
	},
	toggleViewMore: function() {
		this.setState({
			expanded: !this.state.expanded
		});
	},
	render: function() {
		return (
			<div ref="similarListWrap">
				{
					this.state.similarSeries.map(function(series, index) {
						var similarItemStyle = {
							backgroundImage: 'url(' + series.series_image_reference + ')'
						}

						if (!this.state.expanded && index > 2) return null;

						return (
							<div className="series-similar-item">
								<div className="series-similar-left">
									<a href={'/' + this.props.collection + '/' + series.series_slug} className="series-similar-image" style={similarItemStyle}>
									</a>
								</div>
								<div className="series-similar-right">
									<div className="series-similar-hd">
										<div className="series-similar-meta">
											<span className="series-similar-type">{series.series_type}</span> {this.props.collection === 'anime' ? ' / ' + (series.series_episodes_total || '???') + ' episodes' : ''}
										</div>
										<a className="series-similar-title" href={'/' + this.props.collection + '/' + series.series_slug}>
											{series.series_title_main}
										</a>
										<div className="series-similar-alt-titles">
											{series.series_title_english} {(series.series_title_english) ? '|' : ''} {series.series_title_japanese}
										</div>
									</div>
								</div>
							</div>
						)
					}.bind(this))
				}
				<div className={
					cx({
						'series-viewmore': true,
						'visible': (this.state.similarSeries.length > 2)
					})
				} onClick={this.toggleViewMore}>
					 <span className={
					 	cx({
					 		'icon-down-open': !this.state.expanded,
					 		'icon-up-open': this.state.expanded
					 	})
					 }></span> {this.state.expanded ? 'Show less' : 'View ' + (this.state.similarSeries.length - 3) + ' more'}
				</div>
			</div>
		);
	}

});

module.exports = SimilarSeries;