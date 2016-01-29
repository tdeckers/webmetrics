/**
 * Created by tdeckers on 17/12/2015.
 */

$( document ).ready(function() {
    appinit();
});

var intervalID;
var cycle = 1000;
var dataSize = 50;
var data = [];
var graph;

function appinit() {
    $('#btnStart').click(function() {
        $('#btnStart').attr('disabled', true);
        $('#btnStop').attr('disabled', false);
        intervalID = setInterval(getData, cycle);
    });
    $('#btnStop').click(function() {
        $('#btnStop').attr('disabled', true);
        $('#btnStart').attr('disabled', false);
        clearInterval(intervalID);
    });
    $('#destUrl').change(function(){
        setCookie('url', $('#destUrl').val());
    });
    if(getCookie("url")) {
        $('#destUrl').val(getCookie("url"));
    }

    // Initialize array
    for (var i = 0; i < dataSize; i++) {
        var date = new Date(new Date().getTime() - (dataSize-i)*cycle);
        var item = {'date': date, 'value': 0};
        add(item);
    }

    draw();
}

/**
 * See: https://github.com/mozilla/metrics-graphics/blob/master/src/js/common/data_graphic.js
 */
function draw() {
    // Calculate average of values.
    var avg = 0.0;
    var count = 0
    for (var i = 0; i < dataSize; i++) {
        // Let's only add when there's and actual value
        // avoids slow climbing avg at the beginning.
        if (data[i].value != 0) {
            avg += data[i].value;
            count++; // only avg over value we actually counted.
        }
    }
    avg /= count;
    avg = Math.round(avg);

    // Draw.
    graph = MG.data_graphic({
        title: "Response times (ms)",
        description: "test",
        data: data,
        width: 700,
        //full_width: true,
        height: 250,
        right: 40,
        target: document.getElementById('graph'),
        baselines: [{value: avg, label: "avg: " + avg + " ms"}],
        x_accessor: 'date',
        y_accessor: 'value',
        missing_is_hidden: true,
        transition_on_update: false,
        //y_label: 'Response time',
        european_clock: true,
        interpolate: 'line',               // interpolation method to use when rendering lines
        interpolate_tension: 0,              // its range is from 0 to 1; increase if your data is irregular and you notice artifacts
    });
}

function add(item) {
    if (item.value > 1000) { return; } //Cheat: avoid spikes in the diagram!
    if (data.length > 50) {
        data.shift();
    }
    data.push(item);
}

function getData() {
    console.log('Getting data.');
    var url = $('#destUrl').val();
    console.log("Url: " + url);

    if ( url ) {

        var start = (new Date()).getTime();
        $.ajax({
            type: "HEAD", //only headers
            url: url,
            // The name of the callback parameter, as specified by the YQL service
            // We don't care.
            jsonp: "callback",
            // Tell jQuery we're expecting JSONP.  Using jsonp to avoid CORS.
            dataType: "jsonp",
            success: function(){
                var end = (new Date()).getTime();
                var responseTimeMs = end - start;
                var item = {'date': new Date(), 'value': responseTimeMs};
                add(item);
                draw();
                console.log("Took: " + responseTimeMs + " ms");
            },
            // Error will be normal here, since content is not expected to be javascript.
            // We're just interested in the timings.
            error: function() {
                var end = (new Date()).getTime();
                var responseTimeMs = end - start;
                var item = {'date': new Date(), 'value': responseTimeMs};
                add(item);
                draw();
                console.log("Took: " + responseTimeMs + " ms");
                console.error("Failed to get.")
            }
        });
    } else {
        console.log('No URL. Skipping...');
    }

}

function setCookie(name, value)
{
    var expiry = new Date(new Date().getTime() + 30 * 24 * 3600 * 1000); // plus 30 days
    document.cookie=name + "=" + escape(value) + "; path=/; expires=" + expiry.toGMTString();
}

function getCookie(name)
{
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}