/*-------------------- MODULES --------------------*/
var		express = require('express'),
	 bodyParser = require('body-parser')
	MongoClient = require('mongodb').MongoClient,
			 jf = require('jsonfile'),
			  _ = require('underscore');

var app = express();


/*-------------------- SETUP --------------------*/
var app = express();
// .use is a middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());
app.use(function(req, res, next) {
    // Setup a Cross Origin Resource sharing
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('incoming request from ---> ' + ip);
    // Show the target URL that the user just hit
    var url = req.originalUrl;
    console.log('### requesting ---> ' + url);
    next();
});

app.use('/', express.static(__dirname + '/public'));
// Load list of countries/languages
var loadedCountries = jf.readFileSync('data/languages.json');
// console.log(loadedCountries);

/*------------------- ROUTERS -------------------*/
app.get('/start', function(request, response) {

	// all letter, all dates, not all languages
	// filter country based on language based on available images service
	var filteredCountries = _.filter(loadedCountries, function(item, index, list){
		return item['images'] == 1;
	});	
	var filteredDomains = _.map(filteredCountries, function(item){
		return item.domain;
	});

	searchMongoDB(({'domain': {'$in': filteredDomains } }), function(data){
		/* -----------------------------------------*/
		// Group records by language.
		// From [records] to
		// 	 { 'language': [records] }
		/*------------------------------------------*/
		var groupedByLanguage = _.groupBy(data, function(item, index, list){
			return item.language;
		});
		// console.log(Object.keys(groupedByLanguage));
		// console.log(groupedByLanguage);

		/*------------------------------------------*/
		// Inside each language, group by letter (ignore date)
		// From { 'language': [records] } to
		// 	 { 'language': { 'letter': [records] } }
		/*------------------------------------------*/
		groupedByLanguage = _.mapObject(groupedByLanguage, function(value, key, list){
			// console.log(key);
			var groupedByLetter = _.groupBy(value, function(val, k, list){
				return val.letter;
			});
			// console.log(Object.keys(groupedByLetter));
			return groupedByLetter;
		});
		// console.log(groupedByLanguage['pt-BR']);
		
		/*------------------------------------------*/
		// Inside each language, merging records inside each letter
		// From { 'language': { 'letter': [records] } }
		// 	 { 'language': { 'letter': [ { 'query' : quant } ] } }
		/*------------------------------------------*/
		// Object
		_.each(groupedByLanguage, function(languageObj, key, list){				

			// Object
			_.each(languageObj, function(letterObj, key, list){					

				var letterResults = {};
				
				// Array (of records)
				_.each(letterObj, function(record, index, list){				
					
					// Array (results inside each record)
					_.each(record.results, function(result, index, list){

						// If the result doesn't exist in the list yet
						if(!letterResults.hasOwnProperty(result)){
							letterResults[result] = 0;
						}else{
							letterResults[result] += 1;
						}
					});
				});

				console.log(letterResults);

			});

			// var resultsCombined = _.map(value, function(item, index, list){
			// 	return item.results
			// });
			// console.log(resultsCombined);
			// var records = 
			// var groupedByLetter = _.groupBy(value, function(val, k, list){
			// 	return val.letter;
			// });
			// console.log(Object.keys(groupedByLetter));
			// return groupedByLetter;
		});

		// response.json({results: data});	
	});
});

function searchMongoDB(params, callback){
	console.log('Called searchMongoDB.')
	// console.log(params);

	MongoClient.connect('mongodb://127.0.0.1:27017/autocomplete', function(err, db) {
		console.log('Connecting to DB...');
		if(err) throw err;
		console.log('Connected.');
		var collection = db.collection('records');

		// Locate all the entries using find 
		collection.find(params).toArray(function(err, results) {
			// console.dir(results);
			callback(results);
			db.close();	// Let's close the db 
		});		

	});
}

/*----------------- INIT SERVER -----------------*/
var PORT = 3113; //the port you want to use
app.listen(PORT, function() {
    console.log('Server running at port ' + PORT + '. Ctrl+C to terminate.');
});