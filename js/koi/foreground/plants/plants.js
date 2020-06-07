/**
 * Plants
 * @param {WebGLRenderingContext} gl A WebGL rendering context
 * @param {Constellation} constellation The constellation
 * @param {Slots} slots The slots to place objects on
 * @param {Random} random A randomizer
 * @constructor
 */
const Plants = function(gl, constellation, slots, random) {
    this.mesh = this.makeMesh(gl, constellation, slots, random);
};

Plants.prototype.STRIDE = 10;
Plants.prototype.WIND_UV_RADIUS = .45;

/**
 * Make the vegetation mesh
 * @param {WebGLRenderingContext} gl A WebGL rendering context
 * @param {Constellation} constellation The constellation
 * @param {Slots} slots The slots to place objects on
 * @param {Random} random A randomizer
 */
Plants.prototype.makeMesh = function(gl, constellation, slots, random) {
    const vertices = [];
    const indices = [];

    slots.sort();

    for (const slot of slots.slots) if (slot) {
        if (random.getFloat() < .01)
            this.modelCattail(slot.x, slot.y, random, vertices, indices);
        else
            this.modelGrass(slot.x, slot.y, random, vertices, indices);
    }

    return new Mesh(gl, vertices, indices, this.getFirstIndex(vertices) - 1 > 0xFFFF);
};

/**
 * Get the first index of a new mesh in the vertex array
 * @param {Number[]} vertices The vertex array
 * @returns {Number} The first index of vertices that will be added to the array
 */
Plants.prototype.getFirstIndex = function(vertices) {
    return vertices.length / this.STRIDE;
};

/**
 * Make a wind map UV with some offset
 * @param {Number} x The X origin
 * @param {Number} y The Y origin
 * @param {Random} random A randomizer
 * @returns {Vector2} The UV coordinates
 */
Plants.prototype.makeUV = function(x, y, random) {
    const angle = random.getFloat() * Math.PI * 2;
    const radius = Math.sqrt(random.getFloat()) * this.WIND_UV_RADIUS;

    return new Vector2(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius);
};

/**
 * Make a flex vector that determines the direction in which a vegetation vertex bends
 * @param {Number} flex The amount of flex
 * @param {Number} x The X position of the vertex
 * @param {Number} z The Z position of the vertex
 * @param {Number} xOrigin The plant X origin
 * @param {Number} zOrigin The plant Z origin
 * @returns {Vector2} The flex vector
 */
Plants.prototype.makeFlexVector = function(
    flex,
    x,
    z,
    xOrigin,
    zOrigin) {
    const dx = x - xOrigin;
    const dz = z - zOrigin;

    if (dx === 0 && dz === 0)
        return new Vector2();

    return new Vector2(dz * flex, dx * flex);
};

/**
 * Make flex vectors for a range of vertices
 * @param {Number} flex The amount of flex
 * @param {Number} start The start index
 * @param {Number} end The end index
 * @param {Number} xOrigin The plant X origin
 * @param {Number} zOrigin The plant Z origin
 * @param {Number[]} vertices The vertex array
 */
Plants.prototype.makeFlexVectors = function(
    flex,
    start,
    end,
    xOrigin,
    zOrigin,
    vertices) {
    for (let i = start; i <= end; ++i) {
        const index = i * this.STRIDE;
        const flexVector = this.makeFlexVector(
            flex,
            vertices[index + 3],
            vertices[index + 5],
            xOrigin,
            zOrigin);

        vertices[index + 6] += flexVector.x;
        vertices[index + 7] += flexVector.y;
    }
};

/**
 * Free all resources maintained by plants
 */
Plants.prototype.free = function() {
    this.mesh.free();
};