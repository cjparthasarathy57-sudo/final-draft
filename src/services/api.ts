const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';

export class ApiService {
  static async processImage(plotData: PlotData): Promise<any> {
    const formData = new FormData();
    formData.append('file', plotData.image);
    formData.append('plot_width_m', plotData.plotWidth.toString());
    formData.append('plot_height_m', plotData.plotHeight.toString());
    
    if (plotData.scaleBarPx && plotData.scaleBarM) {
      formData.append('scale_bar_px', plotData.scaleBarPx.toString());
      formData.append('scale_bar_m', plotData.scaleBarM.toString());
    }

    const response = await fetch(`${API_BASE}/api/process`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process image');
    }

    return response.json();
  }

  static async generatePlan(processedData: any, requirements: any): Promise<any> {
    const response = await fetch(`${API_BASE}/api/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        processed_data: processedData,
        requirements: requirements,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate plan');
    }

    return response.json();
  }

  static async downloadFile(format: string, planData: any): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/download/${format}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    });

    if (!response.ok) {
      throw new Error(`Failed to download ${format} file`);
    }

    return response.blob();
  }

  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}