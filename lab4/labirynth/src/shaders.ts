const FACE_VERTEX_SHADER = `
attribute vec3 a_position;
uniform mat4 u_mvp;
uniform vec3 u_normal;
uniform vec4 u_color;
varying vec3 v_normal;
varying vec4 v_color;
varying vec3 v_worldPosition;
void main() {
	gl_Position = u_mvp * vec4(a_position, 1.0);
	v_normal = u_normal;
	v_color = u_color;
	v_worldPosition = a_position;
}
`

const FACE_FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 u_lightPosition;
varying vec3 v_normal;
varying vec4 v_color;
varying vec3 v_worldPosition;
void main() {
	vec3 normal = normalize(v_normal);
	if (!gl_FrontFacing) {
		normal = -normal;
	}

	vec3 lightVector = u_lightPosition - v_worldPosition;
	float distanceToLight = max(length(lightVector), 0.001);
	vec3 lightDirection = lightVector / distanceToLight;
	float diffuse = max(dot(normal, lightDirection), 0.0);
	float attenuation = 1.0 / (1.0 + 0.35 * distanceToLight + 0.25 * distanceToLight * distanceToLight);
	float lightAmount = 0.04 + diffuse * attenuation * 3.0;
	lightAmount = clamp(lightAmount, 0.04, 1.0);
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
