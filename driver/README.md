_alpha 0.2_

# Welcome to Bliken!

Blinken is a channel manager and mixer for a matrix of lights. It was designed for the cieling in Idea Fabrication Labs in Chico, CA for it's 2880 RGB pixel cieling array. It is a basically a channel mixer. Each channel can have a source assigned to it.

The app is located in /driver with project specific files in /docs

## What is the point?

The vision is that Bliken would be running in the background at all times, allowing for multiple people to interact, collaborate and display output on the cieling. This would help eliminate fragmentation between separate users. Ideally, a `hello world` should be easily accomplished, and writing native extensions should be inherent to the platform.

## Sources? What?

We established everything is a source, but there are different types.

* There are Display (grid?) Sources, these return a grid
* There are Data Sources, that are json objects containing data from the desired source (internet, sensors, etc)
* There are Filters, which are similar to Display Sources, except they require a grid as an input, and must return one as well. Example filters would be Luminosity, Invert Colors and Invert X/Y. Think "effect"

Presently, the only functioning sources are Display Sources, new branch will introduce the others. 

# Installation

`cd ./driver && npm install`

`node index.js`

# Usage

Visit localhost:1337 and you will find the demo interface that utilizes the API. The demo uses websockets in order to fully convey the core concept. 

# API
ter
The API can be accessed via REST of Websockets for bi-directional communication. There is presently no push API, so presently data sources (source inputs) are not available via REST. 

## REST

### Sources

* GET /sources returns list of known sources

### channels

* GET /mixer/channels returns list of channels currently defined
* POST /mixer/channels adds a channel to the stack
* GET /mixer/channels/:id returns info about a particular channel (:id is the id assigned by the system)
* PUT /mixer/channels/:id updates the channel with a new source and/or options
* DELETE /mixer/channels/:id removes the channel from the stack

### Grid

* GET /grid returns the current color state of the array
* GET /grid/:x/:y returns the current color state of a particular pixel

## Websockets

### Sources

* 'list sources'

### Channels 

* 'list channels' 
* 'create channel' *channel_name*, *source_name*, *source_options* returns channel_id
* 'update channel' *channel_id*, *channel_options*
* 'destroy channel' *channel_id*
* 'get channel' *channel_id*

### Grid

* 'get grid' - get master grid

### example 

```socket.emit('create channel', 'My Channel', 'sparkle', { period: 450 })```

# Objects

* grid - Contains pixel data
* source - superclass that manages sources
* registry - handles loading and initialization of sources
* channel - a grid with a binded grid
* mixer - handles rendering and blending between channels 

# Functionality
- Create channel and assign source
- Update source values
- Remove Channel
- Channel Opacity

# Todo
- Enable Filters
- Channel Order
- UDP Passthrough Channels (creates a UDP socket server)
- Convert sources to be both inputs (data) and ouputs (display)
- User preferences
- Session management

