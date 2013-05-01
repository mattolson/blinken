var Config = {};
		
  // Pixels per 'Panel'
  Config.num_pixels_per_panel_x = 3,
  Config.num_pixels_per_panel_y = 6;
  Config.num_pixels_per_panel = Config.num_pixels_per_panel_x * Config.num_pixels_per_unit_y;
		
  // Panels per grid
  Config.num_panels_x = 10;
  Config.num_panels_y = 6;

module.exports = Config;
