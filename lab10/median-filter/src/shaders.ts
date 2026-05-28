const FULLSCREEN_VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
	gl_Position = vec4(a_position, 0.0, 1.0);
	v_texCoord = a_texCoord;
}
`

const COPY_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D u_image;
varying vec2 v_texCoord;

void main() {
	gl_FragColor = texture2D(u_image, v_texCoord);
}
`

const MEDIAN_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_texelSize;
varying vec2 v_texCoord;

float luminance(vec3 color) {
	return dot(color, vec3(0.299, 0.587, 0.114));
}

void swapByLuma(inout vec4 a, inout vec4 b) {
	if (luminance(a.rgb) > luminance(b.rgb)) {
		vec4 temp = a;
		a = b;
		b = temp;
	}
}

void main() {
	vec2 step = u_texelSize;
	vec4 c0 = texture2D(u_image, v_texCoord + step * vec2(-1.0, -1.0));
	vec4 c1 = texture2D(u_image, v_texCoord + step * vec2(0.0, -1.0));
	vec4 c2 = texture2D(u_image, v_texCoord + step * vec2(1.0, -1.0));
	vec4 c3 = texture2D(u_image, v_texCoord + step * vec2(-1.0, 0.0));
	vec4 c4 = texture2D(u_image, v_texCoord);
	vec4 c5 = texture2D(u_image, v_texCoord + step * vec2(1.0, 0.0));
	vec4 c6 = texture2D(u_image, v_texCoord + step * vec2(-1.0, 1.0));
	vec4 c7 = texture2D(u_image, v_texCoord + step * vec2(0.0, 1.0));
	vec4 c8 = texture2D(u_image, v_texCoord + step * vec2(1.0, 1.0));

	swapByLuma(c0, c1); swapByLuma(c3, c4); swapByLuma(c6, c7);
	swapByLuma(c1, c2); swapByLuma(c4, c5); swapByLuma(c7, c8);
	swapByLuma(c0, c1); swapByLuma(c3, c4); swapByLuma(c6, c7);
	swapByLuma(c0, c3); swapByLuma(c3, c6); swapByLuma(c0, c3);
	swapByLuma(c1, c4); swapByLuma(c4, c7); swapByLuma(c1, c4);
	swapByLuma(c2, c5); swapByLuma(c5, c8); swapByLuma(c2, c5);
	swapByLuma(c1, c3); swapByLuma(c5, c7); swapByLuma(c2, c6);
	swapByLuma(c4, c6); swapByLuma(c2, c4); swapByLuma(c4, c6);
	swapByLuma(c2, c3); swapByLuma(c5, c6);
	swapByLuma(c3, c4); swapByLuma(c4, c5);

	gl_FragColor = c4;
}
`

export {
	COPY_FRAGMENT_SHADER,
	FULLSCREEN_VERTEX_SHADER,
	MEDIAN_FRAGMENT_SHADER,
}
