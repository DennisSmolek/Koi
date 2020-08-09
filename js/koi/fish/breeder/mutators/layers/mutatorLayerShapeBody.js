/**
 * Mutate a body shape layer in place
 * @param {LayerShapeBody} layer The body shape layer
 * @constructor
 */
const MutatorLayerShapeBody = function(layer) {
    this.layer = layer;
};

MutatorLayerShapeBody.prototype = Object.create(Mutator.prototype);
MutatorLayerShapeBody.prototype.SAMPLER_CENTER_POWER = new SamplerPlateau(-10, 0, 10, .5);
MutatorLayerShapeBody.prototype.SAMPLER_RADIUS_POWER = new SamplerPlateau(-15, 0, 15, .6);

/**
 * Mutate the layer
 * @param {Random} random A randomizer
 */
MutatorLayerShapeBody.prototype.mutate = function(random) {
    this.layer.centerPower = this.mutateUint8(this.layer.centerPower, this.SAMPLER_CENTER_POWER, random.getFloat());
    this.layer.radiusPower = this.mutateUint8(this.layer.radiusPower, this.SAMPLER_RADIUS_POWER, random.getFloat());
};