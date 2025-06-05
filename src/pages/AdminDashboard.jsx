import { useState, useCallback, useEffect } from 'react';
import { Button } from '../components/ui/button.tsx';
import Navigation from '../components/Navigation';
import { Plus, Trash2, Edit, Upload, RefreshCw, AlertTriangle, Play } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

const AdminDashboard = () => {
  const [contentItems, setContentItems] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionPosts, setCollectionPosts] = useState([]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const { login, user, logout } = useUser();

  // Add/Edit modal type: 'collection', 'post', or 'photo'
  const [modalType, setModalType] = useState('collection');

  const getFullUrl = (path) => {
    if (!path) return '';
    return `https://adultplatform.onrender.com${path}`;
  };

  const loadFFmpeg = useCallback(async () => {
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
      });
    } catch (error) {
      console.error('Error loading FFmpeg:', error);
      throw new Error('Failed to load video compression tools');
    }
  }, [ffmpeg]);

  useEffect(() => {
    // Check if user is admin
    fetch('https://adultplatform.onrender.com/checkauth', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.user?.isAdmin) {
          // If not admin, redirect to home page
          navigate('/');
          logout();
        } else {
          login(data.user);
        }
      })
      .catch(error => {
        console.error('Auth check error:', error);
        navigate('/');
        logout();
      });
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('https://adultplatform.onrender.com/collections');
        const data = await response.json();
        if (data.collection) {
          // Use backend-provided thumbnail_url directly
          setContentItems(data.collection);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
        setError('Failed to load collections');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

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

  const handleDelete = async (postId) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call backend API to delete the post
      // TODO: Replace with actual API call
      console.log('Simulating delete for post ID:', postId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      // Remove post from the collection
      setCollectionPosts(posts => posts.filter(post => post.id !== postId));
    } catch (err) {
      setError('Failed to delete post: ' + err.message);
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    if (selectedCollection) {
      setModalType('post');
      setNewContent({
        title: item.title,
        description: item.description,
        price: '',
        imageFile: null,
        videoFile: null,
        tier: selectedCollection?.tier || 'BASIC',
        type: item.videoUrl ? 'Video' : 'Image',
        isCoverPage: false
      });
      setPreviewImage(item.imageUrl);
      setPreviewVideo(item.videoUrl);
    } else {
      setModalType('collection');
      setNewContent({
        title: item.title,
        description: item.description,
        price: item.price,
        imageFile: null,
        videoFile: null,
        tier: item.tier,
        type: 'Video',
        isCoverPage: item.isCoverPage
      });
      setPreviewImage(item.imageUrl);
      setPreviewVideo(item.videoUrl);
    }
    setIsAddingNew(true);
  };

  const handleAddNewCollection = () => {
    setIsAddingNew(true);
    setIsEditing(false);
    setEditingId(null);
    setModalType('collection');
    setError(null);
    setUploadProgress({ image: 0, video: 0 });
    setCompressionProgress(0);
    setFailedUploads({ image: null, video: null });
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
  };

  const handleAddNewPost = () => {
    console.log('Opening Add New Post modal');
    setIsAddingNew(true);
    setIsEditing(false);
    setEditingId(null);
    setModalType('post');
    setError(null);
    setUploadProgress({ image: 0, video: 0 });
    setCompressionProgress(0);
    setFailedUploads({ image: null, video: null });
    setNewContent({
      title: '',
      description: '',
      price: '',
      imageFile: null,
      videoFile: null,
      tier: selectedCollection?.tier || 'BASIC',
      type: 'Video',
      isCoverPage: false
    });
    setPreviewImage(null);
    setPreviewVideo(null);
  };

  const handleAddNewPhoto = () => {
    console.log('Opening Add New Photo modal');
    setIsAddingNew(true);
    setIsEditing(false);
    setEditingId(null);
    setModalType('photo');
    setError(null);
    setUploadProgress({ image: 0, video: 0 });
    setCompressionProgress(0);
    setFailedUploads({ image: null, video: null });
    setNewContent({
      title: '',
      description: '',
      price: '',
      imageFile: null,
      videoFile: null,
      tier: selectedCollection?.tier || 'BASIC',
      type: 'Image',
      isCoverPage: false
    });
    setPreviewImage(null);
    setPreviewVideo(null);
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
          setPreviewVideo(reader.result); // Use compressed video for preview
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
          processedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }); // Add options here
          setNewContent(prev => ({ ...prev, imageFile: processedFile }));
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewImage(reader.result);
          };
          reader.readAsDataURL(processedFile);
        } else if (type === 'video') {
          if (file.size > 100 * 1024 * 1024) { // 100MB
            setError(`Video is too large (${originalSize}). Compressing...`);
            // Note: compressVideo already handles FFmpeg loading and compression logic
            processedFile = await compressVideo(file);
            setNewContent(prev => ({ ...prev, videoFile: processedFile }));
          } else {
            setNewContent(prev => ({ ...prev, videoFile: file }));
             // For videos under 100MB, still create a preview URL
            const reader = new FileReader();
             reader.onloadend = () => {
               setPreviewVideo(reader.result);
             };
             reader.readAsDataURL(file); // Read the original file for preview
          }
          
         
        }
        
        const compressedSize = formatFileSize(processedFile.size);
        if (type === 'video' && file.size > 100 * 1024 * 1024) {
          setError(`Video compressed from ${originalSize} to ${compressedSize}`);
        }
        
        // Clear previous upload/compression errors for this file type
        setFailedUploads(prev => ({ ...prev, [type]: null }));
        setError(null); // Clear general error
      } catch (err) {
        setError(`Error processing ${type} file: ${err.message}`);
        console.error('File processing error:', err);
        setFailedUploads(prev => ({ ...prev, [type]: file }));
        setNewContent(prev => ({ ...prev, [type + 'File']: null })); // Clear the file from state on error
        setPreviewImage(type === 'image' ? null : previewImage); // Clear preview if image failed
        setPreviewVideo(type === 'video' ? null : previewVideo); // Clear preview if video failed
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!newContent.title) {
        throw new Error('Title is required');
      }

      if (modalType === 'post' || modalType === 'photo') {
        if (!selectedCollection) {
          throw new Error('No collection selected');
        }
        if (!newContent.imageFile) {
          throw new Error('Thumbnail image is required');
        }
        if (modalType === 'post' && !newContent.videoFile) {
          throw new Error('Video file is required for posts');
        }
      }

      const formData = new FormData();
      
      if (modalType === 'post' || modalType === 'photo') {
        formData.append('collection_id', selectedCollection.id);
      }
      
      formData.append('title', newContent.title);
      formData.append('description', newContent.description || '');
      formData.append('type', modalType === 'photo' ? 'Image' : newContent.type);

      if (newContent.imageFile) {
        formData.append('image', newContent.imageFile);
      }

      if (newContent.videoFile && (modalType === 'post' || newContent.type === 'Video')) {
        formData.append('video', newContent.videoFile);
      }

      // Debug log
      console.log('Submitting form data:', {
        collection_id: selectedCollection?.id,
        title: newContent.title,
        description: newContent.description,
        type: modalType === 'photo' ? 'Image' : newContent.type,
        hasImage: !!newContent.imageFile,
        hasVideo: !!newContent.videoFile,
        modalType
      });

      // Call backend API to create/update post
      const response = await fetch('https://adultplatform.onrender.com/posts', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create post');
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create post');
      }

      // Create blob URLs for the new post
      const newPost = {
        ...data.post,
        thumbnail: data.post.thumbnail_data ? 
          URL.createObjectURL(new Blob([data.post.thumbnail_data], { type: 'image/jpeg' })) : null,
        video_url: data.post.video_data ? 
          URL.createObjectURL(new Blob([data.post.video_data], { type: 'video/mp4' })) : null
      };

      if (isEditing) {
        // Update existing post
        setCollectionPosts(posts => posts.map(post => 
          post.id === editingId ? newPost : post
        ));
      } else {
        // Add new post
        setCollectionPosts(posts => [...posts, newPost]);
      }

      // Reset form and modals
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

      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(`Failed to ${isEditing ? 'update' : 'add'} ${modalType}: ${err.message}`);
      setUploadProgress({ image: 0, video: 0 });
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

  const handleDeleteClick = (post) => {
    setDeleteConfirmation({
      show: true,
      itemId: post.id,
      itemTitle: post.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call backend API to delete the post
        const response = await fetch(`https://adultplatform.onrender.com/posts/${deleteConfirmation.itemId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete post');
        }

      // Remove post from the collection
      setCollectionPosts(posts => posts.filter(post => post.id !== deleteConfirmation.itemId));
      setDeleteConfirmation({ show: false, itemId: null, itemTitle: '' });
    } catch (err) {
      setError('Failed to delete post: ' + err.message);
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ show: false, itemId: null, itemTitle: '' });
  };

  const handlePostClick = async (collection) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch posts for the selected collection
      const response = await fetch(`https://adultplatform.onrender.com/collections/${collection.id}/posts`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch posts');
      }
      
      if (data.posts) {
        setSelectedCollection(data.collection);
        setCollectionPosts(data.posts);
      }
    } catch (err) {
      console.error('Error loading collection posts:', err);
      setError('Failed to load collection posts: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setCollectionPosts([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Header */}
      <header className="py-8 text-center">
        <h2 className="text-3xl md:text-3xl font-bold text-pink-400 mb-4">
          {selectedCollection ? `${selectedCollection.title} - Posts` : 'Admin Dashboard'}
        </h2>
        {selectedCollection ? (
          <Button 
            onClick={handleBackToCollections}
            className="bg-blue-600 hover:bg-blue-700 text-white mr-2"
            disabled={isLoading}
          >
            Back to Collections
          </Button>
        ) : null}
      </header>

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}

      {/* Collection Posts View */}
      {selectedCollection && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{selectedCollection.title} - Posts</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleAddNewPhoto}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
              <Button
                onClick={handleAddNewPost}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Post
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collectionPosts.map((post) => (
              <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="relative cursor-pointer group">
                  <img
                    src={getFullUrl(post.thumbnail_url)}
                    alt={post.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{post.description}</p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => handleDeleteClick(post)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {!selectedCollection && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-8 lg:px-16">
          {contentItems.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div 
                className="relative cursor-pointer group"
                onClick={() => handlePostClick(item)}
              >
                <div className="relative w-full h-48 flex items-center justify-center bg-red-500">
                  {(item.type === 'VIDEOS' || item.type === 'Video') && (
                    <Play className="w-12 h-12 text-white" />
                  )}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Content Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-2xl mx-auto my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {isEditing ? `Edit ${modalType === 'collection' ? 'Collection' : modalType === 'photo' ? 'Photo' : 'Post'}` : 
                 `Add New ${modalType === 'collection' ? 'Collection' : modalType === 'photo' ? 'Photo' : 'Post'}`}
              </h3>
              <Button
                type="button"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => {
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
                  setUploadProgress({ image: 0, video: 0 });
                  setFailedUploads({ image: null, video: null });
                  setError(null);
                }}
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
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
                {modalType === 'collection' && (
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
                )}
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
              {modalType === 'collection' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded mt-6">
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
                </div>
              )}
              {/* File Uploads - Show based on modalType */}
              {modalType === 'collection' && (
                <div className="border border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Collection Cover Image</label>
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
                            required={!isEditing}
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
                  {newContent.imageFile && uploadProgress.image > 0 && uploadProgress.image < 100 && (
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
              {modalType === 'post' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md hover:border-pink-500 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-400">
                          <label
                            htmlFor="post-image-upload"
                            className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-white hover:text-gray-300 focus-within:outline-none px-4 py-2"
                          >
                            <span>Upload an image</span>
                            <input
                              id="post-image-upload"
                              name="imageFile"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => handleFileChange(e, 'image')}
                              disabled={isLoading || isCompressing}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    {previewImage && (
                      <div className="mt-2">
                        <img src={previewImage} alt="Preview" className="h-32 w-full object-cover rounded" />
                      </div>
                    )}
                  </div>
                  <div className="border border-gray-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Video</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md hover:border-pink-500 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-400">
                          <label
                            htmlFor="post-video-upload"
                            className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-white hover:text-gray-300 focus-within:outline-none px-4 py-2"
                          >
                            <span>Upload a video</span>
                            <input
                              id="post-video-upload"
                              name="videoFile"
                              type="file"
                              accept="video/*"
                              className="sr-only"
                              onChange={(e) => handleFileChange(e, 'video')}
                              disabled={isLoading || isCompressing}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-400">MP4, WebM up to 100MB</p>
                      </div>
                    </div>
                    {previewVideo && (
                      <div className="mt-2">
                        <video src={previewVideo} controls className="w-full rounded" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {modalType === 'photo' && (
                <div className="border border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Photo</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md hover:border-pink-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label
                          htmlFor="photo-upload"
                          className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-white hover:text-gray-300 focus-within:outline-none px-4 py-2"
                        >
                          <span>Upload a photo</span>
                          <input
                            id="photo-upload"
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, 'image')}
                            required={!isEditing}
                            disabled={isLoading || isCompressing}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  {previewImage && (
                    <div className="mt-2">
                      <img src={previewImage} alt="Preview" className="h-64 w-full object-cover rounded" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
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
                    setUploadProgress({ image: 0, video: 0 });
                    setFailedUploads({ image: null, video: null });
                    setError(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading || isCompressing || 
                    (modalType === 'collection' && (!newContent.imageFile && !isEditing)) || 
                    (modalType === 'post' && (!newContent.imageFile && !newContent.videoFile && !isEditing)) ||
                    (modalType === 'photo' && (!newContent.imageFile && !isEditing))}
                >
                  {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : 
                   (isEditing ? `Update ${modalType === 'collection' ? 'Collection' : modalType === 'photo' ? 'Photo' : 'Post'}` : 
                    `Add ${modalType === 'collection' ? 'Collection' : modalType === 'photo' ? 'Photo' : 'Post'}`)}
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
    </div>
  );
};

export default AdminDashboard;