/**
 * A blueprint for a random spots layer
 * @param {BlueprintPaletteSample} blueprintPaletteSample A palette sample blueprint
 * @param {Sampler} samplerScale A scale sampler
 * @param {Sampler} samplerStretch A stretch sampler
 * @param {Sampler} samplerThreshold A threshold sampler
 * @param {Sampler} samplerXFocus An X focus sampler
 * @param {Sampler} samplerYFocus An Y focus sampler
 * @param {Sampler} samplerPower A power sampler
 * @constructor
 */
const BlueprintLayerSpots = function(
    blueprintPaletteSample,
    samplerScale,
    samplerStretch,
    samplerThreshold,
    samplerXFocus,
    samplerYFocus,
    samplerPower) {
    this.blueprintPaletteSample = blueprintPaletteSample
    this.samplerScale = samplerScale
    this.samplerStretch = samplerStretch
    this.samplerThreshold = samplerThreshold
    this.samplerXFocus = samplerXFocus
    this.samplerYFocus = samplerYFocus
    this.samplerPower = samplerPower
};

/**
 * Spawn a spots layer
 * @param {Random} random A randomizer
 * @returns {LayerSpots} A spots layer
 */
BlueprintLayerSpots.prototype.spawn = function(random) {
    return new LayerSpots(
        Plane.createRandom(random),
        this.blueprintPaletteSample.spawn(random),
        Math.round(this.samplerScale.sample(random.getFloat())),
        Math.round(this.samplerStretch.sample(random.getFloat())),
        Math.round(this.samplerThreshold.sample(random.getFloat())),
        Math.round(this.samplerXFocus.sample(random.getFloat())),
        Math.round(this.samplerYFocus.sample(random.getFloat())),
        Math.round(this.samplerPower.sample(random.getFloat())));
};