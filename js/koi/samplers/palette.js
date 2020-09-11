/**
 * A color palette
 * @param {Palette.Color[]} colors The colors on this palette
 * @constructor
 */
const Palette = function(colors) {
    this.colors = colors;
    this.indices = new Array(256).fill(-1);
};

/**
 * A palette sample
 * @param {Number} [x] The X coordinate of this sample in the range [0, 15]
 * @param {Number} [y] The Y coordinate of this sample in the range [0, 15]
 * @constructor
 */
Palette.Sample = function(x = 0, y = 0) {
    this.x = x;
    this.y = y;
};

/**
 * Deserialize a sample
 * @param {BinBuffer} buffer The buffer to deserialize from
 */
Palette.Sample.deserialize = function(buffer) {
    const index = buffer.readUint8();

    return new Palette.Sample(index & 0xF, index >> 4);
};

/**
 * Serialize this sample
 * @param {BinBuffer} buffer The buffer to serialize to
 */
Palette.Sample.prototype.serialize = function(buffer) {
    buffer.writeUint8(this.x | (this.y << 4));
};

/**
 * Randomize this sample
 * @param {Random} random A randomizer
 * @returns {Palette.Sample} This sample
 */
Palette.Sample.prototype.randomize = function(random) {
    this.x = Math.floor(16 * random.getFloat());
    this.y = Math.floor(16 * random.getFloat());

    return this;
};

/**
 * Make a copy of this palette sample
 * @returns {Palette.Sample} A copy of this sample
 */
Palette.Sample.prototype.copy = function() {
    return new Palette.Sample(this.x, this.y);
};

/**
 * Create an interpolated palette sample from this one to another sample
 * @param {Palette.Sample} to The palette sample to interpolate towards
 * @param {Number} x The interpolation factor in the range [0, 1]
 * @returns {Palette.Sample} The interpolated sample
 */
Palette.Sample.prototype.interpolate = function(to, x) {
    return new Palette.Sample(
        Math.min(0xFF, Math.max(0, Math.round(this.x + (to.x - this.x) * x))),
        Math.min(0xFF, Math.max(0, Math.round(this.y + (to.y - this.y) * x))));
};

/**
 * Tile the palette sample within their bounds
 */
Palette.Sample.prototype.tile = function() {
    while (this.x < 0)
        this.x += 16;

    while (this.y < 0)
        this.y += 16;

    while (this.x > 15)
        this.x -= 16;

    while (this.y > 15)
        this.y -= 16;
};

/**
 * A color on a palette
 * @param {Palette.Sample} sample A sample location for this color
 * @param {Color} color The color
 * @param {Palette} [palette] A palette that may overlap this color
 * @constructor
 */
Palette.Color = function(sample, color, palette = null) {
    this.sample = sample;
    this.color = color;
    this.palette = palette;
};

/**
 * Calculate the color index at a given sample location
 * @param {Palette.Sample} sample A sample
 */
Palette.prototype.calculateIndex = function(sample) {
    let nearest = -1;
    let smallestSquaredDist = 1000;

    for (let color = 0, colors = this.colors.length; color < colors; ++color) {
        for (let dy = -1; dy <= 1; ++dy) for (let dx = -1; dx <= 1; ++dx) {
            const cdx = sample.x - this.colors[color].sample.x + dx * 16;
            const cdy = sample.y - this.colors[color].sample.y + dy * 16;
            const squaredDist = cdx * cdx + cdy * cdy;

            if (squaredDist < smallestSquaredDist) {
                smallestSquaredDist = squaredDist;
                nearest = color;
            }
        }
    }

    this.indices[sample.x + (sample.y << 4)] = nearest;
};

/**
 * Sample a color from this palette
 * @param {Palette.Sample} sample A sample
 * @returns {Palette.Color} The palette color at the given sample point
 */
Palette.prototype.sample = function(sample) {
    const index = sample.x | (sample.y << 4);

    if (this.indices[index] === -1)
        this.calculateIndex(sample);

    return this.colors[this.indices[index]];
};