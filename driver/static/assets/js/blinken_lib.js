
// uses JavaScript Module Pattern
//
// see http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
// see also http://www.adequatelygood.com/Writing-Testable-JavaScript.html
// see also http://stackoverflow.com/questions/1646698/what-is-the-new-keyword-in-javascript

//-----------------------------------------------------------------------------
// beginning of closure
//
(function () {
	// ... all vars and functions are in this scope only
	// still maintains access to all globals

var global_bc = {};  // blinken client


//-----------------------------------------------------------------------------
// BlinkenClient object constructor
//-----------------------------------------------------------------------------
BlinkenClient = function() {
    // uses global_bc now
}


//-----------------------------------------------------------------------------
BlinkenClient.prototype.connect = function(server_addr) {
    // connect to server
    //
    //console.log("connect server_addr: " + server_addr);
    
    //this.server_addr = server_addr;
    //this.global_url = "http://" + server_addr;
    
    global_bc.global_url = "http://" + server_addr;
    global_bc.server_addr = server_addr;
    
}


//-----------------------------------------------------------------------------
BlinkenClient.prototype.set_frame_id = function(frame_id) {
    // set frame id
    //
    //this.frame_id = frame_id;
    global_bc.frame_id = frame_id;
}



//-----------------------------------------------------------------------------
BlinkenClient.prototype.add_frame_layer = function() {
    //
    // create a new layer on the blinken server using the 'frames' source
    //
    var local_frame_id = null;
    var options = {
        'source' : {
            name : 'frames',
            active : true,
            options: {
                period : 44
            }
        }
     };
 
    //console.log("adding a frame layer: " + this.global_url); // undefined
    //console.log("adding a frame layer: " + BlinkenClient.prototype.global_url);  // undefined
    //console.log("adding a frame layer: " + global_bc.global_url); // works
    
     //Create XMLHTTP Object and send. 
    $.ajax({
        type: "POST",
        url: global_bc.global_url + "/mixer/channels",
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify(options),
        success: function(response_data, textStatus, jqXHR) {
            //alert("success" + JSON.stringify(data));
            if ('id' in response_data) {
                // keep track of frame_id for later
                local_frame_id = response_data.id;
                //console.log("got frame id: " + local_frame_id);
                global_bc.frame_id = local_frame_id;
            }
        }
    })
}
    


//-----------------------------------------------------------------------------
BlinkenClient.prototype.send_frame = function(frame) {
    //
    // send frame of pixel colors to server
    //
    //console.log("bclient sending a frame");
    
    if (global_bc.frame_id == null) {
        //console.log("send_frame error: frame_id is null");
        return; // not connected
    }
    
    var options = {};
    options = {
        'source' : {
            name : 'frames',
            active : true,
            options: {
                period : 66,
                frame: frame,
            }
        }
    };
 
     //Create XMLHTTP Object and send. 
    $.ajax({
        type: "PUT",
        url: global_bc.global_url + "/mixer/channels/" + global_bc.frame_id,
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify(options)
    });
}



//-----------------------------------------------------------------------------
// end of closure (javascript function expression)
}());



//-----------------------------------------------------------------------------
// example library module usage:
//-----------------------------------------------------------------------------
//
//      blinken = new BlinkenClient();
//      blinken.connect("localhost");
//