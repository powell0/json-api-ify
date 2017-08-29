'use strict';

const async = require('async');
const joi = require('joi');
const _ = require('lodash');
const generateResourceHash = require('./generate-resource-hash');

module.exports = function(internal, resource, data, unvisited, cb) {
    let type;
    async.auto({
        validated: function(fn) {
            let schema = joi.object({
                id: joi.string(),
                type: joi.string().required(),
                attributes: joi.object(),
                relationships: joi.object(),
                links: joi.object(),
                meta: joi.object()
            }).required();

            joi.validate(resource, schema, {}, function(err) {
                if (err) {
                    return fn({
                        status: 400,
                        title: 'Invalid `resource` argument',
                        detail: err.message,
                        meta: {
                            resource: resource
                        }
                    });
                }
                fn();
            });
        },

        deserialize: ['validated', function(fn) {
            let deserialized = resource.attributes || {};
            type = resource.type;

            if (resource.id && _.isPlainObject(deserialized)) {
                let idParam = _.get(internal.types, type + '.default.id') || 'id';
                deserialized[idParam] = resource.id;
            }
            async.setImmediate(function() {
                fn(null, deserialized);
            });
        }],

        addToData: ['deserialize', function(fn, r) {
            const resourceHash = generateResourceHash(resource);

            // Save a reference to the deserialized resource in the list of unvisited resources
            unvisited[resourceHash] = r.deserialize;

            if (!_.has(data, type)) {
                data[type] = r.deserialize;
            } else if (!_.isArray(data[type])) {
                let member = data[type];
                data[type] = [];
                data[type].push.apply(data[type], [member, r.deserialize]);
            } else {
                data[type].push(r.deserialize);
            }
            fn();
        }]
    }, cb);
};
