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
	console.log('Started app.');

	getDateRangeDB(function(range){
		console.log('Got date range.');
		console.log(range);
		// Get the last day only:
		range[0] = range[1] - 86400000; // Last day - 1

		getDomains(function(domains){
			console.log('Grabbed the domains.');

			searchMongoDB(({
				'date': {'$gt': new Date(range[0]), '$lte': new Date(range[1])},
				'service': 'images',
				'domain': {'$in': domains }
			}), function(data){
				console.log('Got results from DB.');
				// console.log(data);

				parseResultsIntoRecords(data, function(records){
					console.log('Parsed results into records.');
					// getImages(records, 0);
					response.json({
						data: records
					});
				});
			});
		});
	});		
});

app.get('/images/', function(request, response) {
	console.log(request.query.word);

	var query = request.query.word;
    // Replacing the spaces to save the file
    while(query.indexOf(' ') > -1){
    	query = query.replace(' ', '+');
    }
    console.log(query);

	getImages(query, response);
});

var getImages = function(query, response){
	console.log('Called getImages for '+query);

	client.search(query, function(err, images){
	    // return images[0].url;
	    if(!err){
			// console.log(images);	
			response.json({
				width: images[0].width,
				height: images[0].height,
				url: images[0].unescapedUrl
			});
	    }
	});
}

function parseResultsIntoRecords(data, callback){
	var parsedRecords = [];
	// {
	// 	query: ,
	// 	language_code: ,
	// 	language_name: ,
	//  getImages: function(){}
	// }
	_.each(data, function(item, index, list){
		var languageCode = item.language;
		var i = _.findIndex(loadedCountries, function(item){
			return item.language_a_code == languageCode;
		});
		var languageName = loadedCountries[i].language_a_name;

		_.each(item.results, function(item, index, list){
			

			parsedRecords.push({
				query: item,
				language_code: languageCode,
				language_name: languageName
			});
		});
	});
	// console.log(parsedRecords);
	callback(parsedRecords);
}

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