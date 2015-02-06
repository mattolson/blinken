//-----------------------------------------------------------------------------
// blinken client library
//
// a javascript library for building blinken clients
//
//-----------------------------------------------------------------------------
BlinkenClient = function(server_addr) {  // object constructor
    //
    // methods are added to object prototype below
    //
    // usage example: 
    //     var blinken = new BlinkenClient(window.location.host);
    //
    this.server_addr = server_addr;    
    this.protocol = "http://";
}


//-----------------------------------------------------------------------------
BlinkenClient.prototype.add_layer = function(source_name, callback) {
    //
    // create a new layer on the blinken server using the 'frames' source
    //
    // the server returns the "id" of the new layer in the response_data
    //
    var data = {source: {active : true}};
    data.source.name = source_name;
    $.ajax({
        type: "POST",
        url: this.protocol + this.server_addr + "/mixer/channels",
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify(data),
        success: function(response_data, textStatus, jqXHR) {
            if (callback) {
                callback(response_data);
            }
        }
    });
}
    

//-----------------------------------------------------------------------------
BlinkenClient.prototype.delete_layer = function(layer_id, callback) {
    //
    // delete a layer
    //
    $.ajax({
        type: "DELETE",
        url: this.protocol + this.server_addr + "/mixer/channels/" + layer_id,
        success: function(response_data, textStatus, jqXHR) {
            if (callback) {
                callback(response_data);
            }
        }
    });
}   

//-----------------------------------------------------------------------------
BlinkenClient.prototype.get_layers_list = function(callback) {
    //
	// get the current list of layers from the server
    // then update layer display with the new list
    //
    $.ajax({
        type: "GET",
        url: this.protocol + this.server_addr + "/mixer/channels",
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
    // each frame is an array of rows
    // each row is an array of pixel colors
    // each color is an array of rgb or rgba values
    //    
    if (frame_id) {
        data = {source: {options: {frame: frame}}};
        $.ajax({
            type: "PUT",
            url: this.protocol + this.server_addr + "/mixer/channels/" + frame_id,
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(data)
            // no callback
        });
    }
}


//-----------------------------------------------------------------------------
BlinkenClient.prototype.ceiling_off = function() {
    // de-activate the LED ceiling
    $.ajax({
        type: "GET",
        url: this.protocol + this.server_addr + "/blastoff",
    });
}


//-----------------------------------------------------------------------------
BlinkenClient.prototype.ceiling_on = function() {
    // activate the LED ceiling
    $.ajax({
        type: "GET",
        url: this.protocol + this.server_addr + "/blaston",
    });
}


