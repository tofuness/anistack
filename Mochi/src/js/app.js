$(function(){
	$('#document-delete').click(function(){
		var deleteDoc = confirm('Are you sure?');
		if(!deleteDoc) return false;
		$.ajax({
			url: $(this).attr('data-url'),
			type: 'post',
			success: function(){
				window.location = '/';
			}
		});
	});

	var cm = CodeMirror(document.getElementById('editor'), {
		value: $('#editor-value').text(),
		mode: 'javascript',
		lineNumbers: true,
		indentWithTabs: true,
		theme: 'monokai',
		lineWrapping: true,
		matchBrackets: true,
		autoCloseBrackets: true,
		extraKeys: { 'Ctrl-Space': 'autocomplete', 'Ctrl-S': 'save' }
	});

	cm.setSize('100%', '100%');

	var autoCompleteStrings = [
		'"action"', '"adventure"',
		'"comedy"', '"demons"',
		'"drama"', '"ecchi"',
		'"fantasy"', '"game"',
		'"harem"', '"historical"',
		'"horror"', '"josei"',
		'"magic"', '"martial arts"',
		'"mecha"', '"military"',
		'"music"', '"mystery"',
		'"parody"', '"psychological"',
		'"romance"', '"samurai"',
		'"school"', '"sci-fi"',
		'"seinen"', '"shoujo"',
		'"shoujo ai"', '"shounen"',
		'"shounen ai"', '"slice of life"',
		'"space"', '"sports"',
		'"super powers"', '"supernatural"',
		'"thriller"', '"vampire"',
		'"yaoi"', '"yuri"'
	];

	CodeMirror.commands.save = function(){
		console.log(JSON.parse(cm.getValue()));
		$.ajax({
			url: window.location.pathname,
			type: 'POST',
			data: { seriesInfo: JSON.parse(cm.getValue()) },
			success: function(res){
				window.location.reload();
			},
			error: function(err){
			}
		});
		
		return false;
	}

	CodeMirror.commands.autocomplete = function(editor){
		editor.showHint({
			hint: CodeMirror.hint.customList
		});
	}

	CodeMirror.registerHelper('hint', 'customList', function(editor, options){
		// Fucking magic from anyword-hint.js (included with codemirror)
		var WORD = /[\w$]+/, RANGE = 500;
		var word = options && options.word || WORD;
		var range = options && options.range || RANGE;
		var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
		var start = cur.ch, end = start;
		while (end < curLine.length && word.test(curLine.charAt(end))) ++end;
		while (start && word.test(curLine.charAt(start - 1))) --start;
		var curWord = start != end && curLine.slice(start, end);
		if(curWord) curWord = curWord.toLowerCase();

		var list = [];
		for(var i = 0; i < autoCompleteStrings.length; i++){
			if(autoCompleteStrings[i].toLowerCase().indexOf(curWord) > -1 || !curWord){
				list.push(autoCompleteStrings[i]);
			}
		}
		return { list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
	});
});