$(function(){
	var cm = CodeMirror(document.getElementById('editor'), {
		value: $('#editor-value').html(),
		mode: 'javascript',
		lineNumbers: true,
		indentWithTabs: true,
		theme: 'monokai',
		extraKeys: { 'Ctrl-Space': 'autocomplete' }
	});

	cm.setSize('100%', '100%');

	var autoCompleteStrings = [
		'Action', 'Adventure',
		'Comedy', 'Demons',
		'Drama', 'Ecchi',
		'Fantasy', 'Game',
		'Harem', 'Historical',
		'Horror', 'Josei',
		'Magic', 'Martial Arts',
		'Mecha', 'Military',
		'Music', 'Mystery',
		'Parody', 'Psychological',
		'Romance', 'Samurai',
		'School', 'Sci-Fi',
		'Seinen', 'Shoujo',
		'Shoujo Ai', 'Shounen',
		'Shounen Ai', 'Slice of Life',
		'Space', 'Sports',
		'Super Powers', 'Supernatural',
		'Thriller', 'Vampire',
		'Yaoi', 'Yuri'
	];

	CodeMirror.commands.autocomplete = function(editor){
		var cur = editor.getCursor();
		var start = cur.ch;
		var end = start;
		var token = editor.getTokenAt(cur);
		var inner = CodeMirror.innerMode(editor.getMode(), token.state);
		console.log(token);
		console.log(inner);
		editor.showHint({
			hint: function(){
				return { list: autoCompleteStrings, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end) }
			}
		});
	}
});