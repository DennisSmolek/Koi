/**
 * Mix two fin arrays
 * @param {Fin[]} mother The mother fins
 * @param {Fin[]} father The father fins
 * @constructor
 */
const MixerFins = function(mother, father) {
    this.mother = mother;
    this.father = father;
};

MixerFins.prototype = Object.create(Mixer.prototype);

/**
 * Create a new set of fins that combines properties from both parents
 * @param {Random} random A randomizer
 * @returns {Fin[]} The mixed fin array
 */
MixerFins.prototype.mix = function(random) {

};