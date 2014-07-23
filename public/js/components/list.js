/** @jsx React.DOM */

// Actions and whatnot

var listStore = [];

var listAction = {
	updateProgress: function(msg, data){
		for(var i = 0; i < listStore.length; i++){
			if(listStore[i].seriesTitle === data.seriesTitle){
				var listItem = listStore[i];
				if(listItem.itemProgress < listItem.seriesTotal - 1){
					listItem.itemProgress++;
				} else {
					listItem.itemProgress++;
					listItem.itemStatus = 2;
				}
				PubSub.publish(constants.DATA_CHANGE);
				break;
			}
		}
	},
	updateRating: function(msg, data){

	},
	updateStatus: function(msg, data){

	}
}

var constants = {
	DATA_CHANGE: 'DATA_CHANGE',
	LIST_ERROR: 'LIST_ERROR',
	UPDATE_PROGRESS: 'UPDATE_PROGRESS',
	UPDATE_RATING: 'UPDATE_RATING',
	UPDATE_STATUS: 'UPDATE_STATUS'
}

$.ajax({
	type: 'get',
	url: '/data/50.json',
	success: function(listData){
		listStore = listData;
		setTimeout(function(){
			PubSub.publishSync(constants.DATA_CHANGE, listData);
		}, 1000);
	},
	error: function(){
		PubSub.publishSync(constants.LIST_ERROR);
	}
});

PubSub.subscribe(constants.UPDATE_PROGRESS, listAction.updateProgress);
PubSub.subscribe(constants.UPDATE_RATING, listAction.updateRating);
PubSub.subscribe(constants.UPDATE_STATUS, listAction.updateStatus);

var ReactClassSet = React.addons.classSet;
var ReactTransGroup = React.addons.CSSTransitionGroup;

var listAppComp = React.createClass({
	getInitialState: function(){
		var app = {
			listData: [],
			listFilterText: '',
			listLoaded: false,
			listLoadError: false,
			listLastSort: 'seriesTitle',
			listLastOrder: 'asc'
		}
		return app;
	},
	componentDidMount: function(){
		PubSub.subscribe(constants.DATA_CHANGE, this.loadList);
		PubSub.subscribe(constants.LIST_ERROR, this.loadError);
	},
	loadList: function(msg){
		this.sortList(this.state.listLastSort, this.state.listLastOrder);
		if(!this.state.listLoaded){
			this.setState({
				listLoaded: true
			});
		}
	},
	loadError: function(){
		this.setState({
			listLoaded: true,
			listLoadError: true
		});
	},
	sortList: function(sortBy, order){
		if(!sortBy) sortBy = 'seriesTitle';

		if((this.state.listLastSort === sortBy) && (!order || (typeof order).indexOf('object') > -1)){
			(this.state.listLastOrder === 'asc') ? order = 'desc' : order = 'asc';
		} else {
			order = 'asc';
		}

		//console.log('Sorting list by "' + sortBy + '" in an "' + order + 'ending" order');

		var listSorted = listStore;

		// WORK: Replace the objSort library with something faster (?)

		if(order === 'desc'){
			listSorted = listSorted.objSort('itemStatus', sortBy, -1);
		} else {
			listSorted = listSorted.objSort('itemStatus', sortBy);
		}
		
		this.setState({
			listData: listSorted,
			listLastSort: sortBy,
			listLastOrder: order
		});
	},
	filterList: function(event){
		this.setState({
			listFilterText: event.target.value
		});
	},
	render: function(){
		var divStyle = {
			display: (this.state.listLoaded && this.state.listData.length && !this.state.listLoadError) ? 'block' : 'none'
		}

		if(listStore.length) $('#anime-nav-count').text(listStore.length);

		return (
			<div>
				<div style={divStyle}>
					<div id="list-top">
						<div id="list-filter-wrap">
							<input type="text" max-length="50" id="list-filter-input" placeholder="Filter by title..." onChange={this.filterList} />
						</div>
					</div>
					<div id="list-sort">
						<div id="list-sort-title" className="list-sort-hd" onClick={this.sortList.bind(this, 'seriesTitle')}>
							Title
						</div>
						<div id="list-sort-progress" className="list-sort-hd" onClick={this.sortList.bind(this, 'itemProgress')}>
							Progress
						</div>
						<div id="list-sort-rating" className="list-sort-hd" onClick={this.sortList.bind(this, 'itemRating')}>
							Rating
						</div>
						<div id="list-sort-type" className="list-sort-hd" onClick={this.sortList.bind(this, 'seriesType')}>
							Type
						</div>
					</div>
				</div>
				<listComp
					listData={this.state.listData}
					listFilterText={this.state.listFilterText}
					listLoaded={this.state.listLoaded}
					listLoadError={this.state.listLoadError}
				/>
			</div>
		)
	}
});

var listComp = React.createClass({
	propTypes: {
		listData: React.PropTypes.array,
		listFilterText: React.PropTypes.string,
		listLoaded: React.PropTypes.bool,
		listLoadError: React.PropTypes.bool
	},
	mapStatus: function(number){
		var status = [
			undefined,
			'Current',
			'Completed',
			'Planned',
			'On Hold',
			'Dropped'
		]
		return status[number];
	},
	render: function(){
		console.log('Ran render at ' + new Date().getTime());
		var listDOM = [];
		var ifListLoaded = (this.props.listLoaded && !this.props.listLoadError);
		var ifListEmpty = (ifListLoaded && this.props.listFilterText !== '');
		var ifListError = (this.props.listLoaded && this.props.listLoadError);
		var ifListOnBoard = (ifListLoaded && !this.props.listData.length && !this.props.listLoadError);
		var lastStatus = null;

		if(ifListLoaded){
			_.each(this.props.listData, function(listItem, index){
				var listNode = [];

				if(this.props.listFilterText !== ''){
					var filterText = this.props.listFilterText;
					var filterCondition = (listItem.seriesTitle.toLowerCase().indexOf(filterText) > -1); 
					if(filterCondition){
						listNode.push(<listItemComp itemData={listItem} key={index + '-item'} />);
					}	
				} else {
					listNode.push(<listItemComp itemData={listItem} key={index + '-item'} />);
				}

				if(lastStatus !== listItem.itemStatus && listNode.length){
					lastStatus = listItem.itemStatus;
					listDOM.push(
						<div key={index + '-status'} className={ // FIX: Let this have index as key one _id is used for listItems
							ReactClassSet({
								'list-itemstatus-wrap': true,
								'current': (lastStatus === 2) // ?: When index is 0, the current listPart status is "current"
							})
						}>
							<div className="list-itemstatus-tag">
								{this.mapStatus(lastStatus)}
							</div>
							<div className="list-itemstatus-line">
							</div>
						</div>
					)
				}
				if(listNode.length)	listDOM.push(listNode); // ?: This has to come after the status header
			}.bind(this));
		}

		if(ifListEmpty && !listDOM.length){
			listDOM.push(<div id="list-noresults">No matching entries were found</div>);
		} else if(ifListError){
			listDOM.push(<listError />);
		} else if(ifListOnBoard){
			listDOM.push(<listOnBoard />);
		}
		
		return (<div>{listDOM}</div>);
	}
});

var listItemComp = React.createClass({
	propTypes: {
		itemData: React.PropTypes.object,
		itemIndex: React.PropTypes.number
	},
	getInitialState: function(){
		return {
			expanded: false
		}
	},
	incrementProgress: function(){
		PubSub.publish(constants.UPDATE_PROGRESS, this.props.itemData);
	},
	expandItem: function(event){
		if(event.target.className.indexOf('list-item-content') > -1){
			this.setState({
				expanded: !this.state.expanded
			});
		}
	},
	render: function(){
		return (
			<div className="list-item">
				<div className="list-item-content" onClick={this.expandItem}>
					<div className="list-item-left">
						<a className="list-item-title" href="/">
							{this.props.itemData.seriesTitle}
						</a>
					</div>
					<div className="list-item-right">
						<div className={
							ReactClassSet({
								'list-item-plusone': true,
								'icon-plus': true,
								'hidden': (this.props.itemData.itemStatus === 2) // ?: Hide the 'plus-one' button if list item is under 'completed'
							})
						} onClick={this.incrementProgress}>
						</div>
						<div className="list-item-progress">
							<span className="list-progress-current">{this.props.itemData.itemProgress}</span>
							<span className="list-progress-sep">/</span>
							<span className="list-progress-total">{this.props.itemData.seriesTotal}</span>
						</div>
						<div className="list-item-rating">
							<span className={
								ReactClassSet({
									"list-rating-icon": true,
									"icon-heart-full": this.props.itemData.itemRating,
									"icon-heart-empty": !this.props.itemData.itemRating
								})
							}></span>
							<span className="list-rating-number">
								{
									(this.props.itemData.itemRating) ? this.props.itemData.itemRating / 2 : '—' // ?: Divide score by two, or display m-dash
								}
							</span>
						</div>
						<div className="list-item-type">
							<span className="list-type-icon tv">{this.props.itemData.seriesType}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var listError = React.createClass({
	render: function(){
		return (
			<div id="list-error">
				<div id="list-error-image" className="icon-support">
				</div>
				<div id="list-error-title">
					Sorry! Herro is experiencing some problems.
				</div>
				<p id="list-error-desc">
					We are already on the case and will resolve this issue as soon as possible.
					Feel free to contact us if this issue persists.
				</p>
			</div>
		)
	}
});

var listOnBoard = React.createClass({
	render: function(){
		return (
			<div id="list-onboard">
				<div id="onboard-welcome">
					Let's get started quickly.
				</div>
				<div id="onboard-wrap">
					<div id="onboard-left" className="onboard-option">
						<div className="onboard-image icon-book-2">
						</div>
						<div className="onboard-title">
							Start adding entries to a new list
						</div>
						<div className="onboard-desc">
							Super easy to do. We'll help you get started with tracking your favorite series in no time!
						</div>
						<a id="onboard-btn-new" className="onboard-btn">
							Start with fresh list
						</a>
					</div>
					<div id="onboard-sep">
					</div>
					<div id="onboard-right" className="onboard-option">
						<div className="onboard-image icon-book-lines-2">
						</div>
						<div className="onboard-title">
							Sync with an already existing list
						</div>
						<div className="onboard-desc">
							If you already have a list, we can help you keep 
							things synced across platforms.
							<br />
							<span className="onboard-tiny">
								(even if you never ever will use something besides Herro....right?)
							</span>
						</div>
						<a id="onboard-btn-sync" className="onboard-btn">
							Sync from old list
						</a>
					</div>
				</div>
			</div>
		)
	}
});

React.renderComponent(<listAppComp />, document.getElementById('list-left'));