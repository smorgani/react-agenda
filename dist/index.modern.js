import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import HumanizeDuration from 'react-humanize-duration';
import classNames from 'classnames';
import Rdate from 'react-datetime';
import ReactDOM from 'react-dom';

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function getUnique(array) {
  var newAr = array.filter(function (val, ind) {
    return array.indexOf(val) == ind;
  });
  return newAr;
}
function getLast(array) {
  return array[array.length - 1];
}
function getFirst(array) {
  return array[0];
}
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
function mapItems(itemsArray, rowsPerHour, timezone) {
  var itemsMap = {};
  itemsArray = itemsArray.sort(function (a, b) {
    return a.startDateTime - b.startDateTime;
  });
  itemsArray.forEach(function (item) {
    if (!item.startDateTime) {
      return false;
    }

    var interval = 60 / rowsPerHour;
    var offsetMinutes = item.startDateTime.getMinutes() % interval;
    var start = moment(item.startDateTime).subtract(offsetMinutes, "minutes").toDate();
    var end = moment(item.endDateTime);
    var duration = moment.duration(end.diff(moment(item.startDateTime)));
    item.duration = duration;
    var rows = Math.ceil(duration.asHours() / (interval / 60));
    var cellRefs = [];

    for (var i = 0; i < rows; i++) {
      var ref = moment(start).add(i * interval, 'minutes');
      ref = ref.format('YYYY-MM-DDTHH:mm:00');
      cellRefs.push(ref);
    }

    cellRefs.forEach(function (ref) {
      var newItem = Object.keys(item).filter(function (key) {
        return !key.includes('classes');
      }).reduce(function (obj, key) {
        obj[key] = item[key];
        return obj;
      }, {});
      newItem.classes = itemsMap[ref] ? itemsMap[ref].classes + ' ' + item.classes : item.classes || '';
      newItem.cellRefs = [getFirst(cellRefs), getLast(cellRefs)];

      if (itemsMap[ref]) {
        if (itemsMap[ref]._id) {
          var newArr = [itemsMap[ref], newItem];
          itemsMap[ref] = newArr;
          return;
        }

        if (itemsMap[ref][0] && !itemsMap[ref]._id) {
          itemsMap[ref].push(newItem);
          return;
        }

        return;
      }

      itemsMap[ref] = newItem;
    });
  }, this);
  return itemsMap;
}

var ReactAgendaItem = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ReactAgendaItem, _Component);

  function ReactAgendaItem(props) {
    var _this;

    _this = _Component.call(this, props) || this;
    _this.state = {
      wrapper: {
        width: '150px',
        marginLeft: '0px',
        zIndex: 5,
        borderLeft: null
      },
      controls: {}
    };
    _this.updateDimensions = _this.updateDimensions.bind(_assertThisInitialized(_this));
    _this.raiseZindex = _this.raiseZindex.bind(_assertThisInitialized(_this));
    _this.lowerZindex = _this.lowerZindex.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = ReactAgendaItem.prototype;

  _proto.updateDimensions = function updateDimensions() {
    var elem = document.getElementById(this.props.parent);

    if (elem) {
      var nwidh = elem.offsetWidth / 1.4;
      var nmrgl = this.props.padder > 0 ? nwidh / 5 + this.props.padder * 8 : nwidh / 5;
      return this.setState({
        wrapper: {
          width: nwidh + 'px',
          marginLeft: nmrgl + 'px',
          marginTop: this.props.padder * 8 + 'px',
          zIndex: 5
        }
      });
    }
  };

  _proto.componentWillReceiveProps = function componentWillReceiveProps(props, next) {
    setTimeout(function () {
      this.updateDimensions();
    }.bind(this), 50);
  };

  _proto.componentDidMount = function componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions();
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  };

  _proto.lowerZindex = function lowerZindex(e) {
    var sty = this.state.wrapper;

    if (sty.zIndex === 8) {
      var newState = {
        wrapper: Object.assign({}, sty, {
          zIndex: 5
        })
      };
      return this.setState(newState);
    }
  };

  _proto.raiseZindex = function raiseZindex(e) {
    var sty = this.state.wrapper;

    if (sty.zIndex === 5) {
      var newState = {
        wrapper: Object.assign({}, sty, {
          zIndex: 8
        })
      };
      return this.setState(newState);
    }
  };

  _proto.render = function render() {
    var _this2 = this;

    var duratH = moment.duration(this.props.item.duration._milliseconds, 'Milliseconds').humanize();
    var duratL = moment(this.props.item.startDateTime).format("HH:mm");
    var duratE = moment(this.props.item.endDateTime).format("HH:mm");
    return /*#__PURE__*/React.createElement("div", {
      style: this.state.wrapper,
      className: "agenda-cell-item",
      onMouseEnter: this.raiseZindex,
      onMouseLeave: this.lowerZindex
    }, /*#__PURE__*/React.createElement("div", {
      className: "agenda-controls-item",
      style: this.state.controls
    }, this.props.edit ? /*#__PURE__*/React.createElement("div", {
      className: "agenda-edit-event"
    }, /*#__PURE__*/React.createElement("a", {
      onClick: function onClick() {
        return _this2.props.edit(_this2.props.item);
      },
      className: "agenda-edit-modele"
    }, /*#__PURE__*/React.createElement("i", {
      className: "edit-item-icon"
    }))) : '', this.props.remove ? /*#__PURE__*/React.createElement("div", {
      className: "agenda-delete-event"
    }, /*#__PURE__*/React.createElement("a", {
      onClick: function onClick() {
        return _this2.props.remove(_this2.props.item);
      },
      className: "agenda-delete-modele"
    }, /*#__PURE__*/React.createElement("i", {
      className: "remove-item-icon"
    }))) : ''), /*#__PURE__*/React.createElement("div", {
      className: "agenda-item-description"
    }, /*#__PURE__*/React.createElement("section", null, this.props.item.name), /*#__PURE__*/React.createElement("small", null, ", ", duratL, " - ", duratE, " , ", /*#__PURE__*/React.createElement(HumanizeDuration, {
      duration: this.props.item.duration._milliseconds,
      largest: 2,
      round: true
    }))));
  };

  return ReactAgendaItem;
}(Component);
ReactAgendaItem.propTypes = {
  parent: PropTypes.string,
  item: PropTypes.object,
  padder: PropTypes.number,
  edit: PropTypes.func,
  remove: PropTypes.func
};
ReactAgendaItem.defaultProps = {
  parent: 'body',
  item: {},
  padder: 0
};

var DragDropTouch;

(function (DragDropTouch_1) {

  var DataTransfer = function () {
    function DataTransfer() {
      this._dropEffect = 'move';
      this._effectAllowed = 'all';
      this._data = {};
    }

    Object.defineProperty(DataTransfer.prototype, "dropEffect", {
      get: function get() {
        return this._dropEffect;
      },
      set: function set(value) {
        this._dropEffect = value;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DataTransfer.prototype, "effectAllowed", {
      get: function get() {
        return this._effectAllowed;
      },
      set: function set(value) {
        this._effectAllowed = value;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DataTransfer.prototype, "types", {
      get: function get() {
        return Object.keys(this._data);
      },
      enumerable: true,
      configurable: true
    });

    DataTransfer.prototype.clearData = function (type) {
      if (type != null) {
        delete this._data[type];
      } else {
        this._data = null;
      }
    };

    DataTransfer.prototype.getData = function (type) {
      return this._data[type] || '';
    };

    DataTransfer.prototype.setData = function (type, value) {
      this._data[type] = value;
    };

    DataTransfer.prototype.setDragImage = function (img, offsetX, offsetY) {
      var ddt = DragDropTouch._instance;
      ddt._imgCustom = img;
      ddt._imgOffset = {
        x: offsetX,
        y: offsetY
      };
    };

    return DataTransfer;
  }();

  DragDropTouch_1.DataTransfer = DataTransfer;

  var DragDropTouch = function () {
    function DragDropTouch() {
      this._lastClick = 0;

      if (DragDropTouch._instance) {
        throw 'DragDropTouch instance already created.';
      }

      if ('ontouchstart' in document) {
        var d = document,
            ts = this._touchstart.bind(this),
            tm = this._touchmove.bind(this),
            te = this._touchend.bind(this);

        d.addEventListener('touchstart', ts);
        d.addEventListener('touchmove', tm);
        d.addEventListener('touchend', te);
        d.addEventListener('touchcancel', te);
      }
    }

    DragDropTouch.getInstance = function () {
      return DragDropTouch._instance;
    };

    DragDropTouch.prototype._touchstart = function (e) {
      var _this = this;

      if (this._shouldHandle(e)) {
        if (Date.now() - this._lastClick < DragDropTouch._DBLCLICK) {
          if (this._dispatchEvent(e, 'dblclick', e.target)) {
            e.preventDefault();

            this._reset();

            return;
          }
        }

        this._reset();

        var src = this._closestDraggable(e.target);

        if (src) {
          if (!this._dispatchEvent(e, 'mousemove', e.target) && !this._dispatchEvent(e, 'mousedown', e.target)) {
            this._dragSource = src;
            this._ptDown = this._getPoint(e);
            this._lastTouch = e;
            e.preventDefault();
            setTimeout(function () {
              if (_this._dragSource == src && _this._img == null) {
                if (_this._dispatchEvent(e, 'contextmenu', src)) {
                  _this._reset();
                }
              }
            }, DragDropTouch._CTXMENU);
          }
        }
      }
    };

    DragDropTouch.prototype._touchmove = function (e) {
      if (this._shouldHandle(e)) {
        var target = this._getTarget(e);

        if (this._dispatchEvent(e, 'mousemove', target)) {
          this._lastTouch = e;
          e.preventDefault();
          return;
        }

        if (this._dragSource && !this._img) {
          var delta = this._getDelta(e);

          if (delta > DragDropTouch._THRESHOLD) {
            this._dispatchEvent(e, 'dragstart', this._dragSource);

            this._createImage(e);

            this._dispatchEvent(e, 'dragenter', target);
          }
        }

        if (this._img) {
          this._lastTouch = e;
          e.preventDefault();

          if (target != this._lastTarget) {
            this._dispatchEvent(this._lastTouch, 'dragleave', this._lastTarget);

            this._dispatchEvent(e, 'dragenter', target);

            this._lastTarget = target;
          }

          this._moveImage(e);

          this._dispatchEvent(e, 'dragover', target);
        }
      }
    };

    DragDropTouch.prototype._touchend = function (e) {
      if (this._shouldHandle(e)) {
        if (this._dispatchEvent(this._lastTouch, 'mouseup', e.target)) {
          e.preventDefault();
          return;
        }

        if (!this._img) {
          this._dragSource = null;

          this._dispatchEvent(this._lastTouch, 'click', e.target);

          this._lastClick = Date.now();
        }

        this._destroyImage();

        if (this._dragSource) {
          if (e.type.indexOf('cancel') < 0) {
            this._dispatchEvent(this._lastTouch, 'drop', this._lastTarget);
          }

          this._dispatchEvent(this._lastTouch, 'dragend', this._dragSource);

          this._reset();
        }
      }
    };

    DragDropTouch.prototype._shouldHandle = function (e) {
      return e && !e.defaultPrevented && e.touches && e.touches.length < 2;
    };

    DragDropTouch.prototype._reset = function () {
      this._destroyImage();

      this._dragSource = null;
      this._lastTouch = null;
      this._lastTarget = null;
      this._ptDown = null;
      this._dataTransfer = new DataTransfer();
    };

    DragDropTouch.prototype._getPoint = function (e, page) {
      if (e && e.touches) {
        e = e.touches[0];
      }

      return {
        x: page ? e.pageX : e.clientX,
        y: page ? e.pageY : e.clientY
      };
    };

    DragDropTouch.prototype._getDelta = function (e) {
      var p = this._getPoint(e);

      return Math.abs(p.x - this._ptDown.x) + Math.abs(p.y - this._ptDown.y);
    };

    DragDropTouch.prototype._getTarget = function (e) {
      var pt = this._getPoint(e),
          el = document.elementFromPoint(pt.x, pt.y);

      while (el && getComputedStyle(el).pointerEvents == 'none') {
        el = el.parentElement;
      }

      return el;
    };

    DragDropTouch.prototype._createImage = function (e) {
      if (this._img) {
        this._destroyImage();
      }

      var src = this._imgCustom || this._dragSource;
      this._img = src.cloneNode(true);

      this._copyStyle(src, this._img);

      this._img.style.top = this._img.style.left = '-9999px';
      this._img.style['-webkit-transform'] = 'translateX(-9999px) translateY(-9999px)';

      if (!this._imgCustom) {
        var rc = src.getBoundingClientRect(),
            pt = this._getPoint(e);

        this._imgOffset = {
          x: pt.x - rc.left,
          y: pt.y - rc.top
        };
        this._img.style.opacity = DragDropTouch._OPACITY.toString();
      }

      this._moveImage(e);

      document.body.appendChild(this._img);
    };

    DragDropTouch.prototype._destroyImage = function () {
      if (this._img && this._img.parentElement) {
        this._img.parentElement.removeChild(this._img);
      }

      this._img = null;
      this._imgCustom = null;
    };

    DragDropTouch.prototype._moveImage = function (e) {
      var _this = this;

      requestAnimationFrame(function () {
        var pt = _this._getPoint(e, true),
            s = _this._img.style;

        s.position = 'fixed';
        s.pointerEvents = 'none';
        s.zIndex = '999999';
        s.top = s.left = '0px';
      });
    };

    DragDropTouch.prototype._copyProps = function (dst, src, props) {
      for (var i = 0; i < props.length; i++) {
        var p = props[i];
        dst[p] = src[p];
      }
    };

    DragDropTouch.prototype._copyStyle = function (src, dst) {
      DragDropTouch._rmvAtts.forEach(function (att) {
        dst.removeAttribute(att);
      });

      if (src instanceof HTMLCanvasElement) {
        var cSrc = src,
            cDst = dst;
        cDst.width = cSrc.width;
        cDst.height = cSrc.height;
        cDst.getContext('2d').drawImage(cSrc, 0, 0);
      }

      var cs = getComputedStyle(src);

      for (var i = 0; i < cs.length; i++) {
        var key = cs[i];
        dst.style[key] = cs[key];
      }

      dst.style.pointerEvents = 'none';

      for (var i = 0; i < src.children.length; i++) {
        this._copyStyle(src.children[i], dst.children[i]);
      }
    };

    DragDropTouch.prototype._dispatchEvent = function (e, type, target) {
      if (e && target) {
        var evt = document.createEvent('Event'),
            t = e.touches ? e.touches[0] : e;
        evt.initEvent(type, true, true);
        evt.button = 0;
        evt.which = evt.buttons = 1;

        this._copyProps(evt, e, DragDropTouch._kbdProps);

        this._copyProps(evt, t, DragDropTouch._ptProps);

        evt.dataTransfer = this._dataTransfer;
        target.dispatchEvent(evt);
        return evt.defaultPrevented;
      }

      return false;
    };

    DragDropTouch.prototype._closestDraggable = function (e) {
      for (; e; e = e.parentElement) {
        if (e.hasAttribute('draggable')) {
          return e;
        }
      }

      return null;
    };

    DragDropTouch._instance = new DragDropTouch();
    DragDropTouch._THRESHOLD = 5;
    DragDropTouch._OPACITY = 0.5;
    DragDropTouch._DBLCLICK = 500;
    DragDropTouch._CTXMENU = 900;
    DragDropTouch._rmvAtts = 'id,class,style,draggable'.split(',');
    DragDropTouch._kbdProps = 'altKey,ctrlKey,metaKey,shiftKey'.split(',');
    DragDropTouch._ptProps = 'pageX,pageY,clientX,clientY,screenX,screenY'.split(',');
    return DragDropTouch;
  }();

  DragDropTouch_1.DragDropTouch = DragDropTouch;
})(DragDropTouch || (DragDropTouch = {}));

var startSelect;
var endSelect;
var isDragging = false;
var draggedElement;
var timeNow = moment();
var ctrlKey = false;
var DEFAULT_ITEM = {
  name: "",
  classes: "",
  cellRefs: []
};
var mouse = {
  x: 0,
  y: 0,
  startX: 0,
  startY: 0
};
var element = null;
var helper = null;

var ReactAgenda = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ReactAgenda, _Component);

  function ReactAgenda(props) {
    var _this;

    _this = _Component.call(this, props) || this;
    _this.state = {
      date: moment(),
      items: {},
      itemOverlayStyles: {},
      highlightedCells: [],
      numberOfDays: 4,
      autoScaleNumber: 0,
      focusedCell: null
    };
    _this.handleBeforeUpdate = _this.handleBeforeUpdate.bind(_assertThisInitialized(_this));
    _this.handleOnNextButtonClick = _this.handleOnNextButtonClick.bind(_assertThisInitialized(_this));
    _this.handleOnPrevButtonClick = _this.handleOnPrevButtonClick.bind(_assertThisInitialized(_this));
    _this.handleMouseClick = _this.handleMouseClick.bind(_assertThisInitialized(_this));
    _this.handleMouseOver = _this.handleMouseOver.bind(_assertThisInitialized(_this));
    _this.removeSelection = _this.removeSelection.bind(_assertThisInitialized(_this));
    _this.handleAllClickStarts = _this.handleAllClickStarts.bind(_assertThisInitialized(_this));
    _this.handleAllClickEnds = _this.handleAllClickEnds.bind(_assertThisInitialized(_this));
    _this.onDragStart = _this.onDragStart.bind(_assertThisInitialized(_this));
    _this.onDragEnter = _this.onDragEnter.bind(_assertThisInitialized(_this));
    _this.onDragOver = _this.onDragOver.bind(_assertThisInitialized(_this));
    _this.onDragEnd = _this.onDragEnd.bind(_assertThisInitialized(_this));
    _this.onDragHandlerStart = _this.onDragHandlerStart.bind(_assertThisInitialized(_this));
    _this.onDragHandlerEnd = _this.onDragHandlerEnd.bind(_assertThisInitialized(_this));
    _this.getSelection = _this.getSelection.bind(_assertThisInitialized(_this));
    _this.editEvent = _this.editEvent.bind(_assertThisInitialized(_this));
    _this.removeEvent = _this.removeEvent.bind(_assertThisInitialized(_this));
    _this.dragEvent = _this.dragEvent.bind(_assertThisInitialized(_this));
    _this.duplicateEvent = _this.duplicateEvent.bind(_assertThisInitialized(_this));
    _this.resizeEvent = _this.resizeEvent.bind(_assertThisInitialized(_this));
    _this.updateDimensions = _this.updateDimensions.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = ReactAgenda.prototype;

  _proto.componentWillMount = function componentWillMount() {
    this.handleBeforeUpdate(this.props);

    if (this.props.autoScale) {
      window.removeEventListener("resize", this.updateDimensions);
    }

    if (this.props.locale && this.props.locale != "en") {
      moment.locale(this.props.locale);
    }
  };

  _proto.componentWillReceiveProps = function componentWillReceiveProps(props) {
    this.handleBeforeUpdate(props);
  };

  _proto.componentDidMount = function componentDidMount() {
    if (this.props.autoScale) {
      window.addEventListener("resize", this.updateDimensions);
      this.updateDimensions();
    }
  };

  _proto.updateDimensions = function updateDimensions() {
    var width = Math.round(document.getElementById("agenda-wrapper").offsetWidth / 150 - 1);
    this.setState({
      autoScaleNumber: width,
      numberOfDays: width
    });
  };

  _proto.getHeaderColumns = function getHeaderColumns() {
    var cols = [];

    for (var i = 0; i < this.state.numberOfDays; i++) {
      cols.push(moment(this.state.date).add(i, "days").toDate());
    }

    return cols;
  };

  _proto.getBodyRows = function getBodyRows() {
    var rows = [];
    var interval = 60 / this.props.rowsPerHour;

    if (this.props.startAtTime && typeof this.props.startAtTime === "number") {
      for (var i = 0; i < 24 * this.props.rowsPerHour; i++) {
        if (this.props.endAtTime != 0 && (this.props.endAtTime - this.props.startAtTime) * this.props.rowsPerHour >= i) {
          rows.push(moment(this.state.date).hours(this.props.startAtTime).minutes(0).seconds(0).milliseconds(0).add(Math.floor(i * interval), "minutes"));
        }
      }

      return rows;
    }

    for (var i = 0; i < 24 * this.props.rowsPerHour; i++) {
      rows.push(moment(this.state.date).hours(7).minutes(0).seconds(0).milliseconds(0).add(Math.floor(i * interval), "minutes"));
    }

    return rows;
  };

  _proto.getMinuteCells = function getMinuteCells(rowMoment) {
    var cells = [];

    for (var i = 0; i < this.state.numberOfDays; i++) {
      var cellRef = moment(rowMoment).add(i, "days").format("YYYY-MM-DDTHH:mm:ss");
      cells.push({
        cellRef: cellRef,
        item: this.state.items[cellRef] || DEFAULT_ITEM
      });
    }

    return cells;
  };

  _proto.handleBeforeUpdate = function handleBeforeUpdate(props) {
    if (props.hasOwnProperty("startDate") && props.startDate !== this.state.date.toDate()) {
      this.setState({
        date: moment(props.startDate)
      });
    }

    if (props.hasOwnProperty("items")) {
      this.setState({
        items: mapItems(props.items, props.rowsPerHour)
      });
    }

    if (props.hasOwnProperty("numberOfDays") && props.numberOfDays !== this.state.numberOfDays && !this.props.autoScale) {
      this.setState({
        numberOfDays: props.numberOfDays
      });
    }

    if (props.hasOwnProperty("minDate") && (!this.state.hasOwnProperty("minDate") || props.minDate !== this.state.minDate.toDate())) {
      this.setState({
        minDate: moment(props.minDate)
      });
    }

    if (props.hasOwnProperty("maxDate") && (!this.state.hasOwnProperty("maxDate") || props.maxDate !== this.state.maxDate.toDate())) {
      this.setState({
        maxDate: moment(props.maxDate)
      });
    }
  };

  _proto.handleOnNextButtonClick = function handleOnNextButtonClick() {
    var nextStartDate = moment(this.state.date).add(this.state.numberOfDays, "days");

    if (this.state.hasOwnProperty("maxDate")) {
      nextStartDate = moment.min(nextStartDate, this.state.maxDate);
    }

    var newStart = nextStartDate;
    var newEnd = moment(newStart).add(this.state.numberOfDays - 1, "days");

    if (nextStartDate !== this.state.date) {
      this.setState({
        date: nextStartDate
      });
    }

    if (this.props.onDateRangeChange) {
      this.props.onDateRangeChange(newStart.startOf("day").toDate(), newEnd.endOf("day").toDate());
    }
  };

  _proto.handleOnPrevButtonClick = function handleOnPrevButtonClick() {
    var prevStartDate = moment(this.state.date).subtract(this.state.numberOfDays, "days");

    if (this.state.hasOwnProperty("minDate")) {
      prevStartDate = moment.max(prevStartDate, this.state.minDate);
    }

    var newStart = prevStartDate;
    var newEnd = moment(newStart).add(this.state.numberOfDays - 1, "days");

    if (prevStartDate !== this.state.date) {
      this.setState({
        date: prevStartDate
      });
    }

    if (this.props.onDateRangeChange) {
      this.props.onDateRangeChange(newStart.toDate(), newEnd.toDate());
    }
  };

  _proto.handleMouseClick = function handleMouseClick(cell, bypass) {
    if (typeof cell != "string" && cell.tagName) {
      var dt = moment(cell.innerText, ["h:mm A"]).format("HH");
      var old = parseInt(dt);
      var now = new Date();
      var newdate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), old + 1, 0);
      var mom = newdate.toISOString().substring(0, newdate.toISOString().length - 5);

      if (this.props.onCellSelect) {
        return this.props.onCellSelect(mom, bypass);
      }
    }

    if (this.props.onCellSelect) {
      this.props.onCellSelect(cell, bypass);
    }
  };

  _proto.setMousePosition = function setMousePosition(e) {
    var ev = e || window.event;
    mouse.x = ev.pageX;
    mouse.y = ev.pageY;
  };

  _proto.handleMouseOver = function handleMouseOver(e) {
    this.setMousePosition(e);

    if (e.buttons === 0) {
      return false;
    }

    e.preventDefault ? e.preventDefault() : e.returnValue = false;
    this.removeSelection();

    if (element) {
      element.style.width = Math.abs(mouse.x - mouse.startX) + "px";
      element.style.height = Math.abs(mouse.y - mouse.startY) + "px";
      element.style.left = mouse.x - mouse.startX < 0 ? mouse.x + "px" : mouse.startX + "px";
      element.style.top = mouse.y - mouse.startY < 0 ? mouse.y + "px" : mouse.startY + "px";
    }

    if (helper) {
      helper.style.left = mouse.x + "px";
      helper.style.top = mouse.y + "px";

      if (e.target.classList.contains("agenda__cell") && !e.target.classList.contains("--time")) {
        var strt = moment(startSelect);
        var endd = moment(e.target.id);
        helper.innerHTML = endd.diff(strt) > 0 ? strt.format("LT") + " -- " + endd.format("LT") : endd.format("LT") + " -- " + strt.format("LT");
      }
    }
  };

  _proto.removeSelection = function removeSelection() {
    var old = document.getElementsByClassName("agenda__cell_selected");

    for (var i = old.length - 1; i >= 0; --i) {
      if (old[i]) {
        old[i].classList.remove("agenda__cell_selected");
      }
    }
  };

  _proto.handleAllClickStarts = function handleAllClickStarts(e, n) {
    this.removeSelection();

    if (e.target.classList.contains("--time") || e.target.classList.contains("--time-now") && !isDragging) {
      return this.handleMouseClick(e.target);
    }

    if (e.target.classList.contains("agenda__cell") && !e.target.classList.contains("--time") && !isDragging) {
      this.removeSelection();
      e.target.classList.toggle("agenda__cell_selected");
      startSelect = e.target.id;

      if (e.buttons === 0) {
        return false;
      }

      this.handleMouseClick(e.target.id);
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
      element = document.createElement("div");
      element.className = "rectangle";
      element.style.left = mouse.x + "px";
      element.style.top = mouse.y + "px";
      document.body.appendChild(element);

      if (this.props.helper) {
        helper = document.createElement("div");
        helper.className = "helper-reactangle";
        document.body.appendChild(helper);
      }
    }
  };

  _proto.handleAllClickEnds = function handleAllClickEnds(e, n) {
    isDragging = false;
    endSelect = e.target.id;
    var old = document.getElementsByClassName("rectangle");
    var old2 = document.getElementsByClassName("helper-reactangle");

    for (var i = old.length - 1; i >= 0; --i) {
      if (old[i]) {
        old[i].remove();
      }
    }

    for (var i = old2.length - 1; i >= 0; --i) {
      if (old2[i]) {
        old2[i].remove();
      }
    }

    element = null;
    helper = null;

    if (startSelect && endSelect && startSelect != endSelect) {
      return this.getSelection(startSelect, endSelect);
    }
  };

  _proto.onDragStart = function onDragStart(e) {
    isDragging = true;
    e.dataTransfer.setData("text/html", e.target);
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setDragImage(e.target, 0, 0);
  };

  _proto.onDragEnter = function onDragEnter(e) {
    e.preventDefault();

    if (!isDragging) {
      this.removeSelection();
    }

    e.dataTransfer.dropEffect = "move";

    if (e.ctrlKey) {
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.dropEffect = "copy";
    }
  };

  _proto.onDragOver = function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.target.id === draggedElement) {
      return false;
    }

    if (e.ctrlKey) {
      e.dataTransfer.effectAllowed = "copy";
      ctrlKey = true;
    } else {
      e.dataTransfer.dropEffect = "move";
    }

    if (e.target.classList.contains("cell-item")) {
      return draggedElement = e.target.parentNode.parentNode.id;
    }

    if (e.target.classList.contains("handler")) {
      return draggedElement = e.target.parentNode.id;
    }

    if (e.target.classList.contains("dragDiv")) {
      return draggedElement = e.target.parentNode.id;
    }

    draggedElement = e.target.id;
  };

  _proto.dragEvent = function dragEvent(id, d) {
    if (!this.props.onChangeEvent) {
      return;
    }

    var date = d;
    var itm;

    if (!this.refs[d]) {
      return;
    }

    if (this.refs[d].tagName !== "TD") {
      date = this.refs[d].parentNode.id;
    }

    var items = this.props.items;

    if (id && date && items) {
      for (var i in items) {
        if (items[i]._id === id) {
          var start = moment(items[i].startDateTime);
          var end = moment(items[i].endDateTime);
          var duration = moment.duration(end.diff(start));
          var newdate = moment(date).subtract(duration % (60 / this.state.rowsPerHour));
          var newEnddate = moment(newdate).add(duration);
          items[i].startDateTime = new Date(newdate);
          items[i].endDateTime = new Date(newEnddate);
          itm = items[i];
          break;
        }
      }

      this.props.onChangeEvent(items, itm);
    }
  };

  _proto.duplicateEvent = function duplicateEvent(id, d) {
    var date = d;
    var itm;

    if (!this.refs[d]) {
      return;
    }

    if (this.refs[d].tagName !== "TD") {
      date = this.refs[d].parentNode.id;
    }

    var items = this.props.items;

    if (id && date && items) {
      for (var i in items) {
        if (items[i]._id === id) {
          itm = Object.assign({}, items[i], {
            _id: guid()
          });
          var start = moment(itm.startDateTime);
          var end = moment(itm.endDateTime);
          var duration = moment.duration(end.diff(start));
          var newdate = moment(date);
          var newEnddate = moment(newdate).add(duration);
          itm.startDateTime = new Date(newdate);
          itm.endDateTime = new Date(newEnddate);
          items.push(itm);

          if (this.props.onChangeEvent) {
            this.props.onChangeEvent(items, itm);
          }

          break;
        }
      }
    }
  };

  _proto.resizeEvent = function resizeEvent(id, date) {
    if (!this.props.onChangeDuration) {
      return;
    }

    var items = this.props.items;

    if (id && date && items) {
      for (var i in items) {
        if (items[i]._id === id) {
          var difference = new Date(date) - new Date(items[i].startDateTime);

          if (difference < 1) {
            var strt = new Date(items[i].startDateTime);
            items[i].endDateTime = new Date(strt.getFullYear(), strt.getMonth(), strt.getDate(), strt.getHours(), strt.getMinutes() + 15, 0);
            this.setState({
              items: items
            });
            return this.props.onChangeDuration(items, items[i]);
          }

          var newdate = moment(date);
          items[i].endDateTime = new Date(newdate);
          return this.props.onChangeDuration(items, items[i]);
        }
      }
    }
  };

  _proto.onDragEnd = function onDragEnd(e) {
    var newDate = draggedElement;

    if (ctrlKey) {
      this.duplicateEvent(e.target.id, newDate);
    } else {
      this.dragEvent(e.target.id, newDate);
    }

    isDragging = false;
    ctrlKey = false;
    draggedElement = "";
  };

  _proto.onDragHandlerStart = function onDragHandlerStart(e) {
    isDragging = true;
    e.dataTransfer.setData("text/html", e.target);
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.effectAllowed = "all";
  };

  _proto.onDragHandlerEnd = function onDragHandlerEnd(e, n) {
    if (typeof draggedElement === undefined || draggedElement === "") {
      return;
    }

    var item = e.target.id || e.target.offsetParent.id;

    if (this.refs[draggedElement] && this.refs[e.target.id] && this.refs[e.target.id].tagName === "DIV" && this.refs[draggedElement].tagName === "DIV") {
      item = e.target.id;
      draggedElement = this.refs[draggedElement].parentNode.id;
      return this.resizeEvent(item, draggedElement);
    }

    if (draggedElement === "" && !this.refs[draggedElement] && this.refs[e.target.id].tagName === "DIV") {
      draggedElement = this.refs[e.target.id].parentNode.id;
      return;
    }

    if (!this.refs[draggedElement] && draggedElement) {
      var old = document.getElementById(draggedElement);
      draggedElement = old.parentNode.id;
    }

    this.resizeEvent(item, draggedElement);
    isDragging = false;
    draggedElement = "";
  };

  _proto.getSelection = function getSelection(start, end) {
    var strt = moment(start);
    var endd = moment(end);
    var arr = endd.diff(strt) > 0 ? [start, end] : [end, start];
    this.props.onRangeSelection(arr);
  };

  _proto.editEvent = function editEvent(props) {
    if (this.props.onItemEdit) {
      this.props.onItemEdit(props, true);
    }
  };

  _proto.removeEvent = function removeEvent(item) {
    var items = this.props.items;
    var newItems = items.filter(function (el) {
      return el._id !== item._id;
    });

    if (this.props.onItemRemove) {
      this.props.onItemRemove(newItems, item);
    }
  };

  _proto.render = function render() {
    var renderHeaderColumns = function renderHeaderColumns(col, i) {
      var headerLabel = moment(col);
      headerLabel.locale(this.props.locale);
      return /*#__PURE__*/React.createElement("th", {
        ref: "column-" + (i + 1),
        key: "col-" + i,
        className: "agenda__cell --head"
      }, this.props.headFormat ? headerLabel.format(this.props.headFormat) : headerLabel.format("dddd DD MMM YY"));
    };

    var renderBodyRows = function renderBodyRows(row, i) {
      if (i % this.props.rowsPerHour === 0) {
        var ref = "hour-" + Math.floor(i / this.props.rowsPerHour);
        var timeLabel = moment(row);
        var differ = timeLabel.diff(timeNow, "minutes");
        timeLabel.locale(this.props.locale);
        return /*#__PURE__*/React.createElement("tr", {
          key: "row-" + i,
          ref: ref,
          draggable: false,
          className: "agenda__row   --hour-start"
        }, /*#__PURE__*/React.createElement("td", {
          className: differ <= 60 && differ >= 0 ? "disable-select agenda__cell --time-now" : "disable-select agenda__cell --time",
          rowSpan: this.props.rowsPerHour
        }, timeLabel.format("LT")), this.getMinuteCells(row).map(renderMinuteCells, this));
      } else {
        return /*#__PURE__*/React.createElement("tr", {
          key: "row-" + i
        }, this.getMinuteCells(row).map(renderMinuteCells, this));
      }
    };
    var Colors = this.props.itemColors;
    var ItemComponent = this.props.itemComponent ? this.props.itemComponent : ReactAgendaItem;

    var renderItemCells = function (cell, i) {
      var cellClasses = {
        agenda__cell: true
      };
      cell["item"].forEach(function (itm) {
        cellClasses[itm.classes] = true;
      });
      var classSet = classNames(cellClasses);
      var splt = classSet.split(" ");
      splt = splt.filter(function (i) {
        return !i.includes("agenda__cell");
      });
      splt = splt.filter(function (i) {
        return !i.includes("undefined");
      });
      var nwsplt = [];
      splt.forEach(function (value) {
        if (value.length > 0) {
          nwsplt.push(Colors[value]);
        }
      });
      var styles = {
        height: this.props.cellHeight + "px"
      };

      if (splt.length > 1) {
        if (nwsplt[1] === nwsplt[2]) {
          nwsplt.splice(1, 0, "rgb(255,255,255)");
        }

        nwsplt = nwsplt.join(" , ");
        styles = {
          background: "linear-gradient(-100deg," + nwsplt + ")",
          height: this.props.cellHeight + "px"
        };
      }

      var itemElement = cell.item.map(function (item, idx) {
        var last1 = getLast(item.cellRefs);
        var first1 = getFirst(item.cellRefs);

        if (first1 === cell.cellRef) {
          return /*#__PURE__*/React.createElement("div", {
            id: item._id,
            ref: cell.cellRef,
            key: idx,
            className: "dragDiv",
            onDragStart: this.onDragStart,
            onDragEnd: this.onDragEnd,
            draggable: "true"
          }, first1 === cell.cellRef ? /*#__PURE__*/React.createElement("i", {
            className: "drag-handle-icon",
            "aria-hidden": "true"
          }) : "", first1 === cell.cellRef ? /*#__PURE__*/React.createElement(ItemComponent, {
            item: item,
            parent: cell.cellRef,
            itemColors: Colors,
            edit: this.props.onItemEdit ? this.editEvent : null,
            remove: this.props.onItemRemove ? this.removeEvent : null,
            days: this.props.numberOfDays
          }) : "");
        }

        if (last1 === cell.cellRef && this.props.onChangeDuration) {
          return /*#__PURE__*/React.createElement("div", {
            className: "handler",
            style: {
              marginLeft: 8 * (idx + 1) + "px"
            },
            id: item._id,
            key: item._id,
            onDragStart: this.onDragHandlerStart,
            onDragEnd: this.onDragHandlerEnd,
            draggable: "true"
          }, /*#__PURE__*/React.createElement("i", {
            className: "resize-handle-icon"
          }));
        }

        return "";
      }.bind(this));
      return /*#__PURE__*/React.createElement("td", {
        ref: cell.cellRef,
        key: "cell-" + i,
        className: classSet,
        style: styles,
        id: cell.cellRef
      }, itemElement);
    }.bind(this);

    var renderMinuteCells = function renderMinuteCells(cell, i) {
      if (cell.item[0] && !cell.item._id) {
        return renderItemCells(cell, i);
      }

      var cellClasses = {
        agenda__cell: true
      };
      cellClasses[cell.item.classes] = true;

      if (cell.item.cellRefs) {
        var last = getLast(cell.item.cellRefs);
        var first = getFirst(cell.item.cellRefs);
      }

      var classSet = classNames(cellClasses);
      var splt = classSet.split(" ");
      splt = splt.filter(function (i) {
        return !i.includes("agenda__cell");
      });
      splt = splt.filter(function (i) {
        return !i.includes("undefined");
      });
      var nwsplt = [];
      splt.forEach(function (value) {
        if (value.length > 0) {
          nwsplt.push(Colors[value]);
        }
      });
      var styles = {
        height: this.props.cellHeight + "px"
      };

      if (splt.length > 1) {
        nwsplt = nwsplt.join(" , ");
        styles = {
          background: "linear-gradient(to left," + nwsplt + ")",
          height: this.props.cellHeight + "px"
        };
      }

      if (splt.length == 1) {
        styles = {
          background: nwsplt[0],
          height: this.props.cellHeight + "px"
        };
      }

      return /*#__PURE__*/React.createElement("td", {
        ref: cell.cellRef,
        key: "cell-" + i,
        className: classSet,
        style: styles,
        id: cell.cellRef
      }, first === cell.cellRef ? /*#__PURE__*/React.createElement("div", {
        id: cell.item._id,
        ref: cell.item._id,
        className: "dragDiv",
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd,
        draggable: "true"
      }, first === cell.cellRef && this.props.onChangeEvent ? /*#__PURE__*/React.createElement("i", {
        className: "drag-handle-icon",
        "aria-hidden": "true"
      }) : "", first === cell.cellRef ? /*#__PURE__*/React.createElement(ItemComponent, {
        item: cell.item,
        parent: cell.cellRef,
        itemColors: Colors,
        edit: this.props.onItemEdit ? this.editEvent : null,
        remove: this.props.onItemRemove ? this.removeEvent : null,
        days: this.props.numberOfDays
      }) : "") : "", last === cell.cellRef && this.props.onChangeDuration ? /*#__PURE__*/React.createElement("div", {
        className: "handler",
        id: cell.item._id,
        onDragStart: this.onDragHandlerStart,
        onDragEnd: this.onDragHandlerEnd,
        draggable: "true"
      }, /*#__PURE__*/React.createElement("i", {
        className: "resize-handle-icon"
      })) : "");
    };

    var disablePrev = function disablePrev(state) {
      if (!state.hasOwnProperty("minDate")) {
        return false;
      }

      return state.date.toDate().getTime() === state.minDate.toDate().getTime();
    };

    var disableNext = function disableNext(state) {
      if (!state.hasOwnProperty("maxDate")) {
        return false;
      }

      return state.date.toDate().getTime() === state.maxDate.toDate().getTime();
    };

    return /*#__PURE__*/React.createElement("div", {
      className: "agenda",
      id: "agenda-wrapper"
    }, /*#__PURE__*/React.createElement("div", {
      className: "agenda__table --header"
    }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      ref: "column-0",
      className: "agenda__cell --controls"
    }, /*#__PURE__*/React.createElement("div", {
      className: "agenda-controls-layout"
    }, /*#__PURE__*/React.createElement("button", {
      className: "agenda__prev" + (disablePrev(this.state) ? " --disabled" : ""),
      onClick: this.handleOnPrevButtonClick
    }), /*#__PURE__*/React.createElement("button", {
      className: "agenda__next" + (disableNext(this.state) ? " --disabled" : ""),
      onClick: this.handleOnNextButtonClick
    }))), this.getHeaderColumns(this.props.view).map(renderHeaderColumns, this))))), /*#__PURE__*/React.createElement("div", {
      ref: "agendaScrollContainer",
      className: "agenda__table --body",
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("table", {
      cellSpacing: "0",
      cellPadding: "0"
    }, /*#__PURE__*/React.createElement("tbody", null, this.getBodyRows().map(renderBodyRows, this)))));
  };

  return ReactAgenda;
}(Component);
ReactAgenda.propTypes = {
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  startDate: PropTypes.instanceOf(Date),
  startAtTime: PropTypes.number,
  endAtTime: PropTypes.number,
  cellHeight: PropTypes.number,
  view: PropTypes.string,
  locale: PropTypes.string,
  items: PropTypes.array,
  helper: PropTypes.bool,
  itemComponent: PropTypes.element,
  numberOfDays: PropTypes.number,
  headFormat: PropTypes.string,
  rowsPerHour: PropTypes.number,
  itemColors: PropTypes.object,
  fixedHeader: PropTypes.bool,
  autoScaleNumber: PropTypes.bool
};
ReactAgenda.defaultProps = {
  minDate: new Date(),
  maxDate: new Date(new Date().getFullYear(), new Date().getMonth() + 3),
  startDate: new Date(),
  startAtTime: 0,
  endAtTime: 0,
  cellHeight: 15,
  view: "agenda",
  locale: "en",
  helper: true,
  items: [],
  autoScale: false,
  itemComponent: ReactAgendaItem,
  numberOfDays: 4,
  headFormat: "ddd DD MMM",
  rowsPerHour: 4,
  itemColors: {
    "color-1": "rgba(102, 195, 131 , 1)",
    "color-2": "rgba(242, 177, 52, 1)",
    "color-3": "rgba(235, 85, 59, 1)",
    "color-4": "rgba(70, 159, 213, 1)"
  },
  fixedHeader: true
};

var now = new Date();

var ReactAgendaCtrl = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ReactAgendaCtrl, _Component);

  function ReactAgendaCtrl() {
    var _this;

    _this = _Component.call(this) || this;
    _this.state = {
      editMode: false,
      showCtrl: false,
      multiple: {},
      name: '',
      classes: 'priority-1',
      startDateTime: now,
      endDateTime: now
    };
    _this.handleDateChange = _this.handleDateChange.bind(_assertThisInitialized(_this));
    _this.addEvent = _this.addEvent.bind(_assertThisInitialized(_this));
    _this.updateEvent = _this.updateEvent.bind(_assertThisInitialized(_this));
    _this.dispatchEvent = _this.dispatchEvent.bind(_assertThisInitialized(_this));
    _this.handleSubmit = _this.handleSubmit.bind(_assertThisInitialized(_this));
    _this.handleEdit = _this.handleEdit.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = ReactAgendaCtrl.prototype;

  _proto.componentDidMount = function componentDidMount() {
    if (this.props.itemColors) {
      this.setState({
        classes: Object.keys(this.props.itemColors)[0]
      });
    }

    setTimeout(function () {
      if (this.refs.eventName) {
        this.refs.eventName.focus();
      }
    }.bind(this), 50);

    if (!this.props.selectedCells) {
      var start = now;
      var endT = moment(now).add(15, 'Minutes');
      return this.setState({
        editMode: false,
        name: '',
        startDateTime: start,
        endDateTime: endT
      });
    }

    if (this.props.selectedCells && this.props.selectedCells[0] && this.props.selectedCells[0]._id) {
      var _start = moment(this.props.selectedCells[0].startDateTime);

      var _endT = moment(this.props.selectedCells[0].endDateTime);

      return this.setState({
        editMode: true,
        name: this.props.selectedCells[0].name,
        classes: this.props.selectedCells[0].classes,
        startDateTime: _start,
        endDateTime: _endT
      });
    }

    if (this.props.selectedCells && this.props.selectedCells.length === 1) {
      var _start2 = moment(getFirst(this.props.selectedCells));

      var _endT2 = moment(getLast(this.props.selectedCells)).add(15, 'Minutes');

      return this.setState({
        editMode: false,
        name: '',
        startDateTime: _start2,
        endDateTime: _endT2
      });
    }

    if (this.props.selectedCells && this.props.selectedCells.length > 0) {
      var _start3 = moment(getFirst(this.props.selectedCells));

      var _endT3 = moment(getLast(this.props.selectedCells)) || now;

      this.setState({
        editMode: false,
        name: '',
        startDateTime: _start3,
        endDateTime: _endT3
      });
    }
  };

  _proto.handleChange = function handleChange(event) {
    if (event.target.tagName === 'BUTTON') {
      event.preventDefault();
    }

    var data = this.state;
    data[event.target.name] = event.target.value;
    this.setState(data);
  };

  _proto.handleDateChange = function handleDateChange(ev, date) {
    var endD = moment(this.state.endDateTime);
    var data = this.state;
    data[ev] = date;

    if (ev === 'startDateTime' && endD.diff(date) < 0) {
      data['endDateTime'] = moment(date).add(15, 'minutes');
    }

    this.setState(data);
  };

  _proto.dispatchEvent = function dispatchEvent(obj) {
    var newAdded = [];
    var items = this.props.items;

    if (obj['multiple']) {
      var array = obj['multiple'];
      Object.keys(array).forEach(function (key) {
        var newAr = array[key].filter(function (val, ind) {
          return array[key].indexOf(val) == ind;
        });
        var start = newAr[0];
        var endT = newAr[newAr.length - 1] || now;
        var lasobj = {
          _id: guid(),
          name: obj.name,
          startDateTime: new Date(start),
          endDateTime: new Date(endT),
          classes: obj.classes
        };
        items.push(lasobj);
        newAdded.push(lasobj);
      }.bind(this));
      return this.props.Addnew(items, newAdded);
    }

    obj._id = guid();
    items.push(obj);
    this.props.Addnew(items, obj);
  };

  _proto.addEvent = function addEvent(e) {
    if (this.state.name.length < 1) {
      return;
    }

    if (this.props.selectedCells && this.props.selectedCells.length > 0) {
      var obj = this.props.selectedCells.reduce(function (r, v, i, a, k) {
        if (k === void 0) {
          k = v.substring(0, 10);
        }

        return (r[k] = r[k] || []).push(v), r;
      }, {});

      if (Object.values(obj).length > 1) {
        var newObj = {
          name: this.state.name,
          startDateTime: new Date(this.state.startDateTime),
          endDateTime: new Date(this.state.endDateTime),
          classes: this.state.classes,
          multiple: obj
        };
        return this.dispatchEvent(newObj);
      }
    }

    var newObj = {
      name: this.state.name,
      startDateTime: new Date(this.state.startDateTime),
      endDateTime: new Date(this.state.endDateTime),
      classes: this.state.classes
    };
    this.dispatchEvent(newObj);
  };

  _proto.updateEvent = function updateEvent(e) {
    if (this.props.selectedCells[0]._id && this.props.items) {
      var newObj = {
        _id: this.props.selectedCells[0]._id,
        name: this.state.name,
        startDateTime: new Date(this.state.startDateTime),
        endDateTime: new Date(this.state.endDateTime),
        classes: this.state.classes
      };
      var items = this.props.items;

      for (var i = 0; i < items.length; i++) {
        if (items[i]._id === newObj._id) items[i] = newObj;
      }

      if (this.props.edit) {
        this.props.edit(items, newObj);
      }
    }
  };

  _proto.handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    this.addEvent(e);
  };

  _proto.handleEdit = function handleEdit(e) {
    e.preventDefault();
    this.updateEvent(e);
  };

  _proto.render = function render() {
    var itc = Object.keys(this.props.itemColors);
    var colors = itc.map(function (item, idx) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          background: this.props.itemColors[item]
        },
        className: "agendCtrls-radio-buttons",
        key: item
      }, /*#__PURE__*/React.createElement("button", {
        name: "classes",
        value: item,
        className: this.state.classes === item ? 'agendCtrls-radio-button--checked' : 'agendCtrls-radio-button',
        onClick: this.handleChange.bind(this)
      }));
    }.bind(this));
    var divStyle = {};

    if (this.state.editMode) {
      return /*#__PURE__*/React.createElement("div", {
        className: "agendCtrls-wrapper",
        style: divStyle
      }, /*#__PURE__*/React.createElement("form", {
        onSubmit: this.handleEdit
      }, /*#__PURE__*/React.createElement("div", {
        className: "agendCtrls-label-wrapper"
      }, /*#__PURE__*/React.createElement("div", {
        className: "agendCtrls-label-inline"
      }, /*#__PURE__*/React.createElement("label", null, "Event name"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        name: "name",
        autoFocus: true,
        ref: "eventName",
        className: "agendCtrls-event-input",
        value: this.state.name,
        onChange: this.handleChange.bind(this),
        placeholder: "Event Name"
      })), /*#__PURE__*/React.createElement("div", {
        className: "agendCtrls-label-inline "
      }, /*#__PURE__*/React.createElement("label", null, "Color"), /*#__PURE__*/React.createElement("div", {
        className: "agendCtrls-radio-wrapper"
      }, colors))), /*#__PURE__*/React.createElement("div", {
        className: "agendCtrls-timePicker-wrapper"
      }, /*#__PURE__*/React.createElement("div", {
        className: "agendCtrls-time-picker"
      }, /*#__PURE__*/React.createElement("label", null, "Start Date"), /*#__PURE__*/React.createElement(Rdate, {
        value: this.state.startDateTime,
        onChange: this.handleDateChange.bind(null, 'startDateTime'),
        input: false,
        viewMode: "time"
      })), /*#__PURE__*/React.createElement("div", {
        className: "agendCtrls-time-picker"
      }, /*#__PURE__*/React.createElement("label", null, "End Date"), /*#__PURE__*/React.createElement(Rdate, {
        value: this.state.endDateTime,
        onChange: this.handleDateChange.bind(null, 'endDateTime'),
        input: false,
        viewMode: "time"
      }))), /*#__PURE__*/React.createElement("input", {
        type: "submit",
        value: "Save"
      })));
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "agendCtrls-wrapper",
      style: divStyle
    }, /*#__PURE__*/React.createElement("form", {
      onSubmit: this.handleSubmit
    }, /*#__PURE__*/React.createElement("div", {
      className: "agendCtrls-label-wrapper"
    }, /*#__PURE__*/React.createElement("div", {
      className: "agendCtrls-label-inline"
    }, /*#__PURE__*/React.createElement("label", null, "Event name"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      ref: "eventName",
      autoFocus: true,
      name: "name",
      className: "agendCtrls-event-input",
      value: this.state.name,
      onChange: this.handleChange.bind(this),
      placeholder: "Event Name"
    })), /*#__PURE__*/React.createElement("div", {
      className: "agendCtrls-label-inline"
    }, /*#__PURE__*/React.createElement("label", null, "Color"), /*#__PURE__*/React.createElement("div", {
      className: "agendCtrls-radio-wrapper"
    }, colors))), /*#__PURE__*/React.createElement("div", {
      className: "agendCtrls-timePicker-wrapper"
    }, /*#__PURE__*/React.createElement("div", {
      className: "agendCtrls-time-picker"
    }, /*#__PURE__*/React.createElement("label", null, "Start Date"), /*#__PURE__*/React.createElement(Rdate, {
      value: this.state.startDateTime,
      onChange: this.handleDateChange.bind(null, 'startDateTime'),
      input: false,
      viewMode: "time"
    })), /*#__PURE__*/React.createElement("div", {
      className: "agendCtrls-time-picker"
    }, /*#__PURE__*/React.createElement("label", null, "End Date"), /*#__PURE__*/React.createElement(Rdate, {
      value: this.state.endDateTime,
      onChange: this.handleDateChange.bind(null, 'endDateTime'),
      input: false,
      viewMode: "time"
    }))), /*#__PURE__*/React.createElement("input", {
      type: "submit",
      value: "Save"
    })));
  };

  return ReactAgendaCtrl;
}(Component);
ReactAgendaCtrl.propTypes = {
  items: PropTypes.array,
  itemColors: PropTypes.object,
  selectedCells: PropTypes.array,
  edit: PropTypes.func,
  Addnew: PropTypes.func
};
ReactAgendaCtrl.defaultProps = {
  items: [],
  itemColors: {},
  selectedCells: []
};

var ModalView = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ModalView, _Component);

  function ModalView() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = ModalView.prototype;

  _proto.render = function render() {
    if (this.props.frameless) {
      return /*#__PURE__*/React.createElement("div", {
        className: "modal-nude  box-card"
      }, /*#__PURE__*/React.createElement("a", {
        onClick: this.props.closeFunc,
        className: "modal-close"
      }, "X"), /*#__PURE__*/React.createElement("div", {
        className: "modal-title"
      }, " ", this.props.title), this.props.children);
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "modal  box-card"
    }, /*#__PURE__*/React.createElement("a", {
      onClick: this.props.closeFunc,
      className: "modal-close"
    }, "X"), /*#__PURE__*/React.createElement("div", {
      className: "modal-title"
    }, " ", this.props.title), this.props.children);
  };

  return ModalView;
}(Component);

ModalView.propTypes = {
  title: PropTypes.string,
  frameless: PropTypes.bool,
  children: PropTypes.element,
  closeFunc: PropTypes.func
};
ModalView.defaultProps = {
  title: '',
  frameless: false
};

var Modal = /*#__PURE__*/function (_Component2) {
  _inheritsLoose(Modal, _Component2);

  function Modal(props) {
    var _this;

    _this = _Component2.call(this, props) || this;
    _this.clickedOutside = _this.clickedOutside.bind(_assertThisInitialized(_this));
    _this.closeFunc = _this.closeFunc.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto2 = Modal.prototype;

  _proto2.componentDidMount = function componentDidMount() {
    this.modalWrapperTarget = document.createElement('div');
    this.modalWrapperTarget.className = "modal-wrapper";
    this.modalWrapperTarget.addEventListener('click', this.clickedOutside);
    this.modalWrapperTarget.addEventListener('click', this.clickedOutside);
    this.modalWrapperTarget.addEventListener('keydown', this.clickedOutside, true);
    document.body.appendChild(this.modalWrapperTarget);

    this._render();
  };

  _proto2.clickedOutside = function clickedOutside(e) {
    if (e.key == 'Escape' || e.key == 'Esc' || e.keyCode == 27) {
      e.preventDefault();
      this.props.clickOutside(e);
      return false;
    }

    if (this.props.clickOutside && e.target.classList.contains('modal-wrapper')) {
      this.props.clickOutside(e);
    }
  };

  _proto2.closeFunc = function closeFunc(e) {
    if (this.props.clickOutside) {
      this.props.clickOutside(e);
    }
  };

  _proto2._render = function _render() {
    ReactDOM.render( /*#__PURE__*/React.createElement(ModalView, {
      children: this.props.children,
      closeFunc: this.closeFunc,
      title: this.props.title,
      frameless: this.props.frameless
    }), this.modalWrapperTarget);
  };

  _proto2.componentDidUpdate = function componentDidUpdate() {
    this._render();
  };

  _proto2.componentWillUnmount = function componentWillUnmount() {
    this.modalWrapperTarget.removeEventListener('click', this.clickedOutside);
    this.modalWrapperTarget.removeEventListener('keydown', this.clickedOutside);
    ReactDOM.unmountComponentAtNode(this.modalWrapperTarget);
    document.body.removeChild(this.modalWrapperTarget);
  };

  _proto2.render = function render() {
    return /*#__PURE__*/React.createElement("noscript", null);
  };

  return Modal;
}(Component);
Modal.propTypes = {
  title: PropTypes.string,
  frameless: PropTypes.bool,
  children: PropTypes.element,
  closeFunc: PropTypes.func
};
Modal.defaultProps = {
  title: '',
  frameless: false
};

module.exports = {
  ReactAgenda: ReactAgenda,
  ReactAgendaCtrl: ReactAgendaCtrl,
  guid: guid,
  getUnique: getUnique,
  getLast: getLast,
  getFirst: getFirst,
  Modal: Modal
};
//# sourceMappingURL=index.modern.js.map
