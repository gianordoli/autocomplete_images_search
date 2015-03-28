/*** Global object that contains the app ***/
var app = app || {};

app.control = (function() {

	// GLOBALS
	var width, height, currDiv, isMoving;

	/*------------------ FUNCTIONS ------------------*/	

	// Show loading
	function callLoader(){
		console.log('Called loader.')
		$('#results-container').empty();
		var loaderContainer = $('<div id="loader-container"></div>')
		var loader = $('<span class="loader"></span>');
		$(loaderContainer).append(loader);
		$('body').append(loaderContainer)
	}

	// Loading the list of domais/countries and services from the server
	var loadData = function(callback){
		console.log('Called loadData.');

		$.ajax({
			url: '/start',
			success: function(response){
				console.log(response);
				callback(response.results);
			},
			dataType: "json"
		});	
	}

	function printResults(data, callback){

		console.log('Called printResults.')
		// console.log(data);
		$('#results-container').scrollTop(0).empty();
		$('#titles-container').scrollTop(0).empty();
		$('#loader-container').remove();

		_.each(data, function(item, index, list){
			// console.log(item.length);
			var wordDiv = $('<div id="'+index+'" class="word-container"></div>')
						   .scrollLeft(0)
						   .appendTo('#results-container');

			if(index == 0){
				_.each(item, function(item, index, list){
				var word = $('<div class="word"><h1>'+item.letter.toUpperCase()+'</h1></div>')
							.css('left', index*width)
							.appendTo('#titles-container');	
				});			
			}						   

			_.each(item, function(item, index, list){
				// console.log(index);
				var predictionsByDayDiv = $('<div class="predictions-container"></div>')
										   .appendTo(wordDiv);
			
				var predictionsUl = $('<ul></ul>')
									 .append('<li>'+item.language_name+'</li>')
									 .appendTo(predictionsByDayDiv);

				_.each(item.results, function(value, key, list){
					var query = 'https://google.com/#q='+replaceSpaces(value);					
					var li = $('<li><a href="'+query+'" target="_blank">'+value+'</a></li>')
							  .appendTo(predictionsUl);
				});
			});
		});		
		callback(data);
	}

	// A function where we keep all user's interaction listener (buttons, etc)
	function attachEvents(data) {
		console.log('Called attachEvents.')
		document.onkeydown = checkKey;

		$('#right, #left').off().on('click', function(){
			moveLeftRight($(this).attr('id'));
		});
		$('#up, #down').off().on('click', function(){
			checkUpDown($(this).attr('id'));
		});

		var debounce;
		$(window).resize(function() {
		    clearTimeout(debounce);
		    debounce = setTimeout(doneResizing, 500); 
		});
		
		function doneResizing(){
			// // console.log(data);
			// initGlobalVars();
			// printResults(data, function(){
			// 	attachEvents(data);
			// 	showHideArrows();
			// });
		}
	}

	var initGlobalVars = function(){
		width = window.innerWidth;
		height = window.innerHeight;		
		currDiv = 0;
		isMoving = false;
	}


	/*------------------------ NAVIGATION ------------------------*/
	var showHideArrows = function(){
		console.log('Called showHideArrows.');

		// UP
		if($('.container').scrollTop() <= 0){
			$('#up').css('display', 'none');
		}		
		// DOWN
		else if($('.container').scrollTop() >= $('#results-container').height() - height){
			$('#down').css('display', 'none');
		}
		// MIDDLE
		else{
			$('#up').css('display', 'inline-block');
			$('#down').css('display', 'inline-block');
		}

		// LEFT/RIGHT
		var currScrollLeft = $('#'+currDiv).scrollLeft();
		var maxScrollLeft = ($('#'+currDiv).children().length - 1) * width;
		
		// LEFT		
		if(currScrollLeft <= 0){
			$('#left').css('display', 'none');
			$('#right').css('display', 'inline-block');
		}
		// RIGHT
		else if(currScrollLeft >= maxScrollLeft){
			$('#left').css('display', 'inline-block');
			$('#right').css('display', 'none');
		}
		// CENTER
		else{
			$('#left').css('display', 'inline-block');
			$('#right').css('display', 'inline-block');
		}

	}

	function checkKey(e) {
		
		if(!isMoving){

		    e = e || window.event;
		    // up arrow
		    if (e.keyCode == '38') {
				checkUpDown('up');
			}

		    // down arrow
		    else if (e.keyCode == '40') {
				checkUpDown('down');
		    }

	        // left arrow
		    else if (e.keyCode == '37') {
      			checkLeftRight('left');
		    }

		    // right arrow
		    else if (e.keyCode == '39') {
		    	checkLeftRight('right');
		    }
		}		
	}	

	var checkUpDown = function(arrow){
		if(arrow == 'up'){
			if($('.container').scrollTop() > 0){
				currDiv --;
				moveUpDown();
			}			
		}else if(arrow == 'down'){
			if($('.container').scrollTop() < $('#results-container').height() - height){
				currDiv ++;
				moveUpDown();
			}
		}
	}

	var moveUpDown = function(){
		isMoving = true;
		// console.log('move');
        $('.container').animate({
			scrollTop: height*currDiv
		}, 500, function(){
			isMoving = false;
			showHideArrows();
		});		
	}

	var checkLeftRight = function(arrow){	
		var currScrollLeft = $('#'+currDiv).scrollLeft();
		var maxScrollLeft = ($('#'+currDiv).children().length - 1) * width;
		if((arrow == 'left' && currScrollLeft > 0) ||
		   (arrow == 'right' && currScrollLeft < maxScrollLeft)){
			moveLeftRight(arrow);
		}
	}

	var moveLeftRight = function(arrow){
		var direction = (arrow == 'left') ? (-1) : (1);
		isMoving = true;
		var currScrollLeft = $('#'+currDiv).scrollLeft();
		$('#'+currDiv).animate({
			scrollLeft: currScrollLeft + (width * direction)
		}, 500, function(){
			isMoving = false;
			showHideArrows();
		});	 		
	}	

	/*-------------------- AUXILIAR FUNCTIONS --------------------*/

	var replaceSpaces = function(query){
		while(query.indexOf(' ') > -1){
			query = query.replace(' ', '+') 
		}
		return query;
	}	

	var init = function() {
		console.log('Called init');
		callLoader();
		initGlobalVars();
		loadData(function(data){
			printResults(data, function(data){
				attachEvents(data);
				// showHideArrows();
			});
		});	
	}

	return{
		init: init
	}
})(window, document, jQuery, _);

// call app.map.init() once the DOM is loaded
window.addEventListener('DOMContentLoaded', function(){
  app.control.init();  
});