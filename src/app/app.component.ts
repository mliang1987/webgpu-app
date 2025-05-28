import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  canvas: HTMLCanvasElement | null = null;
  adapter: GPUAdapter | null = null;
  device: GPUDevice | null = null;
  context: GPUCanvasContext | null = null;
  canvasFormat: GPUTextureFormat | null = null;
  encoder: GPUCommandEncoder | null = null;

  ngAfterViewInit() {}

  public ngOnInit() {
    let gpu = navigator.gpu;
    this.canvas = document.querySelector('canvas');
    if (this.canvas === null) {
      console.error('Canvas element not found.');
    } else {
      console.log('Canvas element found:', this.canvas);
    }
    if (!gpu) {
      console.error('WebGPU is not supported. Please ensure you are using a compatible browser.');
      return;
    } else {
      console.log('WebGPU is supported.');
    }
    this.initAdapter()
      .then(() => {
        if (this.adapter) {
          console.log('GPU Adapter initialized:', this.adapter);
          this.initDevice()
            .then(() => {
              if (this.device) {
                console.log('GPU Device initialized:', this.device);
                this.context = this.canvas?.getContext('webgpu') as GPUCanvasContext;
                console.log('GPU Canvas Context:', this.context);
                this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
                console.log('Canvas format:', this.canvasFormat);
                this.context.configure({
                  device: this.device,
                  format: this.canvasFormat
                });
                this.encoder = this.device.createCommandEncoder();
                const pass = this.encoder.beginRenderPass({
                  colorAttachments: [
                    {
                      view: this.context.getCurrentTexture().createView(),
                      loadOp: 'clear',
                      clearValue: [1, 0, 1, 1],
                      storeOp: 'store'
                    }
                  ]
                });
                pass.end();
                const commandBuffer = this.encoder.finish();
                this.device.queue.submit([commandBuffer]);
                this.device.queue.submit([this.encoder.finish()]);
              } else {
                console.error('Failed to initialize GPU Device.');
              }
            })
            .catch((error) => {
              console.error('Error initializing GPU Device:', error);
            });
        } else {
          console.error('Failed to initialize GPU Adapter.');
        }
      })
      .catch((error) => {
        console.error('Error initializing GPU Adapter:', error);
      });
  }

  async initAdapter(): Promise<void> {
    this.adapter = await navigator.gpu.requestAdapter();
  }

  async initDevice(): Promise<void> {
    if (!this.adapter) {
      console.error('GPU Adapter is not initialized.');
      return;
    }
    this.device = await this.adapter.requestDevice();
  }
}
