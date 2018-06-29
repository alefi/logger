'use strict';

const _ = require('lodash');
const assert = require('assert');
const { inspect } = require('util');
const levels = require('./levels');
const moment = require('moment');
const stringify = require('json-stringify-safe');
const transports = require('./transports');

const defaultConfig = require('./config/default');
const levelsList = _.sortBy( _.keys(levels), (a, b) => levels[ a ] > levels[ b ] );

let _config = null;
const configured = {
    containers: {},
    transports: []
};

/**
 * @throws {AssertionError} If module haven't configured properly
 */
function checkConfig () {
    assert(_config, 'configure module first: use static configure method');
}

/**
 * @param {String} label Logger's label
 * @throws {AssertionError} If label unspecified
 */
function checkLabel (label) {
    assert(_.isString(label), 'logger label is required but was not specified or has illegal format');
}

/**
 * Logger
 */
class Logger {

    /**
     * @param  {Object} [options] Common configuration options
     */
    static configure (options = {}) {
        if (_config) {
            return;
        }

        _config = _.defaults(options, defaultConfig);

        if (_config.dateFormat || _config.useTimezone) {
            _config.getTimestamp = () => {
                let datetime = moment();

                if (!_config.useTimezone) {
                    datetime = datetime.utc();
                }

                return datetime.format(_config.dateFormat);
            };
        }

        _.mapKeys(transports, (logFunc, name) => {
            if ( _config.transports.includes(name) ) {
                configured.transports.push(logFunc);
            }
        });
    }

    /**
     * @param {String} label Logger label
     * @param  {Object} [parentProps] Used at child creation only
     */
    constructor (label, parentProps = {}) {
        checkConfig();
        checkLabel(label);

        const preconfigured = _.get(configured.containers, label);

        if (preconfigured) {
            return preconfigured;
        }

        const logLevelIndex = levelsList.includes(_config.level)
            ? levelsList.indexOf(_config.level)
            : levelsList.length; // suppress logging if undetermined level was supplied

        _.reduce(levelsList, (proto, level, index) => {
            if (index >= logLevelIndex) {
                // Replaces dummies with real methods
                proto[ level ] = (message, meta) => {
                    const info = {
                        level,
                        message,
                        meta
                    };

                    if ( _.isObject(message) && _.isEmpty(meta) ) {
                        info.meta = message;
                        info.message = void(null);
                    }

                    this._log(info);
                };
            }

            return proto;
        }, this);

        this.ctx = parentProps.ctx || {};
        this.format = _.template(_config.logFormat);
        this.label = Logger._constructLabel(label, parentProps);
        this.tags = parentProps.tags || [];

        _.set(configured.containers, label, this);
    }

    /**
     * @param  {String} label Logger's label
     * @param  {Object} parentProps Parent logger properties
     * @return {String} label
     * @private
     */
    static _constructLabel (label, parentProps) {
        if ( _.isEmpty(parentProps) ) {
            const { applicationId } = _config;

            return _.compact([ applicationId, label ]).join('::');
        }

        return parentProps.label;
    }

    /**
     * @param {Object} meta Optional meta
     * @returns {String} shaped meta
     * @private
     */
    _constructMeta ({ meta }) {
        const _meta = Object.assign({}, meta);

        if ( !_.isEmpty(this.ctx) ) {
            _meta.ctx = this.ctx;
        }

        if ( !_.isEmpty(this.tags) ) {
            _meta.tags = this.tags;
        }

        const hasMeta = !_.isEmpty(_meta);
        let shapedMeta = '';

        if (hasMeta && _config.prettyPrint) {
            shapedMeta = stringify(_meta);
        } else if (hasMeta) {
            shapedMeta = inspect(_meta);
        }

        return shapedMeta;
    }

    /**
     * @returns {String} timestamp
     * @private
     */
    static _getTimestamp () { // eslint-disable-line consistent-return
        if (_config.timestamp) {
            if (_config.getTimestamp) {
                return _config.getTimestamp();
            }

            return new Date().toISOString();
        }
    }

    /**
     * @param {String} options.level Log level
     * @param {String} [options.message] Log message
     * @param {Object} [options.meta] Optional meta
     * @private
     */
    _log ({ level, message = '', meta = {} }) {
        const method = level === 'error' ? 'error' : 'log';
        const str = this.format({
            level,
            message,
            ctx: this.ctx,
            label: this.label,
            meta: this._constructMeta({ meta }),
            timestamp: Logger._getTimestamp()
        }).trim();

        configured.transports.forEach(transport => transport[ method ](str));
    }

    /**
     * @param  {String} label Logger label literal
     * @return {Object} child logger instance
     */
    child (label) {
        checkConfig();

        const parentProps = _.pick(this, [ 'ctx', 'label', 'tags' ]);

        parentProps.label = [ parentProps.label, label ].join('.');

        return new Logger(label, parentProps);
    }

    /**
     * @param  {Object}  ctx Logger's context data
     * @param  {Boolean} [override] Do entirely overrides the context or merges with existing one
     * @return {Object} this
     */
    context (ctx = {}, override = false) {
        if (override) {
            this.ctx = ctx;
        } else {
            this.ctx = _.merge(this.ctx, ctx);
        }

        return this;
    }

    /**
     * @param  {...String} args An array or positional arguments are supported
     * @return {Object} this
     */
    tag (...args) {
        this.tags = _.chain(this.tags)
            .concat(args)
            .flatten()
            .compact()
            .uniq()
            .value();

        return this;
    }
}

// Fills logger methods with dummies
_.reduce(levelsList, (proto, level) => {
    proto[ level ] = () => null;

    return proto;
}, Logger.prototype);

module.exports = Logger;
