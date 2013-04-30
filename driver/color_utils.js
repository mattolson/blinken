// Returns hash of h,s,v as floats between 0 and 1
exports.rgb_to_hsv = function(rgb) {
  var min_color, max_color, delta, r, g, b, h, s, v;

  // Convert to floats between 0 and 1
  r = rgb[0] / 255.0;
  g = rgb[1] / 255.0;
  b = rgb[2] / 255.0;

  min_color = Math.min(Math.min(r,g), b);
  max_color = Math.max(Math.max(r,g), b);
  v = max_color;
  delta = max_color - min_color;

  if( max_color != 0 )
    s = delta / max_color;
  else {
    // r = g = b = 0    // s = 0, v is undefined
    s = 0;
    h = -1;
    return [h,s,v];
  }

  if( r == max_color )
    h = ( g - b ) / delta;   // between yellow & magenta
  else if( g == max_color )
    h = 2 + ( b - r ) / delta; // between cyan & yellow
  else
    h = 4 + ( r - g ) / delta; // between magenta & cyan
  
  h *= 60; // degrees
  if( h < 0 )
    h += 360;

  return [h,s,v];
};

// Inverse of rgb_to_hsv
exports.hsv_to_rgb = function(hsv) {
  var i, h, s, v, r, g, b, f, p, q, t;
  h = hsv[0];
  s = hsv[1];
  v = hsv[2];

  if( s == 0 ) {
    // achromatic (grey)
    r = g = b = Math.floor(v*255.0);
    return [r,g,b];
  }

  h /= 60;      // sector 0 to 5
  i = Math.floor(h);
  f = h - i;      // factorial part of h
  p = v * (1 - s);
  q = v * (1 - s * f);
  t = v * (1 - s * (1 - f));

  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:    // case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  r = Math.floor(r*255.0);
  g = Math.floor(g*255.0);
  b = Math.floor(b*255.0);
  return [r,g,b];
};

exports.wheel = function(position) {
  var r, g, b;
  r = g = b = 0;
  if (position < 85) {
    r = position * 3
    g = 255 - position * 3;
  } else if (position < 170) {
    position -= 85;
    r = 255 - position * 3;
    b = position * 3;
  } else {
    position -= 170; 
    g =  position * 3;
    b = 255 - position * 3;
  }

  return [r,g,b];
};
