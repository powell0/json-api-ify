'use strict';

const _ = require('lodash');
const hash = require('object-hash');

module.exports = function(resource) {
    const options = {
        unorderedArrays: true
    };

    const resourceIdentifier = {type: resource.type};

    if (resource.id) {
        resourceIdentifier.id = resource.id;
    } else {
        resourceIdentifier.id = _.reduce(resource.relationships, (relationships, relationData, relationName) => {
            relationships[relationName] = _.map(_.castArray(relationData.data), (data) => _.pick(data, ['id', 'type']));

            return relationships;
        }, {});
    }

    return hash(resourceIdentifier, options);
};