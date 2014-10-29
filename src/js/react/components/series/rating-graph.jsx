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
				for (var i = 0; i < ratingsData.length; i++) {
					ratingsTotal += ratingsData[i].count;
				}

				this.setState({
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
	},
	render: function() {
		return (
			<div id="series-rating-graph" ref="seriesRatingGraph">{
				this.state.ratingsData.map(function(rating, index) {
					var barStyle = {
						height: rating.count / this.state.ratingsTotal * 100 + '%'
					}

					// By doing (+ index + 1) we force a mathematical operation
					return (
						<div className="series-rating-bar" title={barStyle.height + ' gave this a rating of ' + (+ index + 1)} style={barStyle}>
						</div>
					)
				}.bind(this))
			}</div>
		);
	}
});

module.exports = SeriesRatingGraph;