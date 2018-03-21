import ActorComponent from "./ActorComponent.js";
import {vec2, vec4, mat2d} from "gl-matrix";

export class FillRule
{
	static get EvenOdd()
	{
		return 0;
	}

	static get NonZero()
	{
		return 1;
	}
}


export class ActorColor extends ActorComponent
{
	constructor()
	{
		super();
		this._Color = new Float32Array(4);
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		vec4.copy(this._Color, node._Color);
	}

	get cssColor()
	{
		const c = this._Color;
		return "rgba(" + Math.round(c[0]*255) + ", " + Math.round(c[1]*255) + ", " + Math.round(c[2]*255) + ", " + c[3] + ")";
	}
}

export class ColorFill extends ActorColor
{
	constructor()
	{
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	makeInstance(resetActor)
	{
		var node = new ColorFill();
		ColorFill.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}

	fill(ctx)
	{
		ctx.fillStyle = this.cssColor;
		
		switch(this._FillRule)
		{
			case FillRule.EvenOdd:
				ctx.fill("evenodd");
				break;
			case FillRule.NonZero:
				ctx.fill("nonzero");
				break;
		}
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addFill(this);
		}
	}
}

export class ColorStroke extends ActorColor
{
	constructor()
	{
		super();
		this._Width = 0.0;
	}

	makeInstance(resetActor)
	{
		var node = new ColorStroke();
		ColorStroke.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
	}

	stroke(ctx)
	{
		ctx.strokeStyle = this.cssColor;
		ctx.lineWidth = this._Width;
		ctx.stroke();
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addStroke(this);
		}
	}
}

export class GradientColor extends ActorComponent
{
	constructor()
	{
		super();
		this._ColorStops = new Float32Array(10);
		this._Start = vec2.create();
		this._End = vec2.create();
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._ColorStops = new Float32Array(node._ColorStops);
		vec2.copy(this._Start, node._Start);
		vec2.copy(this._End, node._End);
	}
}

export class GradientFill extends GradientColor
{
	constructor()
	{
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	makeInstance(resetActor)
	{
		var node = new GradientFill();
		GradientFill.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}

	fill(ctx)
	{
		let {_Start:start, _End:end, _ColorStops:stops} = this;
		var gradient = ctx.createLinearGradient(start[0], start[1], end[0], end[1]);

		const numStops = stops.length/5;
		let idx = 0;
		for(let i = 0; i < numStops; i++)
		{
			const style = "rgba(" + Math.round(stops[idx++]*255) + ", " + Math.round(stops[idx++]*255) + ", " + Math.round(stops[idx++]*255) + ", " + stops[idx++] + ")";
			const value = stops[idx++];
			gradient.addColorStop(value, style);
		}
		
		ctx.fillStyle = gradient;
		switch(this._FillRule)
		{
			case FillRule.EvenOdd:
				ctx.fill("evenodd");
				break;
			case FillRule.NonZero:
				ctx.fill("nonzero");
				break;
		}
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addFill(this);
		}
	}
}

export class GradientStroke extends GradientColor
{
	constructor()
	{
		super();
		this._Width = 0.0;
	}

	makeInstance(resetActor)
	{
		var node = new GradientStroke();
		GradientStroke.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
	}

	stroke(ctx)
	{
		let {_Start:start, _End:end, _ColorStops:stops} = this;
		var gradient = ctx.createLinearGradient(start[0], start[1], end[0], end[1]);

		const numStops = stops.length/5;
		let idx = 0;
		for(let i = 0; i < numStops; i++)
		{
			const style = "rgba(" + Math.round(stops[idx++]*255) + ", " + Math.round(stops[idx++]*255) + ", " + Math.round(stops[idx++]*255) + ", " + stops[idx++] + ")";
			const value = stops[idx++];
			gradient.addColorStop(value, style);
		}
		
		ctx.lineWidth = this._Width;
		ctx.strokeStyle = gradient;
		ctx.stroke();
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addStroke(this);
		}
	}
}

export class RadialGradientColor extends GradientColor
{
	constructor()
	{
		super();
		this._SecondaryRadiusScale = 1.0;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._SecondaryRadiusScale = node._SecondaryRadiusScale;
	}
}

export class RadialGradientFill extends RadialGradientColor
{
	constructor()
	{
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	makeInstance(resetActor)
	{
		var node = new RadialGradientFill();
		RadialGradientFill.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}

	fill(ctx)
	{
		let {_Start:start, _End:end, _ColorStops:stops, _SecondaryRadiusScale:secondaryRadiusScale} = this;
		var gradient = ctx.createRadialGradient(0.0, 0.0, 0.0, 0.0, 0.0, vec2.distance(start, end));

		const numStops = stops.length/5;
		let idx = 0;
		for(let i = 0; i < numStops; i++)
		{
			const style = "rgba(" + Math.round(stops[idx++]*255) + ", " + Math.round(stops[idx++]*255) + ", " + Math.round(stops[idx++]*255) + ", " + stops[idx++] + ")";
			const value = stops[idx++];
			gradient.addColorStop(value, style);
		}
		
		ctx.fillStyle = gradient;

		const squash = Math.max(0.00001, secondaryRadiusScale);

		let angle = vec2.getAngle(vec2.subtract(vec2.create(), end, start));
		ctx.save();
		ctx.translate(start[0], start[1]);
		ctx.rotate(angle);
		ctx.scale(1.0, squash);

		switch(this._FillRule)
		{
			case FillRule.EvenOdd:
				ctx.fill("evenodd");
				break;
			case FillRule.NonZero:
				ctx.fill("nonzero");
				break;
		}
		ctx.restore();
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addFill(this);
		}
	}
}

export class RadialGradientStroke extends RadialGradientColor
{
	constructor()
	{
		super();
		this._Width = 0.0;
	}

	makeInstance(resetActor)
	{
		var node = new RadialGradientStroke();
		RadialGradientStroke.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
	}

	stroke(ctx)
	{
		let {_Start:start, _End:end, _ColorStops:stops, _SecondaryRadiusScale:secondaryRadiusScale} = this;
		var gradient = ctx.createRadialGradient(0.0, 0.0, 0.0, 0.0, 0.0, vec2.distance(start, end));

		const numStops = stops.length/5;
		let idx = 0;
		for(let i = 0; i < numStops; i++)
		{
			const style = "rgba(" + Math.round(stops[idx++]*255) + ", " + Math.round(stops[idx++]*255) + ", " + Math.round(stops[idx++]*255) + ", " + stops[idx++] + ")";
			const value = stops[idx++];
			gradient.addColorStop(value, style);
		}
		
		ctx.lineWidth = this._Width;
		ctx.strokeStyle = gradient;

		const squash = Math.max(0.00001, secondaryRadiusScale);

		let angle = vec2.getAngle(vec2.subtract(vec2.create(), end, start));
		ctx.save();
		ctx.translate(start[0], start[1]);
		ctx.rotate(angle);
		ctx.scale(1.0, squash);

		ctx.stroke();
		ctx.restore();
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addStroke(this);
		}
	}
}