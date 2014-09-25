/** @jsx React.DOM */

var listStore = [];
var listAction = {

}

var listComp = React.createClass({displayName: 'listComp',
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
		return (React.DOM.div(null));
	}
});

//React.renderComponent(<listComp />, document.getElementById('list-left'));
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
var pickerApp = React.createClass({displayName: 'pickerApp',
	propTypes: {
		seriesData: React.PropTypes.object
	},
	getInitialState: function(){
		return {
			itemStatus: 'Current',
			itemProgress: '',
			itemRating: '',
			itemRepeats: '',
			ratingPreview: '',
			statusMenuVisible: false
		}
	},
	componentDidMount: function(){
		// This might need some improvement
		// Pass in itemData props to overwrite the default values
		if(this.props.itemData){
			this.setState(this.props.itemData);
		}

		var progressInput = this.refs.progressInput.getDOMNode();
		$(progressInput).on('mousewheel', function(e){
			this.setProgress(Number(this.state.itemProgress) + e.deltaY);
			return false;
		}.bind(this));

		var repeatsInput = this.refs.repeatsInput.getDOMNode();
		$(repeatsInput).on('mousewheel', function(e){
			this.setRepeats(Number(this.state.itemRepeats) + e.deltaY);
			return false;
		}.bind(this));
	},
	setStatus: function(e){
		this.setState({
			itemStatus: e.target.innerText
		});
		this.toggleStatusMenu();
	},
	toggleStatusMenu: function(){
		if(this.state.statusMenuVisible){
			$(this.refs.pickerStatusMenu.getDOMNode()).find('>div').hide();
		} else {
			$(this.refs.pickerStatusMenu.getDOMNode()).find('>div').stop(true)
			.velocity('transition.slideLeftIn', { stagger: 50, duration: 300 });
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
			(progressValue <= this.props.seriesData.series_episodes_total &&
			0 <= progressValue ||
			!this.props.seriesData.series_episodes_total)
		){
			this.setState({
				itemProgress: (progressValue === 0) ? '' : progressValue
			});
		}
	},
	onRepeatsChange: function(e){
		this.setRepeats(e.target.value);
	},
	setRepeats: function(repeatsValue){
		if(!isNaN(repeatsValue) && repeatsValue >= 0 && repeatsValue <= 999){
			this.setState({
				itemRepeats: (repeatsValue === 0) ? '' : repeatsValue
			});
		}
	},
	setRatingPreview: function(rating, e){
		var posX = e.pageX - $(e.target).offset().left;
		this.setState({
			ratingPreview: (posX < 11) ? Number(rating) : Number(rating + 1)
		});
	},
	resetRatingPreview: function(){
		this.setState({
			ratingPreview: ''
		});
	},
	onRatingClick: function(e){
		this.setState({
			itemRating: this.state.ratingPreview
		});
	},
	render: function(){
		var heartNodes = [];
		var ratingPreview = (this.state.ratingPreview !== '') ? this.state.ratingPreview : this.state.itemRating;

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
				React.DOM.div({className: "picker-title"}, 
					"Status"
				), 
				React.DOM.div({className: "picker-status-wrap"}, 
					React.DOM.div({ref: "pickerStatusVal", className: cx({
						'picker-status-val': true,
						'visible': this.state.statusMenuVisible
					}), onClick: this.toggleStatusMenu}, 
						this.state.itemStatus, 
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
							"Re-watched"
						), 
						React.DOM.div({className: "cf"}, 
							React.DOM.input({
								ref: "repeatsInput", 
								className: "picker-input-val", 
								type: "text", 
								maxLength: "3", 
								value: this.state.itemRepeats, 
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
								value: this.state.itemProgress, 
								onChange: this.onProgressChange, 
								placeholder: "0"}
							), 
							React.DOM.div({className: "picker-input-sep"}, 
							"of"
							), 
							React.DOM.div({className: "picker-input-total"}, 
								this.props.seriesData.series_episodes_total
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
						(this.state.itemRating / 2).toFixed(1)
					)
				), 
				React.DOM.div({className: "picker-actions"}, 
					React.DOM.div({className: "picker-save"}, 
						"Save"
					), 
					React.DOM.div({className: "picker-cancel"}, 
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

var searchApp = React.createClass({displayName: 'searchApp',
	getInitialState: function(){
		var initState = {
			searchText: $('#search-page-query').text().trim(),
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
						return searchItem({seriesData: searchRes, key: searchRes._id});
					})
				
				)
			)
		);
	}
});

var searchItem = React.createClass({displayName: 'searchItem',
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
						pickerApp({
							seriesData: this.props.seriesData}
						)
					)
				)
			)
		)
	}
});

React.renderComponent(searchApp(null), document.getElementById('search-page-wrap'));