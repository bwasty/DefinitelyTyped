import { XRFrame, XRDevice, XRSession, XRFrameOfReference, XRInputSourceEvent } from "webxr";

async function main() {
    const device: XRDevice = await navigator.xr.requestDevice();
    const session: XRSession = await device.requestSession({immersive: true});

    const canvasEl = document.createElement('canvas');
    const gl = canvasEl.getContext("webgl2")!;
    session.baseLayer = new XRWebGLLayer(session, gl);
    const frameOfRef: XRFrameOfReference = await session.requestFrameOfReference("eye-level", {disableStageEmulation: true});
    session.requestAnimationFrame((time, frame: XRFrame) => {
        const pose = frame.getDevicePose(frameOfRef);
        if (pose) {
            const inputSources = frame.session.getInputSources();
            const inputPoses = [];
            for (let i = 0; i < inputSources.length; ++i) {
                inputPoses[i] = frame.getInputPose(inputSources[i], frameOfRef);
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, session.baseLayer.framebuffer);
            for (const view of frame.views) {
                const vp = session.baseLayer.getViewport(view)!;
                gl.viewport(vp.x, vp.y, vp.width, vp.height);
            }
        }
    });

    session.onselect = (event: XRInputSourceEvent) => {
        console.log(event.inputSource);
    };

    session.addEventListener('end', () => {
        console.log("session ended");
    });
}

main();
