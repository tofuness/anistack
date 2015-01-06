var React = require('react');

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
			similarSeries: []
		};
	},
	render: function() {
		return (
			<div ref="similarListWrap">
				{
					this.state.similarSeries.map(function(series) {
						var similarItemStyle = {
							backgroundImage: 'url(' + series.series_image_reference + ')'
						}
						if (!series.series_synopsis) {
							series.series_synopsis = '';
						}
						return (
							<div className="series-similar-item">
								<div className="series-similar-left">
									<a href={'/' + this.props.collection + '/' + series.series_slug} className="series-similar-image" style={similarItemStyle}>
									</a>
								</div>
								<div className="series-similar-right">
									<div className="series-similar-hd">
										<div className="series-similar-meta">
											<span className="series-similar-type">{series.series_type}</span> {this.props.collection === 'anime' ? ' with ' + (series.series_episodes_total || '???') + ' episodes' : ''}
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
			</div>
		);
	}

});

module.exports = SimilarSeries;