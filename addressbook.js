var _ = require('underscore')._;
var fs = require('fs'); 
var ab = {};
var addressbookData = {};
var me = "Me";
var useFakeNames = false;
var fakeNames = ['Aaron Johnson','Alan Wiley','Alfred Rowe','Anastasia Mitchell','Andrea Leon','Andrew Mastrangelo','Andrew Moyer','Antonietta McDonnell','Betty Jackson','Brian Walker','Calvin Thorpe','Caryn Cooper','Charlene Melanson','Colleen Jenkins','Cynthia Ackman','Dalia Drye','Dana Meeks','Darrin Cochran','Darrin Phillips','Dawn Branham','Della Solomon','Dennis Smith','Don Richter','Donald Howard','Dustin Denton','Dwayne Edmiston','Edith Harper','Elizabeth Ballard','Elizabeth Jarrett','Elizabeth Pouncy','Eric Carson','Forest Wilson','Francisco Cisneros','Gerard Turner','Gertrude Foust','Graciela Kash','Harley Garay','Harold Moore','Hugo Kiser','Ian Chaffee','Ira Laguna','Janet Arrington','Jeffery Kim','Jenna Godwin','Jennifer Hughes','Jesus Ward','Jill White','Jimmy Bryant','John Henry','John Noland','Joseph Barrera','Joyce Wright','Karen Taylor','Kevin Rich','Kimberly Deltoro','Lamar Hurtado','Larry Rayes','Leona Herrington','Lloyd Williams','Lynn Bullock','Mark Scott','Marshall Miller','Martha Jacobs','Mary Palmer','Mary Valenzuela','Maude Campo','Michael Lunsford','Molly Flores','Monica Farrell','Morgan Skidmore','Nicholas Dixon','Oliva Johnston','Peggy Kastner','Peggy Schoen','Phillip Rosas','Ray Takacs','Raymon Ferris','Rebecca Adams','Richard Lundy','Richard Smith','Richard Vargas','Robin Connelly','Ruben Anderson','Russell Lafleur','Samuel Monroe','Sandra Wright','Santiago Cash','Shawna Veliz','Suzanne Burleson','Teresa Charles','Tessa Bobbitt','Thomas Lutz','Thomas Murillo','Tina Moyer','Valerie Hamilton','Veronica Hill','Warren Thomas','Wesley Harris','William Levin','Young Fox'];

function cleanText(txt) {
	if ((txt||"").length == 0) return "";
	return txt.replace(/\(/g, '').replace(/\)/g, '').replace(/ /g, '').replace(/\./g, '').replace(/-/g, '').replace('+1','');
}

function getSanitizedData() {
	var abook = {};
	try {
		var ab = JSON.parse(fs.readFileSync('tools/address_book.js').toString());
	} catch (e) {
		console.log('Could not open address_book.js');
		return {};
	}
	addressbookData = ab;
	Object.keys(ab).forEach(function (k) {
		var ar = ab[k];
		var items =  [];
		for (var i=0; i<ar.length; i++) {
			var item = ar[i];
			item = cleanText(item);
			items.push(item);
		}
		abook[k] = items.join(' ');
	});
	return abook;
}

function findName(val) {

	var vl = cleanText(val);
	var ks = Object.keys(ab);
	for (var i=0; i<ks.length; i++) {
		var k = ks[i];
		if (ab[k].indexOf(vl) > -1) {
			return k;
		}
	}
	return val;
}
function _lookupName(val) {
	if ((val||"").length == 0) return {value:"Me", lookupValue:"Me"};
	var nm = findName(val);
	return {value:val, lookupValue:nm};
}
function _fakeNameLookup(val) {
	if ((val||"").length == 0) return {value:"Me", lookupValue:"Me"};
	var nm = _.sample(fakeNames);
	return {value:val, lookupValue:nm};
}
var lookupName = _.memoize(_lookupName);
if (useFakeNames) lookupName = _.memoize(_fakeNameLookup);
ab = getSanitizedData();

exports.lookupName = lookupName;
exports.addressbookData = addressbookData;