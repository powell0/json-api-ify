'use strict';

const async = require('async');
const joi = require('joi');
const _ = require('lodash');
const generateResourceHash = require('./generate-resource-hash');

function wrapError(status, title, cb) {
    return function(err) {
        if (err) {
            return cb(_.extend({
                status: status,
                title: title,
            }, {detail: _.get(err, 'message')}));
        }
        let args = [];
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        cb.apply(null, args);
    };
}

function addToField(field, item, allowDuplicates, forceArray) {
    if (!field) {
        field = forceArray ? [item] : item;
    } else if (!_.isArray(field)) {
        const addItem = allowDuplicates || !_.matches(item)(field);

        if (addItem) {
            let member = field;
            field = [];
            field.push.apply(field, [member, item]);
        }
    } else {
        const addItem = allowDuplicates || !_.find(field, item);

        if (addItem) {
            field.push(item);
        }
    }

    return field;
}

function findInField(field, identifier) {
    let result;

    if (_.isArray(field)) {
        result = _.find(field, identifier);
    } else {
        result = field;
    }

    return result;
}

module.exports = function ProcessRelationships(internal, resource, included, unvisited, data, cb) {
    async.auto({
        validated: function(fn) {
            let dataSchema = joi.object({
                id: joi.string().required(),
                type: joi.string().required(),
                attributes: joi.object(),
                links: joi.object(),
                meta: joi.object()
            }).unknown(false);
            let relationshipSchema = joi.object({
                data: joi.alternatives().try(
                    dataSchema,
                    joi.array().items(dataSchema)
                ).allow(null)
            }).unknown(true).required();
            let relationshipsSchema = joi.object().pattern(/^\w+$/, relationshipSchema);

            if (resource.relationships && !_.isEmpty(resource.relationships)) {
                joi.validate(resource.relationships, relationshipsSchema, {}, wrapError(400, 'Invalid Relationship', fn));
            } else {
                fn();
            }
        },

        deserialized: ['validated', function(fn) {
            // generate the hash of the resource
            const resourceHash = generateResourceHash(resource);

            // If this resource has already been visited, do not visit it again
            // If it has not been visited, mark it as visited
            const entityData = unvisited[resourceHash];

            if (!entityData) {
                return fn();
            } else {
                delete unvisited[resourceHash];
            }

            async.eachOfSeries(resource.relationships, function(relationship, relationshipName, _fn) {


                async.eachSeries(_.castArray(relationship.data), function(relationshipData, _fn2) {

                    if (relationshipData) {
                        let includeRelationship = _.get(internal.types, resource.type + '.default.relationships.' + relationshipName + '.include', true),
                            relationshipIsArray = _.get(internal.types, resource.type + '.default.relationships.' + relationshipName + '.array', false),
                            relationshipIdParam = _.get(internal.types, relationshipData.type + '.default.id', 'id'),
                            nestedData = _.set({}, relationshipIdParam, relationshipData.id),
                            //nestedData = relationshipData.id,
                            relationshipResource = _.find(included, {
                                type: relationshipData.type,
                                id: relationshipData.id.toString()
                            });

                        if (relationshipResource) {
                            ProcessRelationships(internal, relationshipResource, included, unvisited, data, function () {
                                if (internal.options.nestDeserializedRelationships && includeRelationship) {
                                    nestedData = findInField(data[relationshipData.type], nestedData);
                                }

                                entityData[relationshipName] = addToField(entityData[relationshipName], nestedData, true, relationshipIsArray);

                                _fn2();
                            });
                        } else {
                            entityData[relationshipName] = addToField(entityData[relationshipName], nestedData, true, relationshipIsArray);
                            data[relationshipData.type] = addToField(data[relationshipData.type], nestedData);

                            _fn2();
                        }
                    } else {
                        _fn2();
                    }

                }, _fn);

            }, fn);
        }]
    }, cb);
};