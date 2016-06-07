////////////////////////////////////
// GLOBAL VARIABLES
////////////////////////////////////
var dataRef = new Firebase("https://suarez-train-schedul.firebaseio.com/"),
    trainName = "",
    trainDest = "",
    trainFirstTime = 0,
    trainFreq = 0;

////////////////////////////////////
// VALIDATION FUNCTIONS
////////////////////////////////////
// function checkName() {

// };

// function checkDest() {

// };

function checkTime(trainFirstTime) {
    // regular expression to match required date format
    re = /^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/;

    if (trainFirstTime != '' && !trainFirstTime.match(re)) {
        vex.dialog.alert("Please enter a valid time format (HH:mm -- 24-hour-time)");
        return false;
    }

    return true;
};

// function checkFreq() {

// };

////////////////////////////////////
// MODAL
////////////////////////////////////
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

////////////////////////////////////
// FIREBASE
////////////////////////////////////
dataRef.on("child_added", function(childSnapshot, prevChildKey) {
		// sets variables of most recently added train
        var zTrainName = childSnapshot.val().trainName;
        var zTrainDest = childSnapshot.val().trainDest;
        var zTrainFirstTime = childSnapshot.val().trainFirstTime;
        var zTrainFreq = childSnapshot.val().trainFreq;

        // converts "First Train Time" value to a moment oject (for manipulation)
        var startTime = moment(zTrainFirstTime, "HH:mm");

        // creates a moment object for the current time (cor manipulation)
        var now = moment().format("HH:mm");

        // creates a variable for more intuitive calculation
        var endTime = moment(now, "HH:mm");

        // calculates the difference in time between the moment object "First Train Time" moment object and the "startTime" moment object with the parameter "minutes"
        var diffInMins = endTime.diff(startTime, "minutes");

        // this use of modulo (or modulus) gives the remainder of dividing the difference in minutes by the frequency, a.k.a. how much 'percentage' we are into waiting for the next train (i.e. = if frequency is 10 and this returns .75, we are 75% into the frequency of the next train)
        var curTrainProg = (diffInMins % zTrainFreq);

        // with this calculation, we are determining how many minutes we have left to wait until the next train
        var minsAway = zTrainFreq - curTrainProg;

        ////////////////////////////////////
        // HERE, I WAS TRYING TO ACCOUNT FOR IF THE CURRENT TIME 'NOW' IS EARLIER THAN THE FIRST TRAIN TIME, IT WOULD STORE THE FIRST TRAIN TIME IN THE 'NEXT ARRIVAL' VARIABLE
        ////////////////////////////////////
        // if (now <= zTrainFirstTime) {
        //     var nextArrival = moment(zTrainFirstTime, "HH:mm");
        //     minsAway = now - zTrainFirstTime;
        // } else {
        //     // calculates the time between now and when the next train will arrive
        //     var nextArrival = moment().add(minsAway, "minutes");
        // }

        // calculates the time between now and when the next train will arrive
        var nextArrival = moment().add(minsAway, "minutes");

        // formats the 'nextArrival' time into a moment object
        var nextArrivalFormatted = nextArrival.format("HH:mm");

        // prints all the above data to the DOM
        $("#train-data-table").append("<tr><td>" + zTrainName + "</td><td>" + zTrainDest + "</td><td>" + zTrainFirstTime + "</td><td>" + zTrainFreq + "</td><td>" + nextArrivalFormatted + "</td><td>" + minsAway + "</td></tr>");

    },

    // Create Error Handling
    function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

////////////////////////////////////
// CLICK LISTENERS
////////////////////////////////////
$("#add-train").on("click", function(e) {

	// prevent page from reloading upon button click
    e.preventDefault();

    // stores all the values the user enters
    trainName = $("#name-input").val().trim();
    trainDest = $("#dest-input").val().trim();
    trainFirstTime = $("#first-train-input").val().trim();
    checkTime(trainFirstTime);
    trainFreq = $("#freq-input").val().trim();

    // with this '.push' method, this updates the Firebase data storage object each time a user adds a new train
    dataRef.push({
        trainName: trainName,
        trainDest: trainDest,
        trainFirstTime: trainFirstTime,
        trainFreq: trainFreq
    });

    // clears the for input fields for the next entry
    $("#name-input").val("");
    $("#dest-input").val("");
    $("#first-train-input").val("");
    $("#freq-input").val("");
})
