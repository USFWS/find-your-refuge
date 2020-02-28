const L = require('leaflet');

const HoverMarker = L.Marker.extend({
  bindPopup(htmlContent, options) {
    if (options && options.showOnMouseOver) {
      L.Marker.prototype.bindPopup.apply(this, [htmlContent, options]);
      this.off('click', this.openPopup, this);

      this.on('mouseover', function (e) {
        const target = e.originalEvent.fromElement || e.originalEvent.relatedTarget;
        const parent = this.getParent(target, 'leaflet-popup');
        if (parent === this._popup._container) { return true; }
        this.openPopup();
      }, this);

      this.on('mouseout', function (e) {
        const target = e.originalEvent.toElement || e.originalEvent.relatedTarget;

        if (this.getParent(target, 'leaflet-popup')) {
          L.DomEvent.on(this._popup._container, 'mouseout', this.popupMouseOut, this);
          return true;
        }
        this.closePopup();
      }, this);
    }
  },

  popupMouseOut(e) {
    L.DomEvent.off(this._popup, 'mouseout', this.popupMouseOut, this);
    const target = e.toElement || e.relatedTarget;
    if (this.getParent(target, 'leaflet-popup')) { return true; }
    if (target === this._icon) { return true; }
    this.closePopup();
  },

  getParent(element, className) {
    let parent = element.parentNode;
    while (parent != null) {
      if (parent.className && L.DomUtil.hasClass(parent, className)) { return parent; }
      parent = parent.parentNode;
    }
    return false;
  },
});

module.exports = HoverMarker;
