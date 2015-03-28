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

	getDateRangeDB(function(range){
		// console.log(range);
		// Get the last day only:
		range[0] = range[1] - 86400000; // Last day - 1

		getDomains(function(domains){

			searchMongoDB(({
				'date': {'$gt': new Date(range[0]), '$lte': new Date(range[1])},
				'service': 'images',
				'domain': {'$in': domains }
			}), function(data){
				// console.log(data);

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

				// groupedByLanguage = _.mapObject(groupedByLanguage, function(value, key, list){
					// return loadedCountries[languageIndex].language_a_name;
				// });

				for(key in groupedByLanguage){
					// console.log(key);
					var languageIndex = _.findIndex(loadedCountries, function(item){
						return item.language_a_code == key;
					});
					var languageName = loadedCountries[languageIndex].language_a_name;
					
					for(var i = 0; i < groupedByLanguage[key].length; i++){
						groupedByLanguage[key][i]['language_name'] = languageName;
					}
				}

				// groupedByLanguage = _.sortBy(groupedByLanguage)

				groupedByLanguage = _.toArray(groupedByLanguage);
				groupedByLanguage = _.sortBy(groupedByLanguage, function(item, index, list){
					return item[0]['language_name'];
				});

				response.json({results: groupedByLanguage});

				// var file = 'images_by_language_date.json';
				// jf.writeFile(file, groupedByLanguage, function(err) {
				// 	// console.log(err);
				// 	if(!err){
				// 		console.log('Results successfully saved at ' + file);
				// 	}else{
				// 		console.log('Failed to save JSON file.');
				// 	}
				// });
			});
		});
	});	

	
});

function getDomains(callback){
	
	// filter country based on language based on available images service
	var filteredCountries = _.filter(loadedCountries, function(item, index, list){
		return item['images'] == 1;
	});	
	var filteredDomains = _.map(filteredCountries, function(item){
		return item.domain;
	});

	callback(filteredDomains);
}

function getDateRangeDB(callback){
	console.log('Called searchMongoDB.')

	MongoClient.connect('mongodb://127.0.0.1:27017/autocomplete', function(err, db) {
		console.log('Connecting to DB...');
		if(err) throw err;
		console.log('Connected.');
		var collection = db.collection('date_range');

		collection.find({}).toArray(function(err, results) {
			// console.dir(results);
			// console.log(results[0].min);
			callback([results[0].min, results[0].max]);
			db.close();	// Let's close the db 
		});			
	});	
}

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