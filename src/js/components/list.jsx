/** @jsx React.DOM */

var listStore = [];
var listAction = {

}

var listComp = React.createClass({
	getInitialState: function(){
		var app = {
			listData: [], // List data
			listFilterText: '', // Filter by string
			listFilterStatus: '', // Filter by status
			listLoaded: false, // Display list
			listLoadError: false, // Hides list and show error
			listLastSort: 'seriesTitle', // Which property the list is sorter by
			listLastOrder: 'asc' // Which order the list is currently sorted by
		}
		return app;
	},
	shouldComponentUpdate: function(nextProps, nextState){
		/*
			By default this returns true always. Which makes the thing
			re-render a bunch of times even if nothing changed. This 
			below should be implemented as the default behavior in React.
		*/
		if(nextState === this.state) return false;
		return true;
	},
	componentDidMount: function(){
		// Initialize list
		PubSub.subscribe(constants.DATA_CHANGE, this.initList);

		// Displays the error message and kills the component
		PubSub.subscribe(constants.LIST_ERROR, this.errList);
	},
	initList: function(){
		if(!this.state.listLoaded){
			this.setState({
				listLoaded: true
			});
		}
	},
	sortList: function(sortBy, order){
		// ES6 WHEN?! Set default property, to sort by, to title
		if(!sortBy) sortBy = 'seriesTitle';

		// This automagically works
		if((this.state.listLastSort === sortBy) && (!order || (typeof order).indexOf('object') > -1)){
			(this.state.listLastOrder === 'asc') ? order = 'desc' : order = 'asc';
		} else if(!order){
			order = 'asc';
		}

		var listSorted = listStore;

		listSorted = keysort(listSorted, 'itemStatus, ' + sortBy + ' ' + order + ', seriesTitle');
		
		this.setState({
			listData: listSorted,
			listLastSort: sortBy,
			listLastOrder: order
		});
	},
	render: function(){
		return (<div></div>);
	}
});

React.renderComponent(<listComp />, document.getElementById('list-left'));