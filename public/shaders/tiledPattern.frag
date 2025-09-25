uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec2 u_speed;
uniform float u_aspect;
uniform float u_size;

// Cheap hash for grain
float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
}

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    // Keep the same tiling (do not change u_size usage)
    // Create two UV layers for a subtle parallax effect (different speeds + slight screen-space offset)
    vec2 uv0 = uv;
    vec2 uv1 = (uv0 + vec2(u_time) * (u_speed * 0.35)) * vec2(u_aspect, 1.0); // slower base
    vec2 uv2 = (uv0 + vec2(u_time) * (u_speed * 0.6) + (uv0 - 0.5) * vec2(0.03, 0.02)) * vec2(u_aspect, 1.0); // parallax layer

    // Integer grid ids and per-tile UV (0..1)
    float gx = floor(uv1.x * u_size);
    float gy = floor(uv1.y * u_size);
    vec2 gid = vec2(gx, gy);
    vec2 fuv = fract(uv1 * u_size);

    // Base checker color (unchanged tile size logic)
    float total = gx + gy;
    bool isEven = mod(total, 2.0) == 0.0;
    vec3 col1 = u_color1 / 255.0;
    vec3 col2 = u_color2 / 255.0;
    vec3 base = isEven ? col1 : col2;

    // Thin grid lines near tile borders (subtle darkening)
    float edgeDist = min(min(fuv.x, fuv.y), min(1.0 - fuv.x, 1.0 - fuv.y));
    float line = smoothstep(0.0, 0.015, edgeDist); // 0 at border → 1 center
    float lineMask = 1.0 - line;                  // 1 at border → 0 center

    // Soft diagonal shading per tile, alternating direction
    float diag = dot(normalize(vec2(1.0, 1.0)), (fuv - 0.5));
    float dir = isEven ? 1.0 : -1.0;
    float shading = diag * dir * 0.06;

    // Gentle per-tile time shimmer (very subtle)
    float shimmer = sin(u_time * 0.5 + dot(gid, vec2(0.37, 0.73))) * 0.03;

    // Soft micro grain
    float n = hash21(fuv + gid * 0.123 + u_time * 0.02);
    float grain = (n - 0.5) * 0.04;

    vec3 col = base;
    col *= 1.0 + shading + shimmer + grain;
    col = mix(col, col * 0.85, lineMask * 0.7);

    // Parallax overlay: faint border accent moving slightly faster, to add depth without changing tile size
    float gx2 = floor(uv2.x * u_size);
    float gy2 = floor(uv2.y * u_size);
    vec2 fuv2 = fract(uv2 * u_size);
    float edge2 = min(min(fuv2.x, fuv2.y), min(1.0 - fuv2.x, 1.0 - fuv2.y));
    float overlayMask = 1.0 - smoothstep(0.0, 0.02, edge2); // strong near borders
    // Apply a very subtle light/dark accent on borders
    col = mix(col, col * 0.92 + 0.08, overlayMask * 0.15);

    return vec4(clamp(col, 0.0, 1.0), 1.0);
}