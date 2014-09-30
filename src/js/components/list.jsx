/** @jsx React.DOM */

var listStore = [];

$.ajax({
	url: '/api/list/anime/view/' + USER.USERNAME,
	type: 'get',
	success: function(listData){
		listStore = listData;
		PubSub.publishSync(constants.DATA_CHANGE, listData)
	}
});

var listApp = React.createClass({
	getInitialState: function(){
		return {
			listLastSort: 'series_title', // Property name from API
			listLastOrder: 'asc'
		}
	},
	reloadList: function(data){
		this.sortList(this.state.listLastSort, this.state.listLastOrder);
	},
	sortList: function(sortBy, order){
		sortBy = sortBy || 'series_title';

		// Decide if it should be asc or desc

		if((this.state.listLastSort === sortBy) && (!order || (typeof order).indexOf('object') > -1)){
			(this.state.listLastOrder === 'asc') ? order = 'desc' : order = 'asc';
		} else if(!order){
			order = 'asc';
		}

		this.setState({
			listData: keysort(listStore, 'item_status, ' + sortBy + ' ' + order +', series_title'),
			listLastSort: sortBy,
			listLastOrder: order
		});
	},
	componentDidMount: function(){
		PubSub.subscribe(constants.DATA_CHANGE, this.loadListData);
	},
	render: function(){
		return (
			<div></div>	
		);
	}
});

var listItem = React.createClass({
	render: function(){
		return (
			<div></div>
		)
	}
});

React.renderComponent(<listApp />, document.getElementById('list-left'));