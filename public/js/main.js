/*** Global object that contains the app ***/
var app = app || {};

app.control = (function() {

	// GLOBALS
	// var width, height, currDiv, isMoving;

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
			},
			dataType: "json"
		});

        // $.post('/start', {}, function(response) {
        //     // console.log(response);
        //     if(response.error){
        //     	throw response.error	
        //     }else{
        //     	callback(response);
        //     }
        // });		
	}

	var processData = function(data, callback){
		console.log('Called process data.')

	}

	function printResults(data, callback){
		console.log('Called printResults.');

	}

	// A function where we keep all user's interaction listener (buttons, etc)
	function attachEvents(data) {
		// console.log('Called attachEvents.')
		// document.onkeydown = checkKey;

		// $('#right, #left').off().on('click', function(){
		// 	moveLeftRight($(this).attr('id'));
		// });
		// $('#up, #down').off().on('click', function(){
		// 	checkUpDown($(this).attr('id'));
		// });

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
		// width = window.innerWidth;
		// height = window.innerHeight;		
		// currDiv = 0;
		// isMoving = false;
	}

	var init = function() {
		console.log('Called init');
		callLoader();
		// initGlobalVars();
		loadData(function(data){
		// 	processData(data, function(processedData){
		// 		printResults(processedData, function(finalData){
		// 			attachEvents(finalData);
		// 			showHideArrows();
		// 		});
		// 	});		
		});	
	}

	return{
		init: init
	}
})(window, document, jQuery);

// call app.map.init() once the DOM is loaded
window.addEventListener('DOMContentLoaded', function(){
  app.control.init();  
});