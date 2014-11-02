var React = require('react');

var SeriesRatingGraph = React.createClass({
	propTypes: {
		_id: React.PropTypes.string,
		collection: React.PropTypes.string
	},
	getInitialState: function() {
		return {
			ratingsData: [],
			ratingsTotal: 1 // Division by zero is a no no
		};
	},
	componentWillMount: function() {
		$.ajax({
			url: '/api/' + this.props.collection + '/stats/' + this.props._id,
			type: 'GET',
			success: function(ratingsData) {
				var ratingsTotal = 0;
				var ratingsAverage = 0;
				for (var i = 0; i < ratingsData.length; i++) {
					ratingsTotal += ratingsData[i].count;
					ratingsAverage += ratingsData[i].count * ratingsData[i]._id;
				}
				if (ratingsAverage) ratingsAverage = (ratingsAverage / (2 * ratingsTotal));

				this.setState({
					ratingsAverage: ratingsAverage.toFixed(1),
					ratingsTotal: ratingsTotal,
					ratingsData: ratingsData
				});

				this.animateIn();
			}.bind(this)
		});
	},
	animateIn: function() {
		$(this.refs.seriesRatingGraph.getDOMNode()).find('>div').velocity('transition.slideUpIn', {
			delay: 100,
			duration: 300,
			stagger: 50
		});

		$(this.refs.seriesRatingAverage.getDOMNode()).find('>div').velocity('transition.slideUpIn', {
			delay: 300,
			duration: 400,
			stagger: 100
		});
	},
	render: function() {
		var highestCount = _.max(this.state.ratingsData, function(rating) { return rating.count }).count;

		// We do not want division by zero
		if(highestCount === 0) highestCount = 1;
		
		return (
			<div id="series-rating-graph">
				<div id="series-rating-graph-left" ref="seriesRatingGraph">
					{
						this.state.ratingsData.map(function(rating, index) {
							var percentageOfTotal = rating.count / this.state.ratingsTotal * 100 + '%';
							var barStyle = {
								height: rating.count / highestCount * 100 + '%'
							}
							// By doing (+ index + 1) we force a mathematical operation
							return (
								<div className="series-rating-bar" title={percentageOfTotal + ' gave this a rating of ' + (+ index + 1) / 2} style={barStyle}>
								</div>
							)
						}.bind(this))
					}
				</div>
				<div id="series-rating-graph-right">
					<div className="series-rating-graph-average" ref="seriesRatingAverage">
						<div className="series-rating-graph-average-value">{this.state.ratingsAverage}</div>
						<div className="series-rating-graph-desc">
							Average
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = SeriesRatingGraph;