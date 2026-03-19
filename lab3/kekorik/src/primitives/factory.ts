import {type PrimitiveCommand} from '../types'
import {Circle} from './Circle'
import {Polygon} from './Polygon'
import {type Primitive} from './Primitive'
import {RingArc} from './RingArc'

const createPrimitive = (command: PrimitiveCommand): Primitive => {
	if (command.type === 'circle') {
		return new Circle(command)
	}

	if (command.type === 'polygon') {
		return new Polygon(command)
	}

	return new RingArc(command)
}

const buildPrimitiveSet = (template: PrimitiveCommand[]): Primitive[] => {
	const primitives = template.map(command => createPrimitive(command))

	return primitives
}

export {
	createPrimitive,
	buildPrimitiveSet,
}
