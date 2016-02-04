var Config = {};

  // Server settings
  Config.server = {};
  Config.server.port = 1337;
  Config.server.host = 'localhost';  // this is currently ignored, server listens on all IP addresses

  // Config.debug_level = 3;
  // Config.server.user = 'pi';
  // Config.server.group = 'pi';
		
  // Device settings
  Config.device = {};
  //Config.device.name = '/dev/spidev0.0'; 
  //Config.device.spi_mode = 'MODE_0';
  //Config.device.spi_chip_select = 'none';
  //Config.device.max_speed = 1000000;

  // Grid settings
  Config.grid = {};
  Config.grid.num_pixels_per_panel_x = 6,
  Config.grid.num_pixels_per_panel_y = 3;
  Config.grid.num_panels_x = 10;
  Config.grid.num_panels_y = 16;

module.exports = Config;