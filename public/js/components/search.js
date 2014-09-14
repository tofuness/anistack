/** @jsx React.DOM */

var ReactClassSet = React.addons.classSet;
var searchComp = React.createClass({displayName: 'searchComp',
	getInitialState: function(){
		var comp = {
			searchText: '',
			searchResults: []
		}
		return comp;
	},
	componentDidMount: function(){
		$.ajax({
			type: 'get',
			url: '/data/10.json',
			success: function(res){
				this.setState({
					searchResults: res
				});
			}.bind(this)
		});
	},
	search: function(e){
		this.setState({
			searchText: e.target.value
		});
	},
	render: function(){
		var searchResults = [];

		for(var i = 0; i < this.state.searchResults.length; i++){
			searchResults.push(
				searchResComp({
					itemData: this.state.searchResults[i]}
				)
			)
		}

		return (
			React.DOM.div({className: "search-wrap"}, 
				React.DOM.div({className: "search-input-wrap"}, 
					React.DOM.input({
						className: "search-input", 
						type: "text", 
						maxLength: "20", 
						placeholder: "Search for stuff...", 
						value: this.state.searchText, 
						onChange: this.search}
					)
				), 
				React.DOM.div({className: "search-results-wrap", onScroll: this.closePickers}, 
					searchResults
				)
			)
		)
	}
});

var searchResComp = React.createClass({displayName: 'searchResComp',
	propTypes: {
		itemData: React.PropTypes.object
	},
	getInitialState: function(){
		var comp = {
			added: false,
			pickerVisible: false
		}
		return comp;
	},
	componentDidMount: function(){
		PubSub.subscribe(constants.CLOSE_PICKERS, this.close);
	},
	togglePicker: function(e){
		if(this.state.added) return false;
		PubSub.publishSync(constants.CLOSE_PICKERS);
		this.setState({
			pickerVisible: !this.state.pickerVisible
		});
	},
	close: function(){
		if(this.state.added || !this.state.pickerVisible) return false;
		this.setState({
			pickerVisible: false
		});
	},
	finish: function(){
		this.setState({
			added: true,
			pickerVisible: false
		});
	},
	render: function(){
		return (
			React.DOM.div({className: "search-item-wrap"}, 
				React.DOM.div({className: "search-item"}, 
					React.DOM.div({className: "search-item-left"}, 
						React.DOM.div({className: "search-item-title"}, 
							this.props.itemData.seriesTitle
						), 
						React.DOM.div({className: "search-item-meta"}, 
							React.DOM.span({className: "search-item-type"}, this.props.itemData.seriesType), 
							React.DOM.span({className: "search-item-total"}, " with ", this.props.itemData.seriesTotal, " Episodes")
						)
					), 
					React.DOM.div({className: "search-item-right"}, 
						React.DOM.div({className: 
							ReactClassSet({
								'search-item-add': true,
								'open': this.state.pickerVisible,
								'added': this.state.added
							}), 
						onClick: this.togglePicker, title: "...to your list"}, 
							
								(this.state.added) ? 'Added' : '+ Add'
							
						), 
						pickerComp({
							itemData: this.props.itemData, 
							visible: this.state.pickerVisible, 
							finish: this.finish}
						)
					)
				)
			)
		)
	}
});

React.renderComponent(searchComp(null), document.getElementById('search-page'));