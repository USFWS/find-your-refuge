const debounce = require('debounce');
const emitter = require('../emitter');

const Search = function (opts) {
  this.input = opts.input;
  this.select = opts.select;
  this.radios = opts.radios;
  this.state = 'refuge';

  this.input.addEventListener('input', debounce(this.emitQuery.bind(this), 400));
  this.select.addEventListener('input', this.emitQuery.bind(this));
  this.radios.forEach((r) => r.addEventListener('click', (e) => this.toggleSearchInterface(e.target.value)));

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
    if (params.method) this.state = params.method;
  });
};

Search.prototype.emitQuery = function (e) {
  const query = e.target.value;
  if (!query.length) emitter.emit('clear:query');
  if (query.length) emitter.emit(`search:${this.state}`, query);
};

Search.prototype.toggleSearchInterface = function (state) {
  this.state = state;
  const value = this.state === 'state' ? this.select.value : this.input.value;
  emitter.emit(`search:${this.state}`, value);
  this.input.focus();
};

module.exports = Search;
