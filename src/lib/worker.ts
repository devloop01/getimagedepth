import { pipeline, env, DepthAnythingForDepthEstimation } from '@xenova/transformers';

env.allowLocalModels = false;

class Pipeline {
	static task = 'depth-estimation';
	static model = 'Xenova/depth-anything-small-hf';
	static instance: DepthAnythingForDepthEstimation | null = null;

	static async getInstance(progress_callback: (x: unknown) => void) {
		if (this.instance === null) {
			// @ts-expect-error - TS doesn't know that the instance is being set
			this.instance = pipeline(this.task, this.model, { progress_callback });
		}
		return this.instance;
	}
}

addEventListener('message', async (event) => {
	const classifier = await Pipeline.getInstance((x) => {
		postMessage(x);
	});

	postMessage({ status: 'analyzing' });

	const output = await classifier?.(event.data.imageSrc);

	const depthCanvas = output.depth.toCanvas() as OffscreenCanvas;
	const depth = await depthCanvas.convertToBlob();

	const reader = new FileReader();
	reader.onload = () => {
		postMessage({
			status: 'complete',
			output: reader.result
		});
	};
	reader.readAsDataURL(depth);
});
