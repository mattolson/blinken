var config = {};
		
		//Pixels per 'Panel'
		config.pixels_per_panel_row = 3,
		config.pixels_per_panel_col = 6;
		
		//Pixels per unit
		config.pixels_per_panel = config.pixels_per_panel_row * config.pixels_per_unit_col;
		
		//Panels X / Y
		config.panels_per_grid_row = 10; //x
		config.panels_per_grid_col = 6; //y


exports.config = config;