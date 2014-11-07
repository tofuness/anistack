var PickerApp = require('./picker.jsx')
var listStore = [];
var cx = React.addons.classSet;
var TempListConstants = {
	TYPE: $('#list-left').data('list-type'),
	USERNAME: $('#list-left').data('username'),
	EDITABLE: $('#list-left').data('editable')
}

var ListApp = React.createClass({
	getInitialState: function() {
		return {
			listFilterText: '', // Search text
			listFilterStatus: 'current', // Which tab to display
			listLoaded: false, // Display list if true
			listPrivate: false,
			listLastSort: 'series_title_main', // Property name from API
			listLastOrder: 'asc' // Order to sort by
		}
	},
	componentDidMount: function() {
		PubSub.subscribe(ListConstants.DATA_CHANGE, this.reloadList);
		$.ajax({
			url: '/api/list/' + TempListConstants.TYPE + '/view/' + TempListConstants.USERNAME,
			type: 'get',
			success: function(listData) {
				if (listData.private) {
					this.setState({
						listPrivate: true,
						listLoaded: true
					});
				} else {
					listStore = listData;
					PubSub.publishSync(ListConstants.DATA_CHANGE);
				}
			}.bind(this),
			error: function(err) {
				console.log(err);
			}
		});
	},
	reloadList: function(data) {
		this.sortList(this.state.listLastSort, this.state.listLastOrder);

		// This displays the list after the list is loaded from API
		if (!this.state.listLoaded) {
			this.setState({
				listLoaded: true
			});
		}
	},
	sortList: function(sortBy, order) {
		sortBy = sortBy || 'series_title_main';

		// Decide if it should be asc or desc
		if ((this.state.listLastSort === sortBy) && (!order || (typeof order).indexOf('object') > -1)) {
			(this.state.listLastOrder === 'asc') ? order = 'desc' : order = 'asc';
		} else if (!order) {
			order = 'asc';
		}

		var listSorted = keysort(listStore, 'item_status, ' + sortBy + ' ' + order +', series_title_main');
		this.setState({
			listData: listSorted,
			listLastSort: sortBy,
			listLastOrder: order
		});
	},
	setStatusFilter: function(statusVal) {
		this.setState({
			listFilterStatus: statusVal
		});
	},
	setTextFilter: function(e) {
		this.setState({
			listFilterText: e.target.value
		});
	},
	clearTextFilter: function(e) {
		if (e.key === 'Escape' && this.state.listFilterText !== '') {
			this.setState({
				listFilterText: ''
			});
		}
	},
	render: function() {
		var listStyle = {
			display: (this.state.listLoaded) ? 'block' : 'none'
		}

		if (this.state.listPrivate) {
			return (<ListPrivate />);
		}
		return (
			<div style={listStyle}>
				<div id="list-top">
					<div id="list-tabs-wrap">
						{
							['All', 'Current', 'Completed', 'Planned', 'On Hold', 'Dropped'].map(function(statusName, index) {
								var statusVal = statusName.toLowerCase().replace(/ /g, '')
								return (
									<div className={cx({
										'list-tab': true,
										'current': (statusVal === this.state.listFilterStatus)
									})} onClick={this.setStatusFilter.bind(this, statusVal)} key={'tab-' + index}>
										{statusName}
									</div>
								)
							}.bind(this))
						}
					</div>
					<div id="list-filter-wrap">
						<input
							type="text"
							maxLength="50"
							id="list-filter-input"
							placeholder="Type to filter list..."
							onChange={this.setTextFilter}
							onKeyUp={this.clearTextFilter}
							value={this.state.listFilterText}
						/>
					</div>
					<div id="list-sort-wrap">
						<div id="list-sort-title" className="list-sort-hd" onClick={this.sortList.bind(this, 'series_title_main', null)}>
							Title
						</div>
						<div id="list-sort-progress" className="list-sort-hd" onClick={this.sortList.bind(this, 'item_progress', null)}>
							Progress
						</div>
						<div id="list-sort-rating" className="list-sort-hd" onClick={this.sortList.bind(this, 'item_rating', null)}>
							Rating
						</div>
						<div id="list-sort-type" className="list-sort-hd" onClick={this.sortList.bind(this, 'series_type', null)}>
							Type
						</div>
					</div>
				</div>
				<ListContent
					listData={this.state.listData}
					listLoaded={this.state.listLoaded}
					listFilterText={this.state.listFilterText}
					listFilterStatus={this.state.listFilterStatus}
				/>
			</div>
		);
	}
});

var ListContent = React.createClass({
	propTypes: {
		listData: React.PropTypes.array,
		listFilterText: React.PropTypes.string,
		listFilterStatus: React.PropTypes.string,
		listLoaded: React.PropTypes.bool
	},
	getInitialState: function() {
		return {
			batchRendering: (this.props.listData && this.props.listData.length > 150),
			listBegin: 0,
			listEnd: 40
		}
	},
	componentDidMount: function() {
		if (!this.state.batchRendering) return false;

		// Decides how much of the list we should render
		$(window).on('scroll', function(e) {
				var scrollBottom = $(window).scrollTop().valueOf() + $(window).height();
				var listItemsOnScreen = window.innerHeight / 43 | 0;
				var listMulti = Math.ceil(scrollBottom / window.innerHeight);
				var listEnd = listItemsOnScreen * listMulti * 1.5;

				if (this.state.listEnd < listEnd || listMulti === 1) {
					this.setState({ listEnd: listEnd });
				}
		}.bind(this));
	},
	render: function() {
		var listDOM = [];
		var lastStatus = null;
		var lastStatusCount = 0;
		if (!this.props.listLoaded) return (<div />);
		_.each(this.props.listData, function(listItem, index) {
			var listNode = []; // Current node we are iterating over

			if(
				(this.props.listFilterStatus &&
				this.props.listFilterStatus !== 'all') &&
				this.props.listFilterStatus !== listItem.item_status
			){
				return null;
			}

			// Check if item matches search string
			var matchingGenre= _.findIndex(listItem.series_genres, function(genre) {
				return genre.match(new RegExp('^' + this.props.listFilterText, 'gi'));
			}.bind(this));

			if(
				this.props.listFilterText !== '' &&
				listItem.series_title_main.match(new RegExp(this.props.listFilterText, 'gi')) ||
				listItem.series_title_english && listItem.series_title_english.match(new RegExp(this.props.listFilterText, 'gi')) ||
				matchingGenre > -1
			){
				listNode.push(<ListItem itemData={listItem} key={listItem._id} />);
			} else if (this.props.listFilterText === '') {
				listNode.push(<ListItem itemData={listItem} key={listItem._id} />);
			}

			if (lastStatus !== listItem.item_status && listNode.length) {
				lastStatus = listItem.item_status;
				lastStatusCount++;
				listDOM.push(
					<div key={listItem._id + '-status'} className={
						cx({
							'list-itemstatus-wrap': true,
							'current': (lastStatus === 'current')
						})
					}>
						<div className="list-itemstatus-tag">
							{lastStatus}
						</div>
						<div className="list-itemstatus-line">
						</div>
					</div>
				)
			}
			if (listNode.length) listDOM.push(listNode[0]);
		}.bind(this));
	
		/* 
			If batchRendering is enabled, slice the listDOM
			accordingly and fix some of the styling.
		*/
		var listStyle = {
			paddingBottom: 15
		}

		if (this.state.batchRendering && lastStatusCount > 0) {
			listStyle.minHeight = (listDOM.length - lastStatusCount) * 43;
			listDOM = listDOM.slice(0, this.state.listEnd);
		}

		/*
			If list is empty, it could be either becauase of there are no items
			or becuase nothing matched the search text.
		*/

		if (listDOM.length === 0 && this.props.listFilterText === '') {
			listDOM = <ListEmpty statusName={this.props.listFilterStatus.replace('onhold', 'on hold')} />;
		} else if (listDOM.length === 0) {
			listDOM = <ListNoResults />;
		}

		return (<div id="list-content" style={listStyle}>{listDOM}</div>);
	}
});

var ListEmpty = React.createClass({
	componentDidMount: function() {
		$(this.refs.listNoRes.getDOMNode()).velocity('transition.slideUpIn', {
			delay: 100,
			duration: 300
		});
	},
	render: function() {
		return (<div ref="listNoRes" id="list-noresults">No series under {this.props.statusName}!</div>);
	}
});

var ListNoResults = React.createClass({
	componentDidMount: function() {
		$(this.refs.listNoRes.getDOMNode()).velocity('transition.slideUpIn', {
			delay: 100,
			duration: 300
		});
	},
	render: function() {
		return (<div ref="listNoRes" id="list-noresults">No matches. Try another search term.</div>);
	}
});

var ListPrivate = React.createClass({
	componentDidMount: function() {
		$(this.refs.listPrivate.getDOMNode()).velocity('herro.slideUpIn', {
			duration: 800
		});
	},
	render: function() {
		return (<div id="list-private" ref="listPrivate"><span id="list-private-icon" className="icon-lock-line"></span>This list is private.</div>);
	}
});

var ListItem = React.createClass({
	getInitialState: function() {
		return {
			hoveringCancel: false,
			expanded: false, // Is the list item expanded
			showPicker: false // If the PickerApp component should mount
		};
	},
	cancel: function() {
		if (this.state.expanded) {
			this.toggleExpanded(function() {
				// On cancel, reset the PickerApp component by re-mounting it.
				this.setState({
					showPicker: false
				});
			}.bind(this));
		}
	},
	remove: function() {
		if (!confirm('Are you sure you want to remove?')) return false;
		
		var itemIndex = _.findIndex(listStore, { _id: this.props.itemData._id });

		$.ajax({
			url: '/api/list/' + TempListConstants.TYPE + '/remove',
			data: { _id: this.props.itemData._id, _csrf: UserConstants.CSRF_TOKEN },
			type: 'POST',
			error: function() {
				alert('Something seems to be wrong on our side! Your list did not get updated :C');
			}
		});

		// Remove 43px (list item height) from the div
		$('#list-content').css('min-height','-=43');

		// If we are changing status, transision the whole div
		$(this.refs.listItem.getDOMNode()).stop(true).velocity({
			backgroundColor: ['#e8e8e8', '#fffff'],
			height: [0, 333]
		}, {
			easing: [0.165, 0.84, 0.44, 1],
			duration: 300,
			complete: function() {
				$(this.refs.listItemExpanded.getDOMNode()).css('height', 0);
				this.setState({
					expanded: false
				});
				listStore.splice(itemIndex, 1);
				PubSub.publishSync(ListConstants.DATA_CHANGE);
			}.bind(this)
		});
	},
	saveData: function(data) {
		var itemIndex = _.findIndex(listStore, { _id: this.props.itemData._id });

		data._csrf = UserConstants.CSRF_TOKEN;
		$.ajax({
			url: '/api/list/' + TempListConstants.TYPE + '/update',
			data: data,
			type: 'POST',
			error: function() {
				alert('Something seems to be wrong on our side! Your list did not get updated :C');
			}
		});

		if (data.item_status !== this.props.itemData.item_status) {
			// Remove 43px (list item height) from the div
			$('#list-content').css('min-height','-=43');

			// If we are changing status, transision the whole div
			$(this.refs.listItem.getDOMNode()).stop(true).velocity({
				backgroundColor: ['#e8e8e8', '#fffff'],
				height: [0, 333]
			}, {
				easing: [0.165, 0.84, 0.44, 1],
				duration: 300,
				complete: function() {
					$(this.refs.listItemExpanded.getDOMNode()).css('height', 0);
					this.setState({
						expanded: false
					});
					listStore[itemIndex] = _.extend(listStore[itemIndex], data);
					PubSub.publishSync(ListConstants.DATA_CHANGE);
				}.bind(this)
			}).velocity({
				backgroundColor: ['#ffffff', '#e8e8e8'],
				height: [43, 0]
			}, {
				easing: [0.165, 0.84, 0.44, 1],
				duration: 300
			}).velocity({
				height: '100%'
			});
		} else {
			// If we are not changing status, just change the values. No animations.
			listStore[itemIndex] = _.extend(listStore[itemIndex], data);
			PubSub.publishSync(ListConstants.DATA_CHANGE);
		}
	},
	toggleExpanded: function(e) {
		if (!TempListConstants.EDITABLE) return false;
		if ($(e.target).hasClass('list-item-title')) return;
		$(this.refs.listItemExpanded.getDOMNode()).stop(true).velocity({
			height: (this.state.expanded) ? [0, 290] : [290, 0]
		}, {
			easing: [0.165, 0.84, 0.44, 1],
			duration: (this.state.expanded) ? 200 : 300,
			complete: function() {
				// If e is a function, we know that it should be a callback
				if (!this.state.expanded) {
					this.setState({
						showPicker: false
					});
				}
				if (e instanceof Function) {
					e();
				}
			}.bind(this)
		});
		this.setState({
			expanded: !this.state.expanded,
			showPicker: true
		});
	},
	render: function() {
		var listItemStyle = {
			backgroundImage: 'url(' + this.props.itemData.series_image_reference + ')'
		}
		var listExpPicker = null;
		if (this.state.showPicker) {
			listExpPicker = <PickerApp collection={TempListConstants.TYPE} itemData={this.props.itemData} seriesData={this.props.itemData} onRemove={this.remove} onSave={this.saveData} />;
		}
		return (
			<div ref="listItem" className="list-item-wrap">
				<div className={cx({
					'list-item':  true,
					'expanded': this.state.expanded
				})} onClick={this.toggleExpanded}>
					<div className="list-item-image-preview" style={listItemStyle}>
					</div>
					<div className="list-item-title-wrap">
						<a className="list-item-title link" href={'/' + TempListConstants.TYPE + '/' + this.props.itemData.series_slug} title={this.props.itemData.series_title_main}>
							{this.props.itemData.series_title_main}
						</a>
					</div>
					<div className="list-item-right">
						<div className="list-item-progress">
							<div className="list-item-progress-sofar">
								{this.props.itemData.item_progress || '—'}
							</div>
							<div className="list-item-progress-sep">
							/
							</div>
							<div className="list-item-progress-total">
								{this.props.itemData.series_episodes_total || '—'}
							</div>
						</div>
						<div className="list-item-rating">
							<div className={
								cx({
									'list-item-rating-icon': true,
									'icon-heart-empty': !this.props.itemData.item_rating,
									'icon-heart-full': this.props.itemData.item_rating
								})
							}></div>
							<div className="list-item-rating-number">
								{(this.props.itemData.item_rating) ? (this.props.itemData.item_rating / 2).toFixed(1) : '—'}
							</div>
						</div>
						<div className="list-item-type">
							{this.props.itemData.series_type}
						</div>
					</div>
				</div>
				<div ref="listItemExpanded" className={
					cx({
						'list-item-expanded': true,
						'visible': this.state.expanded
					})
				}>	
					<div className="list-exp-ovl">
						<div className="list-exp-image" style={listItemStyle}>
						</div>
						<div className="list-exp-picker">
							{listExpPicker}
						</div>
					</div>
				</div>
			</div>
		)
	}
});

module.exports = ListApp;