const FACE_VERTEX_SHADER = `
attribute vec3 a_position;
uniform mat4 u_mvp;
uniform vec3 u_normal;
uniform vec4 u_color;
uniform vec3 u_lightDir;
varying vec4 v_color;
void main() {
	gl_Position = u_mvp * vec4(a_position, 1.0);
	float diffuse = max(dot(normalize(u_normal), normalize(-u_lightDir)), 0.0);
	float lightAmount = 0.22 + 0.78 * diffuse;
	v_color = vec4(u_color.rgb * lightAmount, u_color.a);
}
`

const FACE_FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_color;
void main() {
	gl_FragColor = v_color;
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
