$(function() {
    $("#name-input").focus();
    ////////////////////////////////////
    // GLOBAL VARIABLES
    ////////////////////////////////////
    var dataRef = new Firebase("https://suarez-train-schedul.firebaseio.com/"),
        trainName = "",
        trainDest = "",
        trainFirstTime = 0,
        trainFreq = 0,
        zId = "";

    console.log(dataRef);

    ////////////////////////////////////
    // VALIDATION FUNCTIONS
    ////////////////////////////////////
    function checkName(trainName) {
        // regular expression to match required name format
        re = /[a-z,]/gi;

        if (trainDest !== '' && !trainDest.match(re)) {
            vex.dialog.alert("Please enter a valid destination");
            return false;
        }
        return true;
    };

    function checkDest(trainDest) {
        // regular expression to match required destination format
        re = /[a-z,]/gi;

        if (trainDest !== '' && !trainDest.match(re)) {
            vex.dialog.alert("Please enter a valid destination");
            return false;
        }
        return true;
    };

    function checkTime(trainFirstTime) {
        // regular expression to match required date format
        re = /^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/;

        if (trainFirstTime !== '' && !trainFirstTime.match(re)) {
            vex.dialog.alert("Please enter a valid time format (HH:mm -- 24-hour-time)");
            return false;
        }
        return true;
    };

    function checkFreq(trainFreq) {
        // regular expression to match required frequency format
        re = /(?!\d{3})([0-1]?[0-9])/;

        if (trainFreq !== '' && !trainFreq.match(re)) {
            vex.dialog.alert("Pleast enter a train frequency in minutes");
            return false;
        }
        return true;
    };

    function updateMinsAway() {
        if (timer.time < 0) {
            // console.log($(".mins-away").val());  // logs blank ??
            // $(".mins-away").html(($(".mins-away").val() - 1));
            timer.stop();
            timer.reset();
            timer.start();
        }
    }

    ////////////////////////////////////
    // MODAL
    ////////////////////////////////////
    // Get the <span> element that closes the modal
    // var span = document.getElementsByClassName("close")[0];


    ////////////////////////////////////
    // TIMER
    ////////////////////////////////////
    var timer = {
        time: 60,

        start: function() {
            counter = setInterval(timer.count, 1000);
        },

        count: function() {
            timer.time--;
            var converted = timer.timeConverter(timer.time);
            $('#timer').html(converted);
            updateMinsAway();

            // if (timer.time === 0) {
            //     updateMinsAway(minsAway);
            //     $(".mins-away").html("<td class='data-cell mins-away' data-id='minsAway' data-key='" + zId + "'>" + minsAway + "</td></tr>");
            //     timer.reset();
            //     timer.start();
            // }
        },

        stop: function() {
            clearInterval(counter);
        },

        reset: function() {
            timer.time = 60;
            $("#timer").html("00:60");
        },

        timeConverter: function(t) {
            var minutes = Math.floor(t / 60);
            var seconds = t - (minutes * 60);
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            if (minutes === 0) {
                minutes = "00";
            } else if (minutes < 10) {
                minutes = "0" + minutes;
            }
            return minutes + ":" + seconds;
        }
    };

    ////////////////////////////////////
    // FIREBASE
    ////////////////////////////////////
    dataRef.on("child_added", function(childSnapshot, prevChildKey) {
            // sets variables of most recently added train each time a new train is added
            var zTrainName = childSnapshot.val().trainName;
            var zTrainDest = childSnapshot.val().trainDest;
            var zTrainFirstTime = childSnapshot.val().trainFirstTime;
            var zTrainFreq = childSnapshot.val().trainFreq;
            zId = childSnapshot.key();
            console.log(zId);

            ////////////////////////////
            // MOMENT.JS FORMATTING
            ////////////////////////////
            // converts "First Train Time" value to a moment oject (for manipulation)
            var startTime = moment(zTrainFirstTime, "HH:mm:ss");

            // creates a moment object for the current time (cor manipulation)
            var now = moment().format("HH:mm:ss");

            // creates a variable for more intuitive calculation
            var endTime = moment(now, "HH:mm:ss");

            // calculates the difference in time between the moment object "First Train Time" moment object and the "startTime" moment object with the parameter "minutes"
            var diffInMins = endTime.diff(startTime, "minutes");

            // this use of modulo (or modulus) gives the remainder of dividing the difference in minutes by the frequency, a.k.a. how much 'percentage' we are into waiting for the next train (i.e. = if frequency is 10 and this returns .75, we are 75% into the frequency of the next train)
            var curTrainProg = (diffInMins % zTrainFreq);

            // with this calculation, we are determining how many minutes we have left to wait until the next train
            var minsAway = zTrainFreq - curTrainProg;
            console.log(minsAway);

            // if the current time is earlier than the first arrival, 'Next Arrival' shows the 'First Train Time' and 'Minutes Away' shows "n/a"
            if (diffInMins < 0) {
                var nextArrival = moment(zTrainFirstTime, "HH:mm");
                minsAway = "(train not yet running;<br> check 'First Train Time')";
            } else if (diffInMins == 0) {
                var nextArrival = moment(zTrainFirstTime, "HH:mm");
                minsAway = "First service beginning now!<br> Please board your train...";
            } else {
                // calculates the time between now and when the next train will arrive
                var nextArrival = moment().add(minsAway, "minutes");
            }

            // formats the 'nextArrival' time into a moment object
            var nextArrivalFormatted = nextArrival.format("HH:mm");

            // prints all the above data to the DOM
            $("#train-data-table").append(
                "<tr><td class='data-cell' data-id='trainName' data-key='" + zId + "'>" + zTrainName +
                "</td><td class='data-cell' data-id='trainDestination' data-key='" + zId + "'>" + zTrainDest +
                "</td><td class='data-cell' data-id='firstTrainTime' data-key='" + zId + "'>" + zTrainFirstTime +
                "</td><td class='data-cell' data-id='trainFreqency' data-key='" + zId + "'>" + zTrainFreq +
                "</td><td class='data-cell' data-id='nextTrainArrival' data-key='" + zId + "'>" + nextArrivalFormatted +
                "</td><td class='data-cell mins-away' data-id='minsAway' data-key='" + zId + "'>" + minsAway + "</td></tr>");

        },

        // Create Error Handling
        function(errorObject) {
            console.log("The read failed: " + errorObject.code);
        },

        timer.start());


    ////////////////////////////////////
    // CLICK LISTENERS
    ////////////////////////////////////

    // add train button
    $("#add-train").on("click", function(e) {

        if (($("#name-input").val() == "") || ($("#dest-input").val() == "") || ($("#first-train-input").val() == "") || ($("#freq-input").val()) == "") {
            vex.dialog.alert("Please enter the necessary information into the form");
            return false;
        }

        // prevent page from reloading upon button click
        e.preventDefault();

        // stores all the values the user enters
        trainName = $("#name-input").val().trim();
        trainDest = $("#dest-input").val().trim();
        trainFirstTime = $("#first-train-input").val().trim();
        trainFreq = $("#freq-input").val().trim();

        // with this '.push' method, this updates the Firebase data storage object each time a user adds a new train (with form validation)
        if (checkName(trainName) && checkDest(trainDest) && checkTime(trainFirstTime) && checkFreq(trainFreq)) {
            dataRef.push({
                trainName: trainName,
                trainDest: trainDest,
                trainFirstTime: trainFirstTime,
                trainFreq: trainFreq,
            });
        } else {
            return false;
        }

        // clears the for input fields for the next entry
        $("#name-input").val("");
        $("#dest-input").val("");
        $("#first-train-input").val("");
        $("#freq-input").val("");
        $("#name-input").focus();
    });

    // double-click editable table cells
    $("tbody").on("dblclick", ".data-cell", function() {
        var originalContent = $(this).text();
        console.log(originalContent);
        var id = $(this).attr("data-id");
        console.log(id);

        ///////////////////////////////////////////////////////////////////
        // here is where I want the Firebase data to be updated upon the user changing something on a double-click; how do I tell it to select the specific object, i.e. the first row of the table is the first object (using .push on the Firebase object)
        ///////////////////////////////////////////////////////////////////
        // var id = $(this).attr("data-id");
        // console.log(id);

        // where do I go from here?
        ///////////////////////////////////////////////////////////////////


        $(this).addClass("cellEditing");
        $(this).html("<input type='text' id='quick-edit' value='" + originalContent + "'>");
        $(this).children().first().focus().select();
        $(this).children().first().keypress(function(e) {
            if (e.which == 13) { // 'enter' key
                var newContent = $(this).val();
                $(this).parent().text(newContent);
                $(this).parent().removeClass("cellEditing");
            }
        });

        $(this).children().first().blur(function() {
            $(this).parent().text(originalContent);
            $(this).parent().removeClass("cellEditing");
        });

    });

    // listen for any change in the tbody ???
    // $("tbody").on("change", ".data-cell", function() {

    //     var id = $(this).attr("data-id");

    //     dataRef.on("update", function(id) {
    //         if (id === "trainName") {
    //             if (childSnapshot.key() === id)
    //                 dataRef.update({
    //                     trainName: newContent
    //                 })
    //         }
    //     })
    // })

});
