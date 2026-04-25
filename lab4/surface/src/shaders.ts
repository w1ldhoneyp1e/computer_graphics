const FACE_VERTEX_SHADER = `
attribute vec3 a_position;
attribute vec3 a_normal;
uniform mat4 u_mvp;
varying vec3 v_normal;
varying float v_y;
void main() {
	gl_Position = u_mvp * vec4(a_position, 1.0);
	v_normal = a_normal;
	v_y = a_position.y;
}
`

const FACE_FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 u_lightDir;
uniform float u_minY;
uniform float u_maxY;
varying vec3 v_normal;
varying float v_y;

float calcPercent(float value, float from, float to) {
	if (abs(to - from) < 0.0001) {
		return 0.5;
	}

	return clamp((value - from) / (to - from), 0.0, 1.0);
}

void main() {
	vec3 normal = normalize(v_normal);
	if (!gl_FrontFacing) {
		normal = -normal;
	}

	float diffuse = max(dot(normal, normalize(-u_lightDir)), 0.0);
	float lightAmount = 0.34 + 0.66 * diffuse;
	float percent = calcPercent(v_y, u_minY, u_maxY);
	vec3 baseColor = vec3(
		mix(0.18, 0.88, percent),
		mix(0.44, 0.70, percent),
		mix(0.78, 0.96, percent)
	);

	gl_FragColor = vec4(baseColor * lightAmount, 0.82);
}
`

const EDGE_VERTEX_SHADER = `
attribute vec3 a_position;
uniform mat4 u_mvp;
void main() {
	gl_Position = u_mvp * vec4(a_position, 1.0);
}
`

const EDGE_FRAGMENT_SHADER = `
precision mediump float;
void main() {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`

export {
	EDGE_FRAGMENT_SHADER,
	EDGE_VERTEX_SHADER,
	FACE_FRAGMENT_SHADER,
	FACE_VERTEX_SHADER,
}
