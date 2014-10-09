/** @jsx React.DOM */

var listStore = [];
var cx = React.addons.classSet;
var TempListConstants = {
	TYPE: $('#list-left').data('list-type'),
	USERNAME: $('#list-left').data('username'),
	EDITABLE: $('#list-left').data('editable')
}

var ListApp = React.createClass({displayName: 'ListApp',
	getInitialState: function(){
		return {
			listFilterText: '', // Search text
			listFilterStatus: 'all', // Which tab to display
			listLoaded: false, // Display list if true
			listLastSort: 'series_title_main', // Property name from API
			listLastOrder: 'asc' // Order to sort by
		}
	},
	componentDidMount: function(){
		PubSub.subscribe(ListConstants.DATA_CHANGE, this.reloadList);
		$.ajax({
			url: '/api/list/' + TempListConstants.TYPE + '/view/' + TempListConstants.USERNAME,
			type: 'get',
			success: function(listData){
				listStore = listData;
				console.log('listStore length: ' + listStore.length);
				PubSub.publishSync(ListConstants.DATA_CHANGE);
			},
			error: function(err){
				console.log(err);
			}
		});
	},
	reloadList: function(data){
		this.sortList(this.state.listLastSort, this.state.listLastOrder);

		// This displays the list after the list is loaded from API
		if(!this.state.listLoaded){
			this.setState({
				listLoaded: true
			});
		}
	},
	sortList: function(sortBy, order){
		sortBy = sortBy || 'series_title_main';

		// Decide if it should be asc or desc

		if((this.state.listLastSort === sortBy) && (!order || (typeof order).indexOf('object') > -1)){
			(this.state.listLastOrder === 'asc') ? order = 'desc' : order = 'asc';
		} else if(!order){
			order = 'asc';
		}

		var listSorted = keysort(listStore, 'item_status, ' + sortBy + ' ' + order +', series_title_main');
		this.setState({
			listData: listSorted,
			listLastSort: sortBy,
			listLastOrder: order
		});
	},
	setStatusFilter: function(statusVal){
		this.setState({
			listFilterStatus: statusVal
		});
	},
	setTextFilter: function(e){
		this.setState({
			listFilterText: e.target.value
		});
	},
	render: function(){
		var listStyle = {
			display: this.state.listLoaded
		}
		return (
			React.DOM.div({style: listStyle}, 
				React.DOM.div({id: "list-top"}, 
					React.DOM.div({id: "list-tabs-wrap"}, 
						
							['All', 'Current', 'Completed', 'Planned', 'On Hold', 'Dropped'].map(function(statusName, index){
								var statusVal = statusName.toLowerCase().replace(/ /g, '')
								return (
									React.DOM.div({className: cx({
										'list-tab': true,
										'current': (statusVal === this.state.listFilterStatus)
									}), onClick: this.setStatusFilter.bind(this, statusVal), key: 'tab-' + index}, 
										statusName
									)
								)
							}.bind(this))
						
					), 
					React.DOM.div({id: "list-filter-wrap"}, 
						React.DOM.input({type: "text", maxLength: "50", id: "list-filter-input", placeholder: "Filter your list...", onChange: this.setTextFilter})
					), 
					React.DOM.div({id: "list-sort-wrap"}, 
						React.DOM.div({id: "list-sort-title", className: "list-sort-hd", onClick: this.sortList.bind(this, 'series_title_main', null)}, 
							"Title"
						), 
						React.DOM.div({id: "list-sort-progress", className: "list-sort-hd", onClick: this.sortList.bind(this, 'item_progress', null)}, 
							"Progress"
						), 
						React.DOM.div({id: "list-sort-rating", className: "list-sort-hd", onClick: this.sortList.bind(this, 'item_rating', null)}, 
							"Rating"
						), 
						React.DOM.div({id: "list-sort-type", className: "list-sort-hd", onClick: this.sortList.bind(this, 'series_type', null)}, 
							"Type"
						)
					)
				), 
				ListContent({
					listData: this.state.listData, 
					listLoaded: this.state.listLoaded, 
					listFilterText: this.state.listFilterText, 
					listFilterStatus: this.state.listFilterStatus}
				)
			)
		);
	}
});

var ListContent = React.createClass({displayName: 'ListContent',
	propTypes: {
		listData: React.PropTypes.array,
		listFilterText: React.PropTypes.string,
		listFilterStatus: React.PropTypes.string,
		listLoaded: React.PropTypes.bool
	},
	getInitialState: function(){
		return {
			batchRendering: true,
			listBegin: 0,
			listEnd: 40
		}
	},
	componentDidMount: function(){
		if(!this.state.batchRendering) return false;

		// Decides how much of the list we should render
		$(window).on('scroll', function(e){
				var scrollBottom = $(window).scrollTop().valueOf() + $(window).height();
				var listItemsOnScreen = window.innerHeight / 43 | 0;
				var listMulti = Math.ceil(scrollBottom / window.innerHeight);
				var listEnd = listItemsOnScreen * listMulti * 1.5;

				if(this.state.listEnd < listEnd || listMulti === 1){
					console.log('listEnd value:' + listEnd);
					this.setState({ listEnd: listEnd });
				}
		}.bind(this));
	},
	render: function(){
		var listDOM = [];
		var lastStatus = null;
		var lastStatusCount = 0;
		if(!this.props.listLoaded) return (React.DOM.div(null));
		_.each(this.props.listData, function(listItem, index){
			var listNode = []; // Current node we are iterating over

			if(
				(this.props.listFilterStatus &&
				this.props.listFilterStatus !== 'all') &&
				this.props.listFilterStatus !== listItem.item_status
			){
				return null;
			}

			// Check if item matches search string

			if(
				this.props.listFilterText !== '' &&
				listItem.series_title_main.match(new RegExp(this.props.listFilterText, 'gi'))
			){
				listNode.push(ListItem({itemData: listItem, key: listItem._id}));
			} else if(this.props.listFilterText === ''){
				listNode.push(ListItem({itemData: listItem, key: listItem._id}));
			}

			if(lastStatus !== listItem.item_status && listNode.length){
				lastStatus = listItem.item_status;
				lastStatusCount++;
				listDOM.push(
					React.DOM.div({key: listItem._id + '-status', className: 
						cx({
							'list-itemstatus-wrap': true,
							'current': (lastStatus === 'current')
						})
					}, 
						React.DOM.div({className: "list-itemstatus-tag"}, 
							lastStatus
						), 
						React.DOM.div({className: "list-itemstatus-line"}
						)
					)
				)
			}
			if(listNode.length) listDOM.push(listNode[0]);
		}.bind(this));
	
		/* 
			If batchRendering is enabled, slice the listDOM
			accordingly and fix some of the styling.
		*/

		if(this.state.batchRendering && lastStatusCount > 0){
			var listStyle = {
				'padding-bottom': 15,
				'min-height': (listDOM.length - lastStatusCount) * 43
			}
			listDOM = listDOM.slice(0, this.state.listEnd);
		}

		/*
			If list is empty, it could be either becauase of there are no items
			or becuase nothing matched the search text.
		*/

		if(listDOM.length === 0 && this.props.listFilterText === ''){
			listDOM = ListEmpty(null);
		} else if(listDOM.length === 0){
			listDOM = ListNoResults(null);
		}
		return (React.DOM.div({id: "list-content", style: listStyle}, listDOM));
	}
});

var ListEmpty = React.createClass({displayName: 'ListEmpty',
	render: function(){
		return (React.DOM.div(null, "Empty!!"));
	}
});

var ListNoResults = React.createClass({displayName: 'ListNoResults',
	render: function(){
		return (React.DOM.div(null, "No results"));
	}
});

var ListItem = React.createClass({displayName: 'ListItem',
	getInitialState: function() {
		return {
			expanded: false, // Is the list item expanded
			showPicker: false // If the PickerApp component should mount
		};
	},
	cancel: function(){
		if(this.state.expanded){
			this.toggleExpanded(function(){
				// On cancel, reset the PickerApp component by re-mounting it.
				this.setState({
					showPicker: false
				});
			}.bind(this));
		}
	},
	saveData: function(data){
		var itemIndex = _.findIndex(listStore, { _id: this.props.itemData._id });
		if(data.item_status !== this.props.itemData.item_status){
			// Remove 43px (list item height) from the div
			$('#list-content').css('min-height','-=43');

			// If we are changing status, transision the whole div
			$(this.refs.listItem.getDOMNode()).stop(true).velocity({
				backgroundColor: ['#e8e8e8', '#fffff'],
				height: [0, 323]
			}, {
				easing: [0.165, 0.84, 0.44, 1],
				duration: 300,
				complete: function(){
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
	toggleExpanded: function(e){
		this.setState({
			expanded: !this.state.expanded,
			showPicker: true
		});
		$(this.refs.listItemExpanded.getDOMNode()).stop(true).velocity({
			height: (this.state.expanded) ? [0, 280] : [280, 0]
		}, {
			easing: [0.165, 0.84, 0.44, 1],
			duration: (this.state.expanded) ? 200 : 300,
			complete: function(){
				// If e is a function, we know that it should be a callback
				if(e instanceof Function){
					e();
				}
			}.bind(this)
		});
	},
	render: function(){
		var listItemStyle = {
			backgroundImage: 'url(' + this.props.itemData.series_image_reference + ')'
		}
		var listExpPicker = null;
		if(this.state.showPicker){
			listExpPicker = (PickerApp({itemData: this.props.itemData, seriesData: this.props.itemData, onCancel: this.cancel, onSave: this.saveData}));
		}
		return (
			React.DOM.div({ref: "listItem", className: "list-item-wrap"}, 
				React.DOM.div({className: cx({
					'list-item':  true,
					'expanded': this.state.expanded
				}), onClick: this.toggleExpanded}, 
					React.DOM.div({className: "list-item-image-preview", style: listItemStyle}
					), 
					React.DOM.div({className: "list-item-title"}, 
						this.props.itemData.series_title_main
					), 
					React.DOM.div({className: "list-item-right"}, 
						React.DOM.div({className: "list-item-progress"}, 
							React.DOM.div({className: "list-item-progress-sofar"}, 
								this.props.itemData.item_progress || '—'
							), 
							React.DOM.div({className: "list-item-progress-sep"}, 
							"/"
							), 
							React.DOM.div({className: "list-item-progress-total"}, 
								this.props.itemData.series_episodes_total || '—'
							)
						), 
						React.DOM.div({className: "list-item-rating"}, 
							React.DOM.div({className: 
								cx({
									'list-item-rating-icon': true,
									'icon-heart-empty': !this.props.itemData.item_rating,
									'icon-heart-full': this.props.itemData.item_rating
								})
							}), 
							React.DOM.div({className: "list-item-rating-number"}, 
								(this.props.itemData.item_rating) ? (this.props.itemData.item_rating / 2).toFixed(1) : '—'
							)
						), 
						React.DOM.div({className: "list-item-type"}, 
							this.props.itemData.series_type
						)
					)
				), 
				React.DOM.div({ref: "listItemExpanded", className: 
					cx({
						'list-item-expanded': true,
						'visible': this.state.expanded
					}), 
				style: listItemStyle}, 	
					React.DOM.div({className: "list-exp-ovl"}, 
						React.DOM.div({className: "list-exp-image", style: listItemStyle}
						), 
						React.DOM.div({className: "list-exp-picker"}, 
							listExpPicker
						)
					)
				)
			)
		)
	}
});

var mountNode = document.getElementById('list-left');
if(mountNode) React.renderComponent(ListApp(null), mountNode);
/** @jsx React.DOM */

var loginForm = React.createClass({displayName: 'loginForm',
	logIn: function(){
		$(this.refs.loginForm.getDOMNode()).submit();
	},
	render: function(){
		return (
			React.DOM.form({id: "login-form", className: "logreg-form", ref: "loginForm", method: "post", action: "/login"}, 
				React.DOM.div({id: "logreg-form-logo"}), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Username"), 
					React.DOM.input({className: "logreg-input", type: "text", name: "username", tabIndex: "1"})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Password ", React.DOM.a({className: "logreg-legend-link", href: "/forgot"}, "Forgot your Password?")), 
					React.DOM.input({id: "logreg-password-input", className: "logreg-input", type: "password", name: "password", tabIndex: "2"})
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-submit", onClick: this.logIn}, "Log in")
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.a({className: "logreg-link", href: "/register"}, "or Register for Free")
				)
			)
		)
	}
});
var mountNode = document.getElementById('login-form-wrap');
if(mountNode) React.renderComponent(loginForm(null), mountNode);
/** @jsx React.DOM */
var cx = React.addons.classSet;
var PickerApp = React.createClass({displayName: 'PickerApp',
	propTypes: {
		collection: React.PropTypes.string,
		seriesData: React.PropTypes.object,
		onClose: React.PropTypes.func,
		onSave: React.PropTypes.func
	},
	getInitialState: function(){
		return {
			item_status: 'current',
			item_progress: '',
			item_rating: '',
			item_repeats: '',
			ratingPreview: '',
			statusMenuVisible: false
		}
	},
	componentDidUpdate: function(prevProps, prevState){
		var episodesTotal = this.props.seriesData.series_episodes_total;

		// If statement below is there to make sure no infinite-loop happen

		if(
			this.state.item_status === 'completed' !==
			(this.state.item_progress === episodesTotal)
		){

			// (1) If changed status to completed: bump up the item_progress

			if(this.state.item_status === 'completed' && prevState.item_status !== 'completed'){
				this.setState({
					item_progress: episodesTotal
				});
			}

			// (2) If changed the status from completed: remove the item_progress

			if(prevState.item_status === 'completed' && this.state.item_status !== 'completed'){
				this.setState({
					item_progress: ''
				});
			}

			// (3) If changed the progress to e.g. 10/10: change the status to completed. Can be combined with (1)

			if(prevState.item_progress < episodesTotal && this.state.item_progress === episodesTotal){
				this.setState({
					item_status: 'completed'
				});
			}

			// (4) If changed the progress to e.g. 5/10: change the status to current. Can be combined with (3)

			if(prevState.item_progress === episodesTotal && this.state.item_progress < episodesTotal){
				this.setState({
					item_status: 'current'
				});
			}

		}
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.itemData){
			if(Object.keys(nextProps.itemData).length === 0){
				// Timeout to compensate for scaleout animation duration
				setTimeout(function(){
					this.setState(this.getInitialState());
				}.bind(this), 150);
			} else {
				setTimeout(function(){
					this.setState(nextProps.itemData);
				}.bind(this), 150);
			}
		}
	},
	componentDidMount: function(){
		if(this.props.itemData){
			this.setState(this.props.itemData);
		}

		var progressInput = this.refs.progressInput.getDOMNode();
		$(progressInput).on('mousewheel', function(e){
			this.setProgress(Number(this.state.item_progress) + e.deltaY);
			return false;
		}.bind(this));

		var repeatsInput = this.refs.repeatsInput.getDOMNode();
		$(repeatsInput).on('mousewheel', function(e){
			this.setRepeats(Number(this.state.item_repeats) + e.deltaY);
			return false;
		}.bind(this));

		$(window).on('keyup', function(e){
			if(e.keyCode === 27){
				this.props.onCancel();
			}
		}.bind(this));
	},
	setStatus: function(e){
		var statusVal = e.target.innerText.toLowerCase().replace(/ /g, '');
		this.setState({
			item_status: statusVal
		});
		this.toggleStatusMenu();
	},
	toggleStatusMenu: function(){
		if(this.state.statusMenuVisible){
			$(this.refs.pickerStatusMenu.getDOMNode()).find('>div').hide();
		} else {
			$(this.refs.pickerStatusMenu.getDOMNode()).find('>div').stop(true)
			.velocity('transition.slideLeftIn', { stagger: 50, duration: 300, easing: [200,15,0] });
		}
		this.setState({
			statusMenuVisible: !this.state.statusMenuVisible
		});
	},
	onProgressChange: function(e){
		// This function is here because we want to pass
		// a value to setProgress and not an event.
		this.setProgress(e.target.value); 
	},
	setProgress: function(progressValue){
		if(
			!isNaN(progressValue) &&
			(progressValue <= this.props.seriesData.series_episodes_total ||
			!this.props.seriesData.series_episodes_total) &&
			0 <= progressValue
		){
			this.setState({
				item_progress: (progressValue == 0) ? '' : Number(progressValue)
			});
		}
	},
	onRepeatsChange: function(e){
		this.setRepeats(e.target.value);
	},
	setRepeats: function(repeatsValue){
		if(!isNaN(repeatsValue) && repeatsValue >= 0 && repeatsValue <= 999){
			this.setState({
				item_repeats: (repeatsValue == 0) ? '' : repeatsValue
			});
		}
	},
	setRatingPreview: function(rating, e){
		var posX = e.pageX - $(e.target).offset().left;
		if(rating === 1 && posX < 21){
			this.setState({
				ratingPreview: (posX > 10) ? Number(rating) : 0
			});
		} else {
			this.setState({
				ratingPreview: (posX < 11) ? Number(rating) : Number(rating + 1)
			});
		}
	},
	resetRatingPreview: function(){
		this.setState({
			ratingPreview: ''
		});
	},
	onRatingClick: function(e){
		this.setState({
			item_rating: this.state.ratingPreview
		});
	},
	onSave: function(){
		$(this.refs.successBtn.getDOMNode()).stop(true).velocity('transition.fadeIn', {
			duration: 200
		}).velocity('reverse', {
			delay: 500,
			duration: 300
		});

		$(this.refs.successIcon.getDOMNode()).stop(true).velocity('transition.slideUpIn', {
			delay: 100,
			duration: 300
		}).delay(600).hide();
		setTimeout(function(){
			this.props.onSave(this.state);
		}.bind(this), 550);
	},
	render: function(){
		var heartNodes = [];
		var ratingPreview = (this.state.ratingPreview !== '') ? this.state.ratingPreview : this.state.item_rating;

		for(var i = 1; i <= 9; i += 2){
			heartNodes.push(
				React.DOM.div({
					className: 
						cx({
							'picker-heart': true,
							'icon-heart-empty': (ratingPreview < i),
							'icon-heart-half': (ratingPreview === i),
							'icon-heart-full': (ratingPreview >= i + 1)
						}), 
					
					onMouseMove: this.setRatingPreview.bind(this, i), 
					onMouseOut: this.resetRatingPreview, 
					onClick: this.onRatingClick
				}
				)
			)
		}

		return (
			React.DOM.div({className: "picker-wrap"}, 
				React.DOM.div({className: "picker-top"}, 
					React.DOM.div({className: "picker-title"}, 
						"Status"
					), 
					React.DOM.div({className: "picker-status-wrap"}, 
						React.DOM.div({ref: "pickerStatusVal", className: cx({
							'picker-status-val': true,
							'visible': this.state.statusMenuVisible
						}), onClick: this.toggleStatusMenu}, 
							this.state.item_status.replace('onhold', 'On Hold'), 
							React.DOM.div({className: 
								cx({
									'picker-status-menu-icon': true,
									'icon-down-open': true,
									'rotate': this.state.statusMenuVisible
								})
							})
						), 
						React.DOM.div({ref: "pickerStatusMenu", className: 
								cx({
									'picker-status-menu': true,
									'visible': this.state.statusMenuVisible
								})
							}, 
							
								['Current', 'Completed', 'Planned', 'On Hold', 'Dropped'].map(function(statusType){
									return (
										React.DOM.div({ref: "pickerStatusItem", className: "picker-status-menu-item", onClick: this.setStatus}, 
											statusType
										)
									);
								}.bind(this))
							
						)
					), 
					React.DOM.div({className: "picker-inputs-wrap"}, 
						React.DOM.div({className: "picker-repeats-wrap"}, 
							React.DOM.div({className: "picker-title"}, 
								
									(this.props.collection === 'anime') ? 'Re-watched' : 'Re-read'
								
							), 
							React.DOM.div({className: "cf"}, 
								React.DOM.input({
									ref: "repeatsInput", 
									className: "picker-input-val", 
									type: "text", 
									maxLength: "3", 
									value: this.state.item_repeats, 
									onChange: this.onRepeatsChange, 
									placeholder: "0"}
								), 
								React.DOM.div({className: "picker-input-times"}, 
									"times"
								)
							)
						), 
						React.DOM.div({className: "picker-progress-wrap"}, 
							React.DOM.div({className: "picker-title"}, 
								"Progress"
							), 
							React.DOM.div({className: "cf"}, 
								React.DOM.input({
									ref: "progressInput", 
									className: "picker-input-val", 
									type: "text", 
									maxLength: "3", 
									value: this.state.item_progress, 
									onChange: this.onProgressChange, 
									placeholder: "0"}
								), 
								React.DOM.div({className: "picker-input-sep"}, 
								"of"
								), 
								React.DOM.div({className: "picker-input-total"}, 
									this.props.seriesData.series_episodes_total || '—'
								)
							)
						)

					), 
					React.DOM.div({className: "picker-title"}, 
						"Rating"
					), 
					React.DOM.div({className: "picker-rating-wrap"}, 
						React.DOM.div({className: "picker-rating-hearts"}, 
							heartNodes
						), 
						React.DOM.div({className: "picker-rating-val"}, 
							(this.state.item_rating / 2).toFixed(1)
						)
					)
				), 
				React.DOM.div({className: "picker-bottom"}, 
					React.DOM.div({className: "picker-save", onClick: this.onSave}, 
						"Save", 
						React.DOM.div({className: "picker-save-success", ref: "successBtn"}, 
							React.DOM.div({className: "picker-save-success-icon icon-check", ref: "successIcon"}
							)
						)
					), 
					React.DOM.div({className: "picker-cancel", onClick: this.props.onCancel}, 
						"Cancel"
					)
				)
			)
		);
	}
});
/** @jsx React.DOM */

var registerForm = React.createClass({displayName: 'registerForm',
	getInitialState: function(){
		return {
			usernameVal: '',
			usernameValid: null,
			passwordVal: '',
			emailVal: '',
			emailValid: null
		}
	},
	usernameChange: function(e){
		e.persist();
		this.setState({
			usernameVal: e.target.value.replace(/\W+/g, ''),
			usernameValid: (e.target.value.trim() !== '' && e.target.value.length >= 3 && e.target.value.length <= 40) ? 'loading' : (e.target.value.trim() !== '') ? false : null
		});
		if(e.target.value.length >= 3) this.validateUsername(e);
	},
	passwordChange: function(e){
		this.setState({
			passwordVal: e.target.value
		});
	},
	emailChange: function(e){
		e.persist();
		this.setState({
			emailVal: e.target.value.trim(),
			emailValid: (e.target.value.trim() !== '' ) ? 'loading' : null
		});
		this.validateEmail(e);
	},
	registerAccount: function(){
		if(this.state.emailValid !== false && this.state.usernameValid !== false && this.state.passwordVal.length >= 6 && this.state.usernameVal.length >= 3){
			$.ajax({
				type: 'post',
				url: '/api/register',
				data: $(this.refs.registerForm.getDOMNode()).serialize(),
				success: function(res){
					console.log(res);
				},
				error: function(err){
					console.log(err);
				}
			});
		} else {
			alert('check the damn form');
		}		
	},
	validateUsername: _.debounce(function(e){
		if(e.target.value === '') return this.setState({ usernameValid: null });
		$.ajax({
			type: 'post',
			url: '/api/validate/username',
			data: {
				username: e.target.value
			},
			success: function(res){
				console.log(res);
				this.setState({
					usernameValid: res.is_valid === true && res.exists === false
				});
			}.bind(this),
			error: function(err){
				console.log(err);
			}
		});
	}, 500),
	validateEmail: _.debounce(function(e){
		if(e.target.value === '') return this.setState({ emailValid: null });
		$.ajax({
			type: 'post',
			url: '/api/validate/email',
			data: {
				email: e.target.value
			},
			success: function(res){
				console.log(res);
				this.setState({
					emailValid: res.is_valid === true && res.exists === false
				});
			}.bind(this),
			error: function(err){
				console.log(err);
			}
		});
	}, 500),
	render: function(){
		return (
			React.DOM.form({id: "register-form", className: "logreg-form", ref: "registerForm"}, 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-form-hd"}, 
						"Let's get this started."
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Username ", React.DOM.div({className: "logreg-legend-desc"}, "At least ", React.DOM.b(null, "3"), " chars. Only letters/numbers.")), 
					React.DOM.input({className: "logreg-input", type: "text", name: "username", value: this.state.usernameVal, onChange: this.usernameChange}), 
					React.DOM.div({className: 
						React.addons.classSet({
							'icon-spam': this.state.usernameValid === false,
							'icon-check': this.state.usernameValid === true,
							'icon-ellipsis': this.state.usernameValid === 'loading',
							'logreg-input-validate': true,
							'visible': this.state.usernameValid !== null
						})
					}
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Password ", React.DOM.div({className: "logreg-legend-desc"}, "At least ", React.DOM.b(null, "6"), " chars. Keep this secure.")), 
					React.DOM.input({id: "logreg-password-input", className: "logreg-input", type: "password", name: "password", value: this.state.passwordVal, onChange: this.passwordChange}), 
					React.DOM.div({className: 
						React.addons.classSet({
							'icon-spam':  0 < this.state.passwordVal.length && this.state.passwordVal.length < 6,
							'icon-check':  this.state.passwordVal.length >= 6,
							'logreg-input-validate': true,
							'visible': this.state.passwordVal
						})
					}
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Email ", React.DOM.div({className: "logreg-legend-desc"}, React.DOM.b(null, "Optional"), ". You can add/remove it later.")), 
					React.DOM.input({className: "logreg-input", type: "text", name: "email", value: this.state.emailVal, onChange: this.emailChange}), 
					React.DOM.div({className: 
						React.addons.classSet({
							'icon-spam': this.state.emailValid === false,
							'icon-check': this.state.emailValid === true,
							'icon-ellipsis': this.state.emailValid === 'loading',
							'logreg-input-validate': true,
							'visible': this.state.emailValid !== null
						})
					}
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-form-desc"}, 
						"Most of Herro's features do not require that you have an email. However, if you forget your login credentials you will be shit out of luck."
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-submit", onClick: this.registerAccount}, "Create My Account")
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.a({className: "logreg-link", href: "/login"}, "Already registered?")
				)
			)
		)
	}
});

var mountNode = document.getElementById('register-form-wrap');
if(mountNode) React.renderComponent(registerForm(null), mountNode);
/** @jsx React.DOM */

var TempSearchConstants = {
	QUERY: $('#search-page-wrap').data('query'),
	COLLECTION: $('#search-page-wrap').data('collection')
}

var SearchApp = React.createClass({displayName: 'SearchApp',
	getInitialState: function(){
		var initState = {
			searchText: TempSearchConstants.QUERY,
			searchResults: []
		}
		return initState;
	},
	componentDidMount: function(){
		if(this.state.searchText) this.search();
	},
	onSearch: function(e){
		this.setState({
			searchText: e.target.value,
			searchResults: (e.target.value === '') ? [] : this.state.searchResults
		});
		if(e.target.value !== ''){
			this.search();
		}
	},
	search: _.debounce(function(){
		if(this.state.searchText === '') return false;
		$.ajax({
			type: 'get',
			url: '/api/' + TempSearchConstants.COLLECTION + '/search/' + this.state.searchText,
			success: function(searchRes){
				this.setState({
					searchResults: searchRes
				});
			}.bind(this),
			error: function(err){
				console.log(err);
			}
		});
	}, 500),
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
						var itemData = null;
						if(searchRes.item_data){
							itemData = {
								item_status: searchRes.item_data.item_status,
								item_progress: searchRes.item_data.item_progress,
								item_rating: searchRes.item_data.item_rating,
								item_repeats: searchRes.item_data.item_repeats
							}
						}
						return SearchItem({seriesData: searchRes, key: searchRes._id, itemData: itemData});
					})
				
				)
			)
		);
	}
});

var SearchItem = React.createClass({displayName: 'SearchItem',
	getInitialState: function() {
		return {
			itemData: {}, // List item data,
			itemAdded: false, // If the item added in list
			pickerVisible: false 
		};
	},
	componentWillMount: function(){
		if(this.props.itemData){
			this.setState({
				itemData: this.props.itemData,
				itemAdded: true
			});
		}
	},
	togglePicker: function(visible){
		this.setState({
			pickerVisible: !this.state.pickerVisible 
		});
	},
	closePicker: function(){
		this.setState({
			itemData: this.state.itemData,
			pickerVisible: false
		});
	},
	saveData: function(data){
		var APIUrl = (Object.keys(this.state.itemData).length > 0) ? '/api/list/' + TempSearchConstants.COLLECTION + '/update' : '/api/list/' + TempSearchConstants.COLLECTION + '/add';
		data._id = this.props.seriesData._id;

		$.ajax({
			type: 'post',
			url: APIUrl,
			data: data,
			success: function(res){
				console.log(res); 
			}
		});

		this.setState({
			itemData: data,
			itemAdded: true,
			pickerVisible: false
		});
	},
	onRemove: function(){
		this.setState({
			itemData: {},
			itemAdded: false
		});

		$.ajax({
			type: 'post',
			url: '/api/list/anime/remove',
			data: {
				_id: this.props.seriesData._id
			},
			success: function(res){
				console.log(res);
			}
		});
	},
	render: function(){
		var imageStyle = {
			backgroundImage: 'url(' + this.props.seriesData.series_image_reference + ')'
		}
		return (
			React.DOM.div({className: "search-result"}, 
				React.DOM.div({className: "search-result-image", style: imageStyle}
				), 
				React.DOM.div({className: "search-result-content"}, 
					React.DOM.div({className: "search-result-title-wrap"}, 
						React.DOM.div({className: "search-result-title"}, 
							this.props.seriesData.series_title_main
						), 
						React.DOM.div({className: "search-result-year"}, 
						
							(this.props.seriesData.series_date_start) ? new Date(this.props.seriesData.series_date_start).getFullYear() : ''
						
						)
					), 
					React.DOM.div({className: "search-result-desc"}, 
						this.props.seriesData.series_description
					), 
					React.DOM.div({className: "search-result-meta-wrap"}, 
						React.DOM.span({className: "search-result-meta"}, 
							React.DOM.span({className: "search-result-type"}, this.props.seriesData.series_type), " with ", this.props.seriesData.series_episodes_total, " Episode(s)"
						), 
						React.DOM.div({className: 
							cx({
								'search-result-add': true,
								'visible': UserConstants.LOGGED_IN,
								'added': this.state.itemAdded,
								'open': this.state.pickerVisible
							}), 
						onClick: this.togglePicker}, 
							
								(this.state.itemAdded) ? 'Edit info' : 'Add to list +'
							
						), 
						React.DOM.div({className: 
							cx({
								'search-result-picker': true,
								'visible': this.state.pickerVisible
							})
						}, 
							PickerApp({
								collection: TempSearchConstants.COLLECTION, 
								itemData: this.state.itemData, 
								seriesData: this.props.seriesData, 
								onCancel: this.closePicker, 
								onSave: this.saveData}
							)
						), 
						React.DOM.div({className: 
							cx({
								'search-result-remove': true,
								'visible': UserConstants.LOGGED_IN && this.state.itemAdded,
							}), 
						onClick: this.onRemove}, 
							"× Remove"
						)
					)
				)
			)
		)
	}
});
var mountNode = document.getElementById('search-page-wrap');
if(mountNode) React.renderComponent(SearchApp(null), mountNode);



