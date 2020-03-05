const debounce = require('debounce');
const emitter = require('../emitter');

const Search = function (opts) {
  this.input = opts.input;
  this.select = opts.select;
  this.radios = opts.radios;
  this.state = 'refuge';

  emitter.on('method', (method) => {
    const radioButton = this.radios.filter((r) => r.value === method);
    if (radioButton[0]) radioButton[0].click();
  });
  this.input.addEventListener('input', debounce(this.emitQuery.bind(this), 400));
  this.select.addEventListener('input', this.emitQuery.bind(this));
  this.radios.forEach((r) => r.addEventListener('click', this.toggleSearchInterface.bind(this)));

  // Analytics events
  this.input.addEventListener('input', debounce((e) => {
    emitter.emit('search:term', {
      query: e.target.value,
      type: this.state
    });
  }, 2500));

  // Select the appropriate radio button based on an updated query parameter
  emitter.on('update:search', (params) => {
    const radioButton = this.radios.filter((r) => r.value === params.method);
    if (radioButton[0]) radioButton[0].checked = true;
  });
};

Search.prototype.emitQuery = function (e) {
  const query = e.target.value;
  if (!query.length) emitter.emit('clear:query');
  const isRefuge = this.state === 'refuge';
  const isZip = this.state === 'zipcode';
  const isState = this.state === 'state';
  if (isRefuge || isState && query.length) emitter.emit(`search:${this.state}`, query);
  else if (isZip && query.length) emitter.emit('search:zipcode', query);
};

Search.prototype.toggleSearchInterface = function (e) {
  this.state = e.target.id;
  const value = this.state === 'state' ? this.select.value : this.input.value;
  emitter.emit(`search:${this.state}`, value);
  this.input.focus();
};

module.exports = Search;
