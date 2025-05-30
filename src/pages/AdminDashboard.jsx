import React, { useState, useCallback } from 'react';
import { Button } from '../components/ui/button';
import Navigation from '../components/Navigation';
import { Plus, Trash2, Edit, Upload, RefreshCw, AlertTriangle, Play } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [contentItems, setContentItems] = useState([
    {
      id: 1,
      title: "Sensual Encounters Collection",
      description: "Our entry-level collection featuring tasteful scenes and sensual content.",
      price: "$9.99/month",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face",
      videoUrl: "",
      tier: "BASIC",
      type: "Video"
    },
    // ... other items
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({
    image: 0,
    video: 0
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [ffmpeg] = useState(() => new FFmpeg());
  const [failedUploads, setFailedUploads] = useState({
    image: null,
    video: null
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    itemId: null,
    itemTitle: ''
  });
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    price: '',
    imageFile: null,
    videoFile: null,
    tier: 'BASIC',
    type: 'Video',
    isCoverPage: false
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  const navigate = useNavigate();

  const loadFFmpeg = useCallback(async () => {
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch (error) {
      console.error('Error loading FFmpeg:', error);
      throw new Error('Failed to load video compression tools');
    }
  }, [ffmpeg]);

  const compressVideo = async (file) => {
    try {
      setIsCompressing(true);
      setCompressionProgress(0);

      // Load FFmpeg if not already loaded
      if (!ffmpeg.loaded) {
        await loadFFmpeg();
      }

      // Write the input file to FFmpeg's virtual file system
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      // Set up progress monitoring
      ffmpeg.on('progress', ({ progress }) => {
        setCompressionProgress(Math.round(progress * 100));
      });

      // Compress the video
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-crf', '28', // Compression quality (lower = better quality, higher = smaller size)
        '-preset', 'medium', // Compression speed preset
        '-c:a', 'aac',
        '-b:a', '128k', // Audio bitrate
        '-vf', 'scale=1280:-2', // Scale video to 720p height, maintain aspect ratio
        'output.mp4'
      ]);

      // Read the compressed file
      const data = await ffmpeg.readFile('output.mp4');
      const compressedBlob = new Blob([data], { type: 'video/mp4' });

      // Check if the compressed file is still too large
      if (compressedBlob.size > 100 * 1024 * 1024) { // 100MB limit
        throw new Error('Video is still too large after compression. Please try a shorter video or lower quality.');
      }

      setIsCompressing(false);
      return compressedBlob;
    } catch (error) {
      console.error('Error compressing video:', error);
      setIsCompressing(false);
      throw error;
    }
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    
    try {
      setIsCompressing(true);
      const compressedFile = await imageCompression(file, options);
      setIsCompressing(false);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      setIsCompressing(false);
      return file; // Return original file if compression fails
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call backend API to delete the content
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete content from server');
      }

      // Only remove from state if backend deletion was successful
      setContentItems(items => items.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete content: ' + err.message);
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setNewContent({
      title: item.title,
      description: item.description,
      price: item.price,
      imageFile: null,
      videoFile: null,
      tier: item.tier,
      type: item.type,
      isCoverPage: item.isCoverPage
    });
    setPreviewImage(item.imageUrl);
    setPreviewVideo(item.videoUrl);
    setIsAddingNew(true);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setError(null);
    setUploadProgress({ image: 0, video: 0 });
    setCompressionProgress(0);
    setFailedUploads({ image: null, video: null });
  };

  const handleNewContentChange = (e) => {
    const { name, value } = e.target;
    setNewContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRetry = async (type) => {
    try {
      setError(null);
      const file = failedUploads[type];
      if (!file) return;

      if (type === 'image') {
        const compressedFile = await compressImage(file);
        setNewContent(prev => ({ ...prev, imageFile: compressedFile }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      } else if (type === 'video') {
        const compressedFile = await compressVideo(file);
        setNewContent(prev => ({ ...prev, videoFile: compressedFile }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewVideo(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      }

      setFailedUploads(prev => ({ ...prev, [type]: null }));
    } catch (err) {
      setError(`Failed to retry ${type} upload: ${err.message}`);
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        let processedFile = file;
        const originalSize = formatFileSize(file.size);
        
        if (type === 'image') {
          // Compress image before upload
          processedFile = await compressImage(file);
          setNewContent(prev => ({ ...prev, imageFile: processedFile }));
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewImage(reader.result);
          };
          reader.readAsDataURL(processedFile);
        } else if (type === 'video') {
          if (file.size > 100 * 1024 * 1024) { // 100MB
            setError(`Video is too large (${originalSize}). Compressing...`);
            processedFile = await compressVideo(file);
            setNewContent(prev => ({ ...prev, videoFile: processedFile }));
          } else {
            setNewContent(prev => ({ ...prev, videoFile: file }));
          }
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewVideo(reader.result);
          };
          reader.readAsDataURL(processedFile);
        }
        
        const compressedSize = formatFileSize(processedFile.size);
        if (type === 'video' && file.size > 100 * 1024 * 1024) {
          setError(`Video compressed from ${originalSize} to ${compressedSize}`);
        }
        
        setError(null);
      } catch (err) {
        setError(`Error processing ${type} file: ${err.message}`);
        console.error('File processing error:', err);
        setFailedUploads(prev => ({ ...prev, [type]: file }));
      }
    }
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress({ image: 0, video: 0 });

      // Validate that at least one media file is uploaded
      if (!newContent.imageFile && !newContent.videoFile) {
        throw new Error('Please upload either an image or a video');
      }

      // Create FormData object for multipart/form-data
      const formData = new FormData();
      formData.append('title', newContent.title);
      formData.append('description', newContent.description);
      formData.append('price', newContent.price);
      formData.append('tier', newContent.tier);
      formData.append('type', newContent.videoFile ? 'Video' : 'Image');
      formData.append('isCoverPage', newContent.isCoverPage);
      
      if (newContent.imageFile) {
        formData.append('image', newContent.imageFile);
      }
      if (newContent.videoFile) {
        formData.append('video', newContent.videoFile);
      }

      // Simulate API call with progress tracking
      const simulateApiCall = async () => {
        // Simulate file upload progress
        if (newContent.imageFile) {
          for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setUploadProgress(prev => ({ ...prev, image: i }));
          }
        }
        if (newContent.videoFile) {
          for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setUploadProgress(prev => ({ ...prev, video: i }));
          }
        }

        // Simulate API response
        return {
          id: Date.now(),
          title: newContent.title,
          description: newContent.description,
          price: newContent.price,
          tier: newContent.tier,
          type: newContent.videoFile ? 'Video' : 'Image',
          isCoverPage: newContent.isCoverPage,
          imageUrl: newContent.imageFile ? URL.createObjectURL(newContent.imageFile) : null,
          videoUrl: newContent.videoFile ? URL.createObjectURL(newContent.videoFile) : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      };

      let response;
      if (isEditing) {
        // Update existing content
        console.log('Updating content with ID:', editingId);
        // TODO: Replace with actual API call
        // response = await fetch(`/api/content/${editingId}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   },
        //   body: formData
        // });
        response = await simulateApiCall();
      } else {
        // Create new content
        console.log('Creating new content');
        // TODO: Replace with actual API call
        // response = await fetch('/api/content', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   },
        //   body: formData
        // });
        response = await simulateApiCall();
      }

      // TODO: Uncomment when backend is ready
      // if (!response.ok) {
      //   throw new Error(`Failed to ${isEditing ? 'update' : 'add'} content`);
      // }
      // const data = await response.json();

      // For now, use the simulated response
      const data = response;

      if (isEditing) {
        // Update existing item
        setContentItems(prev => prev.map(item => 
          item.id === editingId ? { ...item, ...data } : item
        ));
      } else {
        // Add new item
        setContentItems(prev => [...prev, data]);
      }

      // Reset form
      setIsAddingNew(false);
      setIsEditing(false);
      setEditingId(null);
      setNewContent({
        title: '',
        description: '',
        price: '',
        imageFile: null,
        videoFile: null,
        tier: 'BASIC',
        type: 'Video',
        isCoverPage: false
      });
      setPreviewImage(null);
      setPreviewVideo(null);
      setFailedUploads({ image: null, video: null });
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'add'} content: ${err.message}`);
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-blue-600';
      case 'MEDIUM':
        return 'bg-orange-600';
      case 'HARDCORE':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const handleDeleteClick = (item) => {
    setDeleteConfirmation({
      show: true,
      itemId: item.id,
      itemTitle: item.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call backend API to delete the content
      const response = await fetch(`/api/content/${deleteConfirmation.itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete content from server');
      }

      // Only remove from state if backend deletion was successful
      setContentItems(items => items.filter(item => item.id !== deleteConfirmation.itemId));
      setDeleteConfirmation({ show: false, itemId: null, itemTitle: '' });
    } catch (err) {
      setError('Failed to delete content: ' + err.message);
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ show: false, itemId: null, itemTitle: '' });
  };

  const handlePostClick = (item) => {
    navigate(`/post/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Header */}
      <header className="py-8 text-center">
        <h2 className="text-3xl md:text-3xl font-bold text-pink-400 mb-4">
          Admin Dashboard
        </h2>
        <Button 
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Content
        </Button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}

      {/* Add/Edit Content Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-2xl mx-auto my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {isEditing ? 'Edit Content' : 'Add New Content'}
              </h3>
              <Button
                type="button"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => {
                  setIsAddingNew(false);
                  setIsEditing(false);
                  setEditingId(null);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <form onSubmit={handleSubmitNew} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newContent.title}
                    onChange={handleNewContentChange}
                    className="w-full px-3 py-2 bg-gray-700 rounded text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                  <input
                    type="text"
                    name="price"
                    value={newContent.price}
                    onChange={handleNewContentChange}
                    className="w-full px-3 py-2 bg-gray-700 rounded text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newContent.description}
                  onChange={handleNewContentChange}
                  className="w-full px-3 py-2 bg-gray-700 rounded text-white focus:ring-2 focus:ring-pink-500 focus:outline-none min-h-[100px]"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Media Type</label>
                  <div className="flex gap-4 p-2 bg-gray-700 rounded">
                    <label className="flex items-center space-x-2 flex-1">
                      <input
                        type="radio"
                        name="mediaType"
                        value="image"
                        checked={!newContent.videoFile}
                        onChange={() => {
                          setNewContent(prev => ({ ...prev, videoFile: null }));
                          setPreviewVideo(null);
                        }}
                        className="form-radio text-pink-500"
                        disabled={isLoading}
                      />
                      <span className="text-sm">Image</span>
                    </label>
                    <label className="flex items-center space-x-2 flex-1">
                      <input
                        type="radio"
                        name="mediaType"
                        value="video"
                        checked={!!newContent.videoFile}
                        onChange={() => {
                          setNewContent(prev => ({ ...prev, imageFile: null }));
                          setPreviewImage(null);
                        }}
                        className="form-radio text-pink-500"
                        disabled={isLoading}
                      />
                      <span className="text-sm">Video</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tier</label>
                  <select
                    name="tier"
                    value={newContent.tier}
                    onChange={handleNewContentChange}
                    className="w-full px-3 py-2 bg-gray-700 rounded text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    required
                    disabled={isLoading}
                  >
                    <option value="BASIC">Basic</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARDCORE">Hardcore</option>
                  </select>
                </div>
              </div>
              {!newContent.videoFile && (
                <div className="border border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md hover:border-pink-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-white hover:text-gray-300 focus-within:outline-none px-4 py-2"
                        >
                          <span>Upload an image</span>
                          <input
                            id="image-upload"
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, 'image')}
                            required={!newContent.videoFile}
                            disabled={isLoading || isCompressing}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  {isCompressing && (
                    <div className="mt-2 text-sm text-gray-400">
                      Compressing image...
                    </div>
                  )}
                  {uploadProgress.image > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.image}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Uploading image: {Math.round(uploadProgress.image)}%
                      </p>
                    </div>
                  )}
                  {failedUploads.image && (
                    <div className="mt-2 flex items-center justify-between bg-red-900/50 p-2 rounded">
                      <span className="text-sm text-red-300">Upload failed</span>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleRetry('image')}
                        disabled={isLoading || isCompressing}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  )}
                  {previewImage && (
                    <div className="mt-2">
                      <img src={previewImage} alt="Preview" className="h-32 w-full object-cover rounded" />
                    </div>
                  )}
                </div>
              )}
              {!newContent.imageFile && (
                <div className="border border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video File</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md hover:border-pink-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label
                          htmlFor="video-upload"
                          className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-white hover:text-gray-300 focus-within:outline-none px-4 py-2"
                        >
                          <span>Upload a video</span>
                          <input
                            id="video-upload"
                            name="videoFile"
                            type="file"
                            accept="video/*"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, 'video')}
                            required={!newContent.imageFile}
                            disabled={isLoading || isCompressing}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400">MP4, WebM up to 100MB (larger files will be compressed)</p>
                    </div>
                  </div>
                  {isCompressing && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${compressionProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Compressing video: {compressionProgress}%
                      </p>
                    </div>
                  )}
                  {uploadProgress.video > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.video}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Uploading video: {Math.round(uploadProgress.video)}%
                      </p>
                    </div>
                  )}
                  {failedUploads.video && (
                    <div className="mt-2 flex items-center justify-between bg-red-900/50 p-2 rounded">
                      <span className="text-sm text-red-300">Upload failed</span>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleRetry('video')}
                        disabled={isLoading || isCompressing}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  )}
                  {previewVideo && (
                    <div className="mt-2">
                      <video src={previewVideo} controls className="w-full rounded" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
                <input
                  type="checkbox"
                  name="isCoverPage"
                  checked={newContent.isCoverPage}
                  onChange={(e) => setNewContent(prev => ({ ...prev, isCoverPage: e.target.checked }))}
                  className="form-checkbox text-pink-500"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-300">Set as Cover Page</span>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    setIsAddingNew(false);
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading || isCompressing}
                >
                  {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Content' : 'Add Content')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{deleteConfirmation.itemTitle}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-700"
                onClick={handleDeleteCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-8 lg:px-16">
        {contentItems.map((item) => (
          <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div 
              className="relative cursor-pointer group"
              onClick={() => handlePostClick(item)}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            <div className="p-4">
              <div className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${getTierColor(item.tier)} mb-2`}>
                {item.tier}
              </div>
              <h3 className="text-xl font-bold mb-2 cursor-pointer hover:text-pink-500 transition-colors" onClick={() => handlePostClick(item)}>
                {item.title}
              </h3>
              <p className="text-gray-400 mb-4 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-pink-500">{item.price}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item);
                    }}
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(item);
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard; 