////////////////////////////////////
// GLOBAL VARIABLES
////////////////////////////////////
var dataRef = new Firebase("https://suarez-train-schedul.firebaseio.com/"),
    trainName = "",
    trainDest = "",
    trainFirstTime = 0,
    trainFreq = 0;

////////////////////////////////////
// FUNCTIONS
////////////////////////////////////


////////////////////////////////////
// FIREBASE
////////////////////////////////////
dataRef.on("child_added", function(childSnapshot, prevChildKey) {

		console.log(childSnapshot.val());
        var zTrainName = childSnapshot.val().trainName;
        var zTrainDest = childSnapshot.val().trainDest;
        var zTrainFirstTime = childSnapshot.val().trainFirstTime;
        var zTrainFreq = childSnapshot.val().trainFreq;

        console.log(zTrainName);
        console.log(zTrainDest);
        console.log(zTrainFirstTime);
        console.log(zTrainFreq);

        var startTime = moment(zTrainFirstTime, "HH:mm");
        console.log(startTime);

        var now = moment().format("HH:mm");

        var endTime = moment(now, "HH:mm");
        console.log(now);

        var diffInHours = endTime.diff(startTime, "hours");
        console.log(diffInHours);

        var diffInMins = diffInHours * 60;
        console.log(diffInMins);

        var mod = diffInMins % zTrainFreq;
        console.log(mod);
        var minsAway = zTrainFreq - mod;
        console.log(minsAway);

        var nextArrival = moment((now - minsAway), "HH:mm");
        console.log(nextArrival);

        $("#train-data-table").prepend("<tr><td>" + zTrainName + "</td><td>" + zTrainDest + "</td><td>" + zTrainFreq + "</td><td>" + nextArrival + "</td><td>" + minsAway + "</td></tr>");

    },

    // Create Error Handling
    function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

////////////////////////////////////
// CLICK LISTENERS
////////////////////////////////////
$("#add-train").on("click", function(e) {

    e.preventDefault();

    trainName = $("#name-input").val().trim();
    trainDest = $("#dest-input").val().trim();
    trainFirstTime = $("#first-train-input").val().trim();
    trainFreq = $("#freq-input").val().trim();

    console.log(trainName);
    console.log(trainDest);
    console.log(trainFirstTime);
    console.log(trainFreq);

    dataRef.push({
        trainName: trainName,
        trainDest: trainDest,
        trainFirstTime: trainFirstTime,
        trainFreq: trainFreq
    });

    $("#name-input").val("");
    $("#dest-input").val("");
    $("#first-train-input").val("");
    $("#freq-input").val("");
})
