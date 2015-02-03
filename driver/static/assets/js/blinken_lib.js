//-----------------------------------------------------------------------------
// blinken client library
//
// 
//
//-----------------------------------------------------------------------------
BlinkenClient = function(server_addr) {
    // object constructor
    //
    // methods are added to object prototype below

    this.server_addr = server_addr;    
    this.protocol = "http://";
}



//-----------------------------------------------------------------------------
BlinkenClient.prototype.add_frame_layer = function(callback) {
    //
    // create a new layer on the blinken server using the 'frames' source
    //
    var options = {
        'source' : {
            name : 'frames',
            active : true,
            options: {
                period : 44
            }
        }
    }
 
    $.ajax({
        type: "POST",
        url: this.protocol + this.server_addr + "/mixer/channels",
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify(options),
        success: function(response_data, textStatus, jqXHR) {
            if (callback) {
                callback(response_data);
            }
        }
    });
}
    

//-----------------------------------------------------------------------------
BlinkenClient.prototype.get_sources_list = function(callback) {
    //
	// get the list of "sources" from the server
    //
    $.ajax({
        type: "GET",
        url: this.protocol + this.server_addr + "/sources",
        contentType: "application/json; charset=UTF-8",
        success: function(response_data, textStatus, jqXHR) {
            if (callback) {
                callback(response_data);
            }
        }
    });
}


//-----------------------------------------------------------------------------
BlinkenClient.prototype.send_frame = function(frame, frame_id) {
    //
    // send a "frame" of pixels to server
    //
    // each frame is array of rows
    // each row is an array of pixel colors
    // each color is an array of rgb or rgba values
    //
    
    if (frame_id) {
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
        $.ajax({
            type: "PUT",
            url: this.protocol + this.server_addr + "/mixer/channels/" + frame_id,
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(options)
            // no need to process response_data
        });
    }
}

