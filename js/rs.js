const rsjs = function (element,resize_type,options,scale) {
  if (resize_type=='full') {
    var viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    if (scale == null) scale = 1;

    if (typeof options.margin_width == 'number' && options.margin_width != null) {
      viewport.width -= options.margin_width*2;
    };

    if (typeof options.margin_height == 'number' && options.margin_height != null) {
      viewport.height -= options.margin_height*2;
    };

    if (Number(element.getAttribute('height')) / Number(element.getAttribute('width')) > viewport.height / viewport.width) {
      newHeight = viewport.height;
      newWidth = newHeight * Number(element.getAttribute('width')) / Number(element.getAttribute('height'));
    } else {
      newWidth = viewport.width;
      newHeight = newWidth * Number(element.getAttribute('height')) / Number(element.getAttribute('width'));
    };

    if (typeof options.min_width == 'number' && options.min_width != null && newWidth < options.min_width) {
      newWidth = options.min_width;
    };

    if (typeof options.min_height == 'number' && options.min_height != null && newHeight < options.min_height) {
      newHeight = options.min_height;
    };

    if (typeof options.max_width == 'number' && options.max_width != null && newWidth > options.max_width) {
      newWidth = options.max_width;
    };

    if (typeof options.max_height == 'number' && options.max_height != null && newHeight > options.max_height) {
      newHeight = options.max_height;
    };

    element.style.width = (newWidth*scale)+'px';
    //element.style.marginLeft = String(options.margin_width+'px');
    //element.style.marginRight = String(options.margin_width+'px');
    element.style.height = (newHeight*scale)+'px';
    //element.style.marginTop = String(options.margin_height+'px');
    //element.style.marginBottom = String(options.margin_height+'px');

    return;
  };
  if (resize_type == 'reset') {
    element.style.width = Number(element.getAttribute('width'))+'px';
    element.style.height = Number(element.getAttribute('height'))+'px';

    return;
  };
  if (resize_type == 'specific') {
    element.style.width = options.width+'px';
    if (options.keep_aspect_ratio) {
      element.style.height = element.style.width;
    } else {
      element.style.height = options.height+'px';
    };

    return;
  };
};
