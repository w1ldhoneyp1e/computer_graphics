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
uniform int u_radius;
uniform vec2 u_texelSize;
varying vec2 v_texCoord;

float luminance(vec3 color) {
	return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
	vec2 stepSize = u_texelSize;
	int radiusSize = u_radius * 2 + 1;
	float medianPosition = float(radiusSize * radiusSize + 1) * 0.5;
	float low = 0.0;
	float high = 1.0;

	for (int i = 0; i < 8; i++) {
		float mid = (low + high) * 0.5;
		float count = 0.0;

		for (int y = -7; y < 8; y++) {
			for (int x = -7; x < 8; x++) {
				if (x >= -u_radius && x <= u_radius && y >= -u_radius && y <= u_radius) {
					vec2 offset = vec2(float(x), float(y));
					vec4 sampleColor = texture2D(u_image, v_texCoord + stepSize * offset);
					count += step(luminance(sampleColor.rgb), mid);
				}
			}
		}

		if (count < medianPosition) {
			low = mid;
		}
		else {
			high = mid;
		}
	}

	float medianLuma = (low + high) * 0.5;
	vec4 bestColor = texture2D(u_image, v_texCoord);
	float bestDistance = abs(luminance(bestColor.rgb) - medianLuma);

	for (int y = -7; y < 8; y++) {
		for (int x = -7; x < 8; x++) {
			if (x >= -u_radius && x <= u_radius && y >= -u_radius && y <= u_radius) {
				vec2 offset = vec2(float(x), float(y));
				vec4 sampleColor = texture2D(u_image, v_texCoord + stepSize * offset);
				float lumaDistance = abs(luminance(sampleColor.rgb) - medianLuma);
				if (lumaDistance < bestDistance) {
					bestColor = sampleColor;
					bestDistance = lumaDistance;
				}
			}
		}
	}

	gl_FragColor = bestColor;
}
`

export {
	COPY_FRAGMENT_SHADER,
	FULLSCREEN_VERTEX_SHADER,
	MEDIAN_FRAGMENT_SHADER,
}
