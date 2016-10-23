// Document: gesture_handler.js
// Description: handles data loaded from a csv file and return the gesture it represents.
// Programmer: Henrique Thorp Küsel
// E-mail: hoofs@hoofos.com
// Created: 21/10/2016
// Last Modified: 22/10/2016

// Challenge accomplished ;)
// Hope you guys from Thalmic Labs like it !

// The program receives as input a csv file which contains a matrix 50x8
// with numbers related to a specific gesture. As output, the program
// should indicate the gesture that the file is related to.
//
// The input file contains a matrix 50x8. Each colum of the matrix is a
// image representing a gesture, and each row is a different channel.
//
// The mean value is the sum of all the values in the sae channel
// subtracted by the higher and the lower value. This subtraction
// avoid some discrepancies and let as be much more accurate.
//
// After calculating the factor of a specific file, we have to compare
// to the known factures that were preveiouly calculated and stored
// in the global known_gestures_mean_factors.
//

/* GLOBALS */
var channels = 8
var td_samples = 50

// 0.Pinch | 1.Rotate Left | 2.Rotate Right | 3.Spread | 4.Swipe Left | 5.Swipe Right
var known_gestures = ["Pinch (Gesture 1)", "Rotate Left (Gesture 2)", "Rotate Right (Gesture 3)", "Spread (Gesture 4)", "Swipe Left  (Gesture 5)", "Swipe Right (Gesture 6)"];
// The array below will be our comparison array to check the kind of gesture we are dealing with.
// This array was filled out with the mean value of 30 different mean values from the examples given.
var known_gestures_mean_factors = [96.51,420.26,316.61,294.51,255.55,219.36];

	// Opens the file
	function getFile(files) {
		// Check for browser support
		if (window.FileReader) {
			var reader = new FileReader();
			var extension = files[0].name.substr(files[0].name.lastIndexOf('.')+1);

			if (extension!="csv" && extension!="txt"){
				alert("File is in the wrong format ! \n\n Please, try again with a csv or a txt file.\n");
				return;
			}
			
			reader.readAsText(files[0]);
			reader.onload = loadHandler;
			reader.onerror = errorHandler;
		} else {
			alert('Please, update your browser !');
		}
	}

	// Gets the data out of the cvs/txt file
    function getData(csv_file){
		var eigenface_data = [];
        var rows = csv_file.split(/\r\n|\n/);
		var row = [];
		var higher = 0;
		var lower = 0;
		var mean = 0;
		var value = 0;

		// Doing the loop until we have covered all the time-domain samples.
        for (var i=0; i<td_samples; i++){
			row = rows[i].split(",");
			value = parseInt(row[0]);
			
			// We start higher, lower and mean with the first element of the row
			higher = value;
			lower = value;
			mean = value;


			// As we've already gone through column 0, we start at position 1
			for (var j=1; j<channels; j++){
				value = parseInt(row[j]);
				mean += value;
				
				if(higher < value) {
    				higher = value;
				}
				else if(lower > value){
					lower = value;
				}
			}

			// Calculate the mean, discarting the higher and the lower
			// values for more accuracy.
			mean = (mean-(higher+lower))/(channels-2);

			// Save the mean value to our eigenface array for later comparison
			eigenface_data.push(mean);
        }

		// We now call the getGesture function using the getFactor as a parameter.
		getGesture(calcFactor(eigenface_data));
    }
	
	// Calculates the factor for comparison
	function calcFactor(eigenface_data){
		var factor = 0;	// the factor is the mean value of the the eigenface data by the number of channels

		for (i=0; i<eigenface_data.length; i++){
			factor += parseFloat(eigenface_data[i]);
		}

		// Mean to the number of samples
		factor = factor/td_samples; 
		
		// Kill more than 2 decimals
		factor = factor.toFixed(2);

		return factor;
	}
	
	// Compares the factors to the known data
	function getGesture(gesture_factor){
		// We compare to all known values so we get the most close to the factor we just calculated
		// The index i will tell which gesture is the one. The index order is the same as in the
		// vector known_gestures[]
		var gesture_index = 0;
		var difference = Math.abs(parseInt(known_gestures_mean_factors[0])-parseInt(gesture_factor));

		for(i=1; i<known_gestures_mean_factors.length; i++){
			if (Math.abs(parseFloat(known_gestures_mean_factors[i])-parseFloat(gesture_factor)) < difference){
				difference = Math.abs(parseFloat(known_gestures_mean_factors[i])-parseFloat(gesture_factor));
				gesture_index = i;
			}
			
		}
		
		// We got the gesture. Now let's populate the result.
		populate_results(gesture_index,gesture_factor);
	}
	
	// Populates the results panel for visual analisys
	function populate_results(gesture_index,gesture_factor){
		objResults = document.getElementById("div_result");
		objFactors = document.getElementById("div_factors");
		objGestures = document.getElementById("img_gesture");
		objGestureStr = document.getElementById("div_gesture_string");
		
		objFactors.innerHTML = "<strong>Factor found for the file: </strong>" + gesture_factor + "<br />";
		objFactors.innerHTML = objFactors.innerHTML + "<strong>Factor related to the gesture: </strong>" + known_gestures_mean_factors[gesture_index] + "<br />";
		
		objGestureStr.innerHTML = "<strong>Gesture: </strong>" + known_gestures[gesture_index];
		objGestures.src = "images/gesture_" + gesture_index + ".png";
		objGestures.height = "105px";
		objGestures.width = "105px";
		objResults.style.visibility = "visible";
	}

	// Handles file load
	function loadHandler(event){
		var csv_file = event.target.result;
		getData(csv_file);
	}

	// Handles error
    function errorHandler(event){
		if(event.target.error.name == "NotReadableError"){
			alert("Please, check your file. It seens it is in the wrong format !");
		}
    }
