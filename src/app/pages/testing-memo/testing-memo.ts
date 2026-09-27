import { CloudinaryService } from './../../services/cloudinary';
import { Component, ElementRef, ViewChild,ChangeDetectorRef  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemoService } from '../../services/memo';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { EmailService } from '../../services/email.service';
import { getAuth } from 'firebase/auth';
interface MemoGroup {
  drumNo: string;
  workOrder: string;
  clientName: string;
  cableConstruction: string;
  length: string;
  problemDescription: string;
}
interface SelectedImage {
  file: File;
  previewUrl: string;
}
@Component({
  selector: 'app-testing-memo',
  imports: [FormsModule],
  templateUrl: './testing-memo.html',
  styleUrl: './testing-memo.sass',
})
export class TestingMemo {
  @ViewChild('cameraVideo')
  cameraVideo!: ElementRef<HTMLVideoElement>;

  personInCharge = '';

  groups: MemoGroup[] = [
    this.createEmptyGroup()
  ];

  selectedImages: SelectedImage[] = [];

  cameraStream: MediaStream | null = null;

  cameraOpen = false;
submitting = false;
successMessage = '';

constructor(
  private cloudinaryService: CloudinaryService,
  private memoService: MemoService,
  private notificationService: NotificationService,
  private router: Router,
  private cdr: ChangeDetectorRef,
  private emailService: EmailService
) {}

  createEmptyGroup(): MemoGroup {
    return {
      drumNo: '',
      workOrder: '',
      clientName: '',
      cableConstruction: '',
      length: '',
      problemDescription: '',
    };
  }


  addGroup() {
    this.groups.push(this.createEmptyGroup());
  }


  deleteGroup(index: number) {

    if (this.groups.length === 1) {
      return;
    }

    this.groups.splice(index, 1);
  }


  onImagesSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    const files = Array.from(input.files);

    for (const file of files) {

      if (!file.type.startsWith('image/')) {
        continue;
      }

      const previewUrl = URL.createObjectURL(file);

      this.selectedImages.push({
        file,
        previewUrl,
      });

    }

    input.value = '';
  }

async submitMemo() {

  if (this.submitting) {
    return;
  }

  this.submitting = true;
  this.successMessage = '';

  this.cdr.detectChanges();

  try {

    const imageUrls: string[] = [];

    for (const image of this.selectedImages) {

      const imageUrl =
        await this.cloudinaryService.uploadImage(image.file);

      imageUrls.push(imageUrl);

    }


    const memoData = {

      groups: this.groups,

      personInCharge: this.personInCharge,

      images: imageUrls,

    };
// await this.memoService.createMemo(memoData);

const memoRef = await this.memoService.createMemo(
  memoData
);
const currentUser = getAuth().currentUser;

if (!currentUser) {
  throw new Error('User is not authenticated');
}

await this.notificationService.createNotificationForAllUsers(
  'New Testing Memo',
  'You have a new testing memo waiting for your reply',
  'testing-memo',
  memoRef.id,
  currentUser.uid
);

    this.successMessage =
      'Memo submitted successfully!';

    this.cdr.detectChanges();


    setTimeout(() => {

      this.router.navigate(['/dashboard']);

    }, 1500);


  } catch (error) {

    console.error(
      'Error creating memo:',
      error
    );

    this.submitting = false;

    this.cdr.detectChanges();

  }

}
  removeImage(index: number) {

    const image = this.selectedImages[index];

    URL.revokeObjectURL(image.previewUrl);

    this.selectedImages.splice(index, 1);
  }


  async openCamera() {

    try {

      this.cameraStream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: 'environment',
            },
          },
          audio: false,
        });

      this.cameraOpen = true;

      setTimeout(() => {

        if (this.cameraVideo) {

          this.cameraVideo.nativeElement.srcObject =
            this.cameraStream;

        }

      });

    } catch (error) {

      console.error('Camera error:', error);

      alert(
        'Unable to access the camera. Please allow camera permission.'
      );

    }

  }


  takePhoto() {

    if (!this.cameraVideo || !this.cameraStream) {
      return;
    }

    const video = this.cameraVideo.nativeElement;

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {

      if (!blob) {
        return;
      }

      const file = new File(
        [blob],
        `drum-photo-${Date.now()}.jpg`,
        {
          type: 'image/jpeg',
        }
      );

      const previewUrl = URL.createObjectURL(file);

      this.selectedImages.push({
        file,
        previewUrl,
      });

      this.closeCamera();

    }, 'image/jpeg', 0.9);

  }


  closeCamera() {

    if (this.cameraStream) {

      this.cameraStream
        .getTracks()
        .forEach((track) => track.stop());

      this.cameraStream = null;

    }

    this.cameraOpen = false;

  }
isMemoValid(): boolean {
  if (!this.personInCharge.trim()) {
    return false;
  }

  for (const group of this.groups) {
    if (
      !group.drumNo.trim() ||
      !group.workOrder.trim() ||
      !group.clientName.trim() ||
      !group.cableConstruction.trim() ||
      !group.length.trim() ||
      !group.problemDescription.trim()
    ) {
      return false;
    }
  }

  return true;
}
}
