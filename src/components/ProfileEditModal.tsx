import React, { useState, useRef } from 'react';
import { Camera, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import { updateUserProfile, updateProfilePhoto } from '../lib/preferences';
import { IOSModal, IOSActionSheet } from './ui/ios-modal';
import { takePhoto, pickFromGallery, isNativePlatform } from '../lib/camera';
import { hapticMedium, hapticSuccess, hapticError } from '../lib/haptics';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentName: string;
  currentEmail: string;
  currentPhotoUrl?: string;
  currentInitials: string;
  onProfileUpdated: () => void;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  userId,
  currentName,
  currentEmail,
  currentPhotoUrl,
  currentInitials,
  onProfileUpdated,
}: ProfileEditModalProps) {
  const [name, setName] = useState(currentName);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNative = isNativePlatform();

  // Handle photo from camera (native)
  const handleTakePhoto = async () => {
    hapticMedium();
    setIsUploading(true);
    try {
      const base64 = await takePhoto('camera');
      if (base64) {
        // Convert base64 to blob for upload
        const response = await fetch(`data:image/jpeg;base64,${base64}`);
        const blob = await response.blob();
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        
        const url = await updateProfilePhoto(userId, file);
        setPhotoUrl(url);
        hapticSuccess();
        toast.success('Photo uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      hapticError();
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle photo from gallery (native)
  const handleChooseFromLibrary = async () => {
    hapticMedium();
    setIsUploading(true);
    try {
      const base64 = await pickFromGallery();
      if (base64) {
        // Convert base64 to blob for upload
        const response = await fetch(`data:image/jpeg;base64,${base64}`);
        const blob = await response.blob();
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        
        const url = await updateProfilePhoto(userId, file);
        setPhotoUrl(url);
        hapticSuccess();
        toast.success('Photo uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      hapticError();
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle web file input
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await updateProfilePhoto(userId, file);
      setPhotoUrl(url);
      hapticSuccess();
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      hapticError();
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoButtonClick = () => {
    hapticMedium();
    if (isNative) {
      setShowPhotoOptions(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        display_name: name.trim(),
      });

      toast.success('Profile updated successfully');
      onProfileUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IOSModal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="px-4 py-4">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <Avatar className="w-28 h-28 ring-4 ring-primary/20">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={name} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {currentInitials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handlePhotoButtonClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-full shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
            </button>
            {/* Web fallback file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          {isUploading && (
            <p className="text-sm text-muted-foreground mt-3">Uploading...</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>
        </div>

        {/* iOS Action Sheet for photo options */}
        <IOSActionSheet
          isOpen={showPhotoOptions}
          onClose={() => setShowPhotoOptions(false)}
          title="Change Profile Photo"
          actions={[
            {
              label: 'Take Photo',
              onClick: handleTakePhoto,
            },
            {
              label: 'Choose from Library',
              onClick: handleChooseFromLibrary,
            },
          ]}
        />

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Email
            </label>
            <Input
              value={currentEmail}
              disabled
              className="w-full bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={isSaving || isUploading}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </IOSModal>
  );
}
