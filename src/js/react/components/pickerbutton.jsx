var React = require('react');
var cx = React.addons.classSet;
var PickerApp = require('./picker.jsx');
var PickerButton = React.createClass({
	propTypes: {
		_id: React.PropTypes.string,
		collection: React.PropTypes.string,
		classPrefix: React.PropTypes.string // Prefix for styling
	},
	getInitialState: function() {
		return {
			loaded: false,
			pickerVisible: false,
			seriesData: {},
			itemAdded: false,
			itemData: {}
		};
	},
	componentWillMount: function(){
		$.ajax({
			url: '/api/' + this.props.collection + '/view/' + this.props._id,
			type: 'GET',
			success: function(data){
				this.setState({
					loaded: true,
					itemAdded: (data.item_data) ? true : false,
					itemData: (data.item_data) ? data.item_data : {},
					seriesData: data
				});
			}.bind(this),
			error: function(){
				// Wat..?
			}
		});
	},
	togglePicker: function(){
		this.setState({
			pickerVisible: !this.state.pickerVisible
		});
	},
	onRemove: function(){
		$.ajax({
			url: '/api/list/' + this.props.collection + '/remove',
			type: 'POST',
			data: {
				_id: this.state.seriesData._id,
				_csrf: UserConstants.CSRF_TOKEN
			},
			success: function(){
				this.setState({
					itemData: {},
					itemAdded: false
				});
			}.bind(this)
		})
	},
	onCancel: function(){
		this.setState({
			itemData: this.state.itemData,
			pickerVisible: false
		});
	},
	onSave: function(newData){
		var APIUrl = (Object.keys(this.state.itemData).length > 0) ? '/api/list/' + this.props.collection + '/update' : '/api/list/' + this.props.collection + '/add';
		newData._id = this.state.seriesData._id;
		newData._csrf = UserConstants.CSRF_TOKEN;

		$.ajax({
			type: 'POST',
			url: APIUrl,
			data: newData,
			success: function(res){
				this.setState({
					itemData: newData,
					itemAdded: true,
					pickerVisible: false
				});
			}.bind(this),
			error: function(){
				if(!this.state.itemData){
					this.onRemove();
				} else {
					this.onCancel();
				}
				confirm('Could not add/update series. Something seems to be wrong on our end!');
			}.bind(this)
		});
	},
	render: function(){
		var pbtnStyle = {
			display: (this.state.loaded) ? 'block' : 'none'
		}
		return (
			<div className={this.props.classPrefix + '-pbtn-wrap'} style={pbtnStyle}>
				<div className={
					cx({
						'pbtn-remove': true,
						'visible': UserConstants.LOGGED_IN && this.state.itemAdded,
					})
				} onClick={this.onRemove}>
					&times; Remove
				</div>
				<div className={
					cx({
						'pbtn-add': true,
						'visible': UserConstants.LOGGED_IN,
						'added': this.state.itemAdded,
						'open': this.state.pickerVisible
					})
				} onClick={this.togglePicker}>
					{
						(this.state.itemAdded) ? 'Edit info' : '+ Add to list'
					}
				</div>
				<div className={
					cx({
						'pbtn-picker': true,
						'visible': this.state.pickerVisible
					})
				}>
					<PickerApp
						collection={this.props.collection}
						seriesData={this.state.seriesData}
						itemData={this.state.itemData}
						onSave={this.onSave}
						onCancel={this.onCancel}
					/>
				</div>
			</div>
		);
	}
});

module.exports = PickerButton;