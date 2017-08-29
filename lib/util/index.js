'use strict';

module.exports = {
    applyLinks: require('./apply-links'),
    deserializeResource: require('./deserialize-resource'),
    handleOptionalArguments: require('./handle-optional-arguments'),
    serializeResource: require('./serialize-resource'),
    validateOptions: require('./validate-options'),
    minimizePayload: require('./minimize-payload'),
    processRelationships: require('./process-relationships'),
    generateResourceHash: require('./generate-resource-hash')
};
