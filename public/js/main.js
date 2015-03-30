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
				// console.log(response);
				$('#loader-container').remove();				
				callback(response.data);
			},
			dataType: "json"
		});	
	}

	function loadImages(data, i){
		console.log('Called loadImages for '+i);
		if(i < data.length){
			$.ajax({
				url: '/images',
				data: {'word': data[i].query},
				success: function(response){
					console.log(response);
					createImg(data, response, i)
				},
				dataType: "json"
			});						
		}else{
			console.log('Finished');
		}

	}	

	function createImg(data, response, i){
		var img = $('<img class="item" src="'+response.url+'"></img>');
		$('#container').append(img);
		i++;
		setTimeout(function(){
			loadImages(data, i);
		}, 1000);
	}

	function printResults(data, callback){
		console.log('Called printResults.');



		$(data).each(function(index, item){
			var div = $('<div class="item" id="'+item.query+'"></div>');
			var a 	= $('<a href=""></a>');
			var img = $('<img></img>');

			$('body').append(div);
			$(div).append(a);
			$(a).append(img);

	
			
		});

	

		callback(data);
	}

	// A function where we keep all user's interaction listener (buttons, etc)
	function attachEvents(data) {

	}

	var initGlobalVars = function(){
		width = window.innerWidth;
		height = window.innerHeight;		
		currDiv = 0;
		isMoving = false;
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

			loadImages(data, 0);
			// printResults(data, function(data){
			// 	attachEvents(data);
			// 	// showHideArrows();
			// });
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