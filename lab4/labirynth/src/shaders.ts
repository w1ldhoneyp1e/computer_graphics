const FACE_VERTEX_SHADER = `
attribute vec3 a_position;
uniform mat4 u_mvp;
uniform vec3 u_normal;
uniform vec4 u_color;
uniform vec3 u_lightDir;
varying vec3 v_normal;
varying vec4 v_color;
void main() {
	gl_Position = u_mvp * vec4(a_position, 1.0);
	v_normal = u_normal;
	v_color = u_color;
}
`

const FACE_FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 u_lightDir;
varying vec3 v_normal;
varying vec4 v_color;
void main() {
	vec3 normal = normalize(v_normal);
	if (!gl_FrontFacing) {
		normal = -normal;
	}

	float diffuse = max(dot(normal, normalize(-u_lightDir)), 0.0);
	float lightAmount = 0.22 + 0.78 * diffuse;
	gl_FragColor = vec4(v_color.rgb * lightAmount, v_color.a);
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
