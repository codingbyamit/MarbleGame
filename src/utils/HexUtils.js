// src/utils/HexUtils.js

class HexUtils {
  // Hex size (radius of hexagon)
  static HEX_SIZE = 22;

  // Cube coordinates to pixel position
  static hexToPixel(q, r, s) {
    const size = this.HEX_SIZE;
    const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = size * ((3 / 2) * r);
    return { x, y };
  }

  // Pixel to nearest hex (for touch input)
  static pixelToHex(px, py, offsetX, offsetY) {
    const size = this.HEX_SIZE;
    const adjustedX = px - offsetX;
    const adjustedY = py - offsetY;

    const q =
      ((Math.sqrt(3) / 3) * adjustedX - (1 / 3) * adjustedY) / size;
    const r = ((2 / 3) * adjustedY) / size;
    const s = -q - r;

    // Round to nearest hex
    return this.cubeRound(q, r, s);
  }

  // Round fractional cube coordinates
  static cubeRound(q, r, s) {
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const dq = Math.abs(rq - q);
    const dr = Math.abs(rr - r);
    const ds = Math.abs(rs - s);

    if (dq > dr && dq > ds) {
      rq = -rr - rs;
    } else if (dr > ds) {
      rr = -rq - rs;
    } else {
      rs = -rq - rr;
    }

    return { q: rq, r: rr, s: rs };
  }

  // Get hexagon corners (for drawing)
  static getHexCorners(centerX, centerY) {
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      corners.push({
        x: centerX + this.HEX_SIZE * Math.cos(angle),
        y: centerY + this.HEX_SIZE * Math.sin(angle),
      });
    }
    return corners;
  }

  // Get hex path string for SVG
  static getHexPath(centerX, centerY) {
    const corners = this.getHexCorners(centerX, centerY);
    let path = `M ${corners[0].x} ${corners[0].y}`;
    for (let i = 1; i < 6; i++) {
      path += ` L ${corners[i].x} ${corners[i].y}`;
    }
    path += ' Z';
    return path;
  }

  // Distance between two hex cells
  static hexDistance(a, b) {
    return (
      (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) /
      2
    );
  }

  // Get marble color
  static getMarbleColor(player) {
    if (player === 1) return '#FFFFFF'; // White
    if (player === 2) return '#333333'; // Black
    return 'transparent';
  }

  // Get marble gradient colors
  static getMarbleGradient(player) {
    if (player === 1) {
      return { inner: '#FFFFFF', outer: '#CCCCCC', shine: '#FFFFFF' };
    }
    if (player === 2) {
      return { inner: '#555555', outer: '#222222', shine: '#888888' };
    }
    return null;
  }
}

export default HexUtils;