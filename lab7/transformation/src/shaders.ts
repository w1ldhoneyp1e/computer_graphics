const SURFACE_VERTEX_SHADER = `
attribute vec3 a_position;
uniform mat4 u_mvp;
uniform float u_morph;
varying vec3 v_normal;
varying vec3 v_position;
varying float v_morph;

const float PI = 3.141592653589793;

vec3 mobiusPoint(vec2 uv) {
	float u = uv.x * 2.0 * PI;
	float v = mix(-1.0, 1.0, uv.y);
	float halfWidth = 0.42;
	float radius = 1.16 + halfWidth * v * cos(u * 0.5);

	return vec3(
		radius * cos(u),
		halfWidth * v * sin(u * 0.5),
		radius * sin(u)
	) * 1.38;
}

vec3 kleinPoint(vec2 uv) {
	float u = uv.x * 2.0 * PI;
	float v = uv.y * 2.0 * PI;
	float body = 1.75 + cos(u * 0.5) * sin(v) - sin(u * 0.5) * sin(2.0 * v);

	return vec3(
		body * cos(u),
		sin(u * 0.5) * sin(v) + cos(u * 0.5) * sin(2.0 * v),
		body * sin(u)
	) * 0.72;
}

vec3 surfacePoint(vec2 uv, float morph) {
	return mix(mobiusPoint(uv), kleinPoint(uv), morph);
}

vec3 surfaceNormal(vec2 uv, float morph) {
	float delta = 0.0025;
	vec2 uNext = vec2(fract(uv.x + delta), uv.y);
	vec2 uPrev = vec2(fract(uv.x - delta + 1.0), uv.y);
	vec2 vNext = vec2(uv.x, min(uv.y + delta, 1.0));
	vec2 vPrev = vec2(uv.x, max(uv.y - delta, 0.0));
	vec3 tangentU = surfacePoint(uNext, morph) - surfacePoint(uPrev, morph);
	vec3 tangentV = surfacePoint(vNext, morph) - surfacePoint(vPrev, morph);

	return normalize(cross(tangentU, tangentV));
}

void main() {
	vec2 uv = a_position.xy;
	vec3 position = surfacePoint(uv, u_morph);

	v_position = position;
	v_normal = surfaceNormal(uv, u_morph);
	v_morph = u_morph;
	gl_Position = u_mvp * vec4(position, 1.0);
}
`

const SURFACE_FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 u_lightDirection;
varying vec3 v_normal;
varying vec3 v_position;
varying float v_morph;

void main() {
	vec3 normal = normalize(v_normal);
	if (!gl_FrontFacing) {
		normal = -normal;
	}

	vec3 light = normalize(-u_lightDirection);
	float diffuse = max(dot(normal, light), 0.0);
	float rim = 0.16 * pow(1.0 - abs(normal.z), 2.0);
	vec3 mobiusColor = vec3(0.12, 0.63, 0.88);
	vec3 kleinColor = vec3(0.95, 0.44, 0.24);
	vec3 baseColor = mix(mobiusColor, kleinColor, v_morph);
	vec3 heightTint = vec3(0.16, 0.12, 0.20) * (v_position.y + 1.2) * 0.18;
	vec3 color = (baseColor + heightTint) * (0.30 + 0.70 * diffuse) + rim;

	gl_FragColor = vec4(color, 1.0);
}
`

const WIREFRAME_FRAGMENT_SHADER = `
precision mediump float;

void main() {
	gl_FragColor = vec4(0.02, 0.025, 0.03, 1.0);
}
`

export {
	SURFACE_FRAGMENT_SHADER,
	SURFACE_VERTEX_SHADER,
	WIREFRAME_FRAGMENT_SHADER,
}
