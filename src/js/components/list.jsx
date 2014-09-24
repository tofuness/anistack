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
		// By default, shouldComponentUpdate just returns true.
		// This replaces default behavior.
		if(nextState === this.state) return false;
		return true;
	},
	componentDidMount: function(){
		PubSub.subscribe(constants.DATA_CHANGE, this.initList);
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
		// Set default property, to sort by, to title
		if(!sortBy) sortBy = 'series_title';

		// This automagically works
		if((this.state.listLastSort === sortBy) && (!order || (typeof order).indexOf('object') > -1)){
			(this.state.listLastOrder === 'asc') ? order = 'desc' : order = 'asc';
		} else if(!order){
			order = 'asc';
		}

		var listSorted = listStore;

		// Sort by property, e.g. progress, then by title.

		listSorted = keysort(listSorted, 'itemStatus, ' + sortBy + ' ' + order + ', series_title');
		
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

//React.renderComponent(<listComp />, document.getElementById('list-left'));