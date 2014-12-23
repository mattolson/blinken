 var socket = io('http://localhost:1337');

  var channels, sources, grid, dimensions, $app = $('body');

  $(function(){
    $('button#create-channel').click(create_channel);
    $("select#sources").change(refresh_source_options);
    // $('li.channel button.destroy-channel').live('click', destroy_channel);
  });

  var html = new Object();

  html.channel = function(key){
    return '<li id="'+key+'" class="channel" data-source="'+this.source.name+'"><h1>Channel '+this.id+' ('+this.name+')</h1><span class="status'+( (this.source.active) ? 'active' : '' )+'"></span><h2>'+this.source.name+'</h2><button class="destroy-channel" data-id="'+this.id+'">Delete</button><div data-id="'+this.id+'" class="source-options"><form class="update"><button class="update-channel" data-id="'+this.id+'">Update</button></form></div></li>';
  }
  html.source = function(key){
    return '<option id="'+key+'" class="source" value="'+this.name+'">'+this.name+'</option>';
  }

  html.source_option = function(key){
    return '<li id="'+key+'" class="source-option"><label for="'+this.name+'">'+this.name+'</label><input type="text" id="'+this.name+'" name="'+this.name+'" value="'+this.default+'" /></li>';
  }

  html.channel_option = function(key, option, type){
    console.log('type: '+type);
    switch(type){
      case "select":
        var html = "<select>";
        for(choice in this.choices){
          html += '<option value="'+choice+'">'+choice+'</option>';
        }
        html += "</select>";
        return html;
      case "file":
        return '<li id="'+key+'" class="channel-option"><label for="'+key+'">'+key+'</label><input type="file" id="'+key+'" name="'+key+'" value="'+option+'" /></li>';
      case "string":
      case "integer":
      default:
        return '<li id="'+key+'" class="channel-option"><label for="'+key+'">'+key+'</label><input type="text" id="'+key+'" name="'+key+'" value="'+option+'" /></li>';
    }

  }

  html.source_option_array = function(){
    $.each(this, function(key){
      return '<li id="'+key+'" class="source-option"><label for="'+this.name+'">'+this.name+'</label><input type="text" id="'+this.name+'" name="'+this.name+'['+key+']" value="'+this.default+'" /></li>';
    });
  }

  function create_channel(event){ 
    event.preventDefault();
    var formdata = $('form#source-options').serializeObject();
    // var source_options = JSON.stringify(formdata);
    // console.log(formdata)
    socket.emit('create channel', $('input#channel-name').val(), $('select#sources option:selected').val(), formdata);
  }

  function create_channel_success(channel_object){
    console.log('Channel successfully added.');
    console.dir(channel_object);
    socket.emit('list channels');
  }

  function update_channel(event){
    event.preventDefault();
    var $channel = $(this).parents('li.channel');
    var channel = channels[$channel.attr('id')];
    console.log('Channel Object');
    console.dir(channel);
    console.log('-----------');
    var channel_id = $(this).attr('data-id');
    alert('updating');
    // var source_options = {};
    $channel.find('.source-options form li input.changed').each(function(){
      alert('adding to object '+$(this).attr('name')+':'+$(this).val());
      channel.source.options[$(this).attr('name')] = $(this).val();
    });
    console.log('Channels source options updated')
    socket.emit('update channel', channel_id, channel);
  }

  function update_channel_option(){ $(this).addClass('changed'); }

  function destroy_channel(){
    var channel_id = $(this).attr('data-id');
    console.log('delete channel '+channel_id);
    socket.emit('destroy channel', channel_id);
  }

  function refresh_channels(channels_array){ 
    channels = channels_array;
    // console.log(channels);
    $('section#channels ul').empty();
    $.each(channels, function(key, channel){
      console.log(html.channel.apply(channel) );
      var $channel = $( html.channel.apply(channel, [key]) ).appendTo('section#channels ul');
      $channel.find('button.destroy-channel').bind('click', destroy_channel);
      $channel.find('button.update-channel').bind('click', update_channel);
      var source_option_html = '';
      var index = 0;
      $.each(channel.source.options, function(key, option){
          // for(var t =0; t< channel.source.options.length; t++) { if(t == index) var type = sources[t].options[index].type; }
          source_option_html += html.channel_option(key, option, null);
          index++;
      });
      $channel.find('.source-options form').prepend(source_option_html);
      $channel.find('.source-options form li input').bind('change', update_channel_option);
      // $('section#channels ul').find('li#'+value.id+' button.destroy-channel').bind('click', destroy_channel);
    });
    // console.log('Channels Refreshed');
    // console.dir(channels_array);
  }

  function refresh_sources( sources_array ){ 
    sources = sources_array;
    $.each(sources, function(key, value){
      $('select#sources').append(html.source.apply(value, [key]));
    });
    refresh_source_options();
  }

  function refresh_source_options(){ 
    $('form#source-options ul').empty();

    var index = $('select#sources option:selected').attr('id');
    $.each(sources[index].options, function(key, option){
      $('form#source-options ul').append( html.source_option.apply(this, [key] ))
    });
  }

  function refresh_grid( grid_array ){
    grid = grid_array;
    // $('section#grid').html(grid_html);
    // console.log(grid_html)
    // console.log('refreshing grid...');
    // if( $('section#grid table').length == 0 ) { draw_grid(); }
    // $.each(grid, function(key, value){ 
      draw_grid();
      // $('section#grid table td#'+key).css('background-color', 'rgb('+value[0]+','+value[1]+','+value[2]+')');
    // })

    // $('section#grid').html(JSON.stringify(grid));
  }

  function grid_dimensions( dim ){
    console.dir(dim);
    dimensions = dim;
  }

  function draw_grid( ) {
    var $grid = $('#grid ul')
    var total = grid.length;

    // console.dir(dimensions);
    var html = '<table cellspacing="0" width="100%" height="100%">';
    var key = 0;
   for(var x = 0; x < dimensions.width; x++){
      html += '<tr class="row">'
      for(var y = 0; y < dimensions.height; y++){
        var r = grid[key][0],
            g = grid[key][1],
            b = grid[key][2];

        html += '<td class="pixel" id="'+key+'" style="background:rgb('+r+','+g+','+b+')"></td>';

        key++;

      }
      html += '</tr>'
    }

    $( 'section#grid' ).html( html );
  }

  var gridIntval, refreshEvery = 2000;
  
  function GridStart(){
    gridIntval = setInterval(function(){
      socket.emit('get grid');
    }, refreshEvery);
  }

  function GridStop(){
    clearInterval(gridIntval);
  }

  

  function error_log(error){
    console.log(error);
  }

  socket.emit('list channels');
  socket.on('refresh channels', refresh_channels);

  socket.emit('list sources');
  socket.on('refresh sources', refresh_sources);

  socket.emit('get grid dimensions');
  socket.on('grid dimensions',  grid_dimensions);

  // socket.emit('get grid');
  socket.on('refresh grid', refresh_grid);

  // socket.on('mixer update', refresh_mixer);

  socket.on('channel created', create_channel_success);

  socket.on('error', error_log);

  GridStart();