class World {
  constructor({ seed = 1, tileSize = 32, chunkSize = 16 } = {}) {
    this.seed = seed;
    this.tileSize = tileSize;
    this.chunkSize = chunkSize;
    this.chunks = new Map();
  }

  getChunkKey(chunkX, chunkY) {
    return `${chunkX},${chunkY}`;
  }

  floorDiv(value, divisor) {
    return Math.floor(value / divisor);
  }

  hash(x, y, salt = 0) {
    let value = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(this.seed, 1442695041) ^ Math.imul(salt, 1013904223);
    value = (value ^ (value >>> 13)) >>> 0;
    value = Math.imul(value, 1274126177);
    value = (value ^ (value >>> 16)) >>> 0;
    return value / 4294967295;
  }

  smoothNoise(x, y, salt = 0) {
    const corners = (
      this.hash(x - 1, y - 1, salt) +
      this.hash(x + 1, y - 1, salt) +
      this.hash(x - 1, y + 1, salt) +
      this.hash(x + 1, y + 1, salt)
    ) / 16;

    const sides = (
      this.hash(x - 1, y, salt) +
      this.hash(x + 1, y, salt) +
      this.hash(x, y - 1, salt) +
      this.hash(x, y + 1, salt)
    ) / 8;

    const center = this.hash(x, y, salt) / 4;
    return corners + sides + center;
  }

  interpolate(a, b, blend) {
    const eased = blend * blend * (3 - 2 * blend);
    return a + (b - a) * eased;
  }

  interpolatedNoise(x, y, salt = 0) {
    const integerX = Math.floor(x);
    const integerY = Math.floor(y);
    const fractionalX = x - integerX;
    const fractionalY = y - integerY;

    const v1 = this.smoothNoise(integerX, integerY, salt);
    const v2 = this.smoothNoise(integerX + 1, integerY, salt);
    const v3 = this.smoothNoise(integerX, integerY + 1, salt);
    const v4 = this.smoothNoise(integerX + 1, integerY + 1, salt);

    const i1 = this.interpolate(v1, v2, fractionalX);
    const i2 = this.interpolate(v3, v4, fractionalX);
    return this.interpolate(i1, i2, fractionalY);
  }

  fractalNoise(x, y, salt = 0) {
    let total = 0;
    let frequency = 0.035;
    let amplitude = 1;
    let maxValue = 0;

    for (let octave = 0; octave < 4; octave++) {
      total += this.interpolatedNoise(x * frequency, y * frequency, salt + octave * 97) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return total / maxValue;
  }

  getBiome(tileX, tileY) {
    const elevation = this.fractalNoise(tileX, tileY, 11);
    const moisture = this.fractalNoise(tileX, tileY, 29);
    const lakeNoise = this.fractalNoise(tileX, tileY, 71);
    const forestNoise = this.fractalNoise(tileX, tileY, 91);
    const treeChance = this.fractalNoise(tileX, tileY, 53);
    const singleTreeNoise = this.hash(tileX, tileY, 313);

    // More frequent lakes and puddles
    if (elevation < 0.36 || (lakeNoise < 0.28 && elevation < 0.72)) {
      return {
        type: "water",
        solid: true,
        color: lakeNoise < 0.12 ? "#1e40af" : "#2563eb"
      };
    }

    if (elevation > 0.82) {
      return {
        type: "rock",
        solid: true,
        color: "#7b8794",
        decor: treeChance > 0.88 ? "rock" : null
      };
    }

    const tile = {
      type: "grass",
      solid: false,
      color: moisture > 0.72 ? "#4f9b4a" : "#5aa34b"
    };

    // Forest clusters
    if (forestNoise > 0.66 && treeChance > 0.28) {
      tile.solid = true;
      tile.decor = "tree";
    // Scattered trees where moisture allows
    } else if (treeChance > 0.78 && moisture > 0.40) {
      tile.solid = true;
      tile.decor = "tree";
    // Isolated single trees (frequent)
    } else if (singleTreeNoise > 0.82 && moisture > 0.30 && elevation > 0.35) {
      tile.solid = true;
      tile.decor = "tree";
    } else if (treeChance > 0.92) {
      tile.solid = true;
      tile.decor = "rock";
    }

    if (elevation > 0.72 && elevation < 0.78 && moisture < 0.45) {
      tile.color = "#d8c27a";
    }

    if (forestNoise > 0.82 && moisture > 0.54) {
      tile.color = "#4a9647";
    }

    return tile;
  }

  generateChunk(chunkX, chunkY) {
    const tiles = new Map();

    for (let localY = 0; localY < this.chunkSize; localY++) {
      for (let localX = 0; localX < this.chunkSize; localX++) {
        const tileX = chunkX * this.chunkSize + localX;
        const tileY = chunkY * this.chunkSize + localY;
        tiles.set(`${tileX},${tileY}`, {
          x: tileX,
          y: tileY,
          ...this.getBiome(tileX, tileY)
        });
      }
    }

    const chunk = { chunkX, chunkY, tiles };
    this.chunks.set(this.getChunkKey(chunkX, chunkY), chunk);
    return chunk;
  }

  getChunk(chunkX, chunkY) {
    const key = this.getChunkKey(chunkX, chunkY);
    if (!this.chunks.has(key)) {
      return this.generateChunk(chunkX, chunkY);
    }

    return this.chunks.get(key);
  }

  getTile(tileX, tileY) {
    const chunkX = this.floorDiv(tileX, this.chunkSize);
    const chunkY = this.floorDiv(tileY, this.chunkSize);
    const chunk = this.getChunk(chunkX, chunkY);
    return chunk.tiles.get(`${tileX},${tileY}`);
  }

  getSolidTilesInBounds(left, top, right, bottom) {
    const tiles = [];
    const startTileX = this.floorDiv(left, this.tileSize);
    const endTileX = this.floorDiv(right, this.tileSize);
    const startTileY = this.floorDiv(top, this.tileSize);
    const endTileY = this.floorDiv(bottom, this.tileSize);

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const tile = this.getTile(tileX, tileY);
        if (tile.solid) {
          tiles.push(tile);
        }
      }
    }

    return tiles;
  }

  intersectsSolid(entity) {
    const left = entity.x;
    const top = entity.y;
    const right = entity.x + entity.width - 1;
    const bottom = entity.y + entity.height - 1;
    return this.getSolidTilesInBounds(left, top, right, bottom).length > 0;
  }

  moveEntity(entity, deltaX, deltaY) {
    if (deltaX !== 0) {
      entity.x += deltaX;
      if (this.intersectsSolid(entity)) {
        entity.x -= deltaX;
      }
    }

    if (deltaY !== 0) {
      entity.y += deltaY;
      if (this.intersectsSolid(entity)) {
        entity.y -= deltaY;
      }
    }
  }

  findSpawnPoint(entityWidth = 60, entityHeight = 60) {
    // Try to find a location with a small safety margin (in tiles) free of solid tiles
    const margin = 1; // tiles around the player that must be free
    const maxRadius = 64;

    for (let radius = 0; radius < maxRadius; radius++) {
      for (let offsetY = -radius; offsetY <= radius; offsetY++) {
        for (let offsetX = -radius; offsetX <= radius; offsetX++) {
          const candidateX = offsetX * this.tileSize;
          const candidateY = offsetY * this.tileSize;

          const left = candidateX - margin * this.tileSize;
          const top = candidateY - margin * this.tileSize;
          const right = candidateX + entityWidth + margin * this.tileSize - 1;
          const bottom = candidateY + entityHeight + margin * this.tileSize - 1;

          const solids = this.getSolidTilesInBounds(left, top, right, bottom);
          if (solids.length === 0) {
            return { x: candidateX, y: candidateY };
          }
        }
      }
    }

    // Fallback: try a local spiral around origin to find any free spot
    for (let ty = -8; ty <= 8; ty++) {
      for (let tx = -8; tx <= 8; tx++) {
        const candidateX = tx * this.tileSize;
        const candidateY = ty * this.tileSize;
        const left = candidateX - margin * this.tileSize;
        const top = candidateY - margin * this.tileSize;
        const right = candidateX + entityWidth + margin * this.tileSize - 1;
        const bottom = candidateY + entityHeight + margin * this.tileSize - 1;
        if (this.getSolidTilesInBounds(left, top, right, bottom).length === 0) {
          return { x: candidateX, y: candidateY };
        }
      }
    }

    // If nothing found, return origin
    return { x: 0, y: 0 };
  }
}