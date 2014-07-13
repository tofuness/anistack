/** @jsx React.DOM */

var listApp = React.createClass({
	getInitialState: function(){
		var app = {
			listData: [],
			listDataSource: [],
			listFilterText: '',
			listLoaded: false,
			listError: false,
			listLastSort: ''
		}
		return app;
	},
	componentDidMount: function(){
		$.ajax({
			type: 'get',
			url: '/data/50.json',
			success: function(listData){
				this.setState({
					listData: listData,
					listDataSource: listData
				});
				this.groupList();
				this.sortList();
				this.setState({
					listLoaded: true
				});
			}.bind(this),
			error: function(){

			}.bind(this)
		});
	},
	groupList: function(groupBy){
		if(!groupBy) groupBy = 'itemStatus';

		var listArrTemp = [];
		var listDataSource = _.groupBy(this.state.listDataSource, 'itemStatus');

		_.each(listDataSource, function(listPart, index){
			listArrTemp.push(listPart);
		});

		this.setState({
			listData: listArrTemp
		});
	},
	sortList: function(sortBy){
		if(!sortBy) sortBy = 'seriesTitle';

		var listData = this.state.listData;

		_.each(listData, function(listPart, index){
			if(this.state.listLastSort === sortBy){
				listData[index] = listPart.reverse();
			} else {
				listData[index] = _.sortBy(listPart, function(listItem, index){
					return listItem[sortBy];
				});
			}
		}.bind(this));

		this.setState({
			listData: listData,
			listLastSort: sortBy
		});
	},
	filterList: function(event){
		this.setState({
			listFilterText: event.target.value
		});
	},
	render: function(){
		return (
			<div>
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
	render: function(){
		var listDOM = [];

		if(this.props.listLoaded){
			_.each(this.props.listData, function(listPart, index){
				var listPartEmpty = true;
				listPart = listPart.map(function(listItem, index){
					if(this.props.listFilterText != ''){
						var filterText = this.props.listFilterText;
						var filterCondition = (listItem.seriesTitle.toLowerCase().indexOf(filterText) > -1); 
						if(filterCondition){
							listPartEmpty = false;
							return (<listItemComp itemData={listItem} itemIndex={index} />);
						} else {
							return null;
						}
					} else {
						listPartEmpty = false;
						return (<listItemComp itemData={listItem} itemIndex={index} />);
					}
				}.bind(this));

				if(!listPartEmpty){
					listDOM.push(
						<div key={index + '-status'} className={ // FIX: Let this have index as key one _id is used for listItems
							React.addons.classSet({
								'list-itemstatus-wrap': true,
								'current': (index === 0) // ?: When index is 0, the current listPart status is "current"
							})
						}>
							<div className="list-itemstatus-tag">
								{index}
							</div>
							<div className="list-itemstatus-line">
							</div>
						</div>
					);
					listDOM.push(listPart);
				}
			}.bind(this));
		}
		
		return (<div>{listDOM}</div>);
	}
});

var listItemComp = React.createClass({
	render: function(){
		return (
			<div className="list-item">
				<div className="list-item-content">
					<div className="list-item-left">
						<div className="list-item-title">
							{this.props.itemData.seriesTitle}
						</div>
					</div>
					<div className="list-item-right">
						<div className={
							React.addons.classSet({
								'list-item-plusone': true,
								'icon-plus': true,
								'hidden': (this.props.itemData.itemStatus === 2) // ?: Hide the 'plus-one' button if list item is under 'completed'
							})
						} onClick={this.plusOne}>
						</div>
						<div className="list-item-progress">
							<span className="list-progress-current">{this.props.itemData.itemProgress}</span>
							<span className="list-progress-sep">/</span>
							<span className="list-progress-total">{this.props.itemData.seriesTotal}</span>
						</div>
						<div className="list-item-rating">
							<span className={
								React.addons.classSet({
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
				<div className="list-item-expanded">
				</div>
			</div>
		);
	}
});

React.renderComponent(<listApp />, document.getElementById('list-left'));