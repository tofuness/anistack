/** @jsx React.DOM */

var searchComp = React.createClass({displayName: 'searchComp',
	getInitialState: function(){
		var initState = {
			searchText: 'bebop',
			searchResults: []
		}
		return initState;
	},
	componentDidMount: function(){
		if(this.state.searchText) this.search();
	},
	onSearch: function(e){
		this.setState({
			searchText: e.target.value || ''
		});

		if(e.target.value !== ''){
			this.search();
		} else {
			this.setState({
				searchResults: []
			});
		}
	},
	search: _.debounce(function(){
		$.ajax({
			type: 'get',
			url: '/api/anime/search/' + this.state.searchText,
			success: function(searchRes){
				this.setState({
					searchResults: searchRes
				});
			}.bind(this),
			error: function(err){
				console.log(err);
			}
		});
	}, 300),
	onEsc: function(e){
		// On escape, clear the search
		if(e.key === 'Escape'){ 
			this.setState({ searchText: '', searchResults: [] });
		}
	},
	render: function(){
		return (
			React.DOM.div({id: "search-page"}, 
				React.DOM.div({id: "search-input-wrap"}, 
					React.DOM.input({id: "search-input", type: "text", placeholder: "Type to search...", value: this.state.searchText, onChange: this.onSearch, onKeyUp: this.onEsc})
				), 
				React.DOM.div({id: "search-results-wrap"}, 
				
					this.state.searchResults.map(function(searchRes){
						return searchItem({series: searchRes});
					})
				
				)
			)
		);
	}
});

var searchItem = React.createClass({displayName: 'searchItem',
	render: function(){
		var imageStyle = {
			backgroundImage: 'url(' + this.props.series.series_image_reference + ')'
		}
		
		return (
			React.DOM.div({className: "search-result"}, 
				React.DOM.div({className: "search-result-image", style: imageStyle}
				), 
				React.DOM.div({className: "search-result-content"}, 
					React.DOM.div({className: "search-result-title-wrap"}, 
						React.DOM.div({className: "search-result-title"}, 
							this.props.series.series_title_main
						), 
						React.DOM.div({className: "search-result-year"}, 
						
							(this.props.series.series_date_start) ? new Date(this.props.series.series_date_start).getFullYear() : ''
						
						)
					), 
					React.DOM.div({className: "search-result-desc"}, 
						this.props.series.series_description
					)
				)
			)
		)
	}
});

React.renderComponent(searchComp(null), document.getElementById('search-page-wrap'));