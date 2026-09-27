import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {

  private cloudName = 'dixadwm7v';
  private uploadPreset = 'quality-control';

  async uploadImage(file: File): Promise<string> {

    const url =
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();

    return data.secure_url;
  }
}